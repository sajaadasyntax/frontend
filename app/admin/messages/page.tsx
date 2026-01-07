'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
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
  sender?: { name: string; phone: string }
  receiver?: { name: string; phone: string }
}

interface User {
  id: string
  name: string
  phone: string
}

export default function AdminMessagesPage() {
  const searchParams = useSearchParams()
  const showBroadcast = searchParams.get('compose') === 'broadcast'
  const { locale } = useLocaleStore()
  const { token } = useAuthStore()
  const isArabic = locale === 'ar'

  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCompose, setShowCompose] = useState(showBroadcast)
  const [messageType, setMessageType] = useState<'single' | 'broadcast'>('broadcast')
  const [newMessage, setNewMessage] = useState({
    subject: '',
    content: '',
    receiverId: '',
    isBroadcast: true
  })

  useEffect(() => {
    if (!token) return
    fetchMessages()
    fetchUsers()
  }, [token])

  const fetchMessages = async () => {
    if (!token) return
    
    try {
      const data = await messagesApi.getAll(token)
      setMessages(data)
    } catch {
      toast.error('Error loading messages')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    if (!token) return
    
    try {
      const data = await usersApi.getAll(token)
      setUsers(data)
    } catch {}
  }

  const handleSendMessage = async () => {
    if (!newMessage.content || !token) {
      toast.error(isArabic ? 'يرجى إدخال الرسالة' : 'Please enter a message')
      return
    }

    try {
      await messagesApi.create({
        ...newMessage,
        isBroadcast: messageType === 'broadcast'
      }, token)

      toast.success(isArabic ? 'تم إرسال الرسالة بنجاح' : 'Message sent successfully')
      setShowCompose(false)
      setNewMessage({ subject: '', content: '', receiverId: '', isBroadcast: true })
      fetchMessages()
    } catch {
      toast.error(isArabic ? 'خطأ في إرسال الرسالة' : 'Error sending message')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">
          {isArabic ? 'الرسائل' : 'Messages'}
        </h1>
        <button
          onClick={() => setShowCompose(true)}
          className="btn-primary"
        >
          📢 {isArabic ? 'إرسال رسالة' : 'Send Message'}
        </button>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <h2 className="text-xl font-bold text-primary mb-4">
              {isArabic ? 'إرسال رسالة جديدة' : 'Send New Message'}
            </h2>
            
            {/* Message Type Toggle */}
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setMessageType('broadcast')}
                className={`flex-1 py-2 rounded-lg transition-colors ${
                  messageType === 'broadcast' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                📢 {isArabic ? 'رسالة جماعية' : 'Broadcast'}
              </button>
              <button
                onClick={() => setMessageType('single')}
                className={`flex-1 py-2 rounded-lg transition-colors ${
                  messageType === 'single' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                👤 {isArabic ? 'رسالة فردية' : 'Single User'}
              </button>
            </div>

            {messageType === 'single' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'إلى' : 'To'}
                </label>
                <select
                  value={newMessage.receiverId}
                  onChange={(e) => setNewMessage({ ...newMessage, receiverId: e.target.value })}
                  className="select-field"
                  required
                >
                  <option value="">{isArabic ? 'اختر المستخدم' : 'Select User'}</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.phone}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'الموضوع' : 'Subject'}
                </label>
                <input
                  type="text"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'الرسالة' : 'Message'}
                </label>
                <textarea
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                  className="input-field h-32"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowCompose(false)}
                className="btn-outline flex-1"
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleSendMessage}
                className="btn-primary flex-1"
              >
                {isArabic ? 'إرسال' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages List */}
      {loading ? (
        <p className="text-gray-600">{isArabic ? 'جاري التحميل...' : 'Loading...'}</p>
      ) : messages.length === 0 ? (
        <p className="text-center text-gray-600 py-8">
          {isArabic ? 'لا توجد رسائل' : 'No messages'}
        </p>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  {message.subject && (
                    <h3 className="font-semibold text-primary">{message.subject}</h3>
                  )}
                  {message.isBroadcast && (
                    <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      {isArabic ? 'رسالة جماعية' : 'Broadcast'}
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(message.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700">{message.content}</p>
              {message.receiver && (
                <p className="text-sm text-gray-500 mt-2">
                  {isArabic ? 'إلى:' : 'To:'} {message.receiver.name || message.receiver.phone}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
