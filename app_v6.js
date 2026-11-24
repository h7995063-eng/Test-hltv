// === Supabase (данные от заказчика) ===
const SUPABASE_URL = "https://vamehxkvplkxbhcoooeq.supabase.co";
const SUPABASE_KEY = "sb_publishable_BIxdsghEstTjAbmU1nDwhg_Qb5tvXAc";
const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

if (!localStorage.getItem("hltv_data")) {
  localStorage.setItem("hltv_data", JSON.stringify(DATA));
}
let APP_DATA = JSON.parse(localStorage.getItem("hltv_data"));

// ===== API LOAD =====
const API_BASE = "https://ends-monitors-teens-yeah.trycloudflare.com";
const API_URL = API_BASE;
async function loadFromAPI() {
  try {
    const [teams, tournaments, matches] = await Promise.all([
      fetch(API_BASE + "/api/teams").then(r => r.json()),
      fetch(API_BASE + "/api/tournaments").then(r => r.json()),
      fetch(API_BASE + "/api/matches").then(r => r.json())
    ]);
    if (Array.isArray(teams) && teams.length) {
      APP_DATA.teams = teams.map(t => {
        const old = (APP_DATA.teams || []).find(x => x.name === t.name) || {};
        return { id: old.id || t.name, name: t.name, points: t.points, wins: t.wins, losses: t.losses,
                 players: (t.players && t.players.length) ? t.players : (old.players || []) };
      });
    }
    if (Array.isArray(tournaments)) APP_DATA.tournaments = tournaments;
    if (Array.isArray(matches)) APP_DATA.matches = matches.map(function(m, i) {
      return {
        id: m.id || (i + 1),
        map: m.map || "de_mirage",
        tournament: m.tournament || "",
        team1: { name: m.team1, score: m.score1, players: (m.stats && m.stats.t1) || [] },
        team2: { name: m.team2, score: m.score2, players: (m.stats && m.stats.t2) || [] }
      };
    });
    console.log("[API] loaded:", teams.length, "teams,", tournaments.length, "tournaments,", matches.length, "matches");
    if (typeof renderRanking === "function") renderRanking();
    if (typeof renderTournaments === "function") renderTournaments();
    if (typeof renderMatchesList === "function") renderMatchesList();
  } catch (e) {
    console.warn("[API] fallback to local DATA:", e);
  }
}
loadFromAPI();
// ===== /API LOAD =====

let teamRequests = JSON.parse(localStorage.getItem("hltv_team_requests")) || [];
let newsRequests = JSON.parse(localStorage.getItem("hltv_news_requests")) || [];

function saveData() { localStorage.setItem("hltv_data", JSON.stringify(APP_DATA)); }
function saveRequests() { 
  localStorage.setItem("hltv_team_requests", JSON.stringify(teamRequests)); 
  localStorage.setItem("hltv_news_requests", JSON.stringify(newsRequests));
}

window.onload = function() {
  setTimeout(function() {
    document.getElementById("splash-screen").style.opacity = "0";
    setTimeout(function() {
      document.getElementById("splash-screen").style.display = "none";
      document.getElementById("app-container").style.display = "flex";
      switchTab('ranking');
    }, 500);
  }, 1500);
};

function toggleMenu() {
  var sidebar = document.getElementById("sidebar");
  var overlay = document.getElementById("overlay");
  if (sidebar) {
    sidebar.classList.toggle("open");
    console.log("[menu] sidebar classes:", sidebar.className, "id:", sidebar.id, "tag:", sidebar.tagName);
  } else {
    console.warn("[menu] #sidebar not found");
  }
  if (overlay) overlay.classList.toggle("open");
}

function switchTab(tab) {
  document.querySelectorAll(".nav-item").forEach(function(el) { el.classList.remove("active"); });
  var navEl = document.getElementById("nav-" + tab);
  if (navEl) navEl.classList.add("active");
  
  var screens = ["ranking", "team-detail", "register-team", "matches-list", "match-detail", "news", "admin-login", "admin-panel", "tournaments"];
  screens.forEach(function(s) { document.getElementById("screen-" + s).classList.add("hidden"); });

  if (tab === "ranking") {
    document.getElementById("screen-ranking").classList.remove("hidden");
    renderRanking();
  } else if (tab === "matches") {
    document.getElementById("screen-matches-list").classList.remove("hidden");
    renderMatchesList();
  } else if (tab === "news") {
    document.getElementById("screen-news").classList.remove("hidden");
    renderNewsForm();
  } else if (tab === "register-team") {
    document.getElementById("screen-register-team").classList.remove("hidden");
    renderRegisterTeamForm();
  } else if (tab === "match-detail") {
    document.getElementById("screen-match-detail").classList.remove("hidden");
  } else if (tab === "team-detail") {
    document.getElementById("screen-team-detail").classList.remove("hidden");
  } else if (tab === "tournaments") {
    document.getElementById("screen-tournaments").classList.remove("hidden");
    renderTournaments();
  } else if (tab === "admin") {
    if (localStorage.getItem("isAdmin") === "true") {
      document.getElementById("screen-admin-panel").classList.remove("hidden");
      showAdminTab('teams');
    } else {
      document.getElementById("screen-admin-login").classList.remove("hidden");
    }
  }
  if (window.innerWidth <= 768) toggleMenu();
}

function renderRanking() {
  var container = document.getElementById("ranking-container");
  var html = "";
  APP_DATA.teams.sort(function(a,b){return b.points-a.points;}).forEach(function(t,i){
    var teamAvatar = t.avatar ? '<img src="' + t.avatar + '" class="avatar">' : '<div class="avatar">' + t.name.charAt(0) + '</div>';
    html += '<div class="card animate-in delay-' + Math.min(i+1, 5) + '" onclick="showTeamDetail(\'' + t.name + '\')">' +
        '<div class="card-num">' + (i+1) + '</div>' + teamAvatar +
        '<div class="info"><div class="name" style="display:flex; align-items:center;">' + t.name + (t.verified ? '<svg width="14" height="14" viewBox="0 0 24 24" style="vertical-align: text-bottom; margin-left: 6px; margin-bottom: 2px;" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#3b82f6"/><path d="M7 12.5L10.5 16L17 9" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>' : '') + '</div>' +
        '<div class="sub">' + (t.wins + t.losses) + ' матчей</div></div>' +
        '<div class="points">' + t.points + ' PTS</div></div>';
  });
  container.innerHTML = html || '<p style="color:var(--muted); text-align:center; padding:20px;">Команд пока нет</p>';
}

function showTeamDetail(name) {
  var team = APP_DATA.teams.find(function(t){ return t.name === name; });
  if (!team) return;
  document.getElementById("screen-ranking").classList.add("hidden");
  document.getElementById("screen-team-detail").classList.remove("hidden");
  var teamAvatar = team.avatar ? '<img src="' + team.avatar + '" class="team-big-logo">' : '<div class="team-big-logo">' + team.name.charAt(0) + '</div>';
  
  var playersHtml = team.players.map(function(p) {
    var kd = (p.kills / (p.deaths || 1)).toFixed(2);
    var pAvatar = p.avatar ? '<img src="' + p.avatar + '" class="player-avatar">' : '<div class="player-avatar">' + p.nick.charAt(0) + '</div>';
    return '<tr><td><div class="player-cell">' + pAvatar + '<div><span class="player-nick" style="display:flex; align-items:center;">' + p.nick + (p.verified ? '<svg width="14" height="14" viewBox="0 0 24 24" style="vertical-align: text-bottom; margin-left: 6px; margin-bottom: 2px;" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#3b82f6"/><path d="M7 12.5L10.5 16L17 9" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>' : '') + '</span>' + (p.role ? '<span class="role-badge">' + p.role + '</span>' : '') + '</div></div></td>' +
           '<td>' + p.kills + '</td><td>' + p.deaths + '</td><td style="color:var(--accent)">' + kd + '</td><td>' + p.hs + '%</td><td>' + p.rating.toFixed(2) + '</td></tr>';
  }).join('');

  document.getElementById("team-detail-content").innerHTML = 
    '<div class="team-header animate-in">' + teamAvatar + '<div class="team-title-info"><h2>' + team.name + ' </h2><p>Рейтинг команды</p></div></div>' +
    '<div class="team-stats-row animate-in delay-1">' +
      '<div class="team-stat-box"><div class="val" style="color:var(--accent)">' + team.points + '</div><div class="lbl">Поинты</div></div>' +
      '<div class="team-stat-box"><div class="val" style="color:var(--win)">' + team.wins + '</div><div class="lbl">Победы</div></div>' +
      '<div class="team-stat-box"><div class="val" style="color:var(--lose)">' + team.losses + '</div><div class="lbl">Поражения</div></div>' +
    '</div>' +
    '<div class="table-wrapper animate-in delay-2"><table>' +
      '<thead><tr><th>Игрок</th><th>Убийства</th><th>Смерти</th><th>К/Д</th><th>HS%</th><th>AVG</th></tr></thead>' +
      '<tbody>' + playersHtml + '</tbody></table></div>';
}

