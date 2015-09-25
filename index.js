var BusinessTime = require('./lib/BusinessTime');

exports.createInstance = function(workingHours, moment){

    return new BusinessTime(workingHours, moment);

}

exports.BusinessTime = BusinessTime;