// Flag emoji mapping for all 48 World Cup teams
const TEAM_FLAGS = {
  "Alemania": "🇩🇪",
  "Arabia Saudita": "🇸🇦",
  "Argelia": "🇩🇿",
  "Argentina": "🇦🇷",
  "Australia": "🇦🇺",
  "Austria": "🇦🇹",
  "Bosnia y Herzegovina": "🇧🇦",
  "Brasil": "🇧🇷",
  "Bélgica": "🇧🇪",
  "Cabo Verde": "🇨🇻",
  "Canadá": "🇨🇦",
  "Catar": "🇶🇦",
  "Colombia": "🇨🇴",
  "Corea del Sur": "🇰🇷",
  "Costa de Marfil": "🇨🇮",
  "Croacia": "🇭🇷",
  "Curazao": "🇨🇼",
  "Ecuador": "🇪🇨",
  "Egipto": "🇪🇬",
  "Escocia": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "España": "🇪🇸",
  "Estados Unidos": "🇺🇸",
  "Francia": "🇫🇷",
  "Ghana": "🇬🇭",
  "Haití": "🇭🇹",
  "Inglaterra": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "Irak": "🇮🇶",
  "Irán": "🇮🇷",
  "Japón": "🇯🇵",
  "Jordania": "🇯🇴",
  "Marruecos": "🇲🇦",
  "México": "🇲🇽",
  "Noruega": "🇳🇴",
  "Nueva Zelanda": "🇳🇿",
  "Panamá": "🇵🇦",
  "Paraguay": "🇵🇾",
  "Países Bajos": "🇳🇱",
  "Portugal": "🇵🇹",
  "RD Congo": "🇨🇩",
  "República Checa": "🇨🇿",
  "Senegal": "🇸🇳",
  "Sudáfrica": "🇿🇦",
  "Suecia": "🇸🇪",
  "Suiza": "🇨🇭",
  "Turquía": "🇹🇷",
  "Túnez": "🇹🇳",
  "Uruguay": "🇺🇾",
  "Uzbekistán": "🇺🇿"
};

// Helper to format team name with flag emoji
function getTeamDisplayName(name) {
  if (!name) return "";
  const flag = TEAM_FLAGS[name];
  return flag ? `${flag} ${name}` : name;
}

// Helper to check if a group has finished all its matches (all 6 fixtures scored)
function isGroupComplete(grp) {
  const groupFixtures = FIXTURES.filter(m => m.group === grp);
  if (groupFixtures.length === 0) return false;
  return groupFixtures.every(m => {
    const score = actualScores[m.matchNum];
    return score && score.gh !== "" && score.ga !== "" && score.gh !== undefined && score.ga !== undefined;
  });
}

// State variables
const KO_MATCH_1X2_POINTS = 1;
const KO_PENALTY_EXACT_POINTS = 1;

let actualScores = {}; // Key: matchNum (1-104), Value: { gh, ga, penaltyWinner, penh, pena }
let actualExtras = {
  pichichi: "",
  mvp: "",
  champion: "",
  subchampion: "",
  thirdPlace: ""
};

// Global variables populated from evaluateTournament
let computedActualGroups = {}; // Standing order for each group
let computedQualifiers = {
  dieciseis: [], // 32 teams
  octavos: [],   // 16 teams
  cuartos: [],   // 8 teams
  semis: [],     // 4 teams
  finals: [],    // 2 finalists
  match34: [],   // 2 teams for 3rd place
  thirdPlace: "",
  champion: "",
  subchampion: ""
};

// List of matches in the dynamic knockout stages (Matches 73 to 104)
// We structure them with parent IDs and slot definitions
let knockoutFixtures = {
  // Round of 32 (1/16) - Matches 73 to 88
  73: { matchNum: 73, stage: "1/16", homeSource: "2A", awaySource: "2B", home: "", away: "" },
  74: { matchNum: 74, stage: "1/16", homeSource: "1C", awaySource: "2F", home: "", away: "" },
  75: { matchNum: 75, stage: "1/16", homeSource: "1E", awaySource: "3rd_idx6", home: "", away: "" },
  76: { matchNum: 76, stage: "1/16", homeSource: "1F", awaySource: "2C", home: "", away: "" },
  77: { matchNum: 77, stage: "1/16", homeSource: "2E", awaySource: "2I", home: "", away: "" },
  78: { matchNum: 78, stage: "1/16", homeSource: "1I", awaySource: "3rd_idx1", home: "", away: "" },
  79: { matchNum: 79, stage: "1/16", homeSource: "1A", awaySource: "3rd_idx2", home: "", away: "" },
  80: { matchNum: 80, stage: "1/16", homeSource: "1L", awaySource: "3rd_idx0", home: "", away: "" },
  81: { matchNum: 81, stage: "1/16", homeSource: "1G", awaySource: "3rd_idx7", home: "", away: "" },
  82: { matchNum: 82, stage: "1/16", homeSource: "1D", awaySource: "3rd_idx4", home: "", away: "" },
  83: { matchNum: 83, stage: "1/16", homeSource: "1H", awaySource: "2J", home: "", away: "" },
  84: { matchNum: 84, stage: "1/16", homeSource: "2K", awaySource: "2L", home: "", away: "" },
  85: { matchNum: 85, stage: "1/16", homeSource: "1B", awaySource: "3rd_idx5", home: "", away: "" },
  86: { matchNum: 86, stage: "1/16", homeSource: "2D", awaySource: "2G", home: "", away: "" },
  87: { matchNum: 87, stage: "1/16", homeSource: "1J", awaySource: "2H", home: "", away: "" },
  88: { matchNum: 88, stage: "1/16", homeSource: "1K", awaySource: "3rd_idx3", home: "", away: "" },

  // Round of 16 (1/8) - Matches 89 to 96
  89: { matchNum: 89, stage: "1/8", homeSource: "W73", awaySource: "W76", home: "", away: "" },
  90: { matchNum: 90, stage: "1/8", homeSource: "W75", awaySource: "W78", home: "", away: "" },
  91: { matchNum: 91, stage: "1/8", homeSource: "W74", awaySource: "W77", home: "", away: "" },
  92: { matchNum: 92, stage: "1/8", homeSource: "W79", awaySource: "W80", home: "", away: "" },
  93: { matchNum: 93, stage: "1/8", homeSource: "W83", awaySource: "W84", home: "", away: "" },
  94: { matchNum: 94, stage: "1/8", homeSource: "W81", awaySource: "W82", home: "", away: "" },
  95: { matchNum: 95, stage: "1/8", homeSource: "W86", awaySource: "W87", home: "", away: "" },
  96: { matchNum: 96, stage: "1/8", homeSource: "W85", awaySource: "W88", home: "", away: "" },

  // Quarterfinals (1/4) - Matches 97 to 100
  97: { matchNum: 97, stage: "1/4", homeSource: "W89", awaySource: "W90", home: "", away: "" },
  98: { matchNum: 98, stage: "1/4", homeSource: "W93", awaySource: "W94", home: "", away: "" },
  99: { matchNum: 99, stage: "1/4", homeSource: "W91", awaySource: "W92", home: "", away: "" },
  100: { matchNum: 100, stage: "1/4", homeSource: "W95", awaySource: "W96", home: "", away: "" },

  // Semifinals (1/2) - Matches 101 to 102
  101: { matchNum: 101, stage: "1/2", homeSource: "W97", awaySource: "W98", home: "", away: "" },
  102: { matchNum: 102, stage: "1/2", homeSource: "W99", awaySource: "W100", home: "", away: "" },

  // 3rd place match - Match 103
  103: { matchNum: 103, stage: "3-4", homeSource: "L101", awaySource: "L102", home: "", away: "" },

  // Final - Match 104
  104: { matchNum: 104, stage: "final", homeSource: "W101", awaySource: "W102", home: "", away: "" }
};

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

async function initApp() {
  // 1. Load actualScores and actualExtras from localStorage if available (as fallback)
  const storedScores = localStorage.getItem("wc2026_actual_scores");
  const storedExtras = localStorage.getItem("wc2026_actual_extras");
  if (storedScores) actualScores = JSON.parse(storedScores);
  if (storedExtras) actualExtras = JSON.parse(storedExtras);

  // Fetch official data from the backend
  try {
    const res = await fetch('/api/data');
    if (res.ok) {
      const data = await res.json();
      if (data.scores && Object.keys(data.scores).length > 0) {
        actualScores = data.scores;
        localStorage.setItem("wc2026_actual_scores", JSON.stringify(actualScores));
      }
      if (data.extras) {
        actualExtras = data.extras;
        localStorage.setItem("wc2026_actual_extras", JSON.stringify(actualExtras));
      }
      console.log("Datos oficiales cargados desde la base de datos.");
    }
  } catch (err) {
    console.warn("No se pudo conectar con el servidor, usando datos locales:", err.message);
  }

  // Check URL Hash for simulated scenario
  const loadedHash = deserializeScores(window.location.hash);
  if (loadedHash) {
    showSimulatedBanner();
  }

  // 2. Tab Navigation
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      tabPanels.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const tabId = btn.getAttribute("data-tab");
      document.getElementById(tabId).classList.add("active");
      
      // Special render when switching to bracket tab
      if (tabId === "tab-bracket") {
        renderBracket();
      }
    });
  });

  // 3. Setup Simulator Filters
  const filterStage = document.getElementById("filter-stage");
  const filterGroup = document.getElementById("filter-group");
  
  filterStage.addEventListener("change", () => {
    if (filterStage.value === "group") {
      filterGroup.style.display = "inline-flex";
    } else {
      filterGroup.style.display = "none";
      filterGroup.value = "all";
    }
    renderSimulatorMatches();
  });

  filterGroup.addEventListener("change", () => {
    renderSimulatorMatches();
  });

  // 4. Register Simulator Action Buttons
  document.getElementById("btn-load-mock").addEventListener("click", loadMockResults);
  document.getElementById("btn-load-all-groups").addEventListener("click", loadAllGroupResults);
  document.getElementById("btn-clear-scores").addEventListener("click", clearAllScores);
  document.getElementById("btn-export-scores").addEventListener("click", exportScores);
  document.getElementById("btn-import-scores").addEventListener("click", importScores);

  // 5. Populate Contender Select Dropdowns
  const selectUser = document.getElementById("select-user");
  const selectBracketUser = document.getElementById("select-bracket-user");
  CONTENDERS.forEach(user => {
    const opt = document.createElement("option");
    opt.value = user;
    opt.textContent = user;
    selectUser.appendChild(opt);

    if (selectBracketUser) {
      const optB = document.createElement("option");
      optB.value = user;
      optB.textContent = user;
      selectBracketUser.appendChild(optB);
    }
  });
  
  selectUser.addEventListener("change", renderUserPredictions);

  // 5b. Setup Calendar Navigation Buttons
  document.getElementById("btn-prev-day").addEventListener("click", () => changeCalendarDay(-1));
  document.getElementById("btn-next-day").addEventListener("click", () => changeCalendarDay(1));
  document.getElementById("btn-today-day").addEventListener("click", () => {
    selectedCalendarDate = "2026-06-14";
    renderCalendarTab();
  });

  // 6. Setup Admin Portal Listeners
  setupAdminPortal();

  // 7. Evaluate initial tournament standing
  evaluateTournament();
}

