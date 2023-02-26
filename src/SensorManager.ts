import {Sensor} from './Sensor'

interface SensorCallback {
    (sensor: Sensor, next?: () => void): void;
}

export class SensorManager {

    sensor: Sensor
    timeout?: number
    interval?: number
    limit?: number

    #fireAtStart: boolean = false
    #counter: number = 0
    #internalInterval?: NodeJS.Timer
    readonly #middlewares: Array<SensorCallback> = []

    constructor(sensor: Sensor)
    {
        this.sensor = sensor
        if (!this.sensor.isInitialized()) {
            this.sensor.init()
        }

        this.sensor.on('finish', () => {
            this.execute().catch(console.log)
        })
    }

    setTimeout(timeout: number): this
    {
        this.timeout = timeout
        return this
    }

    setInterval(interval: number, fireAtStart: boolean = false): this
    {
        this.#fireAtStart = fireAtStart
        this.interval = interval
        return this
    }

    setLimit(limit: number): this
    {
        this.limit = limit
        return this
    }

    use(...middleware: SensorCallback[]): this
    {
        this.#middlewares.push(...middleware)
        return this
    }

    run(): number
    {
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

    runOnce(): Promise<Sensor>
    {
        this.#counter++
        if (typeof this.limit !== 'undefined' && this.#counter > this.limit) {
            return new Promise((resolve, reject) => {
                this.stop()
                reject(`[${this.sensor.name}] [ERROR] Limit occurred`)
            })
        }
        return this.sensor.read();
    }

    stop()
    {
        if (typeof this.#internalInterval !== 'undefined') {
            clearInterval(this.#internalInterval)
        }
    }

    getCounter(): number
    {
        return this.#counter
    }

    async execute() {
        let prevIndex = -1
        const middlewares = this.#middlewares
        const runner = async (index: number) => {
            if (index === prevIndex) {
                throw new Error('next() called multiple times')
            }
            prevIndex = index
            const middleware: SensorCallback = middlewares[index]
            if (middleware) {
                await middleware(this.sensor, () => {
                    return runner(index + 1)
                })
            }
        }
        await runner(0)
    }
}
