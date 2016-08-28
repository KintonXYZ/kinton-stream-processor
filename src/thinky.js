const consts = require('./consts');
const thinky = require('thinky')({
  host: consts.RETHINK_HOST,
  port: consts.RETHINK_PORT,
  authKey: '',
  db: consts.RETHINK_DB_NAME,
});

module.exports = thinky;
