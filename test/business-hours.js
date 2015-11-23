var moment = require('moment');
var sbt = require('../');


describe('BusinessTime', function () {

    var now = '2015-02-26T10:12:34',
        weekend = '2015-02-28T10:13:00';

    var date = 'YYYY-MM-DD',
        time = 'HH:mm:ss.SSS',
        full = date + ' ' + time;

    //Really need to structure this differently...
    var workinghours = {
            0: null,
            1: ['09:00:00', '17:00:00'],
            2: ['09:00:00', '17:00:00'],
            3: ['09:00:00', '17:00:00'],
            4: ['09:00:00', '17:00:00'],
            5: ['09:00:00', '17:00:00'],
            6: null
        }

    var bizTime = sbt.createInstance(workinghours, moment);

    describe('isWorkingDay', function () {

        it('returns false on weekends by default', function () {
            bizTime.isWorkingDay(moment(weekend)).should.be.false;
        });

        it('returns true on weekdays by default', function () {
            bizTime.isWorkingDay(moment(now)).should.be.true;
        });

    });

    describe('isWorkingTime', function () {

        it('returns false on weekends by default', function () {
            bizTime.isWorkingTime(moment(weekend)).should.be.false;
        });

        it('returns true on weekdays by default', function () {
            bizTime.isWorkingTime(moment(now)).should.be.true;
        });

    });

    describe('nextWorkingDay', function () {

        it('returns the next working day', function () {
            bizTime.nextWorkingDay(moment(now)).format(date).should.equal('2015-02-27');
            bizTime.nextWorkingDay(moment(weekend)).format(date).should.equal('2015-03-02');
        });

    });

    describe('nextWorkingTime', function () {

        it('returns the start of the next working day if not a current working day', function () {
            bizTime.nextWorkingTime(moment(weekend)).format(full).should.equal('2015-03-02 09:00:00.000');
        });

        it('returns the start of the next working day if called after closing time on a working day', function () {
            bizTime.nextWorkingTime(moment('2015-02-26T17:30:00')).format(full).should.equal('2015-02-27 09:00:00.000');
        });

        it('returns the start of the working hours if called before opening time on a working day', function () {
            bizTime.nextWorkingTime(moment('2015-02-26T07:30:00')).format(full).should.equal('2015-02-26 09:00:00.000');
        });

        it('returns the current time and date if called during opening hours', function () {
            bizTime.nextWorkingTime(moment(now)).format(full).should.equal('2015-02-26 10:12:34.000');
        });

    });

    describe('addWorkingTime', function () {

        describe('adding days', function () {

            it('adds working days onto date', function () {
                bizTime.addWorkingTime( moment(now), 2, 'days').format(date).should.equal('2015-03-02');
                bizTime.addWorkingTime( moment(now), 10, 'days').format(date).should.equal('2015-03-12');
                bizTime.addWorkingTime( moment(now), 100, 'days').format(date).should.equal('2015-07-16');
            });

            it('handles singular as well as plural units', function () {
                bizTime.addWorkingTime( moment(now), 1, 'day').format(date).should.equal('2015-02-27');
            });

            it('if called on a non-business day then starts from the first business day', function () {
                bizTime.addWorkingTime( moment(weekend), 1, 'day').format(date).should.equal('2015-03-02');
            });

        });

        describe('adding hours', function () {

            it('adds working hours onto datetime within the same working day', function () {
                bizTime.addWorkingTime( moment(now), 2, 'hours').format(full).should.equal('2015-02-26 12:12:34.000');
            });

            it('handles singular as well as plural units', function () {
                bizTime.addWorkingTime( moment(now), 1, 'hour').format(full).should.equal('2015-02-26 11:12:34.000');
            });

            it('starts from opening time of next working day if called on a non-working day', function () {
                bizTime.addWorkingTime( moment(weekend), 2, 'hours').format(full).should.equal('2015-03-02 11:00:00.000');
            });

            it('handles running overnight', function () {
                bizTime.addWorkingTime( moment(now), 9, 'hours').format(full).should.equal('2015-02-27 11:12:34.000');
            });

            it('handles running over multiple nights', function () {
                bizTime.addWorkingTime( moment(now), 19, 'hours').format(full).should.equal('2015-03-02 13:12:34.000');
            });
            it('handles running over multiple weeks', function () {
                bizTime.addWorkingTime( moment(now), 100, 'hours').format(full).should.equal('2015-03-17 14:12:34.000');
            });

        });

        describe('adding minutes', function () {

            it('adds time simply if space within current working day', function () {
                bizTime.addWorkingTime(moment(now), 45, 'minutes').format(full).should.equal('2015-02-26 10:57:34.000');
            });

            it('starts from beginning of next working day if not called at an "open" time', function () {
                bizTime.addWorkingTime(moment(weekend), 45, 'minutes').format(full).should.equal('2015-03-02 09:45:00.000');
            });

            it('runs over to next day if insufficient space in current day', function () {
                bizTime.addWorkingTime(moment('2015-02-26T16:59:59.700'), 45, 'minutes').format(full).should.equal('2015-02-27 09:44:59.700');
            });

            it('can support values greater than 60', function () {
                bizTime.addWorkingTime(moment(now), 600, 'minutes').format(full).should.equal('2015-02-27 12:12:34.000');
            });

        });

        describe('adding seconds', function () {

            it('adds time simply if space within current working day', function () {
                bizTime.addWorkingTime(moment(now), 45, 'seconds').format(full).should.equal('2015-02-26 10:13:19.000');
            });

            it('starts from beginning of next working day if not called at an "open" time', function () {
                bizTime.addWorkingTime(moment(weekend), 45, 'seconds').format(full).should.equal('2015-03-02 09:00:45.000');
            });

            it('runs over to next day if insufficient space in current day', function () {
                bizTime.addWorkingTime(moment('2015-02-26T16:59:59.700'), 45, 'seconds').format(full).should.equal('2015-02-27 09:00:44.700');
            });

            it('can support values greater than 60', function () {
                bizTime.addWorkingTime(moment(now), 600, 'seconds').format(full).should.equal('2015-02-26 10:22:34.000');
            });

        });

        describe('adding milliseconds', function () {

            it('adds time simply if space within current working day', function () {
                bizTime.addWorkingTime(moment(now), 555, 'milliseconds').format(full).should.equal('2015-02-26 10:12:34.555');
            });

            it('starts from beginning of next working day if not called at an "open" time', function () {
                bizTime.addWorkingTime(moment(weekend), 555, 'milliseconds').format(full).should.equal('2015-03-02 09:00:00.555');
            });

            it('runs over to next day if insufficient space in current day', function () {
                bizTime.addWorkingTime(moment('2015-02-26T16:59:59.700'), 555, 'milliseconds').format(full).should.equal('2015-02-27 09:00:00.255');
            });

        });

        describe.skip('adding an unknown unit', function () {

            it('should return self', function () {
                moment(now).addWorkingTime(3, 'epochs').format(full).should.equal('2015-02-26 10:12:34.000');
            });

        });

    });

    describe('subtractWorkingTime', function () {

        var now = '2015-02-26T16:12:34',
            weekend = '2015-03-01T16:12:34';

        describe('subtracting days', function () {

            it('takes working days off date', function () {
                bizTime.subtractWorkingTime( moment(now), 2, 'days').format(date).should.equal('2015-02-24');
                bizTime.subtractWorkingTime( moment(now), 10, 'days').format(date).should.equal('2015-02-12');
            });

            it('handles singular as well as plural units', function () {
                bizTime.subtractWorkingTime( moment(now), 1, 'day').format(date).should.equal('2015-02-25');
            });

            it('if called on a non-business day then starts from the first business day', function () {
                bizTime.subtractWorkingTime( moment(weekend), 1, 'day').format(date).should.equal('2015-02-27');
            });

        });

        describe('subtracting hours', function () {

            it('adds working hours onto datetime within the same working day', function () {
                bizTime.subtractWorkingTime(moment(now),2, 'hours').format(full).should.equal('2015-02-26 14:12:34.000');
            });

            it('handles singular as well as plural units', function () {
                bizTime.subtractWorkingTime(moment(now),1, 'hour').format(full).should.equal('2015-02-26 15:12:34.000');
            });

            it('starts from opening time of next working day if called on a non-working day', function () {
                bizTime.subtractWorkingTime(moment(weekend),2, 'hours').format(full).should.equal('2015-02-27 15:00:00.000');
            });

            it('handles running overnight', function () {
                bizTime.subtractWorkingTime(moment(now),9, 'hours').format(full).should.equal('2015-02-25 15:12:34.000');
            });

            it('handles running over multiple nights', function () {
                bizTime.subtractWorkingTime(moment(now),19, 'hours').format(full).should.equal('2015-02-24 13:12:34.000');
            });

        });

        describe('subtracting minutes', function () {

            it('adds time simply if space within current working day', function () {
                bizTime.subtractWorkingTime(moment(now),45, 'minutes').format(full).should.equal('2015-02-26 15:27:34.000');
            });

            it('starts from beginning of next working day if not called at an "open" time', function () {
                bizTime.subtractWorkingTime(moment(weekend),45, 'minutes').format(full).should.equal('2015-02-27 16:15:00.000');
            });

            it('runs over to next day if insufficient space in current day', function () {
                bizTime.subtractWorkingTime(moment('2015-02-26T09:00:00.700'),45, 'minutes').format(full).should.equal('2015-02-25 16:15:00.700');
            });

        });

        describe('subtracting seconds', function () {

            it('adds time simply if space within current working day', function () {
                bizTime.subtractWorkingTime(moment(now),45, 'seconds').format(full).should.equal('2015-02-26 16:11:49.000');
            });

            it('starts from beginning of next working day if not called at an "open" time', function () {
                bizTime.subtractWorkingTime(moment(weekend),45, 'seconds').format(full).should.equal('2015-02-27 16:59:15.000');
            });

            it('runs over to next day if insufficient space in current day', function () {
                bizTime.subtractWorkingTime(moment('2015-02-26T09:00:20.000'),45, 'seconds').format(full).should.equal('2015-02-25 16:59:35.000');
            });

        });

        describe('subtracting milliseconds', function () {

            it('adds time simply if space within current working day', function () {
                bizTime.subtractWorkingTime(moment(now), 555, 'milliseconds').format(full).should.equal('2015-02-26 16:12:33.445');
            });

            it('starts from beginning of next working day if not called at an "open" time', function () {
                bizTime.subtractWorkingTime(moment(weekend), 555, 'milliseconds').format(full).should.equal('2015-02-27 16:59:59.445');
            });

            it('runs over to next day if insufficient space in current day', function () {
                bizTime.subtractWorkingTime(moment('2015-02-26T09:00:00.100'), 555, 'milliseconds').format(full).should.equal('2015-02-25 16:59:59.545');
            });

        });

        describe.skip('subtracting a combination of units', function () {
            it('can handle combinations of hours, minutes, seconds etc', function () {
                moment(now).subtractWorkingTime(9, 'hours', 48, 'minutes', 17, 'seconds').format(full).should.equal('2015-02-25 14:24:17.000');
            });
        });

        describe.skip('subtracting an unknown unit', function () {

            it('should return self', function () {
                moment(now).subtractWorkingTime(3, 'epochs').format(full).should.equal('2015-02-26 16:12:34.000');
            });

        });

    });

    describe('workingDiff', function () {

        it('calculates the basic diff if the two times are on the same working day', function () {
            var from = moment('2015-02-27T10:00:00'),
                to = moment('2015-02-27T13:30:00');

            bizTime.workingDiff(from, to, 'hours').should.equal(-3);
            bizTime.workingDiff( from, to, 'hours', true).should.equal(-3.5);
            bizTime.workingDiff( to, from, 'hours', true).should.equal(3.5);
            bizTime.workingDiff( to, from, 'hours').should.equal(3);

            bizTime.workingDiff( from, to, 'minutes').should.equal(-210);
            bizTime.workingDiff( to, from, 'minutes').should.equal(210);
        });

        it('calculates the diff of only the working hours if two times are on different days', function () {
            var from = moment('2015-02-27T10:00:00'),
                to = moment('2015-03-02T13:30:00');

            bizTime.workingDiff(from, to, 'hours').should.equal(-11);
            bizTime.workingDiff(to, from, 'hours').should.equal(11);
            bizTime.workingDiff(from, to, 'hours', true).should.equal(-11.5);
            bizTime.workingDiff(to, from, 'hours', true).should.equal(11.5);
        });

        it('calculates the difference between dates in working days', function () {
            var from = moment('2015-02-27T10:00:00'),
                to = moment('2015-03-20T13:30:00');

            bizTime.workingDiff(from, to, 'days').should.equal(16);
            bizTime.workingDiff(to, from, 'days').should.equal(-16);
        });

        it('handles units that don\'t really makes sense for business opening times by deferring to moment', function () {
            var from = moment('2015-02-27'),
                to = moment('2015-05-27');

            bizTime.workingDiff(from, to, 'months').should.equal(-3);
            bizTime.workingDiff(to, from, 'months').should.equal(3);
        });

        it.skip('handles inconsistent closing hours', function () {
            moment.locale('en', {
                workinghours:  {
                    0: null,
                    1: ['09:30:00', '17:00:00'],
                    2: ['09:30:00', '17:00:00'],
                    3: ['09:30:00', '13:00:00'],
                    4: ['09:30:00', '17:00:00'],
                    5: ['09:30:00', '17:00:00'],
                    6: null
                }
            });
            var from = moment('2015-02-23T10:00:00'),
                to = moment('2015-02-26T14:00:00');

            from.workingDiff(to, 'hours').should.equal(-22);
            from.workingDiff(to, 'hours', true).should.equal(-22.5);
            to.workingDiff(from, 'hours').should.equal(22);
            to.workingDiff(from, 'hours', true).should.equal(22.5);
        });

    });

    describe.skip('holidays', function () {

        beforeEach(function () {
            moment.locale('en');
            moment.locale('en', {
                holidays: [
                    '2015-02-27',
                    '*-12-25'
                ]
            });
        });

        afterEach(function () {
            moment.locale('en', {
                holidays: []
            });
        });

        it('does not count holidays as working days', function () {
            moment('2015-02-27').isWorkingDay().should.be.false;
        });

        it('does not include holidays when adding working time', function () {
            moment('2015-02-26').addWorkingTime(3, 'days').format(date).should.equal('2015-03-04');
            moment('2015-02-26T12:00:00Z').addWorkingTime(8, 'hours').format(full).should.equal('2015-03-02 12:00:00.000');
        });

        it('does not include holidays when adding calculating diffs', function () {
            moment('2015-03-02T12:00:00Z').workingDiff('2015-02-26T12:00:00Z', 'hours').should.equal(8);
        });

        it('supports holidays as wildcards', function () {
            moment('2015-12-25').isWorkingDay().should.be.false;
            moment('2016-12-25').isWorkingDay().should.be.false;
            moment('2017-12-25').isWorkingDay().should.be.false;
            moment('2018-12-25').isWorkingDay().should.be.false;
            moment('2019-12-25').isWorkingDay().should.be.false;
        });

    });

});