// Render Simulator Match List
function renderSimulatorMatches() {
  const container = document.getElementById("sim-matches-list");
  container.innerHTML = "";

  const stageFilter = document.getElementById("filter-stage").value;
  const groupFilter = document.getElementById("filter-group").value;

  // Group stage matches (1-72)
  if (stageFilter === "all" || stageFilter === "group") {
    FIXTURES.forEach(match => {
      if (groupFilter !== "all" && match.group !== groupFilter) return;

      const card = createMatchCard(match.matchNum, `Grupo ${match.group}`, match.home, match.away, match.date);
      container.appendChild(card);
    });
  }

  // Knockout matches (73-104)
  if (stageFilter === "all" || stageFilter !== "group") {
    const sortedKo = Object.values(knockoutFixtures).sort((a, b) => a.matchNum - b.matchNum);
    sortedKo.forEach(match => {
      // Stage filters
      if (stageFilter !== "all") {
        if (stageFilter === "1/16" && match.stage !== "1/16") return;
        if (stageFilter === "1/8" && match.stage !== "1/8") return;
        if (stageFilter === "1/4" && match.stage !== "1/4") return;
        if (stageFilter === "1/2" && match.stage !== "1/2") return;
        if (stageFilter === "final" && match.stage !== "final" && match.stage !== "3-4") return;
      }

      // Check if team names are resolved yet
      const homeTeam = match.home || `Ganador/Pos. ${match.homeSource}`;
      const awayTeam = match.away || `Ganador/Pos. ${match.awaySource}`;

      const card = createMatchCard(match.matchNum, getStageName(match.stage), homeTeam, awayTeam, getKoMatchDate(match.matchNum), true);
      container.appendChild(card);
    });
  }
  
  if (container.children.length === 0) {
    container.innerHTML = `<p style="padding: 2rem; text-align: center; color: var(--text-muted);">No hay partidos que coincidan con los filtros.</p>`;
  }
}

// Get clean stage label
function getStageName(stage) {
  if (stage === "1/16") return "Dieciseisavos (1/16)";
  if (stage === "1/8") return "Octavos (1/8)";
  if (stage === "1/4") return "Cuartos (1/4)";
  if (stage === "1/2") return "Semifinal";
  if (stage === "3-4") return "3º y 4º puesto";
  if (stage === "final") return "Gran Final";
  return stage;
}

// Dates for KO matches (fictional approximate dates)
function getKoMatchDate(matchNum) {
  // Round of 32: Matches 73 to 88 (June 28 - July 1)
  if (matchNum >= 73 && matchNum <= 76) return "2026-06-28 21:00";
  if (matchNum >= 77 && matchNum <= 80) return "2026-06-29 21:00";
  if (matchNum >= 81 && matchNum <= 84) return "2026-06-30 21:00";
  if (matchNum >= 85 && matchNum <= 88) return "2026-07-01 21:00";

  // Round of 16: Matches 89 to 96 (July 4 - July 7)
  if (matchNum >= 89 && matchNum <= 90) return "2026-07-04 20:00";
  if (matchNum >= 91 && matchNum <= 92) return "2026-07-05 20:00";
  if (matchNum >= 93 && matchNum <= 94) return "2026-07-06 20:00";
  if (matchNum >= 95 && matchNum <= 96) return "2026-07-07 20:00";

  // Quarterfinals: Matches 97 to 100 (July 9 - July 11)
  if (matchNum === 97) return "2026-07-09 22:00";
  if (matchNum === 98) return "2026-07-10 22:00";
  if (matchNum >= 99 && matchNum <= 100) return "2026-07-11 22:00";

  // Semifinals: Matches 101 to 102 (July 14 - July 15)
  if (matchNum === 101) return "2026-07-14 21:00";
  if (matchNum === 102) return "2026-07-15 21:00";

  // 3rd place: Match 103 (July 18)
  if (matchNum === 103) return "2026-07-18 23:00";

  // Final: Match 104 (July 19)
  if (matchNum === 104) return "2026-07-19 21:00";

  return "";
}

// Helper to create a single Match Card DOM element
function createMatchCard(id, stageLabel, homeName, awayName, dateStr, isKnockout = false) {
  const card = document.createElement("div");
  card.className = "match-card";
  
  const score = actualScores[id] || { gh: "", ga: "", penaltyWinner: "", penh: "", pena: "" };

  const metaHtml = `
    <div class="match-meta">
      <div style="font-weight:700; color:var(--primary); font-size:0.8rem;">#${id} - ${stageLabel}</div>
      <div style="font-size:0.7rem; margin-top:0.1rem;">${dateStr}</div>
    </div>
  `;

  // Draw penalty selector if goals are equal and it's a knockout match
  const isDraw = score.gh !== "" && score.ga !== "" && score.gh == score.ga;
  const showPenaltySelect = isKnockout && isDraw;
  
  let penaltySelectHtml = "";
  if (showPenaltySelect) {
    const penhVal = score.penh !== undefined && score.penh !== null ? score.penh : "";
    const penaVal = score.pena !== undefined && score.pena !== null ? score.pena : "";
    
    penaltySelectHtml = `
      <div style="display:flex; flex-direction:column; align-items:center; gap:0.2rem; margin-left:0.5rem;">
        <span style="font-size:0.6rem; color:var(--text-muted); text-transform:uppercase;">Penaltis</span>
        <div style="display:flex; align-items:center; gap:0.1rem;">
          <input type="number" min="0" class="score-input" style="width:2.2rem; height:1.6rem; font-size:0.75rem; text-align:center;" value="${penhVal}" oninput="handlePenaltyScoreChange(${id}, 'penh', this.value)" placeholder="H">
          <span>-</span>
          <input type="number" min="0" class="score-input" style="width:2.2rem; height:1.6rem; font-size:0.75rem; text-align:center;" value="${penaVal}" oninput="handlePenaltyScoreChange(${id}, 'pena', this.value)" placeholder="A">
        </div>
      </div>
    `;
  }

  card.innerHTML = `
    ${metaHtml}
    <div style="display:flex; align-items:center; flex:1; justify-content:center;">
      <span class="match-team">${getTeamDisplayName(homeName)}</span>
      <div class="match-score-inputs">
        <input type="number" min="0" class="score-input" value="${score.gh}" oninput="handleScoreChange(${id}, 'gh', this.value)">
        <span class="score-divider">-</span>
        <input type="number" min="0" class="score-input" value="${score.ga}" oninput="handleScoreChange(${id}, 'ga', this.value)">
      </div>
      <span class="match-team away">${getTeamDisplayName(awayName)}</span>
      ${penaltySelectHtml}
    </div>
  `;

  return card;
}

// Handle penalty score changes
window.handlePenaltyScoreChange = function(id, type, val) {
  if (!actualScores[id]) actualScores[id] = { gh: "", ga: "", penaltyWinner: "", penh: "", pena: "" };
  
  if (val === "") {
    actualScores[id][type] = "";
  } else {
    actualScores[id][type] = parseInt(val);
  }

  // Automatically determine penaltyWinner based on penalty score
  const ph = actualScores[id].penh;
  const pa = actualScores[id].pena;
  if (ph !== "" && pa !== "" && ph !== undefined && pa !== undefined && ph !== null && pa !== null) {
    if (ph > pa) {
      actualScores[id].penaltyWinner = "home";
    } else if (ph < pa) {
      actualScores[id].penaltyWinner = "away";
    } else {
      actualScores[id].penaltyWinner = "";
    }
  } else {
    actualScores[id].penaltyWinner = "";
  }

  localStorage.setItem("wc2026_actual_scores", JSON.stringify(actualScores));
  evaluateTournament();
};

// Handle match score changes in the simulator
window.handleScoreChange = function(id, type, val) {
  if (!actualScores[id]) actualScores[id] = { gh: "", ga: "", penaltyWinner: "", penh: "", pena: "" };
  
  if (val === "") {
    actualScores[id][type] = "";
  } else {
    actualScores[id][type] = parseInt(val);
  }

  // Clear penalty winner and penalty scores if scores are no longer equal
  if (actualScores[id].gh != actualScores[id].ga) {
    actualScores[id].penaltyWinner = "";
    actualScores[id].penh = "";
    actualScores[id].pena = "";
  }

  localStorage.setItem("wc2026_actual_scores", JSON.stringify(actualScores));
  evaluateTournament();
};

