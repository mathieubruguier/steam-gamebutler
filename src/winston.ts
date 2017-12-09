import { Logger, LoggerInstance, transports } from 'winston';
const fs = require('fs');
const env = process.env.NODE_ENV || 'development';
const logDir = 'logs';

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const tsFormat = () => (new Date()).toLocaleTimeString();

export class Winston {
    public static logger = new (Logger)({
        transports: [
            // colorize the output to the console
            new (transports.Console)({
                timestamp: tsFormat,
                colorize: true,
            })
        ]
    });

    public static chatLog = new (Logger)({
        transports: [
            // colorize the output to the console
            new (transports.Console)({
                timestamp: tsFormat,
                colorize: true,
            }),
            new (transports.File)({
                filename: `${logDir}/chatlog.log`,
                timestamp: tsFormat,
                level: env === 'development' ? 'debug' : 'info'
            })
        ]
    });
}
