#!/usr/bin/env node
'use strict';

const NodeJsSensor = require('../dist')

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

    sensorCtx.data.get('Temperature').value = (Math.random() * 50).toFixed(2)
    sensorCtx.data.get('Humidity').value = (Math.random() * 100).toFixed(2)

    console.log(`[${sensorCtx.name}] Reading data finished`)
    console.log(`[${sensorCtx.name}] [${sensorCtx.data.get('Temperature').name}] ${sensorCtx.data.get('Temperature').value}${sensorCtx.data.get('Temperature').unit}`)
    console.log(`[${sensorCtx.name}] [${sensorCtx.data.get('Humidity').name}] ${sensorCtx.data.get('Humidity').value}${sensorCtx.data.get('Humidity').unit}`)
})

sensor.init()
    .read()
    .catch(console.log)
