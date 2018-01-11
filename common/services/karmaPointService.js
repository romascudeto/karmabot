var app = require("../../server/server");
var globalConstant = require('../constant/globalConstant');
var globalHelper = require('../helpers/globalHelper');
var userAccountService = require('./userAccountService');
var _ = require('lodash');
var KarmaPoint = app.models.KarmaPoint;
var UserAccount = app.models.UserAccount;

exports.getUserKarmaSendRemainingBySlackId = getUserKarmaSendRemainingBySlackId;
exports.getUserKarmaReceive = getUserKarmaReceive;
exports.getUserKarmaLeaderboard = getUserKarmaLeaderboard;

function getUserKarmaSendRemainingBySlackId (slackId) {
    return new Promise(function(resolve, reject) {
        userAccountService.getUserIdBySlackId(slackId).then(function(result){
            KarmaPoint.find({where: {"user_id_send": result, "karma_date": globalHelper.formatDate(new Date())}}).then(function(resultKarmaPoint){
                var remaining = globalConstant.KARMA_PER_DAY - resultKarmaPoint.length;
                resolve(remaining);
            });
        });
    })
}

function getUserKarmaReceive (userIdReceive) {
    return new Promise(function(resolve, reject) {
        KarmaPoint.find({where: {"user_id_receive": userIdReceive}}).then(function(resultKarmaPoint){
            resolve(resultKarmaPoint.length);
        });
    })
}

function getUserKarmaLeaderboard () {
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