const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

let userProfile = JSON.parse(localStorage.getItem("hltv_user"));

window.onload = () => {
  setTimeout(() => {
    document.getElementById("splash-screen").style.opacity = "0";
    setTimeout(() => {
      document.getElementById("splash-screen").style.display = "none";
      
      if (!userProfile) {
        document.getElementById("register-screen").style.display = "flex";
      } else {
        document.getElementById("register-screen").style.display = "none";
        document.getElementById("app-container").style.display = "flex";
        switchTab('ranking');
      }
    }, 500);
  }, 1500);
};

function registerUser() {
  const nick = document.getElementById("reg-nick").value;
  const tgId = document.getElementById("reg-id").value || "12345678";
  if (!nick) return alert("Введите ник!");
  userProfile = { name: nick, tgId: tgId, role: "Игрок", avatar: "https://ui-avatars.com/api/?name=" + nick + "&background=8b5cf6&color=fff", kd: 1.00, avg: 0.0 };
  localStorage.setItem("hltv_user", JSON.stringify(userProfile));
  document.getElementById("register-screen").style.display = "none";
  document.getElementById("app-container").style.display = "flex";
  switchTab('ranking');
}

function toggleMenu() {
  document.getElementById("sidebar").classList.toggle("open");
  document.getElementById("overlay").classList.toggle("open");
}

function switchTab(tab) {
  document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));
  document.getElementById(`nav-${tab}`)?.classList.add("active");
  const screens = ["ranking", "team-detail", "matches-list", "match-detail", "profile", "admin-login", "admin-panel"];
  screens.forEach(s => document.getElementById(`screen-${s}`).classList.add("hidden"));

  if (tab === "ranking") {
    document.getElementById("screen-ranking").classList.remove("hidden");
    renderRanking();
  } else if (tab === "matches") {
    document.getElementById("screen-matches-list").classList.remove("hidden");
    renderMatchesList();
  } else if (tab === "profile") {
    document.getElementById("screen-profile").classList.remove("hidden");
    renderProfile();
  } else if (tab === "admin") {
    if (sessionStorage.getItem("isAdmin") === "true") {
      document.getElementById("screen-admin-panel").classList.remove("hidden");
    } else {
      document.getElementById("screen-admin-login").classList.remove("hidden");
    }
  }
  if (window.innerWidth <= 768) toggleMenu();
}

function renderRanking() {
  const container = document.getElementById("ranking-container");
  let html = "";
  DATA.teams.sort((a,b)=>b.points-a.points).forEach((t,i)=>{
    let teamAvatar = t.avatar ? `<img src="${t.avatar}" class="avatar">` : `<div class="avatar">${t.name.charAt(0)}</div>`;
    html += `
      <div class="card" onclick="showTeamDetail('${t.name}')">
        <div class="card-num">${i+1}</div>
        ${teamAvatar}
        <div class="info">
          <div class="name">${t.name}</div>
          <div class="sub">${t.wins + t.losses} матчей</div>
        </div>
        <div class="points">${t.points} PTS</div>
      </div>
    `;
  });
  container.innerHTML = html;
}

