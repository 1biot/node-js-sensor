#!/usr/bin/env node
'use strict';

const Sensor = require('../../src/Sensor')
const SensorManager = require('../../src/SensorManager')

function getFakeData() {
    return new Promise((resolve, reject) => {
        setTimeout(function() {
            resolve({
                temperature: (Math.random() * 50).toFixed(2),
                humidity: (Math.random() * 100).toFixed(2)
            })
        }, Math.random() * (8000 - 1500) + 1500)
    })
}

const sensor = new Sensor({
    name: 'Testovací sensor'
})

sensor.on('init', function(sensorCtx) {
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

sensor.addData('Teplota', '°C')
sensor.addData('Vlhkost vzduchu', '%')

const sensorManager = new SensorManager(sensor)

sensorManager.use(function(sensorCtx, next) {
    console.log(`[${sensorCtx.name}] Sensor reading finished`)
    console.log(`[${sensorCtx.name}] Reading counter #${sensorManager.getCounter()}`)
    console.log(`[${sensorCtx.name}] Reading time was ${sensorCtx.getReadingTime() / 1000}s`)
    next()
})

// middleware for temperature
sensorManager.use(function(sensorCtx, next) {
    const temperature = sensorCtx.data[0]
    console.log(`[${sensorCtx.name}] [${temperature.name}] ${temperature.value}${temperature.unit}`)
    next()
})

// middleware for humidity
sensorManager.use(function(sensorCtx) {
    const humidity = sensorCtx.data[1]
    console.log(`[${sensorCtx.name}] [${humidity.name}] ${humidity.value}${humidity.unit}`)
})

sensorManager.setInterval(4000)
//sensorManager.setTimeout(60000)
//sensorManager.setLimit(2)
sensorManager.run()
