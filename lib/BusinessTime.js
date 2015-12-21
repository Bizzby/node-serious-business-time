module.exports = BusinessTime;

function BusinessTime(moment, workingHours) {

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

    date = date.clone();

    while (days) {
        date[operation](1, "day");
        if (this.isWorkingDay(date)) {
            days--;
        }
    }
    return date;
};

// does not mutate date object, returns new date object
BusinessTime.prototype._addUnit = function addUnit(date, duration, unit){

    date = date.clone();

    if (!this.isWorkingTime(date)) {
        date = this.nextWorkingTime(date);
    }

    var then;
    var next;
    var diff;
    var unitsOfDurationUntilClosingTime;
    var jump;

    while (duration > 0) {

        unitsOfDurationUntilClosingTime = this.openingTimes(date)[1].diff(date, unit);

        if( unitsOfDurationUntilClosingTime > duration ) {
            jump = duration;
        } else if (unitsOfDurationUntilClosingTime < 1) {
            jump = 1;
        } else {
            jump = unitsOfDurationUntilClosingTime;
        }

        then = date.clone().add(jump, unit);
        duration -= jump;

        if (this.isWorkingTime(then)) {
            date = date.add(jump, unit);
        } else {
            next = this.nextWorkingTime(then);
            diff = then.diff(this.openingTimes(date)[1], unit, true);
            date = next.add(diff, unit);
        }
    }
    return date;    

};

// does not mutate date object, returns new date object
BusinessTime.prototype._subtractUnit = function subtractUnit(date, duration, unit) {

    date = date.clone();

    if (!this.isWorkingTime(date)) {
        date = this.lastWorkingTime(date);
    }

    var then;
    var next;
    var diff;
    var unitsOfDurationAfterOpeningTime;
    var jump;

    while (duration > 0) {

        unitsOfDurationAfterOpeningTime = -this.openingTimes(date)[0].diff(date, unit);
        if( unitsOfDurationAfterOpeningTime > duration ) {
            jump = duration;
        } else if (unitsOfDurationAfterOpeningTime < 1) {
            jump = 1;
        } else {
            jump = unitsOfDurationAfterOpeningTime;
        }


        then = date.clone().subtract(jump, unit);
        duration -= jump;

        if (this.isWorkingTime(then)) {
            date = date.subtract(jump, unit);
        } else {
            next = this.lastWorkingTime(then);
            diff = then.diff(this.openingTimes(date)[0], unit, true);
            date = next.add(diff, unit);
        }
    }
    return date;
};

/**
 * class "Public" functions
 */

// does not mutate date, returns new date instance
BusinessTime.prototype.addWorkingTime = function add(date, duration, unit) {

    if (typeof duration !== "number") {
        throw new Error("duration must be defined");
    }
    if (typeof unit !== "string") {
        throw new Error("unit must be defined");
    }

    var normalizedUnit = this._moment.normalizeUnits(unit);

    if (normalizedUnit == null) {
        throw new Error("moment.normalizeUnits failed to normalize the unit supplied");
    }

    date = date.clone();

    if (normalizedUnit === "day") {
        date = this._addOrSubtractDays("add", duration, date);
    } else if (normalizedUnit) {
        date = this._addUnit(date, duration, normalizedUnit);
    }
    return date;
};

// does not mutate date, returns new date instance
BusinessTime.prototype.subtractWorkingTime = function subtract(date, duration, unit) {

    if (typeof duration !== "number") {
        throw new Error("duration must be defined");
    }
    if (typeof unit !== "string") {
        throw new Error("unit must be defined");
    }

    var normalizedUnit = this._moment.normalizeUnits(unit);

    if (normalizedUnit == null) {
        throw new Error("moment.normalizeUnits failed to normalize the unit supplied");
    }

    date = date.clone();

    if (normalizedUnit === "day") {
        date = this._addOrSubtractDays("subtract", duration, date);
    } else if (normalizedUnit) {
        date = this._subtractUnit(date, duration, normalizedUnit);
    }
    return date;
};

