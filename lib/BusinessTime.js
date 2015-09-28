module.exports = BusinessTime;

function BusinessTime(workingHours, moment) {

    //TODO: maybe load up some default
    this._workingHours = workingHours;
    //TODO: we just have so we can use it's normalizer....
    this._moment = moment;

}

/**
 * class "internal methods"
 */

/**
 * 
 * @param {string} operation  'add' or 'subtract'
 * @param {[type]} days    number of days
 * @param {[type]} date        the date to manipulate
 */
BusinessTime.prototype._addOrSubtractDays = function addOrSubtractDays(operation, days, date) {

    while (days) {
        date[operation](1, 'day');
        if (this.isWorkingDay(date)) {
            days--;
        }
    }
    return date;
}


BusinessTime.prototype._addWorkingTime = function addWorkingTime(date, duration, unit){

    if (typeof unit !== 'string') {
        throw new Error('unit must be defined');
    }
    if (typeof duration !== 'number') {
        throw new Error('duration must be defined');
    }

    if (unit === 'day') {
        date = this._addOrSubtractDays('add', duration, date); //TODO do this later
    } else if (unit) {
        date = this._addUnit(date, duration, unit); // we follow this path generally...
    }    

}

BusinessTime.prototype._addUnit = function addUnit(date, duration, unit){

    if (!this.isWorkingTime(date)) {
        date = this.nextWorkingTime(date);
    }

    var then;
    var next;
    var diff;

    while (duration > 0) {
        then = date.clone().add(duration, unit);
        if (this.isWorkingTime(then)) {
            date = date.add(duration, unit);
            duration = 0;
        } else {
            next = this.nextWorkingTime(then);
            diff = then.diff(this.openingTimes(date)[1], unit, true);
            date = next;
            duration = diff;
        }
    }
    return date;    

}

BusinessTime.prototype._subtractUnit = function subtractUnit(date, duration, unit) {

    if (!this.isWorkingTime(date)) {
        date = this.lastWorkingTime(date);
    }

    var then;
    var next;
    var diff;

    while (duration > 0) {
        then = date.clone().subtract(duration, unit);
        if (this.isWorkingTime(then)) {
            date = date.subtract(duration, unit);
            duration = 0;
        } else {
            next = this.lastWorkingTime(then);
            diff = then.diff(this.openingTimes(date)[0], unit, true);
            date = next;
            duration = -diff;
        }
    }
    return date;
}

/**
 * class "Public" functions
 */

BusinessTime.prototype.addWorkingTime = function add(date, duration, unit) {

    //add this somewhere else
    unit = this._moment.normalizeUnits(unit);

    if (unit === 'day') {
        date = this._addOrSubtractDays('add', duration, date);
    } else if (unit) {
        date = this._addUnit(date, duration, unit);
    }
    return date;
}

BusinessTime.prototype.subtractWorkingTime = function subtract(date, duration, unit) {

    unit = this._moment.normalizeUnits(unit);

    if (unit === 'day') {
        date = this._addOrSubtractDays('subtract', duration, date);
    } else if (unit) {
        date = this._subtractUnit(date, duration, unit);
    }
    return date;
}

BusinessTime.prototype.isBusinessDay = function isWorkingDay(date){
    return !!this._workingHours[date.day()] && !this.isHoliday(date);
}

BusinessTime.prototype.isWorkingDay = BusinessTime.prototype.isBusinessDay


BusinessTime.prototype.isWorkingTime = function isWorkingTime(date){

    var openingHours = this.openingTimes(date);

    if (!openingHours) {
        return false;
    } else {
        return date.isAfter(openingHours[0]) && date.isBefore(openingHours[1]);
    }
}

BusinessTime.prototype.isHoliday = function isHoliday(date) {
    //TODO: add logic :-)
    return false
};

BusinessTime.prototype.nextWorkingDay = function nextWorkingDay(date){

        date = date.clone();
        date = date.add(1, 'day');
        while (!this.isWorkingDay(date)) {
            date = date.add(1, 'day');
        }
        return date;

}

BusinessTime.prototype.lastWorkingDay = function(date) {

        date = date.clone();
        date = date.subtract(1, 'day');
        while (!this.isWorkingDay(date)) {
            date = date.subtract(1, 'day');
        }
        return date;

};

BusinessTime.prototype.nextWorkingTime = function nextWorkingTime(date){

    var workingHoursForDate = this.openingTimes(date);

    if (this.isWorkingDay(date)) {
        if (date.isBefore(workingHoursForDate[0])) {
            return workingHoursForDate[0];
        } else if (date.isAfter(workingHoursForDate[1])) {
            return this.openingTimes(this.nextWorkingDay(date))[0];
        } else {
            return date.clone();
        }
    } else {
        return this.openingTimes(this.nextWorkingDay(date))[0];
    }

}

BusinessTime.prototype.lastWorkingTime = function(date) {

    var workingHoursForDate = this.openingTimes(date);

    if (this.isWorkingDay(date)) {
        if (date.isAfter(workingHoursForDate[1])) {
            return workingHoursForDate[1];
        } else if (date.isBefore(workingHoursForDate[0])) {
            return this.openingTimes(this.lastWorkingDay(date))[1];
        } else {
            return date.clone();
        }
    } else {
        return this.openingTimes(this.lastWorkingDay(date))[1];
    }


};


BusinessTime.prototype.workingDiff = function(date, comparator, unit, detail) {

        unit = unit || 'milliseconds';
        unit = this._moment.normalizeUnits(unit);

        if (['year', 'month', 'week'].indexOf(unit) > -1) {
            return date.diff(comparator, unit, detail);
        }

        var from; 
        var to; 
        var diff = 0; 
        var multiplier = 1;

        if (date.isAfter(comparator)) {
            to = date.clone();
            from = comparator.clone();
            multiplier = -1;
        } else {
            to = comparator.clone();
            from = date.clone();
        }

        if (!this.isWorkingTime(from)) {
            from = this.nextWorkingTime(from);
        }
        if (!this.isWorkingTime(to)) {
            to = this.lastWorkingTime(to);
        }

        while(from.format('L') !== to.format('L')) {
            if (unit === 'day') {
                diff++;
            } else {
                diff += from.diff(this.openingTimes(from)[1], unit, true);
            }
            from = this.openingTimes(this.nextWorkingDay(from))[0];
        }

        if (unit === 'day') {
            diff++;
        } else {
            diff += from.diff(to, unit, true);
        }

        if(!detail) {
            diff = diff < 0 ? Math.ceil(diff) : Math.floor(diff);
        }

        return multiplier * diff;

};

BusinessTime.prototype.openingTimes = function openingTimes(date){

    if (!this.isWorkingDay(date)) {
        return null;
    }

    return this._workingHours[date.day()].map(_mapWorkingHoursToMoments);

    function _mapWorkingHoursToMoments(time){
        var timeParts = time.split(':');
        var _d = date.clone();
        _d.hours(timeParts[0]);
        _d.minutes(timeParts[1] || 0);
        _d.seconds(timeParts[2] || 0);
        _d.milliseconds(0);
        return _d;  
    }

}


/**
 * internal helpers / creators
 */
function copy(from, to) {
    ['year', 'month', 'date', 'hour', 'minute', 'second', 'millisecond'].forEach(function (unit) {
        to.set(unit, from.get(unit));
    });
    return to;
}

