var app = require("../../server/server");
var UserAccount = app.models.UserAccount;
var GCONST = require('../constant/global');
var _ = require('lodash');

module.exports.formatDate = function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

module.exports.getUserIdReceive = function getUserIdReceive(slackIdSend, stringText) {
    var matches = stringText.match(/\<\@(.*?)\>/g).map(function(str){
        return str.slice(2,-1);
    });
    var matchesFilter = _.without(matches, slackIdSend);
    return _.uniq(matchesFilter);
}

module.exports.checkMentionPeople = function checkMentionPeople(stringText) {
    return stringText.indexOf("@");
}