import { Device, clearCursor } from './io7device.js';

const cursorUp = '\x1B[A'; // Move cursor up one line

// --- ASCII Art for DARK condition ---
function drawDark() {
    clearCursor();
    console.log("\x1B[0m");
    console.log("Up Arrow to simulate Brightness");
    console.log("\x1B[0m        \x1B[7m                        ");
    console.log("\x1B[0m        \x1B[7m     . . . . . . . .    ");
    console.log("\x1B[0m        \x1B[7m     . . . . . . . .    ");
    console.log("\x1B[0m        \x1B[7m     . . . . . . . .    ");
    console.log("\x1B[0m        \x1B[7m     . . . . . . . .    ");
    console.log("\x1B[0m        \x1B[7m     . . . . . . . .    ");
    console.log("\x1B[0m        \x1B[7m     . . . . . . . .    ");
    console.log("\x1B[0m        \x1B[7m                        ");
    console.log("\x1B[0m        \x1B[7m       LUX SENSOR       ");
    console.log("\x1B[0m        \x1B[7m                        ");
    console.log("\x1B[0m        \x1B[7m     +-------------+    ");
    console.log("\x1B[0m        \x1B[7m     | ----------- |    ");
    console.log("\x1B[0m        \x1B[7m     | ----------- |    ");
    console.log("\x1B[0m        \x1B[7m     | ----------- |    ");
    console.log("\x1B[0m        \x1B[7m     +-------------+    ");
    console.log("\x1B[0m        \x1B[7m                        ");
    console.log("\x1B[0m");
}

// --- ASCII Art for BRIGHT condition ---
function drawBright() {
    clearCursor();
    console.log("\x1B[0m");
    console.log("Down Arrow to simulate Darkness");
    console.log("\x1B[0m        \x1B[7m                        ");
    console.log("\x1B[0m        \x1B[7m     ***************    ");
    console.log("\x1B[0m        \x1B[7m     ***************    ");
    console.log("\x1B[0m        \x1B[7m     ***************    ");
    console.log("\x1B[0m        \x1B[7m     ***************    ");
    console.log("\x1B[0m        \x1B[7m     ***************    ");
    console.log("\x1B[0m        \x1B[7m     ***************    ");
    console.log("\x1B[0m        \x1B[7m                        ");
    console.log("\x1B[0m        \x1B[7m       LUX SENSOR       ");
    console.log("\x1B[0m        \x1B[7m                        ");
    console.log("\x1B[0m        \x1B[7m     +-------------+    ");
    console.log("\x1B[0m        \x1B[7m     | ----------- |    ");
    console.log("\x1B[0m        \x1B[7m     | ----------- |    ");
    console.log("\x1B[0m        \x1B[7m     | ----------- |    ");
    console.log("\x1B[0m        \x1B[7m     +-------------+    ");
    console.log("\x1B[0m        \x1B[7m                        ");
    console.log("\x1B[0m");
}

function getRandomLUX(condition) {
    let base = condition === 'dark' ? 200 : 900;
    return Math.round((base + (Math.random() - 0.5) * 200));
}


export function init(device) {
    let condition = 'dark';
    let stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    stdin.on('data', function (key) {
        if (key === '\u001b[A') {  // Up arrow
            condition = 'bright';
            device.publishChange();
        } else if (key === '\u001b[B') {  // Down arrow
            condition = 'dark';
            device.publishChange();
        } else if (key === '\u0003' || key === '\u001b') {
            process.exit();
        }
    });

    device.loop = () => {
        if (condition === 'dark') {
            drawDark();
        } else {
            drawBright();
        }

        const payload = {
            "d": {
                "lux": getRandomLUX(condition)
            }
        };

        device.publishEvent('status', JSON.stringify(payload));
        console.log(`\x1B[0m          ${JSON.stringify(payload)}`, cursorUp);
    };

    // Initial drawing
    drawDark(condition);

    device.connect();
    device.run();
}