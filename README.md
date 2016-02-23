## Design Concepts
---
1. Break down the system into individual components
2. Each component should work on their own, i.e. de-coupled and reusable
3. Unit test on each component
4. Glue the tested components into a worker flow
5. Worker should be scalable, i.e. able to run single/multiple instances in single/multiple containers

## Components
---
1. `Job Producer` - Connect to beanstalkd/tube and put a job, with payload and delay
2. `Job Consumer` - Connect to beanstalkd/tube and reserve a job, destroy a job when done
3. `Forex` - Connect to a service provider (e.g. xe.com) to retrieve exchange rate
4. `Mongo Data Store` - Connect to a MongoDB to save data
5. `Job Exit Strategy` - Make decision on when to exit a job
6. `Consumer Worker` - Glue to above components into a flow
7. `Seed` - Just create a data to initialize the flow

## Notes
---
* `grunt lint` is switched off in `npm test` while it generates strange warnings. Anyway the codes follow the coding styles, guidelines, and JSDoc.

## External Services
---
FXCM - Return Exchange Rates in XML: http://rates.fxcm.com/RatesXML
MongoLab - MongoDB provider: http://www.mongolab.com/

## Configurations
---
Configurations are inside here
```
lib/job_config.js
```


## How to run
---
To start a consumer worker
```
node consumer_worker
```

To seed a job (by default USD:HKD)
```
node seed
```

To seed a job and specific currency pair
```
node seed USD HKD
```
Supported currency pairs can be found in the XML http://rates.fxcm.com/RatesXML
XPath: /Rates/Rate/Symbol
e.g.
EURUSD
USDJPY
GBPUSD
NZDUSD
USDHKD

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