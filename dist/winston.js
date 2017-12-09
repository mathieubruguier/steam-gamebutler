"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var winston_1 = require("winston");
var fs = require('fs');
var env = process.env.NODE_ENV || 'development';
var logDir = 'logs';
// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}
var tsFormat = function () { return (new Date()).toLocaleTimeString(); };
var Winston = /** @class */ (function () {
    function Winston() {
    }
    Winston.logger = new (winston_1.Logger)({
        transports: [
            // colorize the output to the console
            new (winston_1.transports.Console)({
                timestamp: tsFormat,
                colorize: true,
            })
        ]
    });
    Winston.chatLog = new (winston_1.Logger)({
        transports: [
            // colorize the output to the console
            new (winston_1.transports.Console)({
                timestamp: tsFormat,
                colorize: true,
            }),
            new (winston_1.transports.File)({
                filename: logDir + "/chatlog.log",
                timestamp: tsFormat,
                level: env === 'development' ? 'debug' : 'info'
            })
        ]
    });
    return Winston;
}());
exports.Winston = Winston;
//# sourceMappingURL=winston.js.map