import { Device, clearCursor }  from './io7device.js';

const cursorUp = '\x1B[A'; // Move cursor up one line
const cursorDown = '\x1B[B'; // Move cursor down one line
const cursorRight = '\x1B[C'; // Move cursor right one column
const cursorLeft = '\x1B[D'; // Move cursor left one column
const clearScreen = '\x1B[2J';

let button1 = 'released';
let button2 = 'released';

function buttonReleased() {
    clearCursor();
    console.log("Press '1' to push button1");
    console.log("    or 2' to push button2");
    console.log("    ");
    console.log("     ╔═════════╗    ");
    console.log("     ║         ║    ");
    console.log("     ║   |T|   ║    ");
    console.log("     ║  -o o-  ║    ");
    console.log("     ║         ║    ");
    console.log("     ║         ║    ");
    console.log("     ║   |T|   ║    ");
    console.log("     ║  -o o-  ║    ");
    console.log("     ║         ║    ");
    console.log("     ╚═════════╝    ");
    console.log("     ");
    console.log("     ");
    console.log("     ");
    button1 = 'unpushed';
    button2 = 'unpushed';
}

function button1Pressed() {
    clearCursor();
    console.log("Press '1' to push button1");
    console.log("    or 2' to push button2");
    console.log("    ");
    console.log("     ╔═════════╗    ");
    console.log("     ║         ║    ");
    console.log("     ║         ║    ");
    console.log("     ║  \x1B[31m-oTo-\x1B[0m  ║    ");
    console.log("     ║         ║    ");
    console.log("     ║         ║    ");
    console.log("     ║   |T|   ║    ");
    console.log("     ║  -o o-  ║    ");
    console.log("     ║         ║    ");
    console.log("     ╚═════════╝    ");
    console.log("    ");
    console.log("    ");
    console.log("    ");
    button1 = 'pushed';
    button2 = 'unpushed';
}

function button2Pressed() {
    clearCursor();
    console.log("Press '1' to push button1");
    console.log("    or 2' to push button2");
    console.log("    ");
    console.log("     ╔═════════╗    ");
    console.log("     ║         ║    ");
    console.log("     ║   |T|   ║    ");
    console.log("     ║  -o o-  ║    ");
    console.log("     ║         ║    ");
    console.log("     ║         ║    ");
    console.log("     ║         ║    ");
    console.log("     ║  \x1B[31m-oTo-\x1B[0m  ║    ");
    console.log("     ║         ║    ");
    console.log("     ╚═════════╝    ");
    console.log("    ");
    console.log("    ");
    console.log("    ");
    button1 = 'unpushed';
    button2 = 'pushed';
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
            button1Pressed();
            device.publishChange();
            console.log(`{"d":{"button1":"${button1}", "button2":"${button2}"}`, cursorUp);
            setTimeout(()=> {
                buttonReleased();
                console.log(`{"d":{"button1":"${button1}", "button2":"${button2}"}`, cursorUp);
            }, 300);
        } else if (key === '2') {
            button2Pressed();
            device.publishChange();
            console.log(`{"d":{"button1":"${button1}", "button2":"${button2}"}`, cursorUp);
            setTimeout(()=> {
                buttonReleased();
                console.log(`{"d":{"button1":"${button1}", "button2":"${button2}"}`, cursorUp);
            }, 300);
        }
    });
    
    device.loop = () => {
        device.publishEvent('status', JSON.stringify({"d":{"button1":button1, "button2":button2}}));
    };
    
    buttonReleased();
    console.log(`{"d":{"button1":"${button1}", "button2":"${button2}"}`, cursorUp);

    device.connect();
    device.run();
}
