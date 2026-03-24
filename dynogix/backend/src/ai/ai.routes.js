const express = require('express')
const { authenticate } = require('../middlewares/auth.middleware')

const router = express.Router()

const SYSTEM_PROMPT = `You are DYnoGix AI, an intelligent internal operations assistant for an enterprise platform.

You help users with:
- Analyzing workflow performance and bottlenecks
- Summarizing recent activity and audit logs  
- Detecting operational inefficiencies
- Suggesting improvements to processes
- Explaining system status and metrics
- Answering questions about issues, assets, and team productivity

Context about DYnoGix:
- It's an enterprise operations platform managing Issues, Assets, Workflows, Audit Logs, and User Roles
- Issues follow workflow: Open → In Progress → Resolved → Closed
- Assets follow workflow: Available → Assigned → In Use → Maintenance → Retired
- Roles: Admin (full), Manager (team), User (personal)
- The platform currently has ~142 issues, 56 assets, 24 users

Be concise, insightful, and actionable. Use bullet points for clarity. Focus on operational intelligence.`

// POST /api/ai/chat
router.post('/chat', authenticate, async (req, res) => {
  const { messages } = req.body
  if (!messages?.length) return res.status(400).json({ error: 'Messages required' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    // Fallback mock responses when no API key configured
    const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || ''
    let reply = ''

    if (lastMsg.includes('summarize') || lastMsg.includes('activity')) {
      reply = `**Recent Activity Summary:**\n\n• 38 issues currently open across all teams\n• 7 critical issues require immediate attention\n• Maya Patel leads productivity with 41 resolved issues this month\n• Asset utilization at 73% (41/56 assets assigned)\n• Average resolution time: 22.8 hours (↓8% vs last month)\n\n**Key Alerts:** 3 issues breaching SLA thresholds. Recommend escalating ISS-138, ISS-142, ISS-145.`
    } else if (lastMsg.includes('workflow') || lastMsg.includes('inefficien')) {
      reply = `**Workflow Analysis:**\n\n⚠️ **Bottleneck Detected:** "Open → In Progress" stage averages 4.2h against a 2h target\n\n**Root Cause:** Unassigned issues (12) sitting in queue without ownership\n\n**Recommendations:**\n• Implement auto-assignment rules based on skill tags\n• Set SLA alerts at 80% threshold\n• Daily triage meeting for unassigned critical issues\n\n✅ "In Progress → Resolved" performing 22% better than target.`
    } else if (lastMsg.includes('productivity') || lastMsg.includes('insight')) {
      reply = `**Productivity Insights:**\n\n📊 **Top Performers:**\n• Maya Patel: 41 resolved, 0.9h avg — exceptional\n• Sarah Chen: 34 resolved, 1.2h avg — strong\n\n📉 **Needs Attention:**\n• Alex Turner: 8 open issues, 3.4h avg — may need support\n\n💡 **Suggestions:**\n• Pair Alex with Maya for knowledge transfer\n• Redistribute 3 of Alex's open issues\n• Consider priority training on recurring bug categories`
    } else {
      reply = `I'm DYnoGix AI, ready to help you optimize your operations!\n\nI can assist with:\n• **Workflow analysis** — identify bottlenecks and SLA risks\n• **Activity summaries** — what happened across teams\n• **Productivity insights** — team performance breakdown\n• **Inefficiency detection** — spot patterns before they escalate\n• **Improvement suggestions** — actionable recommendations\n\nWhat would you like to explore?`
    }

    return res.json({ message: reply, model: 'mock', usage: null })
  }

  try {
    const formatted = messages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }))

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: formatted,
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error?.message || 'AI API error')
    }

    const data = await response.json()
    res.json({
      message: data.content[0].text,
      model: data.model,
      usage: data.usage,
    })
  } catch (err) {
    console.error('AI error:', err.message)
    res.status(500).json({ error: 'AI service error: ' + err.message })
  }
})

// GET /api/ai/insights
router.get('/insights', authenticate, (req, res) => {
  res.json({
    insights: [
      { type: 'warning', title: 'SLA Risk', message: '3 issues approaching breach threshold', priority: 'high' },
      { type: 'success', title: 'Resolution Rate Up', message: 'Team resolved 22% more issues than last week', priority: 'low' },
      { type: 'info', title: 'Bottleneck Detected', message: 'Open → In Progress averaging 4.2h vs 2h target', priority: 'medium' },
      { type: 'warning', title: 'Unassigned Issues', message: '12 issues have no assignee', priority: 'medium' },
    ],
  })
})

module.exports = router
