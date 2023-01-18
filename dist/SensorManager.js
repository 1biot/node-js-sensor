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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SensorManager = void 0;
class SensorManager {
    constructor(sensor) {
        this.fireAtStart = false;
        this.counter = 0;
        this.sensor = sensor;
        if (!this.sensor.isInitialized()) {
            this.sensor.init();
        }
        this.sensor.on('finish', () => {
            this.execute().catch(console.log);
        });
        this.middlewares = [];
    }
    setTimeout(timeout) {
        this.timeout = timeout;
        return this;
    }
    setInterval(interval, fireAtStart = false) {
        this.fireAtStart = fireAtStart;
        this.interval = interval;
        return this;
    }
    setLimit(limit) {
        this.limit = limit;
        return this;
    }
    use(...middleware) {
        this.middlewares.push(...middleware);
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
        if (this.fireAtStart) {
            setImmediate(() => {
                this.runOnce().catch(console.log);
            });
        }
        this.internalInterval = setInterval(() => {
            this.runOnce().catch(console.log);
        }, this.interval);
        if (typeof this.timeout !== 'undefined') {
            setTimeout(() => {
                this.stop();
            }, this.timeout);
        }
        return 0;
    }
    runOnce() {
        this.counter++;
        if (typeof this.limit !== 'undefined' && this.counter > this.limit) {
            return new Promise((resolve, reject) => {
                this.stop();
                reject(`[${this.sensor.name}] [ERROR] Limit occurred`);
            });
        }
        return this.sensor.read();
    }
    stop() {
        if (typeof this.internalInterval !== 'undefined') {
            clearInterval(this.internalInterval);
        }
    }
    getCounter() {
        return this.counter;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            let prevIndex = -1;
            const middlewares = this.middlewares;
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
