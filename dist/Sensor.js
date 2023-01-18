"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sensor = exports.SENSOR_STATE = void 0;
const events_1 = require("events");
var SENSOR_STATE;
(function (SENSOR_STATE) {
    SENSOR_STATE[SENSOR_STATE["OFF"] = 0] = "OFF";
    SENSOR_STATE[SENSOR_STATE["INIT"] = 1] = "INIT";
    SENSOR_STATE[SENSOR_STATE["READ"] = 3] = "READ";
    SENSOR_STATE[SENSOR_STATE["FINISH"] = 4] = "FINISH";
})(SENSOR_STATE = exports.SENSOR_STATE || (exports.SENSOR_STATE = {}));
/** Class represents dummy sensor */
class Sensor extends events_1.EventEmitter {
    constructor(options) {
        super();
        this.state = SENSOR_STATE.OFF;
        this.name = options.name;
        this.data = new Map();
    }
    addData(name, unit) {
        const sensorData = {
            name: name,
            unit: unit,
            value: undefined
        };
        this.data.set(name, sensorData);
        return this;
    }
    init() {
        this.state = SENSOR_STATE.INIT;
        this.emit('init', this);
        return this;
    }
    setInitialized() {
        this.initialized = new Date();
    }
    read() {
        return new Promise((resolve, reject) => {
            if (!this.isInitialized()) {
                return reject(Error(`Sensor "${this.name}" is not initialized`));
            }
            if (!this.data.size) {
                return reject(Error(`Sensor "${this.name}" has no data defined`));
            }
            if (!this.hasState(SENSOR_STATE.INIT) && !this.hasState(SENSOR_STATE.FINISH)) {
                return reject(Error(`Sensor "${this.name}" is still reading or not initialized`));
            }
            this.state = SENSOR_STATE.READ;
            this.readStart = new Date();
            this.emit('read', this);
            return resolve(this);
        });
    }
    setLastReadingTime() {
        this.lastReading = new Date();
        return this;
    }
    getLastReadingTime() {
        return this.lastReading;
    }
    finish() {
        this.readFinish = new Date();
        this.state = SENSOR_STATE.FINISH;
        this.emit('finish', this);
    }
    hasState(state) {
        return this.state === state;
    }
    /**
     * @deprecated
     */
    isActualRead(interval) {
        if (typeof interval === 'undefined') {
            return true;
        }
        if (typeof this.lastReading === 'undefined') {
            return false;
        }
        let actualDateTime = new Date();
        let diff = actualDateTime.getTime() - this.lastReading.getTime();
        return diff <= interval;
    }
    getReadingTime() {
        if (typeof this.readStart === 'undefined') {
            return null;
        }
        if (typeof this.readFinish === 'undefined') {
            return null;
        }
        return this.readFinish.getTime() - this.readStart.getTime();
    }
    isInitialized() {
        return typeof this.initialized !== 'undefined';
    }
}
exports.Sensor = Sensor;
