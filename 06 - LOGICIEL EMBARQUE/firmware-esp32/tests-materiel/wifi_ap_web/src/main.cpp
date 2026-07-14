#include <Arduino.h>
#include <DNSServer.h>
#include <Preferences.h>
#include <WebServer.h>
#include <WiFi.h>
#include <Wire.h>

constexpr int kSdaPin = 15;
constexpr int kSclPin = 21;
constexpr uint8_t kScd41Address = 0x62;
constexpr uint8_t kDacAddress = 0x5F;

constexpr uint16_t kScdStopPeriodic = 0x3F86;
constexpr uint16_t kScdStartPeriodic = 0x21B1;
constexpr uint16_t kScdReadMeasurement = 0xEC05;

constexpr uint8_t kDacRegRange = 0x01;
constexpr uint8_t kDacRange10V = 0x11;
constexpr uint8_t kDacRegCh0 = 0x02;
constexpr uint8_t kDacRegCh1 = 0x04;

constexpr char kWifiSsid[] = "VENT-CO2-TEST";
constexpr char kWifiPassword[] = "ventco2test";
constexpr char kLocalDomain[] = "sonde.com";
constexpr uint32_t kHistoryIntervalMs = 5UL * 60UL * 1000UL;
constexpr size_t kHistoryCapacity = 288;  // 24 h avec un point toutes les 5 minutes.

const IPAddress kApIp(192, 168, 4, 1);
const IPAddress kApGateway(192, 168, 4, 1);
const IPAddress kApSubnet(255, 255, 255, 0);

struct AppConfig {
  uint16_t targetPpm = 1000;
  uint8_t minOpenPct = 20;
  uint8_t maxOpenPct = 100;
  uint8_t manualPct = 50;
  bool manualMode = false;
};

struct SensorState {
  bool present = false;
  bool readOk = false;
  uint16_t co2Ppm = 0;
  float temperatureC = 0;
  float humidityRh = 0;
  String error = "not_read_yet";
  uint32_t lastReadMs = 0;
};

struct DacState {
  bool present = false;
  bool rangeOk = false;
  bool writeOk = false;
  uint8_t outputPct = 0;
  float targetVoltage = 0;
  String error = "not_written_yet";
};

struct HistorySample {
  uint32_t uptimeS = 0;
  uint16_t co2Ppm = 0;
  int16_t temperatureCenti = 0;
  uint16_t humidityCenti = 0;
  uint8_t outputPct = 0;
  bool valid = false;
};

DNSServer dnsServer;
WebServer server(80);
Preferences preferences;
AppConfig config;
SensorState sensor;
DacState dac;
HistorySample history[kHistoryCapacity];
size_t historyHead = 0;
size_t historyCount = 0;
uint32_t lastSensorPollMs = 0;
uint32_t lastDacWriteMs = 0;
uint32_t lastStatusSerialMs = 0;
uint32_t lastWifiCheckMs = 0;
uint32_t lastHistoryMs = 0;
bool apStartedOnce = false;
bool i2cReady = false;
bool hardwareInitDone = false;
bool sensorStarted = false;
uint32_t sensorStartMs = 0;

