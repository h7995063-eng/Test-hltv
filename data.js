const DATA = {
  teams: [
    { 
      id: 1, name: "FURIA", points: 960, wins: 12, losses: 4,
      players: [
        { nick: "FalleN", kills: 345, deaths: 280, hs: 72, rating: 1.15, avatar: "" },
        { nick: "yuurih", kills: 410, deaths: 310, hs: 68, rating: 1.22, avatar: "" },
        { nick: "KSCERATO", kills: 380, deaths: 290, hs: 65, rating: 1.18, avatar: "" },
        { nick: "molodoy", kills: 290, deaths: 320, hs: 58, rating: 1.02, avatar: "" },
        { nick: "YEKINDAR", kills: 310, deaths: 340, hs: 55, rating: 1.05, avatar: "" }
      ]
    },
    { 
      id: 2, name: "MOUZ", points: 808, wins: 10, losses: 5,
      players: [
        { nick: "torzsi", kills: 390, deaths: 300, hs: 74, rating: 1.20, avatar: "" },
        { nick: "xertioN", kills: 370, deaths: 310, hs: 66, rating: 1.14, avatar: "" },
        { nick: "Jimpphat", kills: 350, deaths: 280, hs: 62, rating: 1.16, avatar: "" },
        { nick: "Brollan", kills: 320, deaths: 330, hs: 60, rating: 1.08, avatar: "" },
        { nick: "Spinx", kills: 300, deaths: 320, hs: 57, rating: 1.05, avatar: "" }
      ]
    }
  ],
  matches: [
    {
      id: 1, map: "de_mirage", tournament: "IEM Katowice 2024",
      team1: { name: "Team Spirit", score: 13, players: [
        { nick: "donk", kills: 28, deaths: 10, hs: 82 }, { nick: "sh1ro", kills: 21, deaths: 12, hs: 65 }
      ]},
      team2: { name: "Vitality", score: 0, players: [
        { nick: "ZywOo", kills: 18, deaths: 17, hs: 70 }, { nick: "apEX", kills: 14, deaths: 18, hs: 62 }
      ]}
    }
  ]
};
