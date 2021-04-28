#!/usr/bin/env node
'use strict';

const Sensor = require('../src/Sensor')
const SensorManager = require('../src/SensorManager')
const dhtSensor = require("node-dht-sensor")

const DHT_PIN = 4
const DHT_TYPE = {
    DHT11: 11,
    DHT22: 22,
}

const sensor = new Sensor({
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
        sensorCtx.data[0].value = res.temperature.toFixed(1)
        sensorCtx.data[1].value = res.humidity.toFixed(1)
        sensorCtx.finish()
        resolve()
    })
})

module.exports = new SensorManager(sensor)