## Design Concepts
1. Break down the system into individual components
2. Each component should work on their own, i.e. de-coupled and reusable
3. Unit test on each component
4. Glue the tested components into a worker flow
5. Worker should be scalable, i.e. able to run single/multiple instances in single/multiple containers

## Components
1. `Job Producer` - Put jobs to beanstalkd/tube, with payload and delay
2. `Job Consumer` - Reserve jobs from beanstalkd/tube, destroy/bury a job when necessary
3. `Forex` - Connect to a exchange rate service provider
4. `Mongo Data Store` - Save data to MongoDB
5. `Job Exit Strategy` - Make decision on when to exit a job
6. `Worker` - Glue to above components into a flow

## Configurations
* All external connectivity configurations are inside `lib/job_config.js`

* Worker specific settings are inside `worker.js`
```
const MAX_SUCCESS = 10;
const MAX_FAIL = 3;
const DELAY_SUCCESS = 60; // seconds
const DELAY_FAIL = 3; // seconds
```

## Testing

###### Unit tests
* Cover major requirements, without external connectivity
* Usually it should mock the underlying lib, here I just skip it

###### Integration tests
* Cover the connectivity to external services

## How to run
To start a consumer worker
```
node worker
```

To seed a job (by default USD:HKD)
```
node seed
```

To seed a job and specific currency pair
```
node seed USD HKD
```
Supported currency pairs. e.g.
```
EUR USD
USD JPY
GBP USD
NZD USD
USD HKD
```
Full list can be found inside the [FXCM XML] (http://rates.fxcm.com/RatesXML) with XPath `/Rates/Rate/Symbol`

No error occurs when seeding non-exist pair:
```
node seed ABC DEF
```
Instead, failure would be caught in the consumer worker when it tries to get the exchange rate.
So it is a convenient way to test the failure path.
e.g. Consumer worker logs
```
Waiting for a job...
Job received { job_id: '597',
  payload: { from: 'ABC', to: 'DEF', failAttempts: 2 } }
Try get Exchange Rate ABC:DEF
Fail to get Exchange Rate No value for the pair ABC:DEF
Job Attempts Success/Fail = undefined/3
Job failed with failAttempts=3
```

## Notes
* `grunt lint` is producing strange warnings. Anyway the codes follow the coding styles, guidelines, and JSDoc.

## External Services
* FXCM - Return Exchange Rates in XML: http://rates.fxcm.com/RatesXML
* MongoLab - MongoDB provider: http://www.mongolab.com/
