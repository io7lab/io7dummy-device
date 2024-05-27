import { Device }  from './io7device.js';

const cursorUp = '\x1B[A'; // Move cursor up one line
const cursorDown = '\x1B[B'; // Move cursor down one line
const cursorRight = '\x1B[C'; // Move cursor right one column
const cursorLeft = '\x1B[D'; // Move cursor left one column
const clearScreen = '\x1B[2J';
const clearCursor = '\x1B[0;0H\x1B[2J';

let sw = 'off';

function offSwitch() {
    console.log(clearCursor);
    console.log("     ");
    console.log("      _________    ");
    console.log("     |         |    ");
    console.log("     |   \x1B[1mON\x1B[0m    |    ");
    console.log("     |    _    |    ");
    console.log("     |   |_|   |    ");
    console.log("     |   |◼|   |    ");
    console.log("     |         |    ");
    console.log("     |   \x1B[1mOFF\x1B[0m   |      ");
    console.log("     |_________|    ");
    console.log("     ");
    console.log("     ");
    console.log(" press 1 to turn on");
    console.log("     ");
    sw = 'off';
}

function onSwitch() {
    console.log(clearCursor);
    console.log("    ");
    console.log("      _________    ");
    console.log("     |         |    ");
    console.log("     |   \x1B[1mON\x1B[0m    |    ");
    console.log("     |    _    |    ");
    console.log("     |   |\x1B[31m◼\x1B[30m|   |    ");
    console.log("     |   |_|   |    ");
    console.log("     |         |    ");
    console.log("     |   \x1B[1mOFF\x1B[0m   |      ");
    console.log("     |_________|    ");
    console.log("    ");
    console.log("    ");
    console.log(" press 0 to turn off");
    console.log("    ");
    sw = 'on';
}

export function runSwitch() {
    let stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    stdin.on('data', function(key){
        if (key === '\u0003') {
            process.exit();
        }
        if (key === '1') {
            onSwitch();
            d.publishEvent('status', JSON.stringify({"d":{"switch":sw}}));
            console.log(`{"d":{"switch":"${sw}"}`, cursorUp);
        }
        if (key === '0') {
            offSwitch();
            d.publishEvent('status', JSON.stringify({"d":{"switch":sw}}));
            console.log(`{"d":{"switch":"${sw}"}`, cursorUp);
        }
    });

    let d = new Device();
    
    d.connect();
    
    offSwitch();
    
    function loop() {
        d.publishEvent('status', JSON.stringify({"d":{"switch":sw}}));
        console.log(`{"d":{"switch":"${sw}"}`, cursorUp);
        setTimeout(loop, d.meta.pubInterval);
    };
    
    loop();
}
