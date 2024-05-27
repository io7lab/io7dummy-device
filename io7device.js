import {Client, connect} from 'mqtt';
import {existsSync, writeFile, readFileSync } from 'fs';
import prompt from 'prompt-sync';

const getInput = prompt(); // Assuming you only need the prompt functionality
const cursorUp = '\x1B[A';

let cfg_file = 'device.cfg';

export function setConfigFile(f) {
    cfg_file = f;
}

export class Device {
    constructor(cfg = null) {
        if (!cfg || !cfg.devId) {
            if (existsSync(cfg_file)) {
                try {
                    cfg = JSON.parse(readFileSync(cfg_file));
                } catch (e) {
                    cfg = {};
                }
            } else {
                cfg = {};
            }
            if(!cfg.devId || !cfg.token || !cfg.broker) {
                console.log('Enter device configuration');
                cfg.devId = getInput('devId: ' + (cfg.devId ||  '?') + ' ') || cfg.devId;
                cfg.token = getInput('token: ' + (cfg.token ||  '?') + ' ') || cfg.token;
                cfg.broker = getInput('broker: ' + (cfg.broker ||  '?') + ' ') || cfg.broker;
                cfg.meta = cfg.meta || {};
                cfg.meta.pubInterval = getInput('pubInterval: ' + (cfg.meta.pubInterval ||  5000) + ' ') || 5000;
                this.saveCfg(cfg);
            }
        } 
        console.log('Device Configuration:', cfg);
        this.ca = existsSync('ca.pem') ? 'ca.pem' : '';
        this.port = this.ca ? '8883' : '1883';
        this.proto = this.ca ? 'mqtts' : 'mqtt';
        this.ssl_params = this.ca ? { ca: this.ca } : {};

        this.broker = cfg.broker || '127.0.0.1';
        this.devId = cfg.devId;
        this.token = cfg.token || null;
        this.meta = cfg.meta || {};

        this.meta['pubInterval'] = this.meta['pubInterval'] || 5000;
        this.cmdCallback = null;
        this.resetCallback = null;
        this.updateCallback = null;
        this.upgradeCallback = null;
        
        this.evtTopic = `iot3/${this.devId}/evt/`;
        this.cmdTopicBase = `iot3/${this.devId}/cmd/`;
        this.cmdTopic = `${this.cmdTopicBase}+/fmt/+`;
        this.metaTopic = `iot3/${this.devId}/mgmt/device/meta`;
        this.logTopic = `iot3/${this.devId}/mgmt/device/status`;
        this.updateTopic = `iot3/${this.devId}/mgmt/device/update`;
        this.rebootTopic = `iot3/${this.devId}/mgmt/initiate/device/reboot`;
        this.resetTopic = `iot3/${this.devId}/mgmt/initiate/device/factory_reset`;
        this.upgradeTopic = `iot3/${this.devId}/mgmt/initiate/firmware/update`;
        this.connectionTopic = `iot3/${this.devId}/evt/connection/fmt/json`;
    }

    connect() {
        //this.client = mqtt.connect(`mqtt://${this.broker}:${port}`, {
        this.client = connect(`${this.proto}://${this.broker}:${this.port}`, {
            clientId: this.devId,
            username: this.devId,
            password: this.token,
            ...this.ssl_params,
            will: { 
                topic: this.connectionTopic,
                payload: '{"d":{"status":"offline"}}', 
                retain : true, qos:0
            } 
        });

        this.client.on('connect', () => {
            this.client.subscribe(this.cmdTopic);
            this.client.subscribe(this.rebootTopic);
            this.client.subscribe(this.resetTopic);
            this.client.subscribe(this.updateTopic);
            this.client.subscribe(this.upgradeTopic);
            this.client.publish(this.connectionTopic, JSON.stringify({ d: { status: "online" } }), { qos: 0, retain: true });
            this.client.publish(this.metaTopic, JSON.stringify({ d: { metadata: this.meta } }), { qos: 0, retain: true });
        });

        this.client.on('error', (error) => {
            console.error(error);
            process.exit(1);
        });

        this.client.on('message', (topic, msg) => {
            const topicStr = topic.toString();
            if (topicStr === this.rebootTopic) {
                console.log('Rebooting device');
                this.reboot();
            } else if (topicStr === this.resetTopic) {
                if (this.resetCallback) {
                    this.resetCallback(topic, msg);
                } else {
                    console.log('resetting device');
                    this.saveCfg({});
                }
            } else if (topicStr === this.updateTopic) {
                const metafields = JSON.parse(msg).d.fields[0];
                if (metafields.field === 'metadata') {
                    this.meta = metafields.value;
                    this.saveCfg(this.cfg());
                    this.client.publish(this.metaTopic, JSON.stringify({ d: { metadata: this.meta } }), { qos: 0, retain: true });
                }
                if (this.updateCallback) {
                    this.updateCallback(topic, msg);
                }
            } else if (topicStr.startsWith(this.cmdTopicBase) && this.cmdCallback) {
                this.cmdCallback(topic, msg);
            }
        });
    }

    publishEvent(evtId, data, fmt='json', qos=0, retain=false) {
        this.client.publish(`${this.evtTopic}${evtId}/fmt/${fmt}`, data, { qos, retain });
    }

    cfg() {
        return {
            broker: this.broker,
            token: this.token,
            devId: this.devId,
            meta: this.meta
        };
    }

    reboot() {
        process.exit(0);
    }

    setUserMeta(callback) {
        this.updateCallback = callback;
    }

    setUpgradeCallback(callback) {
        this.upgradeCallback = callback;
    }

    setUserCommand(callback) {
        this.cmdCallback = callback;
    }

    setResetCallback(callback) {
        if (this.constructor.name === 'Device') {
            this.resetCallback = callback;
        }
    }

    saveCfg(cfg) {
        console.log('Saving configuration', cursorUp)
        writeFile(cfg_file, JSON.stringify(cfg), (err) => {
            if (err) {
                console.error(err);
            }
        });
    }
}