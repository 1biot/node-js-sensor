"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Sensor_state, _Sensor_initialized, _Sensor_readStart, _Sensor_readFinish, _Sensor_lastReading;
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
        _Sensor_state.set(this, SENSOR_STATE.OFF);
        _Sensor_initialized.set(this, void 0);
        _Sensor_readStart.set(this, void 0);
        _Sensor_readFinish.set(this, void 0);
        _Sensor_lastReading.set(this, void 0);
        let sensorName;
        if (typeof options === 'string') {
            sensorName = options;
        }
        else if (typeof options === 'object') {
            sensorName = options === null || options === void 0 ? void 0 : options.name;
        }
        if (typeof sensorName === 'undefined') {
            throw Error('Could not resolve sensor name');
        }
        this.name = sensorName;
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
        __classPrivateFieldSet(this, _Sensor_state, SENSOR_STATE.INIT, "f");
        this.emit('init', this);
        return this;
    }
    setInitialized() {
        __classPrivateFieldSet(this, _Sensor_initialized, new Date(), "f");
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
            __classPrivateFieldSet(this, _Sensor_state, SENSOR_STATE.READ, "f");
            __classPrivateFieldSet(this, _Sensor_readStart, new Date(), "f");
            this.emit('read', this);
            return resolve(this);
        });
    }
    setLastReadingTime() {
        __classPrivateFieldSet(this, _Sensor_lastReading, new Date(), "f");
        return this;
    }
    getLastReadingTime() {
        return __classPrivateFieldGet(this, _Sensor_lastReading, "f");
    }
    finish() {
        __classPrivateFieldSet(this, _Sensor_readFinish, new Date(), "f");
        __classPrivateFieldSet(this, _Sensor_state, SENSOR_STATE.FINISH, "f");
        this.emit('finish', this);
    }
    hasState(state) {
        return __classPrivateFieldGet(this, _Sensor_state, "f") === state;
    }
    /**
     * @deprecated
     */
    isActualRead(interval) {
        if (typeof interval === 'undefined') {
            return true;
        }
        if (typeof __classPrivateFieldGet(this, _Sensor_lastReading, "f") === 'undefined') {
            return false;
        }
        let actualDateTime = new Date();
        let diff = actualDateTime.getTime() - __classPrivateFieldGet(this, _Sensor_lastReading, "f").getTime();
        return diff <= interval;
    }
    getReadingTime() {
        if (typeof __classPrivateFieldGet(this, _Sensor_readStart, "f") === 'undefined') {
            return null;
        }
        if (typeof __classPrivateFieldGet(this, _Sensor_readFinish, "f") === 'undefined') {
            return null;
        }
        return __classPrivateFieldGet(this, _Sensor_readFinish, "f").getTime() - __classPrivateFieldGet(this, _Sensor_readStart, "f").getTime();
    }
    isInitialized() {
        return typeof __classPrivateFieldGet(this, _Sensor_initialized, "f") !== 'undefined';
    }
}
exports.Sensor = Sensor;
_Sensor_state = new WeakMap(), _Sensor_initialized = new WeakMap(), _Sensor_readStart = new WeakMap(), _Sensor_readFinish = new WeakMap(), _Sensor_lastReading = new WeakMap();
