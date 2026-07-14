export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export class VentilationApi {
  constructor(baseUrl = "/api/v1") {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.token = null;
    this.csrfToken = null;
    this.sessionInfo = null;
    this.configRevision = null;
  }

  async request(path, options = {}) {
    const method = (options.method || "GET").toUpperCase();
    const headers = { ...(options.body ? { "Content-Type": "application/json" } : {}), ...(options.headers || {}) };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;
    if (this.csrfToken && !["GET", "HEAD", "OPTIONS"].includes(method)) headers["X-CSRF-Token"] = this.csrfToken;
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new ApiError(body.message || `Erreur HTTP ${response.status}`, response.status, body);
    return body;
  }

  status() { return this.request("/status"); }
  async config() {
    const config = await this.request("/config");
    this.configRevision = config.revision;
    return config;
  }
  history() { return this.request("/history"); }
  clearHistory() { return this.request("/history", { method: "DELETE" }); }
  events() { return this.request("/events"); }
  async login(username, password) {
    const session = await this.request("/session", { method: "POST", body: JSON.stringify({ username, password }) });
    this.token = session.token;
    this.csrfToken = session.csrfToken;
    this.sessionInfo = session;
    return session;
  }
  async currentSession() {
    const session = await this.request("/session");
    this.csrfToken = session.csrfToken;
    this.sessionInfo = session;
    return session;
  }
  async logout() {
    if (this.token) await this.request("/session", { method: "DELETE" });
    this.clearSession();
  }
  clearSession() {
    this.token = null;
    this.csrfToken = null;
    this.sessionInfo = null;
  }
  async updateConfig(config) {
    if (!Number.isInteger(this.configRevision)) throw new ApiError("Configuration à relire avant modification", 428, { code: "REVISION_REQUIRED" });
    const saved = await this.request("/config", {
      method: "PUT",
      headers: { "If-Match": `"${this.configRevision}"` },
      body: JSON.stringify(config),
    });
    this.configRevision = saved.revision;
    return saved;
  }
  startOutputTest(outputPct, durationSeconds = 60) {
    return this.request("/output-test", { method: "POST", body: JSON.stringify({ outputPct, durationSeconds }) });
  }
  stopOutputTest() { return this.request("/output-test", { method: "DELETE" }); }
}
