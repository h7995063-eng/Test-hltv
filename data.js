const DATA = {
  teams: [
    { 
      id: 1, name: "FURIA", points: 960, wins: 12, losses: 4,
      players: [
        { nick: "FalleN", kills: 345, deaths: 280, hs: 72, rating: 1.15, avatar: "", role: "Снайпер" },
        { nick: "yuurih", kills: 410, deaths: 310, hs: 68, rating: 1.22, avatar: "", role: "Штурмовик" },
        { nick: "KSCERATO", kills: 380, deaths: 290, hs: 65, rating: 1.18, avatar: "", role: "Люркер" },
        { nick: "molodoy", kills: 290, deaths: 320, hs: 58, rating: 1.02, avatar: "", role: "Поддержка" },
        { nick: "YEKINDAR", kills: 310, deaths: 340, hs: 55, rating: 1.05, avatar: "", role: "Капитан" }
      ]
    },
    { 
      id: 2, name: "MOUZ", points: 808, wins: 10, losses: 5,
      players: [
        { nick: "torzsi", kills: 390, deaths: 300, hs: 74, rating: 1.20, avatar: "", role: "Снайпер" },
        { nick: "xertioN", kills: 370, deaths: 310, hs: 66, rating: 1.14, avatar: "", role: "Штурмовик" },
        { nick: "Jimpphat", kills: 350, deaths: 280, hs: 62, rating: 1.16, avatar: "", role: "Поддержка" },
        { nick: "Brollan", kills: 320, deaths: 330, hs: 60, rating: 1.08, avatar: "", role: "Люркер" },
        { nick: "Spinx", kills: 300, deaths: 320, hs: 57, rating: 1.05, avatar: "", role: "Капитан" }
      ]
    }
  ],
  matches: [
    {
      id: 1, map: "de_mirage", tournament: "Тестовый матч",
      team1: { name: "FURIA", score: 13, players: [
        { nick: "FalleN", kills: 28, deaths: 10, hs: 82 }, { nick: "yuurih", kills: 21, deaths: 12, hs: 65 },
        { nick: "KSCERATO", kills: 18, deaths: 14, hs: 60 }, { nick: "molodoy", kills: 15, deaths: 16, hs: 55 },
        { nick: "YEKINDAR", kills: 12, deaths: 18, hs: 48 }
      ]},
      team2: { name: "MOUZ", score: 9, players: [
        { nick: "torzsi", kills: 18, deaths: 17, hs: 70 }, { nick: "xertioN", kills: 14, deaths: 18, hs: 62 },
        { nick: "Jimpphat", kills: 12, deaths: 19, hs: 58 }, { nick: "Brollan", kills: 10, deaths: 18, hs: 52 },
        { nick: "Spinx", kills: 8, deaths: 19, hs: 45 }
      ]}
    },
    {
      id: 2, map: "de_inferno", tournament: "Тестовый матч",
      team1: { name: "MOUZ", score: 13, players: [
        { nick: "torzsi", kills: 24, deaths: 14, hs: 70 }, { nick: "xertioN", kills: 22, deaths: 15, hs: 62 },
        { nick: "Jimpphat", kills: 20, deaths: 13, hs: 58 }, { nick: "Brollan", kills: 18, deaths: 16, hs: 52 },
        { nick: "Spinx", kills: 16, deaths: 17, hs: 45 }
      ]},
      team2: { name: "FURIA", score: 11, players: [
        { nick: "FalleN", kills: 18, deaths: 20, hs: 74 }, { nick: "yuurih", kills: 16, deaths: 19, hs: 65 },
        { nick: "KSCERATO", kills: 14, deaths: 21, hs: 60 }, { nick: "molodoy", kills: 11, deaths: 22, hs: 55 },
        { nick: "YEKINDAR", kills: 9, deaths: 23, hs: 48 }
      ]}
    }
  ]
};
