import { Device, clearCursor }  from './io7device.js';

const cursorUp = '\x1B[A'; // Move cursor up one line
const cursorDown = '\x1B[B'; // Move cursor down one line
const cursorRight = '\x1B[C'; // Move cursor right one column
const cursorLeft = '\x1B[D'; // Move cursor left one column
const clearScreen = '\x1B[2J';

let lamp = 'off';

function offLamp() {
    clearCursor();
    console.log("\x1B[0m                               ");
    console.log("\x1B[0m                               ");       
    console.log("\x1B[0m                               ");
    console.log("\x1B[0m           ..-^-..             ");
    console.log("\x1B[0m          .   T   .            ");
    console.log("\x1B[0m         .    |    .           ");
    console.log("\x1B[0m          .   |   .            ");
    console.log("\x1B[0m           ..___..             ");
    console.log("\x1B[0m            {_.=}              ");
    console.log("\x1B[0m            {_.=}              ");
    console.log("\x1B[0m             -_-               ");        
    console.log("\x1B[0m                               ");
    console.log("\x1B[0m                               ");
    lamp = 'off';
}

function onLamp() {
    clearCursor();
    console.log("\x1B[0m                               ");
    console.log("\x1B[0m              |                ");
    console.log("\x1B[0m          \\   |   /            ");
    console.log("\x1B[0m            █████              ");
    console.log("\x1B[0m          █████████            ");
    console.log("\x1B[0m      -= ███████████ =-        ");
    console.log("\x1B[0m          █████████            ");
    console.log("\x1B[0m         / ███████ \\           ");
    console.log("\x1B[0m            {_.=}              ");
    console.log("\x1B[0m            {_.=}              ");
    console.log("\x1B[0m             -_-               ");
    console.log("\x1B[0m                               ");
    console.log("\x1B[0m                               ");
    lamp = 'on';
}

export function init(device) {
    let stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    stdin.on('data', function(key){
        if (key === '\u0003' || key === '\u001b') {
            process.exit(); 
        }
    });
    device.setUserCommand((topic, msg) => {
        console.log('command', JSON.parse(msg));
        let cmd = JSON.parse(msg);
        if (cmd.hasOwnProperty('d') && cmd.d.hasOwnProperty('lamp')) {
            if (cmd.d.lamp === 'toggle') {
                if (lamp === 'on') {
                    offLamp();
                } else {
                    onLamp();
                }
            } else if (cmd.d.lamp === 'on') {
                onLamp();
            } else {
                offLamp();
            }
            device.publishEvent('status', JSON.stringify({"d":{"lamp":lamp}}));
            console.log(`\x1B[0m      {"d":{"lamp":"${lamp}"}`, cursorUp);
        }
    });
    
    device.loop = () => {
        device.publishEvent('status', JSON.stringify({"d":{"lamp":lamp}}));
        console.log(`\x1B[0m      {"d":{"lamp":"${lamp}"}`, cursorUp);
    };

    offLamp();
    
    device.connect();
    device.run();
}
