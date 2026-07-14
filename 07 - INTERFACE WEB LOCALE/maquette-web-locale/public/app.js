import { airQualityStatus, formatCountdown, outputToVoltage, presentEvent, validateConfig } from "./core.mjs";
import { VentilationApi } from "./api-client.mjs";

const api = new VentilationApi();

const state = {
  config: { targetPpm: 1000, minOutputPct: 20, maxOutputPct: 100, highAlarmPpm: 1500 },
  co2Ppm: 824,
  outputPct: 28,
  mode: "AUTO",
  testEndsAt: null,
  history: [],
  events: [],
  session: null,
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const numberFr = new Intl.NumberFormat("fr-FR");

function renderStatus() {
  const quality = airQualityStatus(state.co2Ppm, state.config.highAlarmPpm);
  $("#co2-value").textContent = numberFr.format(Math.round(state.co2Ppm));
  $("#output-value").textContent = Math.round(state.outputPct);
  $("#voltage-value").textContent = `${outputToVoltage(state.outputPct).toFixed(1).replace(".", ",")} V`;
  $("#mode-value").textContent = state.mode;
  $("#target-summary").textContent = `${numberFr.format(state.config.targetPpm)} ppm`;
  $("#quality-badge").textContent = quality.label;
  $("#quality-badge").className = `status-badge ${quality.tone}`;
  $("#co2-meter").style.width = `${Math.max(4, Math.min(100, (state.co2Ppm - 400) / 13))}%`;
  $("#updated-at").textContent = "À l’instant";
}

function setConnection(connected) {
  $("#connection").innerHTML = `<span></span> ${connected ? "Connecté localement" : "Liaison perdue · régulation locale maintenue"}`;
  $("#connection").classList.toggle("offline", !connected);
}

function setAuthenticated(session) {
  state.session = session;
  const authenticated = Boolean(session);
  const roleLabel = session?.role === "installer" ? "installateur" : "administrateur";
  $("#auth-status").textContent = authenticated ? `Session ${roleLabel}` : "Consultation locale";
  $("#auth-detail").textContent = authenticated
    ? `${session.username} · expiration ${new Date(session.expiresAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
    : "Connexion installateur requise pour modifier ou tester.";
  $("#open-login").hidden = authenticated;
  $("#logout").hidden = !authenticated;
  $("#clear-history").hidden = session?.role !== "admin";
  $$('[data-auth-required]').forEach((element) => { element.hidden = authenticated; });
  $$("#settings-form input, #settings-form button, [data-output], #stop-test").forEach((element) => { element.disabled = !authenticated; });
  $("#refresh-events").disabled = !authenticated;
  if (!authenticated) {
    state.events = [];
    renderEvents();
  }
}

async function loadProtectedConfig() {
  const config = await api.config();
  state.config = config;
  for (const [key, value] of Object.entries(config)) {
    const field = $(`[name="${key}"]`);
    if (field) field.value = value;
  }
  renderStatus();
}

function expireSession(message = "Session expirée · reconnectez-vous") {
  api.clearSession();
  setAuthenticated(null);
  showToast(message);
}

function renderEvents() {
  const list = $("#event-list");
  list.replaceChildren();
  if (!state.session) {
    $("#events-status").textContent = "Connectez-vous pour consulter le journal technique.";
    return;
  }
  if (state.events.length === 0) {
    $("#events-status").textContent = "Aucun événement disponible.";
    return;
  }
  $("#events-status").textContent = `${state.events.length} événement${state.events.length > 1 ? "s" : ""} récent${state.events.length > 1 ? "s" : ""}.`;
  for (const event of state.events.slice(-8).reverse()) {
    const view = presentEvent(event);
    const item = document.createElement("li");
    const dot = document.createElement("span");
    dot.className = `event-dot ${view.severity}`;
    dot.setAttribute("aria-hidden", "true");
    const main = document.createElement("span");
    main.className = "event-main";
    const title = document.createElement("strong");
    title.textContent = view.label;
    const detail = document.createElement("small");
    detail.textContent = [view.source, view.detail].filter(Boolean).join(" · ");
    main.append(title, detail);
    const time = document.createElement("time");
    time.className = "event-time";
    if (event.epochSeconds > 0) {
      const date = new Date(event.epochSeconds * 1000);
      time.dateTime = date.toISOString();
      time.textContent = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } else {
      time.textContent = `+${event.uptimeSeconds} s`;
    }
    item.append(dot, main, time);
    list.append(item);
  }
}

async function loadEvents() {
  if (!state.session) return renderEvents();
  try {
    const payload = await api.events();
    state.events = Array.isArray(payload.events) ? payload.events : [];
    renderEvents();
  } catch (error) {
    if (error.status === 401 || error.status === 403) expireSession();
    else $("#events-status").textContent = "Journal momentanément indisponible ; la régulation continue.";
  }
}

async function loadHistory() {
  const history = await api.history();
  state.history = Array.isArray(history.samples) ? history.samples : [];
  renderHistory();
}

function applyStatus(status) {
  state.co2Ppm = status.co2Ppm;
  state.outputPct = status.outputPct;
  state.mode = status.mode;
  state.testEndsAt = status.test?.endsAt ? Date.parse(status.test.endsAt) : null;
  if (status.test) {
    $("#test-output").textContent = `${status.test.outputPct} %`;
    $("#test-active").hidden = false;
  } else {
    $("#test-active").hidden = true;
  }
  renderStatus();
}

async function refreshStatus() {
  try {
    applyStatus(await api.status());
    setConnection(true);
  } catch {
    setConnection(false);
  }
}

function renderHistory() {
  const chart = $("#history-chart");
  const points = state.history;
  const w = 720, h = 300, pad = 20;
  const x = (i) => pad + i * (w - pad * 2) / (points.length - 1);
  const yCo2 = (v) => h - pad - (v - 400) / 1200 * (h - pad * 2);
  const yOutput = (v) => h - pad - v / 100 * (h - pad * 2);
  if (points.length < 2) {
    chart.replaceChildren();
    $("#average-co2").textContent = "—";
    $("#maximum-co2").textContent = "—";
    return;
  }
  const path = (fn, key) => points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${fn(p[key]).toFixed(1)}`).join(" ");
  chart.innerHTML = `
    <defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b6c5d" stop-opacity=".20"/><stop offset="1" stop-color="#1b6c5d" stop-opacity="0"/></linearGradient></defs>
    <path d="M${pad},${h-pad} ${path(yCo2, "co2Ppm").replace(/^M/, "L")} L${w-pad},${h-pad} Z" fill="url(#fill)"/>
    <path d="${path(yCo2, "co2Ppm")}" fill="none" stroke="#1b6c5d" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${path(yOutput, "outputPct")}" fill="none" stroke="#d69d39" stroke-width="3" stroke-dasharray="8 7" stroke-linecap="round"/>
  `;
  const values = points.map((p) => p.co2Ppm);
  $("#average-co2").textContent = numberFr.format(Math.round(values.reduce((a, b) => a + b, 0) / values.length));
  $("#maximum-co2").textContent = numberFr.format(Math.max(...values));
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("visible"), 2600);
}

