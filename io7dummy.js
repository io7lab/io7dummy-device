#!/usr/bin/env node
import {setConfigFile} from './io7device.js';
import {runLamp } from './lamp.js';
import {runSwitch } from './switch.js';

if (process.argv.length < 3 || process.argv[2] === 'lamp') {
    setConfigFile('lamp.cfg');
    runLamp();
} else {
    setConfigFile('switch.cfg');
    runSwitch();
}
