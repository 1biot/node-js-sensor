#!/usr/bin/env node
'use strict';

const NodeJsSensor = require('../../src/')

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


            sensorCtx.data[0].value = fakeData.temperature
            sensorCtx.data[1].value = fakeData.humidity

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
    console.log(`[${sensorCtx.name}] [${sensorCtx.data[0].name}] ${sensorCtx.data[0].value}${sensorCtx.data[0].unit}`)
    console.log(`[${sensorCtx.name}] [${sensorCtx.data[1].name}] ${sensorCtx.data[1].value}${sensorCtx.data[1].unit}`)
})

sensor.init()
    .read()
    .catch(console.log)
