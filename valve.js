import { Device, clearCursor }  from './io7device.js';

const cursorUp = '\x1B[A'; // Move cursor up one line

let valve = 'off';

function offValve() {
  clearCursor();
  console.log("                               ");  
  console.log("                               ");  
  console.log("          _____-_____          ");  
  console.log("               |               ");  
  console.log("          _____|_____          ");  
  console.log("                               ");  
  console.log("          Valve Closed         ");  
  console.log("                               ");  
  console.log("                               ");  
  valve = 'off';
}

function onValve() {
  clearCursor();
  console.log("                               ");  
  console.log("               T               ");  
  console.log("          _____|_____          ");  
  console.log("                               ");  
  console.log("          ___________          ");  
  console.log("                               ");  
  console.log("           Valve Open          ");  
  console.log("                               ");  
  console.log("                               ");  
  valve = 'on';
}

export function init(device) {
    let stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    stdin.on('data', function(key){
        if (key === '\u0003' || key === '\u001b') {
            process.exit(); 
        }
    });
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