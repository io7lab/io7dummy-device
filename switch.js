import { Device, clearCursor }  from './io7device.js';

const cursorUp = '\x1B[A'; // Move cursor up one line
const cursorDown = '\x1B[B'; // Move cursor down one line
const cursorRight = '\x1B[C'; // Move cursor right one column
const cursorLeft = '\x1B[D'; // Move cursor left one column
const clearScreen = '\x1B[2J';

let sw = 'off';

function offSwitch() {
    clearCursor();
    console.log("Press 1 to Turn Off");
    console.log("     ");
    console.log("     ╔═════════╗    ");
    console.log("     ║         ║    ");
    console.log("     ║   \x1B[1mON\x1B[0m    ║    ");
    console.log("     ║    _    ║    ");
    console.log("     ║   ║_║   ║    ");
    console.log("     ║   ║█║   ║    ");
    console.log("     ║         ║    ");
    console.log("     ║   \x1B[1mOFF\x1B[0m   ║      ");
    console.log("     ╚═════════╝    ");
    console.log("     ");
    console.log("     ");
    console.log("     ");
    sw = 'off';
}

function onSwitch() {
    clearCursor();
    console.log("Press 0 to Turn Off");
    console.log("    ");
    console.log("     ╔═════════╗    ");
    console.log("     ║         ║    ");
    console.log("     ║   \x1B[1mON\x1B[0m    ║    ");
    console.log("     ║    _    ║    ");
    console.log("     ║   ║\x1B[31m█\x1B[0m║   ║    ");
    console.log("     ║   ║_║   ║    ");
    console.log("     ║         ║    ");
    console.log("     ║   \x1B[1mOFF\x1B[0m   ║      ");
    console.log("     ╚═════════╝    ");
    console.log("    ");
    console.log("    ");
    console.log("    ");
    sw = 'on';
}

export function init(device) {
    let stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    stdin.on('data', function(key){
        if (key === '\u0003' || key === '\u001b') {
            process.exit();
        } else if (key === '1') {
            onSwitch();
            device.publishChange();
        } else if (key === '0') {
            offSwitch();
            device.publishChange();
        }
    });

    device.setUserCommand((topic, msg) => {
        console.log('command', JSON.parse(msg));
        let cmd = JSON.parse(msg);
        if (cmd.hasOwnProperty('d') && cmd.d.hasOwnProperty('switch')) {
            if (cmd.d.switch === 'on') {
                onSwitch();
                device.publishChange();
            } else {
                offSwitch();
                device.publishChange();
            }
        }
    });
    
    device.loop = () => {
        device.publishEvent('status', JSON.stringify({"d":{"switch":sw}}));
        console.log(`{"d":{"switch":"${sw}"}`, cursorUp);
    };
    
    offSwitch();

    device.connect();
    device.run();
}
