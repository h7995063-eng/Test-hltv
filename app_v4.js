const API_URL = "https://catalog-ministries-flows-flyer.trycloudflare.com";
const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

if (!localStorage.getItem("hltv_data")) {
  localStorage.setItem("hltv_data", JSON.stringify(DATA));
}
let APP_DATA = JSON.parse(localStorage.getItem("hltv_data"));
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
  if (sidebar) sidebar.classList.toggle("open");
  if (overlay) overlay.classList.toggle("open");
}

function switchTab(tab) {
  document.querySelectorAll(".nav-item").forEach(function(el) { el.classList.remove("active"); });
  var navEl = document.getElementById("nav-" + tab);
  if (navEl) navEl.classList.add("active");
  
  var screens = ["ranking", "team-detail", "register-team", "matches-list", "match-detail", "news", "admin-login", "admin-panel"];
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
        '<div class="info"><div class="name">' + t.name + (t.verified ? ' <svg width="16" height="16" viewBox="0 0 24 24" style="vertical-align:middle; margin-left:4px;" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#3b82f6"/><path d="M7 12.5L10.5 16L17 9" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' : '') + '</div>' +
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
    return '<tr><td><div class="player-cell">' + pAvatar + '<div><span class="player-nick" style="display:flex; align-items:center;">' + p.nick + (p.verified ? ' <svg width="16" height="16" viewBox="0 0 24 24" style="display:inline-block; vertical-align:middle; margin-left:6px; margin-top:-2px;" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#3b82f6"/><path d="M7 12.5L10.5 16L17 9" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' : '') + '</span>' + (p.role ? '<span class="role-badge">' + p.role + '</span>' : '') + '</div></div></td>' +
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
  var ROLES = ["Снайпер", "Капитан", "Штурмовик", "Поддержка", "Люркер"];
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

  if (!name || !tag || !contact) return alert("Заполните все поля!");
  var players = [];
  for (var i = 1; i <= 5; i++) {
    var nick = document.getElementById("rt-nick-" + i).value;
    if (!nick) return alert("Введите ник игрока " + i);
    players.push({ nick: nick, role: document.getElementById("rt-role-" + i).value });
  }
  teamRequests.push({ name: name, tag: tag, logo: logo, contact: contact, players: players });
  saveRequests();
  alert("Заявка отправлена на модерацию!");
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

function showNewsType(type) {
  var area = document.getElementById("news-form-area");
  if (!area) return;
  
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
        <p style="color:#ef4444; font-size:12px; margin:0;">* Фото обязательно</p>
        
        <div>
          <label style="${labelStyle}">Скриншот (обязательно)</label>
          <input type="file" id="match-photo" accept="image/*" style="${inputStyle} padding:8px;">
        </div>
        
        <div style="display:flex; gap:15px; flex-wrap:wrap;">
          <div style="flex:1; min-width:200px; background:#171a1f; padding:15px; border-radius:8px;">
            <h4 style="margin:0 0 10px 0; color:#fff;">Команда 1</h4>
            <div style="margin-bottom:10px;">
              <label style="${labelStyle}">Название</label>
              <input type="text" id="m1-name" style="${inputStyle}">
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
              <input type="text" id="m2-name" style="${inputStyle}">
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

function showToast(msg) {
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
  
  if (!team || !changes) { showToast("Заполните все поля!"); return; }
  
  var saveRequest = function(photoData) {
    var reqs = JSON.parse(localStorage.getItem("hltv_admin_requests")) || [];
    reqs.push({ type: 'roster', team: team, changes: changes, photo: photoData, id: Date.now() });
    localStorage.setItem("hltv_admin_requests", JSON.stringify(reqs));
    showToast("Отправлено!");
    showNewsType('roster');
  };

  if (fileInput.files.length > 0) {
    var reader = new FileReader();
    reader.onload = function(e) { saveRequest(e.target.result); };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    saveRequest("");
  }
}

function submitMatchRegistration() {
  var fileInput = document.getElementById("match-photo");
  if (fileInput.files.length === 0) { showToast("Прикрепите скриншот!"); return; }
  
  var m1 = { name: document.getElementById("m1-name").value, players: document.getElementById("m1-players").value, result: document.getElementById("m1-result").value };
  var m2 = { name: document.getElementById("m2-name").value, players: document.getElementById("m2-players").value, result: document.getElementById("m2-result").value };
  var score = document.getElementById("match-score").value;
  
  var reader = new FileReader();
  reader.onload = function(e) {
    var reqs = JSON.parse(localStorage.getItem("hltv_admin_requests")) || [];
    reqs.push({ type: 'match', photo: e.target.result, m1: m1, m2: m2, score: score, id: Date.now() });
    localStorage.setItem("hltv_admin_requests", JSON.stringify(reqs));
    showToast("Отправлено!");
    showNewsType('match');
  };
  reader.readAsDataURL(fileInput.files[0]);
}

function showNewsType(type) {
  var area = document.getElementById("news-form-area");
  if (!area) return;
  
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
        <p style="color:#ef4444; font-size:12px; margin:0;">* Фото обязательно</p>
        
        <div>
          <label style="${labelStyle}">Скриншот (обязательно)</label>
          <input type="file" id="match-photo" accept="image/*" style="${inputStyle} padding:8px;">
        </div>
        
        <div style="display:flex; gap:15px; flex-wrap:wrap;">
          <div style="flex:1; min-width:200px; background:#171a1f; padding:15px; border-radius:8px;">
            <h4 style="margin:0 0 10px 0; color:#fff;">Команда 1</h4>
            <div style="margin-bottom:10px;">
              <label style="${labelStyle}">Название</label>
              <input type="text" id="m1-name" style="${inputStyle}">
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
              <input type="text" id="m2-name" style="${inputStyle}">
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

function showToast(msg) {
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
  
  if (!team || !changes) { showToast("Заполните все поля!"); return; }
  
  var saveRequest = function(photoData) {
    var reqs = JSON.parse(localStorage.getItem("hltv_admin_requests")) || [];
    reqs.push({ type: 'roster', team: team, changes: changes, photo: photoData, id: Date.now() });
    localStorage.setItem("hltv_admin_requests", JSON.stringify(reqs));
    showToast("Отправлено!");
    showNewsType('roster');
  };

  if (fileInput.files.length > 0) {
    var reader = new FileReader();
    reader.onload = function(e) { saveRequest(e.target.result); };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    saveRequest("");
  }
}

function submitMatchRegistration() {
  var fileInput = document.getElementById("match-photo");
  if (fileInput.files.length === 0) { showToast("Прикрепите скриншот!"); return; }
  
  var m1 = { name: document.getElementById("m1-name").value, players: document.getElementById("m1-players").value, result: document.getElementById("m1-result").value };
  var m2 = { name: document.getElementById("m2-name").value, players: document.getElementById("m2-players").value, result: document.getElementById("m2-result").value };
  var score = document.getElementById("match-score").value;
  
  var reader = new FileReader();
  reader.onload = function(e) {
    var reqs = JSON.parse(localStorage.getItem("hltv_admin_requests")) || [];
    reqs.push({ type: 'match', photo: e.target.result, m1: m1, m2: m2, score: score, id: Date.now() });
    localStorage.setItem("hltv_admin_requests", JSON.stringify(reqs));
    showToast("Отправлено!");
    showNewsType('match');
  };
  reader.readAsDataURL(fileInput.files[0]);
}

function submitNewsRequest() {
  var team = document.getElementById("n-team").value;
  var text = document.getElementById("n-text").value;
  var photo = document.getElementById("n-photo-preview").src;

  if (!team || !text) return alert("Заполните команду и текст!");
  newsRequests.push({ team: team, text: text, photo: photo });
  saveRequests();
  alert("Новость отправлена админу!");
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
  else if (tab === 'matches') {
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
      '<div style="display:flex; gap:5px;"><button class="btn" style="margin:0; padding:6px 10px; font-size:12px;" onclick="editTeamAdmin(\'' + t.name + '\')">Ред.</button><button class="btn" style="margin:0; padding:6px 10px; font-size:12px; background: #3b82f6;" onclick="toggleVerify(\'' + t.name + '\')">' + (t.verified ? 'Снять ✔' : '✔') + '</button><button class="btn btn-red" style="margin:0; padding:6px 10px; font-size:12px;" onclick="deleteTeam(\'' + t.name + '\')">Удал.</button></div></div>';
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
  alert("Команда одобрена!");
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
    alert('Отправлено в чат админов!');
    newsRequests.splice(index, 1);
    saveRequests();
    showAdminTab('requests');
  }).catch(function(err) {
    alert('ОШИБКА СЕТИ!');
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
  var map = document.getElementById("m-map").value;
  var t1 = APP_DATA.teams.find(function(t){ return t.name === document.getElementById("m-t1").value; });
  var t2 = APP_DATA.teams.find(function(t){ return t.name === document.getElementById("m-t2").value; });
  var s1 = parseInt(document.getElementById("m-s1").value);
  var s2 = parseInt(document.getElementById("m-s2").value);

  if (!t1 || !t2) return alert("Выберите команды");
  APP_DATA.matches.push({
    id: Date.now(), map: map, 
    team1: { name: t1.name, score: s1, players: t1.players },
    team2: { name: t2.name, score: s2, players: t2.players }
  });
  if (s1 > s2) { t1.wins++; t2.losses++; } else { t2.wins++; t1.losses++; }
  saveData();
  alert("Матч добавлен!");
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
    html += '  <button class="btn" style="margin:0; padding:8px 12px; background:#3b82f6; font-size:14px;" onclick="togglePlayerVerify(\'' + team.name + '\', ' + i + ')" title="Верификация">' + (p.verified ? 'Снять ✔' : '✔') + '</button>';
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
  alert("Очки обновлены!");
  showAdminTab('teams');
}

function savePlayer(teamName, index) {
  var team = APP_DATA.teams.find(function(t) { return t.name === teamName; });
  if (!team || !team.players[index]) return;
  var newNick = document.getElementById("nick-" + index).value.trim();
  var newRole = document.getElementById("role-" + index).value.trim();
  if (!newNick) { alert("Ник не может быть пустым!"); return; }
  team.players[index].nick = newNick;
  team.players[index].role = newRole;
  saveData();
  alert("Игрок обновлен!");
  showAdminTab('teams');
}

function removePlayer(teamName, index) {
  if (!confirm("Удалить этого игрока?")) return;
  var team = APP_DATA.teams.find(function(t) { return t.name === teamName; });
  if (!team) return;
  team.players.splice(index, 1);
  saveData();
  alert("Игрок удален!");
  showAdminTab('teams');
}

function addPlayer(teamName) {
  var team = APP_DATA.teams.find(function(t) { return t.name === teamName; });
  if (!team) return;
  var nick = prompt("Введите ник нового игрока:");
  if (!nick || !nick.trim()) return;
  var role = prompt("Введите роль (Снайпер, Штурмовик и т.д.):") || "Игрок";
  team.players.push({ nick: nick.trim(), role: role.trim(), kills: 0, deaths: 0, hs: 0, rating: 0 });
  saveData();
  alert("Игрок добавлен!");
  showAdminTab('teams');
}

function deleteTeam(teamName) {
  if (!confirm("Вы уверены, что хотите УДАЛИТЬ команду " + teamName + "?")) return;
  APP_DATA.teams = APP_DATA.teams.filter(function(t) { return t.name !== teamName; });
  saveData();
  alert("Команда удалена!");
  showAdminTab('teams');
}

function addTeamAdminForm() { alert("Функция добавления в разработке"); }

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
  
  var html = '<button class="back-btn" onclick="switchTab(\'matches\')">← Назад</button>';
  
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
      tHtml += '<span style="font-weight:500; display:inline-flex; align-items:center;">' + p.nick + (p.verified ? ' <svg width="16" height="16" viewBox="0 0 24 24" style="display:inline-block; vertical-align:middle; margin-left:6px; margin-top:-2px;" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#3b82f6"/><path d="M7 12.5L10.5 16L17 9" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' : '') + '</span></td>';
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
  var name = prompt("Введите название команды:");
  if (!name || !name.trim()) return;
  var tag = prompt("Введите тег команды (например, NAVI):") || "TAG";
  
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
  alert("Команда создана!");
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


function renderAdminRequests() {
  var container = document.getElementById("admin-form-container");
  if (!container) return;
  
  var reqs = JSON.parse(localStorage.getItem("hltv_admin_requests")) || [];
  
  var html = '<h2 style="margin-bottom:20px;">Заявки</h2>';
  if (reqs.length === 0) {
    html += '<p style="color:#8b959e;">Нет новых заявок</p>';
  } else {
    reqs.forEach(function(r, i) {
      html += '<div style="background:#232b33; margin-bottom:15px; padding:20px; border-radius:12px; border-left:4px solid ' + (r.type === 'match' ? '#10b981' : '#3b82f6') + '; box-shadow:0 4px 6px rgba(0,0,0,0.1);">';
      
      if (r.type === 'roster') {
        html += '<h3 style="margin:0 0 10px 0; font-size:18px;">Смена состава: <span style="color:#3b82f6;">' + r.team + '</span></h3>';
        
        // Безопасный перенос строк (без регулярок)
        var changesText = r.changes.split('\n').join('<br>');
        html += '<p style="margin:0 0 15px 0; color:#e1e1e1; font-size:14px; line-height:1.5;"><b>Изменения:</b><br>' + changesText + '</p>';
        
        if (r.photo) html += '<img src="' + r.photo + '" style="max-height:150px; border-radius:8px; margin-bottom:15px; display:block;">';
        
        html += '<div style="display:flex; gap:10px;">';
        html += '<button class="btn" style="background:#10b981; flex:1; margin:0;" onclick="approveRequest(' + i + ')">Состав изменён</button>';
        html += '<button class="btn" style="background:#ef4444; flex:1; margin:0;" onclick="rejectRequest(' + i + ')">Отклонено</button>';
        html += '</div>';
      } else if (r.type === 'match') {
        html += '<h3 style="margin:0 0 10px 0; font-size:18px;">Регистрация матча</h3>';
        html += '<img src="' + r.photo + '" style="max-width:100%; max-height:300px; border-radius:8px; margin-bottom:15px; display:block; border:1px solid #444;">';
        
        html += '<div style="display:flex; justify-content:space-between; align-items:center; background:#171a1f; padding:15px; border-radius:8px; margin-bottom:15px;">';
        html += '  <div style="flex:1; text-align:center;">';
        html += '    <div style="font-weight:bold; font-size:16px; color:' + (r.m1.result === 'win' ? '#10b981' : '#fff') + ';">' + r.m1.name + '</div>';
        html += '    <div style="font-size:12px; color:#8b959e; margin-top:5px;">' + r.m1.players + '</div>';
        html += '  </div>';
        html += '  <div style="font-size:24px; font-weight:900; padding:0 15px;">' + r.score + '</div>';
        html += '  <div style="flex:1; text-align:center;">';
        html += '    <div style="font-weight:bold; font-size:16px; color:' + (r.m2.result === 'win' ? '#10b981' : '#fff') + ';">' + r.m2.name + '</div>';
        html += '    <div style="font-size:12px; color:#8b959e; margin-top:5px;">' + r.m2.players + '</div>';
        html += '  </div>';
        html += '</div>';
        
        html += '<div style="display:flex; gap:10px;">';
        html += '<button class="btn" style="background:#10b981; flex:1; margin:0;" onclick="approveRequest(' + i + ')">Засчитано</button>';
        html += '<button class="btn" style="background:#ef4444; flex:1; margin:0;" onclick="rejectRequest(' + i + ')">Отклонено</button>';
        html += '</div>';
      }
      
      html += '</div>';
    });
  }
  
  container.innerHTML = html;
}
function approveRequest(index) {
  var reqs = JSON.parse(localStorage.getItem("hltv_admin_requests")) || [];
  var r = reqs[index];
  if (!r) return;
  
  if (r.type === 'match') {
    // Обновляем статистику команд (добавляем победы/поражения)
    // В демо-режиме просто уведомляем
    showToast("Матч засчитан! Уведомление отправлено игроку.");
  } else {
    showToast("Состав изменён! Уведомление отправлено игроку.");
  }
  
  reqs.splice(index, 1);
  localStorage.setItem("hltv_admin_requests", JSON.stringify(reqs));
  renderAdminRequests();
}

function rejectRequest(index) {
  var reqs = JSON.parse(localStorage.getItem("hltv_admin_requests")) || [];
  reqs.splice(index, 1);
  localStorage.setItem("hltv_admin_requests", JSON.stringify(reqs));
  showToast("Заявка отклонена. Уведомление отправлено.");
  renderAdminRequests();
}