const Chat = require('../models/Chat')
const User = require('../models/User')

// buyer initiates or returns existing chat
exports.initiateChat = async (req, res) => {
  try {
    const buyerId = req.user._id

    // check existing chat where buyer is a participant
    let chat = await Chat.findOne({ participants: buyerId }).populate('participants', '-password')
    if (chat) return res.status(200).json({ chat })

    // find any admin
    const admin = await User.findOne({ isAdmin: true })
    if (!admin) return res.status(400).json({ message: 'No admin available' })

    chat = new Chat({ participants: [buyerId, admin._id], messages: [] })
    await chat.save()
    chat = await Chat.findById(chat._id).populate('participants', '-password')
    return res.status(201).json({ chat })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

exports.getChat = async (req, res) => {
  try {
    const { chatId } = req.params
    const chat = await Chat.findById(chatId).populate('participants', '-password')
    if (!chat) return res.status(404).json({ message: 'Chat not found' })
    return res.status(200).json({ chat })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

exports.adminListChats = async (req, res) => {
  try {
    const adminId = req.user._id
    // ensure requester is admin
    const admin = await User.findById(adminId)
    if (!admin || !admin.isAdmin) return res.status(403).json({ message: 'Forbidden' })

    const chats = await Chat.find({ participants: adminId }).populate('participants', '-password')
    return res.status(200).json({ chats })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

exports.postMessage = async (req, res) => {
  try {
    const { chatId } = req.params
    const { content } = req.body
    const senderId = req.user._id
    if (!content) return res.status(400).json({ message: 'Message content required' })

    const chat = await Chat.findById(chatId)
    if (!chat) return res.status(404).json({ message: 'Chat not found' })

    const message = { sender: senderId, content }
    chat.messages.push(message)
    await chat.save()

    const populated = await Chat.findById(chatId).populate('messages.sender', '-password')
    return res.status(201).json({ message: populated.messages.pop() })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}
