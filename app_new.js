const API_URL = "https://snowboard-prague-deutsch-field.trycloudflare.com";
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
  } else if (tab === "admin") {
    if (sessionStorage.getItem("isAdmin") === "true") {
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
        '<div class="info"><div class="name">' + t.name + ' <span class="team-tag">' + (t.tag || "") + '</span></div>' +
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
    return '<tr><td><div class="player-cell">' + pAvatar + '<div><span class="player-nick">' + p.nick + '</span>' + (p.role ? '<span class="role-badge">' + p.role + '</span>' : '') + '</div></div></td>' +
           '<td>' + p.kills + '</td><td>' + p.deaths + '</td><td style="color:var(--accent)">' + kd + '</td><td>' + p.hs + '%</td><td>' + p.rating.toFixed(2) + '</td></tr>';
  }).join('');

  document.getElementById("team-detail-content").innerHTML = 
    '<div class="team-header animate-in">' + teamAvatar + '<div class="team-title-info"><h2>' + team.name + ' <span class="team-tag">' + (team.tag || "") + '</span></h2><p>Рейтинг команды</p></div></div>' +
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
  var container = document.getElementById("news-content");
  container.innerHTML = '<p style="color:var(--muted); font-size:14px; margin-bottom:16px;">Отправьте заявку на изменение состава или новость.</p>' +
    '<div class="form-group"><label>Команда</label><input type="text" id="n-team" class="form-control" placeholder="Название вашей команды"></div>' +
    '<div class="form-group"><label>Текст изменения</label><textarea id="n-text" class="form-control" rows="4" placeholder="+S1mple&#10;-Nico"></textarea></div>' +
    '<div class="form-group"><label>Фото (необязательно)</label><div class="file-upload-wrapper" onclick="document.getElementById(\'n-photo\').click()"><img id="n-photo-preview" class="file-upload-preview"><div class="file-upload-label">Прикрепить фото</div><input type="file" id="n-photo" accept="image/*" onchange="previewImage(this, \'n-photo-preview\')"></div></div>' +
    '<button class="btn" onclick="submitNewsRequest()">Отправить админу</button>';
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
    sessionStorage.setItem("isAdmin", "true");
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
      '<div style="display:flex; gap:5px;"><button class="btn" style="margin:0; padding:6px 10px; font-size:12px;" onclick="editTeamAdmin(\'' + t.name + '\')">Ред.</button><button class="btn btn-red" style="margin:0; padding:6px 10px; font-size:12px;" onclick="deleteTeamAdmin(\'' + t.name + '\')">Удал.</button></div></div>';
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

function editTeamAdmin(name) { alert("Функция редактирования в разработке"); }
function deleteTeamAdmin(name) { alert("Функция удаления в разработке"); }
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
  document.getElementById("screen-matches-list").classList.add("hidden");
  document.getElementById("screen-match-detail").classList.remove("hidden");
  var t1Win = m.team1.score > m.team2.score;
  var t2Win = m.team2.score > m.team1.score;
  var mapImg = 'maps/' + m.map.toLowerCase().replace("de_", "").trim() + '.jpg';
  
  function renderTable(team, isW) {
    return '<div class="table-wrapper"><div style="padding:12px 16px; font-weight:700; display:flex; justify-content:space-between; border-bottom:1px solid var(--border); background:rgba(0,0,0,0.1);"><span style="color:' + (isW ? 'var(--win)' : 'var(--text)') + '">' + team.name + '</span></div>' +
      '<table><thead><tr><th>Игрок</th><th>Убийства</th><th>К/Д</th><th>HS%</th></tr></thead><tbody>' +
      team.players.map(function(p) { return '<tr><td><div class="player-cell"><div class="player-avatar">' + p.nick.charAt(0) + '</div><div>' + p.nick + '</div></div></td><td>' + p.kills + '</td><td>' + (p.kills/(p.deaths||1)).toFixed(2) + '</td><td>' + p.hs + '%</td></tr>'; }).join('') +
      '</tbody></table></div>';
  }

  document.getElementById("match-detail-content").innerHTML = '<div class="match-header-card" style="background-image: url(\'' + mapImg + '\');">' +
    '<div class="score-board"><div class="score-display"><span class="' + (t1Win?'win':'lose') + '">' + m.team1.score + '</span> : <span class="' + (t2Win?'win':'lose') + '">' + m.team2.score + '</span></div></div></div>' +
    renderTable(m.team1, t1Win) + renderTable(m.team2, t2Win);
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
