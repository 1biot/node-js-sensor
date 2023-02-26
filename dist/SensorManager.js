"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
var _SensorManager_fireAtStart, _SensorManager_counter, _SensorManager_internalInterval, _SensorManager_middlewares;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SensorManager = void 0;
class SensorManager {
    constructor(sensor) {
        _SensorManager_fireAtStart.set(this, false);
        _SensorManager_counter.set(this, 0);
        _SensorManager_internalInterval.set(this, void 0);
        _SensorManager_middlewares.set(this, []);
        this.sensor = sensor;
        if (!this.sensor.isInitialized()) {
            this.sensor.init();
        }
        this.sensor.on('finish', () => {
            this.execute().catch(console.log);
        });
    }
    setTimeout(timeout) {
        this.timeout = timeout;
        return this;
    }
    setInterval(interval, fireAtStart = false) {
        __classPrivateFieldSet(this, _SensorManager_fireAtStart, fireAtStart, "f");
        this.interval = interval;
        return this;
    }
    setLimit(limit) {
        this.limit = limit;
        return this;
    }
    use(...middleware) {
        __classPrivateFieldGet(this, _SensorManager_middlewares, "f").push(...middleware);
        return this;
    }
    run() {
        if (typeof this.interval === 'undefined') {
            if (typeof this.timeout === 'undefined') {
                setImmediate(() => {
                    this.runOnce().catch(err => {
                        return 1;
                    });
                });
            }
            else {
                setTimeout(() => {
                    this.runOnce().catch(err => {
                        return 1;
                    });
                }, this.timeout);
            }
            return 0;
        }
        if (__classPrivateFieldGet(this, _SensorManager_fireAtStart, "f")) {
            setImmediate(() => {
                this.runOnce().catch(console.log);
            });
        }
        __classPrivateFieldSet(this, _SensorManager_internalInterval, setInterval(() => {
            this.runOnce().catch(console.log);
        }, this.interval), "f");
        if (typeof this.timeout !== 'undefined') {
            setTimeout(() => {
                this.stop();
            }, this.timeout);
        }
        return 0;
    }
    runOnce() {
        var _a;
        __classPrivateFieldSet(this, _SensorManager_counter, (_a = __classPrivateFieldGet(this, _SensorManager_counter, "f"), _a++, _a), "f");
        if (typeof this.limit !== 'undefined' && __classPrivateFieldGet(this, _SensorManager_counter, "f") > this.limit) {
            return new Promise((resolve, reject) => {
                this.stop();
                reject(`[${this.sensor.name}] [ERROR] Limit occurred`);
            });
        }
        return this.sensor.read();
    }
    stop() {
        if (typeof __classPrivateFieldGet(this, _SensorManager_internalInterval, "f") !== 'undefined') {
            clearInterval(__classPrivateFieldGet(this, _SensorManager_internalInterval, "f"));
        }
    }
    getCounter() {
        return __classPrivateFieldGet(this, _SensorManager_counter, "f");
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            let prevIndex = -1;
            const middlewares = __classPrivateFieldGet(this, _SensorManager_middlewares, "f");
            const runner = (index) => __awaiter(this, void 0, void 0, function* () {
                if (index === prevIndex) {
                    throw new Error('next() called multiple times');
                }
                prevIndex = index;
                const middleware = middlewares[index];
                if (middleware) {
                    yield middleware(this.sensor, () => {
                        return runner(index + 1);
                    });
                }
            });
            yield runner(0);
        });
    }
}
exports.SensorManager = SensorManager;
_SensorManager_fireAtStart = new WeakMap(), _SensorManager_counter = new WeakMap(), _SensorManager_internalInterval = new WeakMap(), _SensorManager_middlewares = new WeakMap();
