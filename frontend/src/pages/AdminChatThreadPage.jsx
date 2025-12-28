import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { selectLoggedInUser } from '../features/auth/AuthSlice'
import { Box, Paper, Typography, TextField, Button } from '@mui/material'
import { useParams } from 'react-router-dom'
import io from 'socket.io-client'
import { getAdminConversationMessages, postMessageApi } from '../features/chat/ChatApi'
import formatTimestamp from '../utils/formatTimestamp'

function getTokenFromCookie(){
  const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'))
  return match ? match[2] : null
}

export default function AdminChatThreadPage(){
  const { conversationId } = useParams()
  const loggedInUser = useSelector(selectLoggedInUser)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const socketRef = useRef(null)
  const endRef = useRef()
  const [buyerOnline, setBuyerOnline] = useState(false)
  const [typingFromBuyer, setTypingFromBuyer] = useState(false)
  const typingTimerRef = useRef(null)
  const lastTypingEmit = useRef(0)
  useEffect(()=>{
    if (!conversationId) return
    let socket
    (async ()=>{
      // fetch conversation + messages
      const res = await getAdminConversationMessages(conversationId)
      const conv = res.conversation
      const msgs = res.messages
      setMessages(msgs || [])

      // connect socket
      const token = getTokenFromCookie()
      socket = io(process.env.REACT_APP_BASE_URL || 'http://localhost:8000', { withCredentials: true, auth: { token } })
      socketRef.current = socket

      socket.on('connect', () => {
        console.log('socket connected (admin thread):', socket.id)
        socket.emit('joinConversation', { conversationId })
        // mark messages from buyer as seen when admin opens the thread
        try {
          if (conv && conv.buyer && conv.buyer._id) socket.emit('message:seen', { conversationId, senderId: conv.buyer._id })
        } catch (e) {}
      })

      socket.on('participant:online', ({ conversationId: cid, userId, role }) => {
        if (cid === conversationId && role === 'buyer') setBuyerOnline(true)
      })
      socket.on('participant:offline', ({ conversationId: cid }) => {
        if (cid === conversationId) setBuyerOnline(false)
      })
      socket.on('typing', ({ conversationId: cid, userId }) => {
        if (cid === conversationId) {
          setTypingFromBuyer(true)
          if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
          typingTimerRef.current = setTimeout(()=> setTypingFromBuyer(false), 2500)
        }
      })

      socket.on('connect_error', (err) => console.error('socket connect_error (admin thread):', err))

      socket.on('receiveMessage', ({ conversationId: cid, message }) => {
        if (cid === conversationId) {
          setMessages(prev => {
            if (!message || !message._id) return [...prev, message]
            if (prev.some(m => m._id && m._id.toString() === message._id.toString())) return prev
            console.log('admin thread receiveMessage', message._id, Date.now())
            // acknowledge delivery to server if the receiver is not the sender
            try {
              if (message && message.sender && message.sender._id && loggedInUser && loggedInUser._id && message.sender._id !== loggedInUser._id) {
                socket.emit('message:delivered', { messageId: message._id })
              }
            } catch(e) { console.error(e) }
            return [...prev, message]
          })
        }
      })

      // status updates
      const safeId = id => (id && id.toString) ? id.toString() : String(id)
      socket.on('message:delivered', ({ messageId, conversationId: cid }) => {
        if (cid === conversationId) {
          const mid = safeId(messageId)
          setMessages(prev => prev.map(m => (m._id && safeId(m._id) === mid) ? { ...m, status: 'delivered' } : m))
        }
      })
      socket.on('message:seen', ({ conversationId: cid, messageIds }) => {
        if (cid === conversationId && Array.isArray(messageIds)) {
          const ids = messageIds.map(safeId)
          setMessages(prev => prev.map(m => (m._id && ids.includes(safeId(m._id))) ? { ...m, status: 'seen' } : m))
        }
      })

    })()

    return ()=>{ if (socket) socket.disconnect() }
  },[conversationId, loggedInUser])

  useEffect(()=>{ endRef.current?.scrollIntoView({ behavior: 'smooth' }) },[messages])

  const handleSend = async () => {
    if (!text) return
    const trimmed = (text || '').trim()
    if (!trimmed) return
    try {
      const s = socketRef.current
      if (s && s.connected) {
        s.emit('sendMessage', { conversationId, message: trimmed })
        setText('')
        return
      }
    } catch (e) { console.error('socket send error (admin thread):', e) }
    try {
      await postMessageApi(conversationId, trimmed)
    } catch (err) {
      console.error('postMessageApi error (admin thread):', err)
    }
    setText('')
  }

  return (
    <Box sx={{ p: { xs:2, md:3 } }}>
      <Paper sx={{ maxWidth: { xs: '100%', md:900 }, mx:'auto', p: { xs:1.5, md:2 } }} elevation={1}>
        <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mb:1 }}>
          <Typography variant='h6'>Buyer Conversation</Typography>
          <Box>
            {buyerOnline ? <Typography variant='caption' sx={{ color:'#2e7d32' }}>Buyer: ● Online</Typography> : <Typography variant='caption' sx={{ color:'gray' }}>Buyer: ● Offline</Typography>}
            {typingFromBuyer && <Typography variant='caption' sx={{ ml:1 }}>Buyer is typing...</Typography>}
          </Box>
        </Box>
        <Box sx={{ minHeight:360, maxHeight:520, overflowY:'auto', my:2, px:1, display:'flex', flexDirection:'column', gap:1, scrollBehavior:'smooth', pr:1 }}>
          {messages.length === 0 && (
            <Box sx={{ p:2, textAlign:'center' }}>
              <Typography color='textSecondary'>No messages yet. Start the conversation.</Typography>
            </Box>
          )}
          {messages.map((m, idx) => {
            const isCurrent = m.sender && loggedInUser && m.sender._id && m.sender._id === loggedInUser._id
            const justify = isCurrent ? 'flex-end' : 'flex-start'
            const bg = isCurrent ? '#4CAF50' : '#f5f5f5'
            const color = isCurrent ? 'white' : 'inherit'
            return (
              <Box key={idx} sx={{ mb:0, display:'flex', justifyContent: justify }}>
                <Paper sx={{ p:1.2, maxWidth: { xs: '85%', md: '70%' }, backgroundColor: bg, color, borderRadius:2, boxShadow:'none' }}>
                  <Typography variant='body2' sx={{ fontSize:13, lineHeight:1.4 }}>{m.message || m.content}</Typography>
                  <Typography variant='caption' sx={{ display:'block', mt:0.5, opacity:0.7 }}>{formatTimestamp(m.createdAt || m.updatedAt || m.timestamp)}</Typography>
                  <Box sx={{ display:'flex', justifyContent: justify, alignItems:'center', mt:0.5 }}>
                    <Typography variant='caption' sx={{ opacity:0.8 }}>{isCurrent ? 'You' : ((m.sender && m.sender.name) ? m.sender.name : (m.senderRole === 'buyer' ? 'Buyer' : 'Admin'))}</Typography>
                    { isCurrent ? (
                      <Typography variant='caption' sx={{ ml:1, color: (m.status||'sent') === 'seen' ? '#2e7d32' : 'rgba(0,0,0,0.6)' }}>{(m.status||'sent') === 'seen' ? 'Seen' : ((m.status||'sent') === 'delivered' ? 'Delivered' : 'Sent')}</Typography>
                    ) : null }
                  </Box>
                </Paper>
              </Box>
            )
          })}
          <div ref={endRef} />
        </Box>

        <Box sx={{ display:'flex', gap:1, alignItems:'center' }}>
          <TextField
            value={text}
            onChange={e=>{ setText(e.target.value); try { const now = Date.now(); if (!socketRef.current) return; if (now - lastTypingEmit.current > 1500) { socketRef.current.emit('typing', { conversationId }); lastTypingEmit.current = now } } catch(e){} }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                const trimmed = (text || '').trim()
                if (trimmed) handleSend()
                return
              }
              if (e.key === 'Enter' && e.shiftKey) {
                try {
                  const target = e.target
                  const start = target.selectionStart
                  const end = target.selectionEnd
                  const newValue = (text || '').slice(0, start) + '\n' + (text || '').slice(end)
                  setText(newValue)
                  setTimeout(() => {
                    if (target.setSelectionRange) target.setSelectionRange(start + 1, start + 1)
                  }, 0)
                } catch (err) {
                  setText((t) => t + '\n')
                }
              }
            }}
            fullWidth
            placeholder='Type a message'
            size='small'
            multiline
            minRows={1}
            maxRows={4}
            sx={{ backgroundColor:'#fff' }}
          />
          <Button variant='contained' onClick={handleSend} sx={{ backgroundColor:'#4CAF50' }} disabled={!text || !text.trim()}>Send</Button>
        </Box>
      </Paper>
    </Box>
  )
}
