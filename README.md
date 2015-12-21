# serious-business-time

Query and manipulate moment objects within the scope of business/working hours.
A re-organisation of `moment-business-time` such that global scope access to business hours etc 
is removed.

_WARNING:_ The docs maybe a little out of date!

In general, the library has been modified such that it no longer mutates/monkey-patches `moment` and
instead operates on `moment` instances instead.

## Install

```
npm install [--save] serious-business-time
```

## Usage

```
var SeriousBusinessTime = require('serious-business-time');
var moment = require('moment');

var workinghours = {
    0: null,
    1: ['09:00:00', '17:00:00'],
    2: ['09:00:00', '17:00:00'],
    3: ['09:00:00', '17:00:00'],
    4: ['09:00:00', '17:00:00'],
    5: ['09:00:00', '17:00:00'],
    6: null
}

var myBusinessTime = SeriousBusinessTime.createInstance(moment, workinghours);
```


## Methods


### `SeriousBusinessTime#isWorkingDay`

Returns: `Boolean`

Determines if the day of the current instance is a working day. Working days are defined as any day with working hours in the current locale.

#### Example:
```javascript
myBusinessTime.isWorkingDay(moment('2015-02-27'));
// true
myBusinessTime.isWorkingDay(moment('2015-02-28'));
// false
```

### `SeriousBusinessTime#isWorkingTime`

Returns: `Boolean`

Determines if the day and time of the current instance corresponds to during business hours as defined by the currnet locale.

#### Example:
```javascript
myBusinessTime.isWorkingTime(moment('2015-02-27T15:00:00');
// true
myBusinessTime.isWorkingTime(moment('2015-02-27T20:00:00'));
// false
```

### `SeriousBusinessTime#nextWorkingDay`

Returns: `moment`

Returns a new moment representing the next day considered to be a working day. The hours/minutes/seconds will be as for the source moment.

#### Example:
```javascript
myBusinessTime.nextWorkingDay((moment('2015-02-28T10:00:00Z'));
// Mon Mar 02 2015 10:00:00 GMT+0000
myBusinessTime.nextWorkingDay(moment('2015-02-28T20:00:00Z'));
// Mon Mar 02 2015 20:00:00 GMT+0000
```

### `SeriousBusinessTime#nextWorkingTime`

Returns: `moment`

Returns a new moment representing the start of the next day considered to be a working day.

#### Example:
```javascript
myBusinessTime.nextWorkingTime((moment('2015-02-28T10:00:00Z'));
// Mon Mar 02 2015 09:00:00 GMT+0000
myBusinessTime.nextWorkingTime(moment('2015-02-28T20:00:00Z'));
// Mon Mar 02 2015 09:00:00 GMT+0000
```

### `SeriousBusinessTime#lastWorkingDay`

Returns: `moment`

Returns a new moment representing the previous day considered to be a working day. The hours/minutes/seconds will be as for the source moment.

#### Example:
```javascript
myBusinessTime.lastWorkingDay(moment('2015-02-28T10:00:00Z'));
// Fri Feb 27 2015 10:00:00 GMT+0000
myBusinessTime.lastWorkingDay(moment('2015-02-28T20:00:00Z'));
// Fri Feb 27 2015 20:00:00 GMT+0000
```

### `SeriousBusinessTime#lastWorkingTime`

Returns: `moment`

Returns a new moment representing the end of the previous day considered to be a working day.

#### Example:
```javascript
myBusinessTime.lastWorkingTime(moment('2015-02-28T10:00:00Z'));
// Fri Feb 27 2015 17:00:00 GMT+0000
myBusinessTime.lastWorkingTime(moment('2015-02-28T20:00:00Z'));
// Fri Feb 27 2015 17:00:00 GMT+0000
```

### `SeriousBusinessTime#addWorkingTime`

Returns: `self`

Adds an amount of working time to a moment, modifying the original moment instance.

#### Example:
```javascript
myBusinessTime.addWorkingTime(moment('2015-02-27T10:00:00Z'), 5, 'hours');
// Fri Feb 27 2015 15:00:00 GMT+0000
myBusinessTime.addWorkingTime(moment('2015-02-28T10:00:00Z'), 5, 'hours');
// Mon Mar 02 2015 14:00:00 GMT+0000
myBusinessTime.addWorkingTime(moment('2015-02-27T10:00:00Z'), 30, 'minutes');
// Fri Feb 27 2015 10:30:00 GMT+0000

```

### `SeriousBusinessTime#subtractWorkingTime`

Returns: `self`

Adds an amount of working time to a moment, modifying the original moment instance.

#### Example:
```javascript
myBusinessTime.subtractWorkingTime(moment('2015-02-27T16:00:00Z'), 5, 'hours');
// Fri Feb 27 2015 11:00:00 GMT+0000
myBusinessTime.subtractWorkingTime(moment('2015-02-28T16:00:00Z'), 5, 'hours');
// Fri Feb 27 2015 12:00:00 GMT+0000
myBusinessTime.subtractWorkingTime(moment('2015-02-27T16:00:00Z'), 30, 'minutes');
// Fri Feb 27 2015 15:30:00 GMT+0000

```

### `SeriousBusinessTime#workingDiff`

Returns: `Number`

Calculates the difference between two moments, counting only working time. Arguments are as per [moment#diff](http://momentjs.com/docs/#/displaying/difference/)

#### Example:
```javascript
myBusinessTime.workingDiff(moment('2015-02-27T16:30:00Z'), moment('2015-02-26T12:00:00Z'), 'hours');
// 12
myBusinessTime.workingDiff(moment('2015-02-27T16:30:00Z'), moment('2015-02-26T12:00:00Z'), 'hours', true);
// 12.5
```

## Configuration

### Holidays

__NOT YET IMPLEMENTED__

Holidays which should not be considered as working days can be configured by passing them as locale information.

Example:

```javascript
moment.locale('en', {
    holidays: [
        '2015-05-04'
    ]
});
moment('2015-05-04').isWorkingDay() // false
```

Recurring holidays can also be set with wildcard parameters.

```javascript
moment.locale('en', {
    holidays: [
        '*-12-25'
    ]
});
moment('2015-12-25').isWorkingDay() // false
moment('2016-12-25').isWorkingDay() // false
moment('2017-12-25').isWorkingDay() // false
moment('2018-12-25').isWorkingDay() // false
```

## Running tests

```
npm test
```
