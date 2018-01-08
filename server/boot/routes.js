var SlackBot = require('slackbots');

// create a bot
var bot = new SlackBot({
   token: 'xoxb-294856326721-h7xEyZ978KSsUWpyBiCCeAUq', // Add a bot https://my.slack.com/services/new/bot and put the token 
   name: 'Karmabot'
});

bot.on('message', function(data) {
    console.log(data.channel);
    // all ingoing events https://api.slack.com/rtm
    if(data.type == "message"){
        if (data.text == "test"){
            bot.postMessage(data.channel, 'meow!');                    
        }
    }
});