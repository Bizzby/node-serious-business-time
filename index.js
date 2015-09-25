var BusinessTime = require('./lib/BusinessTime');

exports.createInstance = function(workingHours){

    return new BusinessTime(workingHours);

}

exports.BusinessTime = BusinessTime;