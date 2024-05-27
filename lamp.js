import { Device }  from './io7device.js';

const cursorUp = '\x1B[A'; // Move cursor up one line
const cursorDown = '\x1B[B'; // Move cursor down one line
const cursorRight = '\x1B[C'; // Move cursor right one column
const cursorLeft = '\x1B[D'; // Move cursor left one column
const clearScreen = '\x1B[2J';
const clearCursor = '\x1B[0;0H\x1B[2J';

let lamp = 'off';

function offLamp() {
    console.log(clearCursor);
    console.log("\x1B[7m                               ");
    console.log("\x1B[7m                               ");       
    console.log("\x1B[7m                               ");
    console.log("\x1B[7m           ..-^-..             ");
    console.log("\x1B[7m          .   T   .            ");
    console.log("\x1B[7m         .    |    .           ");
    console.log("\x1B[7m          .   |   .            ");
    console.log("\x1B[7m           ..___..             ");
    console.log("\x1B[7m            {_.=}              ");
    console.log("\x1B[7m            {_.=}              ");
    console.log("\x1B[7m             -_-               ");        
    console.log("\x1B[7m                               ");
    console.log("\x1B[7m                               ");
    lamp = 'off';
}

function onLamp() {
    console.log(clearCursor);
    console.log("\x1B[7m                               ");
    console.log("\x1B[7m              |                ");
    console.log("\x1B[7m          \\   |   /            ");
    console.log("\x1B[7m            ◼︎◼︎◼︎◼︎◼︎              ");
    console.log("\x1B[7m          ◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎            ");
    console.log("\x1B[7m      -= ◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎ =-        ");
    console.log("\x1B[7m          ◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎◼︎            ");
    console.log("\x1B[7m         / ◼︎◼︎◼︎◼︎◼︎◼︎◼︎ \\           ");
    console.log("\x1B[7m            {_.=}              ");
    console.log("\x1B[7m            {_.=}              ");
    console.log("\x1B[7m             -_-               ");
    console.log("\x1B[7m                               ");
    console.log("\x1B[7m                               ");
    lamp = 'on';
}

export function runLamp() {
    let d = new Device();
    
    d.setUserCommand((topic, msg) => {
        console.log('command', JSON.parse(msg));
        let cmd = JSON.parse(msg);
        if (cmd.d.hasOwnProperty('lamp')) {
            if (cmd.d.lamp === 'on') {
                onLamp();
            } else {
                offLamp();
            }
            d.publishEvent('status', JSON.stringify({"d":{"lamp":lamp}}));
            console.log(`\x1B[0m      {"d":{"lamp":"${lamp}"}`, cursorUp);
        }
    });
    
    d.connect();
    
    offLamp();
    
    function loop() {
        d.publishEvent('status', JSON.stringify({"d":{"lamp":lamp}}));
        console.log(`\x1B[0m      {"d":{"lamp":"${lamp}"}`, cursorUp);
        setTimeout(loop, d.meta.pubInterval);
    };
    
    loop();
}
