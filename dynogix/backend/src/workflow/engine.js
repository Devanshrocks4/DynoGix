/**
 * DYnoGix Workflow Engine
 * Config-driven, data-aware state machine supporting multiple modules.
 */

const WORKFLOW_CONFIGS = {
  issue: {
    states: ['open', 'in_progress', 'resolved', 'closed'],
    transitions: {
      open:        ['in_progress'],
      in_progress: ['resolved', 'open'],
      resolved:    ['closed', 'in_progress'],
      closed:      [],
    },
    initial: 'open',
    terminal: ['closed'],
  },
  asset: {
    states: ['available', 'assigned', 'in_use', 'maintenance', 'retired'],
    transitions: {
      available:   ['assigned'],
      assigned:    ['in_use', 'available'],
      in_use:      ['available', 'maintenance'],
      maintenance: ['available', 'retired'],
      retired:     [],
    },
    initial: 'available',
    terminal: ['retired'],
  },
  request: {
    states: ['draft', 'pending', 'approved', 'rejected', 'completed'],
    transitions: {
      draft:     ['pending'],
      pending:   ['approved', 'rejected'],
      approved:  ['completed'],
      rejected:  ['draft'],
      completed: [],
    },
    initial: 'draft',
    terminal: ['completed', 'rejected'],
  },
}

class WorkflowEngine {
  getConfig(type) {
    const cfg = WORKFLOW_CONFIGS[type]
    if (!cfg) throw new Error(`Unknown workflow type: ${type}`)
    return cfg
  }

  getInitialState(type) {
    return this.getConfig(type).initial
  }

  canTransition(type, from, to) {
    const cfg = this.getConfig(type)
    return cfg.transitions[from]?.includes(to) ?? false
  }

  getAvailableTransitions(type, currentState) {
    const cfg = this.getConfig(type)
    return cfg.transitions[currentState] || []
  }

  transition(type, currentState, targetState) {
    if (!this.canTransition(type, currentState, targetState)) {
      throw new Error(`Invalid transition: ${currentState} → ${targetState} for type "${type}"`)
    }
    return {
      from: currentState,
      to: targetState,
      timestamp: new Date().toISOString(),
    }
  }

  isTerminal(type, state) {
    return this.getConfig(type).terminal.includes(state)
  }

  getWorkflowStats(type) {
    const cfg = this.getConfig(type)
    return {
      type,
      totalStates: cfg.states.length,
      terminalStates: cfg.terminal,
      initialState: cfg.initial,
      transitions: cfg.transitions,
    }
  }
}

module.exports = new WorkflowEngine()
