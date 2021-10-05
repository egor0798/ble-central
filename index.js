const noble = require('@abandonware/noble');
import { Buffer } from 'buffer';

const PERIPHERAL_ID = '';
const SERVICE_ID = '';
const CHARACTERISTIC_ID = '';

let peripheral;
let service;
let characteristic;

noble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
        console.log('scanning...');
        noble.startScanning([PERIPHERAL_ID], false);
    }
    else {
        noble.stopScanning();
    }
})

noble.on('discover', function(res) {
    // we found a peripheral, stop scanning
    noble.stopScanning();
    console.log('found peripheral');
    peripheral = res;
    //
    // Once the peripheral has been discovered, then connect to it.
    //
    peripheral.connect(function(err) {
        //
        // Once the peripheral has been connected, then discover the
        // services and characteristics of interest.
        //
        peripheral.discoverServices([SERVICE_ID], function(err, servicesRes) {
            servicesRes.forEach(function(serviceRes) {
                //
                // This must be the service we were looking for.
                //
                console.log('found service');
                service = serviceRes;

                //
                // So, discover its characteristics.
                //
                service.discoverCharacteristics([CHARACTERISTIC_ID], function(err, characteristics) {

                    characteristics.forEach(function(characteristicRes) {
                        characteristic = characteristicRes;
                        //
                        // Loop through each characteristic and match them to the
                        // UUIDs that we know about.
                        //
                        console.log('found characteristic');
                    })

                    //
                    // Check to see if we found all of our characteristics.
                    //
                    if (service &&
                        peripheral &&
                        characteristic) {
                        doSomething();
                    }
                    else {
                        console.log('missing characteristics');
                    }
                })
            })
        })
    })
})

function doSomething() {
    const message = Buffer.from('Ping', 'utf-8');
    characteristic.write(message, false, function(err) {
        if (!err) {
            characteristic.on('read', function(data, isNotification) {
                console.log(`Got ${isNotification ? 'notification ' : 'message '}:`);
                console.log(data.toString());
            });
        }
        else {
            console.log('cant write characteristic');
        }
    })
}
