const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const FleetSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  ownerId: ObjectId,
});

const Flet = mongoose.model('Fleet', FleetSchema);

module.exports = Flet;
