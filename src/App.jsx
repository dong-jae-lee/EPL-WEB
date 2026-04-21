import { useState, useEffect } from "react";

export default function App() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [standings, setStandings] = useState([]);
  const [matches, setMatches] = useState([]);
  const [scorers, setScorers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (selectedIndex === 0 && standings.length === 0) {
          const response = await fetch("/api/v4/competitions/PL/standings", {
            headers: { "X-Auth-Token": "ac5ab1a6a9754ba2bb017cfc31388208" }
          });
          const data = await response.json();
          if (data.standings) setStandings(data.standings[0].table);
        } else if (selectedIndex === 1 && matches.length === 0) {
          const response = await fetch("/api/v4/competitions/PL/matches?status=SCHEDULED", {
            headers: { "X-Auth-Token": "ac5ab1a6a9754ba2bb017cfc31388208" }
          });
          const data = await response.json();
          if (data.matches) setMatches(data.matches.slice(0, 10));
        } else if (selectedIndex === 2 && scorers.length === 0) {
          const response = await fetch("/api/v4/competitions/PL/scorers", {
            headers: { "X-Auth-Token": "ac5ab1a6a9754ba2bb017cfc31388208" }
          });
          const data = await response.json();
          if (data.scorers) setScorers(data.scorers);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedIndex, standings.length, matches.length, scorers.length]);

  const menuItems = [
    { label: "Table" },
    { label: "Matches" },
    { label: "Top Scorers" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0a001a] text-white font-sans">
      {/* --- Header --- */}
      <header className="bg-[#1b0a3d] shadow-lg h-20 flex items-center justify-between px-10 border-b-2 border-[#ea007f]">
        <div className="flex items-center">
          {/* 로고 이미지를 제거하고 텍스트만 남겼습니다 */}
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Premier League</h1>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm font-bold text-gray-300 hover:text-white cursor-pointer">Matches</span>
          <span className="text-sm font-bold text-gray-300 hover:text-white cursor-pointer">Table</span>
          <span className="text-sm font-bold text-gray-300 hover:text-white cursor-pointer">Stats</span>
          <button className="bg-[#ea007f] text-white rounded-full px-5 py-2 text-sm font-bold shadow hover:scale-105 transition-transform">
            Sign In
          </button>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* --- Sidebar --- */}
        <aside className="w-60 bg-[#1b0a3d] text-gray-100 flex flex-col py-10 px-5 border-r border-gray-800 shadow-xl z-10">
          <nav className="flex flex-col gap-5">
            {menuItems.map((item, idx) => (
              <button
                key={item.label}
                className={`text-lg rounded-xl px-4 py-3 text-left transition-all duration-300 ${
                  selectedIndex === idx
                    ? "bg-[#0a001a] text-[#ea007f] font-bold border-l-4 border-[#ea007f]"
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                }`}
                onClick={() => setSelectedIndex(idx)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>
        
        {/* --- Main Content --- */}
        <main className="flex-1 bg-[#0a001a] p-8 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <span className="text-[#ea007f] font-bold text-xl animate-pulse">Loading Live Data... ⚽</span>
            </div>
          ) : selectedIndex === 0 ? (
            // --- 0. Table ---
            <div className="w-full max-w-5xl mx-auto bg-[#1b0a3d] border border-gray-800 rounded-2xl shadow-xl p-8">
              <table className="w-full text-center border-collapse">
                <thead className="bg-[#0a001a] border-b-2 border-[#ea007f]">
                  <tr>
                    <th className="py-4 px-4 font-semibold text-gray-300">#</th>
                    <th className="py-4 px-4 font-semibold text-gray-300 text-left">Club</th>
                    <th className="py-4 px-4 font-semibold text-gray-300">Played</th>
                    <th className="py-4 px-4 font-semibold text-gray-300">Won</th>
                    <th className="py-4 px-4 font-semibold text-gray-300">Drawn</th>
                    <th className="py-4 px-4 font-semibold text-gray-300">Lost</th>
                    <th className="py-4 px-4 font-extrabold text-[#02ff5f]">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((team) => (
                    <tr key={team.team.id} className="border-b border-gray-800 hover:bg-gray-800 transition-colors">
                      <td className="py-4 px-4 font-medium text-gray-300">{team.position}</td>
                      <td className="py-4 px-4 flex items-center gap-4 text-left">
                        <img src={team.team.crest} alt={team.team.name} className="w-8 h-8 object-contain" />
                        <span className="font-bold text-white text-lg">{team.team.shortName}</span>
                      </td>
                      <td className="py-4 px-4 text-gray-300">{team.playedGames}</td>
                      <td className="py-4 px-4 text-gray-300">{team.won}</td>
                      <td className="py-4 px-4 text-gray-300">{team.draw}</td>
                      <td className="py-4 px-4 text-gray-300">{team.lost}</td>
                      <td className="py-4 px-4 font-extrabold text-[#02ff5f] text-2xl tracking-tight">{team.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : selectedIndex === 1 ? (
            // --- 1. Matches ---
            <div className="w-full max-w-4xl mx-auto bg-[#1b0a3d] border border-gray-800 rounded-2xl shadow-xl p-8 flex flex-col gap-6">
              <h2 className="text-2xl font-extrabold text-white mb-4 px-2 uppercase tracking-tight">Upcoming matches</h2>
              {Object.entries(
                matches.reduce((groups, match) => {
                  const matchDate = new Date(match.utcDate);
                  const formattedDate = matchDate.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' });
                  if (!groups[formattedDate]) groups[formattedDate] = [];
                  groups[formattedDate].push(match);
                  return groups;
                }, {})
              ).map(([date, dateMatches]) => (
                <div key={date} className="space-y-4">
                  <div className="text-xl font-bold text-[#ea007f] border-b-2 border-gray-800 pb-2 px-2 uppercase tracking-tight">{date}</div>
                  {dateMatches.map((match) => {
                    const matchDate = new Date(match.utcDate);
                    const formattedTime = matchDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div key={match.id} className="bg-[#0a001a] border border-gray-800 rounded-xl p-5 flex items-center justify-between hover:border-[#ea007f] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                        <div className="flex flex-col items-center justify-center w-28 border-r border-gray-800 pr-4">
                          <span className="text-lg font-bold text-[#02ff5f]">{formattedTime}</span>
                        </div>
                        <div className="flex-1 flex items-center justify-center gap-10">
                          <div className="flex items-center gap-4 w-48 justify-end">
                            <span className="font-bold text-white text-lg tracking-tight text-right">{match.homeTeam.shortName}</span>
                            <img src={match.homeTeam.crest} alt={match.homeTeam.name} className="w-10 h-10 object-contain" />
                          </div>
                          <div className="bg-[#1b0a3d] border border-gray-700 px-6 py-3 rounded-xl text-lg font-extrabold text-gray-300 tracking-wider">
                            VS
                          </div>
                          <div className="flex items-center gap-4 w-48 justify-start">
                            <img src={match.awayTeam.crest} alt={match.awayTeam.name} className="w-10 h-10 object-contain" />
                            <span className="font-bold text-white text-lg tracking-tight text-left">{match.awayTeam.shortName}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : selectedIndex === 2 ? (
            // --- 2. Top Scorers ---
            <div className="w-full max-w-5xl mx-auto bg-[#1b0a3d] border border-gray-800 rounded-2xl shadow-xl p-8">
              <table className="w-full text-center border-collapse">
                <thead className="bg-[#0a001a] border-b-2 border-[#ea007f]">
                  <tr>
                    <th className="py-4 px-4 font-semibold text-gray-300">#</th>
                    <th className="py-4 px-4 font-semibold text-gray-300">Player</th>
                    <th className="py-4 px-4 font-semibold text-gray-300">Club</th>
                    <th className="py-4 px-4 font-extrabold text-[#02ff5f]">Goals</th>
                    <th className="py-4 px-4 font-semibold text-gray-300">Assists</th>
                  </tr>
                </thead>
                <tbody>
                  {scorers.map((scorer, idx) => (
                    <tr key={scorer.player.id} className="border-b border-gray-800 hover:bg-gray-800 transition-colors">
                      <td className="py-4 px-4 font-medium text-gray-300">{idx + 1}</td>
                      <td className="py-4 px-4 font-extrabold text-white text-xl">{scorer.player.name}</td>
                      <td className="py-4 px-4 flex items-center justify-center gap-3">
                        <img src={scorer.team.crest} alt={scorer.team.name} className="w-6 h-6 object-contain" />
                        <span className="text-gray-300 text-lg font-bold">{scorer.team.shortName}</span>
                      </td>
                      <td className="py-4 px-4 font-extrabold text-[#02ff5f] text-2xl tracking-tight">{scorer.goals}</td>
                      <td className="py-4 px-4 text-gray-300">{scorer.assists || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}