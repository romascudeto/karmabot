var path = require('path');

var app = require(path.resolve(__dirname, '../../server/server'));

var ds = app.datasources.mysqlDs;

ds.autoupdate(function(err) {
  if (err) throw err;
  ds.disconnect();
});
