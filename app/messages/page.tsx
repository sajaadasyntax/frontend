'use client'

import { useState, useEffect } from 'react'
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
  sender?: {
    name: string
    phone: string
  }
}

export default function MessagesPage() {
  const t = useTranslations('messages')
  const tc = useTranslations('common')
  const { isAuthenticated, token } = useAuthStore()
  const router = useRouter()
  const { locale } = useLocaleStore()

  const [activeTab, setActiveTab] = useState('inbox')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [showCompose, setShowCompose] = useState(false)
  const [newMessage, setNewMessage] = useState({
    subject: '',
    content: ''
  })

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/auth/login')
      return
    }

    fetchMessages()
  }, [isAuthenticated, token, activeTab, router])

  const fetchMessages = async () => {
    if (!token) return
    
    setLoading(true)
    try {
      const data = await messagesApi.getAll(token, activeTab)
      setMessages(data)
    } catch {
      toast.error('Error loading messages')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.content || !token) {
      toast.error('Please enter a message')
      return
    }

    try {
      await messagesApi.create(newMessage, token)
      toast.success('Message sent!')
      setShowCompose(false)
      setNewMessage({ subject: '', content: '' })
      if (activeTab === 'sent') fetchMessages()
    } catch {
      toast.error('Error sending message')
    }
  }

  const isArabic = locale === 'ar'

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">{tc('loading')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" style={{ paddingLeft: '5%', paddingRight: '5%' }}>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-primary text-center mb-8">{t('title')}</h1>

        <div className="card">
          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b pb-4">
            <button
              onClick={() => setActiveTab('inbox')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'inbox'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t('inbox')}
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'sent'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t('sent')}
            </button>
            <button
              onClick={() => setShowCompose(true)}
              className="btn-primary ml-auto"
            >
              {t('compose')}
            </button>
          </div>

          {/* Compose Modal */}
          {showCompose && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
                <h2 className="text-xl font-bold text-primary mb-4">{t('newMessage')}</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('subject')}</label>
                    <input
                      type="text"
                      value={newMessage.subject}
                      onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('message')}</label>
                    <textarea
                      value={newMessage.content}
                      onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                      className="input-field h-32"
                      rows={4}
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setShowCompose(false)}
                    className="btn-outline flex-1"
                  >
                    {tc('cancel')}
                  </button>
                  <button
                    onClick={handleSendMessage}
                    className="btn-primary flex-1"
                  >
                    {t('send')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Messages List */}
          {messages.length === 0 ? (
            <p className="text-center text-gray-600 py-8">{t('noMessages')}</p>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg border ${
                    message.isRead ? 'bg-white' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      {message.subject && (
                        <h3 className="font-semibold text-primary">{message.subject}</h3>
                      )}
                      {message.isBroadcast && (
                        <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          {isArabic ? 'رسالة عامة' : 'Broadcast'}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{message.content}</p>
                  {message.sender && (
                    <p className="text-sm text-gray-500 mt-2">
                      {isArabic ? 'من:' : 'From:'} {message.sender.name || message.sender.phone}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