function renderRegisterTeamForm() {
  var container = document.getElementById("register-team-content");
  var ROLES = ["AWP", "IGL", "Riffler", "Entry", "Support", "Lurker"];
  var playersHtml = '';
  for (var i = 1; i <= 5; i++) {
    playersHtml += '<div class="player-row-admin"><div class="num">' + i + '.</div><div style="flex:1; display:flex; gap:10px;">' +
      '<div style="flex:2;"><input type="text" id="rt-nick-' + i + '" class="form-control" placeholder="Ник" style="padding:10px;"></div>' +
      '<div style="flex:1;"><select id="rt-role-' + i + '" class="form-control" style="padding:10px;">' + ROLES.map(function(r){return '<option value="'+r+'">'+r+'</option>';}).join('') + '</select></div>' +
      '</div></div>';
  }

  container.innerHTML = '<div class="form-group"><label>Название команды</label><input type="text" id="rt-name" class="form-control" placeholder="Team Spirit"></div>' +
    '<div class="form-group"><label>Тег (до 6 букв)</label><input type="text" id="rt-tag" class="form-control" maxlength="6" placeholder="TS"></div>' +
    '<div class="form-group"><label>Логотип</label><div class="file-upload-wrapper" onclick="document.getElementById(\'rt-logo\').click()"><img id="rt-logo-preview" class="file-upload-preview"><div class="file-upload-label">Загрузить</div><input type="file" id="rt-logo" accept="image/*" onchange="previewImage(this, \'rt-logo-preview\')"></div></div>' +
    '<div class="form-group"><label>Состав</label>' + playersHtml + '</div>' +
    '<div class="form-group"><label>Ваш Telegram (@username)</label><input type="text" id="rt-contact" class="form-control" placeholder="@username"></div>' +
    '<button class="btn" onclick="submitTeamRequest()">Отправить заявку</button>';
}

function submitTeamRequest() {
  var name = document.getElementById("rt-name").value;
  var tag = document.getElementById("rt-tag").value;
  var logo = document.getElementById("rt-logo-preview").src;
  var contact = document.getElementById("rt-contact").value;

  if (!name || !tag || !contact) return toastAuto("Заполните все поля!");
  var players = [];
  for (var i = 1; i <= 5; i++) {
    var nick = document.getElementById("rt-nick-" + i).value;
    if (!nick) return toastAuto("Введите ник игрока " + i);
    players.push({ nick: nick, role: document.getElementById("rt-role-" + i).value });
  }
  teamRequests.push({ name: name, tag: tag, logo: logo, contact: contact, players: players });
  saveRequests();
  toastAuto("Заявка отправлена на модерацию!");
  switchTab('ranking');
}

function renderNewsForm() {
  var container = document.getElementById("news-container");
  if (!container) {
      // Если контейнер не найден, пробуем найти по-другому (вдруг ID другой)
      container = document.getElementById("screen-news");
  }
  if (!container) return;
  
  var html = '<h1>Заявки</h1>';
  html += '<p style="color:#8b959e; margin-bottom:20px;">Выберите тип заявки для отправки в админ-панель.</p>';
  
  html += '<div style="display:flex; gap:15px; margin-bottom:25px;">';
  html += '  <button class="btn" style="flex:1; padding:15px; font-size:16px; background:#2b6cb0;" onclick="showNewsType(\'roster\')">Смена состава</button>';
  html += '  <button class="btn" style="flex:1; padding:15px; font-size:16px; background:#10b981;" onclick="showNewsType(\'match\')">Регистрация матча</button>';
  html += '</div>';
  html += '<div id="news-form-area"></div>';
  
  container.innerHTML = html;
}



function toast(msg) {
  var toast = document.createElement('div');
  toast.style.cssText = 'position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#10b981; color:#fff; padding:12px 24px; border-radius:8px; font-weight:bold; z-index:9999; box-shadow:0 4px 12px rgba(0,0,0,0.5);';
  toast.innerText = msg;
  document.body.appendChild(toast);
  setTimeout(function() { toast.remove(); }, 3000);
}





function showNewsType(type) {
  var area = document.getElementById("news-form-area");
  if (!area) return;

  var options = (APP_DATA.teams || []).map(function(t) {
    return '<option value="' + t.name + '">' + t.name + '</option>';
  }).join("");

  
  var formStyle = "background:#232b33; padding:20px; border-radius:12px; border:1px solid #2d3748; display:flex; flex-direction:column; gap:15px;";
  var inputStyle = "width:100%; padding:12px; background:#171a1f; border:1px solid #2d3748; color:#fff; border-radius:6px; box-sizing:border-box; font-family:inherit; font-size:14px;";
  var labelStyle = "color:#8b959e; font-size:12px; margin-bottom:5px; display:block;";
  
  if (type === 'roster') {
    area.innerHTML = `
      <div style="${formStyle}">
        <h3 style="margin:0 0 10px 0; color:#fff;">Смена состава</h3>
        
        <div>
          <label style="${labelStyle}">Название команды</label>
          <input type="text" id="roster-team" style="${inputStyle}">
        </div>
        
        <div>
          <label style="${labelStyle}">Какие изменения? (кто ушел, кто пришел)</label>
          <textarea id="roster-changes" style="${inputStyle} height:100px; resize:vertical;"></textarea>
        </div>
        
        <div>
          <label style="${labelStyle}">Фото (необязательно)</label>
          <input type="file" id="roster-photo" accept="image/*" style="${inputStyle} padding:8px;">
        </div>
        
        <button class="btn" style="background:#10b981; margin-top:10px;" onclick="submitRosterChange()">Отправить</button>
      </div>
    `;
  } else if (type === 'match') {
    area.innerHTML = `
      <div style="${formStyle}">
        <h3 style="margin:0 0 5px 0; color:#fff;">Регистрация матча</h3>
        
        
        <div>
          <label style="${labelStyle}">Скриншот (обязательно)</label>
          <input type="file" id="match-photo" accept="image/*" style="${inputStyle} padding:8px;">
        </div>
        
        <div style="display:flex; gap:15px; flex-wrap:wrap;">
          <div style="flex:1; min-width:200px; background:#171a1f; padding:15px; border-radius:8px;">
            <h4 style="margin:0 0 10px 0; color:#fff;">Команда 1</h4>
            <div style="margin-bottom:10px;">
              <label style="${labelStyle}">Название</label>
              <select id="m1-name" style="${inputStyle}"><option value="">— выбери команду —</option>${options}</select>
            </div>
            <div style="margin-bottom:10px;">
              <label style="${labelStyle}">Ники игроков</label>
              <input type="text" id="m1-players" placeholder="через запятую" style="${inputStyle}">
            </div>
            <div>
              <label style="${labelStyle}">Результат</label>
              <select id="m1-result" style="${inputStyle}">
                <option value="win">Победа</option>
                <option value="lose">Поражение</option>
              </select>
            </div>
          </div>
          
          <div style="flex:1; min-width:200px; background:#171a1f; padding:15px; border-radius:8px;">
            <h4 style="margin:0 0 10px 0; color:#fff;">Команда 2</h4>
            <div style="margin-bottom:10px;">
              <label style="${labelStyle}">Название</label>
              <select id="m2-name" style="${inputStyle}"><option value="">— выбери команду —</option>${options}</select>
            </div>
            <div style="margin-bottom:10px;">
              <label style="${labelStyle}">Ники игроков</label>
              <input type="text" id="m2-players" placeholder="через запятую" style="${inputStyle}">
            </div>
            <div>
              <label style="${labelStyle}">Результат</label>
              <select id="m2-result" style="${inputStyle}">
                <option value="lose">Поражение</option>
                <option value="win">Победа</option>
              </select>
            </div>
          </div>
        </div>
        
        <div>
          <label style="${labelStyle}">Счет (например, 13:9)</label>
          <input type="text" id="match-score" style="${inputStyle}">
        </div>
        
        <button class="btn" style="background:#10b981; margin-top:10px;" onclick="submitMatchRegistration()">Отправить</button>
      </div>
    `;
  }
}

function toast(msg) {
  var toast = document.createElement('div');
  toast.style.cssText = 'position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#10b981; color:#fff; padding:12px 24px; border-radius:8px; font-weight:bold; z-index:9999; box-shadow:0 4px 12px rgba(0,0,0,0.5);';
  toast.innerText = msg;
  document.body.appendChild(toast);
  setTimeout(function() { toast.remove(); }, 3000);
}

