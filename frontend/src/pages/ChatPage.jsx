import React, { useEffect, useState, useRef } from 'react'
import io from 'socket.io-client'
import { initiateChat, getChat } from '../features/chat/ChatApi'
import { Box, Button, TextField, Paper, Typography, Avatar } from '@mui/material'
import { Send as SendIcon } from '@mui/icons-material'

function getTokenFromCookie(){
  const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'))
  return match ? match[2] : null
}

export default function ChatPage(){
  const [chat, setChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const socketRef = useRef(null)
  const messagesEndRef = useRef()

  useEffect(()=>{
    (async ()=>{
      const chatObj = await initiateChat()
      setChat(chatObj)
      const token = getTokenFromCookie()
      const socket = io(process.env.REACT_APP_BASE_URL || 'http://localhost:8000', { auth: { token } })
      socketRef.current = socket
      socket.emit('join_chat', { chatId: chatObj._id })
      socket.on('new_message', ({ chatId, message }) => {
        if (chatId === chatObj._id) setMessages(prev => [...prev, message])
      })

      // get existing messages
      const fresh = await getChat(chatObj._id)
      setMessages(fresh.messages || [])

      return ()=> socket.disconnect()
    })()
  },[])

  useEffect(()=>{ messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) },[messages])

  const send = () => {
    if(!text || !chat) return
    socketRef.current.emit('send_message', { chatId: chat._id, content: text })
    setText('')
  }

  return (
    <Box sx={{
      p: 3,
      minHeight: '100vh',
      pt: { xs: '5rem', md: '4.5rem' },
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <Paper sx={{
        maxWidth: 800,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        height: { xs: 'auto', md: '85vh' },
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
        borderRadius: 3,
        overflow: 'hidden'
      }}>
        {/* Header */}
        <Box sx={{
          p: 2.5,
          background: 'linear-gradient(135deg, #5B6FD9 0%, #8B5CF6 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Avatar
            sx={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
              fontWeight: 700,
              width: 44,
              height: 44
            }}
          >
            A
          </Avatar>
          <Box>
            <Typography variant='h6' sx={{ fontWeight: 700 }}>
              💬 Chat with Admin
            </Typography>
            <Typography variant='caption' sx={{ opacity: 0.9 }}>
              Get instant support
            </Typography>
          </Box>
        </Box>

        {/* Messages Area */}
        <Box sx={{
          flex: 1,
          overflowY: 'auto',
          p: 3,
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
                  👋
                </Box>
                <Typography variant='h6' sx={{ mb: 1, fontWeight: 700, color: '#1976d2' }}>
                  Start the Conversation
                </Typography>
                <Typography variant='body2' color='textSecondary'>
                  Say hello! Our support team is ready to help you.
                </Typography>
              </Paper>
            </Box>
          ) : (
            messages.map((m, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: 1,
                  animation: 'slideIn 0.3s ease'
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                    fontSize: 12,
                    fontWeight: 700
                  }}
                >
                  {(m.sender?.name || 'A').charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant='caption' sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                    {m.sender?.name || 'User'}
                  </Typography>
                  <Paper sx={{
                    p: 1.5,
                    maxWidth: 400,
                    background: '#ffffff',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    borderRadius: '18px 18px 18px 4px',
                    animation: 'slideIn 0.3s ease'
                  }} elevation={0}>
                    <Typography variant='body2'>
                      {m.content}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            ))
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
            onChange={e => setText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (text.trim()) send()
                return
              }
            }}
            fullWidth
            placeholder='Type your message...'
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
            onClick={send}
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
          `}
        </style>
      </Paper>
    </Box>
  )
}
