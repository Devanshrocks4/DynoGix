import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, X, Send, Sparkles, User, Loader2 } from 'lucide-react'
import { useUIStore } from '../../store/useStore'
import { aiAPI } from '../../services/api'

const STARTER_PROMPTS = [
  'Summarize recent activity',
  'What workflows need attention?',
  'Show me productivity insights',
  'Detect any inefficiencies',
]

export default function AiChatPanel() {
  const { aiChatOpen, setAiChatOpen } = useUIStore()
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the DYnoGix AI assistant. I can help you analyze workflows, summarize activities, detect inefficiencies, and suggest improvements. What would you like to know?",
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    const content = text || input.trim()
    if (!content || loading) return

    setInput('')
    const newMessages = [...messages, { role: 'user', content }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const res = await aiAPI.chat(newMessages)
      setMessages([...newMessages, { role: 'assistant', content: res.message }])
    } catch {
      setMessages([...newMessages, {
        role: 'assistant',
        content: "I'm having trouble connecting to the AI service. Please ensure the backend is running and your API key is configured.",
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {aiChatOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            position: 'fixed', right: 0, top: 0, bottom: 0, width: 380, zIndex: 200,
            background: 'rgba(15,23,42,0.97)', backdropFilter: 'blur(30px)',
            borderLeft: '1px solid rgba(127,90,240,0.2)',
            display: 'flex', flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid rgba(127,90,240,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, #7F5AF0, #2CB67D)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'pulse-glow 2s infinite',
              }}>
                <Bot size={18} color="white" />
              </div>
              <div>
                <div className="font-display" style={{ fontSize: 15, fontWeight: 700, color: '#E2E8F0' }}>
                  DYnoGix AI
                </div>
                <div style={{ fontSize: 11, color: '#2CB67D', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2CB67D', display: 'inline-block' }} />
                  Online
                </div>
              </div>
            </div>
            <button onClick={() => setAiChatOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: 4 }}>
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', gap: 10, alignItems: 'flex-start',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, #FF7EB6, #7F5AF0)'
                    : 'linear-gradient(135deg, #7F5AF0, #2CB67D)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {msg.role === 'user' ? <User size={13} color="white" /> : <Bot size={13} color="white" />}
                </div>
                <div style={{
                  maxWidth: '80%', padding: '10px 14px', borderRadius: 12,
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, rgba(127,90,240,0.3), rgba(127,90,240,0.15))'
                    : 'rgba(30,41,59,0.8)',
                  border: '1px solid',
                  borderColor: msg.role === 'user' ? 'rgba(127,90,240,0.3)' : 'rgba(127,90,240,0.1)',
                  fontSize: 13, lineHeight: 1.6, color: '#CBD5E1',
                  borderBottomRightRadius: msg.role === 'user' ? 4 : 12,
                  borderBottomLeftRadius: msg.role === 'assistant' ? 4 : 12,
                }}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7F5AF0, #2CB67D)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Bot size={13} color="white" />
                </div>
                <div style={{
                  padding: '10px 14px', borderRadius: 12, background: 'rgba(30,41,59,0.8)',
                  border: '1px solid rgba(127,90,240,0.1)',
                }}>
                  <Loader2 size={16} color="#7F5AF0" style={{ animation: 'spin 1s linear infinite' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Starters */}
          {messages.length <= 1 && (
            <div style={{ padding: '0 20px 12px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {STARTER_PROMPTS.map((p) => (
                <button key={p} onClick={() => sendMessage(p)}
                  style={{
                    background: 'rgba(127,90,240,0.1)', border: '1px solid rgba(127,90,240,0.2)',
                    borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#9D7FF5',
                    cursor: 'pointer', transition: 'all 0.2s ease',
                  }}>
                  <Sparkles size={11} style={{ marginRight: 4 }} />
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(127,90,240,0.15)' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                className="input-field"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask DYnoGix AI..."
                style={{ flex: 1 }}
              />
              <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
                style={{
                  background: 'linear-gradient(135deg, #7F5AF0, #6040D0)',
                  border: 'none', borderRadius: 10, padding: '10px 14px',
                  cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                  opacity: input.trim() && !loading ? 1 : 0.5, color: 'white', flexShrink: 0,
                }}>
                <Send size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