function submitRosterChange() {
  var team = document.getElementById("roster-team").value;
  var changes = document.getElementById("roster-changes").value;
  var fileInput = document.getElementById("roster-photo");
  if (!team || !changes) { toast("Заполните все поля!", "error"); return; }
  var save = function(photoData) {
    fetch(API_BASE + "/api/requests", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ type: "roster", data: { team: team, changes: changes }, photo: photoData })
    }).then(function(r){ return r.json(); }).then(function(res){
      if (res.ok) { toast("Заявка отправлена", "success"); showNewsType('roster'); }
      else toast("Ошибка", "error");
    }).catch(function(e){ toast("Ошибка сети: " + e, "error"); });
  };
  if (fileInput.files.length > 0) {
    var reader = new FileReader();
    reader.onload = function(e) { save(e.target.result); };
    reader.readAsDataURL(fileInput.files[0]);
  } else save("");
}

function submitMatchRegistration() {
  var fileInput = document.getElementById("match-photo");
  if (!fileInput || fileInput.files.length === 0) { toast("Прикрепите скриншот!", "error"); return; }
  var m1 = { name: document.getElementById("m1-name").value, players: document.getElementById("m1-players").value, result: document.getElementById("m1-result").value };
  var m2 = { name: document.getElementById("m2-name").value, players: document.getElementById("m2-players").value, result: document.getElementById("m2-result").value };
  var score = document.getElementById("match-score").value;
  var reader = new FileReader();
  reader.onload = function(e) {
    fetch(API_BASE + "/api/requests", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ type: "match", data: { m1: m1, m2: m2, score: score }, photo: e.target.result })
    }).then(function(r){ return r.json(); }).then(function(res){
      if (res.ok) {
        toast("Заявка отправлена", "success");
        showNewsType('match');
      } else toast("Ошибка: " + (res.error || "unknown"), "error");
    }).catch(function(e){ toast("Ошибка сети: " + e, "error"); });
  };
  reader.readAsDataURL(fileInput.files[0]);
}

function submitNewsRequest() {
  var team = document.getElementById("n-team").value;
  var text = document.getElementById("n-text").value;
  var photo = document.getElementById("n-photo-preview").src;

  if (!team || !text) return toastAuto("Заполните команду и текст!");
  newsRequests.push({ team: team, text: text, photo: photo });
  saveRequests();
  toastAuto("Новость отправлена админу!");
  switchTab('ranking');
}

function loginAdmin() {
  var pass = document.getElementById("admin-pass").value;
  if (pass === "hltv26") {
    localStorage.setItem("isAdmin", "true");
    document.getElementById("screen-admin-login").classList.add("hidden");
    document.getElementById("screen-admin-panel").classList.remove("hidden");
    showAdminTab('teams');
  } else {
    document.getElementById("admin-err").innerText = "Неверный пароль";
  }
}

function showAdminTab(tab) {
  var container = document.getElementById("admin-form-container");
  
  if (tab === 'tournaments') {
    renderAdminTournamentsForm();
    return;
  }
  
  if (tab === 'teams') {
    container.innerHTML = '<input type="text" class="search-input" placeholder="Поиск команды..." oninput="searchAdminTeams(this.value)"><button class="btn btn-outline" style="margin-bottom:20px;" onclick="addTeamAdminForm()">+ Добавить команду</button><div id="admin-teams-list"></div>';
    renderAdminTeamsList(APP_DATA.teams);
  } 
  else if (tab === 'requests') {
    renderAdminRequests();
    return;
    var html = '<h3 style="margin-bottom:16px;">Заявки на команды</h3>';
    if (teamRequests.length === 0) html += '<p style="color:var(--muted)">Нет новых заявок.</p>';
    teamRequests.forEach(function(req, index) {
      html += '<div style="background:rgba(0,0,0,0.2); padding:16px; border-radius:12px; margin-bottom:12px; border:1px solid var(--border);">' +
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;"><b>' + req.name + ' (' + req.tag + ')</b><span style="font-size:12px; color:var(--muted);">' + req.contact + '</span></div>' +
        '<div style="font-size:13px; margin-bottom:10px;">' + req.players.map(function(p){ return p.nick + ' (' + p.role + ')'; }).join(', ') + '</div>' +
        '<div style="display:flex; gap:10px;"><button class="btn btn-green" style="margin:0; padding:8px;" onclick="approveTeamRequest(' + index + ')">Одобрить</button><button class="btn btn-red" style="margin:0; padding:8px;" onclick="rejectTeamRequest(' + index + ')">Отклонить</button></div></div>';
    });
    html += '<h3 style="margin-top:30px; margin-bottom:16px;">Заявки на замены / Новости</h3>';
    if (newsRequests.length === 0) html += '<p style="color:var(--muted)">Нет новых новостей.</p>';
    newsRequests.forEach(function(req, index) {
      html += '<div style="background:rgba(0,0,0,0.2); padding:16px; border-radius:12px; margin-bottom:12px; border:1px solid var(--border);">' +
        '<b>' + req.team + '</b><p style="font-size:13px; margin:8px 0; white-space:pre-wrap;">' + req.text + '</p>' +
        (req.photo ? '<img src="' + req.photo + '" style="max-width:100%; border-radius:8px; margin-bottom:10px;">' : '') +
        '<div style="display:flex; gap:10px;"><button class="btn btn-green" style="margin:0; padding:8px;" onclick="approveNews(' + index + ')">В канал</button><button class="btn btn-red" style="margin:0; padding:8px;" onclick="rejectNews(' + index + ')">Отклонить</button></div></div>';
    });
    container.innerHTML = html;
  }
  else if (tab === 'tournaments') {
      renderAdminTournamentsForm();
      return;
    }
    if (tab === 'matches') {
    var options = APP_DATA.teams.map(function(t){ return '<option value="' + t.name + '">' + t.name + '</option>'; }).join('');
    container.innerHTML = '<h3 style="margin-bottom:16px;">Добавить матч</h3>' +
      '<div class="form-group"><label>Карта</label><input type="text" id="m-map" class="form-control" value="mirage"></div>' +
      '<div style="display:flex; gap:10px;"><div class="form-group" style="flex:1;"><label>Команда 1</label><select id="m-t1" class="form-control">' + options + '</select></div><div class="form-group" style="width:80px;"><label>Счет</label><input type="number" id="m-s1" class="form-control" value="0"></div></div>' +
      '<div style="display:flex; gap:10px;"><div class="form-group" style="flex:1;"><label>Команда 2</label><select id="m-t2" class="form-control">' + options + '</select></div><div class="form-group" style="width:80px;"><label>Счет</label><input type="number" id="m-s2" class="form-control" value="0"></div></div>' +
      '<button class="btn" onclick="addMatchAdmin()">Добавить</button>';
  }
}

function renderAdminTeamsList(teams) {
  var list = document.getElementById("admin-teams-list");
  if (!list) return;
  var html = "";
  teams.forEach(function(t) {
    html += '<div style="background:rgba(0,0,0,0.2); padding:12px; border-radius:10px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">' +
      '<div><b>' + t.name + '</b> (' + t.points + ' pts)</div>' +
      '<div style="display:flex; gap:5px;"><button class="btn" style="margin:0; padding:6px 10px; font-size:12px;" onclick="editTeamAdmin(\'' + t.name + '\')">Ред.</button><button class="btn" style="margin:0; padding:6px 10px; font-size:12px; background: #3b82f6;" onclick="toggleVerify(\'' + t.name + '\')">' + (t.verified ? 'Снять <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;"><polyline points="20 6 9 17 4 12"/></svg>' : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;"><polyline points="20 6 9 17 4 12"/></svg>') + '</button><button class="btn btn-red" style="margin:0; padding:6px 10px; font-size:12px;" onclick="deleteTeam(\'' + t.name + '\')">Удал.</button></div></div>';
  });
  list.innerHTML = html;
}

function searchAdminTeams(val) {
  var filtered = APP_DATA.teams.filter(function(t) { return t.name.toLowerCase().includes(val.toLowerCase()); });
  renderAdminTeamsList(filtered);
}

function approveTeamRequest(index) {
  var req = teamRequests[index];
  APP_DATA.teams.push({ id: Date.now(), name: req.name, tag: req.tag, points: 0, wins: 0, losses: 0, avatar: req.logo, players: req.players.map(function(p){ return { nick: p.nick, role: p.role, kills:0, deaths:0, hs:0, rating:0, avatar:"" }; }) });
  teamRequests.splice(index, 1);
  saveData(); saveRequests();
  showAdminTab('requests');
  toastAuto("Команда одобрена!");
}

function rejectTeamRequest(index) {
  teamRequests.splice(index, 1);
  saveRequests();
  showAdminTab('requests');
}

function approveNews(index) {
  const req = newsRequests[index];
  fetch(API_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'approve_news', team: req.team, text: req.text, photo: req.photo || '' })
  }).then(function() {
    toastAuto('Отправлено в чат админов!');
    newsRequests.splice(index, 1);
    saveRequests();
    showAdminTab('requests');
  }).catch(function(err) {
    toastAuto('ОШИБКА СЕТИ!');
  });
}


