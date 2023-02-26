import { Sensor } from './Sensor';
interface SensorCallback {
    (sensor: Sensor, next?: () => void): void;
}
export declare class SensorManager {
    #private;
    sensor: Sensor;
    timeout?: number;
    interval?: number;
    limit?: number;
    constructor(sensor: Sensor);
    setTimeout(timeout: number): this;
    setInterval(interval: number, fireAtStart?: boolean): this;
    setLimit(limit: number): this;
    use(...middleware: SensorCallback[]): this;
    run(): number;
    runOnce(): Promise<Sensor>;
    stop(): void;
    getCounter(): number;
    execute(): Promise<void>;
}
export {};
