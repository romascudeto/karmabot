var app = require("../../server/server");
var SlackBot = require('slackbots');
var GCONST = require('../constant/global');
var GHELPER = require('./global');
var GHELPERMODEL = require('./model');
var UserAccount = app.models.UserAccount;
var KarmaPoint = app.models.KarmaPoint;
var _ = require('lodash');

var bot = new SlackBot({
   token: GCONST.BOT_TOKEN, 
   name: GCONST.BOT_NAME
});

exports.syncUser = syncUser;
exports.messageLeaderboard = messageLeaderboard;
exports.messageThanks = messageThanks;
exports.messageKarmaPoint = messageKarmaPoint;
exports.isChannelMessage = isChannelMessage;

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
        GHELPERMODEL.isKarmabot(data.text).then(function(resKarmabot){
            if (resKarmabot){
                GHELPERMODEL.getUserKarmaLeaderboard().then(function(res){
                    var strLeaderboard = "Rank | Account Name | Karma Point(s) \n";
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
        var slackIdReceiveArr = GHELPER.getUserIdReceive(slackIdSend, data.text);
        GHELPERMODEL.getUserKarmaSendRemainingBySlackId(slackIdSend).then(function(karmaPointRemaining){
            if (slackIdReceiveArr.length > karmaPointRemaining){
                UserAccount.findOne({where: {"account_id": slackIdSend}}).then(function(resUserSendInfo){
                    bot.postMessage(data.channel, 
                        "I'm sorry " + resUserSendInfo.account_realname + ", you have " + karmaPointRemaining + " point(s) left."
                    );
                })
            }else{
                slackIdReceiveArr.map(function(slackIdReceive){
                    GHELPERMODEL.getUserIdSendAndReceive(slackIdSend, slackIdReceive).then(function(result){
                        let [userIdSend, userIdReceive] = result;
                        var karmaPointTemp = {
                            user_id_send: userIdSend, 
                            user_id_receive: userIdReceive, 
                            karma_date: GHELPER.formatDate(new Date())
                        };

                        KarmaPoint.create(karmaPointTemp).then(function(resKarmaPoint) {
                            UserAccount.findOne({where: {"id": userIdSend}}).then(function(resUserSendInfo){
                                UserAccount.findOne({where: {"id": userIdReceive}}).then(function(resUserReceiveInfo){
                                    GHELPERMODEL.getUserKarmaReceive(userIdReceive).then(function(resKarmaPointTotal){
                                        bot.postMessage(data.channel, 
                                            resUserReceiveInfo.account_realname + " receives 1 point from " + resUserSendInfo.account_realname 
                                            + ". " + resUserReceiveInfo.account_realname + " now has " + resKarmaPointTotal + " point(s)."
                                        ); 
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
            GHELPERMODEL.getUserKarmaReceive(resUserInfo.id).then(function(resKarmaPointTotal){
                GHELPERMODEL.getUserKarmaSendRemainingBySlackId(data.user).then(function(karmaPointRemaining){
                    bot.postMessage(data.channel, 
                        "You received " + resKarmaPointTotal + " point(s). And " + karmaPointRemaining + " point(s) left to be send today."
                    ); 
                    resolve(true);
                });
            })    
        })
    })
}

function isChannelMessage(data) {
    return new Promise(function(resolve, reject) {
        bot.getChannels().then(function(resChannels){
            var countChannelFound = _.filter(resChannels.channels, { 'id': data.channel});
            resolve(countChannelFound.length)
        })
    })
}