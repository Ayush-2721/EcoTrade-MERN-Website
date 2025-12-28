const mongoose = require('mongoose')
const { Schema } = mongoose

const messageSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
})

const chatSchema = new Schema({
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    messages: [messageSchema],
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Chat', chatSchema)