function rejectNews(index) {
  const req = newsRequests[index];
  const data = { action: 'reject_news', team: req.team, text: req.text };
  fetch(API_URL + "/api/news", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).catch(e => console.warn(e));
  newsRequests.splice(index, 1);
  saveRequests();
  showAdminTab('requests');
}


function addMatchAdmin() {
  var container = document.getElementById("admin-form-container");
  if (!container) return;
  
  var teams = APP_DATA.teams || [];
  if (teams.length < 2) {
    container.innerHTML = '<p style="color:#ef4444; text-align:center; padding:20px;">Нужно минимум 2 команды для создания матча.</p>';
    return;
  }
  
  var options = teams.map(function(t) { return '<option value="' + t.name + '">' + t.name + '</option>'; }).join('');
  
  var html = '<div style="background:#232b33; padding:20px; border-radius:12px; border:1px solid #2d3748; margin-bottom:20px;">';
  var pending = window._pendingRequest;
  var shotHtml = '';
  if (pending && pending.photo) {
    shotHtml = '<div style="background:#1a1f24; padding:12px; border-radius:12px; margin-bottom:16px;"><div style="color:#8b959e; font-size:12px; margin-bottom:8px;">Скриншот из заявки:</div><img src="' + pending.photo + '" style="max-width:100%; max-height:300px; border-radius:8px; cursor:pointer;" onclick="window.open(this.src)"></div>';
  }
  html += shotHtml;
  html += '<h2 style="margin:0 0 20px 0; color:#fff;">Создание матча</h2>';
  
  html += '<div style="display:flex; gap:15px; margin-bottom:20px; flex-wrap:wrap;">';
  html += '  <div style="flex:1; min-width:150px; background:#171a1f; padding:15px; border-radius:8px; border:1px solid #333;">';
  html += '    <label style="color:#8b959e; font-size:12px; text-transform:uppercase; margin-bottom:8px; display:block;">Команда 1</label>';
  html += '    <select id="add-m-t1" style="width:100%; padding:10px; background:#232b33; border:1px solid #2d3748; color:#fff; border-radius:6px; font-size:16px; font-weight:bold;" onchange="loadMatchStatsForm()">' + options + '</select>';
  html += '  </div>';
  html += '  <div style="flex:1; min-width:150px; background:#171a1f; padding:15px; border-radius:8px; border:1px solid #333;">';
  html += '    <label style="color:#8b959e; font-size:12px; text-transform:uppercase; margin-bottom:8px; display:block;">Команда 2</label>';
  html += '    <select id="add-m-t2" style="width:100%; padding:10px; background:#232b33; border:1px solid #2d3748; color:#fff; border-radius:6px; font-size:16px; font-weight:bold;" onchange="loadMatchStatsForm()">' + options + '</select>';
  html += '  </div>';
  html += '</div>';
  
  html += '<div style="margin-bottom:20px;">';
  html += '  <label style="color:#8b959e; font-size:12px; text-transform:uppercase; margin-bottom:8px; display:block;">Карта</label>';
  html += '  <select id="add-m-map" style="width:100%; padding:12px; background:#171a1f; border:1px solid #2d3748; color:#fff; border-radius:6px; font-size:14px;">';
  html += '    <option value="de_mirage">Mirage</option><option value="de_inferno">Inferno</option><option value="de_dust2">Dust II</option><option value="de_vertigo">Vertigo</option><option value="de_nuke">Nuke</option><option value="de_ancient">Ancient</option>';
  html += '  </select>';
  html += '</div>';
  
  html += '</div>';
  
  html += '<div id="match-stats-container"></div>';
  
  html += '<button class="btn btn-green" style="margin-top:20px; padding:15px; font-size:16px; font-weight:bold; border-radius:8px;" onclick="saveNewMatch()">Добавить матч</button>';
  

  if (pending) {
    setTimeout(function() {
      var s1 = document.getElementById("add-m-t1");
      var s2 = document.getElementById("add-m-t2");
      if (s1 && pending.data.m1 && pending.data.m1.name) s1.value = pending.data.m1.name;
      if (s2 && pending.data.m2 && pending.data.m2.name) s2.value = pending.data.m2.name;
      var parts = (pending.data.score || "0:0").split(":");
      var sc1 = document.getElementById("add-m-s1");
      var sc2 = document.getElementById("add-m-s2");
      if (sc1) sc1.value = parseInt(parts[0]) || 0;
      if (sc2) sc2.value = parseInt(parts[1]) || 0;
      loadMatchStatsForm();
    }, 50);
  }
  container.innerHTML = html;
  loadMatchStatsForm();
}









function loadMatchStatsForm() {
  var t1Name = document.getElementById("add-m-t1").value;
  var t2Name = document.getElementById("add-m-t2").value;
  
  var t1 = APP_DATA.teams.find(function(t) { return t.name === t1Name; });
  var t2 = APP_DATA.teams.find(function(t) { return t.name === t2Name; });
  
  var container = document.getElementById("match-stats-container");
  if (!container) return;
  
  if (!t1 || !t2) { container.innerHTML = ''; return; }
  
  var html = '<div style="display:flex; gap:15px; flex-wrap:wrap;">';
  
  // Форма для 1 команды
  html += '<div style="flex:1; min-width:250px; background:#232b33; padding:15px; border-radius:8px;">';
  html += '  <h4 style="color:#fff; margin-bottom:10px;">' + t1.name + '</h4>';
  html += '  <input type="number" id="add-m-s1" placeholder="Счет команды 1" value="0" style="width:100%; margin-bottom:15px; padding:8px; background:#171a1f; border:1px solid #2d3748; color:#fff; border-radius:4px;">';
  html += '  <table style="width:100%; font-size:12px; color:#8b959e; text-align:left;">';
  html += '    <tr><th>Ник</th><th>K</th><th>D</th><th>HS%</th></tr>';
  t1.players.forEach(function(p, i) {
    html += '<tr>';
    html += '<td style="padding:4px 0;">' + p.nick + '</td>';
    html += '<td><input type="number" id="t1-k-' + i + '" value="0" style="width:40px; background:#171a1f; border:1px solid #333; color:#fff;"></td>';
    html += '<td><input type="number" id="t1-d-' + i + '" value="0" style="width:40px; background:#171a1f; border:1px solid #333; color:#fff;"></td>';
    html += '<td><input type="number" id="t1-hs-' + i + '" value="0" style="width:40px; background:#171a1f; border:1px solid #333; color:#fff;"></td>';
    html += '</tr>';
  });
  html += '  </table>';
  html += '</div>';
  
  // Форма для 2 команды
  html += '<div style="flex:1; min-width:250px; background:#232b33; padding:15px; border-radius:8px;">';
  html += '  <h4 style="color:#fff; margin-bottom:10px;">' + t2.name + '</h4>';
  html += '  <input type="number" id="add-m-s2" placeholder="Счет команды 2" value="0" style="width:100%; margin-bottom:15px; padding:8px; background:#171a1f; border:1px solid #2d3748; color:#fff; border-radius:4px;">';
  html += '  <table style="width:100%; font-size:12px; color:#8b959e; text-align:left;">';
  html += '    <tr><th>Ник</th><th>K</th><th>D</th><th>HS%</th></tr>';
  t2.players.forEach(function(p, i) {
    html += '<tr>';
    html += '<td style="padding:4px 0;">' + p.nick + '</td>';
    html += '<td><input type="number" id="t2-k-' + i + '" value="0" style="width:40px; background:#171a1f; border:1px solid #333; color:#fff;"></td>';
    html += '<td><input type="number" id="t2-d-' + i + '" value="0" style="width:40px; background:#171a1f; border:1px solid #333; color:#fff;"></td>';
    html += '<td><input type="number" id="t2-hs-' + i + '" value="0" style="width:40px; background:#171a1f; border:1px solid #333; color:#fff;"></td>';
    html += '</tr>';
  });
  html += '  </table>';
  html += '</div>';
  
  html += '</div>';
  container.innerHTML = html;
}

