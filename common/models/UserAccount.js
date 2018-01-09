var disableAllMethods = require('../helpers/disableAllMethodsHelper.js').disableAllMethods;

module.exports = function(UserAccount) {
    disableAllMethods(UserAccount, ['create','updateAll','count','find','findById','findOne','deleteById']);
};
