#!/usr/bin/env node
'use strict';

const Sensor = require('../../src/Sensor')
const SensorManager = require('../../src/SensorManager')

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

const sensor = new Sensor({
    name: 'Testovací sensor'
})

sensor.on('init', function(sensorCtx){
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

/*sensor.on('finish', function(sensorCtx){
    console.log(`[${sensorCtx.name}] Sensor reading finished`)
    console.log(`[${sensorCtx.name}] Data output:`)
    console.log(sensorCtx.data)
})*/

sensor.addData('Teplota', '°C')
sensor.addData('Vlhkost vzduchu', '%')

const sensorManager = new SensorManager(sensor)

sensorManager.use(function(sensorCtx, next){
    console.log(`[${sensorCtx.name}] Sensor reading finished`)
    next()
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

sensorManager.setInterval(4000)
    .setTimeout(60000)
    .setLimit(2)
    .run()
