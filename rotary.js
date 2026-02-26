import { Device, clearCursor, cursorUp } from './io7device.js';

let value = 128;  // Start in the middle
const min = 0;
const max = 255;

function adjust(direction) {
    if (direction === 'left' && value > min) {
        value = value - 10;
    } else if (direction === 'right' && value < max) {
        value = value + 10;
    }
}

function displayRotary(value) {
    const R = '\x1B[0m';
    const A = '\x1B[1;33m';
    const D = '\x1B[90m';
    const V = '\x1B[1;36m';
    const P = '\x1B[1;37m';

    const rows = 8;
    const cols = 17;
    const cx = 4, cy = 8;

    let grid = [];
    for (let r = 0; r < rows; r++) {
        grid[r] = [];
        for (let c = 0; c < cols; c++) {
            grid[r][c] = ' ';
        }
    }

    grid[cx][cy] = P + 'O' + R;

    // 11 dot positions: 7 o'clock to 5 o'clock clockwise through top
    const dots = [
        [7, 5], [6, 3], [4, 2], [2, 3], [1, 5],
        [1, 8], [1, 11], [2, 13], [4, 14], [6, 13], [7, 11]
    ];

    const pos = Math.round((value - min) / (max - min) * (dots.length - 1));

    for (let i = 0; i < dots.length; i++) {
        const [r, c] = dots[i];
        grid[r][c] = i === pos ? A + '#' + R : D + '.' + R;
    }

    // Draw pointer from center toward active dot
    const [tr, tc] = dots[pos];
    const dr = tr - cx;
    const dc = tc - cy;
    const steps = Math.max(Math.abs(dr), Math.abs(dc));

    // Use a single consistent character based on overall direction
    let ch;
    if (Math.abs(dr) === 0 || Math.abs(dc) > 3 * Math.abs(dr)) ch = '-';
    else if (Math.abs(dc) === 0 || Math.abs(dr) > 3 * Math.abs(dc)) ch = '|';
    else if ((dr > 0 && dc > 0) || (dr < 0 && dc < 0)) ch = '\\';
    else ch = '/';

    for (let s = 1; s < steps; s++) {
        const pr = Math.round(cx + dr * s / steps);
        const pc = Math.round(cy + dc * s / steps);
        grid[pr][pc] = A + ch + R;
    }

    clearCursor();
    console.log("  Use Left/Right Arrow Keys to set the value");
    console.log();
    for (let r = 0; r < rows; r++) {
        console.log('    ' + grid[r].join(''));
    }
    console.log();
    console.log(`     ${D}${min}${R}                ${D}${max}${R}`);
    console.log(`        ${V}[ Value: ${value} ]${R}`);
    console.log();
}

export function init(device) {
    let stdin = process.stdin;
    if (stdin.isTTY) stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    stdin.on('data', function (key) {
        if (key === '\u001b[D') {  // Left arrow
            adjust('left');
            device.publishChange();
        } else if (key === '\u001b[C') {  // Right arrow
            adjust('right');
            device.publishChange();
        } else if (key === '\u0003' || key === '\u001b') {
            process.exit();
        }
    });

    device.setUserCommand((topic, msg) => {
        let cmd = JSON.parse(msg);
        if (cmd.hasOwnProperty('d') && cmd.d.hasOwnProperty('value')) {
            value = cmd.d.value;
            displayRotary(value);
            let data = {
                d: {
                    value: value
                }
            };
            device.publishEvent('status', JSON.stringify(data));
            console.log('  ' + JSON.stringify(data), cursorUp);
        }
    });

    device.loop = () => {
        displayRotary(value);
        let data = {
            d: {
                value: value
            }
        };
        device.publishEvent('status', JSON.stringify(data));
        console.log('  ' + JSON.stringify(data), cursorUp);
    };

    device.connect();
    device.run();
}
