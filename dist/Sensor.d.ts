/// <reference types="node" />
import { EventEmitter } from 'events';
export interface SensorOptions {
    name: string;
}
export interface SensorData {
    name: string;
    unit: string;
    value?: number;
}
export declare enum SENSOR_STATE {
    OFF = 0,
    INIT = 1,
    READ = 3,
    FINISH = 4
}
/** Class represents dummy sensor */
export declare class Sensor extends EventEmitter {
    #private;
    readonly name: string;
    data: Map<string, SensorData>;
    constructor(options: string | SensorOptions);
    addData(name: string, unit: string): this;
    init(): this;
    setInitialized(): void;
    read(): Promise<Sensor>;
    setLastReadingTime(): Sensor;
    getLastReadingTime(): Date | undefined;
    finish(): void;
    hasState(state: SENSOR_STATE): boolean;
    /**
     * @deprecated
     */
    isActualRead(interval?: number): boolean;
    getReadingTime(): number | null;
    isInitialized(): boolean;
}
