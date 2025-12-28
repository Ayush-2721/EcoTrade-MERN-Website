import { axiosi } from '../../config/axios'

export const initiateChat = async () => {
  const res = await axiosi.post('/chat/initiate')
  return res.data.chat
}

export const getChat = async (chatId) => {
  const res = await axiosi.get(`/chat/${chatId}`)
  return res.data.chat
}

export const getAdminChats = async () => {
  // legacy endpoint (kept for backward compatibility)
  try {
    const res = await axiosi.get('/chat/admin/list')
    return res.data.chats
  } catch (err) {
    return []
  }
}

export const getAdminConversations = async () => {
  const res = await axiosi.get('/api/admin/chats')
  return res.data.conversations
}

export const getAdminConversationMessages = async (conversationId) => {
  const res = await axiosi.get(`/api/admin/chat/${conversationId}`)
  return res.data
}

export const postMessage = async (chatId, content) => {
  const res = await axiosi.post(`/chat/${chatId}/message`, { content })
  return res.data.message
}

// New API endpoints (server: /api)
export const startConversation = async () => {
  const res = await axiosi.post('/api/chat/start')
  return res.data.conversation
}

export const getMyConversation = async () => {
  const res = await axiosi.get('/api/chat/my')
  return res.data
}

export const postMessageApi = async (conversationId, message) => {
  const res = await axiosi.post('/api/chat/message', { conversationId, message })
  return res.data.message
}
