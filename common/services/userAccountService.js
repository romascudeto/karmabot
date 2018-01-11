var app = require("../../server/server");
var globalHelper = require('../helpers/globalHelper');
var globalConstant = require('../constant/globalConstant');
var _ = require('lodash');
var UserAccount = app.models.UserAccount;

exports.getUserIdBySlackId = getUserIdBySlackId;
exports.getUserIdSendAndReceive = getUserIdSendAndReceive;
exports.isKarmabot = isKarmabot;

function getUserIdBySlackId (slackId) {
    return new Promise(function(resolve, reject) {
        UserAccount.findOne({where: {"account_id": slackId}}).then(userFind => {
            resolve(userFind.id);
        });
    })
}

function getUserIdSendAndReceive (slackIdSend, slackIdReceive) {
    return new Promise(function(resolve, reject) {
        var userIdSend = 0;
        var userIdReceive = 0;
        getUserIdBySlackId(slackIdSend).then(function(result){
            userIdSend = result;
            getUserIdBySlackId(slackIdReceive).then(function(result){
                userIdReceive = result;
                resolve([userIdSend, userIdReceive]);
            });    
        });    
    })
}

function isKarmabot(stringText) {
    return new Promise(function(resolve, reject) {
        var matches = stringText.match(/\<\@(.*?)\>/);
        var matchesBotSlackId = matches[1];
        UserAccount.findOne({where: {"account_id" : matchesBotSlackId}}).then(function(res){
            var valid = 0;
            if (res.account_name == globalConstant.BOT_NAME){
                valid = 1;
            }
            resolve(valid);
        });
    })
}
