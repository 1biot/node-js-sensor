# node-js-sensor

[![Latest Version on NPM](https://img.shields.io/npm/v/node-js-sensor.svg?style=flat-square)](https://npmjs.com/package/:package_name)

Node-Js-Sensor is universal implementation interface for any sensor. It is event-driven object.
Including the manager where you can set the timeout, intervals and etc. Manager implementing middleware after successfully
readings the sensor.

## Install

```bash
npm i node-js-sensor
```

## API
### Sensor.js
Is event-driven object offering base events and adding listeners for runs the sensor reading
#### constructor(options, sensorOptions)
- _**options**_ - include only parameter `name` only for now.
- _**sensorOptions**_ - are custom options for future implemented sensor. It is not required

#### addData(name, unit): self
- Adds data object to the sensor which will you use for future purposes. It is create object with `name`, `unit` and `value` properties
- _**name**_ - Human name of measured value as like `Temperature`
- _**unit**_ - Unit of measured value as like `°C`
#### init(): self
- This method need to be called first before read() is called. It fires event `init`

#### read(): Promise
- This method returns `Promise` which check if sensor is initialized, has defined any data and check if actual reading of the sensor is not concurrency reads from past. Finally fire event `read` where you do your concrete measuring

#### setLastReadingTime(): self
- This public method is used for record last measuring time

#### getLastReadingTime(): Date
- return last reading time

#### finish(): void
- call this method after Sensor reading, it is fire event `finish`. SensorManager listening on this event for running his middlewares

#### hasState(state): bool
- this method returns if Sensor is at state
- _**state**_ - one of defined states
```js
const SENSOR_STATE = {
    OFF: 0,
    INIT: 1,
    READ: 3,
    FINISH: 4
}
```

#### getReadingTime(): ?int
- return how long was from fire event `read` and before fire event `finish`

#### getSensorSettings(): object
- return customer sensor settings what you need and sets on the beginning

#### isInitialized(): bool
- return when you call `initialize()` method

### Usage Sensor.js
#### Sync usage
```js
const NodeJsSensor = require('node-js-sensor');
const sensor = new NodeJsSensor.Sensor({
    name: 'My Custom Sensor'
})

sensor.addData('Temperature', '°C') // data[0]
sensor.addData('Humidity', '%') // data[1]

sensor.on('init', function(sensorCtx) {
    console.log(`[${sensorCtx.name}] Sensor initialized`)
})

sensor.on('read', (sensorCtx) => {
    console.log(`[${sensorCtx.name}] Start reading data ...`)

    sensorCtx.data[0].value = (Math.random() * 50).toFixed(2)
    sensorCtx.data[1].value = (Math.random() * 100).toFixed(2)

    console.log(`[${sensorCtx.name}] Reading data finished`)
    console.log(`[${sensorCtx.name}] [${sensorCtx.data[0].name}] ${sensorCtx.data[0].value}${sensorCtx.data[0].unit}`)
    console.log(`[${sensorCtx.name}] [${sensorCtx.data[1].name}] ${sensorCtx.data[1].value}${sensorCtx.data[1].unit}`)
})

sensor.init()
    .read()
    .catch(console.log)
```

#### Async usage

```js
const NodeJsSensor = require('node-js-sensor');
// async receiving the data
const getFakeData = function() {
    return new Promise((resolve, reject) => {
        setTimeout(function() {
            resolve({
                temperature: (Math.random() * 50).toFixed(2),
                humidity: (Math.random() * 100).toFixed(2)
            })
        }, 5000)
    })
}

const sensor = new NodeJsSensor.Sensor({
    name: 'My Custom Sensor'
})

sensor.addData('Temperature', '°C') // data[0]
sensor.addData('Humidity', '%') // data[1]

sensor.on('init', function(sensorCtx) {
    console.log(`[${sensorCtx.name}] Sensor initialized`)
})

sensor.on('read', async (sensorCtx) => {
    return new Promise((resolve, reject) => {
        console.log(`[${sensorCtx.name}] Start reading data ...`)

        getFakeData().then(fakeData => {
            sensorCtx.setLastReadingTime()
            
            sensorCtx.data[0].value = fakeData.temperature
            sensorCtx.data[1].value = fakeData.humidity

            sensorCtx.finish()
            resolve()
        }).catch(err => {
            sensorCtx.finish()
            reject(err)
        })
    })
})

sensor.on('finish', function(sensorCtx){
    console.log(`[${sensorCtx.name}] Reading data finished`)
    console.log(`[${sensorCtx.name}] [${sensorCtx.data[0].name}] ${sensorCtx.data[0].value}${sensorCtx.data[0].unit}`)
    console.log(`[${sensorCtx.name}] [${sensorCtx.data[1].name}] ${sensorCtx.data[1].value}${sensorCtx.data[1].unit}`)
})

sensor.init()
    .read()
    .catch(console.log)
```

#### Output:
```bash
> node-js-sensor@1.0.4 example-basic
> node examples/basic/index.js

[My Custom Sensor] Sensor initialized
[My Custom Sensor] Start reading data ...
[My Custom Sensor] Reading data finished
[My Custom Sensor] [Temperature] 48.28°C
[My Custom Sensor] [Humidity] 41.68%
```

### SensorManager.js
Sensor manager is using the class Sensor for repeatedly measuring of our sensor. This class knows to use the middlewares for next operations after reading the sensor data.
Middleware are runs when event `finish` is fired

#### constructor(Sensor)
- using the Sensor object as parameter

#### setTimeout(timeout): self
- sets when our readings is finished

#### setInterval(interval, fireAtStart = false): self
- first parameter is classic interval when our reading is repeated
- second parameter allows the first run at immediately

#### setLimit(limit): self
- allows only concrete runs in loop

#### use(function(Sensor, next){}): self
- add middleware which runs after sensor finished reading the data. You can add any middleware you want. You can add middleware for echo, alerting, saving to DB and etc. Your imaginations is your limit ;-)

#### run(): void
- runs the measuring in the loop

#### runOnce(): Promise
- runs one iteration of our cycle

#### stop(): void
- this method stops the manager

#### getCounter(): int
- returns how many cycles runs

#### execute(): void
- execute added middlewares

### Usage SensorManager.js
```js
sensor.addData('Temperature', '°C') // data[0]
sensor.addData('Humidity', '%') // data[1]

sensor.on('init', function(sensorCtx) {
    console.log(`[${sensorCtx.name}] Sensor initialized`)
})

sensor.on('read', (sensorCtx) => {
    console.log(`[${sensorCtx.name}] Start reading data ...`)

    sensorCtx.data[0].value = (Math.random() * 50).toFixed(2)
    sensorCtx.data[1].value = (Math.random() * 100).toFixed(2)

    sensorCtx.setLastReadingTime()
    sensorCtx.finish()
})

sensor.on('finish', function(sensorCtx){
    console.log(`[${sensorCtx.name}] Reading data finished`)
    console.log(`[${sensorCtx.name}] [${sensorCtx.data[0].name}] ${sensorCtx.data[0].value}${sensorCtx.data[0].unit}`)
    console.log(`[${sensorCtx.name}] [${sensorCtx.data[1].name}] ${sensorCtx.data[1].value}${sensorCtx.data[1].unit}`)
})

const sensorManager = new SensorManager(sensor)

sensorManager.setInterval(2000) // repeat every 2s
    .setTimeout(6000) // for 6s
    .setLimit(2)
    .run()
```

Or you can use setInterval() like this:

```js
// repeat every 2s and start immediately
sensorManager.setInterval(2000, true)
    .setTimeout(6000)
```

#### Adding middleware to the SensorManager

Every middleware could receive 2 parameters. First is our Sensor and next() callback

```js
...
// middleware for temperature
sensorManager.use(function(sensorCtx, next){
    console.log(`[${sensorCtx.name}] [${sensorCtx.data[0].name}] ${sensorCtx.data[0].value}${sensorCtx.data[0].unit}`)
    next()
})

// middleware for humidity
sensorManager.use(function(sensorCtx) {
    console.log(`[${sensorCtx.name}] [${sensorCtx.data[1].name}] ${sensorCtx.data[1].value}${sensorCtx.data[1].unit}`)
})

// SensorManager runs
sensorManager.setInterval(2000)
    .setTimeout(10000)
    .run()
```

#### Output:
```bash
> node-js-sensor@1.0.4 example-full
> node examples/full/index.js

[My Custom Sensor] Sensor initialized
[My Custom Sensor] Start reading data ...
[My Custom Sensor] Sensor reading finished
[My Custom Sensor] [Temperature] 5.14°C
[My Custom Sensor] [Humidity] 8.86%
[My Custom Sensor] Sensor middleware are finished
[My Custom Sensor] Start reading data ...
[My Custom Sensor] Sensor reading finished
[My Custom Sensor] [Temperature] 19.09°C
[My Custom Sensor] [Humidity] 29.50%
[My Custom Sensor] Sensor middleware are finished
```

## Testing

``` bash
$ npm run test
```

## Credits

- [1biot](https://github.com/1biot)
