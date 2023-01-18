#!/usr/bin/env node
'use strict';

const NodeJsSensor = require('../dist')

// async receiving the data
const getFakeData = function() {
    return new Promise((resolve, reject) => {
        setTimeout(function() {
            resolve({
                temperature: (Math.random() * 50).toFixed(2),
                humidity: (Math.random() * 100).toFixed(2)
            })
        }, 5000)
    })
}

const sensor = new NodeJsSensor.Sensor({
    name: 'My Custom Sensor'
})

sensor.addData('Temperature', '°C') // data[0]
sensor.addData('Humidity', '%') // data[1]

sensor.on('init', function(sensorCtx) {
    sensorCtx.setInitialized()
    console.log(`[${sensorCtx.name}] Sensor initialized`)
})

sensor.on('read', async (sensorCtx) => {
    return new Promise((resolve, reject) => {
        console.log(`[${sensorCtx.name}] Start reading data ...`)

        getFakeData().then(fakeData => {
            sensorCtx.setLastReadingTime()


            sensorCtx.data.get('Temperature').value = fakeData.temperature
            sensorCtx.data.get('Humidity').value = fakeData.humidity

            sensorCtx.finish()
            resolve()
        }).catch(err => {
            sensorCtx.finish()
            reject(err)
        })
    })
})

sensor.on('finish', function(sensorCtx){
    console.log(`[${sensorCtx.name}] Reading data finished`)
    console.log(`[${sensorCtx.name}] [${sensorCtx.data.get('Temperature').name}] ${sensorCtx.data.get('Temperature').value}${sensorCtx.data.get('Temperature').unit}`)
    console.log(`[${sensorCtx.name}] [${sensorCtx.data.get('Humidity').name}] ${sensorCtx.data.get('Humidity').value}${sensorCtx.data.get('Humidity').unit}`)
})

sensor.init()
    .read()
    .catch(console.log)
