
# 1. io7 Dummy Device

This is part of the io7 IoT Platform ([https://github.com/io7lab](https://github.com/io7lab)), designed to help build IoT devices and test the io7 Platform Cloud installation.

This repository contains Node.js programs that emulate a light bulb lamp and a wall switch. Additional examples include a lux sensor and a thermometer.

After registering two devices (e.g., `lamp1` and `switch1`) on the io7 IoT Platform, you can run these Node.js programs without installing them locally by following these steps:

## Running the Light Bulb Lamp

```sh
npx github:io7lab/io7dummy-device lamp
```

- The first run will prompt you to configure the device.<br>
  <img width="431" alt="Screenshot 2024-05-27 at 4 42 50 PM" src="https://github.com/io7lab/io7dummy-device/assets/13171662/807d8eff-7b7e-4a6a-aef0-dc382dbb0b8a">
- Light Bulb Lamp Running<br>
  <img width="290" alt="Screenshot 2024-05-27 at 4 43 09 PM" src="https://github.com/io7lab/io7dummy-device/assets/13171662/f7f690d8-f428-4ac8-b951-4b24ce8f8269">

## Running the Wall Switch

```sh
npx github:io7lab/io7dummy-device switch
```

- Wall Switch Running<br>
  <img width="251" alt="Screenshot 2024-05-27 at 4 36 57 PM" src="https://github.com/io7lab/io7dummy-device/assets/13171662/f929a56b-bed3-4103-93c1-6c3deabf4653">

## Example Node-RED Flow

<img width="622" alt="Screenshot 2024-05-27 at 5 02 03 PM" src="https://github.com/io7lab/io7dummy-device/assets/13171662/54bb66db-a0b0-4aed-81de-39a50246559f">

# 2. SSL Configuration

For SSL/TLS MQTT connections, simply copy the CA certificate file as `ca.pem`. With the `ca.pem` file in the current directory, the device program will start an MQTTs connection.


# 3. Customization or Building a New Type of Device

The current io7dummy implementation includes four device types: lux sensor, switch, lamp, and thermometer. You can easily create a new type of dummy device by following the instructions below, or use this as a base library for a Node.js io7 device.

1. Clone the repository:
   ```sh
   git clone https://github.com/io7lab/io7dummy-device.git
   cd io7dummy-device
   ```
2. Implement a new device or modify an existing one (`switch.js`, `lamp.js`, or `thermo.js`) by:
   - Importing the `Device` class
   - Implementing the `init(device)` function:
   - Define `setUserCommand` to handle commands from the io7 Platform
   - Define `loop` to handle the device's functionality
   - Call `connect()` and `run()`
3. Run `node io7dummy yourDevice.js` for testing.
   - Running `io7dummy` instead of your device file directly makes it easy to use with npx:  
   ```sh
   npx github:io7lab/io7dummy-device yourDevice.js
   ```

Here is an example:

```javascript
import { Device, clearCursor } from './io7device.js';

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
