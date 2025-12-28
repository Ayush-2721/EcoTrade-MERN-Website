const mongoose = require('mongoose')
const { Schema } = mongoose

// One conversation per buyer (unique buyer field)
const chatConversationSchema = new Schema({
  buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  admin: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  lastMessage: { type: String, default: '' }
}, { timestamps: true })

module.exports = mongoose.model('ChatConversation', chatConversationSchema)
