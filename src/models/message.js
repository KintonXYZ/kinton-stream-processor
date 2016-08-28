const thinky = require('../thinky');

const r = thinky.r;
const type = thinky.type;

const Message = thinky.createModel('Messages', {
  id: String,
  data: Buffer,
  topic: String,
  fleet: String,
  timestamp: type.date().default(r.now()),
});

module.exports = Message;