function saveNewMatch() {
  var t1Name = document.getElementById("add-m-t1").value;
  var t2Name = document.getElementById("add-m-t2").value;
  var t1 = APP_DATA.teams.find(function(t) { return t.name === t1Name; });
  var t2 = APP_DATA.teams.find(function(t) { return t.name === t2Name; });
  
  if (!t1 || !t2) { toastAuto("Ошибка: команды не найдены"); return; }
  
  var map = document.getElementById("add-m-map").value || "de_mirage";
  var s1 = parseInt(document.getElementById("add-m-s1").value) || 0;
  var s2 = parseInt(document.getElementById("add-m-s2").value) || 0;
  
  // Собираем статистику
  var p1 = t1.players.map(function(p, i) {
    return { nick: p.nick, kills: parseInt(document.getElementById("t1-k-" + i).value) || 0, deaths: parseInt(document.getElementById("t1-d-" + i).value) || 0, hs: parseInt(document.getElementById("t1-hs-" + i).value) || 0 };
  });
  var p2 = t2.players.map(function(p, i) {
    return { nick: p.nick, kills: parseInt(document.getElementById("t2-k-" + i).value) || 0, deaths: parseInt(document.getElementById("t2-d-" + i).value) || 0, hs: parseInt(document.getElementById("t2-hs-" + i).value) || 0 };
  });
  
    var stats = { t1: p1, t2: p2 };
  fetch(API_BASE + "/api/matches", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      team1: t1.name, team2: t2.name,
      score1: s1, score2: s2,
      tournament: "Добавлено вручную", date: "",
      map: map, stats: stats
    })
  }).then(function(r){ return r.json(); }).then(function(res){
    if (res.ok) {
      if (window._pendingRequest) {
        var rid = window._pendingRequest.id;
        window._pendingRequest = null;
        fetch(API_BASE + "/api/requests/" + rid, { method: "DELETE" });
        toast("Матч создан, заявка закрыта", "success");
      } else {
        toast("Матч добавлен в БД!", "success");
      }
      loadFromAPI();
      showAdminTab('matches');
    } else { toastAuto("Ошибка: " + (res.error || "unknown")); }
  }).catch(function(e){ toastAuto("Ошибка сети: " + e); });
}

function editTeamAdmin(teamName) {
  var team = APP_DATA.teams.find(function(t) { return t.name === teamName; });
  if (!team) return;

  // Создаем модальное окно (или перерисовываем контейнер админки)
  var adminContent = document.getElementById("admin-form-container");
  
  var html = '<button class="back-btn" onclick="showAdminTab(\'teams\')">← Назад к командам</button>';
  html += '<h2 style="margin-bottom:20px;">Редактирование: ' + team.name + '</h2>';
  
  // Форма изменения очков
  html += '<div style="background:#1a1f24; padding:20px; border-radius:12px; margin-bottom:20px;">';
  html += '  <label style="display:block; margin-bottom:5px; color:#8b959e;">Очки команды:</label>';
  html += '  <input type="number" id="edit-points" value="' + team.points + '" style="width:100%; padding:10px; background:#111; border:1px solid #333; color:#fff; border-radius:5px; margin-bottom:15px;">';
  html += '  <button class="btn btn-green" onclick="saveTeamPoints(\'' + team.name + '\')">Сохранить очки</button>';
  html += '</div>';
  
  // Список игроков
  html += '<h3>Игроки</h3>';
  html += '<div id="players-edit-list">';
  team.players.forEach(function(p, i) {
    html += '<div style="background:#232b33; padding:15px; border-radius:8px; margin-bottom:10px; display:flex; gap:10px; flex-wrap:wrap; align-items:center;">';
    html += '  <input type="text" value="' + p.nick + '" id="nick-' + i + '" placeholder="Ник" style="flex:1; padding:8px; background:#111; border:1px solid #333; color:#fff; border-radius:5px;">';
    html += '  <button class="btn" style="margin:0; padding:8px 12px; background:#3b82f6; font-size:14px;" onclick="togglePlayerVerify(\'' + team.name + '\', ' + i + ')" title="Верификация">' + (p.verified ? 'Снять <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;"><polyline points="20 6 9 17 4 12"/></svg>' : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;"><polyline points="20 6 9 17 4 12"/></svg>') + '</button>';
    html += '  <input type="text" value="' + (p.role || '') + '" id="role-' + i + '" placeholder="Роль" style="flex:1; padding:8px; background:#111; border:1px solid #333; color:#fff; border-radius:5px;">';
    html += '  <button onclick="savePlayer(\'' + team.name + '\', ' + i + ')" style="background:#2b6cb0; border:none; padding:8px 15px; border-radius:5px; color:#fff; cursor:pointer;">Сохранить</button>';
    html += '  <button onclick="removePlayer(\'' + team.name + '\', ' + i + ')" style="background:#ef4444; border:none; padding:8px 15px; border-radius:5px; color:#fff; cursor:pointer;">Удалить</button>';
    html += '</div>';
  });
  html += '</div>';
  
  // Кнопка добавления игрока
  html += '<button class="btn" style="margin-top:20px;" onclick="addPlayer(\'' + team.name + '\')">+ Добавить игрока</button>';
  
  adminContent.innerHTML = html;
}

function saveTeamPoints(teamName) {
  var team = APP_DATA.teams.find(function(t) { return t.name === teamName; });
  if (!team) return;
  var newPoints = parseInt(document.getElementById("edit-points").value) || 0;
  team.points = newPoints;
  saveData();
  toastAuto("Очки обновлены!");
  showAdminTab('teams');
}

function savePlayer(teamName, index) {
  var team = APP_DATA.teams.find(function(t) { return t.name === teamName; });
  if (!team || !team.players[index]) return;
  var newNick = document.getElementById("nick-" + index).value.trim();
  var newRole = document.getElementById("role-" + index).value.trim();
  if (!newNick) { toastAuto("Ник не может быть пустым!"); return; }
  team.players[index].nick = newNick;
  team.players[index].role = newRole;
  saveData();
  toastAuto("Игрок обновлен!");
  showAdminTab('teams');
}

function removePlayer(teamName, index) {
  if (!confirmDialog("Удалить этого игрока?")) return;
  var team = APP_DATA.teams.find(function(t) { return t.name === teamName; });
  if (!team) return;
  team.players.splice(index, 1);
  saveData();
  toastAuto("Игрок удален!");
  showAdminTab('teams');
}

function addPlayer(teamName) {
  var team = APP_DATA.teams.find(function(t) { return t.name === teamName; });
  if (!team) return;
  var nick = promptDialog("Введите ник нового игрока:");
  if (!nick || !nick.trim()) return;
  var role = promptDialog("Введите роль (Снайпер, Штурмовик и т.д.):") || "Игрок";
  team.players.push({ nick: nick.trim(), role: role.trim(), kills: 0, deaths: 0, hs: 0, rating: 0 });
  saveData();
  toastAuto("Игрок добавлен!");
  showAdminTab('teams');
}

function deleteTeam(teamName) {
  if (!confirmDialog("Вы уверены, что хотите УДАЛИТЬ команду " + teamName + "?")) return;
  fetch(API_URL + "/api/teams/" + encodeURIComponent(teamName), { method: "DELETE" })
    .then(function(r){ return r.json(); })
    .then(function(){
      APP_DATA.teams = APP_DATA.teams.filter(function(t) { return t.name !== teamName; });
      saveData();
      toastAuto("Команда удалена!");
      loadFromAPI().then(function(){ showAdminTab('teams'); });
    })
    .catch(function(e){ toastAuto("Ошибка удаления: " + e); });
}

function addTeamAdminForm() {
  var container = document.getElementById("admin-form-container");
  if (!container) return;
  var html = '<h2>Добавить команду</h2>';
  html += '<div style="background:#1a1f24; padding:20px; border-radius:12px; border:1px solid #2d3748; margin-bottom:20px;">';
  html += '<div style="margin-bottom:15px;"><label style="color:#8b959e; font-size:12px;">Название команды</label><input type="text" id="new-team-name" style="width:100%; padding:10px; background:#111; border:1px solid #333; color:#fff; border-radius:6px;"></div>';
  html += '<div style="margin-bottom:15px;"><label style="color:#8b959e; font-size:12px;">Очки</label><input type="number" id="new-team-points" value="0" style="width:100%; padding:10px; background:#111; border:1px solid #333; color:#fff; border-radius:6px;"></div>';
  html += '<h3 style="margin-top:20px;">Игроки (5)</h3>';
  for (var i = 0; i < 5; i++) {
    html += '<div style="margin-bottom:10px; display:flex; gap:8px;">';
    html += '<input type="text" id="np-nick-' + i + '" placeholder="Ник" style="flex:2; padding:8px; background:#111; border:1px solid #333; color:#fff; border-radius:6px;">';
    html += '<input type="text" id="np-role-' + i + '" placeholder="Роль" style="flex:1; padding:8px; background:#111; border:1px solid #333; color:#fff; border-radius:6px;">';
    html += '</div>';
  }
  html += '<button class="btn btn-green" onclick="saveNewTeam()" style="margin-top:10px;">Создать</button>';
  html += '</div>';
  container.innerHTML = html;
}

function saveNewTeam() {
  var name = (document.getElementById("new-team-name").value || "").trim();
  var points = parseInt(document.getElementById("new-team-points").value) || 0;
  if (!name) { toastAuto("Введите название"); return; }
  var players = [];
  for (var i = 0; i < 5; i++) {
    var nick = (document.getElementById("np-nick-" + i).value || "").trim();
    var role = (document.getElementById("np-role-" + i).value || "").trim();
    if (nick) players.push({ nick: nick, role: role, kills: 0, deaths: 0, hs: 0, rating: 0 });
  }
  fetch(API_BASE + "/api/teams", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ name: name, points: points, wins: 0, losses: 0, players: players })
  }).then(function(r){ return r.json(); }).then(function(res){
    if (res.ok) { toastAuto("Команда добавлена в БД!"); loadFromAPI(); showAdminTab('teams'); }
    else { toastAuto("Ошибка: " + (res.error || "unknown")); }
  }).catch(function(e){ toastAuto("Ошибка сети: " + e); });
}

