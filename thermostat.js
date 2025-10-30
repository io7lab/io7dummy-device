import { Device, clearCursor, cursorUp }  from './io7device.js';

const min = 15;
const max = 35;
let base_temp = 25.0;
let lowTemp = 22.0;
let highTemp = 28.0;
let target = 10;
let columnIndex = {};

function getRandomData(base) {
    return Math.round((base + (Math.random() - 0.5) * 2) * 10) / 10;
}

function adjust(direction, base) {
    if (direction === 'up' && base < max) {
        base = base + 1;
    } else if (direction === 'down' && base > min) {
        base = base - 1;
    } else if (direction === 'left' && base > min) {
        target = target <= 10 ? 10 : target - 1;
    } else if (direction === 'right' && base > min) {
        target = target >= 60 ? 60 : target + 1;
    }
    setColumnIndex();
    return base;
}

function setColumnIndex() {
    let newIndex = {};
    let step = (max - min) / 10;
    for (let lvl = 10; lvl > 0; lvl--) { columnIndex[lvl] = min + step * lvl }
    return newIndex;
}

function displayThermometer(temp, target) {
    const tempColor = temp < lowTemp ? '\x1B[32m' : temp <= highTemp ? '\x1B[34m' : '\x1B[31m'; // Green, Blue, Red
    const resetColor = '\x1B[0m';
    const mercuryLevel = Math.floor(((temp - min) / (max - min)) * 10);

    function colorColumn() {
        for (let lvl = 10; lvl > 0; lvl--) {
            let tempLegend;
            if (lvl >= 10) {
                tempLegend = (temp >= columnIndex[lvl]) ? `${tempColor}${temp}°C${resetColor}` : '';
            } else if (lvl <= 1) {
                tempLegend = (temp <= columnIndex[lvl + 1])  ? `${tempColor}${temp}°C${resetColor}` : '';
            } else {
                tempLegend = (temp >= columnIndex[lvl] && temp < columnIndex[lvl + 1]) ? `${tempColor}${temp}°C${resetColor}` : '';
            }
            console.log(`             |${mercuryLevel >= lvl ? tempColor + '█' + resetColor : ' '}|  ${tempLegend}`);
        }
    }
    function targetSlider(target) {
        let slider = '==========================';
        let idx = target - 10;
        slider = slider.substring(0, idx) + '[|]' + slider.substring(idx + 1);
        console.log(slider);

    }

    clearCursor();
    
    console.log("Use Up/Down Keys to simulate the temperature change");
    console.log("             +─+");
    colorColumn();
    console.log(`             |${tempColor}█${resetColor}|`);
    console.log(`            /${tempColor}███${resetColor}\\`);
    console.log(`           |${tempColor}█████${resetColor}|`);
    console.log(`           |${tempColor}█████${resetColor}|`);
    console.log(`            \\${tempColor}███${resetColor}/`);
    console.log("     ");
    targetSlider(target);
    console.log(`       [Target: ${target}°C]`);
    console.log("Use Left/Right Keys to set the target temperature");
    console.log("     ");
}

export function init(device) {
    let stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    stdin.on('data', function (key) {
        if (key === '\u001b[A') {  // Up arrow
            base_temp = adjust('up', base_temp);
            device.publishChange();
        } else if (key === '\u001b[B') {  // Down arrow
            base_temp = adjust('down', base_temp);
            device.publishChange();
        } else if (key === '\u001b[D') {  // Left arrow
            base_temp = adjust('left', base_temp);
            device.publishChange();
        } else if (key === '\u001b[C') {  // Right arrow
            base_temp = adjust('right', base_temp);
            device.publishChange();
        } else if (key === '\u0003' || key === '\u001b') {
            process.exit();
        }
    });

    device.setUserCommand((topic, msg) => {
        let cmd = JSON.parse(msg);
        if (cmd.hasOwnProperty('d') && cmd.d.hasOwnProperty('target')) {
            let temp = getRandomData(base_temp);
            target = cmd.d.target;
            let data = {
                d: {
                    temperature: temp,
                    target: target
                }
            }
            displayThermometer(temp, target);
            device.publishEvent('status', JSON.stringify(data));
            console.log('  ' + JSON.stringify(data), cursorUp);
        }
    });

    device.loop = () => {
        let temp = getRandomData(base_temp);
        displayThermometer(temp, target);
        let data = {
            d: {
                temperature: temp,
                target: target
            }
        }
        device.publishEvent('status', JSON.stringify(data));
        console.log('  ' + JSON.stringify(data), cursorUp);
    };

    setColumnIndex();

    device.connect();
    device.run();
}