// Evaluate the tournament, compute rankings, brackets, and contenders scores
function evaluateTournament() {
  // 1. Reset dynamic bracket data
  Object.keys(knockoutFixtures).forEach(id => {
    knockoutFixtures[id].home = "";
    knockoutFixtures[id].away = "";
  });

  // 2. Compute group tables based on match scores
  let groupStandings = {};
  Object.keys(GROUPS_DATA).forEach(grp => {
    groupStandings[grp] = GROUPS_DATA[grp].map(team => ({
      name: team,
      points: 0,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      gf: 0,
      gc: 0,
      gd: 0
    }));
  });

  // Loop through group stage fixtures (1 to 72)
  FIXTURES.forEach(match => {
    const score = actualScores[match.matchNum];
    if (score && score.gh !== "" && score.ga !== "") {
      const homeTeam = groupStandings[match.group].find(t => t.name === match.home);
      const awayTeam = groupStandings[match.group].find(t => t.name === match.away);

      if (homeTeam && awayTeam) {
        homeTeam.played += 1;
        awayTeam.played += 1;
        homeTeam.gf += score.gh;
        homeTeam.gc += score.ga;
        awayTeam.gf += score.ga;
        awayTeam.gc += score.gh;
        
        if (score.gh > score.ga) {
          homeTeam.points += 3;
          homeTeam.wins += 1;
          awayTeam.losses += 1;
        } else if (score.gh < score.ga) {
          awayTeam.points += 3;
          awayTeam.wins += 1;
          homeTeam.losses += 1;
        } else {
          homeTeam.points += 1;
          awayTeam.points += 1;
          homeTeam.draws += 1;
          awayTeam.draws += 1;
        }
      }
    }
  });

  // Sort group standings and calculate GD
  Object.keys(groupStandings).forEach(grp => {
    groupStandings[grp].forEach(team => {
      team.gd = team.gf - team.gc;
    });

    groupStandings[grp].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return a.name.localeCompare(b.name);
    });
  });

  computedActualGroups = groupStandings;

  // 3. Compute best 3rd place teams
  let thirdPlaces = [];
  Object.keys(groupStandings).forEach(grp => {
    const t = groupStandings[grp][2]; // 3rd team (index 2)
    if (t) {
      thirdPlaces.push({
        group: grp,
        name: t.name,
        points: t.points,
        gd: t.gd,
        gf: t.gf
      });
    }
  });

  thirdPlaces.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.group.localeCompare(b.group);
  });

  // Take top 8 qualifying groups
  const top8ThirdPlaceGroups = thirdPlaces.slice(0, 8).map(t => t.group).sort();
  const combKey = top8ThirdPlaceGroups.join("");

  computedQualifiers.dieciseis = [];
  Object.keys(groupStandings).forEach(grp => {
    computedQualifiers.dieciseis.push(groupStandings[grp][0].name);
    computedQualifiers.dieciseis.push(groupStandings[grp][1].name);
  });
  thirdPlaces.slice(0, 8).forEach(t => {
    computedQualifiers.dieciseis.push(t.name);
  });

  // 4. Populate 1/16 pairing teams based on combination key
  const combinationMapping = COMBINATIONS[combKey];
  
  // Round of 32 Pairing helper
  function getTeamByPlaceholder(placeholder) {
    if (placeholder.startsWith("1") || placeholder.startsWith("2")) {
      const grp = placeholder[1];
      const rank = parseInt(placeholder[0]) - 1;
      return groupStandings[grp][rank]?.name || "";
    } else if (placeholder.startsWith("3rd_idx")) {
      const idx = parseInt(placeholder.split("3rd_idx")[1]);
      if (combinationMapping && combinationMapping[idx]) {
        const grp = combinationMapping[idx];
        return groupStandings[grp][2]?.name || "";
      }
      return "";
    }
    return "";
  }

  // Populate Round of 32 teams
  for (let matchNum = 73; matchNum <= 88; matchNum++) {
    const fixture = knockoutFixtures[matchNum];
    fixture.home = getTeamByPlaceholder(fixture.homeSource);
    fixture.away = getTeamByPlaceholder(fixture.awaySource);
  }

  // 5. Evaluate the knockout progression
  computedQualifiers.octavos = [];
  computedQualifiers.cuartos = [];
  computedQualifiers.semis = [];
  computedQualifiers.finals = [];
  computedQualifiers.match34 = [];
  computedQualifiers.thirdPlace = "";
  computedQualifiers.champion = "";
  computedQualifiers.subchampion = "";

  let playedMatchesCount = 0;

  // Group stage played count
  FIXTURES.forEach(m => {
    const score = actualScores[m.matchNum];
    if (score && score.gh !== "" && score.ga !== "") playedMatchesCount++;
  });

  // Helper to evaluate winner of a knockout match
  function evaluateKoWinner(matchNum) {
    const match = knockoutFixtures[matchNum];
    const score = actualScores[matchNum];
    if (score && score.gh !== "" && score.ga !== "") {
      playedMatchesCount++;
      if (score.gh > score.ga) return match.home;
      if (score.gh < score.ga) return match.away;
      if (score.penaltyWinner === "home") return match.home;
      if (score.penaltyWinner === "away") return match.away;
    }
    return "";
  }

  function evaluateKoLoser(matchNum) {
    const match = knockoutFixtures[matchNum];
    const score = actualScores[matchNum];
    if (score && score.gh !== "" && score.ga !== "") {
      const winTeam = evaluateKoWinner(matchNum);
      if (winTeam === match.home) return match.away;
      if (winTeam === match.away) return match.home;
    }
    return "";
  }

  // Evaluate Round of 32 -> Octavos Qualifiers
  for (let matchNum = 73; matchNum <= 88; matchNum++) {
    const winner = evaluateKoWinner(matchNum);
    if (winner) computedQualifiers.octavos.push(winner);
  }

  // Populate Round of 16 teams
  for (let matchNum = 89; matchNum <= 96; matchNum++) {
    const fixture = knockoutFixtures[matchNum];
    const hNum = parseInt(fixture.homeSource.substring(1));
    const aNum = parseInt(fixture.awaySource.substring(1));
    fixture.home = evaluateKoWinner(hNum);
    fixture.away = evaluateKoWinner(aNum);
  }

  // Evaluate Round of 16 -> Cuartos Qualifiers
  for (let matchNum = 89; matchNum <= 96; matchNum++) {
    const winner = evaluateKoWinner(matchNum);
    if (winner) computedQualifiers.cuartos.push(winner);
  }

  // Populate Quarterfinals teams
  for (let matchNum = 97; matchNum <= 100; matchNum++) {
    const fixture = knockoutFixtures[matchNum];
    const hNum = parseInt(fixture.homeSource.substring(1));
    const aNum = parseInt(fixture.awaySource.substring(1));
    fixture.home = evaluateKoWinner(hNum);
    fixture.away = evaluateKoWinner(aNum);
  }

  // Evaluate Quarterfinals -> Semis Qualifiers
  for (let matchNum = 97; matchNum <= 100; matchNum++) {
    const winner = evaluateKoWinner(matchNum);
    if (winner) computedQualifiers.semis.push(winner);
  }

  // Populate Semifinals teams
  for (let matchNum = 101; matchNum <= 102; matchNum++) {
    const fixture = knockoutFixtures[matchNum];
    const hNum = parseInt(fixture.homeSource.substring(1));
    const aNum = parseInt(fixture.awaySource.substring(1));
    fixture.home = evaluateKoWinner(hNum);
    fixture.away = evaluateKoWinner(aNum);
  }

  // Evaluate Semifinals -> Finalists & 3rd-place Match teams
  for (let matchNum = 101; matchNum <= 102; matchNum++) {
    const winner = evaluateKoWinner(matchNum);
    const loser = evaluateKoLoser(matchNum);
    if (winner) computedQualifiers.finals.push(winner);
    if (loser) computedQualifiers.match34.push(loser);
  }

  // Populate 3rd place match
  knockoutFixtures[103].home = evaluateKoLoser(101);
  knockoutFixtures[103].away = evaluateKoLoser(102);

  // Populate Final match
  knockoutFixtures[104].home = evaluateKoWinner(101);
  knockoutFixtures[104].away = evaluateKoWinner(102);

  // Evaluate 3rd place match winner
  const tWinner = evaluateKoWinner(103);
  if (tWinner) {
    computedQualifiers.thirdPlace = tWinner;
    actualExtras.thirdPlace = tWinner;
  }

  // Evaluate Final winner (Champion & Subchampion)
  const champ = evaluateKoWinner(104);
  const subchamp = evaluateKoLoser(104);
  if (champ) {
    computedQualifiers.champion = champ;
    actualExtras.champion = champ;
  }
  if (subchamp) {
    computedQualifiers.subchampion = subchamp;
    actualExtras.subchampion = subchamp;
  }

  // 6. Calculate points for all contenders
  let leaderboard = CONTENDERS.map(user => {
    let ptsDetail = {
      groupMatches: 0,
      groupStandings: 0,
      octavos: 0,
      cuartos: 0,
      semis: 0,
      finals: 0,
      thirdPlace: 0,
      champion: 0,
      extras: 0,
      koMatches: 0,
      total: 0
    };

    const preds = PREDICTIONS[user];

    // Group matches points (1X2, exact, partial)
    FIXTURES.forEach((match, idx) => {
      const score = actualScores[match.matchNum];
      if (score && score.gh !== "" && score.ga !== "") {
        const pred = preds.groupMatches[match.matchNum];
        
        const actWinner = score.gh > score.ga ? "1" : (score.gh < score.ga ? "2" : "X");
        
        if (pred.winner === actWinner) {
          // Correct 1X2!
          if (pred.gh == score.gh && pred.ga == score.ga) {
            ptsDetail.groupMatches += 3; // Exact match score
          } else if (pred.gh == score.gh || pred.ga == score.ga) {
            ptsDetail.groupMatches += 2; // Exact goals of one team
          } else {
            ptsDetail.groupMatches += 1; // 1X2 winner only
          }
        }
      }
    });

    // Group standings points
    Object.keys(groupStandings).forEach(grp => {
      if (!isGroupComplete(grp)) return;
      const actStandings = groupStandings[grp].map(t => t.name);
      const predStandings = preds.groupRankings[grp];
      
      // Compare 1st place
      if (actStandings[0] && predStandings[0] === actStandings[0]) {
        ptsDetail.groupStandings += 2;
      }
      
      // Compare 2nd, 3rd, 4th places
      for (let pos = 1; pos < 4; pos++) {
        if (actStandings[pos] && predStandings[pos] === actStandings[pos]) {
          ptsDetail.groupStandings += 1;
        }
      }
    });

    // Octavos qualifiers (+2 pts each)
    preds.octavos.forEach(team => {
      if (computedQualifiers.octavos.includes(team)) {
        ptsDetail.octavos += 2;
      }
    });

    // Cuartos qualifiers (+3 pts each)
    preds.cuartos.forEach(team => {
      if (computedQualifiers.cuartos.includes(team)) {
        ptsDetail.cuartos += 3;
      }
    });

    // Semis qualifiers (+5 pts each)
    preds.semis.forEach(team => {
      if (computedQualifiers.semis.includes(team)) {
        ptsDetail.semis += 5;
      }
    });

    // Finalists qualifiers (+8 pts each)
    preds.finalistas.forEach(team => {
      if (computedQualifiers.finals.includes(team)) {
        ptsDetail.finals += 8;
      }
    });

    // 3-4 Match participants qualifiers (+8 pts each)
    preds.match34.forEach(team => {
      if (computedQualifiers.match34.includes(team)) {
        ptsDetail.finals += 8; // Both finalist and 3-4 qualifiers score 8 pts
      }
    });

    // 3rd place winner (+10 pts)
    if (computedQualifiers.thirdPlace && preds.thirdPlace === computedQualifiers.thirdPlace) {
      ptsDetail.thirdPlace += 10;
    }

    // Champion (+30 pts)
    if (computedQualifiers.champion && preds.champion === computedQualifiers.champion) {
      ptsDetail.champion += 30;
    }

    // Apuestas Extras: Pichichi / MVP
    if (actualExtras.pichichi && preds.pichichi.toLowerCase() === actualExtras.pichichi.toLowerCase()) {
      ptsDetail.extras += 20;
    }
    if (actualExtras.mvp && preds.mvp.toLowerCase() === actualExtras.mvp.toLowerCase()) {
      ptsDetail.extras += 20;
    }

    // Knockout matches points (73 to 104)
    for (let matchNum = 73; matchNum <= 104; matchNum++) {
      const score = actualScores[matchNum];
      if (score && score.gh !== "" && score.ga !== "") {
        const koVal = preds.koMatches ? preds.koMatches[matchNum] : null;
        if (koVal && koVal.includes("·")) {
          const parts = koVal.split("·");
          const scorePart = parts[1].split("|")[1]; // e.g. "2-1" or "1-1"
          
          const scoreTokens = scorePart.split("-");
          const pred_gh = parseInt(scoreTokens[0]);
          const pred_ga = parseInt(scoreTokens[1]);
          
           // 1. Exact match score (+1 pt)
          if (pred_gh == score.gh && pred_ga == score.ga) {
            ptsDetail.koMatches += 1;
          }
          
          // 2. Exact penalties (+1 pt)
          if (score.gh == score.ga && pred_gh === pred_ga) {
            const predPen = preds.koPenalties ? preds.koPenalties[matchNum] : null;
            const actPenh = score.penh;
            const actPena = score.pena;
            if (predPen && actPenh !== "" && actPena !== "" && actPenh !== undefined && actPena !== undefined && actPenh !== null && actPena !== null) {
              if (predPen.home === parseInt(actPenh) && predPen.away === parseInt(actPena)) {
                ptsDetail.koMatches += 1;
              }
            }
          }
        }
      }
    }

    ptsDetail.total = ptsDetail.groupMatches + ptsDetail.groupStandings + 
                       ptsDetail.octavos + ptsDetail.cuartos + ptsDetail.semis + 
                       ptsDetail.finals + ptsDetail.thirdPlace + ptsDetail.champion + ptsDetail.extras + ptsDetail.koMatches;

    return {
      name: user,
      pts: ptsDetail
    };
  });

  // Sort leaderboard
  leaderboard.sort((a, b) => b.pts.total - a.pts.total || a.name.localeCompare(b.name));

  // 7. Render UI components
  renderLeaderboard(leaderboard);
  renderGroupStandingsPanel(groupStandings);
  renderSimulatorMatches();
  renderUserPredictions();
  renderExtrasTable();
  renderCalendarTab();

  // Update Top Header Stats
  document.getElementById("stat-played-count").textContent = `${playedMatchesCount} / 104`;
  const progressPercent = Math.min(100, (playedMatchesCount / 104) * 100);
  const progEl = document.getElementById("stat-played-progress");
  if (progEl) progEl.style.width = `${progressPercent}%`;
  
  if (leaderboard[0]) {
    document.getElementById("stat-leader").textContent = `${leaderboard[0].name} (${leaderboard[0].pts.total} pts)`;
  }
}