function stopTest(message = "Test terminé · retour en AUTO") {
  state.mode = "AUTO";
  state.testEndsAt = null;
  state.outputPct = Math.max(state.config.minOutputPct, 20);
  $("#test-active").hidden = true;
  renderStatus();
  showToast(message);
}

$$('.bottom-nav button').forEach((button) => button.addEventListener("click", () => {
  $$('.bottom-nav button').forEach((item) => item.classList.toggle("active", item === button));
  $$('.view').forEach((view) => view.classList.toggle("active", view.id === button.dataset.view));
  if (button.dataset.view === "history") renderHistory();
  if (button.dataset.view === "service") loadEvents();
  window.scrollTo({ top: 0, behavior: "smooth" });
}));

$("#settings-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const candidate = Object.fromEntries(new FormData(event.currentTarget).entries());
  const result = validateConfig(candidate);
  $$('[data-error]').forEach((element) => { element.textContent = result.errors[element.dataset.error] || ""; });
  if (!result.ok) {
    $("#settings-result").textContent = "Certains réglages doivent être corrigés.";
    $("#settings-result").style.color = "var(--danger)";
    return;
  }
  try {
    const saved = await api.updateConfig(Object.fromEntries(Object.entries(candidate).map(([key, value]) => [key, Number(value)])));
    state.config = saved;
    $("#settings-result").textContent = "Réglages enregistrés et validés par le contrôleur.";
    $("#settings-result").style.color = "var(--good)";
    renderStatus();
    loadEvents();
  } catch (error) {
    if (error.status === 401 || error.status === 403) expireSession();
    if (error.body?.code === "REVISION_CONFLICT") {
      await loadProtectedConfig();
      $("#settings-result").textContent = "Les réglages avaient changé sur un autre téléphone. La version actuelle a été rechargée ; vérifiez-la avant de recommencer.";
    } else if (error.body?.code === "INVALID_CONFIG") {
      $("#settings-result").textContent = "Le contrôleur a refusé ces réglages.";
    } else {
      $("#settings-result").textContent = "Impossible de joindre le contrôleur.";
    }
    $("#settings-result").style.color = "var(--danger)";
  }
});

