'use client'

import { useState, useEffect, useRef } from 'react'
import { useLocaleStore } from '@/store/locale-store'
import { useAuthStore } from '@/store/auth-store'
import { messagesApi, usersApi } from '@/lib/api'
import toast from 'react-hot-toast'

interface Message {
  id: string
  subject: string
  content: string
  isRead: boolean
  isBroadcast: boolean
  createdAt: string
  senderId: string
  receiverId: string | null
  sender?: { id: string; name: string; phone: string; role: string }
  receiver?: { id: string; name: string; phone: string }
}

interface User {
  id: string
  name: string
  phone: string
}

interface Conversation {
  id: string
  name: string
  phone: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

export default function AdminMessagesPage() {
  const { locale } = useLocaleStore()
  const { token, user: currentUser } = useAuthStore()
  const isArabic = locale === 'ar'
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [showBroadcast, setShowBroadcast] = useState(false)
  const [broadcastMessage, setBroadcastMessage] = useState({ subject: '', content: '' })
  const [showNewChat, setShowNewChat] = useState(false)
  const [searchUser, setSearchUser] = useState('')

  useEffect(() => {
    if (!token) return
    fetchData()
  }, [token])

  useEffect(() => {
    if (selectedUser) {
      scrollToBottom()
    }
  }, [messages, selectedUser])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchData = async () => {
    if (!token) return
    
    setLoading(true)
    try {
      const [messagesData, usersData] = await Promise.all([
        messagesApi.getAll(token),
        usersApi.getAll(token)
      ])
      
      setMessages(messagesData)
      
      // Filter to only regular users
      const regularUsers = usersData.filter((u: User & { role?: string }) => u.role !== 'ADMIN')
      setUsers(regularUsers)
      
      // Build conversations list
      const convMap = new Map<string, Conversation>()
      messagesData.forEach((msg: Message) => {
        // Get the other party in the conversation
        let userId: string
        let userName: string
        let userPhone: string
        
        if (msg.sender?.role !== 'ADMIN') {
          userId = msg.senderId
          userName = msg.sender?.name || ''
          userPhone = msg.sender?.phone || ''
        } else if (msg.receiver) {
          userId = msg.receiverId!
          userName = msg.receiver.name
          userPhone = msg.receiver.phone
        } else {
          return // Skip broadcast messages for conversation list
        }
        
        if (!convMap.has(userId)) {
          convMap.set(userId, {
            id: userId,
            name: userName,
            phone: userPhone,
            lastMessage: msg.content,
            lastMessageTime: msg.createdAt,
            unreadCount: 0
          })
        } else {
          const existing = convMap.get(userId)!
          if (new Date(msg.createdAt) > new Date(existing.lastMessageTime)) {
            existing.lastMessage = msg.content
            existing.lastMessageTime = msg.createdAt
          }
        }
        
        if (!msg.isRead && msg.sender?.role !== 'ADMIN') {
          const conv = convMap.get(userId)!
          conv.unreadCount++
        }
      })
      
      const sortedConversations = Array.from(convMap.values()).sort(
        (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      )
      
      setConversations(sortedConversations)
    } catch {
      toast.error('Error loading data')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectConversation = (conv: Conversation) => {
    const user = users.find(u => u.id === conv.id) || { id: conv.id, name: conv.name, phone: conv.phone }
    setSelectedUser(user)
  }

  const handleStartNewChat = (user: User) => {
    setSelectedUser(user)
    setShowNewChat(false)
    setSearchUser('')
  }

  const getConversationMessages = () => {
    if (!selectedUser) return []
    return messages
      .filter(m => 
        m.senderId === selectedUser.id || 
        m.receiverId === selectedUser.id ||
        (m.isBroadcast && m.sender?.role === 'ADMIN')
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !token || !selectedUser) return

    try {
      await messagesApi.create({
        content: newMessage,
        subject: '',
        receiverId: selectedUser.id,
        isBroadcast: false
      }, token)
      
      setNewMessage('')
      fetchData()
    } catch {
      toast.error(isArabic ? 'خطأ في إرسال الرسالة' : 'Error sending message')
    }
  }

  const handleSendBroadcast = async () => {
    if (!broadcastMessage.content || !token) {
      toast.error(isArabic ? 'يرجى إدخال الرسالة' : 'Please enter a message')
      return
    }

    try {
      await messagesApi.create({
        ...broadcastMessage,
        isBroadcast: true
      }, token)

      toast.success(isArabic ? 'تم إرسال الرسالة بنجاح' : 'Message sent successfully')
      setShowBroadcast(false)
      setBroadcastMessage({ subject: '', content: '' })
      fetchData()
    } catch {
      toast.error(isArabic ? 'خطأ في إرسال الرسالة' : 'Error sending message')
    }
  }

  const conversationMessages = getConversationMessages()

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-primary">
          {isArabic ? 'الرسائل' : 'Messages'}
        </h1>
        <button
          onClick={() => setShowBroadcast(true)}
          className="btn-primary"
        >
          📢 {isArabic ? 'رسالة جماعية' : 'Broadcast'}
        </button>
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-lg max-h-[80vh] flex flex-col">
            <h2 className="text-xl font-bold text-primary mb-4">
              {isArabic ? 'بدء محادثة جديدة' : 'Start New Chat'}
            </h2>
            
            <div className="mb-4">
              <input
                type="text"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                placeholder={isArabic ? 'ابحث عن مستخدم...' : 'Search for a user...'}
                className="input-field w-full"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {users
                .filter(u => 
                  u.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
                  u.phone?.includes(searchUser)
                )
                .map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleStartNewChat(user)}
                    className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <p className="font-semibold text-primary">
                      {user.name || user.phone}
                    </p>
                    {user.name && (
                      <p className="text-xs text-gray-500">{user.phone}</p>
                    )}
                  </div>
                ))}
              
              {users.filter(u => 
                u.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
                u.phone?.includes(searchUser)
              ).length === 0 && (
                <p className="text-center text-gray-500 py-8 text-sm">
                  {isArabic ? 'لا يوجد مستخدمون مطابقون' : 'No matching users found'}
                </p>
              )}
            </div>

            <div className="mt-4">
              <button
                onClick={() => {
                  setShowNewChat(false)
                  setSearchUser('')
                }}
                className="btn-outline w-full"
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcast && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-primary mb-4">
              {isArabic ? 'رسالة جماعية لجميع المستخدمين' : 'Broadcast to All Users'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'الموضوع' : 'Subject'}
                </label>
                <input
                  type="text"
                  value={broadcastMessage.subject}
                  onChange={(e) => setBroadcastMessage({ ...broadcastMessage, subject: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'الرسالة' : 'Message'}
                </label>
                <textarea
                  value={broadcastMessage.content}
                  onChange={(e) => setBroadcastMessage({ ...broadcastMessage, content: e.target.value })}
                  className="input-field h-32"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowBroadcast(false)}
                className="btn-outline flex-1"
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleSendBroadcast}
                className="btn-primary flex-1"
              >
                {isArabic ? 'إرسال للجميع' : 'Send to All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-600">{isArabic ? 'جاري التحميل...' : 'Loading...'}</p>
      ) : (
        <div className="bg-white rounded-xl shadow-md flex flex-col md:flex-row h-[70vh]">
          {/* Conversations List */}
          <div className={`w-full md:w-80 border-b md:border-b-0 md:border-r border-gray-200 overflow-y-auto flex flex-col ${
            selectedUser ? 'hidden md:flex' : ''
          }`}>
            <div className="p-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-primary">
                {isArabic ? 'المحادثات' : 'Conversations'}
              </h3>
              <button
                onClick={() => setShowNewChat(true)}
                className="btn-primary text-xs px-3 py-1"
                title={isArabic ? 'محادثة جديدة' : 'New Chat'}
              >
                ➕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <p className="text-center text-gray-500 py-8 text-sm">
                  {isArabic ? 'لا توجد محادثات' : 'No conversations'}
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedUser?.id === conv.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-primary text-sm truncate">
                          {conv.name || conv.phone}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(conv.lastMessageTime).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${!selectedUser ? 'hidden md:flex' : ''}`}>
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="p-3 border-b border-gray-200 flex items-center gap-3">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="md:hidden text-primary"
                  >
                    ←
                  </button>
                  <div>
                    <p className="font-semibold text-primary">
                      {selectedUser.name || selectedUser.phone}
                    </p>
                    {selectedUser.name && (
                      <p className="text-xs text-gray-500">{selectedUser.phone}</p>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {conversationMessages.map((message) => {
                    const isAdmin = message.sender?.role === 'ADMIN'
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                            isAdmin
                              ? 'bg-primary text-white rounded-br-sm'
                              : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                          }`}
                        >
                          {message.isBroadcast && (
                            <span className={`inline-block px-2 py-0.5 text-[10px] rounded-full mb-1 ${
                              isAdmin ? 'bg-white bg-opacity-20' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {isArabic ? 'رسالة عامة' : 'Broadcast'}
                            </span>
                          )}
                          
                          {message.subject && (
                            <p className={`font-semibold text-sm ${isAdmin ? 'text-white' : 'text-primary'}`}>
                              {message.subject}
                            </p>
                          )}
                          
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          
                          <p className={`text-[10px] mt-1 ${isAdmin ? 'text-white text-opacity-70' : 'text-gray-500'}`}>
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
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200">
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
                      className="btn-primary px-4 md:px-6 disabled:opacity-50"
                    >
                      {isArabic ? 'إرسال' : 'Send'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <p className="text-4xl mb-4">💬</p>
                  <p>{isArabic ? 'اختر محادثة للبدء' : 'Select a conversation to start'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