function renderMatchesList() {
  var container = document.getElementById("matches-container");
  if (!container) return;
  
  // Убираем дублирующийся заголовок, если он есть в HTML
  container.innerHTML = '<h1 style="margin-bottom:20px;">Сыгранные матчи</h1>';
  
  var html = '';
  APP_DATA.matches.forEach(function(m) {
    // Берем данные строго из твоей структуры
    var t1 = m.team1.name || 'Team 1';
    var s1 = m.team1.score || 0;
    var t2 = m.team2.name || 'Team 2';
    var s2 = m.team2.score || 0;
    
    // Убираем префикс "de_" из названия карты для поиска картинки
    var mapName = m.map ? m.map.replace('de_', '') : 'default';
    var mapBg = mapName.toLowerCase() + '.jpg';

    var t1Class = s1 > s2 ? 'match-winner' : '';
    var t2Class = s2 > s1 ? 'match-winner' : '';

    // Используем классы, которые уже есть в твоем style.css (или добавим стили прямо тут)
    html += '<div class="match-card" style="background-image: url(\'maps/' + mapBg + '\'); cursor:pointer; margin-bottom:10px; padding:20px; display:flex; justify-content:space-between; align-items:center; border-radius:12px;" onclick="showMatchDetail(' + m.id + ')">';
    html += '  <div class="match-team ' + t1Class + '" style="font-weight:bold; color:#fff; font-size:16px;">' + t1 + '</div>';
    html += '  <div class="match-score" style="background:rgba(0,0,0,0.7); padding:5px 15px; border-radius:5px; color:#fff; font-weight:bold; font-size:18px;">' + s1 + ' : ' + s2 + '</div>';
    html += '  <div class="match-team right ' + t2Class + '" style="font-weight:bold; color:#fff; font-size:16px; text-align:right;">' + t2 + '</div>';
    html += '</div>';
  });
  
  if (APP_DATA.matches.length === 0) {
      html += '<p style="color:#8b959e;">Матчей пока нет.</p>';
  }
  
  container.innerHTML = html;
}

function showMatchDetail(id) {
  var m = APP_DATA.matches.find(function(x){ return x.id === id; });
  if (!m) return;
  
  switchTab('match-detail');
  var container = document.getElementById("match-detail-content");
  
  var mapName = m.map ? m.map.replace('de_', '').toLowerCase() : 'default';
  var mapBg = 'maps/' + mapName + '.jpg';
  
  var t1Win = m.team1.score > m.team2.score;
  var t2Win = m.team2.score > m.team1.score;
  
  var html = '<div style="display:flex; gap:10px; align-items:center; margin-bottom:15px;">';
  html += '<button class="back-btn" onclick="switchTab(\'matches\')">← Назад</button>';
  if (localStorage.getItem("isAdmin") === "true") {
    html += '<button onclick="deleteMatch(' + m.id + ')" style="margin-left:auto; background:#ef4444; color:#fff; border:none; padding:10px 16px; border-radius:8px; font-weight:bold; cursor:pointer;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Удалить матч</button>';
  }
  html += '</div>';
  
  // 1. БАННЕР С КАРТОЙ (ЯРКИЙ)
  html += '<div style="position:relative; width:100%; height:200px; border-radius:12px; overflow:hidden; margin-bottom:20px; background: url(\'' + mapBg + '\') center/cover no-repeat;">';
  // Легкое затемнение только по краям для читаемости текста
  html += '  <div style="position:absolute; top:0; left:0; right:0; bottom:0; background: linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.8) 100%);"></div>';
  
  // Команды и счет
  html += '  <div style="position:absolute; top:0; left:0; right:0; bottom:0; display:flex; justify-content:space-between; align-items:center; padding:0 20px;">';
  html += '    <div style="color:' + (t1Win ? '#4ade80' : '#fff') + '; font-size:20px; font-weight:bold; text-shadow:0 2px 4px #000;">' + m.team1.name + '</div>';
  html += '    <div style="background:rgba(0,0,0,0.8); padding:10px 20px; border-radius:8px; color:#fff; font-size:28px; font-weight:900; border:1px solid #444;">' + m.team1.score + ' : ' + m.team2.score + '</div>';
  html += '    <div style="color:' + (t2Win ? '#4ade80' : '#fff') + '; font-size:20px; font-weight:bold; text-shadow:0 2px 4px #000;">' + m.team2.name + '</div>';
  html += '  </div>';
  html += '</div>';
  
  // 2. ТАБЛИЦА СТАТИСТИКИ (ФУНКЦИЯ ДЛЯ РЕНДЕРА)
  function renderTable(team, color) {
    var tHtml = '<div style="background:#1a1f24; border-radius:12px; margin-bottom:20px; overflow:hidden; border:1px solid #2d3748;">';
    tHtml += '<div style="padding:15px 20px; font-size:18px; font-weight:bold; color:' + color + '; border-bottom:1px solid #2d3748;">' + team.name + '</div>';
    tHtml += '<table style="width:100%; border-collapse:collapse; text-align:left; font-size:14px;">';
    tHtml += '<thead><tr style="color:#8b959e; font-size:12px; text-transform:uppercase;"><th style="padding:10px 20px;">Игрок</th><th style="padding:10px;">Убийства</th><th style="padding:10px;">К/Д</th><th style="padding:10px;">HS%</th></tr></thead><tbody>';
    
    team.players.forEach(function(p) {
      var kd = p.deaths > 0 ? (p.kills / p.deaths).toFixed(2) : p.kills.toFixed(2);
      tHtml += '<tr style="border-top:1px solid #2d3748;">';
      tHtml += '<td style="padding:12px 20px; display:flex; align-items:center; gap:10px;">';
      tHtml += '<div style="width:30px; height:30px; background:#2d3748; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; color:#fff;">' + p.nick.charAt(0) + '</div>';
      tHtml += '<span style="font-weight:500; display:inline-flex; align-items:center;">' + p.nick + (p.verified ? ' <svg width="14" height="14" viewBox="0 0 24 24" style="flex-shrink:0; margin-left:6px;" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#3b82f6"/><path d="M7 12.5L10.5 16L17 9" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>' : '') + '</span></td>';
      tHtml += '<td style="padding:12px 10px;">' + p.kills + '</td>';
      tHtml += '<td style="padding:12px 10px; color:' + (kd >= 1 ? '#4ade80' : '#ef4444') + ';">' + kd + '</td>';
      tHtml += '<td style="padding:12px 10px;">' + p.hs + '%</td>';
      tHtml += '</tr>';
    });
    
    tHtml += '</tbody></table></div>';
    return tHtml;
  }
  
  html += renderTable(m.team1, '#fff');
  html += renderTable(m.team2, '#fff');
  
  container.innerHTML = html;
}

function previewImage(input, previewId) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function(e) {
      var img = document.getElementById(previewId);
      img.src = e.target.result;
      img.style.display = 'block';
    };
    reader.readAsDataURL(input.files[0]);
  }
}


function addNewTeam() {
  var name = promptDialog("Введите название команды:");
  if (!name || !name.trim()) return;
  var tag = promptDialog("Введите тег команды (например, NAVI):") || "TAG";
  
  APP_DATA.teams.push({
    id: Date.now(),
    name: name.trim(),
    tag: tag.trim().toUpperCase(),
    points: 0,
    wins: 0,
    losses: 0,
    players: []
  });
  saveData();
  toastAuto("Команда создана!");
  showAdminTab('teams');
}


// === ВЕРИФИКАЦИЯ КОМАНД ===
function toggleVerify(teamName) {
  var team = APP_DATA.teams.find(function(t) { return t.name === teamName; });
  if (!team) return;
  
  team.verified = !team.verified;
  saveData();
  showAdminTab('teams');
  
  fetch(API_URL + "/api/verify-team", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ team: teamName, verified: team.verified })
  }).catch(function(err) {
    console.warn("Демо-режим: сервер не отвечает", err);
  });
}

