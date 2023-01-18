import { Sensor } from './Sensor';
interface SensorCallback {
    (sensor: Sensor, next?: () => void): void;
}
export declare class SensorManager {
    sensor: Sensor;
    timeout?: number;
    interval?: number;
    limit?: number;
    private fireAtStart;
    private counter;
    private internalInterval?;
    private middlewares;
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
