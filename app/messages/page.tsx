'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useLocaleStore } from '@/store/locale-store'
import { useAuthStore } from '@/store/auth-store'
import { messagesApi } from '@/lib/api'
import toast from 'react-hot-toast'

interface Message {
  id: string
  subject: string
  content: string
  isRead: boolean
  isBroadcast: boolean
  createdAt: string
  senderId: string
  sender?: {
    id: string
    name: string
    phone: string
    role: string
  }
}

export default function MessagesPage() {
  const t = useTranslations('messages')
  const tc = useTranslations('common')
  const { isAuthenticated, token, user } = useAuthStore()
  const router = useRouter()
  const { locale } = useLocaleStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')

  const isArabic = locale === 'ar'

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/auth/login')
      return
    }

    fetchMessages()
  }, [isAuthenticated, token, router])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchMessages = async () => {
    if (!token) return
    
    setLoading(true)
    try {
      // Fetch both inbox and sent messages
      const [inboxData, sentData] = await Promise.all([
        messagesApi.getAll(token, 'inbox'),
        messagesApi.getAll(token, 'sent')
      ])
      
      // Mark all unread inbox messages as read
      const unreadInboxMessages = inboxData.filter((m: Message) => !m.isRead && m.senderId !== user?.id)
      for (const msg of unreadInboxMessages) {
        try {
          await messagesApi.markAsRead(msg.id, token)
        } catch (error) {
          console.error('Error marking message as read:', error)
        }
      }
      
      // Combine and deduplicate messages
      const allMessages = [...inboxData, ...sentData]
      const uniqueMessages = allMessages.filter((msg, index, self) =>
        index === self.findIndex((m) => m.id === msg.id)
      )
      
      // Sort messages by date (oldest first for chat)
      const sorted = uniqueMessages.sort((a: Message, b: Message) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
      
      // Mark all messages as read in the UI
      const markedMessages = sorted.map(m => ({ ...m, isRead: true }))
      setMessages(markedMessages)
    } catch {
      toast.error('Error loading messages')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !token) {
      return
    }

    try {
      await messagesApi.create({ content: newMessage, subject: '' }, token)
      setNewMessage('')
      fetchMessages()
    } catch {
      toast.error('Error sending message')
    }
  }

  const isMyMessage = (message: Message) => {
    return message.senderId === user?.id
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">{tc('loading')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8 px-3 md:px-[5%]">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-4xl font-bold text-primary text-center mb-4 md:mb-6">
          {t('title')}
        </h1>

        {/* Chat Container */}
        <div className="bg-white rounded-xl shadow-md flex flex-col h-[70vh]">
          {/* Messages Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <p className="text-4xl mb-4">💬</p>
                <p>{isArabic ? 'ابدأ محادثة مع الدعم الفني' : 'Start a conversation with support'}</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = isMyMessage(message)
                const isAdmin = message.sender?.role === 'ADMIN'
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        isOwn
                          ? 'bg-primary text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}
                    >
                      {/* Sender Name for admin messages */}
                      {!isOwn && isAdmin && (
                        <p className="text-xs font-semibold text-secondary mb-1">
                          {isArabic ? 'الدعم الفني' : 'Support'}
                        </p>
                      )}
                      
                      {/* Broadcast badge */}
                      {message.isBroadcast && (
                        <span className={`inline-block px-2 py-0.5 text-[10px] rounded-full mb-1 ${
                          isOwn ? 'bg-white bg-opacity-20' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {isArabic ? 'رسالة عامة' : 'Broadcast'}
                        </span>
                      )}
                      
                      {/* Subject */}
                      {message.subject && (
                        <p className={`font-semibold text-sm ${isOwn ? 'text-white' : 'text-primary'}`}>
                          {message.subject}
                        </p>
                      )}
                      
                      {/* Content */}
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      
                      {/* Time */}
                      <p className={`text-[10px] mt-1 ${isOwn ? 'text-white text-opacity-70' : 'text-gray-500'}`}>
                        {new Date(message.createdAt).toLocaleString(isArabic ? 'ar-EG' : 'en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={isArabic ? 'اكتب رسالتك...' : 'Type your message...'}
                className="flex-1 input-field"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="btn-primary px-6 disabled:opacity-50"
              >
                {isArabic ? 'إرسال' : 'Send'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
