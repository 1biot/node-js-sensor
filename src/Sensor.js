#!/usr/bin/env node
'use strict';

const { EventEmitter } = require('events')
const SENSOR_STATE = {
    OFF: 0,
    INIT: 1,
    READ: 3,
    FINISH: 4
}

/** Class represents dummy sensor */
class Sensor extends EventEmitter {

    name
    data = []

    #state = SENSOR_STATE.OFF
    #sensorSettings = {}
    #initialized
    #readStart
    #readFinish
    #lastReading

    /**
     * Create a sensor.
     * @param {Object} options - Base settings of the sensor
     * @param {Object} sensorSettings - Settings for real sensor
     * @param {string} options.name - The name of the sensor.
     */
    constructor(options, sensorSettings) {
        super()

        if (typeof options.name === 'undefined') {
            throw 'Sensor has no name'
        }

        this.name = options.name

        if (typeof sensorSettings !== 'undefined') {
            this.#sensorSettings = sensorSettings
        }
    }

    /**
     * @param {string} name
     * @param {string} unit
     * @returns Sensor
     */
    addData(name, unit) {
        this.data.push({
            name: name,
            unit: unit,
            value: null
        })

        return this
    }

    /**
     * @returns Sensor
     */
    init() {
        this.#initialized = new Date()
        this.emit('init', this)
        this.#state = SENSOR_STATE.INIT
        return this
    }

    /**
     * @return {Promise} Promise object fire event
     */
    read() {
        return new Promise((resolve, reject) => {
            if (!this.#initialized) {
                return reject(Error(`Sensor "${this.name}" is not initialized`))
            }

            if (!this.data.length) {
                return reject(Error(`Sensor "${this.name}" has no data defined`))
            }

            if (this.#state !== SENSOR_STATE.INIT && this.#state !== SENSOR_STATE.FINISH) {
                return reject(Error(`Sensor "${this.name}" is still reading or not initialized`))
            }

            this.#state = SENSOR_STATE.READ
            this.#readStart = new Date()
            this.emit('read', this)
            return resolve(this)
        })
    }

    setLastReadingTime() {
        this.#lastReading = new Date()
        return this
    }

    getLastReadingTime() {
        return this.#lastReading
    }

    finish() {
        this.#readFinish = new Date()
        this.#state = SENSOR_STATE.FINISH
        this.emit('finish', this)
    }

    /**
     * @param {number} state
     */
    hasState(state) {
        return this.#state === state
    }

    /**
     * @deprecated
     * @param {number} interval
     * @returns boolean
     */
    isActualRead(interval) {
        if (typeof interval === 'undefined') {
            return true;
        }

        if (typeof this.#lastReading === 'undefined') {
            return false
        }

        let actualDateTime = new Date();
        let diff = actualDateTime.getTime() - this.#lastReading.getTime();

        return diff <= interval
    }

    /**
     * @returns null|int
     */
    getReadingTime() {
        if (typeof this.#readStart === 'undefined') {
            return null
        }

        if (typeof this.#readFinish === 'undefined') {
            return null
        }

        return this.#readFinish.getTime() - this.#readStart.getTime();
    }

    getSensorSettings() {
        return this.#sensorSettings
    }

    /**
     * @returns boolean
     */
    isInitialized() {
        return typeof this.#initialized !== 'undefined'
    }
}

module.exports = Sensor
