"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var winston_1 = require("./winston");
var figlet = require('figlet');
function printApplicationTitle() {
    figlet('Gaby the Game Butler', {
        font: 'Small',
        horizontalLayout: 'default',
        verticalLayout: 'default'
    }, function (err, data) {
        if (err) {
            winston_1.Winston.logger.error('Error printing ASCII title');
            winston_1.Winston.logger.error(err);
            return;
        }
        console.log(data);
    });
}
exports.printApplicationTitle = printApplicationTitle;
//# sourceMappingURL=ascii.js.map