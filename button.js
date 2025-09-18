import { Device, clearCursor }  from './io7device.js';

const cursorUp = '\x1B[A'; // Move cursor up one line
const cursorDown = '\x1B[B'; // Move cursor down one line
const cursorRight = '\x1B[C'; // Move cursor right one column
const cursorLeft = '\x1B[D'; // Move cursor left one column
const clearScreen = '\x1B[2J';

let button = 'released';

function buttonReleased() {
    clearCursor();
    console.log("Press space bar to push button");
    console.log("     ");
    console.log("     ╔═════════╗    ");
    console.log("     ║         ║    ");
    console.log("     ║         ║    ");
    console.log("     ║         ║    ");
    console.log("     ║   |T|   ║    ");
    console.log("     ║  -o o-  ║    ");
    console.log("     ║         ║    ");
    console.log("     ║         ║    ");
    console.log("     ║         ║    ");
    console.log("     ╚═════════╝    ");
    console.log("     ");
    console.log("     ");
    console.log("     ");
    button = 'unpushed';
}

function buttonPressed() {
    clearCursor();
    console.log("Press space bar to push button");
    console.log("    ");
    console.log("     ╔═════════╗    ");
    console.log("     ║         ║    ");
    console.log("     ║         ║    ");
    console.log("     ║         ║    ");
    console.log("     ║         ║    ");
    console.log("     ║  \x1B[31m-oTo-\x1B[0m  ║    ");
    console.log("     ║         ║    ");
    console.log("     ║         ║    ");
    console.log("     ║         ║    ");
    console.log("     ╚═════════╝    ");
    console.log("    ");
    console.log("    ");
    console.log("    ");
    button = 'pushed';
}

export function init(device) {
    let stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    stdin.on('data', function(key){
        if (key === '\u0003' || key === '\u001b') {
            process.exit();
        } else if (key === ' ') {
            buttonPressed();
            device.publishChange();
            console.log(`{"d":{"button":"${button}"}`, cursorUp);
            setTimeout(()=> {
                buttonReleased();
                console.log(`{"d":{"button":"${button}"}`, cursorUp);
            }, 300);
        }
    });
    
    device.loop = () => {
        device.publishEvent('status', JSON.stringify({"d":{"button":button}}));
    };
    
    buttonReleased();
    console.log(`{"d":{"button":"${button}"}`, cursorUp);

    device.connect();
    device.run();
}
