var app = require("../server");
var SlackBot = require('slackbots');
var GCONST = require('../../common/constant/global');
var GHELPER = require('../../common/helpers/global');
var GHELPERMODEL = require('../../common/helpers/model');
var UserAccount = app.models.UserAccount;
var KarmaPoint = app.models.KarmaPoint;

var bot = new SlackBot({
   token: GCONST.BOT_TOKEN, 
   name: GCONST.BOT_NAME
});

bot.on('message', function(data) {
    if(data.type.toLowerCase() == GCONST.DATA_TYPE && data.text.toLowerCase().indexOf(GCONST.DATA_KEYWORD) >= 0
        && GHELPER.checkMentionPeople(data.text) > 0){

        var slackIdReceiveArr = GHELPER.getUserIdReceive(data.text);
        var slackIdSend = data.user;
        GHELPERMODEL.getUserKarmaSendRemainingBySlackId(slackIdSend).then(function(karmaPointRemaining){
            if (karmaPointRemaining < 5){
                bot.postMessage(data.channel, 
                    "Your karma point " + karmaPointRemaining + " remaining."
                );
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
                                    bot.postMessage(data.channel, 
                                        resUserReceiveInfo.account_realname + " receives 1 point from " + resUserSendInfo.account_realname + "."
                                    );
                                });
                            });
                        });

                    });
                });
            }
        });
    }
});

bot.on('start', function() {
    bot.getUsers().then(function(users){
        users.members.map(function(user){
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
    })
});