$$('[data-output]').forEach((button) => button.addEventListener("click", async () => {
  const outputPct = Number(button.dataset.output);
  try {
    applyStatus(await api.startOutputTest(outputPct, 60));
    loadEvents();
    showToast(`Test démarré à ${outputPct} % pour 1 minute`);
  } catch (error) {
    if (error.status === 401 || error.status === 403) expireSession();
    else showToast("Le contrôleur a refusé le test");
  }
}));

$("#stop-test").addEventListener("click", async () => {
  try {
    applyStatus(await api.stopOutputTest());
    loadEvents();
    showToast("Test arrêté · retour en AUTO");
  } catch (error) {
    if (error.status === 401 || error.status === 403) expireSession();
    else showToast("Arrêt impossible : liaison indisponible");
  }
});

$("#open-login").addEventListener("click", () => {
  $("#login-result").textContent = "";
  $("#login-dialog").showModal();
  $("#login-form [name=password]").focus();
});

$("#close-login").addEventListener("click", () => $("#login-dialog").close());

$("#login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const loginForm = event.currentTarget;
  const form = new FormData(loginForm);
  const result = $("#login-result");
  result.textContent = "Connexion…";
  try {
    const session = await api.login(form.get("username"), form.get("password"));
    setAuthenticated(session);
    await loadProtectedConfig();
    await loadEvents();
    loginForm.reset();
    $("#login-dialog").close();
    showToast("Session installateur ouverte");
  } catch (error) {
    result.textContent = error.status === 429
      ? `Trop de tentatives. Réessayez dans ${error.body?.retryAfterSeconds ?? 30} s.`
      : "Identifiant ou mot de passe incorrect.";
  }
});

$("#logout").addEventListener("click", async () => {
  try { await api.logout(); } catch { api.clearSession(); }
  setAuthenticated(null);
  showToast("Session fermée");
});

$("#refresh-events").addEventListener("click", loadEvents);

$("#clear-history").addEventListener("click", async () => {
  if (!state.session || state.session.role !== "admin") return;
  if (!confirm("Effacer l'historique local du controleur ? Cette action ne modifie pas les reglages.")) return;
  try {
    const result = await api.clearHistory();
    state.history = [];
    renderHistory();
    await loadEvents();
    showToast(`${result.deletedSamples} echantillon${result.deletedSamples > 1 ? "s" : ""} supprime${result.deletedSamples > 1 ? "s" : ""}`);
  } catch (error) {
    if (error.status === 401 || error.status === 403) expireSession("Action admin refusee ou session expiree");
    else showToast("Effacement impossible : liaison indisponible");
  }
});

$("#export-button").addEventListener("click", () => {
  const csv = ["horodatage,co2_ppm,ouverture_pct,etat,defaut", ...state.history.map((row) => `${row.timestamp},${row.co2Ppm},${row.outputPct.toFixed(1)},${row.state},${row.fault || ""}`)].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "historique-ventilation-co2.csv";
  link.click();
  URL.revokeObjectURL(url);
  showToast("Historique CSV exporté");
});

setInterval(() => {
  if (state.testEndsAt) {
    const remaining = (state.testEndsAt - Date.now()) / 1000;
    $("#test-countdown").textContent = formatCountdown(remaining);
    if (remaining <= 0) refreshStatus();
  }
}, 250);

async function bootstrap() {
  try {
    const [_, status] = await Promise.all([loadHistory(), api.status()]);
    applyStatus(status);
    setConnection(true);
  } catch {
    setConnection(false);
  }
}

setAuthenticated(null);
setInterval(refreshStatus, 2000);
bootstrap();

if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");
