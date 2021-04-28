#!/usr/bin/env node
'use strict';

const myDHTSensor = require('../../sensors/dht')

const prettyOutput = function(name, dataObject) {
    console.log(`[${name}] [${Date.now()}] [${dataObject.name}] ${dataObject.value}${dataObject.unit}`)
}

myDHTSensor.setInterval(5000)
    .setTimeout(60000)

myDHTSensor.use(function(sensorCtx, next) {
    console.log(`[${sensorCtx.name}] [${Date.now()}] Sensor reading finished`)
    console.log(`[${sensorCtx.name}] [${Date.now()}] Reading counter #${myDHTSensor.getCounter()}`)
    console.log(`[${sensorCtx.name}] [${Date.now()}] Reading time was ${sensorCtx.getReadingTime() / 1000}s`)
    next()
})

// middleware for temperature
myDHTSensor.use(function(sensorCtx, next) {
    prettyOutput(sensorCtx.name, sensorCtx.data[0])
    next()
})

// middleware for humidity
myDHTSensor.use(function(sensorCtx) {
    prettyOutput(sensorCtx.name, sensorCtx.data[1])
})

myDHTSensor.run()
