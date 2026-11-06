import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js';

/* MAIA — lógica da aplicação.
   Os dados de gestão ficam no navegador. As medições só são mostradas quando
   são recebidas de uma API configurada pelo utilizador. */
(() => {
  'use strict';

  const KEYS = {
    hives: 'maia.v1.hives', visits: 'maia.v1.visits', tasks: 'maia.v1.tasks',
    measurements: 'maia.v1.measurements', photos: 'maia.v1.photos', settings: 'maia.v1.settings'
  };
  // Firebase Auth setup: replace these values with the configuration of your web app.
  const firebaseConfig = {
    apiKey: 'AIzaSyCYY8qiR1cetsM9tL6eaWmhcvUoHj41Rbw',
    authDomain: 'maia-56e51.firebaseapp.com',
    projectId: 'maia-56e51',
    appId: '1:337977166303:web:b9a4582e684bcc08359c6a'
  };
  const firebaseConfigured = Object.values(firebaseConfig).every(value => value && !value.includes('COLE_AQUI'));
  let firebaseAuth = null;
  if (firebaseConfigured) {
    try { firebaseAuth = getAuth(initializeApp(firebaseConfig)); } catch { firebaseAuth = null; }
  }
  const LEGACY_MIGRATION_KEY = 'maia.v1.accountMigrationComplete';
  const ICONS = {
    home: '<path d="m3 10 9-7 9 7v10h-6v-6H9v6H3V10Z"/>',
    dashboard: '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="5" rx="1.5"/><rect x="13" y="10" width="8" height="11" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/>',
    hive: '<path d="m12 3 7 4v8l-7 4-7-4V7l7-4Z"/><path d="M8 9h8M8 12h8M8 15h8"/>',
    sensor: '<path d="M14 14.5V5a2 2 0 0 0-4 0v9.5a4 4 0 1 0 4 0Z"/><path d="M12 12v6"/>',
    task: '<path d="M9 5h11M9 12h11M9 19h11"/><path d="m3 5 1 1 2-2M3 12l1 1 2-2M3 19l1 1 2-2"/>',
    camera: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="m8 6 1.5-2h5L16 6"/><circle cx="12" cy="13" r="3.5"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1a1.8 1.8 0 0 1-2.5 2.5l-.1-.1a1.8 1.8 0 0 0-3 .9v.2a1.8 1.8 0 0 1-3.6 0v-.2a1.8 1.8 0 0 0-3-.9l-.1.1a1.8 1.8 0 0 1-2.5-2.5l.1-.1a1.8 1.8 0 0 0-.9-3h-.2a1.8 1.8 0 0 1 0-3.6h.2a1.8 1.8 0 0 0 .9-3l-.1-.1a1.8 1.8 0 0 1 2.5-2.5l.1.1a1.8 1.8 0 0 0 3-.9v-.2a1.8 1.8 0 0 1 3.6 0v.2a1.8 1.8 0 0 0 3 .9l.1-.1a1.8 1.8 0 0 1 2.5 2.5l-.1.1a1.8 1.8 0 0 0 .9 3h.2a1.8 1.8 0 0 1 0 3.6h-.2a1.8 1.8 0 0 0-.9 3Z"/>',
    visit: '<path d="M8 3v4M16 3v4M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z"/><path d="m8 14 2 2 5-5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.9-3M4 4v4h4M4 13a8 8 0 0 0 14.9 3M20 20v-4h-4"/>',
    temp: '<path d="M14 14.5V5a2 2 0 0 0-4 0v9.5a4 4 0 1 0 4 0Z"/>',
    drop: '<path d="M12 3s6 7 6 11a6 6 0 1 1-12 0c0-4 6-11 6-11Z"/>',
    weight: '<path d="M5 8h14l2 12H3L5 8Z"/><path d="M9 8a3 3 0 0 1 6 0M12 12l2 3"/>',
    pin: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.6 8.6 0 1 0 20.5 14.2Z"/>',
    export: '<path d="M12 3v12m0-12 4 4m-4-4L8 7M4 14v6h16v-6"/>',
    edit: '<path d="m4 16.5-.8 4.3 4.3-.8L19.8 7.7a2.5 2.5 0 0 0-3.5-3.5L4 16.5Z"/><path d="m14.5 6.5 3 3"/>',
    trash: '<path d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3"/>',
    bee: '<path d="M8 10c-2-2-4-1-4 1s2 3 4 2M16 10c2-2 4-1 4 1s-2 3-4 2"/><ellipse cx="12" cy="12" rx="4.5" ry="5.5"/><path d="M9 10h6M8 15l-2 2m10-2 2 2"/>'
  };

  const readJSON = (key, fallback) => {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch { return fallback; }
  };
  const THEME_KEY = 'maia.v1.theme';
  const savedTheme = () => {
    try { return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'; }
    catch { return 'light'; }
  };
  const defaultSettings = () => ({ theme: savedTheme(), pollSeconds: 30, thresholds: {} });
  let currentUser = null;
  let authMode = 'signin';
  let authMessage = '';
  let authMessageKind = 'info';
  let authBusy = false;
  const data = {
    hives: readJSON(KEYS.hives, []), visits: readJSON(KEYS.visits, []), tasks: readJSON(KEYS.tasks, []),
    measurements: readJSON(KEYS.measurements, []), photos: readJSON(KEYS.photos, []),
    settings: { ...defaultSettings(), ...readJSON(KEYS.settings, {}) }
  };
  let view = 'home';
  let selectedHive = null;
  let pollTimer = null;
  let sensorState = 'unconfigured';
  let cameraState = 'unconfigured';
  let toastTimer = null;

  const userStorageKey = (key, userId = currentUser?.id) => `${key}.user.${userId}`;
  function resetData() {
    data.hives = []; data.visits = []; data.tasks = []; data.measurements = []; data.photos = [];
    data.settings = defaultSettings();
  }
  function loadUserData(userId) {
    const hasAccountData = Object.values(KEYS).some(key => localStorage.getItem(userStorageKey(key, userId)) !== null);
    const hasLegacyData = Object.values(KEYS).some(key => localStorage.getItem(key) !== null);
    if (!hasAccountData && hasLegacyData && !localStorage.getItem(LEGACY_MIGRATION_KEY)) {
      persist();
      localStorage.setItem(LEGACY_MIGRATION_KEY, userId);
      return;
    }
    data.hives = readJSON(userStorageKey(KEYS.hives, userId), []);
    data.visits = readJSON(userStorageKey(KEYS.visits, userId), []);
    data.tasks = readJSON(userStorageKey(KEYS.tasks, userId), []);
    data.measurements = readJSON(userStorageKey(KEYS.measurements, userId), []);
    data.photos = readJSON(userStorageKey(KEYS.photos, userId), []);
    data.settings = { ...defaultSettings(), ...readJSON(userStorageKey(KEYS.settings, userId), {}) };
  }
  const persist = () => {
    if (!currentUser) return;
    localStorage.setItem(userStorageKey(KEYS.hives), JSON.stringify(data.hives));
    localStorage.setItem(userStorageKey(KEYS.visits), JSON.stringify(data.visits));
    localStorage.setItem(userStorageKey(KEYS.tasks), JSON.stringify(data.tasks));
    localStorage.setItem(userStorageKey(KEYS.measurements), JSON.stringify(data.measurements));
    localStorage.setItem(userStorageKey(KEYS.photos), JSON.stringify(data.photos));
    localStorage.setItem(userStorageKey(KEYS.settings), JSON.stringify(data.settings));
  };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const icon = (name, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
  const uid = () => crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const today = () => new Date().toISOString().slice(0, 10);
  const parseDate = value => /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) ? new Date(`${value}T12:00:00`) : new Date(value);
  const fmtDate = (value, options = { day: '2-digit', month: 'short', year: 'numeric' }) => {
    if (!value) return '—'; const d = parseDate(value); return Number.isNaN(d.getTime()) ? esc(value) : d.toLocaleDateString('pt-PT', options);
  };
  const fmtDateTime = value => {
    if (!value) return '—'; const d = new Date(value); return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };
  const num = (value, digits = 1) => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value)) ? Number(value).toLocaleString('pt-PT', { maximumFractionDigits: digits }) : '—';
  const setTheme = theme => {
    data.settings.theme = theme === 'dark' ? 'dark' : 'light';
    try { localStorage.setItem(THEME_KEY, data.settings.theme); } catch {}
    document.documentElement.dataset.theme = data.settings.theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', data.settings.theme === 'dark' ? '#101b16' : '#f6f7f3');
    persist();
  };
  const notify = message => {
    const toast = document.querySelector('#toast'); toast.textContent = message; toast.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  };
  const average = values => {
    const valid = values.map(Number).filter(Number.isFinite);
    return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
  };
  const sensorValues = record => {
    if (!record) return { t11: [], h11: [], t22: null, tAll: [], hAll: [], weight: null };
    const valid = value => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
    const t11 = [record.dht11_1?.temperature, record.dht11_2?.temperature].filter(valid).map(Number);
    const h11 = [record.dht11_1?.humidity, record.dht11_2?.humidity].filter(valid).map(Number);
    const t22 = valid(record.dht22?.temperature) ? Number(record.dht22.temperature) : null;
    const temps = [...t11, t22].filter(valid).map(Number);
    const hums = [...h11, record.dht22?.humidity].filter(valid).map(Number);
    return { t11, h11, t22, tAll: temps, hAll: hums, weight: valid(record.weightKg) ? Number(record.weightKg) : null };
  };
  const sortedMeasurements = records => [...records].sort((a, b) => new Date(a.measuredAt) - new Date(b.measuredAt));
  const latestMeasurements = () => {
    const byHive = new Map();
    for (const m of sortedMeasurements(data.measurements)) byHive.set(m.hiveId, m);
    return [...byHive.values()];
  };
  const hiveFor = id => data.hives.find(h => h.identifier === id || h.id === id);
  const hiveLabel = id => hiveFor(id)?.identifier || id || 'Sem colmeia associada';
  const activities = () => [
    ...data.visits.map(v => ({ type: 'Visita', title: v.type || 'Visita', text: v.notes, hiveId: v.hiveId, date: v.date })),
    ...data.tasks.map(t => ({ type: t.done ? 'Tarefa concluída' : 'Tarefa', title: t.title, text: t.done ? 'Concluída' : 'Por concluir', hiveId: t.hiveId, date: t.dueDate }))
  ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  function logo() {
    return `<a class="brand" href="#" data-view="home" aria-label="MAIA, página inicial"><span class="brand-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m12 2.8 7.8 4.5v9L12 20.8l-7.8-4.5v-9L12 2.8Z"/><path d="m8.5 9.2 3.5-2 3.5 2v4l-3.5 2-3.5-2v-4Z" fill="currentColor"/></svg></span><span>MAIA</span></a>`;
  }
  const navItems = [
    ['dashboard', 'Painel principal', 'dashboard'], ['hives', 'Colmeias', 'hive'], ['monitoring', 'Monitorização', 'sensor'],
    ['activities', 'Visitas e tarefas', 'task'], ['camera', 'Câmara e imagens', 'camera'], ['settings', 'Definições', 'settings']
  ];
  function renderTopbar() {
    const topbar = document.querySelector('#topbar');
    if (view === 'home') {
      topbar.innerHTML = `<div class="topbar-inner">${logo()}<nav class="top-nav" id="top-nav"><a href="#funcionalidades">Funcionalidades</a><a href="#sobre">Sobre a MAIA</a></nav><div class="top-tools"><button class="icon-button" data-action="theme-toggle" aria-label="Alternar tema">${icon(data.settings.theme === 'dark' ? 'sun' : 'moon')}</button><button class="button primary" data-action="open-auth">Entrar no painel ${icon('arrow')}</button><button class="icon-button menu-button" data-action="menu" aria-label="Abrir menu">☰</button></div></div>`;
    } else if (view === 'auth') {
      topbar.innerHTML = `<div class="topbar-inner">${logo()}<div class="top-tools"><button class="button" data-view="home">Página inicial</button></div></div>`;
    } else {
      topbar.innerHTML = `<div class="topbar-inner">${logo()}<nav class="top-nav" id="top-nav">${navItems.map(([id, label, ico]) => `<a href="#${id}" data-view="${id}" class="${view === id || (view === 'hive-detail' && id === 'hives') ? 'active' : ''}">${label}</a>`).join('')}</nav><div class="top-tools"><button class="icon-button" data-action="theme-toggle" aria-label="Alternar tema">${icon(data.settings.theme === 'dark' ? 'sun' : 'moon')}</button><button class="button" data-action="sign-out">Terminar sessão</button><button class="icon-button menu-button" data-action="menu" aria-label="Abrir menu">☰</button></div></div>`;
    }
  }
  function renderHome() {
    return `<div class="landing">
      <section class="landing-hero" id="sobre">
        <div class="landing-copy"><p class="eyebrow">Plataforma inteligente de gestão e monitorização de apiários</p><h1>Mais cuidado com as colmeias.<br><span>Mais visão do apiário.</span></h1><p>A MAIA reúne num só lugar as medições ambientais, o peso das colmeias, as imagens e o trabalho diário do apicultor.</p><div class="landing-actions"><button class="button primary" data-action="open-auth">Entrar no painel ${icon('arrow')}</button><a class="button outline" href="#funcionalidades">Conhecer funcionalidades</a></div><p class="landing-meta">Projeto de apicultura e tecnologia · Cria uma conta ou inicia sessão para abrir o painel.</p></div>
        <div class="apiary-art" role="img" aria-label="Ilustração de apiário entre árvores e colmeias"><svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#b7d4a8"/><stop offset="1" stop-color="#e8d797"/></linearGradient><linearGradient id="hill" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#7eae75"/><stop offset="1" stop-color="#426f4d"/></linearGradient></defs><rect x="8" y="12" width="584" height="374" rx="30" fill="url(#sky)"/><circle cx="475" cy="86" r="43" fill="#f5d679" opacity=".96"/><path d="M9 221c92-56 169-41 251 2 87-45 203-60 332-4v137H9V221Z" fill="#8cb580"/><path d="M9 263c110-46 213-10 293 14 95-39 194-33 290-5v104H9V263Z" fill="url(#hill)"/><path d="M55 274c22-92 78-125 123-134-4 67-38 123-123 134Z" fill="#315e43"/><path d="M68 257c26-64 57-91 98-112M529 267c-11-86-54-129-92-152 0 69 26 125 92 152Z" fill="#315e43"/><path d="M500 249c-16-69-44-104-77-133" stroke="#d4d3a1" stroke-width="5" fill="none"/><g transform="translate(205 174)"><path d="M17 53h130v102H17z" fill="#d49b3d"/><path d="M9 48h146v17H9zM16 79h132v13H16zM16 108h132v13H16z" fill="#f0c56a" stroke="#9b6726" stroke-width="3"/><path d="M50 155v20m64-20v20" stroke="#684a27" stroke-width="8" stroke-linecap="round"/><path d="M65 133h34v22H65z" fill="#704b28"/><path d="M72 142h20" stroke="#e2b75a" stroke-width="3"/></g><g transform="translate(374 218) scale(.68)"><path d="M17 53h130v102H17z" fill="#d49b3d"/><path d="M9 48h146v17H9zM16 79h132v13H16zM16 108h132v13H16z" fill="#f0c56a" stroke="#9b6726" stroke-width="3"/><path d="M50 155v20m64-20v20" stroke="#684a27" stroke-width="8" stroke-linecap="round"/><path d="M65 133h34v22H65z" fill="#704b28"/></g><g transform="translate(96 102)"><ellipse cx="18" cy="14" rx="10" ry="7" fill="#fff5d8" opacity=".9"/><ellipse cx="35" cy="14" rx="10" ry="7" fill="#fff5d8" opacity=".9"/><ellipse cx="27" cy="18" rx="13" ry="9" fill="#252f24"/><path d="M21 11v14m12-14v14" stroke="#edb745" stroke-width="4"/><path d="m27 8 4-6m-4 6-5-6" stroke="#252f24" stroke-width="2" stroke-linecap="round"/></g><g fill="#f4db8d"><circle cx="179" cy="300" r="4"/><circle cx="167" cy="316" r="3"/><circle cx="455" cy="303" r="4"/><circle cx="433" cy="323" r="3"/><circle cx="300" cy="279" r="3"/></g><rect x="8" y="12" width="584" height="374" rx="30" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="2"/></svg></div>
      </section>
      <section class="feature-section" id="funcionalidades"><div class="view-width"><p class="eyebrow">Uma visão completa do apiário</p><h2>As ferramentas do apicultor, ligadas entre si.</h2><p class="section-intro">Organiza a informação das colmeias, acompanha sensores e mantém o registo do trabalho realizado. O painel não inventa medições: os valores aparecem quando a fonte real estiver ligada.</p><div class="feature-grid">
        <article class="feature-card"><span class="stat-icon">${icon('sensor')}</span><h3>Monitorização</h3><p>Temperatura, humidade e peso, com médias e evolução histórica.</p></article>
        <article class="feature-card"><span class="stat-icon amber">${icon('hive')}</span><h3>Gestão de colmeias</h3><p>Identificação, localização, instalação, medições e histórico individual.</p></article>
        <article class="feature-card"><span class="stat-icon">${icon('task')}</span><h3>Visitas e tarefas</h3><p>Regista observações, intervenções e próximos trabalhos no apiário.</p></article>
        <article class="feature-card"><span class="stat-icon amber">${icon('camera')}</span><h3>Câmara e imagens</h3><p>Área para stream do ESP32-CAM e arquivo de fotografias associado a colmeias.</p></article>
      </div></div></section>
      <footer class="landing-bottom"><strong>MAIA</strong><span>Plataforma Inteligente de Gestão e Monitorização de Apiários · PAP</span><span>Dados locais neste navegador</span></footer>
    </div>`;
  }

  function renderAuthPage() {
    if (!firebaseAuth) {
      const message = firebaseConfigured
        ? 'Não foi possível iniciar o Firebase Auth. Confirma a configuração da aplicação Web e tenta novamente.'
        : 'A autenticação ainda não está configurada. Cria uma aplicação Web Firebase e coloca os dados de configuração no início do ficheiro app.js.';
      return `<div class="auth-page"><section class="card auth-card"><p class="eyebrow">Acesso à MAIA</p><h1>Ativar contas de utilizador</h1><p>${message}</p><div class="notice"><span class="notice-icon">i</span><div><strong>É necessária uma configuração única</strong><p>Depois da configuração, os utilizadores poderão criar conta com email e palavra-passe. As palavras-passe são geridas pelo Firebase Auth.</p></div></div><button class="button" data-view="home">Voltar à página inicial</button></section></div>`;
    }
    const creating = authMode === 'signup';
    const feedbackClass = authMessageKind === 'error' ? 'auth-feedback error' : 'auth-feedback';
    return `<div class="auth-page"><section class="card auth-card"><p class="eyebrow">Acesso à MAIA</p><h1>${creating ? 'Criar conta' : 'Entrar no painel'}</h1><p>${creating ? 'Regista o teu email e escolhe uma palavra-passe para começar.' : 'Inicia sessão para continuar para o painel do apiário.'}</p><form id="auth-form" class="auth-form"><div class="field"><label for="auth-email">Email</label><input id="auth-email" name="email" type="email" autocomplete="email" required maxlength="254" placeholder="nome@exemplo.pt"></div><div class="field"><label for="auth-password">Palavra-passe</label><input id="auth-password" name="password" type="password" autocomplete="${creating ? 'new-password' : 'current-password'}" required minlength="8" placeholder="Pelo menos 8 caracteres"></div>${creating ? '<div class="field"><label for="auth-password-confirm">Confirmar palavra-passe</label><input id="auth-password-confirm" name="passwordConfirm" type="password" autocomplete="new-password" required minlength="8" placeholder="Repete a palavra-passe"></div>' : ''}<p class="auth-hint">${creating ? 'Poderás ter de confirmar o email antes de entrar.' : 'Ainda não tens conta? Usa o botão abaixo para criar uma.'}</p><p class="${feedbackClass}" id="auth-feedback" role="status" aria-live="polite">${esc(authMessage)}</p><button class="button primary auth-submit" type="submit" ${authBusy ? 'disabled' : ''}>${authBusy ? 'Aguarda…' : creating ? 'Criar conta' : 'Entrar'}</button></form>${creating ? '' : '<button class="auth-switch" type="button" data-action="reset-password">Esqueci a palavra-passe</button>'}<button class="auth-switch" type="button" data-action="toggle-auth">${creating ? 'Já tenho conta — iniciar sessão' : 'Novo utilizador? Criar conta'}</button><p class="auth-privacy">Os dados do apiário continuam guardados neste navegador; ainda não são sincronizados entre dispositivos.</p></section></div>`;
  }
  function pageHead(title, subtitle, action = '') {
    return `<div class="page-head"><div><p class="eyebrow">MAIA · Apiário</p><h1>${title}</h1><p>${subtitle}</p></div>${action}</div>`;
  }
  function panelShell(content) {
    return `<div class="app-layout"><aside class="sidebar"><p class="sidebar-label">Gestão do apiário</p>${navItems.map(([id, label, ico]) => `<button class="side-link ${view === id || (view === 'hive-detail' && id === 'hives') ? 'active' : ''}" data-view="${id}">${icon(ico)}${label}</button>`).join('')}<div class="side-note"><strong>${sensorState === 'connected' ? 'Sensores ligados' : 'Fontes por configurar'}</strong>${sensorState === 'connected' ? 'A receber medições da API.' : 'As leituras reais aparecem após configurar uma fonte.'}</div></aside><section class="view"><div class="view-width">${content}</div></section></div>`;
  }
  function statCard(label, value, note, iconName, amber = false) {
    return `<article class="card stat-card"><div class="stat-head"><span>${label}</span><span class="stat-icon ${amber ? 'amber' : ''}">${icon(iconName)}</span></div><div class="stat-value">${value}</div><div class="stat-foot">${note}</div></article>`;
  }
  function latestReadingRows(records, limit = 6, perHive = false) {
    const rows = [...records].sort((a, b) => new Date(b.measuredAt) - new Date(a.measuredAt)).slice(0, limit);
    if (!rows.length) return `<div class="empty-state"><div><strong>Sem medições recebidas</strong>Configura a API dos sensores nas definições para começar a criar histórico.</div></div>`;
    return `<div class="table-wrap"><table><thead><tr><th>Data e hora</th><th>Colmeia</th>${perHive ? '<th>Exterior · média DHT11</th><th>Interior · DHT22</th>' : '<th>Temp. média</th>'}<th>Humidade média</th><th>Peso</th></tr></thead><tbody>${rows.map(r => { const v = sensorValues(r); const temperatures = perHive ? `<td>${average(v.t11) == null ? '—' : `${num(average(v.t11))} °C`}</td><td>${v.t22 == null ? '—' : `${num(v.t22)} °C`}</td>` : `<td>${num(average(v.tAll))}${v.tAll.length ? ' °C' : '—'}</td>`; return `<tr><td>${fmtDateTime(r.measuredAt)}</td><td>${esc(hiveLabel(r.hiveId))}</td>${temperatures}<td>${num(average(v.hAll))}${v.hAll.length ? ' %' : '—'}</td><td>${v.weight == null ? '—' : `${num(v.weight)} kg`}</td></tr>`; }).join('')}</tbody></table></div>`;
  }
  function chartSvg(records, field, color = '#5a9b6e') {
    const points = records.map(r => {
      const v = sensorValues(r);
      const value = field === 'outside-temperature' ? average(v.t11)
        : field === 'inside-temperature' ? v.t22
        : field === 'temperature' ? average(v.tAll)
        : field === 'humidity' ? average(v.hAll) : v.weight;
      return { date: r.measuredAt, value };
    }).filter(p => Number.isFinite(p.value)).slice(-18);
    if (!points.length) return `<div class="chart-empty">Ainda não existem medições reais para este gráfico.</div>`;
    const width = 600, height = 155, left = 32, right = 12, top = 12, bottom = 25;
    const vals = points.map(p => p.value), lo = Math.min(...vals), hi = Math.max(...vals), range = hi - lo || Math.max(1, Math.abs(hi) * .1);
    const coords = points.map((p, i) => ({ x: left + (points.length === 1 ? (width - left - right) / 2 : i * (width - left - right) / (points.length - 1)), y: top + (hi - p.value) * (height - top - bottom) / range }));
    const line = coords.map(p => `${p.x},${p.y}`).join(' ');
    const area = `${coords[0].x},${height - bottom} ${line} ${coords.at(-1).x},${height - bottom}`;
    const grad = `g-${field}-${Math.random().toString(36).slice(2, 7)}`;
    return `<svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Gráfico de ${field}"><defs><linearGradient id="${grad}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".45"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs><path class="grid-line" d="M${left} ${top + 25}H${width-right}M${left} ${top + 70}H${width-right}M${left} ${top + 115}H${width-right}"/><text x="1" y="${top + 5}">${num(hi)}</text><text x="1" y="${height-bottom}">${num(lo)}</text><polygon points="${area}" fill="url(#${grad})"/><polyline points="${line}" fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>${coords.map((p, i) => `<circle cx="${p.x}" cy="${p.y}" r="3.3" fill="var(--surface)" stroke="${color}" stroke-width="2"><title>${fmtDateTime(points[i].date)} · ${num(points[i].value)}</title></circle>`).join('')}<text x="${left}" y="${height-4}">${fmtDate(points[0].date, { day: '2-digit', month: 'short' })}</text><text x="${width-right-50}" y="${height-4}">${fmtDate(points.at(-1).date, { day: '2-digit', month: 'short' })}</text></svg>`;
  }
  function chartCard(title, sub, records, field) {
    return `<article class="card chart-card"><h3>${title}</h3><p class="chart-sub">${sub}</p>${chartSvg(records, field)}</article>`;
  }
  function currentAlerts() {
    const thresholds = data.settings.thresholds || {};
    const limits = Object.entries(thresholds).filter(([, v]) => v !== '' && v != null && Number.isFinite(Number(v)));
    const latest = latestMeasurements();
    const alerts = [];
    for (const r of latest) {
      const v = sensorValues(r), label = hiveLabel(r.hiveId);
      const set = value => value !== '' && value != null && Number.isFinite(Number(value));
      if (set(thresholds.tempMax) && average(v.tAll) != null && average(v.tAll) > Number(thresholds.tempMax)) alerts.push(`${label}: temperatura acima do limite definido.`);
      if (set(thresholds.tempMin) && average(v.tAll) != null && average(v.tAll) < Number(thresholds.tempMin)) alerts.push(`${label}: temperatura abaixo do limite definido.`);
      if (set(thresholds.humidityMax) && average(v.hAll) != null && average(v.hAll) > Number(thresholds.humidityMax)) alerts.push(`${label}: humidade acima do limite definido.`);
      if (set(thresholds.humidityMin) && average(v.hAll) != null && average(v.hAll) < Number(thresholds.humidityMin)) alerts.push(`${label}: humidade abaixo do limite definido.`);
      if (set(thresholds.weightMin) && v.weight != null && v.weight < Number(thresholds.weightMin)) alerts.push(`${label}: peso abaixo do limite definido.`);
    }
    const openTasks = data.tasks.filter(t => !t.done && t.dueDate && t.dueDate <= today()).length;
    if (openTasks) alerts.unshift(`${openTasks} tarefa${openTasks === 1 ? '' : 's'} por concluir com data de execução atingida.`);
    if (!latest.length && limits.length && !openTasks) return `<div class="empty-state"><div><strong>Sem medições para avaliar</strong>Os limites estão definidos, mas ainda não chegaram leituras dos sensores.</div></div>`;
    if (!limits.length && !openTasks) return `<div class="empty-state"><div><strong>Limites de alerta por definir</strong>${latest.length ? 'As medições existem, mas ainda não há limites definidos para avaliar alertas.' : 'Define limites nas definições e liga os sensores para acompanhar alertas reais.'}</div></div>`;
    if (!alerts.length) return `<div class="notice"><span class="notice-icon">✓</span><div><strong>Sem alertas ativos</strong><p>Não há medições fora dos limites configurados nem tarefas vencidas.</p></div></div>`;
    return `<div class="grid">${alerts.slice(0, 5).map(a => `<div class="notice"><span class="notice-icon">!</span><div><strong>Alerta do apiário</strong><p>${esc(a)}</p></div></div>`).join('')}</div>`;
  }

  function dashboardPage() {
    const latest = latestMeasurements();
    const allVals = latest.map(sensorValues);
    const t = average(allVals.flatMap(v => v.tAll));
    const h = average(allVals.flatMap(v => v.hAll));
    const w = average(allVals.map(v => v.weight).filter(v => v != null));
    const activity = activities().slice(0, 5);
    const apiaryStatus = !data.hives.length ? 'Sem colmeias registadas' : sensorState === 'connected' ? 'A receber medições' : sensorState === 'error' ? 'Sem resposta dos sensores' : 'À espera de ligação dos sensores';
    return `${pageHead('Painel principal', 'Resumo do estado dos apiários e da atividade recente.', `<button class="button" data-action="sync">${icon('refresh')} Atualizar dados</button>`)}
      <div class="card status-summary"><span class="stat-icon">${icon('bee')}</span><div><strong>Estado geral do apiário</strong><small>${apiaryStatus} · o estado reflete apenas a ligação e os dados recebidos.</small></div><i class="dot ${sensorState === 'connected' ? 'ok' : sensorState === 'error' ? 'error' : ''}"></i></div>
      ${sensorState === 'connected' ? '' : `<div class="notice"><span class="notice-icon">i</span><div><strong>Ligação aos sensores ainda não configurada</strong><p>Os indicadores ficam vazios até receberem medições reais. Configura a API em Definições.</p></div><button class="button small" data-view="settings">Configurar</button></div>`}
      <div class="grid stats-grid" style="margin-top:15px">${statCard('Total de colmeias', data.hives.length, 'Registadas neste navegador', 'hive')}${statCard('Temperatura média', t == null ? '<span class="data-empty">Sem dados</span>' : `${num(t)}<small> °C</small>`, 'Média das leituras mais recentes', 'temp', true)}${statCard('Humidade média', h == null ? '<span class="data-empty">Sem dados</span>' : `${num(h)}<small> %</small>`, 'Média das leituras mais recentes', 'drop')}${statCard('Peso médio registado', w == null ? '<span class="data-empty">Sem dados</span>' : `${num(w)}<small> kg</small>`, 'Apenas colmeias com leitura de peso', 'weight', true)}</div>
      <div class="section-row"><div><h2>Evolução das medições</h2><p>Gráficos construídos apenas com dados recebidos.</p></div><button class="section-action" data-view="monitoring">Ver monitorização →</button></div>
      <div class="grid chart-grid">${chartCard('Temperatura', 'Média dos sensores disponíveis · °C', sortedMeasurements(data.measurements), 'temperature')}${chartCard('Humidade', 'Média dos sensores disponíveis · %', sortedMeasurements(data.measurements), 'humidity')}${chartCard('Peso', 'Leitura da célula de carga · kg', sortedMeasurements(data.measurements), 'weight')}</div>
      <div class="two-col"><section><div class="section-row"><h2>Últimas medições</h2><button class="section-action" data-view="monitoring">Histórico →</button></div>${latestReadingRows(data.measurements, 5)}</section><section><div class="section-row"><h2>Alertas importantes</h2><button class="section-action" data-view="settings">Definir limites →</button></div>${currentAlerts()}</section></div>
      <section><div class="section-row"><div><h2>Atividade recente</h2><p>Visitas registadas e tarefas do apicultor.</p></div><button class="section-action" data-view="activities">Ver atividades →</button></div>${activity.length ? `<div class="table-wrap"><table><thead><tr><th>Data</th><th>Tipo</th><th>Registo</th><th>Colmeia</th></tr></thead><tbody>${activity.map(a => `<tr><td>${fmtDate(a.date)}</td><td>${esc(a.type)}</td><td>${esc(a.title)}${a.text ? ` · ${esc(a.text)}` : ''}</td><td>${esc(hiveLabel(a.hiveId))}</td></tr>`).join('')}</tbody></table></div>` : `<div class="empty-state"><div><strong>Sem atividades registadas</strong>As visitas e tarefas aparecem aqui depois de serem criadas.</div></div>`}</section>`;
  }

  function renderHives() {
    const action = `<button class="button primary" data-action="add-hive">${icon('plus')} Adicionar colmeia</button>`;
    const cards = data.hives.map(h => {
      const latest = latestMeasurements().find(m => m.hiveId === h.identifier);
      const v = sensorValues(latest);
      return `<article class="hive-card"><div><div class="hive-card-top"><span class="hive-avatar">${icon('hive')}</span><span class="status"><i class="dot ${latest ? 'ok' : ''}"></i>${latest ? 'Com medições' : 'Sem medições'}</span></div><h3>${esc(h.identifier)} · ${esc(h.name)}</h3><p>${icon('pin')} ${esc(h.location || 'Localização por indicar')}</p></div><div class="hive-card-foot"><span class="help-text">Instalada em ${fmtDate(h.installDate)}</span><button class="button small soft" data-action="hive-detail" data-id="${esc(h.identifier)}">Abrir ficha ${icon('arrow')}</button></div></article>`;
    }).join('');
    return `${pageHead('Colmeias', 'Identificação, localização e histórico individual.', action)}${data.hives.length ? `<div class="hive-grid">${cards}</div>` : `<div class="empty-state"><div><strong>Ainda não existem colmeias registadas</strong>Adiciona uma colmeia para começar a organizar o apiário.<div style="margin-top:13px"><button class="button primary" data-action="add-hive">${icon('plus')} Adicionar a primeira colmeia</button></div></div></div>`}`;
  }

  function renderHiveDetail() {
    const h = hiveFor(selectedHive);
    if (!h) { view = 'hives'; return renderHives(); }
    const records = sortedMeasurements(data.measurements.filter(m => m.hiveId === h.identifier));
    const vals = sensorValues(records.at(-1));
    const activity = activities().filter(a => a.hiveId === h.identifier);
    return `${pageHead(`${esc(h.identifier)} · ${esc(h.name)}`, `${esc(h.location || 'Localização por indicar')} · Instalada em ${fmtDate(h.installDate)}`, `<button class="button" data-action="edit-hive" data-id="${esc(h.identifier)}">${icon('edit')} Editar colmeia</button>`)}
      <div class="section-row"><h2>Última medição</h2><button class="section-action" data-view="monitoring">Abrir monitorização →</button></div>
      <div class="grid stats-grid">${statCard('Temperatura exterior', average(vals.t11) == null ? '<span class="data-empty">Sem dados</span>' : `${num(average(vals.t11))}<small> °C</small>`, 'Média dos dois DHT11', 'temp', true)}${statCard('Temperatura interior', vals.t22 == null ? '<span class="data-empty">Sem dados</span>' : `${num(vals.t22)}<small> °C</small>`, 'Leitura do DHT22 dentro da colmeia', 'temp')}${statCard('Humidade média', average(vals.hAll) == null ? '<span class="data-empty">Sem dados</span>' : `${num(average(vals.hAll))}<small> %</small>`, 'Leituras DHT disponíveis', 'drop')}${statCard('Peso atual', vals.weight == null ? '<span class="data-empty">Sem dados</span>' : `${num(vals.weight)}<small> kg</small>`, 'Célula de carga + HX711', 'weight', true)}${statCard('Medições guardadas', records.length, 'Recebidas da fonte configurada', 'sensor')}</div>
      <div class="section-row"><h2>Histórico desta colmeia</h2></div><div class="grid chart-grid">${chartCard('Temperatura exterior', 'Média dos dois DHT11 · °C', records, 'outside-temperature')}${chartCard('Temperatura interior', 'Leitura do DHT22 · °C', records, 'inside-temperature')}${chartCard('Humidade', 'Média das leituras disponíveis · %', records, 'humidity')}${chartCard('Peso', 'Célula de carga · kg', records, 'weight')}</div>
      <div class="two-col"><section><div class="section-row"><h2>Medições</h2></div>${latestReadingRows(records, 20, true)}</section><section><div class="section-row"><h2>Visitas e tarefas</h2></div>${activity.length ? `<div class="table-wrap"><table><thead><tr><th>Data</th><th>Tipo</th><th>Descrição</th></tr></thead><tbody>${activity.map(a => `<tr><td>${fmtDate(a.date)}</td><td>${esc(a.type)}</td><td>${esc(a.title)} · ${esc(a.text || '')}</td></tr>`).join('')}</tbody></table></div>` : `<div class="empty-state"><div><strong>Sem histórico de atividades</strong>Os registos desta colmeia aparecerão aqui.</div></div>`}</section></div>
      <div class="section-row"><button class="button" data-view="hives">← Voltar às colmeias</button><button class="button danger" data-action="delete-hive" data-id="${esc(h.identifier)}">${icon('trash')} Eliminar colmeia</button></div>`;
  }

  function latestForHive(id) { return [...data.measurements].filter(m => m.hiveId === id).sort((a,b) => new Date(b.measuredAt)-new Date(a.measuredAt))[0] || null; }
  function readingCard(title, sub, temperature, humidity) {
    return `<article class="sensor-card"><h3>${title}</h3><p class="muted">${sub}</p><div class="sensor-values"><div class="sensor-value-box"><span>Temperatura</span><strong>${temperature == null ? '—' : `${num(temperature)} °C`}</strong></div><div class="sensor-value-box"><span>Humidade</span><strong>${humidity == null ? '—' : `${num(humidity)} %`}</strong></div></div></article>`;
  }
  function renderMonitoring() {
    const selected = selectedHive || '';
    const records = sortedMeasurements(data.measurements.filter(m => !selected || m.hiveId === selected));
    const latest = selected ? latestForHive(selected) : null;
    const latestValues = sensorValues(latest);
    const allLatest = selected ? [latest].filter(Boolean) : latestMeasurements();
    const stats = allLatest.map(sensorValues);
    const avg11T = average(stats.flatMap(v => v.t11)), avg11H = average(stats.flatMap(v => v.h11));
    const hiveOptions = data.hives.map(h => `<option value="${esc(h.identifier)}" ${selected === h.identifier ? 'selected' : ''}>${esc(h.identifier)} · ${esc(h.name)}</option>`).join('');
    return `${pageHead('Monitorização', 'Leituras dos DHT11, DHT22 e célula de carga HX711.', `<button class="button" data-action="sync">${icon('refresh')} Sincronizar</button>`)}
      <div class="filter-row"><label for="monitor-hive" class="help-text">Colmeia</label><select id="monitor-hive"><option value="">Todas as colmeias</option>${hiveOptions}</select><span class="status"><i class="dot ${sensorState === 'connected' ? 'ok' : ''}"></i>${sensorState === 'connected' ? 'Fonte ligada' : 'Fonte sem ligação'}</span><button class="button small" data-view="settings">Configurar fonte</button></div>
      ${!records.length ? `<div class="notice"><span class="notice-icon">i</span><div><strong>Sem medições reais disponíveis</strong><p>Quando a API configurada enviar dados, os valores individuais, médias e gráficos serão apresentados nesta página.</p></div></div>` : ''}
      <div class="section-row"><div><h2>Leituras atuais</h2><p>${latest ? `Última medição: ${fmtDateTime(latest.measuredAt)}` : 'Valores da medição mais recente.'}</p></div></div>
      <div class="sensor-cards">${readingCard('DHT11 · Sensor 1', 'Medição individual', average(latestValues.t11?.slice(0,1)) ?? latest?.dht11_1?.temperature ?? null, latest?.dht11_1?.humidity ?? null)}${readingCard('DHT11 · Sensor 2', 'Medição individual', latest?.dht11_2?.temperature ?? null, latest?.dht11_2?.humidity ?? null)}${readingCard('Média dos DHT11', 'Média dos dois sensores disponíveis', avg11T, avg11H)}${readingCard('DHT22', 'Medição individual', latest?.dht22?.temperature ?? null, latest?.dht22?.humidity ?? null)}<article class="sensor-card"><h3>Peso</h3><p class="muted">Célula de carga + HX711</p><div class="sensor-value-box"><span>Leitura atual</span><strong>${latestValues.weight == null ? '—' : `${num(latestValues.weight)} kg`}</strong></div></article><article class="sensor-card"><h3>Médias gerais</h3><p class="muted">DHT11 e DHT22 disponíveis</p><div class="sensor-values"><div class="sensor-value-box"><span>Temperatura</span><strong>${average(latestValues.tAll) == null ? '—' : `${num(average(latestValues.tAll))} °C`}</strong></div><div class="sensor-value-box"><span>Humidade</span><strong>${average(latestValues.hAll) == null ? '—' : `${num(average(latestValues.hAll))} %`}</strong></div></div></article></div>
      <div class="section-row"><div><h2>Histórico</h2><p>Os gráficos usam as medições guardadas neste navegador.</p></div></div><div class="grid chart-grid">${chartCard('Temperatura', 'Média dos sensores · °C', records, 'temperature')}${chartCard('Humidade', 'Média dos sensores · %', records, 'humidity')}${chartCard('Peso', 'HX711 · kg', records, 'weight')}</div>
      <div class="section-row"><h2>Registos recebidos</h2></div>${latestReadingRows(records, 50)}`;
  }

  function renderActivities() {
    const options = data.hives.map(h => `<option value="${esc(h.identifier)}">${esc(h.identifier)} · ${esc(h.name)}</option>`).join('');
    const visits = [...data.visits].sort((a,b) => new Date(b.date)-new Date(a.date));
    const tasks = [...data.tasks].sort((a,b) => (a.done - b.done) || new Date(a.dueDate)-new Date(b.dueDate));
    return `${pageHead('Visitas e tarefas', 'Regista observações, intervenções e próximos trabalhos.')}
      ${!data.hives.length ? `<div class="notice" style="margin-bottom:15px"><span class="notice-icon">i</span><div><strong>Sem colmeias registadas</strong><p>Podes criar registos sem associação ou adicionar uma colmeia primeiro.</p></div><button class="button small" data-view="hives">Colmeias</button></div>` : ''}
      <div class="two-col"><section class="card"><h2 style="margin:0 0 15px;font-size:.98rem">Registar visita</h2><form id="visit-form" class="form-grid"><div class="field"><label for="visit-hive">Colmeia</label><select id="visit-hive"><option value="">Sem associação</option>${options}</select></div><div class="field"><label for="visit-date">Data</label><input id="visit-date" type="date" value="${today()}" required></div><div class="field"><label for="visit-type">Tipo de visita</label><select id="visit-type"><option>Inspeção</option><option>Manutenção</option><option>Alimentação</option><option>Tratamento</option><option>Colheita</option><option>Outro</option></select></div><div class="field full"><label for="visit-notes">Observações e intervenções</label><textarea id="visit-notes" placeholder="O que observaste ou fizeste?" required></textarea></div><div class="field full form-actions"><button class="button primary" type="submit">Guardar visita</button></div></form></section>
      <section class="card"><h2 style="margin:0 0 15px;font-size:.98rem">Criar tarefa</h2><form id="task-form" class="form-grid"><div class="field full"><label for="task-title">Tarefa</label><input id="task-title" type="text" maxlength="120" placeholder="Ex.: verificar reservas" required></div><div class="field"><label for="task-hive">Colmeia</label><select id="task-hive"><option value="">Apiário / sem associação</option>${options}</select></div><div class="field"><label for="task-date">Data prevista</label><input id="task-date" type="date" value="${today()}" required></div><div class="field full"><label for="task-notes">Notas (opcional)</label><textarea id="task-notes" placeholder="Detalhes adicionais"></textarea></div><div class="field full form-actions"><button class="button primary" type="submit">Adicionar tarefa</button></div></form></section></div>
      <div class="two-col"><section><div class="section-row"><h2>Tarefas</h2><span class="help-text">${tasks.filter(t=>!t.done).length} por concluir</span></div>${tasks.length ? `<div class="table-wrap"><table><thead><tr><th>Estado</th><th>Data</th><th>Tarefa</th><th>Colmeia</th><th></th></tr></thead><tbody>${tasks.map(t => `<tr><td><button class="button small ${t.done ? 'soft' : ''}" data-action="toggle-task" data-id="${esc(t.id)}">${t.done ? 'Concluída' : 'Por concluir'}</button></td><td>${fmtDate(t.dueDate)}</td><td><strong>${esc(t.title)}</strong>${t.notes ? `<br><span class="help-text">${esc(t.notes)}</span>` : ''}</td><td>${esc(hiveLabel(t.hiveId))}</td><td><button class="icon-button" data-action="delete-task" data-id="${esc(t.id)}" aria-label="Eliminar tarefa">${icon('trash')}</button></td></tr>`).join('')}</tbody></table></div>` : `<div class="empty-state"><div><strong>Sem tarefas</strong>Cria uma tarefa para organizar o trabalho no apiário.</div></div>`}</section>
      <section><div class="section-row"><h2>Histórico de visitas</h2><span class="help-text">${visits.length} registos</span></div>${visits.length ? `<div class="table-wrap"><table><thead><tr><th>Data</th><th>Tipo</th><th>Colmeia</th><th>Observações</th><th></th></tr></thead><tbody>${visits.map(v => `<tr><td>${fmtDate(v.date)}</td><td>${esc(v.type)}</td><td>${esc(hiveLabel(v.hiveId))}</td><td>${esc(v.notes)}</td><td><button class="icon-button" data-action="delete-visit" data-id="${esc(v.id)}" aria-label="Eliminar visita">${icon('trash')}</button></td></tr>`).join('')}</tbody></table></div>` : `<div class="empty-state"><div><strong>Sem visitas registadas</strong>Os registos aparecerão aqui depois de guardados.</div></div>`}</section></div>`;
  }

  function renderCamera() {
    const stream = data.settings.cameraUrl || '';
    const photos = [...data.photos].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt));
    const options = data.hives.map(h => `<option value="${esc(h.identifier)}">${esc(h.identifier)} · ${esc(h.name)}</option>`).join('');
    return `${pageHead('Câmara e imagens', 'Consulta o stream da ESP32-CAM e guarda fotografias associadas às colmeias.')}
      <div class="two-col"><section class="card"><div class="section-row" style="margin-top:0"><div><h2>Imagem da câmara</h2><p>O stream aparece quando um endereço real estiver configurado.</p></div><button class="button small" data-view="settings">Configurar URL</button></div><div class="camera-frame"><img id="camera-stream" src="${stream ? esc(stream) : ''}" alt="Stream da ESP32-CAM" ${stream ? '' : 'hidden'}><div id="camera-empty" class="camera-placeholder" ${stream ? 'hidden' : ''}><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="12" width="38" height="29" rx="4"/><path d="m15 12 3-5h12l3 5"/><circle cx="24" cy="27" r="8"/></svg><strong>Stream ainda não configurado</strong><p>Adiciona o endereço MJPEG da ESP32-CAM nas definições. Não existe ligação ativa neste momento.</p></div></div><p class="help-text" id="camera-status-text" style="margin:10px 0 0">${stream ? 'A tentar abrir o endereço configurado…' : 'Sem ligação à câmara.'}</p></section>
      <section class="card"><h2 style="margin:0 0 5px;font-size:.98rem">Guardar fotografia</h2><p class="help-text" style="margin:0 0 15px">Adiciona uma imagem e associa-a a uma colmeia. O ficheiro fica guardado neste navegador.</p><form id="photo-form" class="form-grid"><div class="field full"><label for="photo-file">Imagem</label><input id="photo-file" type="file" accept="image/*" required><small>As imagens são reduzidas para poupar espaço.</small></div><div class="field"><label for="photo-hive">Colmeia</label><select id="photo-hive"><option value="">Sem associação</option>${options}</select></div><div class="field"><label for="photo-date">Data</label><input id="photo-date" type="date" value="${today()}" required></div><div class="field full"><label for="photo-note">Observação (opcional)</label><input id="photo-note" type="text" maxlength="140" placeholder="Ex.: entrada da colmeia"></div><div class="field full form-actions"><button class="button primary" type="submit">Guardar fotografia</button></div></form><div class="notice" style="margin-top:17px"><span class="notice-icon">i</span><div><strong>Deteção de pragas em preparação</strong><p>A deteção de vespas e traças não está implementada nesta versão.</p></div></div></section></div>
      <div class="section-row"><div><h2>Histórico de fotografias</h2><p>${photos.length} imagem${photos.length === 1 ? '' : 'ns'} guardada${photos.length === 1 ? '' : 's'} neste navegador.</p></div></div>${photos.length ? `<div class="gallery-grid">${photos.map(p => `<article class="photo-card"><img src="${esc(p.dataUrl)}" alt="${esc(p.note || 'Fotografia do apiário')}" loading="lazy"><div class="photo-info"><strong>${esc(hiveLabel(p.hiveId))}</strong><span>${fmtDate(p.createdAt)}${p.note ? ` · ${esc(p.note)}` : ''}</span></div><div class="photo-actions"><button class="button small danger" data-action="delete-photo" data-id="${esc(p.id)}">Eliminar</button></div></article>`).join('')}</div>` : `<div class="empty-state"><div><strong>Ainda não há fotografias</strong>As imagens guardadas ficarão disponíveis nesta galeria.</div></div>`}`;
  }

  function renderSettings() {
    const s = data.settings, t = s.thresholds || {};
    return `${pageHead('Definições', 'Preferências, ligações e estado do sistema.')}
      <div class="settings-grid"><section class="card settings-card"><h2>Aparência</h2><p>Escolhe um dos dois estilos. A preferência fica guardada neste navegador.</p><div class="theme-choices"><label class="theme-choice"><input type="radio" name="theme" value="light" ${s.theme === 'light' ? 'checked' : ''}><span class="theme-swatch"></span><span><strong>Claro</strong><small>Fundo claro e tons verdes</small></span></label><label class="theme-choice"><input type="radio" name="theme" value="dark" ${s.theme === 'dark' ? 'checked' : ''}><span class="theme-swatch dark"></span><span><strong>Escuro</strong><small>Fundo escuro e tons verdes</small></span></label></div></section>
      <section class="card settings-card"><h2>Fonte de medições</h2><p>URL de uma API que publique JSON com as leituras reais do Arduino/ESP32.</p><form id="sensor-settings-form" class="form-grid"><div class="field full"><label for="sensor-url">URL da API</label><input id="sensor-url" type="url" value="${esc(s.sensorUrl || '')}" placeholder="http://192.168.1.50/api/measurements"><small>A origem tem de permitir pedidos do site (CORS) e devolver os dados no formato indicado abaixo.</small></div><div class="field"><label for="poll-seconds">Intervalo de atualização (segundos)</label><input id="poll-seconds" type="number" min="10" max="3600" step="5" value="${Number(s.pollSeconds) || 30}"></div><div class="field form-actions" style="align-self:end"><button class="button primary" type="submit">Guardar ligação</button></div></form><details><summary>Formato esperado da API</summary><p class="help-text">Cada medição identifica a colmeia pelo identificador criado em Gestão de colmeias. Troca os valores null por leituras recolhidas pelos sensores.</p><pre class="code-block">{
  "measurements": [{
    "hiveId": "COL-01",
    "measuredAt": "2026-11-05T12:30:00Z",
    "dht11": [
      { "temperature": null, "humidity": null },
      { "temperature": null, "humidity": null }
    ],
    "dht22": { "temperature": null, "humidity": null },
    "weightKg": null
  }]
}</pre></details></section>
      <section class="card settings-card"><h2>Câmara ESP32-CAM</h2><p>Indica o endereço de imagem MJPEG disponibilizado pelo firmware da câmara.</p><form id="camera-settings-form" class="form-grid"><div class="field full"><label for="camera-url">URL do stream</label><input id="camera-url" type="url" value="${esc(s.cameraUrl || '')}" placeholder="http://192.168.1.51:81/stream"><small>O caminho depende do modelo e do firmware. O endereço não é presumido.</small></div><div class="field full form-actions"><button class="button primary" type="submit">Guardar câmara</button></div></form></section>
      <section class="card settings-card"><h2>Limites de alerta</h2><p>Os limites ficam desativados até serem definidos pelo apicultor. Não são aplicados valores padrão.</p><form id="threshold-form" class="form-grid"><div class="field"><label for="temp-min">Temperatura mínima (°C)</label><input id="temp-min" type="number" step="0.1" value="${esc(t.tempMin ?? '')}" placeholder="Desativado"></div><div class="field"><label for="temp-max">Temperatura máxima (°C)</label><input id="temp-max" type="number" step="0.1" value="${esc(t.tempMax ?? '')}" placeholder="Desativado"></div><div class="field"><label for="hum-min">Humidade mínima (%)</label><input id="hum-min" type="number" step="0.1" value="${esc(t.humidityMin ?? '')}" placeholder="Desativado"></div><div class="field"><label for="hum-max">Humidade máxima (%)</label><input id="hum-max" type="number" step="0.1" value="${esc(t.humidityMax ?? '')}" placeholder="Desativado"></div><div class="field"><label for="weight-min">Peso mínimo (kg)</label><input id="weight-min" type="number" step="0.1" value="${esc(t.weightMin ?? '')}" placeholder="Desativado"></div><div class="field form-actions" style="align-self:end"><button class="button primary" type="submit">Guardar limites</button></div></form></section>
      <section class="card settings-card"><h2>Estado do sistema</h2><p>Estado observado por esta aplicação.</p><div class="system-list"><div class="system-item"><span>Sensores</span><strong>${sensorState === 'connected' ? 'A receber dados' : sensorState === 'error' ? 'Sem resposta' : 'Não ligados'}</strong></div><div class="system-item"><span>ESP32-CAM</span><strong>${cameraState === 'connected' ? 'Stream disponível' : s.cameraUrl ? 'URL configurado; ligação pendente' : 'Não configurada'}</strong></div><div class="system-item"><span>Base de dados online</span><strong>Não configurada</strong></div><div class="system-item"><span>Armazenamento atual</span><strong>Neste navegador</strong></div><div class="system-item"><span>Compatibilidade</span><strong>HTML · CSS · JavaScript · GitHub Pages</strong></div></div><p class="help-text" style="margin-top:12px">O GitHub Pages publica ficheiros estáticos. Para sincronizar entre dispositivos será necessário ligar uma API/base de dados externa.</p></section>
      <section class="card settings-card"><h2>Dados e cópias de segurança</h2><p>Exporta ou importa os registos guardados neste navegador.</p><div style="display:flex;flex-wrap:wrap;gap:9px"><button class="button" data-action="export">${icon('export')} Exportar dados</button><label class="button" for="import-file">Importar cópia<input id="import-file" type="file" accept="application/json" hidden></label><button class="button danger" data-action="clear-local">Apagar dados locais</button></div></section>
      <section class="card settings-card"><h2>Sobre a MAIA</h2><p>Plataforma Inteligente de Gestão e Monitorização de Apiários.</p><div class="system-list"><div class="system-item"><span>Projeto</span><strong>Apicultura e tecnologia</strong></div><div class="system-item"><span>Versão</span><strong>Protótipo funcional · 1.0</strong></div><div class="system-item"><span>PWA</span><strong>Preparada para evolução futura</strong></div><div class="system-item"><span>Autenticação por email</span><strong>${firebaseAuth ? 'Ativa (Firebase Auth)' : 'Por configurar'}</strong></div></div></section></div>`;
  }

  function renderPage() {
    switch (view) {
      case 'dashboard': return dashboardPage();
      case 'hives': return renderHives();
      case 'hive-detail': return renderHiveDetail();
      case 'monitoring': return renderMonitoring();
      case 'activities': return renderActivities();
      case 'camera': return renderCamera();
      case 'settings': return renderSettings();
      default: return renderHome();
    }
  }
  function render() {
    renderTopbar();
    const app = document.querySelector('#app');
    if (!['home', 'auth'].includes(view) && !currentUser) view = 'auth';
    app.innerHTML = view === 'home' ? renderHome() : view === 'auth' ? renderAuthPage() : panelShell(renderPage());
    bindPageEvents();
    bindCameraStream();
    setTheme(data.settings.theme);
  }

  function openModal(title, subtitle, body) {
    const root = document.querySelector('#modal-root');
    root.innerHTML = `<div class="modal-backdrop" data-action="close-modal"><section class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><header class="modal-head"><div><h2>${esc(title)}</h2><p>${esc(subtitle)}</p></div><button class="modal-x" data-action="close-modal" aria-label="Fechar">×</button></header><div class="modal-body">${body}</div></section></div>`;
  }
  function closeModal() { document.querySelector('#modal-root').innerHTML = ''; }
  function hiveForm(existing = null) {
    const h = existing || {};
    openModal(existing ? 'Editar colmeia' : 'Adicionar colmeia', 'Guarda os dados de identificação e localização.', `<form id="hive-form" class="form-grid"><input type="hidden" id="hive-original" value="${esc(h.identifier || '')}"><div class="field"><label for="hive-identifier">Identificação individual *</label><input id="hive-identifier" maxlength="30" required value="${esc(h.identifier || '')}" placeholder="Ex.: COL-01"></div><div class="field"><label for="hive-name">Nome ou tipo *</label><input id="hive-name" maxlength="70" required value="${esc(h.name || '')}" placeholder="Ex.: Lusitana"></div><div class="field"><label for="hive-location">Localização</label><input id="hive-location" maxlength="120" value="${esc(h.location || '')}" placeholder="Apiário ou coordenadas"></div><div class="field"><label for="hive-install">Data de instalação</label><input id="hive-install" type="date" value="${esc(h.installDate || '')}"></div><div class="field full"><label for="hive-notes">Notas</label><textarea id="hive-notes" maxlength="500" placeholder="Observações sobre a colmeia">${esc(h.notes || '')}</textarea></div><div class="field full form-actions"><button class="button" type="button" data-action="close-modal">Cancelar</button><button class="button primary" type="submit">${existing ? 'Guardar alterações' : 'Adicionar colmeia'}</button></div></form>`);
    document.querySelector('#hive-form').addEventListener('submit', event => {
      event.preventDefault();
      const original = document.querySelector('#hive-original').value;
      const identifier = document.querySelector('#hive-identifier').value.trim().toUpperCase();
      if (data.hives.some(item => item.identifier.toUpperCase() === identifier && item.identifier !== original)) { notify('Já existe uma colmeia com essa identificação.'); return; }
      const values = { identifier, name: document.querySelector('#hive-name').value.trim(), location: document.querySelector('#hive-location').value.trim(), installDate: document.querySelector('#hive-install').value, notes: document.querySelector('#hive-notes').value.trim() };
      if (existing) Object.assign(existing, values); else data.hives.push({ id: uid(), ...values, createdAt: new Date().toISOString() });
      persist(); closeModal(); render(); notify(existing ? 'Colmeia atualizada.' : 'Colmeia adicionada.');
    });
  }

  function parseSensorItem(raw) {
    const first = Array.isArray(raw.dht11) ? raw.dht11[0] : raw.dht11_1;
    const second = Array.isArray(raw.dht11) ? raw.dht11[1] : raw.dht11_2;
    const dht22 = raw.dht22 || {};
    const record = {
      id: uid(), hiveId: String(raw.hiveId || raw.hive || '').trim(), measuredAt: raw.measuredAt || raw.timestamp || raw.createdAt || new Date().toISOString(),
      dht11_1: { temperature: finiteOrNull(first?.temperature), humidity: finiteOrNull(first?.humidity) },
      dht11_2: { temperature: finiteOrNull(second?.temperature), humidity: finiteOrNull(second?.humidity) },
      dht22: { temperature: finiteOrNull(dht22.temperature), humidity: finiteOrNull(dht22.humidity) },
      weightKg: finiteOrNull(raw.weightKg ?? raw.weight)
    };
    const hasReading = [record.dht11_1.temperature, record.dht11_1.humidity, record.dht11_2.temperature, record.dht11_2.humidity, record.dht22.temperature, record.dht22.humidity, record.weightKg].some(v => v != null);
    return record.hiveId && hasReading ? record : null;
  }
  function finiteOrNull(value) { return value === null || value === undefined || value === '' || !Number.isFinite(Number(value)) ? null : Number(value); }
  async function syncMeasurements(silent = false) {
    const url = data.settings.sensorUrl;
    if (!url) { sensorState = 'unconfigured'; return; }
    const wasConnected = sensorState === 'connected';
    sensorState = 'connecting';
    try {
      const response = await fetch(url, { cache: 'no-store', headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`A API respondeu com o estado ${response.status}.`);
      const payload = await response.json();
      const incoming = Array.isArray(payload.measurements) ? payload.measurements : (payload.hiveId || payload.hive ? [payload] : []);
      if (!incoming.length) throw new Error('A resposta não contém uma lista "measurements".');
      let added = 0, changed = false;
      for (const raw of incoming) {
        const item = parseSensorItem(raw);
        if (!item) continue;
        const key = `${item.hiveId}|${item.measuredAt}`;
        const previousIndex = data.measurements.findIndex(m => `${m.hiveId}|${m.measuredAt}` === key);
        if (previousIndex >= 0) {
          const previous = data.measurements[previousIndex];
          const replacement = { ...item, id: previous.id };
          if (JSON.stringify(previous) !== JSON.stringify(replacement)) changed = true;
          data.measurements[previousIndex] = replacement;
        } else { data.measurements.push(item); added++; changed = true; }
      }
      data.measurements = data.measurements.sort((a,b) => new Date(a.measuredAt) - new Date(b.measuredAt)).slice(-4000);
      persist(); sensorState = 'connected';
      if (!silent) notify(added ? `${added} medição${added === 1 ? '' : 'ões'} recebida${added === 1 ? '' : 's'}.` : 'Dados sincronizados; sem novas medições.');
      const editing = document.activeElement?.matches('input,select,textarea');
      if ((changed || !wasConnected) && ['dashboard', 'monitoring', 'hive-detail'].includes(view) && !editing) render();
      else if (!wasConnected && view === 'settings' && !editing) render();
    } catch (error) {
      sensorState = 'error';
      if (!silent) notify(`Não foi possível ligar aos sensores: ${error.message}`);
      if (['dashboard', 'monitoring', 'hive-detail', 'settings'].includes(view) && !document.activeElement?.matches('input,select,textarea')) render();
    }
  }
  function startPolling() {
    clearInterval(pollTimer);
    if (!currentUser) { pollTimer = null; sensorState = 'unconfigured'; return; }
    if (data.settings.sensorUrl) {
      syncMeasurements(true);
      pollTimer = setInterval(() => syncMeasurements(true), Math.max(10, Number(data.settings.pollSeconds) || 30) * 1000);
    } else { sensorState = 'unconfigured'; }
  }
  function bindCameraStream() {
    const img = document.querySelector('#camera-stream');
    if (!img) return;
    const status = document.querySelector('#camera-status-text');
    if (!data.settings.cameraUrl) { cameraState = 'unconfigured'; return; }
    img.onload = () => { cameraState = 'connected'; document.querySelector('#camera-empty')?.setAttribute('hidden', ''); if (status) status.textContent = 'Stream da ESP32-CAM disponível.'; };
    img.onerror = () => { cameraState = 'error'; document.querySelector('#camera-empty')?.removeAttribute('hidden'); if (status) status.textContent = 'Sem resposta do stream. Confirma o URL, o firmware e a rede.'; };
  }

  async function compressImage(file) {
    if (!file.type.startsWith('image/')) throw new Error('Escolhe um ficheiro de imagem.');
    if (file.size > 15 * 1024 * 1024) throw new Error('A imagem tem de ter menos de 15 MB.');
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas'); canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close?.();
    return canvas.toDataURL('image/jpeg', .68);
  }

  function bindPageEvents() {
    document.querySelectorAll('[data-view]').forEach(el => el.addEventListener('click', event => {
      event.preventDefault();
      const targetView = el.dataset.view;
      if (!['home', 'auth'].includes(targetView) && !currentUser) {
        view = 'auth'; authMode = 'signin'; authMessage = ''; authMessageKind = 'info'; render(); return;
      }
      if (targetView === 'auth') { view = 'auth'; authMode = 'signin'; authMessage = ''; authMessageKind = 'info'; render(); return; }
      if (targetView === 'hive-detail') { selectedHive = el.dataset.id; view = 'hive-detail'; }
      else { view = targetView; if (view === 'hives') selectedHive = null; }
      render(); window.scrollTo({ top: 0, behavior: 'smooth' });
    }));
    document.querySelector('#auth-form')?.addEventListener('submit', async event => {
      event.preventDefault();
      if (!firebaseAuth || authBusy) return;
      const email = document.querySelector('#auth-email').value.trim();
      const password = document.querySelector('#auth-password').value;
      const creating = authMode === 'signup';
      if (creating && password !== document.querySelector('#auth-password-confirm').value) {
        authMessage = 'As palavras-passe não coincidem.'; authMessageKind = 'error'; render(); return;
      }
      authBusy = true; authMessage = ''; authMessageKind = 'info'; render();
      try {
        if (creating) {
          const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
          await sendEmailVerification(credential.user, { url: `${window.location.origin}${window.location.pathname}` });
          await signOut(firebaseAuth);
          authMessage = 'Conta criada. Confirma o email que te enviámos e depois inicia sessão.';
          authMessageKind = 'success';
        } else {
          const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
          if (!credential.user.emailVerified) {
            await sendEmailVerification(credential.user, { url: `${window.location.origin}${window.location.pathname}` });
            await signOut(firebaseAuth);
            authMessage = 'Confirma o teu email antes de entrar. Enviámos outra mensagem de confirmação.';
            authMessageKind = 'success';
          } else {
            currentUser = { id: credential.user.uid, email: credential.user.email };
            loadUserData(currentUser.id); view = 'dashboard'; startPolling();
          }
        }
      } catch (error) {
        const code = String(error?.code || '');
        authMessage = code === 'auth/email-already-in-use' ? 'Este email já tem conta. Inicia sessão.'
          : code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password' ? 'Email ou palavra-passe incorretos.'
          : code === 'auth/weak-password' ? 'Escolhe uma palavra-passe mais forte, com pelo menos 8 caracteres.'
          : code === 'auth/invalid-email' ? 'Escreve um endereço de email válido.'
          : code === 'auth/network-request-failed' ? 'Sem ligação ao serviço. Verifica a Internet e tenta novamente.'
          : 'Não foi possível concluir o pedido. Confirma os dados e tenta novamente.';
        authMessageKind = 'error';
      } finally {
        authBusy = false;
        if (view === 'auth') render();
      }
    });
    document.querySelectorAll('[data-action]').forEach(el => el.addEventListener('click', async event => {
      event.preventDefault();
      const action = el.dataset.action, id = el.dataset.id;
      if (action === 'menu') document.querySelector('#top-nav')?.classList.toggle('open');
      if (action === 'open-auth') {
        if (currentUser) view = 'dashboard';
        else { view = 'auth'; authMode = 'signin'; authMessage = ''; authMessageKind = 'info'; }
        render(); window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      if (action === 'toggle-auth') { authMode = authMode === 'signup' ? 'signin' : 'signup'; authMessage = ''; authMessageKind = 'info'; render(); }
      if (action === 'sign-out' && firebaseAuth) {
        try { await signOut(firebaseAuth); }
        catch { notify('Não foi possível terminar a sessão. Tenta novamente.'); }
      }
      if (action === 'reset-password' && firebaseAuth) {
        const email = document.querySelector('#auth-email')?.value.trim();
        if (!email) { authMessage = 'Escreve primeiro o teu email.'; authMessageKind = 'error'; render(); return; }
        try {
          await sendPasswordResetEmail(firebaseAuth, email, { url: `${window.location.origin}${window.location.pathname}` });
          authMessage = 'Se existir uma conta para esse email, receberás uma mensagem para mudar a palavra-passe.'; authMessageKind = 'success'; render();
        } catch { authMessage = 'Não foi possível enviar a mensagem. Confirma o email e tenta novamente.'; authMessageKind = 'error'; render(); }
      }
      if (action === 'theme-toggle') { setTheme(data.settings.theme === 'light' ? 'dark' : 'light'); render(); }
      if (action === 'add-hive') hiveForm();
      if (action === 'hive-detail') { selectedHive = id; view = 'hive-detail'; render(); }
      if (action === 'edit-hive') hiveForm(hiveFor(id));
      if (action === 'delete-hive' && confirm(`Eliminar a colmeia ${id}? Os registos associados não serão apagados.`)) { data.hives = data.hives.filter(h => h.identifier !== id); persist(); view = 'hives'; render(); notify('Colmeia eliminada.'); }
      if (action === 'close-modal') closeModal();
      if (action === 'sync') await syncMeasurements(false);
      if (action === 'toggle-task') { const task = data.tasks.find(t => t.id === id); if (task) task.done = !task.done; persist(); render(); }
      if (action === 'delete-task' && confirm('Eliminar esta tarefa?')) { data.tasks = data.tasks.filter(t => t.id !== id); persist(); render(); notify('Tarefa eliminada.'); }
      if (action === 'delete-visit' && confirm('Eliminar este registo de visita?')) { data.visits = data.visits.filter(v => v.id !== id); persist(); render(); notify('Visita eliminada.'); }
      if (action === 'delete-photo' && confirm('Eliminar esta fotografia guardada?')) { data.photos = data.photos.filter(p => p.id !== id); persist(); render(); notify('Fotografia eliminada.'); }
      if (action === 'export') exportData();
      if (action === 'clear-local' && confirm('Apagar os dados deste apiário guardados neste navegador?')) { Object.values(KEYS).forEach(k => localStorage.removeItem(userStorageKey(k))); location.reload(); }
    }));

    document.querySelector('#monitor-hive')?.addEventListener('change', event => { selectedHive = event.target.value || null; render(); });
    document.querySelector('#visit-form')?.addEventListener('submit', event => {
      event.preventDefault(); data.visits.push({ id: uid(), hiveId: document.querySelector('#visit-hive').value, date: document.querySelector('#visit-date').value, type: document.querySelector('#visit-type').value, notes: document.querySelector('#visit-notes').value.trim() });
      persist(); render(); notify('Visita guardada.');
    });
    document.querySelector('#task-form')?.addEventListener('submit', event => {
      event.preventDefault(); data.tasks.push({ id: uid(), hiveId: document.querySelector('#task-hive').value, title: document.querySelector('#task-title').value.trim(), dueDate: document.querySelector('#task-date').value, notes: document.querySelector('#task-notes').value.trim(), done: false, createdAt: new Date().toISOString() });
      persist(); render(); notify('Tarefa adicionada.');
    });
    document.querySelector('#sensor-settings-form')?.addEventListener('submit', event => {
      event.preventDefault(); data.settings.sensorUrl = document.querySelector('#sensor-url').value.trim(); data.settings.pollSeconds = Math.max(10, Math.min(3600, Number(document.querySelector('#poll-seconds').value) || 30)); persist(); startPolling(); render(); notify('Fonte de medições guardada.');
    });
    document.querySelector('#camera-settings-form')?.addEventListener('submit', event => {
      event.preventDefault(); data.settings.cameraUrl = document.querySelector('#camera-url').value.trim(); persist(); cameraState = data.settings.cameraUrl ? 'connecting' : 'unconfigured'; render(); notify('Endereço da câmara guardado.');
    });
    document.querySelector('#threshold-form')?.addEventListener('submit', event => {
      event.preventDefault(); const get = id => document.querySelector(id).value;
      data.settings.thresholds = { tempMin: get('#temp-min'), tempMax: get('#temp-max'), humidityMin: get('#hum-min'), humidityMax: get('#hum-max'), weightMin: get('#weight-min') };
      persist(); render(); notify('Limites de alerta guardados.');
    });
    document.querySelectorAll('input[name="theme"]').forEach(input => input.addEventListener('change', () => { setTheme(input.value); notify(`Tema ${input.value === 'dark' ? 'escuro' : 'claro'} aplicado.`); }));
    document.querySelector('#photo-form')?.addEventListener('submit', async event => {
      event.preventDefault(); const file = document.querySelector('#photo-file').files[0]; if (!file) return;
      try {
        const dataUrl = await compressImage(file);
        if (data.photos.length >= 12) throw new Error('O limite local é de 12 fotografias. Exporta os dados ou elimina imagens antigas.');
        data.photos.push({ id: uid(), hiveId: document.querySelector('#photo-hive').value, createdAt: document.querySelector('#photo-date').value || today(), note: document.querySelector('#photo-note').value.trim(), dataUrl });
        persist(); render(); notify('Fotografia guardada neste navegador.');
      } catch (error) { notify(error.message || 'Não foi possível guardar a imagem.'); }
    });
    document.querySelector('#import-file')?.addEventListener('change', async event => {
      const file = event.target.files[0]; if (!file) return;
      try {
        const imported = JSON.parse(await file.text());
        if (!Array.isArray(imported.hives) || !Array.isArray(imported.tasks) || !Array.isArray(imported.measurements)) throw new Error('A cópia não tem o formato esperado.');
        if (!confirm('Importar esta cópia e substituir os dados atuais?')) return;
        data.hives = imported.hives; data.tasks = imported.tasks; data.visits = imported.visits || []; data.measurements = imported.measurements; data.photos = imported.photos || []; data.settings = { ...data.settings, ...(imported.settings || {}) };
        persist(); setTheme(data.settings.theme); render(); startPolling(); notify('Cópia importada.');
      } catch (error) { notify(error.message || 'Não foi possível importar a cópia.'); }
      event.target.value = '';
    });
  }

  function exportData() {
    const payload = { version: 1, exportedAt: new Date().toISOString(), hives: data.hives, visits: data.visits, tasks: data.tasks, measurements: data.measurements, photos: data.photos, settings: data.settings };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = `maia-copia-${today()}.json`; a.click(); URL.revokeObjectURL(url); notify('Cópia de segurança exportada.');
  }

  function initAuth() {
    if (!firebaseAuth) return;
    onAuthStateChanged(firebaseAuth, user => {
      if (user && !user.emailVerified) return;
      if (!user) {
        if (currentUser) {
          currentUser = null; clearInterval(pollTimer); pollTimer = null; resetData(); view = 'home'; render();
        }
        return;
      }
      if (user.uid !== currentUser?.id) {
        currentUser = { id: user.uid, email: user.email };
        loadUserData(currentUser.id);
        if (view === 'auth') view = 'dashboard';
        startPolling(); render();
      }
    });
  }

  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeModal(); });
  document.documentElement.dataset.theme = data.settings.theme;
  render();
  initAuth();
})();
