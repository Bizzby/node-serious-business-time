var BusinessTime = require('./lib/BusinessTime');

exports.createInstance = function(moment, workingHours, holidays){

    return new BusinessTime(moment, workingHours, holidays);

}

exports.BusinessTime = BusinessTime;