// === ВЕРИФИКАЦИЯ ИГРОКОВ ===
function togglePlayerVerify(teamName, playerIndex) {
  var team = APP_DATA.teams.find(function(t) { return t.name === teamName; });
  if (!team || !team.players[playerIndex]) return;
  
  var player = team.players[playerIndex];
  player.verified = !player.verified;
  saveData();
  editTeamAdmin(teamName);
  
  fetch(API_URL + "/api/verify-player", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ team: teamName, playerNick: player.nick, verified: player.verified })
  }).catch(function(err) {
    console.warn("Демо-режим: сервер не отвечает", err);
  });
}


async function renderAdminRequests() {
  var container = document.getElementById("admin-form-container");
  if (!container) return;
  container.innerHTML = '<p style="color:#8b959e;">Загрузка заявок...</p>';
  var reqs = [];
  try {
    var res = await fetch(API_BASE + "/api/requests");
    reqs = await res.json();
  } catch (e) {
    container.innerHTML = '<p style="color:#ef4444;">Ошибка загрузки: ' + e + '</p>';
    return;
  }
  var html = '<h2 style="margin-bottom:20px;">Заявки (' + reqs.length + ')</h2>';
  if (reqs.length === 0) {
    html += '<p style="color:#8b959e; padding:20px; text-align:center;">Нет новых заявок</p>';
  } else {
    reqs.forEach(function(r) {
      var border = r.type === 'match' ? '#10b981' : '#3b82f6';
      html += '<div style="background:#232b33; margin-bottom:15px; padding:20px; border-radius:12px; border-left:4px solid ' + border + '; box-shadow:0 4px 6px rgba(0,0,0,0.1);">';
      if (r.type === 'roster') {
        html += '<h3 style="margin:0 0 10px 0; font-size:18px;">Смена состава: <span style="color:#3b82f6;">' + r.data.team + '</span></h3>';
        html += '<p style="margin:0 0 15px 0; color:#e1e1e1; font-size:14px; line-height:1.5; white-space:pre-wrap;">' + r.data.changes + '</p>';
        if (r.photo) html += '<img src="' + r.photo + '" style="max-height:200px; border-radius:8px; margin-bottom:15px; display:block;">';
        html += '<div style="display:flex; gap:10px;">';
        html += '<button class="btn" style="background:#10b981; flex:1; margin:0;" onclick="approveRosterRequest(' + r.id + ')">Принять</button>';
        html += '<button class="btn" style="background:#ef4444; flex:1; margin:0;" onclick="deleteRequest(' + r.id + ')">Отклонить</button>';
        html += '</div>';
      } else if (r.type === 'match') {
        html += '<h3 style="margin:0 0 10px 0; font-size:18px;">Регистрация матча</h3>';
        if (r.photo) html += '<img src="' + r.photo + '" style="max-width:100%; max-height:300px; border-radius:8px; margin-bottom:15px; display:block; border:1px solid #444; cursor:pointer;" onclick="window.open(this.src)">';
        html += '<div style="display:flex; justify-content:space-between; align-items:center; background:#171a1f; padding:15px; border-radius:8px; margin-bottom:15px;">';
        html += '<div style="flex:1; text-align:center;"><div style="font-weight:bold; font-size:16px; color:' + (r.data.m1.result === 'win' ? '#10b981' : '#fff') + ';">' + r.data.m1.name + '</div><div style="font-size:12px; color:#8b959e; margin-top:5px;">' + r.data.m1.players + '</div></div>';
        html += '<div style="font-size:24px; font-weight:900; padding:0 15px;">' + r.data.score + '</div>';
        html += '<div style="flex:1; text-align:center;"><div style="font-weight:bold; font-size:16px; color:' + (r.data.m2.result === 'win' ? '#10b981' : '#fff') + ';">' + r.data.m2.name + '</div><div style="font-size:12px; color:#8b959e; margin-top:5px;">' + r.data.m2.players + '</div></div>';
        html += '</div>';
        html += '<div style="display:flex; gap:10px;">';
        html += '<button class="btn" style="background:#10b981; flex:1; margin:0;" onclick="approveMatchRequest(' + r.id + ')">Создать матч</button>';
        html += '<button class="btn" style="background:#ef4444; flex:1; margin:0;" onclick="deleteRequest(' + r.id + ')">Отклонить</button>';
        html += '</div>';
      }
      html += '</div>';
    });
  }
  container.innerHTML = html;
}

function deleteRequest(id) {
  confirmDialog("Удалить заявку?", "Удаление", "danger").then(function(ok){
    if (!ok) return;
    fetch(API_BASE + "/api/requests/" + id, { method: "DELETE" })
      .then(function(r){ return r.json(); })
      .then(function(){ toast("Заявка удалена", "success"); renderAdminRequests(); })
      .catch(function(e){ toast("Ошибка: " + e, "error"); });
  });
}

function approveMatchRequest(id) {
  fetch(API_BASE + "/api/requests").then(function(r){ return r.json(); }).then(function(reqs){
    var req = reqs.find(function(x){ return x.id === id; });
    if (!req || req.type !== 'match') return;
    window._pendingRequest = req;
    addMatchAdmin();
  });
}
function approveRequest(index) {
  var reqs = JSON.parse(localStorage.getItem("hltv_admin_requests")) || [];
  var r = reqs[index];
  if (!r) return;
  
  if (r.type === 'match') {
    // Обновляем статистику команд (добавляем победы/поражения)
    // В демо-режиме просто уведомляем
    toast("Матч засчитан! Уведомление отправлено игроку.");
  } else {
    toast("Состав изменён! Уведомление отправлено игроку.");
  }
  
  reqs.splice(index, 1);
  localStorage.setItem("hltv_admin_requests", JSON.stringify(reqs));
  renderAdminRequests();
}

function rejectRequest(index) {
  var reqs = JSON.parse(localStorage.getItem("hltv_admin_requests")) || [];
  reqs.splice(index, 1);
  localStorage.setItem("hltv_admin_requests", JSON.stringify(reqs));
  toast("Заявка отклонена. Уведомление отправлено.");
  renderAdminRequests();
}
function renderTournaments() {
  var container = document.getElementById("tournaments-container");
  if (!container) return;
  
  var tournaments = (APP_DATA.tournaments || []).map(function(t, i) {
    return {
      id: t.id || (i + 1),
      name: t.name || "Турнир",
      prize: t.prize || "—",
      date: t.date || "",
      image: t.image || "maps/mirage.jpg"
    };
  });
  if (tournaments.length === 0) {
    tournaments = [
      { id: 1, name: "Counter Flame Cup", prize: "$5,000", date: "25 Ноября", image: "maps/mirage.jpg" },
      { id: 2, name: "Major 2026", prize: "$50,000", date: "10 Декабря", image: "maps/inferno.jpg" }
    ];
  }
  
  if (tournaments.length === 0) {
    container.innerHTML = '<h1>Турниры</h1><p style="color:var(--muted); text-align:center; padding:20px;">Пока нет турниров</p>';
    return;
  }
  
  var html = '<h1>Турниры</h1>';
  tournaments.forEach(function(t) {
    html += '<div class="card" style="margin-bottom:15px; padding:15px; display:flex; gap:15px; cursor:pointer;" onclick="openTournamentDetail(' + t.id + ')">';
    html += '  <div style="width:80px; height:80px; border-radius:8px; background: url(' + t.image + ') center/cover; flex-shrink:0;"></div>';
    html += '  <div>';
    html += '    <h3 style="margin:0 0 5px 0; color:#fff;">' + t.name + '</h3>';
    html += '    <div style="font-size:12px; color:var(--muted);">Призовые: <span style="color:#4ade80; font-weight:bold;">' + t.prize + '</span></div>';
    html += '    <div style="font-size:12px; color:var(--muted);">Дата: ' + t.date + '</div>';
    html += '  </div>';
    html += '</div>';
  });
  
  container.innerHTML = html;
}

function openTournamentDetail(id) {
  toastAuto("Турнир ID: " + id + " (Детали в разработке)");
}

