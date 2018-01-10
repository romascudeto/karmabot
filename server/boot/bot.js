var app = require("../server");
var SlackBot = require('slackbots');
var GCONST = require('../../common/constant/global');
var GHELPER = require('../../common/helpers/global');
var GHELPERMODEL = require('../../common/helpers/model');
var BOTHELPER = require('../../common/helpers/bot');
var UserAccount = app.models.UserAccount;
var KarmaPoint = app.models.KarmaPoint;

var bot = new SlackBot({
   token: GCONST.BOT_TOKEN, 
   name: GCONST.BOT_NAME
});

bot.on('message', function(data) {
    BOTHELPER.isChannelMessage(data).then(function(resIsChannel){
        if (resIsChannel > 0){
            if (data.type.toLowerCase() == GCONST.DATA_TYPE
                && data.text.toLowerCase().indexOf(GCONST.DATA_LEADERBOARD) >= 0){
                    BOTHELPER.messageLeaderboard(data);
            }
            else if(data.type.toLowerCase() == GCONST.DATA_TYPE 
                && data.text.toLowerCase().indexOf(GCONST.DATA_KEYWORD) >= 0
                && GHELPER.checkMentionPeople(data.text) > 0){
                    BOTHELPER.syncUser().then(function(res){
                        BOTHELPER.messageThanks(data);
                    });
            }
        }else{
            if (data.type.toLowerCase() == GCONST.DATA_TYPE
                && data.text.toLowerCase().indexOf(GCONST.DATA_KARMA_POINT) >= 0){

            }
        }
    })

});

bot.on('start', function() {
    BOTHELPER.syncUser();
});
