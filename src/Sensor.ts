import { EventEmitter } from 'events'

export interface SensorOptions {
    name: string
}

export interface SensorData {
    name: string
    unit: string
    value?: number
}

export enum SENSOR_STATE {
    OFF = 0,
    INIT = 1,
    READ = 3,
    FINISH = 4
}

/** Class represents dummy sensor */
export class Sensor extends EventEmitter {

    readonly name: string
    data: Map<string, SensorData>

    #state = SENSOR_STATE.OFF
    #initialized?: Date
    #readStart?: Date
    #readFinish?: Date
    #lastReading?: Date

    constructor(options: string | SensorOptions)
    {
        super()

        let sensorName: string | undefined
        if (typeof options === 'string') {
            sensorName = options
        } else if (typeof options === 'object') {
            sensorName = options?.name
        }

        if (typeof sensorName === 'undefined') {
            throw Error('Could not resolve sensor name')
        }

        this.name = sensorName
        this.data = new Map<string, SensorData>();
    }

    addData(name: string, unit: string): this
    {
        const sensorData: SensorData = {
            name: name,
            unit: unit,
            value: undefined
        }

        this.data.set(name, sensorData)
        return this
    }

    init(): this
    {
        this.#state = SENSOR_STATE.INIT
        this.emit('init', this)
        return this
    }

    setInitialized()
    {
        this.#initialized = new Date()
    }

    read(): Promise<Sensor>
    {
        return new Promise((resolve, reject) => {
            if (!this.isInitialized()) {
                return reject(Error(`Sensor "${this.name}" is not initialized`))
            }

            if (!this.data.size) {
                return reject(Error(`Sensor "${this.name}" has no data defined`))
            }

            if (!this.hasState(SENSOR_STATE.INIT) && !this.hasState(SENSOR_STATE.FINISH)) {
                return reject(Error(`Sensor "${this.name}" is still reading or not initialized`))
            }

            this.#state = SENSOR_STATE.READ
            this.#readStart = new Date()
            this.emit('read', this)
            return resolve(this)
        })
    }

    setLastReadingTime(): Sensor
    {
        this.#lastReading = new Date()
        return this
    }

    getLastReadingTime(): Date | undefined
    {
        return this.#lastReading
    }

    finish(): void
    {
        this.#readFinish = new Date()
        this.#state = SENSOR_STATE.FINISH
        this.emit('finish', this)
    }

    hasState(state: SENSOR_STATE): boolean
    {
        return this.#state === state
    }

    /**
     * @deprecated
     */
    isActualRead(interval?: number): boolean
    {
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

    getReadingTime(): number | null
    {
        if (typeof this.#readStart === 'undefined') {
            return null
        }

        if (typeof this.#readFinish === 'undefined') {
            return null
        }

        return this.#readFinish.getTime() - this.#readStart.getTime();
    }

    isInitialized(): boolean
    {
        return typeof this.#initialized !== 'undefined'
    }
}
