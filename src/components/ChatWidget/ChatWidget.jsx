import { useState, useRef, useEffect } from 'react'
import { FiMessageSquare, FiX, FiSend } from 'react-icons/fi'
import { supabase } from '../../lib/supabase'
import './ChatWidget.css'

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '안녕하세요! 드림아이티비즈 AI 어시스턴트입니다. 강의, 수강 신청, 결제 등 궁금한 점을 물어보세요 😊',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg = { role: 'user', content: text }
    const nextMessages = [...messages, userMsg]

    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        },
      })

      if (error) throw error

      const reply = data?.choices?.[0]?.message?.content ?? '응답을 받을 수 없습니다.'
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '죄송합니다. 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      ])
      console.error('Chat error:', err)
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header__info">
              <div className="chat-header__avatar">AI</div>
              <div>
                <div className="chat-header__name">DreamIT Biz 어시스턴트</div>
                <div className="chat-header__status">
                  <span className="status-dot" />
                  온라인
                </div>
              </div>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)}>
              <FiX size={18} />
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-message chat-message--${msg.role}`}>
                {msg.role === 'assistant' && (
                  <div className="chat-bubble__avatar">AI</div>
                )}
                <div className="chat-bubble">{msg.content}</div>
              </div>
            ))}
            {loading && (
              <div className="chat-message chat-message--assistant">
                <div className="chat-bubble__avatar">AI</div>
                <div className="chat-bubble chat-bubble--typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-row">
            <textarea
              ref={inputRef}
              className="chat-input"
              placeholder="메시지를 입력하세요..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading}
            />
            <button
              className="chat-send"
              onClick={sendMessage}
              disabled={!input.trim() || loading}
            >
              <FiSend size={18} />
            </button>
          </div>
        </div>
      )}

      <button
        className={`chat-fab ${open ? 'chat-fab--open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="채팅 열기"
      >
        {open ? <FiX size={24} /> : <FiMessageSquare size={24} />}
      </button>
    </div>
  )
}
