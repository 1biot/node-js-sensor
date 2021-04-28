#!/usr/bin/env node
'use strict';

const Sensor = require('./Sensor')

class SensorManager {

    sensor
    timeout
    interval
    limit

    #fireAtStart = false
    #counter = 0
    #internalInterval
    #middlewares = []

    /**
     * @param {Sensor} sensor
     */
    constructor(sensor) {
        if (
            typeof sensor.init !== 'function'
            || typeof sensor.read !== 'function'
            || typeof sensor.finish !== 'function'
            || typeof sensor.addData !== 'function'
            || typeof sensor.hasState !== 'function'
        ) {
            throw 'Included object is not type of Sensor'
        }

        this.sensor = sensor
        if (!this.sensor.isInitialized()) {
            this.sensor.init()
        }

        this.sensor.on('finish', () => {
            this.execute().catch(console.log)
        })
    }

    /**
     * @param {number} timeout
     */
    setTimeout(timeout) {
        this.timeout = timeout
        return this
    }

    /**
     * @param {number} interval
     * * @param {boolean} fireAtStart
     */
    setInterval(interval, fireAtStart = false) {
        this.#fireAtStart = fireAtStart
        this.interval = interval
        return this
    }

    /**
     * @param {number} limit
     */
    setLimit(limit) {
        this.limit = limit
        return this
    }

    /**
     * @param {((function(...[*]=))|*[])[]} middleware
     */
    use(...middleware) {
        this.#middlewares.push(...middleware)
        return this
    }

    run() {
        if (typeof this.interval === 'undefined') {
            if (typeof this.timeout === 'undefined') {
                setImmediate(() => {
                    this.runOnce().catch(err => {
                        return 1
                    })
                })
            } else {
                setTimeout(() => {
                    this.runOnce().catch(err => {
                        return 1
                    })
                }, this.timeout)
            }

            return 0
        }

        if (this.#fireAtStart) {
            setImmediate(() => {
                this.runOnce().catch(console.log)
            })
        }

        this.#internalInterval = setInterval(() => {
            this.runOnce().catch(console.log)
        }, this.interval)

        if (typeof this.timeout !== 'undefined') {
            setTimeout(() => {
                this.stop()
            }, this.timeout)
        }

        return 0
    }

    runOnce() {
        this.#counter++
        if (typeof this.limit !== 'undefined' && this.#counter > this.limit) {
            return new Promise((resolve, reject) => {
                this.stop()
                reject(`[${this.sensor.name}] [ERROR] Limit occurred`)
            })
        }
        return this.sensor.read();
    }

    stop() {
        if (typeof this.#internalInterval !== 'undefined') {
            clearInterval(this.#internalInterval)
        }
    }

    getCounter() {
        return this.#counter
    }

    async execute() {
        let prevIndex = -1
        const middlewares = this.#middlewares
        const runner = async (index) => {
            if (index === prevIndex) {
                throw new Error('next() called multiple times')
            }
            prevIndex = index
            const middleware = middlewares[index]
            if (middleware) {
                await middleware(this.sensor, () => {
                    return runner(index + 1)
                })
            }
        }
        await runner(0)
    }
}

module.exports = SensorManager