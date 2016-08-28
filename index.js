const mongoose = require('mongoose');
const amqp = require('amqp');
const winston = require('winston');
const consts = require('./src/consts');
const Fleet = require('./src/models/fleet');
const Message = require('./src/models/message');
const thinky = require('thinky')({
  host: 'localhost',
  port: 28015,
  authKey: '',
  db: 'test',
});

// const type = thinky.type;
// const r = thinky.r;

// Logger
const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      level: consts.DEBUG_LEVEL,
      colorize: true,
      prettyPrint: true,
    }),
  ],
});

const connection = amqp.createConnection({
  host: 'localhost',
  port: 5672,
  login: 'admin',
  password: 'admin',
  connectionTimeout: 10000,
  authMechanism: 'AMQPLAIN',
  vhost: '/',
  noDelay: true,
  ssl: { enabled: false },
});

connection.on('error', (e) => {
  logger.error('Error from amqp: ', e);
});

mongoose.connection.on('connected', () => {
  logger.info('Connected to MongoDB');
  Fleet.find({}, (err, fleets) => {
    if (err) throw err;

    for (const fleet of fleets) {
      logger.info(`Subscription to ${fleet.id}`);
      connection.queue(fleet.id, { autoDelete: false }, (p) => {
        p.bind('amq.direct', fleet.id);

        connection.queue('stream-processor', { autoDelete: false }, (q) => {
          q.bind(`${fleet.id}.#`);

        // Receive messages
          q.subscribe((msg, headers, deliveryInfo) => {
            const i = deliveryInfo.routingKey.indexOf('.');

            const message = new Message({
              data: msg.data,
              topic: deliveryInfo.routingKey.slice(i + 1),
              fleet: fleet.id,
            });

            message.saveAll().then(() => {
              logger.debug('Message stored');
            });
          });
        });
      });
    }
  });
});

// AQMP queue connection
connection.on('ready', () => {
  logger.info('Connected to RabbitMQ');

  // Database connection
  thinky.dbReady().then(() => {
    logger.info('Connected to RethinkDB');

    Message.changes().then((feed) => {
      feed.each((error, doc) => {
        if (error) throw error;

        if (doc.getOldValue() == null) {
          connection.publish(doc.fleet, doc.data, {
            messageId: doc.id,
            timestamp: doc.timestamp.getTime() / 1000,
            headers: { topic: doc.topic },
          }, (err) => {
            logger.error(err);
          });
        }
      });
    }).error((error) => {
      logger.error(error);
    });

    mongoose.connect(`mongodb://${consts.MONGO_HOST}/test`);
  });
});
