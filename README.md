# 1. io7 Dummy Device

This is a part of io7 IOT Platform https://github.com/io7lab to help build an IOT device, especially to test out the io7 Platform Cloud installation.

This has a dummy device NodeJS program that emulates a light bulb lamp and a wall switch

Once registering two devices(say, lamp1 and switch1) to the io7 IOT Platform after the platform setup, you can run this nodejs programs without installing locally by following this step.


## To run the light bulb lamp

`npx github:io7lab/io7dummy-device lamp`
<ul>
  <li>
    First time run will let configure<br>
    <img width="431" alt="Screenshot 2024-05-27 at 4 42 50 PM" src="https://github.com/io7lab/io7dummy-device/assets/13171662/807d8eff-7b7e-4a6a-aef0-dc382dbb0b8a">
  </li>
  <li>
    Light Bulb Lamp Running<br>
    <img width="290" alt="Screenshot 2024-05-27 at 4 43 09 PM" src="https://github.com/io7lab/io7dummy-device/assets/13171662/f7f690d8-f428-4ac8-b951-4b24ce8f8269">
  </li>
</ul>



## To run the wall switch
`npx github:io7lab/io7dummy-device switch`
<ul>
  <li>
    Wall Switch Running<br>
    <img width="251" alt="Screenshot 2024-05-27 at 4 36 57 PM" src="https://github.com/io7lab/io7dummy-device/assets/13171662/f929a56b-bed3-4103-93c1-6c3deabf4653">    
  </li>
</ul>

## Example NodeRED flow 
<img width="622" alt="Screenshot 2024-05-27 at 5 02 03 PM" src="https://github.com/io7lab/io7dummy-device/assets/13171662/54bb66db-a0b0-4aed-81de-39a50246559f">

# 2. SSL Configuration
For the SSL/TLS mqtt connection, just copy the CA's certificate file as 'ca.pem'. With 'ca.pem' file in the current directory, the device program will start mqtts connection.

# 3. Customization or building a New type of Device 

A new type of dummy device can be easily created like this, or this can be the base library for a nodejs io7 device.
* git clone https://github.com/io7lab/io7dummy-device.git
* cd io7dummy-device
* and implement a new device or modify existing switch.js/lamp.js/thermo.js for the following points
  * import Device class
  * implement init(device) function with following
    * define setUserCommand that handles the command from the io7 Platform
    * define loop that handles the device's functionality
    * and call connect() and run()
* run `node io7dummy yourDevice.js` for testing
  * the reason of running io7dummy instead of yourDevice.js directly is to make it runnable with npx easily. `npx github:io7lab/io7dummy-device yourDevice.js`

Here is an example. 
```javascript
import { Device, clearCursor }  from './io7device.js';

const cursorUp = '\x1B[A'; // Move cursor up one line

let valve = 'off';

function offValve() {
    clearCursor();
    console.log("                               ");  
    console.log("                               ");  
    console.log("                               ");  
    console.log("             __T__             ");  
    console.log("                               ");  
    console.log("          Valve Closed         ");  
    console.log("                               ");  
    console.log("                               ");  
    valve = 'off';
}

function onValve() {
    clearCursor();
    console.log("                               ");  
    console.log("                               ");  
    console.log("                               ");  
    console.log("             =====             ");  
    console.log("                               ");  
    console.log("           Valve Open          ");  
    console.log("                               ");  
    console.log("                               ");  
    valve = 'on';
}

export function init(device) {
    
    device.setUserCommand((topic, msg) => {
        console.log('command', JSON.parse(msg));
        let cmd = JSON.parse(msg);
        if (cmd.hasOwnProperty('d') && cmd.d.hasOwnProperty('valve')) {
            if (cmd.d.valve === 'on') {
                onValve();
            } else {
                offValve();
            }
            device.publishEvent('status', JSON.stringify({"d":{"valve":valve}}));
            console.log(`\x1B[0m      {"d":{"valve":"${valve}"}`, cursorUp);
        }
    });
    
    device.loop = () => {
        device.publishEvent('status', JSON.stringify({"d":{"valve":valve}}));
        console.log(`\x1B[0m      {"d":{"valve":"${valve}"}`, cursorUp);
    };

    offValve();

    device.connect();
    device.run();
}
```