const char kHomeHtml[] PROGMEM = R"rawliteral(
<!doctype html><html lang="fr"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0f2f68"><title>Ventilation CO2</title>
<style>
:root{--bg:#071a3a;--panel:#102f68;--line:#3478d8;--text:#f4f8ff;--muted:#b7c9ea;--accent:#66d9ff;--good:#38d37f;--warn:#ffc857;--bad:#ff6b6b}
*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;background:radial-gradient(circle at top,#1857a8 0,#071a3a 45%,#030b1b 100%);color:var(--text)}
header{position:sticky;top:0;z-index:2;padding:16px 18px;background:#071a3ae8;border-bottom:1px solid #ffffff18}main{max-width:900px;margin:auto;padding:16px 14px 92px}
h1{margin:4px 0 0;font-size:28px}h2{margin:0 0 10px}.eyebrow{margin:0;color:var(--accent);font-weight:800;letter-spacing:.08em;text-transform:uppercase;font-size:12px}
.card{background:linear-gradient(155deg,var(--panel),#0b244e);border:1px solid #ffffff18;border-radius:22px;padding:16px;margin:14px 0;box-shadow:0 16px 36px #0005}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.muted{color:var(--muted)}.big{font-size:62px;font-weight:900}.unit{font-size:22px;color:var(--muted);font-weight:700}.badge{display:inline-block;border-radius:999px;padding:7px 10px;font-weight:900;font-size:12px}.good{background:#1ee083;color:#052012}.warn{background:var(--warn);color:#2c2100}.badbg{background:#ff6b6b;color:#260000}
.metric strong{display:block;font-size:30px}.meter{height:14px;border-radius:999px;background:#06142d;overflow:hidden;border:1px solid #ffffff18}.bar{height:100%;background:linear-gradient(90deg,#66d9ff,#ffc857);border-radius:999px}
label{display:block;margin:12px 0;color:var(--muted)}input[type=number],input[type=range]{width:100%;margin-top:6px}input[type=number]{border:1px solid var(--line);border-radius:14px;background:#06142d;color:var(--text);padding:12px;font-size:16px}
.mode{margin:14px 0}.modeHint{display:flex;justify-content:space-between;color:var(--muted);font-size:13px;margin:0 4px 8px}.switch{position:relative;width:220px;max-width:100%;height:58px;border:0;background:#06142d;border-radius:999px;padding:0;box-shadow:inset 0 4px 10px #0008,0 1px 0 #ffffff22;overflow:hidden}.switch span{position:absolute;top:0;width:50%;height:100%;display:grid;place-items:center;font-weight:900;letter-spacing:.04em;z-index:2}.switch .auto{left:0}.switch .manual{right:0}.switch .knob{position:absolute;top:6px;left:6px;width:calc(50% - 12px);height:46px;border-radius:999px;background:linear-gradient(180deg,#f5f8ff,#c7d2e5);box-shadow:0 4px 10px #0008;z-index:3;transition:left .18s ease}.switch::before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,#12d86f 0 50%,#2a6cff 50% 100%);opacity:.95}.switch.manual .knob{left:calc(50% + 6px)}.switch.manual::before{background:linear-gradient(90deg,#29527e 0 50%,#42dce2 50% 100%)}.switch:active .knob{transform:scale(.96)}
button{border:0;border-radius:14px;padding:12px 14px;background:var(--accent);color:#03152c;font-weight:900;margin:5px 5px 5px 0}.secondary{background:#06142d;color:var(--text);border:1px solid var(--line)}
.tabs{position:fixed;left:0;right:0;bottom:0;z-index:3;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:10px;background:#06142de8;border-top:1px solid #ffffff18}.tabs button{margin:0;background:#102f68;color:var(--muted);padding:11px 8px}.tabs button.active{background:var(--accent);color:#03152c}
.view{display:none}.view.active{display:block}.disabled,.locked{filter:grayscale(.85);opacity:.42;pointer-events:none}.hidden{display:none!important}.ok{color:var(--good);font-weight:800}.bad{color:var(--bad);font-weight:800}.kv{display:grid;grid-template-columns:1fr auto;gap:8px;border-bottom:1px solid #ffffff12;padding:7px 0}
.tableWrap{overflow:auto;border:1px solid #ffffff18;border-radius:14px}.historyTable{width:100%;border-collapse:collapse;font-size:13px}.historyTable th,.historyTable td{padding:8px 10px;border-bottom:1px solid #ffffff12;text-align:right;white-space:nowrap}.historyTable th:first-child,.historyTable td:first-child{text-align:left}.historyTable th{position:sticky;top:0;background:#06142d;color:var(--accent)}
@media(max-width:680px){.grid{grid-template-columns:1fr}.big{font-size:52px}.switch{width:100%}}
</style></head><body>
<header><p class="eyebrow">Prototype reel Wemos S2 Mini</p><h1>Ventilation CO2</h1><p class="muted">SCD41 0x62 + DAC 0-10 V 0x5F + interface locale</p></header>
<main>
<section class="card"><h2>Connexion installateur</h2><p><strong id="authState">Consultation locale</strong></p><p class="muted" id="authHint">Mot de passe provisoire : admin1234.</p><button id="loginBtn" onclick="login()">Connexion</button><button id="logoutBtn" class="secondary hidden" onclick="logout()">Deconnexion</button></section>

<section id="dash" class="view active">
<div class="card"><span id="quality" class="badge warn">Lecture...</span><div><span class="big" id="co2">--</span> <span class="unit">ppm</span></div><p class="muted">Consigne <strong id="targetText">--</strong> - sortie DAC <strong id="outputText">--</strong> - cible <strong id="voltText">--</strong></p><div class="meter"><div class="bar" id="outBar" style="width:0%"></div></div></div>
<div class="grid">
<article class="card metric"><p class="muted">Mode actif</p><strong id="modeText">--</strong><small class="muted" id="reasonText">--</small></article>
<article class="card metric"><p class="muted">Sonde CO2</p><strong id="sensorText">--</strong><small class="muted">Adresse I2C 0x62</small></article>
<article class="card metric"><p class="muted">Temperature</p><strong id="tempText">--</strong><small class="muted">mesuree par SCD41</small></article>
<article class="card metric"><p class="muted">Humidite</p><strong id="humText">--</strong><small class="muted">mesuree par SCD41</small></article>
</div>
</section>

<section id="settings" class="view"><article class="card"><h2>Reglages</h2><p class="muted">Choisis AUTO ou MANUEL, puis Enregistrer. Les valeurs sont enregistrees dans l'ESP.</p>
<div id="editArea" class="locked">
<div class="mode"><div class="modeHint"><span>AUTO</span><span>MANUEL</span></div><button type="button" id="modeSwitch" class="switch" onclick="toggleMode()"><span class="auto">AUTO</span><span class="manual">MANUEL</span><i class="knob"></i></button><p class="muted" id="modeHelp">AUTO : la sortie depend du CO2 et des seuils.</p></div>
<div id="autoFields"><label>Consigne CO2 (ppm)<input id="targetPpm" type="number" min="600" max="2000" step="50"></label><label>Ouverture mini AUTO (%)<input id="minOpenPct" type="number" min="0" max="80" step="5"></label><label>Ouverture maxi AUTO (%)<input id="maxOpenPct" type="number" min="20" max="100" step="5"></label></div>
<div id="manualFields"><label>Ouverture MANUELLE : <strong id="manualValue">50 %</strong><input id="manualPct" type="range" min="0" max="100" step="1"></label></div>
<button onclick="saveSettings()">Enregistrer</button></div><span class="muted" id="saveState"></span></article></section>

<section id="test" class="view">
<article class="card"><h2>Diagnostic materiel</h2><div class="kv"><span>Sonde SCD41 0x62</span><strong id="diagSensor">--</strong></div><div class="kv"><span>DAC DFR0971 0x5F</span><strong id="diagDac">--</strong></div><div class="kv"><span>Ecriture DAC</span><strong id="diagWrite">--</strong></div><div class="kv"><span>VOUT0/VOUT1 cible</span><strong id="diagVolt">--</strong></div><div class="kv"><span>Uptime</span><strong id="uptime">--</strong></div></article>
<article class="card"><h2>Test au multimetre</h2><p>Mesure entre <strong>VOUT0</strong> et <strong>GND</strong> du DAC, calibre V DC.</p><p class="muted">En manuel : 0 % ≈ 0 V, 50 % ≈ 5 V, 100 % ≈ 10 V. Ne jamais relier VOUT0/VOUT1 a la Wemos.</p></article>
<article class="card"><h2>Acces</h2><p>Adresse : <strong>http://192.168.4.1</strong></p><p class="muted">sonde.com peut echouer selon le telephone ; 192.168.4.1 reste l'adresse fiable.</p></article>
</section>
<section id="historyView" class="view">
<article class="card"><h2>Historique 24 h</h2><p class="muted">Enregistrement en RAM uniquement : un point toutes les 5 minutes, 288 points max. L'historique s'efface si la carte redemarre.</p><div class="grid"><div class="kv"><span>Points en memoire</span><strong id="histCount">--</strong></div><div class="kv"><span>Pas d'enregistrement</span><strong>5 min</strong></div></div><button onclick="loadHistory()">Actualiser</button><button onclick="location.href='/api/history.csv'">Exporter CSV Excel</button></article>
<article class="card"><div class="tableWrap"><table class="historyTable"><thead><tr><th>Age</th><th>CO2 ppm</th><th>Temp. C</th><th>Hum. %</th><th>Sortie %</th></tr></thead><tbody id="historyRows"><tr><td colspan="5">Chargement...</td></tr></tbody></table></div></article>
</section>
</main>
<nav class="tabs"><button class="active" onclick="show('dash',this)">Accueil</button><button onclick="show('settings',this)">Reglages</button><button onclick="show('historyView',this);loadHistory()">Historique</button><button onclick="show('test',this)">Test</button></nav>
<script>
const sessionKey='ventco2.installateur.v4';let formDirty=false,installer=false;
function show(id,btn){document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));document.getElementById(id).classList.add('active');document.querySelectorAll('.tabs button').forEach(b=>b.classList.remove('active'));btn.classList.add('active')}
async function api(path,body){const opt=body?{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(body)}:{};const r=await fetch(path,opt);if(!r.ok)throw new Error(await r.text());return await r.json()}
function loadSession(){installer=Date.now()<Number(localStorage.getItem(sessionKey)||0);if(!installer)localStorage.removeItem(sessionKey)}
function renderAuth(){authState.textContent=installer?'Installateur connecte':'Consultation locale';authHint.textContent=installer?'Reglages deverrouilles pendant 15 minutes.':'Connecte-toi pour modifier les reglages. Mot de passe provisoire : admin1234.';loginBtn.classList.toggle('hidden',installer);logoutBtn.classList.toggle('hidden',!installer);editArea.classList.toggle('locked',!installer)}
function login(){const p=prompt('Mot de passe installateur');if(p==='admin1234'){localStorage.setItem(sessionKey,String(Date.now()+15*60*1000));loadSession();renderAuth();saveState.textContent='Connecte'}else if(p!==null){alert('Mot de passe incorrect')}}
function logout(){localStorage.removeItem(sessionKey);loadSession();renderAuth();saveState.textContent='Deconnecte'}
function isManual(){return modeSwitch.classList.contains('manual')}function activeMode(){return isManual()?'manual':'auto'}
function setMode(manual){modeSwitch.classList.toggle('manual',manual);modeHelp.textContent=manual?'MANUEL : la sortie suit le pourcentage choisi.':'AUTO : la sortie depend du CO2 reel et des seuils.';updateEnabled()}
function toggleMode(){formDirty=true;setMode(!isManual())}
function updateEnabled(){autoFields.classList.toggle('disabled',isManual());manualFields.classList.toggle('disabled',!isManual());manualValue.textContent=manualPct.value+' %'}
function fillForm(j){setMode(j.mode==='MANUEL');targetPpm.value=j.config.target_ppm;minOpenPct.value=j.config.min_open_pct;maxOpenPct.value=j.config.max_open_pct;manualPct.value=j.config.manual_pct;updateEnabled()}
function yes(v){return v?'<span class=ok>OK</span>':'<span class=bad>ABSENT</span>'}
function applyStatus(j){co2.textContent=j.sensor.read_ok?j.sensor.co2_ppm:'--';targetText.textContent=j.config.target_ppm+' ppm';outputText.textContent=j.output_pct+' %';voltText.textContent=j.dac.target_v.toFixed(2)+' V';outBar.style.width=j.output_pct+'%';modeText.textContent=j.mode;reasonText.textContent=j.output_reason;uptime.textContent=j.uptime;quality.textContent=j.sensor.read_ok?'CO2 reel':'CO2 non lu';quality.className='badge '+(j.sensor.read_ok?'good':'badbg');sensorText.innerHTML=yes(j.sensor.present);tempText.textContent=j.sensor.read_ok?j.sensor.temperature_c.toFixed(1)+' °C':'--';humText.textContent=j.sensor.read_ok?j.sensor.humidity_rh.toFixed(1)+' %':'--';diagSensor.innerHTML=yes(j.sensor.present)+' / lecture '+(j.sensor.read_ok?'OK':j.sensor.error);diagDac.innerHTML=yes(j.dac.present)+' / adresse 0x'+j.dac.address;diagWrite.innerHTML=j.dac.write_ok?'<span class=ok>OK</span>':'<span class=bad>'+j.dac.error+'</span>';diagVolt.textContent=j.dac.target_v.toFixed(2)+' V';if(!formDirty)fillForm(j)}
async function refresh(){try{applyStatus(await api('/api/status'))}catch(e){saveState.textContent='API non lue : '+e.message}}
function ageText(s){if(s<60)return s+' s';const m=Math.floor(s/60);if(m<60)return m+' min';const h=Math.floor(m/60),r=m%60;return h+' h '+String(r).padStart(2,'0')}
async function loadHistory(){try{const h=await api('/api/history');histCount.textContent=h.count+' / '+h.capacity;historyRows.innerHTML=h.samples.length?h.samples.map(x=>'<tr><td>'+ageText(x.age_s)+'</td><td>'+x.co2_ppm+'</td><td>'+x.temperature_c.toFixed(1)+'</td><td>'+x.humidity_rh.toFixed(1)+'</td><td>'+x.output_pct+'</td></tr>').join(''):'<tr><td colspan="5">Aucun point historique pour le moment.</td></tr>'}catch(e){historyRows.innerHTML='<tr><td colspan="5">Erreur historique : '+e.message+'</td></tr>'}}
function validateForm(){const t=Number(targetPpm.value),mn=Number(minOpenPct.value),mx=Number(maxOpenPct.value),mp=Number(manualPct.value);if(t<600||t>2000)return'Consigne hors plage 600-2000';if(mn<0||mn>80)return'Mini hors plage 0-80';if(mx<20||mx>100)return'Maxi hors plage 20-100';if(mn>mx)return'Mini superieure au maxi';if(mp<0||mp>100)return'Manuel hors plage 0-100';return''}
async function saveSettings(){if(!installer){alert('Connexion installateur requise');return}const err=validateForm();if(err){alert(err);return}saveState.textContent='Enregistrement...';try{applyStatus(await api('/api/settings',{mode:activeMode(),target:targetPpm.value,min:minOpenPct.value,max:maxOpenPct.value,manual:manualPct.value}));formDirty=false;saveState.textContent='Enregistre'}catch(e){saveState.textContent='Erreur : '+e.message}}
[targetPpm,minOpenPct,maxOpenPct,manualPct].forEach(el=>el.addEventListener('input',()=>{formDirty=true;updateEnabled()}));
loadSession();renderAuth();refresh();setInterval(refresh,2000);
</script></body></html>
)rawliteral";

uint16_t clamp_u16(uint16_t value, uint16_t minValue, uint16_t maxValue) {
  return min(max(value, minValue), maxValue);
}

uint8_t clamp_u8(uint8_t value, uint8_t minValue, uint8_t maxValue) {
  return min(max(value, minValue), maxValue);
}

uint8_t scd_crc(uint8_t msb, uint8_t lsb) {
  uint8_t crc = 0xFF;
  uint8_t data[2] = {msb, lsb};
  for (uint8_t byteIndex = 0; byteIndex < 2; ++byteIndex) {
    crc ^= data[byteIndex];
    for (uint8_t bit = 0; bit < 8; ++bit) {
      crc = (crc & 0x80) ? (crc << 1) ^ 0x31 : crc << 1;
    }
  }
  return crc;
}

bool probe_i2c(uint8_t address) {
  Wire.beginTransmission(address);
  return Wire.endTransmission() == 0;
}

bool scd_send_command(uint16_t command) {
  Wire.beginTransmission(kScd41Address);
  Wire.write(command >> 8);
  Wire.write(command & 0xFF);
  return Wire.endTransmission() == 0;
}

bool read_word_crc(const uint8_t *buffer, uint8_t offset, uint16_t &value) {
  const uint8_t msb = buffer[offset];
  const uint8_t lsb = buffer[offset + 1];
  const uint8_t crc = buffer[offset + 2];
  if (scd_crc(msb, lsb) != crc) return false;
  value = (uint16_t(msb) << 8) | lsb;
  return true;
}

void normalize_config() {
  config.targetPpm = clamp_u16(config.targetPpm, 600, 2000);
  config.minOpenPct = clamp_u8(config.minOpenPct, 0, 80);
  config.maxOpenPct = clamp_u8(config.maxOpenPct, 20, 100);
  if (config.minOpenPct > config.maxOpenPct) config.minOpenPct = config.maxOpenPct;
  config.manualPct = clamp_u8(config.manualPct, 0, 100);
}

void load_config() {
  preferences.begin("ventco2", false);
  config.targetPpm = preferences.getUShort("target", 1000);
  config.minOpenPct = preferences.getUChar("min", 20);
  config.maxOpenPct = preferences.getUChar("max", 100);
  config.manualPct = preferences.getUChar("manual", 50);
  config.manualMode = preferences.getBool("manualMode", false);
  normalize_config();
}

void save_config() {
  normalize_config();
  preferences.putUShort("target", config.targetPpm);
  preferences.putUChar("min", config.minOpenPct);
  preferences.putUChar("max", config.maxOpenPct);
  preferences.putUChar("manual", config.manualPct);
  preferences.putBool("manualMode", config.manualMode);
}

String uptime_text() {
  const uint32_t seconds = millis() / 1000U;
  const uint32_t minutes = seconds / 60U;
  const uint32_t hours = minutes / 60U;
  char buffer[32];
  snprintf(buffer, sizeof(buffer), "%02lu:%02lu:%02lu",
           static_cast<unsigned long>(hours),
           static_cast<unsigned long>(minutes % 60U),
           static_cast<unsigned long>(seconds % 60U));
  return String(buffer);
}

String pct_to_voltage_json(float voltage) {
  char buffer[16];
  snprintf(buffer, sizeof(buffer), "%.2f", voltage);
  return String(buffer);
}

float centi_to_float(int16_t value) {
  return float(value) / 100.0f;
}

float centi_to_float(uint16_t value) {
  return float(value) / 100.0f;
}

String csv_float(float value) {
  char buffer[16];
  snprintf(buffer, sizeof(buffer), "%.2f", value);
  String text(buffer);
  text.replace('.', ',');
  return text;
}

String hms_text(uint32_t seconds) {
  const uint32_t hours = seconds / 3600U;
  const uint32_t minutes = (seconds % 3600U) / 60U;
  const uint32_t secs = seconds % 60U;
  char buffer[16];
  snprintf(buffer, sizeof(buffer), "%02lu:%02lu:%02lu",
           static_cast<unsigned long>(hours),
           static_cast<unsigned long>(minutes),
           static_cast<unsigned long>(secs));
  return String(buffer);
}

bool dac_write_register(uint8_t reg, uint8_t value) {
  Wire.beginTransmission(kDacAddress);
  Wire.write(reg);
  Wire.write(value);
  return Wire.endTransmission() == 0;
}

bool dac_write_channel(uint8_t channel, uint8_t percent) {
  percent = clamp_u8(percent, 0, 100);
  const uint16_t code12 = uint16_t((uint32_t(percent) * 4095UL) / 100UL);
  const uint16_t shifted = code12 << 4;
  const uint8_t low = shifted & 0xFF;
  const uint8_t high = (shifted >> 8) & 0xFF;
  const uint8_t reg = channel == 0 ? kDacRegCh0 : kDacRegCh1;
  Wire.beginTransmission(kDacAddress);
  Wire.write(reg);
  Wire.write(low);
  Wire.write(high);
  return Wire.endTransmission() == 0;
}

uint8_t auto_output_pct() {
  if (!sensor.readOk) return config.maxOpenPct;
  const int16_t low = static_cast<int16_t>(config.targetPpm) - 100;
  const int16_t high = static_cast<int16_t>(config.targetPpm) + 300;
  if (sensor.co2Ppm <= low) return config.minOpenPct;
  if (sensor.co2Ppm >= high) return config.maxOpenPct;
  const uint16_t span = static_cast<uint16_t>(high - low);
  const uint16_t pos = static_cast<uint16_t>(sensor.co2Ppm - low);
  return config.minOpenPct + ((config.maxOpenPct - config.minOpenPct) * pos) / span;
}

String output_reason() {
  if (config.manualMode) return "MANUEL: sortie imposee par le slider";
  if (!sensor.readOk) return "AUTO: defaut lecture CO2, sortie maxi securite";
  if (sensor.co2Ppm > config.targetPpm) return "AUTO: CO2 au-dessus de la consigne";
  return "AUTO: sortie calculee avec le CO2 reel";
}

void apply_output() {
  if (!i2cReady) return;
  dac.present = probe_i2c(kDacAddress);
  dac.outputPct = config.manualMode ? config.manualPct : auto_output_pct();
  dac.targetVoltage = float(dac.outputPct) / 10.0f;
  if (!dac.present) {
    dac.writeOk = false;
    dac.rangeOk = false;
    dac.error = "dac_absent_0x5F";
    return;
  }
  dac.rangeOk = dac_write_register(kDacRegRange, kDacRange10V);
  const bool ch0 = dac_write_channel(0, dac.outputPct);
  const bool ch1 = dac_write_channel(1, dac.outputPct);
  dac.writeOk = dac.rangeOk && ch0 && ch1;
  dac.error = dac.writeOk ? "" : "dac_write_failed";
}

void apply_output_periodic(bool force = false) {
  if (!force && millis() - lastDacWriteMs < 1000) return;
  lastDacWriteMs = millis();
  apply_output();
}

void record_history(bool force = false) {
  if (!sensor.readOk) return;
  if (!force && historyCount > 0 && millis() - lastHistoryMs < kHistoryIntervalMs) return;
  lastHistoryMs = millis();

  HistorySample &sample = history[historyHead];
  sample.uptimeS = millis() / 1000U;
  sample.co2Ppm = sensor.co2Ppm;
  sample.temperatureCenti = int16_t(sensor.temperatureC * 100.0f);
  sample.humidityCenti = uint16_t(max(0.0f, sensor.humidityRh) * 100.0f);
  sample.outputPct = dac.outputPct;
  sample.valid = true;

  historyHead = (historyHead + 1U) % kHistoryCapacity;
  if (historyCount < kHistoryCapacity) ++historyCount;
}

void poll_sensor(bool force = false) {
  if (!i2cReady) return;
  if (!force && millis() - lastSensorPollMs < 5000) return;
  if (sensorStarted && millis() - sensorStartMs < 5000) return;
  lastSensorPollMs = millis();
  sensor.present = probe_i2c(kScd41Address);
  if (!sensor.present) {
    sensor.readOk = false;
    sensor.error = "scd41_absent_0x62";
    return;
  }
  if (!scd_send_command(kScdReadMeasurement)) {
    sensor.readOk = false;
    sensor.error = "cmd_read_nack";
    return;
  }
  delay(1);
  uint8_t buffer[9] = {0};
  if (Wire.requestFrom(kScd41Address, uint8_t(9)) != 9) {
    sensor.readOk = false;
    sensor.error = "short_read";
    return;
  }
  for (uint8_t i = 0; i < 9; ++i) buffer[i] = Wire.read();
  uint16_t rawCo2 = 0, rawTemperature = 0, rawHumidity = 0;
  if (!read_word_crc(buffer, 0, rawCo2)) {
    sensor.readOk = false;
    sensor.error = "crc_co2";
    return;
  }
  if (!read_word_crc(buffer, 3, rawTemperature)) {
    sensor.readOk = false;
    sensor.error = "crc_temperature";
    return;
  }
  if (!read_word_crc(buffer, 6, rawHumidity)) {
    sensor.readOk = false;
    sensor.error = "crc_humidity";
    return;
  }
  sensor.co2Ppm = rawCo2;
  sensor.temperatureC = -45.0f + 175.0f * float(rawTemperature) / 65535.0f;
  sensor.humidityRh = 100.0f * float(rawHumidity) / 65535.0f;
  sensor.readOk = true;
  sensor.error = "";
  sensor.lastReadMs = millis();
}

void setup_i2c_devices() {
  Wire.begin(kSdaPin, kSclPin);
  Wire.setTimeOut(50);
  Wire.setClock(100000);
  i2cReady = true;
  sensor.present = probe_i2c(kScd41Address);
  dac.present = probe_i2c(kDacAddress);
  apply_output_periodic(true);
  if (sensor.present) {
    scd_send_command(kScdStopPeriodic);
    delay(50);
    sensorStarted = scd_send_command(kScdStartPeriodic);
    sensorStartMs = millis();
    sensor.error = sensorStarted ? "warming_up" : "start_failed";
  }
}

void ensure_wifi_ap(bool force = false) {
  if (!force && millis() - lastWifiCheckMs < 10000) return;
  lastWifiCheckMs = millis();
  if (!force && apStartedOnce && WiFi.getMode() == WIFI_AP) return;

  WiFi.mode(WIFI_AP);
  WiFi.setSleep(false);
  WiFi.softAPConfig(kApIp, kApGateway, kApSubnet);
  const bool ok = WiFi.softAP(kWifiSsid, kWifiPassword, 1, false, 4);
  apStartedOnce = ok;
  Serial.print("AP actif: ");
  Serial.print(ok ? "oui" : "non");
  Serial.print(" / adresse http://");
  Serial.println(WiFi.softAPIP());
}

String status_json() {
  poll_sensor();
  apply_output_periodic(true);
  return String("{") +
         "\"device\":\"ventilation-co2-prototype\"," +
         "\"board\":\"wemos-s2-mini\"," +
         "\"ssid\":\"" + kWifiSsid + "\"," +
         "\"domain\":\"" + kLocalDomain + "\"," +
         "\"ip\":\"" + WiFi.softAPIP().toString() + "\"," +
         "\"mode\":\"" + String(config.manualMode ? "MANUEL" : "AUTO") + "\"," +
         "\"output_pct\":" + String(dac.outputPct) + "," +
         "\"history_count\":" + String(historyCount) + "," +
         "\"output_reason\":\"" + output_reason() + "\"," +
         "\"uptime\":\"" + uptime_text() + "\"," +
         "\"sensor\":{" +
           "\"address\":\"62\"," +
           "\"present\":" + String(sensor.present ? "true" : "false") + "," +
           "\"read_ok\":" + String(sensor.readOk ? "true" : "false") + "," +
           "\"co2_ppm\":" + String(sensor.co2Ppm) + "," +
           "\"temperature_c\":" + pct_to_voltage_json(sensor.temperatureC) + "," +
           "\"humidity_rh\":" + pct_to_voltage_json(sensor.humidityRh) + "," +
           "\"error\":\"" + sensor.error + "\"" +
         "}," +
         "\"dac\":{" +
           "\"address\":\"5F\"," +
           "\"present\":" + String(dac.present ? "true" : "false") + "," +
           "\"range_ok\":" + String(dac.rangeOk ? "true" : "false") + "," +
           "\"write_ok\":" + String(dac.writeOk ? "true" : "false") + "," +
           "\"target_v\":" + pct_to_voltage_json(dac.targetVoltage) + "," +
           "\"error\":\"" + dac.error + "\"" +
         "}," +
         "\"config\":{" +
           "\"target_ppm\":" + String(config.targetPpm) + "," +
           "\"min_open_pct\":" + String(config.minOpenPct) + "," +
           "\"max_open_pct\":" + String(config.maxOpenPct) + "," +
           "\"manual_pct\":" + String(config.manualPct) +
         "}}";
}

void send_json() {
  server.send(200, "application/json; charset=utf-8", status_json());
}

size_t history_index_for_order(size_t order) {
  const size_t start = historyCount == kHistoryCapacity ? historyHead : 0;
  return (start + order) % kHistoryCapacity;
}

void handle_history_json() {
  poll_sensor();
  apply_output_periodic(true);
  record_history();

  const uint32_t nowS = millis() / 1000U;
  server.setContentLength(CONTENT_LENGTH_UNKNOWN);
  server.send(200, "application/json; charset=utf-8", "");
  server.sendContent(String("{\"count\":") + String(historyCount) +
                     ",\"capacity\":" + String(kHistoryCapacity) +
                     ",\"interval_s\":" + String(kHistoryIntervalMs / 1000UL) +
                     ",\"samples\":[");
  bool first = true;
  for (size_t i = 0; i < historyCount; ++i) {
    const HistorySample &sample = history[history_index_for_order(i)];
    if (!sample.valid) continue;
    if (!first) server.sendContent(",");
    first = false;
    const uint32_t ageS = nowS >= sample.uptimeS ? nowS - sample.uptimeS : 0;
    server.sendContent(String("{\"age_s\":") + String(ageS) +
                       ",\"co2_ppm\":" + String(sample.co2Ppm) +
                       ",\"temperature_c\":" + pct_to_voltage_json(centi_to_float(sample.temperatureCenti)) +
                       ",\"humidity_rh\":" + pct_to_voltage_json(centi_to_float(sample.humidityCenti)) +
                       ",\"output_pct\":" + String(sample.outputPct) +
                       "}");
  }
  server.sendContent("]}");
  server.sendContent("");
}

void handle_history_csv() {
  poll_sensor();
  apply_output_periodic(true);
  record_history();

  const uint32_t nowS = millis() / 1000U;
  server.sendHeader("Content-Disposition", "attachment; filename=historique_co2_24h.csv");
  server.setContentLength(CONTENT_LENGTH_UNKNOWN);
  server.send(200, "text/csv; charset=utf-8", "");
  server.sendContent("\xEF\xBB\xBF");
  server.sendContent("age_secondes;age_hhmmss;co2_ppm;temperature_c;humidite_rh;sortie_pct\r\n");
  for (size_t i = 0; i < historyCount; ++i) {
    const HistorySample &sample = history[history_index_for_order(i)];
    if (!sample.valid) continue;
    const uint32_t ageS = nowS >= sample.uptimeS ? nowS - sample.uptimeS : 0;
    server.sendContent(String(ageS) + ";" +
                       hms_text(ageS) + ";" +
                       String(sample.co2Ppm) + ";" +
                       csv_float(centi_to_float(sample.temperatureCenti)) + ";" +
                       csv_float(centi_to_float(sample.humidityCenti)) + ";" +
                       String(sample.outputPct) + "\r\n");
  }
  server.sendContent("");
}

bool require_arg(const char *name) {
  if (server.hasArg(name)) return true;
  server.send(400, "text/plain; charset=utf-8", String("Argument manquant: ") + name);
  return false;
}

void handle_settings() {
  if (!require_arg("mode") || !require_arg("target") || !require_arg("min") ||
      !require_arg("max") || !require_arg("manual")) {
    return;
  }
  const String mode = server.arg("mode");
  const int target = server.arg("target").toInt();
  const int minOpen = server.arg("min").toInt();
  const int maxOpen = server.arg("max").toInt();
  const int manual = server.arg("manual").toInt();

  if (mode != "auto" && mode != "manual") {
    server.send(422, "text/plain; charset=utf-8", "Mode inconnu");
    return;
  }
  if (target < 600 || target > 2000 || minOpen < 0 || minOpen > 80 ||
      maxOpen < 20 || maxOpen > 100 || minOpen > maxOpen ||
      manual < 0 || manual > 100) {
    server.send(422, "text/plain; charset=utf-8", "Reglage hors bornes");
    return;
  }

  config.manualMode = mode == "manual";
  config.targetPpm = static_cast<uint16_t>(target);
  config.minOpenPct = static_cast<uint8_t>(minOpen);
  config.maxOpenPct = static_cast<uint8_t>(maxOpen);
  config.manualPct = static_cast<uint8_t>(manual);
  save_config();
  apply_output_periodic(true);
  send_json();
}

void print_serial_status() {
  if (millis() - lastStatusSerialMs < 5000) return;
  lastStatusSerialMs = millis();
  Serial.print("CO2=");
  Serial.print(sensor.readOk ? String(sensor.co2Ppm) : String("--"));
  Serial.print("ppm sensor=");
  Serial.print(sensor.present ? "OK" : "ABSENT");
  Serial.print(" dac=");
  Serial.print(dac.present ? "OK" : "ABSENT");
  Serial.print(" addr=0x5F output=");
  Serial.print(dac.outputPct);
  Serial.print("% target=");
  Serial.print(dac.targetVoltage, 2);
  Serial.print("V write=");
  Serial.println(dac.writeOk ? "OK" : dac.error);
}

void setup() {
  Serial.begin(115200);
  delay(100);
  Serial.println();
  Serial.println("Demarrage firmware web reel v4 - boot autonome");

  load_config();
  ensure_wifi_ap(true);

  dnsServer.start(53, "*", WiFi.softAPIP());
  server.on("/", HTTP_GET, []() {
    server.send_P(200, "text/html; charset=utf-8", kHomeHtml);
  });
  server.on("/api/status", HTTP_GET, send_json);
  server.on("/api/history", HTTP_GET, handle_history_json);
  server.on("/api/history.csv", HTTP_GET, handle_history_csv);
  server.on("/api/settings", HTTP_POST, handle_settings);
  server.onNotFound([]() {
    server.sendHeader("Location", String("http://192.168.4.1/"), true);
    server.send(302, "text/plain; charset=utf-8", "Redirection vers interface");
  });
  server.begin();
  Serial.println("Serveur HTTP pret");
}

void loop() {
  ensure_wifi_ap();
  dnsServer.processNextRequest();
  server.handleClient();
  if (!hardwareInitDone) {
    setup_i2c_devices();
    hardwareInitDone = true;
    Serial.print("Sonde SCD41 0x62: ");
    Serial.println(sensor.present ? "OK" : "ABSENT");
    Serial.print("DAC DFR0971 0x5F: ");
    Serial.println(dac.present ? "OK" : "ABSENT");
  }
  poll_sensor();
  apply_output_periodic();
  record_history();
  print_serial_status();
  delay(10);
}
