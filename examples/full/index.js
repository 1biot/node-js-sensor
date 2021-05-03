#!/usr/bin/env node
'use strict';

const NodeJsSensor = require('../../src/')

function getFakeData() {
    return new Promise((resolve, reject) => {
        setTimeout(function(){
            resolve({
                temperature: (Math.random() * 50).toFixed(2),
                humidity: (Math.random() * 100).toFixed(2)
            })
        }, 2000)
    })
}

const sensor = new NodeJsSensor.Sensor({
    name: 'My Custom Sensor'
})

sensor.on('init', function(sensorCtx){
    sensorCtx.setInitialized()
    console.log(`[${sensorCtx.name}] Sensor initialized`)
})

sensor.on('read', async (sensorCtx) => {
    console.log(`[${sensorCtx.name}] Start reading data ...`)
    // await function for reading data
    let res = await getFakeData()
    sensorCtx.data[0].value = res.temperature
    sensorCtx.data[1].value = res.humidity
    sensorCtx.finish()
})

sensor.addData('Temperature', '°C')
sensor.addData('Humidity', '%')

const sensorManager = new NodeJsSensor.SensorManager(sensor)

sensorManager.use(function(sensorCtx, next){
    console.log(`[${sensorCtx.name}] Sensor reading finished`)
    next()
    console.log(`[${sensorCtx.name}] Sensor middleware are finished`)
})

// middleware for temperature
sensorManager.use(function(sensorCtx, next){
    console.log(`[${sensorCtx.name}] [${sensorCtx.data[0].name}] ${sensorCtx.data[0].value}${sensorCtx.data[0].unit}`)
    next()
})

// middleware for humidity
sensorManager.use(function(sensorCtx) {
    console.log(`[${sensorCtx.name}] [${sensorCtx.data[1].name}] ${sensorCtx.data[1].value}${sensorCtx.data[1].unit}`)
})

sensorManager.setInterval(2000)
    .setTimeout(10000)
    .setLimit(4)
    .run()
