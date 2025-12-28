import React, { useEffect, useState, useRef } from 'react'
import io from 'socket.io-client'
import { useSelector } from 'react-redux'
import { selectLoggedInUser } from '../features/auth/AuthSlice'
import { getAdminConversations, getAdminConversationMessages, postMessageApi } from '../features/chat/ChatApi'
import { Box, Button, TextField, Paper, Typography, Avatar, InputAdornment, IconButton } from '@mui/material'
import { Send as SendIcon, AttachFile as AttachFileIcon, EmojiEmotions as EmojiIcon } from '@mui/icons-material'
import formatTimestamp from '../utils/formatTimestamp'
import timeAgo from '../utils/timeAgo'

function getTokenFromCookie(){
  const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'))
  return match ? match[2] : null
}

export default function AdminChatPage(){
  const [conversations, setConversations] = useState([])
  const [lastSeenMap, setLastSeenMap] = useState({})
  const [active, setActive] = useState(null)
  const activeRef = React.useRef(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [search, setSearch] = useState('')
  const [buyerOnline, setBuyerOnline] = useState(false)
  const [typingFromBuyer, setTypingFromBuyer] = useState(false)
  const socketRef = useRef(null)
  const messagesEndRef = useRef()
  const loggedInUser = useSelector(selectLoggedInUser)
  const typingTimerRef = useRef(null)
  const lastTypingEmit = useRef(0)

  useEffect(()=>{
    (async ()=>{
      const list = await getAdminConversations()
      setConversations(list)
      const token = getTokenFromCookie()
      const socket = io(process.env.REACT_APP_BASE_URL || 'http://localhost:8000', { withCredentials: true, auth: { token } })
      socketRef.current = socket
      // receiveMessage used by server
      socket.on('connect', () => {
        console.log('socket connected (admin list):', socket.id)
        // join all existing admin conversations so admin receives presence updates
        try {
          if (Array.isArray(list)) {
            list.forEach(c => {
              if (c && c._id) socket.emit('joinConversation', { conversationId: c._id })
            })
          }
        } catch (e) { console.error('join all convs error', e) }
      })
      socket.on('connect_error', (err) => console.error('socket connect_error (admin list):', err))
      socket.on('participant:online', ({ conversationId: cid, userId, role }) => {
        console.log('participant:online', { cid, userId, role })
        // mark conversation as online only when the participant that joined is the buyer
        if (role === 'buyer') {
          setConversations(prev => prev.map(c => c._id === cid ? { ...c, online: true } : c))
          setLastSeenMap(prev => ({ ...prev, [cid]: null }))
          if (activeRef.current && activeRef.current._id === cid) setBuyerOnline(true)
        }
      })
      socket.on('participant:offline', ({ conversationId: cid, userId, role }) => {
        console.log('participant:offline', { cid, userId, role })
        if (role === 'buyer') {
          const ts = Date.now()
          setConversations(prev => prev.map(c => c._id === cid ? { ...c, online: false } : c))
          setLastSeenMap(prev => ({ ...prev, [cid]: ts }))
          if (activeRef.current && activeRef.current._id === cid) setBuyerOnline(false)
        }
      })
      socket.on('typing', ({ conversationId: cid, userId }) => {
        if (activeRef.current && activeRef.current._id === cid) {
          setTypingFromBuyer(true)
          if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
          typingTimerRef.current = setTimeout(()=> setTypingFromBuyer(false), 2500)
        }
      })
      socket.on('receiveMessage', ({ conversationId, message }) => {
        console.log('socket receiveMessage', conversationId, message)
        // if active chat is open, append to messages with dedupe using ref
        const currentActive = activeRef.current
        if (currentActive && conversationId === currentActive._id) {
          setMessages(prev => {
            if (!message || !message._id) return [...prev, message]
            if (prev.some(m => m._id && m._id.toString() === message._id.toString())) return prev
            console.log('admin list receiveMessage append', message._id, Date.now())
            // acknowledge delivery if message is from buyer
            try {
              if (message && message.senderRole === 'buyer' && loggedInUser && loggedInUser._id && message.sender && message.sender._id && message.sender._id !== loggedInUser._id) {
                socket.emit('message:delivered', { messageId: message._id })
              }
            } catch(e) { console.error(e) }
            return [...prev, message]
          })
        }
        // ensure lastMessage is a string to avoid rendering objects
        const lastMsgText = typeof message === 'string' ? message : (message && (message.message || message.content)) || ''
        setConversations(prev => prev.map(c => c._id===conversationId?{...c, lastMessage: lastMsgText}:c))
      })

      // listen for status updates to update UI
      const safeId = id => (id && id.toString) ? id.toString() : String(id)
      socket.on('message:delivered', ({ messageId, conversationId: cid }) => {
        const mid = safeId(messageId)
        setMessages(prev => prev.map(m => (m._id && safeId(m._id) === mid) ? { ...m, status: 'delivered' } : m))
      })
      socket.on('message:seen', ({ conversationId: cid, messageIds }) => {
        if (Array.isArray(messageIds)) {
          const ids = messageIds.map(safeId)
          setMessages(prev => prev.map(m => (m._id && ids.includes(safeId(m._id))) ? { ...m, status: 'seen' } : m))
        }
      })
    })()

    return () => { if (socketRef.current) socketRef.current.disconnect() }
  },[])

  useEffect(()=>{ messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) },[messages])

  const openChat = async (conv) => {
    setActive(conv)
    activeRef.current = conv
    const res = await getAdminConversationMessages(conv._id)
    setMessages(res.messages || [])
    socketRef.current.emit('joinConversation', { conversationId: conv._id })
    // mark messages from buyer as seen when admin opens chat
    try { if (conv && conv.buyer && conv.buyer._id) socketRef.current.emit('message:seen', { conversationId: conv._id, senderId: conv.buyer._id }) } catch(e) {}
    // visually clear unread indicator for this conversation
    setConversations(prev => prev.map(c => c._id === conv._id ? { ...c, unreadCount: 0 } : c))
  }

  const send = async () => {
    if(!text || !active) return
    const trimmed = (text || '').trim()
    if (!trimmed) return
    try {
      const s = socketRef.current
      if (s && s.connected) {
        s.emit('sendMessage', { conversationId: active._id, message: trimmed })
        setText('')
        return
      }
    } catch (e) { console.error('socket send error (admin list):', e) }
    // fallback to REST
    try {
      await postMessageApi(active._id, trimmed)
    } catch (err) {
      console.error('postMessageApi error (admin list):', err)
    }
    setText('')
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
        {/* Sidebar - Conversations List */}
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
            <TextField
              size='small'
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Search buyers...'
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)'
                  }
                },
                '& .MuiOutlinedInput-input::placeholder': {
                  opacity: 0.7
                }
              }}
            />
          </Box>

          {/* Conversations List */}
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
            {conversations.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant='body2' color='textSecondary' sx={{ opacity: 0.7 }}>
                  No buyer conversations yet
                </Typography>
              </Box>
            ) : (
              conversations
                .filter(c => {
                  if (!search) return true
                  const s = search.toLowerCase()
                  return (
                    (c.buyer && c.buyer.name && c.buyer.name.toLowerCase().includes(s)) ||
                    (c.buyer && c.buyer.email && c.buyer.email.toLowerCase().includes(s))
                  )
                })
                .map(c => (
                  <Paper
                    key={c._id}
                    onClick={() => openChat(c)}
                    sx={{
                      p: 2,
                      mb: 2,
                      background: active?._id === c._id ? 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' : '#fff',
                      border: active?._id === c._id ? '2px solid #5B6FD9' : '1px solid #e0e0e0',
                      borderRadius: 2.5,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(91, 111, 217, 0.15)',
                        transform: 'translateY(-2px)',
                        background: active?._id === c._id ? 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' : 'linear-gradient(135deg, #f8f9ff 0%, #f5f7ff 100%)'
                      }
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
                        {c.buyer?.name?.charAt(0)?.toUpperCase() || 'B'}
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
                            {c.buyer?.name || 'Buyer'}
                          </Typography>
                          {c.online && (
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
                          {c.buyer?.email || ''}
                        </Typography>
                        <Typography
                          variant='caption'
                          sx={{
                            display: 'block',
                            mt: 0.5,
                            color: c.online ? '#4caf50' : '#999',
                            fontWeight: 500
                          }}
                        >
                          {c.online ? '● Online' : (lastSeenMap[c._id] ? `Last seen: ${timeAgo(lastSeenMap[c._id])}` : 'Offline')}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                ))
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
          {!active ? (
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
                maxWidth: 640,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                boxShadow: '0 10px 40px rgba(31, 38, 135, 0.1)',
                borderRadius: 3
              }} elevation={0}>
                <Box sx={{
                  fontSize: 72,
                  mb: 3,
                  animation: 'bounce 2s infinite'
                }}>
                  👋
                </Box>
                <Typography variant='h5' sx={{ mb: 1, fontWeight: 700, color: '#5B6FD9' }}>
                  No Conversation Selected
                </Typography>
                <Typography variant='body2' color='textSecondary' sx={{ mb: 2 }}>
                  Choose a buyer from the left sidebar to start chatting or helping them.
                </Typography>
                <Typography variant='caption' color='textSecondary' sx={{ opacity: 0.6 }}>
                  Use the search feature to quickly find buyers
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
                  {active.buyer?.name?.charAt(0)?.toUpperCase() || 'B'}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant='h6' sx={{ fontWeight: 700 }}>
                    {`Chat with ${active.buyer?.name || 'Buyer'}`}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: buyerOnline ? '#4caf50' : '#bdbdbd',
                        animation: buyerOnline ? 'pulse 2s infinite' : 'none'
                      }}
                    />
                    <Typography
                      variant='caption'
                      sx={{
                        color: buyerOnline ? '#c8e6c9' : '#b0bec5',
                        fontWeight: 500
                      }}
                    >
                      {buyerOnline ? 'Online' : 'Offline'}
                    </Typography>
                    {typingFromBuyer && (
                      <Typography variant='caption' sx={{ ml: 1, fontStyle: 'italic' }}>
                        Typing...
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Box>
                  <Typography variant='caption' sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    {active.buyer?.email || ''}
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
                    <Typography color='textSecondary' sx={{ opacity: 0.5 }}>
                      No messages yet. Start the conversation!
                    </Typography>
                  </Box>
                ) : (
                  // ensure messages are in chronological order (oldest first)
                  ([...messages].sort((a,b)=> new Date(a.createdAt || a.updatedAt || a.timestamp) - new Date(b.createdAt || b.updatedAt || b.timestamp))).map((m, idx, arr) => {
                    const isCurrent = m.sender && loggedInUser && m.sender._id && m.sender._id === loggedInUser._id
                    // compute date separator
                    const msgDate = new Date(m.createdAt || m.updatedAt || m.timestamp)
                    const prev = arr[idx - 1]
                    let showDate = false
                    if (!prev) showDate = true
                    else {
                      const prevDate = new Date(prev.createdAt || prev.updatedAt || prev.timestamp)
                      showDate = msgDate.toDateString() !== prevDate.toDateString()
                    }

                    const now = new Date()
                    const msPerDay = 24 * 60 * 60 * 1000
                    const diffDays = Math.floor((new Date(now.getFullYear(), now.getMonth(), now.getDate()) - new Date(msgDate.getFullYear(), msgDate.getMonth(), msgDate.getDate())) / msPerDay)
                    let dateLabel = msgDate.toLocaleDateString()
                    if (diffDays === 0) dateLabel = 'Today'
                    else if (diffDays === 1) dateLabel = 'Yesterday'

                    // avatar handling
                    const senderAvatar = (m.sender && m.sender.avatar) || (m.senderRole === 'buyer' ? active?.buyer?.avatar : loggedInUser?.avatar) || null
                    const senderInitial = (m.sender && m.sender.name && m.sender.name.charAt(0).toUpperCase()) || (m.senderRole === 'buyer' && active?.buyer?.name ? active.buyer.name.charAt(0).toUpperCase() : (loggedInUser && loggedInUser.name ? loggedInUser.name.charAt(0).toUpperCase() : 'U'))

                    return (
                      <Box key={m._id || idx}>
                        {showDate && (
                          <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                            <Paper sx={{ px: 2, py: 0.5, bgcolor: '#f0f4f8' }}>{dateLabel}</Paper>
                          </Box>
                        )}

                        <Box
                          key={m._id || idx}
                          sx={{
                            display: 'flex',
                            justifyContent: isCurrent ? 'flex-end' : 'flex-start',
                            alignItems: 'flex-end',
                            gap: 1,
                            animation: 'slideIn 0.3s ease'
                          }}
                        >
                          {!isCurrent && (
                            <Avatar src={senderAvatar} sx={{ width: 40, height: 40 }}>
                              {senderInitial}
                            </Avatar>
                          )}
                          <Paper
                            sx={{
                              p: 2.5,
                              maxWidth: '92%',
                              background: isCurrent
                                ? 'linear-gradient(135deg, #5B6FD9 0%, #8B5CF6 100%)'
                                : '#ffffff',
                              color: isCurrent ? 'white' : 'inherit',
                              boxShadow: isCurrent
                                ? '0 4px 12px rgba(123, 58, 237, 0.3)'
                                : '0 2px 8px rgba(0, 0, 0, 0.08)',
                              borderRadius: isCurrent ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                              wordBreak: 'break-word',
                              animation: 'slideIn 0.3s ease'
                            }}
                          >
                            <Typography variant='body1' sx={{ mb: 0.5, fontSize: '1rem', whiteSpace: 'pre-wrap' }}>
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
                                  opacity: isCurrent ? 0.8 : 0.6,
                                  fontSize: '11px'
                                }}
                              >
                                {formatTimestamp(m.createdAt || m.updatedAt || m.timestamp)}
                              </Typography>
                              {isCurrent && (
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
                          {isCurrent && (
                            <Avatar src={senderAvatar} sx={{ width: 40, height: 40 }}>
                              {senderInitial}
                            </Avatar>
                          )}
                        </Box>
                      </Box>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
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
                  disabled={!active}
                  onChange={e => {
                    setText(e.target.value)
                    try {
                      const now = Date.now()
                      if (!socketRef.current) return
                      if (!active) return
                      if (now - lastTypingEmit.current > 1500 && active && active._id) {
                        socketRef.current.emit('typing', { conversationId: active._id })
                        lastTypingEmit.current = now
                      }
                    } catch (e) { }
                  }}
                  onKeyDown={e => {
                    if (!active) return
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      const trimmed = (text || '').trim()
                      if (trimmed) send()
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
                  placeholder={active ? 'Type your message here...' : 'Select a chat to start messaging'}
                  multiline
                  minRows={2}
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
                  onClick={send}
                  disabled={!active || !text || !text.trim()}
                  sx={{
                    borderRadius: 3,
                    px: 3,
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
                `}
              </style>
            </>
          )}
        </Paper>
      </Box>
    </Box>
  )
}
