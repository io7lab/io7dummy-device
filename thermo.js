import { Device, clearCursor, cursorUp }  from './io7device.js';

const min = 15;
const max = 35;
let base = 25.0;
let lowTemp = 22.0;
let highTemp = 28.0;
let columnIndex = {};

function getTemperature(base) {
    return Math.round((base + (Math.random() - 0.5) * 2) * 10) / 10;
}

function adjust(direction, base) {
    if (direction === 'up' && base < max) {
        base = base + 1;
    } else if (direction === 'down' && base > min) {
        base = base - 1;
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

function displayThermometer(temp) {
    const tempColor = temp < lowTemp ? '\x1B[32m' : temp < highTemp ? '\x1B[34m' : '\x1B[31m'; // Green, Blue, Red
    const resetColor = '\x1B[0m';
    const mercuryLevel = Math.floor(((temp - min) / (max - min)) * 10);

    function colorColumn() {
        for (let lvl = 10; lvl > 0; lvl--) {
            let tempLegend;
            if (lvl === 10) {
                tempLegend = (temp >= columnIndex[lvl]) ? `${temp}°C` : '';
            } else if (lvl === 1) {
                tempLegend = (temp <= columnIndex[lvl]) ? `${temp}°C` : '';
            } else {
                tempLegend = (temp >= columnIndex[lvl] && temp < columnIndex[lvl + 1]) ? `${temp}°C` : '';
            }
            console.log(`           │${mercuryLevel >= lvl ? tempColor + '█' + resetColor : ' '}│  ${tempLegend}`);
        }
    }
    clearCursor();
    
    console.log("Use Up/Down Arrow key to change the base temperature");
    console.log()
    console.log("           ┌─┐");
    colorColumn();
    console.log(`           │${tempColor}█${resetColor}│`);
    console.log(`          ╱${tempColor}███${resetColor}╲`);
    console.log(`         │${tempColor}█████${resetColor}│`);
    console.log(`         │${tempColor}█████${resetColor}│`);
    console.log(`          ╲${tempColor}███${resetColor}╱`);
    console.log("     ");
    console.log(`    Current: ${tempColor}${temp}°C${resetColor}`);
    console.log("     ");
}

export function init(device) {
    let stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    stdin.on('data', function(key){
        if (key === '\u001b[A') {  // Up arrow
            base = adjust('up', base);
        } else if (key === '\u001b[B') {  // Down arrow
            base = adjust('down', base);
        } else if (key === '\u0003' || key === '\u001b') {
            process.exit();
        }
    });
    
    device.connect();

    setColumnIndex();
    
    device.loop = () => {
        let temp = getTemperature(base);
        displayThermometer(temp);
        device.publishEvent('status', JSON.stringify({"d":{"temperature":temp}}));
        console.log(`{"d":{"temperature":"${temp}"}`, cursorUp);
    };
    
    device.run();
}