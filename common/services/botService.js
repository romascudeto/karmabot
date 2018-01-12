var app = require("../../server/server");
var SlackBot = require('slackbots');
var globalConstant = require('../constant/globalConstant');
var globalHelper = require('../helpers/globalHelper');
var karmaPointService = require('./karmaPointService');
var userAccountService = require('./userAccountService');
var UserAccount = app.models.UserAccount;
var KarmaPoint = app.models.KarmaPoint;
var _ = require('lodash');

var bot = new SlackBot({
   token: globalConstant.BOT_TOKEN, 
   name: globalConstant.BOT_NAME
});

exports.syncUser = syncUser;
exports.messageLeaderboard = messageLeaderboard;
exports.messageThanks = messageThanks;
exports.messageKarmaPoint = messageKarmaPoint;

function syncUser () {
    return new Promise(function(resolve, reject) {
        bot.getUsers().then(function(users){
            var promisesMap = users.members.map(function(user){
                UserAccount.findOne({where: {"account_id": user.id}}, function(err, res) {
                    if (res == null){
                        var userAccountTemp = {
                            account_id : user.id, 
                            account_name: user.name, 
                            account_realname: user.real_name
                        };
                        UserAccount.create(userAccountTemp); 
                    }
                });
            });
            Promise.all(promisesMap).then(function(results) {
                resolve(true);
            });
        })
    })
}

function messageLeaderboard (data) {
    return new Promise(function(resolve, reject) {
        userAccountService.isKarmabot(data.text).then(function(resIsKarmabot){
            if (resIsKarmabot){
                karmaPointService.getUserKarmaLeaderboard().then(function(res){
                    var strLeaderboard = "------------------\n";
                    strLeaderboard    += "| Top 10 Users |\n";
                    strLeaderboard    += "------------------\n";
                    strLeaderboard += "Rank | Account Name | Karma Point(s) \n";
                    var sortNo = 1;
                    res.map(function(resStr){
                        strLeaderboard += sortNo + " | " + resStr.account_realname + " | " + resStr.total_karma_point;
                        if (resStr.account_id == data.user){
                            strLeaderboard += " :white_check_mark:";
                        }
                        strLeaderboard += "\n";
                        sortNo++;
                    });
                    bot.postMessage(data.channel, strLeaderboard);
                    resolve(true);
                });
            }
        });
    })
}

function messageThanks (data) {
    return new Promise(function(resolve, reject) {
        var slackIdSend = data.user;
        var slackIdReceiveArr = globalHelper.getUserIdReceive(slackIdSend, data.text);
        karmaPointService.getUserKarmaSendRemainingBySlackId(slackIdSend).then(function(karmaPointRemaining){
            if (slackIdReceiveArr.length > karmaPointRemaining){
                UserAccount.findOne({where: {"account_id": slackIdSend}}).then(function(resUserSendInfo){
                    bot.postMessage(data.channel, 
                        "I'm sorry " + resUserSendInfo.account_realname + ", you have " + karmaPointRemaining + " point(s) left."
                    );
                })
            }else{
                slackIdReceiveArr.map(function(slackIdReceive){
                    userAccountService.getUserIdSendAndReceive(slackIdSend, slackIdReceive).then(function(result){
                        let [userIdSend, userIdReceive] = result;
                        var karmaPointTemp = {
                            user_id_send: userIdSend, 
                            user_id_receive: userIdReceive, 
                            karma_date: globalHelper.formatDate(new Date())
                        };

                        KarmaPoint.create(karmaPointTemp).then(function(resKarmaPoint) {
                            UserAccount.findOne({where: {"id": userIdSend}}).then(function(resUserSendInfo){
                                UserAccount.findOne({where: {"id": userIdReceive}}).then(function(resUserReceiveInfo){
                                    karmaPointService.getUserKarmaReceive(userIdReceive).then(function(resKarmaPointTotal){
                                        let [karmaPointList, karmaPoint] = resKarmaPointTotal;
                                        bot.postMessage(data.channel, 
                                            resUserReceiveInfo.account_realname + " receives 1 point from " + resUserSendInfo.account_realname 
                                            + ". " + resUserReceiveInfo.account_realname + " now has " + karmaPoint + " point(s)."
                                        )
                                        resolve(true);
                                    })
                                });
                            });
                        });

                    });
                });
            }
        });
    })
}

function messageKarmaPoint(data) {
    return new Promise(function(resolve, reject) {
        UserAccount.findOne({where: {"account_id": data.user}}).then(function(resUserInfo){
            karmaPointService.getUserKarmaReceive(resUserInfo.id).then(function(resKarmaPointTotal){
                let [karmaPointList, karmaPoint] = resKarmaPointTotal;
                karmaPointService.getUserKarmaSendRemainingBySlackId(data.user).then(function(karmaPointRemaining){
                    bot.postMessage(data.channel, 
                        "You received " + karmaPoint + " point(s). And " + karmaPointRemaining + " point(s) left to be send today."
                    ).then(function(data){
                        var mostGiveArr = [];
                        karmaPointList.forEach(function(resPerson){
                            resPerson.userAccountSend(function(err, cb){
                                var mostGive = {
                                    account : cb.account_realname+"<"+cb.account_name+">",
                                    give_thanks : 1
                                }
                                mostGiveArr.push(mostGive);
                            })
                        });
                        var countMostGiveObj = _.countBy(mostGiveArr, "account");
                        countMostGiveObj = _.fromPairs(_.sortBy(_.toPairs(countMostGiveObj), function(a){return a[1]}).reverse())
                        var strMessageMostGive = "-----------------\n";
                        strMessageMostGive    += " | Top Senders |\n";
                        strMessageMostGive    += "-----------------\n";
                        strMessageMostGive += "Name<Username> | Point(s)\n";
                        _.forEach(countMostGiveObj, function(value, key) {
                            strMessageMostGive += key + " | " + value + "\n";
                        });
                        bot.postMessage(data.channel, strMessageMostGive);
                        resolve(true);
                    }); 
                });
            })    
        })
    })
}
