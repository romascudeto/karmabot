var app = require("../../server/server");
var GHELPER = require('../helpers/global');
var GCONST = require('../constant/global');
var _ = require('lodash');

exports.getUserIdBySlackId = getUserIdBySlackId;
exports.getUserKarmaSendRemainingBySlackId = getUserKarmaSendRemainingBySlackId;
exports.getUserKarmaReceive = getUserKarmaReceive;
exports.getUserIdSendAndReceive = getUserIdSendAndReceive;
exports.getUserKarmaLeaderboard = getUserKarmaLeaderboard;
exports.isKarmabot = isKarmabot;

function getUserIdBySlackId (slackId) {
    var UserAccount = app.models.UserAccount;
    return new Promise(function(resolve, reject) {
        UserAccount.findOne({where: {"account_id": slackId}}).then(userFind => {
            resolve(userFind.id);
        });
    })
}

function getUserKarmaSendRemainingBySlackId (slackId) {
    var KarmaPoint = app.models.KarmaPoint;
    return new Promise(function(resolve, reject) {
        getUserIdBySlackId(slackId).then(function(result){
            KarmaPoint.find({where: {"user_id_send": result, "karma_date": GHELPER.formatDate(new Date())}}).then(function(resultKarmaPoint){
                var remaining = GCONST.KARMA_PER_DAY - resultKarmaPoint.length;
                resolve(remaining);
            });
        });
    })
}

function getUserKarmaReceive (userIdReceive) {
    var KarmaPoint = app.models.KarmaPoint;
    return new Promise(function(resolve, reject) {
        KarmaPoint.find({where: {"user_id_receive": userIdReceive}}).then(function(resultKarmaPoint){
            resolve(resultKarmaPoint.length);
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

function getUserKarmaLeaderboard () {
    var UserAccount = app.models.UserAccount;
    return new Promise(function(resolve, reject) {
        UserAccount.find({
            include: [
                {
                  relation: 'karmaPointReceive'
                }
              ]
        }).then(function(resultKarmaPoint){
            var leaderboardArr = [];
            resultKarmaPoint.forEach(function(karmaPoint) {
                karmaPoint.karmaPointReceive(function(err, cb){
                    var leaderboard = { 
                        account_realname : karmaPoint.account_realname,
                        account_id : karmaPoint.account_id,  
                        total_karma_point : cb.length 
                    }
                    leaderboardArr.push(leaderboard);
                });
            });
            var sortLeaderboard = _.orderBy(leaderboardArr, "total_karma_point", "desc").splice(0, 10);
            resolve(sortLeaderboard);
        });
    })
}

function isKarmabot(stringText) {
    var UserAccount = app.models.UserAccount;
    return new Promise(function(resolve, reject) {
        var matches = stringText.match(/\<\@(.*?)\>/);
        var matchesBotSlackId = matches[1];
        UserAccount.findOne({where: {"account_id" : matchesBotSlackId}}).then(function(res){
            var valid = 0;
            if (res.account_name == GCONST.BOT_NAME){
                valid = 1;
            }
            resolve(valid);
        });
    })
}