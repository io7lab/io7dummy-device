#!/usr/bin/env node
import {setConfigFile} from './io7device.js';
import {runLamp } from './lamp.js';
import {runSwitch } from './switch.js';

if (process.argv.length < 3) {
    console.log('Usage: io7dummy.js  lamp | switch');
    process.exit(1);
}

if (process.argv[2] === 'lamp') {
    setConfigFile('lamp.cfg');
    runLamp();
} else if (process.argv[2] === 'switch') {
    setConfigFile('switch.cfg');
    runSwitch();
}
