const jwt = require('jsonwebtoken')
const ChatConversation = require('../models/ChatConversation')
const ChatMessage = require('../models/ChatMessage')

module.exports = function attachChatSocket(io) {
  // authenticate sockets using token passed in handshake auth
  io.use((socket, next) => {
    try {
      // try token from client-provided auth (socket.io client can pass it)
      let token = socket.handshake.auth && socket.handshake.auth.token

      // fallback: try to parse token from cookie header (cookie is HttpOnly so client JS may not read it)
      if (!token && socket.handshake.headers && socket.handshake.headers.cookie) {
        const match = socket.handshake.headers.cookie.match(new RegExp('(^| )token=([^;]+)'))
        if (match) token = match[2]
      }

      if (!token) {
        console.warn('socket auth failed: token missing')
        return next(new Error('Authentication error'))
      }

      const decoded = jwt.verify(token, process.env.SECRET_KEY)
      socket.user = decoded
      console.log(`socket connected: user=${decoded.email} id=${decoded._id}`)
      return next()
    } catch (err) {
      console.error('socket auth error', err)
      return next(new Error('Authentication error'))
    }
  })

  io.on('connection', (socket) => {
    // track joined conversations for presence notifications
    socket.joinedConversations = new Set()
    // connection event available here

    // join a conversation room
    socket.on('joinConversation', async ({ conversationId }) => {
      try {
        if (!conversationId) return
        // verify user is participant of the conversation
        const conv = await ChatConversation.findById(conversationId)
        if (!conv) return
        const uid = socket.user._id
        if (conv.buyer.toString() !== uid && conv.admin.toString() !== uid) {
          // allow admins as long as they are flagged admin in user doc (some conv.admin may be null)
          const User = require('../models/User')
          const user = await User.findById(uid)
          if (!user || !user.isAdmin) return
          // assign admin to conversation
          if (!conv.admin || conv.admin.toString() !== uid) {
            conv.admin = uid
            await conv.save()
          }
        }
        socket.join(conversationId)
        // record joined room for presence tracking
        try { socket.joinedConversations.add(conversationId.toString()) } catch (e) {}
        // notify other participants this user is online in the room
        try {
          // determine role from authenticated socket user (socket.user is set in auth middleware)
          const role = (socket.user && socket.user.isAdmin) ? 'admin' : 'buyer'
          io.to(conversationId).emit('participant:online', { conversationId, userId: uid, role })
        } catch (e) {}

        // Also, inform the joining socket about any existing participants
        // so that admins who join after a buyer are aware the buyer is already online.
        try {
          ;(async () => {
            const socketsInRoom = await io.in(conversationId).allSockets()
            for (const sid of socketsInRoom) {
              try {
                if (sid === socket.id) continue // skip self
                const s = io.sockets.sockets.get(sid)
                if (!s || !s.user) continue
                const existingRole = (s.user && s.user.isAdmin) ? 'admin' : 'buyer'
                // emit directly to the joining socket about this participant
                socket.emit('participant:online', { conversationId, userId: s.user._id, role: existingRole })
              } catch (e) {}
            }
          })()
        } catch (e) {}
        console.log(`socket ${socket.id} joined room ${conversationId}`)
      } catch (err) {
        console.error('joinConversation error', err)
      }
    })

    // typing indicator: broadcast to other participants in the conversation
    socket.on('typing', ({ conversationId }) => {
      try {
        if (!conversationId) return
        socket.to(conversationId).emit('typing', { conversationId, userId: socket.user._id })
      } catch (err) {
        console.error('typing handler error', err)
      }
    })

    // handle sending message
    // Accept either a raw message (server will persist) OR a messageId (client saved via REST)
    socket.on('sendMessage', async ({ conversationId, message, messageId }) => {
      try {
        if (!conversationId) return
        const conv = await ChatConversation.findById(conversationId)
        if (!conv) return

        const uid = socket.user._id
        // ensure sender is buyer or admin
        const UserModel = require('../models/User')
        const senderUser = await UserModel.findById(uid)
        if (!(conv.buyer.toString() === uid || (senderUser && senderUser.isAdmin) || (conv.admin && conv.admin.toString() === uid))) {
          return
        }

        // If client sent a messageId (saved via REST), just fetch and broadcast
        if (messageId) {
          const msgDoc = await ChatMessage.findById(messageId).populate('sender', '-password')
          if (!msgDoc) return
          io.to(conversationId).emit('receiveMessage', { conversationId, message: msgDoc })
          console.log(`broadcast messageId ${messageId} to room ${conversationId}`)
          return
        }

        // Otherwise persist the message here
        if (!message) return
        const senderRole = conv.buyer.toString() === uid ? 'buyer' : 'admin'

        const msgDoc = await ChatMessage.create({
          conversation: conversationId,
          senderRole,
          sender: uid,
          message
        })

        // update conversation lastMessage and updatedAt
        conv.lastMessage = message
        await conv.save()

        const populated = await ChatMessage.findById(msgDoc._id).populate('sender', '-password')
        io.to(conversationId).emit('receiveMessage', { conversationId, message: populated })
        console.log(`persisted and broadcast message ${populated._id} to room ${conversationId}`)
      } catch (err) {
        console.error('sendMessage error', err)
      }
    })

    // delivery acknowledgement from receiver
    // payload: { messageId }
    socket.on('message:delivered', async ({ messageId }) => {
      try {
        if (!messageId) return
        const msg = await ChatMessage.findById(messageId)
        if (!msg) return
        // update status only if it is still 'sent'
        if (msg.status !== 'delivered' && msg.status !== 'seen') {
          msg.status = 'delivered'
          await msg.save()
          // notify participants about delivery
          const convId = msg.conversation.toString()
          io.to(convId).emit('message:delivered', { messageId: msg._id, conversationId: convId })
          console.log(`message ${msg._id} marked delivered in conv ${convId}`)
        }
      } catch (err) {
        console.error('message:delivered handler error', err)
      }
    })

    // seen acknowledgement when receiver opens chat
    // payload: { conversationId, senderId }
    socket.on('message:seen', async ({ conversationId, senderId }) => {
      try {
        if (!conversationId || !senderId) return
        // find messages from sender that are not yet seen (include older docs without status)
        const toUpdate = await ChatMessage.find({
          conversation: conversationId,
          sender: senderId,
          $or: [
            { status: { $in: ['sent', 'delivered'] } },
            { status: { $exists: false } }
          ]
        }).select('_id')
        if (!toUpdate || toUpdate.length === 0) return
        const ids = toUpdate.map(d => d._id)
        await ChatMessage.updateMany({ _id: { $in: ids } }, { $set: { status: 'seen' } })
        // notify participants of seen status
        io.to(conversationId).emit('message:seen', { conversationId, messageIds: ids })
        console.log(`messages marked seen for conv ${conversationId}, ids: ${ids.length}`)
      } catch (err) {
        console.error('message:seen handler error', err)
      }
    })

    socket.on('disconnect', () => {
      try {
        // notify rooms that this participant went offline
        const rooms = Array.from(socket.joinedConversations || [])
        rooms.forEach(rid => {
          try {
            const role = (socket.user && socket.user.isAdmin) ? 'admin' : 'buyer'
            io.to(rid).emit('participant:offline', { conversationId: rid, userId: socket.user && socket.user._id, role })
          } catch(e){}
        })
      } catch (err) {
        console.error('disconnect presence notify error', err)
      }
    })
  })
}
