#!/usr/bin/env node
'use strict';

const NodeJsSensor = require('../src/')
const BME280 = require('bme280-sensor');

const bme280 = new BME280({
    i2cBusNo: 1,
    i2cAddress: 0x76
});

const sensor = new NodeJsSensor.Sensor({
    name: 'BME280 - Bedroom'
})

sensor.addData('Temperature', '°C')
sensor.addData('Humidity', '%')
sensor.addData('Preassure', 'hPa')

sensor.on('init', function(sensorCtx) {
    bme280.init()
        .then(function(){
            sensorCtx.setInitialized()
        }).catch(err => {
            console.log(`[ERROR] [${err.errno}] ${err.message}`)
            process.exit(1)
        })
})

sensor.on('read', async function(sensorCtx) {
    return new Promise(async (resolve, reject) => {
        bme280.readSensorData()
            .then((data) => {
                sensorCtx.data[0].value = data.temperature_C
                sensorCtx.data[1].value = data.humidity
                sensorCtx.data[2].value = data.pressure_hPa

                sensorCtx.setLastReadingTime()
                sensorCtx.finish()
                resolve()
            })
            .catch((err) => {
                reject(err)
            });
    })
})

module.exports = new NodeJsSensor.SensorManager(sensor)