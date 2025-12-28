const ChatConversation = require('../models/ChatConversation')
const ChatMessage = require('../models/ChatMessage')
const User = require('../models/User')

// POST /api/chat/start
exports.startConversation = async (req, res) => {
  try {
    const buyerId = req.user._id

    // if conversation exists
    let conv = await ChatConversation.findOne({ buyer: buyerId }).populate('buyer admin', '-password')
    if (conv) return res.status(200).json({ conversation: conv })

    // find any admin
    const admin = await User.findOne({ isAdmin: true })
    if (!admin) return res.status(400).json({ message: 'No admin available' })

    conv = await ChatConversation.create({ buyer: buyerId, admin: admin._id })
    conv = await ChatConversation.findById(conv._id).populate('buyer admin', '-password')
    return res.status(201).json({ conversation: conv })
  } catch (err) {
    console.error('startConversation error', err)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

// GET /api/chat/my
exports.getMyConversation = async (req, res) => {
  try {
    const buyerId = req.user._id
    const conv = await ChatConversation.findOne({ buyer: buyerId }).populate('buyer admin', '-password')
    if (!conv) return res.status(404).json({ message: 'Conversation not found' })

    const messages = await ChatMessage.find({ conversation: conv._id }).populate('sender', '-password').sort({ createdAt: 1 })
    return res.status(200).json({ conversation: conv, messages })
  } catch (err) {
    console.error('getMyConversation error', err)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

// GET /api/admin/chats
exports.adminListConversations = async (req, res) => {
  try {
    const userId = req.user._id
    const user = await User.findById(userId)
    if (!user || !user.isAdmin) return res.status(403).json({ message: 'Forbidden' })

    const convs = await ChatConversation.find().populate('buyer', 'name email').sort({ updatedAt: -1 })
    return res.status(200).json({ conversations: convs })
  } catch (err) {
    console.error('adminListConversations error', err)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

// GET /api/admin/chat/:conversationId
exports.adminGetConversationMessages = async (req, res) => {
  try {
    const userId = req.user._id
    const user = await User.findById(userId)
    if (!user || !user.isAdmin) return res.status(403).json({ message: 'Forbidden' })

    const { conversationId } = req.params
    const conv = await ChatConversation.findById(conversationId)
    if (!conv) return res.status(404).json({ message: 'Conversation not found' })

    const messages = await ChatMessage.find({ conversation: conversationId }).populate('sender', 'name email').sort({ createdAt: 1 })
    return res.status(200).json({ conversation: conv, messages })
  } catch (err) {
    console.error('adminGetConversationMessages error', err)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

// POST /api/chat/message
exports.postMessage = async (req, res) => {
  try {
    const { conversationId, message } = req.body
    if (!conversationId || !message) return res.status(400).json({ message: 'conversationId and message are required' })

    const conv = await ChatConversation.findById(conversationId)
    if (!conv) return res.status(404).json({ message: 'Conversation not found' })

    const uid = req.user._id
    let senderRole = null
    // allow the buyer who owns the conversation
    if (conv.buyer.toString() === uid) {
      senderRole = 'buyer'
    } else {
      // allow any admin user to post to conversations (admin-multi-buyer)
      const user = await User.findById(uid)
      if (user && user.isAdmin) {
        senderRole = 'admin'
        // if conversation had a different admin, reassign to the current admin who is responding
        if (!conv.admin || conv.admin.toString() !== uid) {
          conv.admin = uid
        }
      } else {
        return res.status(403).json({ message: 'Not a participant' })
      }
    }

    const msg = await ChatMessage.create({ conversation: conversationId, senderRole, sender: uid, message })

    conv.lastMessage = message
    await conv.save()

    const populated = await ChatMessage.findById(msg._id).populate('sender', 'name email')

    // Broadcast the saved message to the conversation room if socket.io is available
    try {
      if (global.io) {
        global.io.to(conversationId).emit('receiveMessage', { conversationId, message: populated })
        console.log(`ApiChat.postMessage broadcasted message ${populated._id} to room ${conversationId}`)
      }
    } catch (bErr) {
      console.error('broadcast error', bErr)
    }

    return res.status(201).json({ message: populated })
  } catch (err) {
    console.error('postMessage error', err)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}
