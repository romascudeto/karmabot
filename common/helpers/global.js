var app = require("../../server/server");
var UserAccount = app.models.UserAccount;
var GCONST = require('../constant/global');

module.exports.formatDate = function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

module.exports.getUserIdReceive = function getUserIdReceive(stringText) {
    var matches = stringText.match(/\<\@(.*?)\>/g).map(function(str){
        return str.slice(2,-1);
    });
    return matches;
}

module.exports.checkMentionPeople = function checkMentionPeople(stringText) {
    return stringText.indexOf("@");
}