#!/usr/bin/env node
'use strict';

const myDHTSensor = require('../../sensors/dht')
const InfluxDb = require('influxdb-nodejs')
const influxDbClient = new InfluxDb('http://iplanter1.local:8086/ipot_dev', {
    username: 'admin',
    password: 'raspberry',
})

const fieldSchema = {
    temperature: 'f',
    humidity: 'f',
};
const tagSchema = {
    gw_id: '*',
};

influxDbClient.schema('dht_22', fieldSchema, tagSchema, {
    // default is false
    stripUnknown: true,
});

const startTime = new Date;

const log = function(title, message) {
    console.log(`[${title}] [${(Date.now() - startTime.getTime()) /1000}s] ${message}`)
}

const influxMiddleware = function(sensorCtx) {
    let readingTime = typeof sensorCtx.getLastReadingTime() !== 'undefined'
        ? sensorCtx.getLastReadingTime()
        : new Date();

    let writer = influxDbClient.write('dht_22')
        .tag({
            gw_id: sensorCtx.name,
        })
        .field({
            humidity: parseFloat(sensorCtx.data[1].value),
            temperature: parseFloat(sensorCtx.data[0].value),
        }).time(readingTime.getTime(), 'ms')

    writer.then(() => {
        log(sensorCtx.name, `InfluxDB write has been successfully: ${JSON.stringify(writer.toJSON())}`)
    }).catch((err) => {
        log(sensorCtx.name, err.message)
    })
}

myDHTSensor.use(function(sensorCtx, next) {
    log(sensorCtx.name, 'Sensor reading finished')
    log(sensorCtx.name, `Reading counter #${myDHTSensor.getCounter()}`)
    log(sensorCtx.name, `Reading time was ${sensorCtx.getReadingTime() / 1000}s`)
    next()
})

myDHTSensor.use(influxMiddleware)
    .setInterval(5000, true)
    .setLimit(2)
    .run()
