#!/usr/bin/env node
'use strict';

const NodeJsSensor = require('../src/')
const dhtSensor = require("node-dht-sensor")

const DHT_PIN = 4
const DHT_TYPE = {
    DHT11: 11,
    DHT22: 22,
}

const sensor = new NodeJsSensor.Sensor({
    name: 'DHT22 - Bedroom'
}, {
    type: DHT_TYPE.DHT22,
    pin: DHT_PIN
})

sensor.addData('Temperature', '°C')
sensor.addData('Humidity', '%')

sensor.on('init', function(sensorCtx) {
    try {
        dhtSensor.initialize(
            sensorCtx.getSensorSettings().type,
            sensorCtx.getSensorSettings().pin
        )
        sensorCtx.setInitialized()
    } catch (e) {
        console.log(e)
    }
})

sensor.on('read', async function(sensorCtx) {
    return new Promise(async (resolve, reject) => {
        let res = await dhtSensor.read()
        if (!res) {
            reject(res)
        }

        if (!parseFloat(res.temperature.toFixed(1)) && !parseFloat(res.humidity.toFixed(1))) {
            reject(new Error('Sensor does not reading'))
        }

        sensorCtx.data[0].value = res.temperature.toFixed(1)
        sensorCtx.data[1].value = res.humidity.toFixed(1)
        sensorCtx.setLastReadingTime()
        sensorCtx.finish()
        resolve()
    })
})

module.exports = new NodeJsSensor.SensorManager(sensor)