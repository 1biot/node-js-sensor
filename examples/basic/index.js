#!/usr/bin/env node
'use strict';

const NodeJsSensor = new require('../../src/')

const sensor = new NodeJsSensor.Sensor({
    name: 'My Custom Sensor'
})

sensor.addData('Temperature', '°C') // data[0]
sensor.addData('Humidity', '%') // data[1]

sensor.on('init', function(sensorCtx) {
    sensorCtx.setInitialized()
    console.log(`[${sensorCtx.name}] Sensor initialized`)
})

sensor.on('read', (sensorCtx) => {
    console.log(`[${sensorCtx.name}] Start reading data ...`)

    sensorCtx.data[0].value = (Math.random() * 50).toFixed(2)
    sensorCtx.data[1].value = (Math.random() * 100).toFixed(2)

    console.log(`[${sensorCtx.name}] Reading data finished`)
    console.log(`[${sensorCtx.name}] [${sensorCtx.data[0].name}] ${sensorCtx.data[0].value}${sensorCtx.data[0].unit}`)
    console.log(`[${sensorCtx.name}] [${sensorCtx.data[1].name}] ${sensorCtx.data[1].value}${sensorCtx.data[1].unit}`)
})

sensor.init()
    .read()
    .catch(console.log)