// does not mutate date
BusinessTime.prototype.isBusinessDay = function isWorkingDay(date){
    //must have working hours for the day and not be a holiday
    // "!!" converts a non-boolean to a boolean, then inverts it
    return !!this._workingHours[date.day()] && !this.isHoliday(date);
};

BusinessTime.prototype.isWorkingDay = BusinessTime.prototype.isBusinessDay;

// does not mutate date
BusinessTime.prototype.isWorkingTime = function isWorkingTime(date){

    var openingHours = this.openingTimes(date);

    if (!openingHours) {
        return false;
    } else {
        return date.isAfter(openingHours[0]) && date.isBefore(openingHours[1]);
    }
};

BusinessTime.prototype.isHoliday = function isHoliday(date) {
    //TODO: add logic :-)
    date;
    return false;
};

// does not mutate date, returns new date object
BusinessTime.prototype.nextWorkingDay = function nextWorkingDay(date){

    date = date.clone();
    date = date.add(1, "day");
    while (!this.isWorkingDay(date)) {
        date = date.add(1, "day");
    }
    return date;

};

// should probably be previous working day
// does not mutate date object, returns new date object
BusinessTime.prototype.lastWorkingDay = function(date) {

    date = date.clone();
    date = date.subtract(1, "day");
    while (!this.isWorkingDay(date)) {
        date = date.subtract(1, "day");
    }
    return date;

};

//Going forwards in time, start from `date`, when is the next working time
// does not mutate date, returns new date object
BusinessTime.prototype.nextWorkingTime = function nextWorkingTime(date){

    var workingHoursForDate = this.openingTimes(date);

    if (workingHoursForDate != null) {
        //we have working hours for the current day, we are are a working day!
        if (date.isBefore(workingHoursForDate[0])) {
            // We are pre "working hours for the day"
            return workingHoursForDate[0];
        } else if (date.isAfter(workingHoursForDate[1])) {
            // We are after the "working hours for the day"
            return this.openingTimes(this.nextWorkingDay(date))[0];
        } else {
            // The current time is a working time.
            return date.clone();
        }
    } else {
        // today is not a working day
        return this.openingTimes(this.nextWorkingDay(date))[0];
    }

};
//should probably read as previousWorkingTime
// going backwards in time, starting from `date` when is the next working time
// does not mutate date, returns new date instance
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

    unit = unit || "milliseconds";
    unit = this._moment.normalizeUnits(unit);

    if (["year", "month", "week"].indexOf(unit) > -1) {
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

    while(from.format("L") !== to.format("L")) {
        if (unit === "day") {
            diff++;
        } else {
            diff += from.diff(this.openingTimes(from)[1], unit, true);
        }
        from = this.openingTimes(this.nextWorkingDay(from))[0];
    }

    if (unit === "day") {
        diff++;
    } else {
        diff += from.diff(to, unit, true);
    }

    if(!detail) {
        diff = diff < 0 ? Math.ceil(diff) : Math.floor(diff);
    }

    return multiplier * diff;

};
// does not mutate date, returns new date instances
BusinessTime.prototype.openingTimes = function openingTimes(date){

    if (!this.isWorkingDay(date)) {
        return null;
    }

    return this._workingHours[date.day()].map(_mapWorkingHoursToMoments);

    function _mapWorkingHoursToMoments(time){
        var timeParts = time.split(":");
        var _d = date.clone();
        _d.hours(timeParts[0]);
        _d.minutes(timeParts[1] || 0);
        _d.seconds(timeParts[2] || 0);
        _d.milliseconds(0);
        return _d;  
    }

};


/**
 * internal helpers / creators
 */

/*eslint-disable no-unused-vars */
function copy(from, to) {
    ["year", "month", "date", "hour", "minute", "second", "millisecond"].forEach(function (unit) {
        to.set(unit, from.get(unit));
    });
    return to;
}
/*eslint-enable no-unused-vars */
