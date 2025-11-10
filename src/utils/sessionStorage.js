class SessionStorage {
  constructor() {
    this.sessions = new Map();
  }

  getSessionId(req) {
    // Use session ID from header or create new one
    return req.headers['x-session-id'] || 'default';
  }

  getSessionData(sessionId) {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        transactions: [],
        categories: [],
        budgets: [],
        goals: [],
        profile: null
      });
    }
    return this.sessions.get(sessionId);
  }

  setSessionData(sessionId, key, data) {
    const session = this.getSessionData(sessionId);
    session[key] = data;
    this.sessions.set(sessionId, session);
  }

  clearSession(sessionId) {
    this.sessions.delete(sessionId);
  }
}

export default new SessionStorage();