const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middleware/VerifyToken')
const ChatController = require('../controllers/Chat')

router.post('/initiate', verifyToken, ChatController.initiateChat)
router.get('/:chatId', verifyToken, ChatController.getChat)
router.get('/admin/list', verifyToken, ChatController.adminListChats)
router.post('/:chatId/message', verifyToken, ChatController.postMessage)

module.exports = router
