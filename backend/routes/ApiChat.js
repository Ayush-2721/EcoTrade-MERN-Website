const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middleware/VerifyToken')
const ApiChat = require('../controllers/ApiChat')

// buyer starts or returns conversation
router.post('/chat/start', verifyToken, ApiChat.startConversation)

// buyer gets their conversation + messages
router.get('/chat/my', verifyToken, ApiChat.getMyConversation)

// admin list all buyer conversations
router.get('/admin/chats', verifyToken, ApiChat.adminListConversations)

// admin get messages for a conversation
router.get('/admin/chat/:conversationId', verifyToken, ApiChat.adminGetConversationMessages)

// post message (buyer or admin)
router.post('/chat/message', verifyToken, ApiChat.postMessage)

module.exports = router