// Render Leaderboard Table
function renderLeaderboard(leaderboard) {
  // Render podium first
  renderPodium(leaderboard);

  const tbody = document.getElementById("leaderboard-body");
  tbody.innerHTML = "";

  leaderboard.forEach((entry, idx) => {
    const tr = document.createElement("tr");
    tr.style.cursor = "pointer";
    tr.title = `Haz clic para ver los pronósticos de ${entry.name}`;
    tr.addEventListener("click", () => showUserPredictions(entry.name));

    if (idx === 0) tr.className = "highlight-1";

    let prizeHtml = "-";
    if (idx === 0) {
      prizeHtml = `<span class="prize-tag prize-1st">🏆 65€</span>`;
    } else if (idx === 1) {
      prizeHtml = `<span class="prize-tag prize-2nd">🥈 35€</span>`;
    } else if (idx === 5) {
      prizeHtml = `<span class="prize-tag prize-6th">🎖️ 10€</span>`;
    } else if (idx === leaderboard.length - 1) {
      prizeHtml = `<span class="prize-tag prize-last">🍑 Balonazo</span>`;
    }

    const leaderCrown = idx === 0 ? '<span class="crown-glow" title="El friki es capaz de esto y más, nadie debe dudar del líder">👑</span> ' : '';

    tr.innerHTML = `
      <td style="font-weight:700;">${idx + 1}</td>
      <td style="font-weight:700; color:#fff;">${leaderCrown}${entry.name}</td>
      <td style="font-size:1.1rem; font-weight:800; color:var(--primary);">${entry.pts.total}</td>
      <td>${entry.pts.groupMatches + entry.pts.koMatches}</td>
      <td>${entry.pts.groupStandings}</td>
      <td>${entry.pts.octavos + entry.pts.cuartos + entry.pts.semis + entry.pts.finals + entry.pts.thirdPlace + entry.pts.champion}</td>
      <td>${entry.pts.extras}</td>
      <td>${prizeHtml}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Render Standings tables in simulator
function renderGroupStandingsPanel(groupStandings) {
  const container = document.getElementById("sim-group-standings");
  container.innerHTML = "";

  Object.keys(groupStandings).forEach(grp => {
    const card = document.createElement("div");
    card.className = "group-card";
    
    let rowsHtml = "";
    groupStandings[grp].forEach((t, idx) => {
      const qualifyClass = idx < 2 ? "pos-qualify" : "";
      rowsHtml += `
        <div class="group-team-row">
          <span class="group-team-name">
            <span class="pos-indicator ${qualifyClass}">${idx + 1}</span>
            ${getTeamDisplayName(t.name)}
          </span>
          <span style="font-weight:700;">${t.points} pts <span style="font-weight:normal; font-size:0.75rem; color:var(--text-muted); margin-left:0.3rem;">DG:${t.gd}</span></span>
        </div>
      `;
    });

    card.innerHTML = `
      <div class="group-card-header">Grupo ${grp}</div>
      ${rowsHtml}
    `;
    container.appendChild(card);
  });
}

// Render Predictions Detail for selected user
function renderUserPredictions() {
  const user = document.getElementById("select-user").value;
  if (!user) return;

  const preds = PREDICTIONS[user];
  const userEntry = CONTENDERS.map(name => {
    // Re-evaluate user points specifically
    let ptsDetail = {
      groupMatches: 0,
      groupStandings: 0,
      octavos: 0,
      cuartos: 0,
      semis: 0,
      finals: 0,
      thirdPlace: 0,
      champion: 0,
      extras: 0,
      koMatches: 0,
      total: 0
    };

    const pUser = PREDICTIONS[name];

    FIXTURES.forEach((match, idx) => {
      const score = actualScores[match.matchNum];
      if (score && score.gh !== "" && score.ga !== "") {
        const p = pUser.groupMatches[match.matchNum];
        const actWinner = score.gh > score.ga ? "1" : (score.gh < score.ga ? "2" : "X");
        if (p.winner === actWinner) {
          if (p.gh == score.gh && p.ga == score.ga) ptsDetail.groupMatches += 3;
          else if (p.gh == score.gh || p.ga == score.ga) ptsDetail.groupMatches += 2;
          else ptsDetail.groupMatches += 1;
        }
      }
    });

    Object.keys(computedActualGroups).forEach(grp => {
      if (!isGroupComplete(grp)) return;
      const act = computedActualGroups[grp].map(t => t.name);
      const pr = pUser.groupRankings[grp];
      if (act[0] && pr[0] === act[0]) ptsDetail.groupStandings += 2;
      for (let pos = 1; pos < 4; pos++) {
        if (act[pos] && pr[pos] === act[pos]) ptsDetail.groupStandings += 1;
      }
    });

    pUser.octavos.forEach(t => { if (computedQualifiers.octavos.includes(t)) ptsDetail.octavos += 2; });
    pUser.cuartos.forEach(t => { if (computedQualifiers.cuartos.includes(t)) ptsDetail.cuartos += 3; });
    pUser.semis.forEach(t => { if (computedQualifiers.semis.includes(t)) ptsDetail.semis += 5; });
    pUser.finalistas.forEach(t => { if (computedQualifiers.finals.includes(t)) ptsDetail.finals += 8; });
    pUser.match34.forEach(t => { if (computedQualifiers.match34.includes(t)) ptsDetail.finals += 8; });
    if (computedQualifiers.thirdPlace && pUser.thirdPlace === computedQualifiers.thirdPlace) ptsDetail.thirdPlace += 10;
    if (computedQualifiers.champion && pUser.champion === computedQualifiers.champion) ptsDetail.champion += 30;
    if (actualExtras.pichichi && pUser.pichichi.toLowerCase() === actualExtras.pichichi.toLowerCase()) ptsDetail.extras += 20;
    if (actualExtras.mvp && pUser.mvp.toLowerCase() === actualExtras.mvp.toLowerCase()) ptsDetail.extras += 20;

    // Knockout matches points (73 to 104)
    for (let matchNum = 73; matchNum <= 104; matchNum++) {
      const score = actualScores[matchNum];
      if (score && score.gh !== "" && score.ga !== "") {
        const koVal = pUser.koMatches ? pUser.koMatches[matchNum] : null;
        if (koVal && koVal.includes("·")) {
          const parts = koVal.split("·");
          const scorePart = parts[1].split("|")[1]; // e.g. "2-1" or "1-1"
          
          const scoreTokens = scorePart.split("-");
          const pred_gh = parseInt(scoreTokens[0]);
          const pred_ga = parseInt(scoreTokens[1]);
          
          // 1. Exact match score (+1 pt)
          if (pred_gh == score.gh && pred_ga == score.ga) {
            ptsDetail.koMatches += 1;
          }
          
          // 2. Exact penalties (+1 pt)
          if (score.gh == score.ga && pred_gh === pred_ga) {
            const predPen = pUser.koPenalties ? pUser.koPenalties[matchNum] : null;
            const actPenh = score.penh;
            const actPena = score.pena;
            if (predPen && actPenh !== "" && actPena !== "" && actPenh !== undefined && actPena !== undefined && actPenh !== null && actPena !== null) {
              if (predPen.home === parseInt(actPenh) && predPen.away === parseInt(actPena)) {
                ptsDetail.koMatches += 1;
              }
            }
          }
        }
      }
    }

    ptsDetail.total = ptsDetail.groupMatches + ptsDetail.groupStandings + 
                       ptsDetail.octavos + ptsDetail.cuartos + ptsDetail.semis + 
                       ptsDetail.finals + ptsDetail.thirdPlace + ptsDetail.champion + ptsDetail.extras + ptsDetail.koMatches;
    return { name, pts: ptsDetail };
  }).find(e => e.name === user);

  // Update Summary numbers
  document.getElementById("user-total-pts").textContent = userEntry.pts.total;
  document.getElementById("user-matches-pts").textContent = userEntry.pts.groupMatches + userEntry.pts.koMatches;
  document.getElementById("user-standings-pts").textContent = userEntry.pts.groupStandings;
  document.getElementById("user-ko-pts").textContent = userEntry.pts.octavos + userEntry.pts.cuartos + userEntry.pts.semis + userEntry.pts.finals + userEntry.pts.thirdPlace + userEntry.pts.champion;
  document.getElementById("user-extra-pts").textContent = userEntry.pts.extras;

  // Render group & knockout match prediction rows
  const tbody = document.getElementById("user-group-preds-body");
  tbody.innerHTML = "";
  
  // 1. Group Stage Matches
  FIXTURES.forEach((match, idx) => {
    const pred = preds.groupMatches[match.matchNum];
    const score = actualScores[match.matchNum];

    let actScoreHtml = "-";
    let badgeClass = "pending";
    let badgeLabel = "Pendiente";

    if (score && score.gh !== "" && score.ga !== "") {
      actScoreHtml = `${score.gh} - ${score.ga}`;
      const actWinner = score.gh > score.ga ? "1" : (score.gh < score.ga ? "2" : "X");
      
      if (pred.winner === actWinner) {
        if (pred.gh == score.gh && pred.ga == score.ga) {
          badgeClass = "exact";
          badgeLabel = "Resultado Exacto (+3)";
        } else if (pred.gh == score.gh || pred.ga == score.ga) {
          badgeClass = "partial";
          badgeLabel = "Goles de un equipo (+2)";
        } else {
          badgeClass = "win1x2";
          badgeLabel = "Ganador (1X2) (+1)";
        }
      } else {
        badgeClass = "miss";
        badgeLabel = "Fallo (0)";
      }
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <span style="font-weight:700; font-size:0.75rem; color:var(--text-muted); display:block;">#${match.matchNum} - Grupo ${match.group}</span>
        <strong>${getTeamDisplayName(match.home)} vs ${getTeamDisplayName(match.away)}</strong>
      </td>
      <td style="font-family:var(--font-title); font-weight:700;">${pred.gh} - ${pred.ga} (${pred.winner})</td>
      <td style="font-family:var(--font-title); font-weight:700; color:#fff;">${actScoreHtml}</td>
      <td><span class="hit-badge ${badgeClass}">${badgeLabel}</span></td>
    `;
    tbody.appendChild(tr);
  });

  // 2. Knockout Matches
  const sortedKo = Object.values(knockoutFixtures).sort((a, b) => a.matchNum - b.matchNum);
  sortedKo.forEach(match => {
    const id = match.matchNum;
    const score = actualScores[id];
    
    // Check if team names are resolved
    const homeTeam = match.home || `Ganador/Pos. ${match.homeSource}`;
    const awayTeam = match.away || `Ganador/Pos. ${match.awaySource}`;
    
    // Parse participant's prediction
    const koVal = preds.koMatches ? preds.koMatches[id] : null;
    let predText = "-";
    let pointsEarned = 0;
    let badgeClass = "pending";
    let badgeLabel = "Pendiente";
    
    if (koVal && koVal.includes("·")) {
      const parts = koVal.split("·");
      const matchupPart = parts[0]; // e.g. "Alemania-Suecia"
      const winnerPart = parts[1].split("|")[0]; // "1", "2", "X"
      const scorePart = parts[1].split("|")[1]; // e.g. "2-1"
      
      const predPen = preds.koPenalties ? preds.koPenalties[id] : null;
      let penSuffix = "";
      if (winnerPart === "X" && predPen) {
        penSuffix = ` (${predPen.home}-${predPen.away} pen)`;
      }
      
      const predictedTeams = matchupPart.split("-");
      const homeDisp = getTeamDisplayName(predictedTeams[0]);
      const awayDisp = getTeamDisplayName(predictedTeams[1]);
      predText = `${homeDisp} ${scorePart}${penSuffix} ${awayDisp}`;
      
      if (score && score.gh !== "" && score.ga !== "") {
        const scoreTokens = scorePart.split("-");
        const pred_gh = parseInt(scoreTokens[0]);
        const pred_ga = parseInt(scoreTokens[1]);
        
        if (pred_gh == score.gh && pred_ga == score.ga) {
          pointsEarned += 1;
        }
        
        if (score.gh == score.ga && pred_gh === pred_ga) {
          const actPenh = score.penh;
          const actPena = score.pena;
          if (predPen && actPenh !== "" && actPena !== "" && actPenh !== undefined && actPena !== undefined && actPenh !== null && actPena !== null) {
            if (predPen.home === parseInt(actPenh) && predPen.away === parseInt(actPena)) {
              pointsEarned += 1;
            }
          }
        }
      }
    }
    
    let actScoreHtml = "-";
    if (score && score.gh !== "" && score.ga !== "") {
      const actPenh = score.penh;
      const actPena = score.pena;
      let penSuffix = "";
      if (score.gh == score.ga && actPenh !== undefined && actPena !== undefined && actPenh !== "" && actPena !== "" && actPenh !== null && actPena !== null) {
        penSuffix = ` (${actPenh}-${actPena} pen)`;
      }
      actScoreHtml = `${score.gh} - ${score.ga}${penSuffix}`;
      
      if (pointsEarned > 0) {
        if (pointsEarned === 2) {
          badgeClass = "exact";
          badgeLabel = "Marcador y Penaltis (+2)";
        } else {
          // pointsEarned is 1
          const scoreTokens = scorePart.split("-");
          const pred_gh = parseInt(scoreTokens[0]);
          const pred_ga = parseInt(scoreTokens[1]);
          if (pred_gh == score.gh && pred_ga == score.ga) {
            badgeClass = "exact";
            badgeLabel = "Resultado Exacto (+1)";
          } else {
            badgeClass = "partial";
            badgeLabel = "Penaltis Exactos (+1)";
          }
        }
      } else {
        badgeClass = "miss";
        badgeLabel = "Fallo (0)";
      }
    }
    
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <span style="font-weight:700; font-size:0.75rem; color:var(--text-muted); display:block;">#${id} - ${getStageName(match.stage)}</span>
        <strong>${getTeamDisplayName(homeTeam)} vs ${getTeamDisplayName(awayTeam)}</strong>
      </td>
      <td style="font-size:0.85rem;">${predText}</td>
      <td style="font-family:var(--font-title); font-weight:700; color:#fff;">${actScoreHtml}</td>
      <td><span class="hit-badge ${badgeClass}">${badgeLabel}</span></td>
    `;
    tbody.appendChild(tr);
  });

  // Render Knockout qualifiers predictions badges
  function renderBadgeList(containerId, predList, actualList) {
    const el = document.getElementById(containerId);
    el.innerHTML = "";
    predList.forEach(team => {
      const badge = document.createElement("span");
      badge.className = "hit-badge pending";
      badge.style.margin = "0.2rem";
      badge.textContent = getTeamDisplayName(team);
      if (actualList.includes(team)) {
        badge.className = "hit-badge exact";
      } else if (actualList.length > 0) {
        badge.className = "hit-badge miss";
      }
      el.appendChild(badge);
    });
  }

  renderBadgeList("user-octavos-preds", preds.octavos, computedQualifiers.octavos);
  renderBadgeList("user-cuartos-preds", preds.cuartos, computedQualifiers.cuartos);
  renderBadgeList("user-semis-preds", preds.semis, computedQualifiers.semis);
  
  // Finals & 3rd place combined actual list
  const actualFinalistsAnd34 = [...computedQualifiers.finals, ...computedQualifiers.match34];
  const predFinalsAnd34 = [...preds.finalistas, ...preds.match34];
  renderBadgeList("user-finals-preds", predFinalsAnd34, actualFinalistsAnd34);

  // Extras text
  document.getElementById("user-pred-champion").textContent = getTeamDisplayName(preds.champion);
  document.getElementById("user-pred-subchampion").textContent = getTeamDisplayName(preds.subchampion);
  if (computedQualifiers.champion) {
    const cEl = document.getElementById("user-pred-champion");
    cEl.style.color = preds.champion === computedQualifiers.champion ? "var(--primary)" : "var(--hit-miss)";
  }
  if (computedQualifiers.subchampion) {
    const scEl = document.getElementById("user-pred-subchampion");
    scEl.style.color = preds.subchampion === computedQualifiers.subchampion ? "var(--primary)" : "var(--hit-miss)";
  }

  // Draw group standings side-by-side comparison
  renderGroupStandingsComparison(preds);
}

// Render Extras List Tab
function renderExtrasTable() {
  const tbody = document.getElementById("extras-table-body");
  tbody.innerHTML = "";

  // Add inputs for actual extras in the UI header
  let adminControls = document.getElementById("admin-extras-controls");
  if (!adminControls) {
    adminControls = document.createElement("div");
    adminControls.id = "admin-extras-controls";
    adminControls.className = "card";
    adminControls.style.marginBottom = "2rem";
    adminControls.innerHTML = `
      <div class="card-title" style="color:var(--accent-gold);">Resultados Finales del Torneo (Configuración del Administrador)</div>
      <div style="display:flex; flex-wrap:wrap; gap:1.5rem;">
        <div style="display:flex; flex-direction:column; gap:0.3rem;">
          <span style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase;">👟 Pichichi Real</span>
          <select id="input-act-pichichi" class="btn" style="text-align:left; background:#020617; color:#fff;">
            <option value="">Seleccionar...</option>
            ${getUniquePredictedPlayers("pichichi").map(p => `<option value="${p}" ${actualExtras.pichichi === p ? "selected" : ""}>${p}</option>`).join("")}
          </select>
        </div>
        <div style="display:flex; flex-direction:column; gap:0.3rem;">
          <span style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase;">⭐ MVP Real</span>
          <select id="input-act-mvp" class="btn" style="text-align:left; background:#020617; color:#fff;">
            <option value="">Seleccionar...</option>
            ${getUniquePredictedPlayers("mvp").map(p => `<option value="${p}" ${actualExtras.mvp === p ? "selected" : ""}>${p}</option>`).join("")}
          </select>
        </div>
      </div>
    `;
    const tabPanelExtras = document.getElementById("tab-extras");
    tabPanelExtras.insertBefore(adminControls, tabPanelExtras.firstChild);

    // Add event listeners for inputs
    document.getElementById("input-act-pichichi").addEventListener("change", (e) => {
      actualExtras.pichichi = e.target.value;
      localStorage.setItem("wc2026_actual_extras", JSON.stringify(actualExtras));
      evaluateTournament();
    });
    document.getElementById("input-act-mvp").addEventListener("change", (e) => {
      actualExtras.mvp = e.target.value;
      localStorage.setItem("wc2026_actual_extras", JSON.stringify(actualExtras));
      evaluateTournament();
    });
  } else {
    // Dropdowns might exist, update selected value
    const pIn = document.getElementById("input-act-pichichi");
    if (pIn) pIn.value = actualExtras.pichichi;
    const mIn = document.getElementById("input-act-mvp");
    if (mIn) mIn.value = actualExtras.mvp;
  }

  CONTENDERS.forEach(user => {
    const preds = PREDICTIONS[user];
    const tr = document.createElement("tr");

    // Pichichi status indicator
    let pichichiStyle = "";
    if (actualExtras.pichichi) {
      pichichiStyle = preds.pichichi.toLowerCase() === actualExtras.pichichi.toLowerCase() 
        ? "color:var(--primary); font-weight:700;" 
        : "color:var(--text-muted); text-decoration:line-through;";
    }
    
    // MVP status indicator
    let mvpStyle = "";
    if (actualExtras.mvp) {
      mvpStyle = preds.mvp.toLowerCase() === actualExtras.mvp.toLowerCase() 
        ? "color:var(--primary); font-weight:700;" 
        : "color:var(--text-muted); text-decoration:line-through;";
    }

    // Champion status indicator
    let champStyle = "";
    if (computedQualifiers.champion) {
      champStyle = preds.champion === computedQualifiers.champion 
        ? "color:var(--accent-gold); font-weight:700;" 
        : "color:var(--text-muted); text-decoration:line-through;";
    }

    tr.innerHTML = `
      <td style="font-weight:700; color:#fff;">${user}</td>
      <td style="${champStyle}">${getTeamDisplayName(preds.champion)}</td>
      <td>${getTeamDisplayName(preds.subchampion)}</td>
      <td>${getTeamDisplayName(preds.thirdPlace)}</td>
      <td style="${pichichiStyle}">${preds.pichichi}</td>
      <td style="${mvpStyle}">${preds.mvp}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Action: Load simulated matches for J1 and J2
function loadMockResults() {
  clearAllScoresSilently();
  
  // Set some group stage matches scores (fictional realistic play)
  // J1 A
  actualScores[1] = { gh: 2, ga: 1, penaltyWinner: "" }; // México-Sudáfrica
  actualScores[2] = { gh: 1, ga: 1, penaltyWinner: "" }; // Corea-RepCheca
  // J1 B
  actualScores[3] = { gh: 2, ga: 0, penaltyWinner: "" }; // Canadá-Bosnia
  actualScores[8] = { gh: 0, ga: 3, penaltyWinner: "" }; // Catar-Suiza
  // J1 C
  actualScores[7] = { gh: 3, ga: 1, penaltyWinner: "" }; // Brasil-Marruecos
  actualScores[5] = { gh: 0, ga: 2, penaltyWinner: "" }; // Haití-Escocia
  // J1 D
  actualScores[4] = { gh: 2, ga: 0, penaltyWinner: "" }; // USA-Paraguay
  actualScores[6] = { gh: 1, ga: 2, penaltyWinner: "" }; // Australia-Turquía

  // J2 A
  actualScores[25] = { gh: 2, ga: 0, penaltyWinner: "" }; // RepCheca-Sudáfrica
  actualScores[28] = { gh: 1, ga: 2, penaltyWinner: "" }; // México-Corea

  localStorage.setItem("wc2026_actual_scores", JSON.stringify(actualScores));
  evaluateTournament();
}

// Action: Load a complete tournament simulation
function loadAllGroupResults() {
  clearAllScoresSilently();
  
  // 1. Fill all group stage matches (1-72) with PiliP's predictions
  FIXTURES.forEach((match, idx) => {
    const pred = PREDICTIONS["PiliP"].groupMatches[match.matchNum];
    actualScores[match.matchNum] = {
      gh: pred.gh,
      ga: pred.ga,
      penaltyWinner: ""
    };
  });

  // 2. Evaluate group stage to populate Round of 32 teams
  evaluateTournament();

  // 3. Loop through knockout matches sequentially (73 to 104) and simulate scores
  for (let id = 73; id <= 104; id++) {
    // Simulate scores: alternate between 2-1 and 1-2 to avoid draws and ensure progression
    const gh = id % 2 === 0 ? 2 : 1;
    const ga = id % 2 === 0 ? 1 : 2;
    actualScores[id] = {
      gh: gh,
      ga: ga,
      penaltyWinner: ""
    };
    // Re-evaluate to populate next round
    evaluateTournament();
  }

  // Also set actual extra predictions for demonstration
  actualExtras.pichichi = "Mbappé";
  actualExtras.mvp = "Bellingham";
  
  // Propagate to inputs in UI
  const pIn = document.getElementById("input-act-pichichi");
  if (pIn) pIn.value = "Mbappé";
  const mIn = document.getElementById("input-act-mvp");
  if (mIn) mIn.value = "Bellingham";

  localStorage.setItem("wc2026_actual_scores", JSON.stringify(actualScores));
  localStorage.setItem("wc2026_actual_extras", JSON.stringify(actualExtras));
  evaluateTournament();
}

// Clear all inputs silently
function clearAllScoresSilently() {
  actualScores = {};
  actualExtras = { pichichi: "", mvp: "", champion: "", subchampion: "", thirdPlace: "" };
  
  const pIn = document.getElementById("input-act-pichichi");
  if (pIn) pIn.value = "";
  const mIn = document.getElementById("input-act-mvp");
  if (mIn) mIn.value = "";
}

// Action: Clear all scores
function clearAllScores() {
  if (confirm("¿Seguro que quieres borrar todos los marcadores y empezar de cero?")) {
    clearAllScoresSilently();
    localStorage.removeItem("wc2026_actual_scores");
    localStorage.removeItem("wc2026_actual_extras");
    evaluateTournament();
  }
}

// Action: Export scores as JSON
function exportScores() {
  const dataStr = JSON.stringify({ scores: actualScores, extras: actualExtras }, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = 'resultados_porra_mundial_2026.json';
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

// Action: Import scores from JSON
function importScores() {
  const jsonInput = prompt("Pega aquí el contenido JSON exportado:");
  if (jsonInput) {
    try {
      const parsed = JSON.parse(jsonInput);
      if (parsed.scores) actualScores = parsed.scores;
      if (parsed.extras) actualExtras = parsed.extras;
      
      const pIn = document.getElementById("input-act-pichichi");
      if (pIn && actualExtras.pichichi) pIn.value = actualExtras.pichichi;
      const mIn = document.getElementById("input-act-mvp");
      if (mIn && actualExtras.mvp) mIn.value = actualExtras.mvp;

      localStorage.setItem("wc2026_actual_scores", JSON.stringify(actualScores));
      localStorage.setItem("wc2026_actual_extras", JSON.stringify(actualExtras));
      evaluateTournament();
      alert("Resultados importados con éxito.");
    } catch (e) {
      alert("Error al importar. El formato JSON no es válido.");
    }
  }
}

// === Calendario Diario Functions ===
let selectedCalendarDate = "2026-06-14";
const SPANISH_WEEKDAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const SPANISH_MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

function formatCalendarDateSpanish(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const dayName = SPANISH_WEEKDAYS[d.getDay()];
  const dayNum = d.getDate();
  const monthName = SPANISH_MONTHS[d.getMonth()];
  const yearNum = d.getFullYear();
  return `${dayName}, ${dayNum} de ${monthName} de ${yearNum}`;
}

function changeCalendarDay(offset) {
  const d = new Date(selectedCalendarDate + "T00:00:00");
  d.setDate(d.getDate() + offset);
  
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  selectedCalendarDate = `${y}-${m}-${day}`;
  renderCalendarTab();
}

function renderCalendarTab() {
  const titleEl = document.getElementById("calendar-day-title");
  if (!titleEl) return; // Safeguard if tab is not in DOM
  titleEl.textContent = formatCalendarDateSpanish(selectedCalendarDate);

  const container = document.getElementById("calendar-matches-list");
  if (!container) return;
  container.innerHTML = "";

  const matchesOnDay = [];

  // Group stage matches (1-72)
  FIXTURES.forEach(match => {
    if (match.date && match.date.substring(0, 10) === selectedCalendarDate) {
      matchesOnDay.push({
        matchNum: match.matchNum,
        stageLabel: `Grupo ${match.group}`,
        home: match.home,
        away: match.away,
        date: match.date,
        isKnockout: false
      });
    }
  });

  // Knockout matches (73-104)
  Object.values(knockoutFixtures).forEach(match => {
    const matchDate = getKoMatchDate(match.matchNum);
    if (matchDate && matchDate.substring(0, 10) === selectedCalendarDate) {
      matchesOnDay.push({
        matchNum: match.matchNum,
        stageLabel: getStageName(match.stage),
        home: match.home || `Ganador/Pos. ${match.homeSource}`,
        away: match.away || `Ganador/Pos. ${match.awaySource}`,
        date: matchDate,
        isKnockout: true
      });
    }
  });

  if (matchesOnDay.length === 0) {
    container.innerHTML = `<p style="padding: 3rem; text-align: center; color: var(--text-muted); font-style: italic;">No hay partidos programados para este día.</p>`;
    return;
  }

  // Sort by time
  matchesOnDay.sort((a, b) => a.date.localeCompare(b.date) || a.matchNum - b.matchNum);

  matchesOnDay.forEach(match => {
    const card = createCalendarMatchCard(match);
    container.appendChild(card);
  });
}

function createCalendarMatchCard(match) {
  const card = document.createElement("div");
  card.className = "match-card";
  card.style.flexDirection = "column";
  card.style.alignItems = "stretch";
  card.style.gap = "1rem";
  
  const id = match.matchNum;
  const score = actualScores[id] || { gh: "", ga: "", penaltyWinner: "" };
  const dateStr = match.date;
  const isKnockout = match.isKnockout;
  const homeName = match.home;
  const awayName = match.away;

  // Draw penalty selector if goals are equal and it's a knockout match
  const isDraw = score.gh !== "" && score.ga !== "" && score.gh == score.ga;
  const showPenaltySelect = isKnockout && isDraw;
  
  let penaltySelectHtml = "";
  if (showPenaltySelect) {
    penaltySelectHtml = `
      <div style="display:flex; align-items:center; gap:0.5rem; margin-top:0.5rem; background:rgba(239, 68, 68, 0.05); padding:0.4rem 0.75rem; border-radius:6px; border:1px solid rgba(239,68,68,0.15);">
        <span style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase;">Clasifica en penaltis:</span>
        <select class="btn" style="padding:0.2rem 0.5rem; font-size:0.75rem;" onchange="handlePenaltyWinner(${id}, this.value)">
          <option value="">Seleccionar...</option>
          <option value="home" ${score.penaltyWinner === "home" ? "selected" : ""}>${getTeamDisplayName(homeName)}</option>
          <option value="away" ${score.penaltyWinner === "away" ? "selected" : ""}>${getTeamDisplayName(awayName)}</option>
        </select>
      </div>
    `;
  }

  // Generate predictions summary for all friends
  let predsHtml = "";
  CONTENDERS.forEach(user => {
    const preds = PREDICTIONS[user];
    let predText = "-";
    let isCorrect = false;

    if (!isKnockout) {
      const p = preds.groupMatches[id];
      if (p) {
        predText = `${p.gh}-${p.ga}`;
        if (score.gh !== "" && score.ga !== "") {
          const actWinner = score.gh > score.ga ? "1" : (score.gh < score.ga ? "2" : "X");
          if (p.winner === actWinner) {
            isCorrect = true;
          }
        }
      }
    } else {
      const koVal = preds.koMatches[id];
      if (koVal && koVal.includes("·")) {
        const parts = koVal.split("·");
        const matchupPart = parts[0]; // e.g. "Alemania-Suecia"
        const scorePart = parts[1].split("|")[1]; // e.g. "2-1"
        
        const predictedTeams = matchupPart.split("-");
        const homeDisp = getTeamDisplayName(predictedTeams[0]);
        const awayDisp = getTeamDisplayName(predictedTeams[1]);
        predText = `${homeDisp} ${scorePart} ${awayDisp}`;
        
        const actualTeams = [homeName, awayName];
        if (actualTeams.includes(predictedTeams[0]) || actualTeams.includes(predictedTeams[1])) {
          isCorrect = true;
        }
      }
    }

    const highlightStyle = isCorrect ? "background:rgba(0, 242, 254, 0.08); border-color:rgba(0, 242, 254, 0.35); box-shadow: 0 0 10px rgba(0, 242, 254, 0.08);" : "";

    predsHtml += `
      <div style="font-size:0.75rem; padding:0.4rem 0.6rem; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:8px; display:flex; justify-content:space-between; align-items:center; ${highlightStyle}">
        <span style="font-weight:700; color:#fff;">${user}:</span>
        <span style="color:var(--text-muted); font-family:var(--font-title); font-weight:600;">${predText}</span>
      </div>
    `;
  });

  // Calculate Consensus stats
  const stats = getMatchPredictionStats(id, isKnockout);
  const consensusHtml = `
    <div style="margin-bottom:0.75rem; background:rgba(0,242,254,0.02); padding:0.6rem 0.8rem; border-radius:10px; border:1px solid rgba(0,242,254,0.1); display:flex; flex-direction:column; gap:0.4rem;">
      <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-muted);">
        <span>Consenso 1X2 del Grupo:</span>
        <span>L: <strong>${stats.homePct}%</strong> | X: <strong>${stats.drawPct}%</strong> | V: <strong>${stats.awayPct}%</strong></span>
      </div>
      <div class="consensus-bar" style="display:flex; height:6px; border-radius:3px; overflow:hidden; background:rgba(255,255,255,0.05);">
        <div style="width:${stats.homePct}%; background:var(--primary);"></div>
        <div style="width:${stats.drawPct}%; background:rgba(255,255,255,0.25);"></div>
        <div style="width:${stats.awayPct}%; background:var(--danger);"></div>
      </div>
      <div style="font-size:0.7rem; color:var(--text-muted);">
        Apuesta más común: <strong style="color:#fff;">${stats.commonScore}</strong> (elegido por ${stats.maxCount} personas)
      </div>
    </div>
  `;

  card.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
      <div class="match-meta" style="width:auto; flex:1;">
        <div style="font-weight:700; color:var(--primary); font-size:0.85rem;">#${id} - ${match.stageLabel}</div>
        <div style="font-size:0.75rem; color:var(--text-muted);">${dateStr.substring(11)}hs</div>
      </div>
      <div style="display:flex; align-items:center; justify-content:center; flex:2;">
        <span class="match-team" style="font-size:1.05rem;">${getTeamDisplayName(homeName)}</span>
        <div class="match-score-inputs">
          <input type="number" min="0" class="score-input" value="${score.gh}" oninput="handleScoreChange(${id}, 'gh', this.value)">
          <span class="score-divider">-</span>
          <input type="number" min="0" class="score-input" value="${score.ga}" oninput="handleScoreChange(${id}, 'ga', this.value)">
        </div>
        <span class="match-team away" style="font-size:1.05rem;">${getTeamDisplayName(awayName)}</span>
      </div>
      <div style="flex:1; text-align:right;">
        <button class="btn" style="padding:0.3rem 0.6rem; font-size:0.75rem;" onclick="togglePredictionsCollapse(${id})">👥 Ver Quinielas</button>
      </div>
    </div>
    
    ${penaltySelectHtml}

    <div id="predictions-collapse-${id}" style="display:none; border-top:1px solid var(--border-color); padding-top:0.75rem;">
      ${consensusHtml}
      <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted); display:block; margin-bottom:0.5rem;">Pronósticos de los participantes:</span>
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(180px, 1fr)); gap:0.4rem;">
        ${predsHtml}
      </div>
    </div>
  `;

  return card;
}

window.togglePredictionsCollapse = function(id) {
  const el = document.getElementById(`predictions-collapse-${id}`);
  if (el.style.display === "none") {
    el.style.display = "block";
  } else {
    el.style.display = "none";
  }
};

// === Helper to extract unique names predicted by users ===
function getUniquePredictedPlayers(field) {
  const players = new Set();
  CONTENDERS.forEach(user => {
    const name = PREDICTIONS[user][field];
    if (name) players.add(name.trim());
  });
  return Array.from(players).sort();
}

// === Calculate Consensus Statistics for a Match ===
function getMatchPredictionStats(matchNum, isKnockout) {
  let homeWins = 0;
  let draws = 0;
  let awayWins = 0;
  const scoreCounts = {};
  
  CONTENDERS.forEach(user => {
    const preds = PREDICTIONS[user];
    if (!isKnockout) {
      const p = preds.groupMatches[matchNum];
      if (p) {
        if (p.winner === "1") homeWins++;
        else if (p.winner === "X") draws++;
        else if (p.winner === "2") awayWins++;
        
        const scoreStr = `${p.gh}-${p.ga}`;
        scoreCounts[scoreStr] = (scoreCounts[scoreStr] || 0) + 1;
      }
    } else {
      const koVal = preds.koMatches[matchNum];
      if (koVal && koVal.includes("·")) {
        const parts = koVal.split("·");
        const scorePart = parts[1].split("|")[1]; // e.g. "2-1" or "1-1"
        const gh = parseInt(scorePart.split("-")[0]);
        const ga = parseInt(scorePart.split("-")[1]);
        if (gh > ga) homeWins++;
        else if (gh < ga) awayWins++;
        else draws++;
        
        scoreCounts[scorePart] = (scoreCounts[scorePart] || 0) + 1;
      }
    }
  });
  
  const total = CONTENDERS.length;
  const homePct = total > 0 ? Math.round((homeWins / total) * 100) : 0;
  const drawPct = total > 0 ? Math.round((draws / total) * 100) : 0;
  const awayPct = total > 0 ? 100 - homePct - drawPct : 0; // Ensures sum is exactly 100%
  
  let commonScore = "-";
  let maxCount = 0;
  Object.keys(scoreCounts).forEach(score => {
    if (scoreCounts[score] > maxCount) {
      maxCount = scoreCounts[score];
      commonScore = score;
    }
  });
  
  return { homePct, drawPct, awayPct, commonScore, maxCount };
}

// === Serialize Simulator State for URL Sharing ===
function serializeScores() {
  const parts = [];
  Object.keys(actualScores).forEach(id => {
    const score = actualScores[id];
    if (score && (score.gh !== "" || score.ga !== "")) {
      let val = `${id}:${score.gh}-${score.ga}`;
      if (score.penaltyWinner) {
        val += `:${score.penaltyWinner === "home" ? "h" : "a"}`;
      }
      parts.push(val);
    }
  });
  
  // Encode pichichi & mvp if set
  const extrasPart = [];
  if (actualExtras.pichichi) extrasPart.push(`p:${actualExtras.pichichi}`);
  if (actualExtras.mvp) extrasPart.push(`m:${actualExtras.mvp}`);
  if (extrasPart.length > 0) {
    parts.push("e_" + extrasPart.join("_"));
  }
  
  return parts.join(",");
}

// === Deserialize URL Hash simulated scores ===
function deserializeScores(hash) {
  if (!hash) return false;
  if (hash.startsWith("#")) hash = hash.substring(1);
  
  const params = new URLSearchParams(hash);
  const simData = params.get("sim");
  if (!simData) return false;
  
  const newScores = {};
  const newExtras = { pichichi: "", mvp: "", champion: "", subchampion: "", thirdPlace: "" };
  
  const parts = simData.split(",");
  parts.forEach(part => {
    if (part.startsWith("e_")) {
      const extParts = part.substring(2).split("_");
      extParts.forEach(ep => {
        if (ep.startsWith("p:")) newExtras.pichichi = ep.substring(2);
        if (ep.startsWith("m:")) newExtras.mvp = ep.substring( ep.indexOf(":") + 1 );
      });
    } else {
      const tokens = part.split(":");
      const id = parseInt(tokens[0]);
      if (!isNaN(id)) {
        const goals = tokens[1].split("-");
        const gh = goals[0] === "" ? "" : parseInt(goals[0]);
        const ga = goals[1] === "" ? "" : parseInt(goals[1]);
        let penaltyWinner = "";
        if (tokens[2]) {
          penaltyWinner = tokens[2] === "h" ? "home" : "away";
        }
        newScores[id] = { gh, ga, penaltyWinner };
      }
    }
  });
  
  actualScores = newScores;
  actualExtras = { ...actualExtras, ...newExtras };
  return true;
}

// === Show / Hide Simulated Banner ===
function showSimulatedBanner() {
  let banner = document.getElementById("simulated-scenario-banner");
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "simulated-scenario-banner";
    banner.className = "simulated-banner";
    banner.innerHTML = `
      <span>🎮 <strong>Modo Simulación Activo</strong>: Estás visualizando un escenario compartido.</span>
      <button class="btn btn-primary" style="padding:0.3rem 0.8rem; font-size:0.75rem; border-radius:6px;" onclick="restoreOriginalScores()">Restablecer Oficial</button>
    `;
    document.body.insertBefore(banner, document.body.firstChild);
  }
}

window.restoreOriginalScores = function() {
  window.location.hash = "";
  localStorage.removeItem("wc2026_actual_scores");
  localStorage.removeItem("wc2026_actual_extras");
  actualScores = {};
  actualExtras = { pichichi: "", mvp: "", champion: "", subchampion: "", thirdPlace: "" };
  
  const banner = document.getElementById("simulated-scenario-banner");
  if (banner) banner.remove();
  
  // Reload page state
  initApp();
};

window.copySimulationLink = function() {
  const serialized = serializeScores();
  if (!serialized) {
    alert("Introduce algunos marcadores simulados antes de copiar el enlace.");
    return;
  }
  const shareUrl = `${window.location.origin}${window.location.pathname}#sim=${serialized}`;
  
  navigator.clipboard.writeText(shareUrl).then(() => {
    const btn = document.getElementById("btn-share-scenario");
    if (btn) {
      const originalText = btn.innerHTML;
      btn.innerHTML = "✔️ ¡Enlace Copiado!";
      btn.style.borderColor = "var(--success)";
      btn.style.color = "var(--success)";
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.borderColor = "";
        btn.style.color = "";
      }, 2000);
    } else {
      alert("Enlace de simulación copiado al portapapeles.");
    }
  }).catch(err => {
    alert("Error al copiar el enlace: " + err);
  });
};

// === Render Leaderboard 3D Podium ===
function renderPodium(leaderboard) {
  const container = document.getElementById("podium-container");
  if (!container) return;
  container.innerHTML = "";

  if (leaderboard.length < 3) return;

  const first = leaderboard[0];
  const second = leaderboard[1];
  const third = leaderboard[2];

  const getInitials = (name) => name.substring(0, 2).toUpperCase();

  const createPodiumCardHtml = (entry, posClass, posNum, medal, prize) => {
    const tooltip = posNum === "1" ? ' title="El friki es capaz de esto y más, nadie debe dudar del líder"' : '';
    return `
      <div class="podium-card ${posClass}" onclick="showUserPredictions('${entry.name}')"${tooltip}>
        <div class="podium-position">${posNum}</div>
        <div class="podium-avatar">${getInitials(entry.name)}</div>
        <div class="podium-name">${medal} ${entry.name}</div>
        <div class="podium-pts">${entry.pts.total} <span style="font-size:0.75rem; font-weight:normal; color:var(--text-muted);">pts</span></div>
        <div class="podium-prize">${prize}</div>
      </div>
    `;
  };

  // We append in order: 2nd place, 1st place, 3rd place for standard podium layout
  container.innerHTML = `
    ${createPodiumCardHtml(second, "podium-2nd", "2", "🥈", "35.00 €")}
    ${createPodiumCardHtml(first, "podium-1st", "1", "👑", "65.00 €")}
    ${createPodiumCardHtml(third, "podium-3rd", "3", "🥉", "0.00 €")}
  `;
}

// === Switch Tabs Helper ===
window.switchTab = function(tabId) {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");
  
  tabBtns.forEach(b => {
    b.classList.remove("active");
    if (b.getAttribute("data-tab") === tabId) {
      b.classList.add("active");
    }
  });
  
  tabPanels.forEach(p => {
    p.classList.remove("active");
  });
  const activePanel = document.getElementById(tabId);
  if (activePanel) {
    activePanel.classList.add("active");
    if (tabId === "tab-bracket") {
      renderBracket();
    }
  }
};

window.showUserPredictions = function(username) {
  const selectUser = document.getElementById("select-user");
  if (selectUser) {
    selectUser.value = username;
    renderUserPredictions();
  }
  switchTab("tab-predictions");
};

// === Render Group Standings side-by-side comparison ===
function renderGroupStandingsComparison(preds) {
  const container = document.getElementById("user-group-standings-comparison");
  if (!container) return;
  container.innerHTML = "";

  Object.keys(computedActualGroups).forEach(grp => {
    const card = document.createElement("div");
    card.className = "group-comparison-card";

    const actStandings = computedActualGroups[grp].map(t => t.name);
    const predStandings = preds.groupRankings[grp]; // array of 4 teams

    let rowsHtml = "";
    // Max size of teams in group (usually 4)
    const teamsCount = Math.max(actStandings.length, predStandings.length);
    for (let idx = 0; idx < teamsCount; idx++) {
      const actTeam = actStandings[idx] || "-";
      const predTeam = predStandings[idx] || "-";
      
      let highlightClass = "";
      let ptsLabel = "";
      const groupFinished = isGroupComplete(grp);
      
      if (actTeam !== "-" && predTeam !== "-") {
        if (groupFinished) {
          if (predTeam === actTeam) {
            highlightClass = "match-correct";
            ptsLabel = idx === 0 ? "+2 pts" : "+1 pt";
          } else if (actStandings.includes(predTeam)) {
            highlightClass = "match-partial";
            ptsLabel = "0 pts";
          } else {
            highlightClass = "match-wrong";
            ptsLabel = "0 pts";
          }
        } else {
          highlightClass = "";
          ptsLabel = "-";
        }
      }

      rowsHtml += `
        <div class="comparison-row">
          <span class="pos-badge">${idx + 1}</span>
          <div class="team-column predicted ${highlightClass}" title="Pronosticado">${getTeamDisplayName(predTeam)}</div>
          <div class="team-column actual" title="Real">${getTeamDisplayName(actTeam)}</div>
          <span class="pts-badge">${ptsLabel}</span>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="comparison-header">Grupo ${grp}</div>
      <div class="comparison-row-titles">
        <span>Pos</span>
        <span>Pronóstico</span>
        <span>Real/Sim</span>
        <span>Pts</span>
      </div>
      ${rowsHtml}
    `;
    container.appendChild(card);
  });
}

// === Render Visual Tournament Bracket ===
function renderBracket() {
  const container = document.getElementById("bracket-wrapper");
  if (!container) return;
  container.innerHTML = "";

  // Dropdown option to highlight a user predictions in the bracket
  const highlightUser = document.getElementById("select-bracket-user").value;
  const userPreds = highlightUser ? PREDICTIONS[highlightUser] : null;

  // Bracket Columns definition: rounds in order
  const rounds = [
    {
      title: "Dieciseisavos (1/16)",
      stage: "1/16",
      matches: [74, 77, 73, 75, 83, 84, 81, 82, 76, 78, 79, 80, 86, 88, 85, 87]
    },
    {
      title: "Octavos (1/8)",
      stage: "1/8",
      matches: [89, 90, 93, 94, 91, 92, 95, 96]
    },
    {
      title: "Cuartos (1/4)",
      stage: "1/4",
      matches: [97, 98, 99, 100]
    },
    {
      title: "Semifinales",
      stage: "1/2",
      matches: [101, 102]
    },
    {
      title: "Final & 3er Puesto",
      stage: "final",
      matches: [104, 103] // 104 is Final, 103 is 3rd place
    }
  ];

  rounds.forEach((round, colIdx) => {
    const col = document.createElement("div");
    col.className = "bracket-column";
    
    const colTitle = document.createElement("div");
    colTitle.className = "bracket-column-title";
    colTitle.textContent = round.title;
    col.appendChild(colTitle);

    const matchesList = document.createElement("div");
    matchesList.className = "bracket-matches-list";
    
    round.matches.forEach(matchNum => {
      const match = knockoutFixtures[matchNum];
      const score = actualScores[matchNum] || { gh: "", ga: "", penaltyWinner: "" };
      
      const homeTeam = match.home || "";
      const awayTeam = match.away || "";
      
      const resolved = score.gh !== "" && score.ga !== "";
      
      let winner = "";
      if (resolved) {
        if (score.gh > score.ga) winner = "home";
        else if (score.gh < score.ga) winner = "away";
        else if (score.penaltyWinner === "home") winner = "home";
        else if (score.penaltyWinner === "away") winner = "away";
      }

      // Check user prediction matches
      let homeHighlight = "";
      let awayHighlight = "";

      if (userPreds) {
        if (round.stage === "1/16") {
          // No direct predictions for 1/16, as they qualified from groups. We check if they predicted them to advance from groups.
          // 1/16 participants qualify as 1st/2nd or best 3rd. We check if they predicted them in octavos?
          // Actually, let's just highlight if they predicted them to reach octavos!
          if (homeTeam && userPreds.octavos.includes(homeTeam)) homeHighlight = "pred-correct";
          if (awayTeam && userPreds.octavos.includes(awayTeam)) awayHighlight = "pred-correct";
        } else if (round.stage === "1/8") {
          if (homeTeam && userPreds.octavos.includes(homeTeam)) homeHighlight = "pred-correct";
          if (awayTeam && userPreds.octavos.includes(awayTeam)) awayHighlight = "pred-correct";
        } else if (round.stage === "1/4") {
          if (homeTeam && userPreds.cuartos.includes(homeTeam)) homeHighlight = "pred-correct";
          if (awayTeam && userPreds.cuartos.includes(awayTeam)) awayHighlight = "pred-correct";
        } else if (round.stage === "1/2") {
          if (homeTeam && userPreds.semis.includes(homeTeam)) homeHighlight = "pred-correct";
          if (awayTeam && userPreds.semis.includes(awayTeam)) awayHighlight = "pred-correct";
        } else if (round.stage === "final" && matchNum === 104) {
          if (homeTeam && userPreds.finalistas.includes(homeTeam)) homeHighlight = "pred-correct";
          if (awayTeam && userPreds.finalistas.includes(awayTeam)) awayHighlight = "pred-correct";
        } else if (round.stage === "final" && matchNum === 103) {
          // 3rd place match
          if (homeTeam && userPreds.match34.includes(homeTeam)) homeHighlight = "pred-correct";
          if (awayTeam && userPreds.match34.includes(awayTeam)) awayHighlight = "pred-correct";
        }
      }

      const matchBox = document.createElement("div");
      matchBox.className = `bracket-match-box ${resolved ? "resolved" : ""}`;
      matchBox.title = `Hacer doble clic para ir al simulador de este partido (#${matchNum})`;
      
      // Navigate to match on double click
      matchBox.addEventListener("dblclick", () => {
        switchTab("tab-simulator");
        const filterStage = document.getElementById("filter-stage");
        filterStage.value = "all";
        filterStage.dispatchEvent(new Event("change"));
        
        // Scroll to match element
        setTimeout(() => {
          const matchCards = document.querySelectorAll(".match-card");
          matchCards.forEach(card => {
            if (card.innerHTML.includes(`#${matchNum}`)) {
              card.scrollIntoView({ behavior: "smooth", block: "center" });
              card.style.borderColor = "var(--primary)";
              card.style.boxShadow = "0 0 15px var(--primary-glow)";
              setTimeout(() => {
                card.style.borderColor = "";
                card.style.boxShadow = "";
              }, 3000);
            }
          });
        }, 100);
      });

      const homeDisp = homeTeam ? getTeamDisplayName(homeTeam) : `<span style="color:var(--text-muted);">Ganador ${match.homeSource}</span>`;
      const awayDisp = awayTeam ? getTeamDisplayName(awayTeam) : `<span style="color:var(--text-muted);">Ganador ${match.awaySource}</span>`;

      const scoreHtml = resolved ? `
        <div class="bracket-score">
          <span class="${winner === "home" ? "win" : "lose"}">${score.gh}</span>
          <span>-</span>
          <span class="${winner === "away" ? "win" : "lose"}">${score.ga}</span>
        </div>
      ` : `<div class="bracket-score pending">-</div>`;

      const label = matchNum === 103 ? "3º Puesto" : `#${matchNum}`;

      matchBox.innerHTML = `
        <div class="bracket-match-num">${label}</div>
        <div style="display:flex; flex-direction:column; gap:0.25rem;">
          <div class="bracket-team ${winner === "home" ? "winner" : (winner === "away" ? "loser" : "")} ${homeHighlight}">
            <span>${homeDisp}</span>
          </div>
          <div class="bracket-team ${winner === "away" ? "winner" : (winner === "home" ? "loser" : "")} ${awayHighlight}">
            <span>${awayDisp}</span>
          </div>
        </div>
        ${scoreHtml}
      `;
      matchesList.appendChild(matchBox);
    });

    col.appendChild(matchesList);
    container.appendChild(col);
  });

  // Draw Champion highlight card at the end
  const champCol = document.createElement("div");
  champCol.className = "bracket-column champion-col";
  champCol.style.justifyContent = "center";
  
  const champBox = document.createElement("div");
  champBox.className = "podium-card podium-1st";
  champBox.style.height = "auto";
  champBox.style.width = "180px";
  champBox.style.padding = "1.5rem 1rem";
  
  const champName = computedQualifiers.champion;
  const champDisp = champName ? getTeamDisplayName(champName) : "Por definir";
  const userChampCorrect = userPreds && champName && userPreds.champion === champName;

  champBox.innerHTML = `
    <div style="font-size:0.7rem; color:var(--accent-gold); text-transform:uppercase; font-weight:800; letter-spacing:0.1em; margin-bottom:0.5rem;">🏆 Campeón 2026</div>
    <div class="podium-avatar" style="width:50px; height:50px; font-size:1.2rem; background:linear-gradient(135deg, var(--accent-gold) 0%, var(--warning) 100%); margin-bottom:0.75rem;">⚽</div>
    <div style="font-family:var(--font-title); font-weight:800; font-size:1.1rem; color:#fff; word-break:break-all;">${champDisp}</div>
    ${userChampCorrect ? '<div style="font-size:0.65rem; background:var(--success); color:#fff; border-radius:4px; padding:0.1rem 0.3rem; margin-top:0.4rem; display:inline-block;">¡Acertado! (+30)</div>' : ''}
  `;

  champCol.appendChild(champBox);
  container.appendChild(champCol);
}

// === Setup Admin Portal Listeners ===
function setupAdminPortal() {
  const loginView = document.getElementById("admin-login-view");
  const dashboardView = document.getElementById("admin-dashboard-view");
  const passwordInput = document.getElementById("admin-password-input");
  const loginError = document.getElementById("admin-login-error");
  const loginBtn = document.getElementById("btn-admin-login");
  const saveBtn = document.getElementById("btn-admin-save");
  const logoutBtn = document.getElementById("btn-admin-logout");

  if (!loginView) return; // Guard clause

  // Check if token exists in localStorage
  const token = localStorage.getItem("wc2026_admin_token");
  if (token) {
    loginView.style.display = "none";
    dashboardView.style.display = "block";
  } else {
    loginView.style.display = "block";
    dashboardView.style.display = "none";
  }

  // Handle Enter key on password input
  passwordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      performLogin();
    }
  });

  loginBtn.addEventListener("click", performLogin);

  async function performLogin() {
    const password = passwordInput.value;
    if (!password) return;

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("wc2026_admin_token", data.token);
        loginError.style.display = "none";
        passwordInput.value = "";
        
        loginView.style.display = "none";
        dashboardView.style.display = "block";
      } else {
        loginError.textContent = `⚠️ ${data.message || 'Clave incorrecta'}`;
        loginError.style.display = "block";
      }
    } catch (err) {
      console.error(err);
      loginError.textContent = "⚠️ Error al conectar con el servidor.";
      loginError.style.display = "block";
    }
  }

  // Handle Logout
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("wc2026_admin_token");
    loginView.style.display = "block";
    dashboardView.style.display = "none";
  });

  // Handle Save (Publish)
  saveBtn.addEventListener("click", async () => {
    const token = localStorage.getItem("wc2026_admin_token");
    if (!token) {
      alert("No hay sesión de administrador activa.");
      loginView.style.display = "block";
      dashboardView.style.display = "none";
      return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = "💾 Guardando...";

    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          scores: actualScores,
          extras: actualExtras
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("wc2026_actual_scores", JSON.stringify(actualScores));
        localStorage.setItem("wc2026_actual_extras", JSON.stringify(actualExtras));
        
        alert("🎉 ¡Resultados oficiales publicados y guardados en la nube exitosamente!");
        
        evaluateTournament();
      } else {
        if (res.status === 401 || res.status === 403) {
          alert("La sesión ha caducado. Por favor, inicia sesión de nuevo.");
          localStorage.removeItem("wc2026_admin_token");
          loginView.style.display = "block";
          dashboardView.style.display = "none";
        } else {
          alert(`Error al guardar: ${data.message || 'Error desconocido'}`);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al guardar los resultados.");
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = "💾 Publicar Resultados Oficiales en la Nube";
    }
  });
}
