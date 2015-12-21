var BusinessTime = require('./lib/BusinessTime');

exports.createInstance = function(moment, workingHours){

    return new BusinessTime(moment, workingHours);

}

exports.BusinessTime = BusinessTime;