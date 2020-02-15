import winston from 'winston';
import fs      from 'fs';

exports.initLogger = async () => {
    const NODE_ENV = process.env.NODE_ENV;

    if (NODE_ENV === 'production') {
        // Log to console in production because Heroku will add STDOUT to the log stream
        await setConsoleLogger();

    } else if (NODE_ENV === 'development' || NODE_ENV === 'test') {
        try {
            // Attempt to create a /logs directory
            await fs.mkdirSync('./logs');

        } catch (err) {
            // If the /logs directory already exists, continue
            // Otherwise, return a console logger
            if (err.code !== 'EEXIST') {
                console.log(`An error has occurred that cannot be fixed (code: ${err.code})!`);
                console.log(`Switching to console logging...`);
                await setConsoleLogger();
            }
        }

        const filename = NODE_ENV === 'test' ? 'ics-bot.test.log' : 'ics-bot.log';

        // As long as a /logs directory exists, return a file logger
        await setFileLogger('logs', `${filename}`);

    } else {
        console.log(`Cannot determine current Node environment! You may need to set a "process.env.NODE_ENV" environment variable or create a .env file.`);
        console.log(`Switching to console logging...`);
        await setConsoleLogger();
    }
};

const setConsoleLogger = async () => {
    // noinspection JSCheckFunctionSignatures
    winston.configure({
        transports: [
            new winston.transports.Console({
                name: 'console',
                colorize: true,
                timestamp: function () {
                    return new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });
                }
            }),
        ]
    });
};

const setFileLogger = async (directoryName, filename) => {
    winston.configure({
        transports: [
            new winston.transports.File({
                name: 'file',
                filename: `./${directoryName}/${filename}`,
                timestamp: function () {
                    return new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });
                }
            })
        ]
    });
};
