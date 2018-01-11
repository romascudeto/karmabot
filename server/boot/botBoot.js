var app = require("../server");
var SlackBot = require('slackbots');
var globalConstant = require('../../common/constant/globalConstant');
var globalHelper = require('../../common/helpers/globalHelper');
var botService = require('../../common/services/botService');
var UserAccount = app.models.UserAccount;
var KarmaPoint = app.models.KarmaPoint;

var bot = new SlackBot({
   token: globalConstant.BOT_TOKEN, 
   name: globalConstant.BOT_NAME
});

bot.on('message', function(data) {
    botService.isChannelMessage(data).then(function(resIsChannel){
        if (resIsChannel > 0){
            if (data.type.toLowerCase() == globalConstant.DATA_TYPE
                && data.text.toLowerCase().indexOf(globalConstant.DATA_LEADERBOARD) >= 0){
                    botService.messageLeaderboard(data);
            }
            else if(data.type.toLowerCase() == globalConstant.DATA_TYPE 
                && data.text.toLowerCase().indexOf(globalConstant.DATA_KEYWORD) >= 0
                && globalHelper.checkMentionPeople(data.text) > 0){
                    botService.syncUser().then(function(res){
                        botService.messageThanks(data);
                    });
            }
        }else{
            if (data.type.toLowerCase() == globalConstant.DATA_TYPE
                && data.text.toLowerCase() == globalConstant.DATA_KARMA_POINT){
                    botService.messageKarmaPoint(data);
            }
        }
    })

});

bot.on('start', function() {
    botService.syncUser();
});