function renderAdminTournamentsForm() {
  var container = document.getElementById("admin-form-container");
  if (!container) return;
  
  var html = '<h2>Создать турнир</h2>';
  html += '<div style="background:#1a1f24; padding:20px; border-radius:12px; border:1px solid #2d3748; margin-bottom:20px;">';
  html += '  <div style="margin-bottom:15px;"><label style="color:#8b959e; font-size:12px;">Название турнира</label><input type="text" id="tour-name" class="input" style="width:100%; padding:10px; background:#111; border:1px solid #333; color:#fff; border-radius:6px;"></div>';
  html += '  <div style="margin-bottom:15px;"><label style="color:#8b959e; font-size:12px;">Призовые</label><input type="text" id="tour-prize" class="input" style="width:100%; padding:10px; background:#111; border:1px solid #333; color:#fff; border-radius:6px;" placeholder="$5,000"></div>';
  html += '  <div style="margin-bottom:15px;"><label style="color:#8b959e; font-size:12px;">Дата</label><input type="text" id="tour-date" class="input" style="width:100%; padding:10px; background:#111; border:1px solid #333; color:#fff; border-radius:6px;" placeholder="25 Ноября"></div>';
  html += '  <div style="margin-bottom:15px;"><label style="color:#8b959e; font-size:12px;">Ссылка на картинку</label><input type="text" id="tour-image" class="input" style="width:100%; padding:10px; background:#111; border:1px solid #333; color:#fff; border-radius:6px;" placeholder="maps/mirage.jpg"></div>';
  html += '  <button class="btn btn-green" onclick="saveNewTournament()" style="margin-top:10px;">Создать турнир</button>';
  html += '</div>';
  
  container.innerHTML = html;
}

function saveNewTournament() {
  var name = document.getElementById("tour-name").value;
  var prize = document.getElementById("tour-prize").value;
  var date = document.getElementById("tour-date").value;
  var image = document.getElementById("tour-image").value || "maps/mirage.jpg";
  
  if (!name || !prize) { toastAuto("Заполните название и призовые!"); return; }
  
  fetch(API_BASE + "/api/tournaments", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ name: name, prize: prize })
  }).then(function(r){ return r.json(); }).then(function(res){
    if (res.ok) { toastAuto("Турнир создан в БД!"); loadFromAPI(); renderAdminTournamentsForm(); }
    else { toastAuto("Ошибка: " + (res.error || "unknown")); }
  }).catch(function(e){ toastAuto("Ошибка сети: " + e); });
}

// ===== TOAST SYSTEM =====
function toast(msg, type) {
  type = type || "info";
  var colors = { success: "#10b981", error: "#ef4444", info: "#3b82f6" };
  var icons = {
    success: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    error:   '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    info:    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
  };
  var container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.style.cssText = "position:fixed; top:80px; right:16px; z-index:99999; display:flex; flex-direction:column; gap:10px;";
    document.body.appendChild(container);
  }
  var el = document.createElement("div");
  el.style.cssText = "display:flex; align-items:center; gap:10px; background:" + colors[type] + "; color:#fff; padding:14px 18px; border-radius:10px; font-size:14px; font-weight:500; box-shadow:0 8px 24px rgba(0,0,0,0.4); min-width:200px; max-width:320px; transform:translateX(120%); transition:transform 0.3s ease;";
  el.innerHTML = icons[type] + '<span style="flex:1;">' + msg + '</span>';
  container.appendChild(el);
  setTimeout(function(){ el.style.transform = "translateX(0)"; }, 10);
  setTimeout(function(){
    el.style.transform = "translateX(120%)";
    setTimeout(function(){ el.remove(); }, 350);
  }, 3000);
}

function toastAuto(msg) {
  var low = (msg || "").toLowerCase();
  if (low.indexOf("ошибк") >= 0 || low.indexOf("заполнит") >= 0 || low.indexOf("не найден") >= 0 ||
      low.indexOf("неверн") >= 0 || low.indexOf("введите") >= 0 || low.indexOf("нет ") >= 0) {
    toast(msg, "error");
  } else if (low.indexOf("добавл") >= 0 || low.indexOf("создан") >= 0 || low.indexOf("отправл") >= 0 ||
             low.indexOf("сохран") >= 0 || low.indexOf("успешн") >= 0 || low.indexOf("готово") >= 0) {
    toast(msg, "success");
  } else {
    toast(msg, "info");
  }
}
// ===== /TOAST SYSTEM =====


function deleteMatch(id) {
  if (!confirmDialog("Удалить этот матч из БД?")) return;
  fetch(API_BASE + "/api/matches/" + id, { method: "DELETE" })
    .then(function(r){ return r.json(); })
    .then(function(res){
      if (res.ok) {
        toast("Матч удалён", "success");
        loadFromAPI();
        switchTab('matches');
      } else {
        toast("Ошибка удаления", "error");
      }
    })
    .catch(function(e){ toast("Ошибка сети: " + e, "error"); });
}


// ===== КРАСИВЫЕ МОДАЛКИ =====
function showModal(opts) {
  return new Promise(function(resolve) {
    var overlay = document.createElement("div");
    overlay.style.cssText = "position:fixed; inset:0; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px); z-index:99999; display:flex; align-items:center; justify-content:center; padding:20px; animation:fadeIn 0.2s ease;";
    var iconMap = {
      danger: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      question: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      success: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
    };
    var modal = document.createElement("div");
    modal.style.cssText = "background:#1a1f24; border:1px solid #2d3748; border-radius:16px; padding:24px; max-width:380px; width:100%; box-shadow:0 20px 60px rgba(0,0,0,0.6); transform:scale(0.9); transition:transform 0.2s ease;";
    var icon = iconMap[opts.type || "question"] || "";
    var inputHtml = "";
    if (opts.input) {
      inputHtml = '<input id="modal-input" type="text" value="' + (opts.inputValue || "") + '" placeholder="' + (opts.inputPlaceholder || "") + '" style="width:100%; padding:12px; background:#111; border:1px solid #333; color:#fff; border-radius:8px; margin-bottom:16px; font-size:14px; box-sizing:border-box; font-family:inherit;">';
    }
    modal.innerHTML = 
      '<div style="display:flex; align-items:center; justify-content:center; margin-bottom:16px;">' + icon + '</div>' +
      '<h3 style="color:#fff; margin:0 0 8px 0; font-size:18px; text-align:center;">' + (opts.title || "Подтверждение") + '</h3>' +
      '<p style="color:#8b959e; margin:0 0 20px 0; font-size:14px; text-align:center; line-height:1.5;">' + (opts.text || "") + '</p>' +
      inputHtml +
      '<div style="display:flex; gap:10px;">' +
        '<button id="modal-cancel" style="flex:1; padding:12px; background:#232b33; color:#fff; border:none; border-radius:8px; font-weight:600; font-size:14px; cursor:pointer;">' + (opts.cancelText || "Отмена") + '</button>' +
        '<button id="modal-ok" style="flex:1; padding:12px; background:' + (opts.type === "danger" ? "#ef4444" : "#3b82f6") + '; color:#fff; border:none; border-radius:8px; font-weight:600; font-size:14px; cursor:pointer;">' + (opts.okText || "ОК") + '</button>' +
      '</div>';
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    setTimeout(function(){ modal.style.transform = "scale(1)"; }, 10);

    function close(result) {
      modal.style.transform = "scale(0.9)";
      overlay.style.opacity = "0";
      setTimeout(function(){ overlay.remove(); resolve(result); }, 150);
    }
    document.getElementById("modal-ok").onclick = function() {
      if (opts.input) {
        var v = document.getElementById("modal-input").value.trim();
        close(v || null);
      } else close(true);
    };
    document.getElementById("modal-cancel").onclick = function() { close(false); };
    overlay.onclick = function(e) { if (e.target === overlay) close(false); };
    if (opts.input) setTimeout(function(){ document.getElementById("modal-input").focus(); }, 200);
  });
}

// Хелперы для замены confirm/prompt
function confirmDialog(text, title, type) {
  return showModal({ type: type || "question", title: title || "Подтверждение", text: text, okText: "Да", cancelText: "Отмена" });
}
function promptDialog(text, defaultValue, placeholder) {
  return showModal({ type: "question", title: "Ввод", text: text, input: true, inputValue: defaultValue || "", inputPlaceholder: placeholder || "" });
}

// CSS для анимации
if (!document.getElementById("modal-css")) {
  var style = document.createElement("style");
  style.id = "modal-css";
  style.textContent = "@keyframes fadeIn{from{opacity:0}to{opacity:1}}";
  document.head.appendChild(style);
}


function approveRosterRequest(id) {
  fetch(API_BASE + "/api/requests").then(function(r){ return r.json(); }).then(function(reqs){
    var req = reqs.find(function(x){ return x.id === id; });
    if (!req || req.type !== 'roster') return;

    var text = "🔄 <b>Смена состава</b>\n\n" +
               "<b>Команда:</b> " + req.data.team + "\n\n" +
               "<b>Изменения:</b>\n" + req.data.changes;

    fetch(API_BASE + "/api/send_to_channel", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ text: text, photo: req.photo || "" })
    }).then(function(r){ return r.json(); }).then(function(res){
      if (res.ok) {
        fetch(API_BASE + "/api/requests/" + id, { method: "DELETE" }).then(function(){
          toast("Отправлено в канал", "success");
          renderAdminRequests();
        });
      } else {
        toast("Ошибка отправки: " + (res.description || "unknown"), "error");
      }
    }).catch(function(e){ toast("Ошибка сети: " + e, "error"); });
  });
}
