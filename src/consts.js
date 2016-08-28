exports.DEBUG_LEVEL = (process.env.DEBUG || 'false') === 'true' ? 'debug' : 'info';
exports.MONGO_HOST = process.env.MONGO_HOST || 'localhost';
