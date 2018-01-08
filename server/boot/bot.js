var SlackBot = require('slackbots');

var bot = new SlackBot({
   token: 'xoxb-294856326721-h7xEyZ978KSsUWpyBiCCeAUq', 
   name: 'Karmabot'
});

bot.on('message', function(data) {
    if(data.type == "message"){
        if (data.text == "test"){
            bot.postMessage(data.channel, 'meow!');                    
        }
    }
});