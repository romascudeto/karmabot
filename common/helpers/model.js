var app = require("../../server/server");
exports.getUserIdBySlackId = getUserIdBySlackId;
exports.getUserIdSendAndReceive = getUserIdSendAndReceive;

function getUserIdBySlackId (slackId) {
    var UserAccount = app.models.UserAccount;
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
        });
        getUserIdBySlackId(slackIdReceive).then(function(result){
            userIdReceive = result;
            resolve([userIdSend, userIdReceive]);
        });        
    })
}