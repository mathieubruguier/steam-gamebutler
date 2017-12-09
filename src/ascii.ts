import { Winston } from './winston';
var figlet = require('figlet');


export function printApplicationTitle(): void {
    console.log(figlet.textSync('- Gabi the Game Butler -', {
        font: 'Small',
        horizontalLayout: 'default',
        verticalLayout: 'default'
    }));
}