function showTeamDetail(name) {
  const team = DATA.teams.find(t => t.name === name);
  if (!team) return;
  document.getElementById("screen-ranking").classList.add("hidden");
  document.getElementById("screen-team-detail").classList.remove("hidden");
  let teamAvatar = team.avatar ? `<img src="${team.avatar}" class="team-big-logo">` : `<div class="team-big-logo">${team.name.charAt(0)}</div>`;
  document.getElementById("team-detail-content").innerHTML = `
    <div class="team-header">
      ${teamAvatar}
      <div class="team-title-info"><h2>${team.name}</h2><p>Рейтинг команды</p></div>
    </div>
    <div class="team-stats-row">
      <div class="team-stat-box"><div class="val" style="color:var(--accent)">${team.points}</div><div class="lbl">Поинты</div></div>
      <div class="team-stat-box"><div class="val" style="color:var(--win)">${team.wins}</div><div class="lbl">Победы</div></div>
      <div class="team-stat-box"><div class="val" style="color:var(--lose)">${team.losses}</div><div class="lbl">Поражения</div></div>
    </div>
    <div class="table-wrapper">
      <table>
        <thead><tr><th>Игрок</th><th>Убийства</th><th>Смерти</th><th>К/Д</th><th>HS%</th><th>AVG</th></tr></thead>
        <tbody>
          ${team.players.map(p => {
            const kd = (p.kills / (p.deaths || 1)).toFixed(2);
            let pAvatar = p.avatar ? `<img src="${p.avatar}" class="player-avatar">` : `<div class="player-avatar">${p.nick.charAt(0)}</div>`;
            return `
              <tr>
                <td><div class="player-cell">${pAvatar}<div><span class="player-nick">${p.nick}</span>${p.role ? `<span class="role-badge">${p.role}</span>` : ''}</div></div></td>
                <td>${p.kills}</td><td>${p.deaths}</td><td style="color:var(--accent)">${kd}</td><td>${p.hs}%</td><td>${p.rating.toFixed(2)}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderMatchesList() {
  const container = document.getElementById("matches-container");
  let html = "";
  const getMapImage = (mapName) => `maps/${mapName.toLowerCase().replace("de_", "").trim()}.jpg`;

  DATA.matches.forEach(m => {
    const t1Win = m.team1.score > m.team2.score;
    const t2Win = m.team2.score > m.team1.score;
    const mapImg = getMapImage(m.map);

    html += `
      <div class="match-card-img" onclick="showMatchDetail(${m.id})">
        <div class="match-map-bg" style="background-image: url('${mapImg}'), linear-gradient(135deg,#1e1b4b,#0f172a);">
          <div class="match-map-content">
            <div class="match-team-name" style="color:${t1Win ? 'var(--win)' : 'var(--text)'}">${m.team1.name}</div>
            <div class="match-score-big">${m.team1.score} : ${m.team2.score}</div>
            <div class="match-team-name" style="color:${t2Win ? 'var(--win)' : 'var(--text)'}">${m.team2.name}</div>
          </div>
        </div>
        <div class="match-card-footer">
          <span style="text-transform:uppercase; letter-spacing:1px; font-size:11px;">${m.map}</span>
          <span style="color:var(--accent)">Сыгран</span>
        </div>
      </div>
    `;
  });
  container.innerHTML = html || '<p style="color:var(--muted)">Матчей нет</p>';
}

// ОБНОВЛЕННАЯ ФУНКЦИЯ ДЕТАЛЕЙ МАТЧА
function showMatchDetail(id) {
  const m = DATA.matches.find(x => x.id === id);
  if (!m) return;

  document.getElementById("screen-matches-list").classList.add("hidden");
  document.getElementById("screen-match-detail").classList.remove("hidden");

  const t1Win = m.team1.score > m.team2.score;
  const t2Win = m.team2.score > m.team1.score;
  const mapImg = `maps/${m.map.toLowerCase().replace("de_", "").trim()}.jpg`;

  const renderTeamTable = (team, isWinner) => `
    <div class="table-wrapper">
      <div style="padding:12px 16px; font-weight:700; display:flex; justify-content:space-between; border-bottom:1px solid var(--border); background:rgba(0,0,0,0.1);">
        <span style="color:${isWinner ? 'var(--win)' : 'var(--text)'}">${team.name}</span>
        <span style="color:var(--muted); font-size:12px;">${isWinner ? 'Победа' : 'Поражение'}</span>
      </div>
      <table>
        <thead><tr><th>Игрок</th><th>Убийства</th><th>К/Д</th><th>HS%</th></tr></thead>
        <tbody>
          ${team.players.map(p => `
            <tr>
              <td><div class="player-cell"><div class="player-avatar">${p.nick.charAt(0)}</div><div class="player-nick">${p.nick}</div></div></td>
              <td>${p.kills}</td><td style="color:var(--accent)">${(p.kills/(p.deaths||1)).toFixed(2)}</td><td>${p.hs}%</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  document.getElementById("match-detail-content").innerHTML = `
    <div class="match-header-card" style="background-image: url('${mapImg}');">
      <div class="match-header-content">
        <div class="match-top-info">
          <span>${m.map}</span>
          <span style="color:var(--accent)">Завершен</span>
        </div>
        <div class="score-board">
          <div class="team-block">
            <div class="name" style="color:${t1Win ? 'var(--win)' : 'var(--text)'}">${m.team1.name}</div>
          </div>
          <div class="score-display">
            <span class="${t1Win ? 'win' : 'lose'}">${m.team1.score}</span>
            <span style="background:transparent; border:none; color:var(--muted); font-size:24px;">:</span>
            <span class="${t2Win ? 'win' : 'lose'}">${m.team2.score}</span>
          </div>
          <div class="team-block">
            <div class="name" style="color:${t2Win ? 'var(--win)' : 'var(--text)'}">${m.team2.name}</div>
          </div>
        </div>
      </div>
    </div>
    ${renderTeamTable(m.team1, t1Win)}
    ${renderTeamTable(m.team2, t2Win)}
  `;
}

function renderProfile() {
  if (!userProfile) return;
  document.getElementById("profile-name").innerText = userProfile.name;
  document.getElementById("profile-role").innerText = userProfile.role;
  document.getElementById("profile-avatar-img").src = userProfile.avatar;
  document.getElementById("profile-kd").innerText = userProfile.kd.toFixed(2);
  document.getElementById("profile-avg").innerText = userProfile.avg.toFixed(1);
}

function changeMyAvatar(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      userProfile.avatar = e.target.result;
      localStorage.setItem("hltv_user", JSON.stringify(userProfile));
      renderProfile();
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function loginAdmin() {
  const pass = document.getElementById("admin-pass").value;
  if (pass === "hltv26") {
    sessionStorage.setItem("isAdmin", "true");
    document.getElementById("screen-admin-login").classList.add("hidden");
    document.getElementById("screen-admin-panel").classList.remove("hidden");
  } else {
    document.getElementById("admin-err").innerText = "Неверный пароль";
  }
}

function showAdminForm(type) {
  const container = document.getElementById("admin-form-container");
  const fileUploadHtml = (id, label) => `
    <div class="form-group">
      <label>${label}</label>
      <div class="file-upload-wrapper" onclick="document.getElementById('${id}').click()">
        <img id="${id}-preview" class="file-upload-preview" src="" style="display:none;">
        <div class="file-upload-label">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
          Выбрать из галереи
        </div>
        <input type="file" id="${id}" accept="image/*" onchange="previewImage(this, '${id}-preview')">
      </div>
    </div>
  `;

  if (type === 'team') {
    container.innerHTML = `
      <h3 style="margin-bottom:16px;">Добавить команду</h3>
      <div class="form-group"><label>Название</label><input type="text" id="t-name" class="form-control" placeholder="Например: NAVI"></div>
      <div class="form-group"><label>Поинты</label><input type="number" id="t-points" class="form-control" value="0"></div>
      ${fileUploadHtml('t-avatar-file', 'Логотип команды')}
      <button class="btn" onclick="addTeam()">Добавить команду</button>
    `;
  } else if (type === 'player') {
    const options = DATA.teams.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
    container.innerHTML = `
      <h3 style="margin-bottom:16px;">Добавить игрока</h3>
      <div class="form-group"><label>Команда</label><select id="p-team" class="form-control">${options}</select></div>
      <div class="form-group"><label>Ник</label><input type="text" id="p-nick" class="form-control" placeholder="s1mple"></div>
      <div class="form-group">
        <label>Роль</label>
        <select id="p-role" class="form-control">
          <option value="Снайпер">Снайпер (AWP)</option>
          <option value="Капитан">Капитан (IGL)</option>
          <option value="Штурмовик">Штурмовик (Entry)</option>
          <option value="Поддержка">Поддержка (Support)</option>
          <option value="Люркер">Люркер (Lurker)</option>
        </select>
      </div>
      ${fileUploadHtml('p-avatar-file', 'Аватарка игрока')}
      <button class="btn" onclick="addPlayer()">Добавить игрока</button>
    `;
  } else if (type === 'match') {
    const options = DATA.teams.map(t => `<option value="${t.name}">${t.name}</option>`).join('');
    container.innerHTML = `
      <h3 style="margin-bottom:16px;">Добавить матч</h3>
      <div class="form-group"><label>Карта (например: mirage, inferno, ancient)</label><input type="text" id="m-map" class="form-control" value="mirage"></div>
      <div style="display:flex; gap:10px;">
        <div class="form-group" style="flex:1;"><label>Команда 1</label><select id="m-t1" class="form-control">${options}</select></div>
        <div class="form-group" style="width:80px;"><label>Счет</label><input type="number" id="m-s1" class="form-control" value="0"></div>
      </div>
      <div style="display:flex; gap:10px;">
        <div class="form-group" style="flex:1;"><label>Команда 2</label><select id="m-t2" class="form-control">${options}</select></div>
        <div class="form-group" style="width:80px;"><label>Счет</label><input type="number" id="m-s2" class="form-control" value="0"></div>
      </div>
      <button class="btn" onclick="addMatch()">Добавить матч</button>
    `;
  }
}

function previewImage(input, previewId) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = document.getElementById(previewId);
      img.src = e.target.result;
      img.style.display = 'block';
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function getBase64(inputId) {
  const img = document.getElementById(inputId + '-preview');
  return img && img.src ? img.src : "";
}

function addTeam() {
  const name = document.getElementById("t-name").value;
  const points = parseInt(document.getElementById("t-points").value) || 0;
  const avatar = getBase64('t-avatar-file');
  if (!name) return alert("Введите название");
  DATA.teams.push({ id: Date.now(), name, points, wins: 0, losses: 0, avatar, players: [] });
  alert("Команда добавлена!");
  showAdminForm('team');
}

function addPlayer() {
  const teamId = parseInt(document.getElementById("p-team").value);
  const nick = document.getElementById("p-nick").value;
  const role = document.getElementById("p-role").value;
  const avatar = getBase64('p-avatar-file');
  if (!nick) return alert("Введите ник");
  const team = DATA.teams.find(t => t.id === teamId);
  if (team) {
    team.players.push({ nick, role, kills: 0, deaths: 0, hs: 0, rating: 1.0, avatar });
    alert("Игрок добавлен!");
    showAdminForm('player');
  }
}

function addMatch() {
  const map = document.getElementById("m-map").value;
  const t1Name = document.getElementById("m-t1").value;
  const t2Name = document.getElementById("m-t2").value;
  const s1 = parseInt(document.getElementById("m-s1").value) || 0;
  const s2 = parseInt(document.getElementById("m-s2").value) || 0;
  const t1 = DATA.teams.find(t => t.name === t1Name);
  const t2 = DATA.teams.find(t => t.name === t2Name);
  if (!t1 || !t2) return alert("Выберите команды");

  DATA.matches.push({
    id: Date.now(), map, 
    team1: { name: t1.name, score: s1, players: t1.players },
    team2: { name: t2.name, score: s2, players: t2.players }
  });
  alert("Матч добавлен!");
  showAdminForm('match');
}
