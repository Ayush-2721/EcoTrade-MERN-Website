import React, { useEffect, useRef, useState } from 'react'
import { Box, Paper, Typography, TextField, Button, Avatar } from '@mui/material'
import { Send as SendIcon } from '@mui/icons-material'
import io from 'socket.io-client'
import { useSelector } from 'react-redux'
import { selectLoggedInUser } from '../features/auth/AuthSlice'
import { startConversation, getMyConversation, postMessageApi } from '../features/chat/ChatApi'
import formatTimestamp from '../utils/formatTimestamp'

function getTokenFromCookie(){
  const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'))
  return match ? match[2] : null
}

export default function BuyerChatPage(){
  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [adminOnline, setAdminOnline] = useState(false)
  const [typingFromAdmin, setTypingFromAdmin] = useState(false)
  const socketRef = useRef(null)
  const endRef = useRef()
  const loggedInUser = useSelector(selectLoggedInUser)
  const lastTypingEmit = useRef(0)
  const typingTimerRef = useRef(null)

  useEffect(()=>{
    (async ()=>{
      // start or get conversation
      const conv = await startConversation()
      setConversation(conv)

      // get previous messages
      const res = await getMyConversation()
      if (res && res.messages) setMessages(res.messages)

      // connect socket
      const token = getTokenFromCookie()
      const socket = io(process.env.REACT_APP_BASE_URL || 'http://localhost:8000', { withCredentials: true, auth: { token } })
      socketRef.current = socket
      socket.on('connect', () => {
        console.log('socket connected (buyer):', socket.id)
        socket.emit('joinConversation', { conversationId: conv._id })
        // mark messages from admin as seen when opening (if admin exists)
        if (conv && conv._id && conv.admin && conv.admin._id) {
          try { socket.emit('message:seen', { conversationId: conv._id, senderId: conv.admin._id }) } catch(e) {}
        }
      })
      // presence & typing listeners
      socket.on('participant:online', ({ conversationId: cid, userId, role }) => {
        if (conv && cid === conv._id && role === 'admin') setAdminOnline(true)
      })
      socket.on('participant:offline', ({ conversationId: cid, userId }) => {
        if (conv && cid === conv._id && conv.admin && conv.admin._id && userId && userId.toString() === conv.admin._id.toString()) setAdminOnline(false)
      })
      socket.on('typing', ({ conversationId: cid, userId }) => {
        if (conv && cid === conv._id && conv.admin && userId && userId.toString() === conv.admin._id.toString()) {
          setTypingFromAdmin(true)
          if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
          typingTimerRef.current = setTimeout(()=> setTypingFromAdmin(false), 2500)
        }
      })
      socket.on('connect_error', (err) => console.error('socket connect_error (buyer):', err))
      socket.on('receiveMessage', ({ conversationId, message }) => {
        if (conversationId === conv._id) {
          setMessages(prev => {
            // dedupe by _id
            if (!message || !message._id) return [...prev, message]
            if (prev.some(m => m._id && m._id.toString() === message._id.toString())) return prev
            console.log('buyer receiveMessage', message._id, Date.now())
            // acknowledge delivery to server (only if receiver is not the sender)
            try {
              if (message && message.sender && message.sender._id && loggedInUser && loggedInUser._id && message.sender._id !== loggedInUser._id) {
                socket.emit('message:delivered', { messageId: message._id })
              }
            } catch (e) { console.error(e) }
            return [...prev, message]
          })
        }
      })

      // listen for status updates
      socket.on('message:delivered', ({ messageId, conversationId }) => {
        if (conversationId === conv._id) {
          setMessages(prev => prev.map(m => (m._id && m._id.toString() === messageId.toString()) ? { ...m, status: 'delivered' } : m))
        }
      })

      socket.on('message:seen', ({ conversationId, messageIds }) => {
        if (conversationId === conv._id && Array.isArray(messageIds)) {
          setMessages(prev => prev.map(m => (m._id && messageIds.some(id => id.toString() === m._id.toString())) ? { ...m, status: 'seen' } : m))
        }
      })

      return ()=> socket.disconnect()
    })()
  },[])

  useEffect(()=>{ endRef.current?.scrollIntoView({ behavior: 'smooth' }) },[messages])

  const handleSend = async () => {
    if (!text || !conversation) return
    const trimmed = (text || '').trim()
    if (!trimmed) return
    // try socket first if connected
    try {
      const s = socketRef.current
      if (s && s.connected) {
        s.emit('sendMessage', { conversationId: conversation._id, message: trimmed })
        setText('')
        return
      }
    } catch (e) { console.error('socket send error (buyer):', e) }

    // fallback to REST if socket not connected
    try {
      await postMessageApi(conversation._id, trimmed)
    } catch (err) {
      console.error('postMessageApi error (buyer):', err)
    }
    setText('')
  }

  const emitTyping = () => {
    try {
      const now = Date.now()
      if (!socketRef.current) return
      if (now - lastTypingEmit.current < 1500) return
      lastTypingEmit.current = now
      if (conversation && conversation._id) socketRef.current.emit('typing', { conversationId: conversation._id })
    } catch (e) { console.error(e) }
  }

  return (
    <Box sx={{
      p: { xs: 1, md: 1 },
      pb: 0,
      height: '100vh',
      pt: { xs: '4rem', md: '0.25rem' },
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <Box sx={{
        display: 'flex',
        gap: 2,
        maxWidth: { xs: '100%', md: '100%' },
        mx: 'auto',
        height: { xs: 'auto', md: 'calc(100vh - 8px)' }
      }}>
        {/* Sidebar - Admin Info */}
        <Paper sx={{
          width: { xs: '100%', md: 300 },
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
          borderRadius: 3,
          overflow: 'hidden'
        }}>
          {/* Header */}
          <Box sx={{
            p: 2.5,
            background: 'linear-gradient(135deg, #5B6FD9 0%, #8B5CF6 100%)',
            color: 'white'
          }}>
            <Typography variant='h6' sx={{ fontWeight: 700, mb: 1.5 }}>
              💬 Support Chats
            </Typography>
            <Box sx={{
              p: 2,
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 2,
              textAlign: 'center'
            }}>
              <Typography variant='subtitle2' sx={{ fontWeight: 700, color: '#333', mb: 0.5 }}>
                Chat with Admin
              </Typography>
              <Typography variant='caption' sx={{ color: '#666' }}>
                {conversation?.admin?.email || 'admin@marketplace.com'}
              </Typography>
            </Box>
          </Box>

          {/* Admin Details */}
          <Box sx={{
            flex: 1,
            overflowY: 'auto',
            scrollBehavior: 'smooth',
            p: 2,
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#555',
            }
          }}>
            {conversation && (
              <Paper
                sx={{
                  p: 2.5,
                  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                  border: '2px solid #5B6FD9',
                  borderRadius: 2.5,
                  cursor: 'default'
                }}
              >
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                      fontWeight: 700,
                      mt: 0.25
                    }}
                  >
                    {conversation.admin?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography
                        variant='body2'
                        sx={{
                          fontWeight: 700,
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {conversation.admin?.name || 'Admin'}
                      </Typography>
                      {adminOnline && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: '#4caf50',
                            animation: 'pulse 2s infinite'
                          }}
                        />
                      )}
                    </Box>
                    <Typography
                      variant='caption'
                      color='textSecondary'
                      sx={{
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {conversation.admin?.email || 'admin@marketplace.com'}
                    </Typography>
                    <Typography
                      variant='caption'
                      sx={{
                        display: 'block',
                        mt: 0.5,
                        color: adminOnline ? '#4caf50' : '#999',
                        fontWeight: 500
                      }}
                    >
                      {adminOnline ? '● Online' : '● Offline'}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            )}
          </Box>

          <style>
            {`
              @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
              }
            `}
          </style>
        </Paper>
        {/* Chat Area */}
        <Paper sx={{
          flex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
          borderRadius: 3,
          overflow: 'hidden'
        }}>
          {!conversation ? (
            <Box sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
            }}>
              <Paper sx={{
                p: 4,
                textAlign: 'center',
                width: '100%',
                maxWidth: 520,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                boxShadow: '0 10px 40px rgba(31, 38, 135, 0.1)',
                borderRadius: 3
              }} elevation={0}>
                <Box sx={{
                  fontSize: 64,
                  mb: 2,
                  animation: 'bounce 2s infinite'
                }}>
                  👋
                </Box>
                <Typography variant='h5' sx={{ mb: 1, fontWeight: 700, color: '#5B6FD9' }}>
                  Loading Chat...
                </Typography>
                <Typography variant='body2' color='textSecondary' sx={{ mb: 2 }}>
                  Connecting to admin support.
                </Typography>
              </Paper>
            </Box>
          ) : (
            <>
              {/* Chat Header */}
              <Box sx={{
                p: 2.5,
                background: 'linear-gradient(135deg, #5B6FD9 0%, #8B5CF6 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                borderBottom: 'none'
              }}>
                <Avatar
                  sx={{
                    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                    fontWeight: 700,
                    width: 44,
                    height: 44
                  }}
                >
                  {conversation.admin?.name?.charAt(0)?.toUpperCase() || 'A'}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant='h6' sx={{ fontWeight: 700 }}>
                    {`Chat with ${conversation.admin?.name || 'Admin'}`}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: adminOnline ? '#4caf50' : '#bdbdbd',
                        animation: adminOnline ? 'pulse 2s infinite' : 'none'
                      }}
                    />
                    <Typography
                      variant='caption'
                      sx={{
                        color: adminOnline ? '#c8e6c9' : '#b0bec5',
                        fontWeight: 500
                      }}
                    >
                      {adminOnline ? 'Online' : 'Offline'}
                    </Typography>
                    {typingFromAdmin && (
                      <Typography variant='caption' sx={{ ml: 1, fontStyle: 'italic' }}>
                        Typing...
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Box>
                  <Typography variant='caption' sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    {conversation.admin?.email || 'admin@marketplace.com'}
                  </Typography>
                </Box>
              </Box>

              {/* Messages Area */}
              <Box sx={{
                flex: 1,
                overflowY: 'auto',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                background: '#fafafa',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#ddd',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: '#bbb',
                }
              }}>
                {messages.length === 0 ? (
                  <Box sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Paper sx={{
                      p: 4,
                      textAlign: 'center',
                      width: '100%',
                      maxWidth: 400,
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                      boxShadow: '0 10px 40px rgba(31, 38, 135, 0.1)',
                      borderRadius: 3
                    }} elevation={0}>
                      <Box sx={{
                        fontSize: 48,
                        mb: 2,
                        animation: 'bounce 2s infinite'
                      }}>
                        💬
                      </Box>
                      <Typography variant='h6' sx={{ mb: 1, fontWeight: 700, color: '#5B6FD9' }}>
                        Start the Conversation
                      </Typography>
                      <Typography variant='body2' color='textSecondary'>
                        Say hello to our admin team! They're here to help you with any questions about our products.
                      </Typography>
                    </Paper>
                  </Box>
                ) : (
                  // sort messages oldest first to make date separators consistent
                  ([...messages].sort((a,b)=> new Date(a.createdAt || a.updatedAt || a.timestamp) - new Date(b.createdAt || b.updatedAt || b.timestamp))).map((m, idx, arr) => {
                    const isAdmin = m.senderRole === 'admin' || (m.sender && m.sender.isAdmin)

                    // compute message date and whether to show a separator
                    const msgDate = new Date(m.createdAt || m.updatedAt || m.timestamp)
                    const prev = arr[idx - 1]
                    let showDate = false
                    if (!prev) showDate = true
                    else {
                      const prevDate = new Date(prev.createdAt || prev.updatedAt || prev.timestamp)
                      showDate = msgDate.toDateString() !== prevDate.toDateString()
                    }

                    // human-friendly date label
                    const now = new Date()
                    const msPerDay = 24 * 60 * 60 * 1000
                    const diffDays = Math.floor((new Date(now.getFullYear(), now.getMonth(), now.getDate()) - new Date(msgDate.getFullYear(), msgDate.getMonth(), msgDate.getDate())) / msPerDay)
                    let dateLabel = msgDate.toLocaleDateString()
                    if (diffDays === 0) dateLabel = 'Today'
                    else if (diffDays === 1) dateLabel = 'Yesterday'

                    // avatar sources
                    const senderAvatar = (m.sender && m.sender.avatar) || (isAdmin ? conversation?.admin?.avatar : loggedInUser?.avatar) || null
                    const senderInitial = (m.sender && m.sender.name && m.sender.name.charAt(0).toUpperCase()) || (isAdmin && conversation?.admin?.name ? conversation.admin.name.charAt(0).toUpperCase() : (loggedInUser && loggedInUser.name ? loggedInUser.name.charAt(0).toUpperCase() : 'U'))

                    return (
                      <Box key={m._id || idx}>
                        {showDate && (
                          <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                            <Paper sx={{ px: 2, py: 0.5, bgcolor: '#f0f4f8' }}>{dateLabel}</Paper>
                          </Box>
                        )}

                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: isAdmin ? 'flex-start' : 'flex-end',
                            alignItems: 'flex-end',
                            gap: 1,
                            animation: 'slideIn 0.3s ease'
                          }}
                        >
                          {isAdmin && (
                            <Avatar src={senderAvatar} sx={{ width: 32, height: 32 }}>
                              {senderInitial}
                            </Avatar>
                          )}

                          <Paper
                            sx={{
                              p: 1.5,
                              maxWidth: '92%',
                              background: isAdmin
                                ? '#ffffff'
                                : 'linear-gradient(135deg, #5B6FD9 0%, #8B5CF6 100%)',
                              color: isAdmin ? 'inherit' : 'white',
                              boxShadow: isAdmin
                                ? '0 2px 8px rgba(0, 0, 0, 0.08)'
                                : '0 4px 12px rgba(123, 58, 237, 0.3)',
                              borderRadius: isAdmin ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
                              wordBreak: 'break-word',
                              animation: 'slideIn 0.3s ease'
                            }}
                          >
                            <Typography variant='body2' sx={{ mb: 0.5, whiteSpace: 'pre-wrap' }}>
                              {m.message || m.content || m.text}
                            </Typography>
                            <Box sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: 1,
                              mt: 0.5
                            }}>
                              <Typography
                                variant='caption'
                                sx={{
                                  opacity: isAdmin ? 0.6 : 0.8,
                                  fontSize: '11px'
                                }}
                              >
                                {formatTimestamp(m.createdAt || m.updatedAt || m.timestamp)}
                              </Typography>
                              {!isAdmin && loggedInUser && m.sender && m.sender._id && loggedInUser._id && m.sender._id === loggedInUser._id && (
                                <Typography
                                  variant='caption'
                                  sx={{
                                    opacity: 0.9,
                                    fontSize: '11px',
                                    fontWeight: 500
                                  }}
                                >
                                  {(m.status || 'sent') === 'seen'
                                    ? '✓✓'
                                    : (m.status || 'sent') === 'delivered'
                                      ? '✓✓'
                                      : '✓'}
                                </Typography>
                              )}
                            </Box>
                          </Paper>

                          {!isAdmin && (
                            <Avatar src={senderAvatar} sx={{ width: 32, height: 32 }}>
                              {senderInitial}
                            </Avatar>
                          )}
                        </Box>
                      </Box>
                    )
                  })
                )}
                <div ref={endRef} />
              </Box>

              {/* Input Area */}
              <Box sx={{
                p: 2,
                background: '#ffffff',
                borderTop: '1px solid #e0e0e0',
                display: 'flex',
                gap: 1,
                alignItems: 'flex-end'
              }}>
                <TextField
                  value={text}
                  onChange={e => {
                    setText(e.target.value)
                    emitTyping()
                  }}
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
                  placeholder='Type your message here...'
                  multiline
                  minRows={1}
                  maxRows={4}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: '#f5f5f5',
                      '&:hover': {
                        backgroundColor: '#f0f0f0'
                      }
                    }
                  }}
                />
                <Button
                  variant='contained'
                  onClick={handleSend}
                  disabled={!text || !text.trim()}
                  sx={{
                    borderRadius: 3,
                    px: 2.5,
                    background: 'linear-gradient(135deg, #5B6FD9 0%, #8B5CF6 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)'
                    },
                    '&:disabled': {
                      background: '#ccc'
                    }
                  }}
                  endIcon={<SendIcon />}
                >
                  Send
                </Button>
              </Box>

              <style>
                {`
                  @keyframes slideIn {
                    from {
                      opacity: 0;
                      transform: translateY(10px);
                    }
                    to {
                      opacity: 1;
                      transform: translateY(0);
                    }
                  }
                  @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                  }
                  @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                  }
                `}
              </style>
            </>
          )}
        </Paper>
      </Box>
    </Box>
  )
}
