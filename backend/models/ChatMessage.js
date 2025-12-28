const mongoose = require('mongoose')
const { Schema } = mongoose

// Messages are persisted and not auto-deleted by schema configuration
const chatMessageSchema = new Schema({
  conversation: { type: Schema.Types.ObjectId, ref: 'ChatConversation', required: true },
  senderRole: { type: String, enum: ['buyer', 'admin'], required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User' },
  message: { type: String, required: true },
  // message delivery/read status
  status: { type: String, enum: ['sent', 'delivered', 'seen'], default: 'sent' }
}, { timestamps: true })

module.exports = mongoose.model('ChatMessage', chatMessageSchema)
