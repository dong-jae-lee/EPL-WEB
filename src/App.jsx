import { useState, useEffect } from "react";

export default function App() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [standings, setStandings] = useState([]);
  const [matches, setMatches] = useState([]);
  const [results, setResults] = useState([]);
  const [scorers, setScorers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 최애 팀 상태
  const [favTeam, setFavTeam] = useState(() => {
    const saved = localStorage.getItem("favTeam");
    return saved ? JSON.parse(saved) : null;
  });

  // 팝업(Modal)을 위한 상태 관리
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [teamDetails, setTeamDetails] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  useEffect(() => {
    if (favTeam) localStorage.setItem("favTeam", JSON.stringify(favTeam));
    else localStorage.removeItem("favTeam");
  }, [favTeam]);

  // 대시보드 메인 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (selectedIndex === 0 && standings.length === 0) {
          const response = await fetch("/api/v4/competitions/PL/standings", { headers: { "X-Auth-Token": "ac5ab1a6a9754ba2bb017cfc31388208" } });
          const data = await response.json();
          if (data.standings) setStandings(data.standings[0].table);
        } else if (selectedIndex === 1 && matches.length === 0) {
          const response = await fetch("/api/v4/competitions/PL/matches?status=SCHEDULED", { headers: { "X-Auth-Token": "ac5ab1a6a9754ba2bb017cfc31388208" } });
          const data = await response.json();
          if (data.matches) setMatches(data.matches.slice(0, 15));
        } else if (selectedIndex === 2 && results.length === 0) {
          const response = await fetch("/api/v4/competitions/PL/matches?status=FINISHED,IN_PLAY,PAUSED", { headers: { "X-Auth-Token": "ac5ab1a6a9754ba2bb017cfc31388208" } });
          const data = await response.json();
          if (data.matches) {
            const sortedResults = data.matches.sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate));
            setResults(sortedResults.slice(0, 15));
          }
        } else if (selectedIndex === 3 && scorers.length === 0) {
          const response = await fetch("/api/v4/competitions/PL/scorers", { headers: { "X-Auth-Token": "ac5ab1a6a9754ba2bb017cfc31388208" } });
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
  }, [selectedIndex, standings.length, matches.length, results.length, scorers.length]);

  // 선택된 팀의 상세 정보 가져오기
  useEffect(() => {
    if (!selectedTeamId) {
      setTeamDetails(null);
      return;
    }
    const fetchTeamDetails = async () => {
      setIsModalLoading(true);
      try {
        const response = await fetch(`/api/v4/teams/${selectedTeamId}`, {
          headers: { "X-Auth-Token": "ac5ab1a6a9754ba2bb017cfc31388208" }
        });
        const data = await response.json();
        setTeamDetails(data);
      } catch (error) {
        console.error("Failed to fetch team details:", error);
      } finally {
        setIsModalLoading(false);
      }
    };
    fetchTeamDetails();
  }, [selectedTeamId]);

  const menuItems = [{ label: "Table" }, { label: "Matches" }, { label: "Results & Live" }, { label: "Top Scorers" }];

  return (
    <div className="min-h-screen flex flex-col bg-[#0a001a] text-white font-sans relative">
      <header className="bg-[#1b0a3d] shadow-lg h-24 flex items-center justify-between px-10 border-b-2 border-[#ea007f] shrink-0 z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-extrabold tracking-tight">Premier League</h1>
        </div>
        <button className="bg-[#ea007f] text-white rounded-full px-5 py-2 text-sm font-bold shadow hover:scale-105 transition-transform">Sign In</button>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-60 bg-[#1b0a3d] text-gray-100 flex flex-col py-10 px-5 border-r border-gray-800 shadow-xl z-10">
          <nav className="flex flex-col gap-5">
            {menuItems.map((item, idx) => (
              <button key={item.label} className={`text-lg rounded-xl px-4 py-3 text-left transition-all duration-300 ${selectedIndex === idx ? "bg-[#0a001a] text-[#ea007f] font-bold border-l-4 border-[#ea007f]" : "text-gray-300 hover:text-white hover:bg-gray-800"}`} onClick={() => setSelectedIndex(idx)}>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>
        
        <main className="flex-1 bg-[#0a001a] p-8 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-full"><span className="text-[#ea007f] font-bold text-xl animate-pulse">Loading Live Data... ⚽</span></div>
          ) : selectedIndex === 0 ? (
            <div className="w-full max-w-5xl mx-auto bg-[#1b0a3d] border border-gray-800 rounded-2xl shadow-xl p-8">
              <table className="w-full text-center border-collapse">
                <thead className="bg-[#0a001a] border-b-2 border-[#ea007f]">
                  <tr>
                    <th className="py-4 px-4 font-semibold text-gray-300">#</th><th className="py-4 px-4 font-semibold text-gray-300 text-left">Club</th><th className="py-4 px-4 font-semibold text-gray-300">Played</th><th className="py-4 px-4 font-semibold text-gray-300">Won</th><th className="py-4 px-4 font-semibold text-gray-300">Drawn</th><th className="py-4 px-4 font-semibold text-gray-300">Lost</th><th className="py-4 px-4 font-extrabold text-[#02ff5f]">Points</th><th className="py-4 px-4 font-semibold text-gray-300">Fav</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((team) => (
                    <tr key={team.team.id} className={`border-b border-gray-800 hover:bg-gray-800 transition-colors ${favTeam?.id === team.team.id ? "bg-[#ea007f]/10" : ""}`}>
                      <td className="py-4 px-4 font-medium text-gray-300">{team.position}</td>
                      <td className="py-4 px-4 flex items-center gap-4 text-left cursor-pointer group" onClick={() => setSelectedTeamId(team.team.id)}>
                        <img src={team.team.crest} alt={team.team.name} className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" />
                        <span className={`font-bold text-lg group-hover:text-[#ea007f] transition-colors ${favTeam?.id === team.team.id ? "text-[#ea007f]" : "text-white"}`}>{team.team.shortName}</span>
                      </td>
                      <td className="py-4 px-4 text-gray-300">{team.playedGames}</td><td className="py-4 px-4 text-gray-300">{team.won}</td><td className="py-4 px-4 text-gray-300">{team.draw}</td><td className="py-4 px-4 text-gray-300">{team.lost}</td><td className="py-4 px-4 font-extrabold text-[#02ff5f] text-2xl tracking-tight">{team.points}</td>
                      <td className="py-4 px-4">
                        <button onClick={() => setFavTeam(favTeam?.id === team.team.id ? null : { id: team.team.id, name: team.team.name, crest: team.team.crest })} className={`text-2xl transition-transform hover:scale-125 ${favTeam?.id === team.team.id ? "text-yellow-400" : "text-gray-600 hover:text-gray-400"}`}>
                          {favTeam?.id === team.team.id ? "★" : "☆"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : selectedIndex === 1 ? (
            // --- 1. Matches (날짜 표시 추가 완료) ---
            <div className="w-full max-w-4xl mx-auto bg-[#1b0a3d] border border-gray-800 rounded-2xl shadow-xl p-8 flex flex-col gap-6">
              <h2 className="text-2xl font-extrabold uppercase tracking-tight">Upcoming Matches</h2>
              {Object.entries(matches.reduce((groups, match) => {
                const date = new Date(match.utcDate).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' });
                if (!groups[date]) groups[date] = [];
                groups[date].push(match);
                return groups;
              }, {})).map(([date, dateMatches]) => (
                <div key={date} className="space-y-4">
                  <div className="text-xl font-bold text-[#ea007f] border-b-2 border-gray-800 pb-2 uppercase tracking-tight">{date}</div>
                  {dateMatches.map((match) => (
                    <div key={match.id} className={`bg-[#0a001a] border rounded-xl p-5 flex items-center justify-between hover:shadow-2xl transition-all ${(favTeam && (match.homeTeam.id === favTeam.id || match.awayTeam.id === favTeam.id)) ? "border-[#ea007f] border-2" : "border-gray-800"}`}>
                      {/* 왼쪽 시간 영역에 날짜 정보 추가 */}
                      <div className="w-28 border-r border-gray-800 pr-4 text-center flex flex-col justify-center">
                        <span className="text-xs text-gray-400 font-medium mb-1">
                          {new Date(match.utcDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-lg font-bold text-[#02ff5f]">
                          {new Date(match.utcDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex-1 flex items-center justify-center gap-10">
                        <div className="flex items-center gap-4 w-48 justify-end cursor-pointer group" onClick={() => setSelectedTeamId(match.homeTeam.id)}>
                          <span className={`font-bold text-lg group-hover:text-[#ea007f] transition-colors ${match.homeTeam.id === favTeam?.id ? "text-[#ea007f]" : ""}`}>{match.homeTeam.shortName}</span>
                          <img src={match.homeTeam.crest} className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" alt="" />
                        </div>
                        <div className="bg-[#1b0a3d] border border-gray-700 px-6 py-3 rounded-xl text-lg font-extrabold text-gray-300">VS</div>
                        <div className="flex items-center gap-4 w-48 justify-start cursor-pointer group" onClick={() => setSelectedTeamId(match.awayTeam.id)}>
                          <img src={match.awayTeam.crest} className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" alt="" />
                          <span className={`font-bold text-lg group-hover:text-[#ea007f] transition-colors ${match.awayTeam.id === favTeam?.id ? "text-[#ea007f]" : ""}`}>{match.awayTeam.shortName}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : selectedIndex === 2 ? (
            // --- 2. Results & Live ---
            <div className="w-full max-w-4xl mx-auto bg-[#1b0a3d] border border-gray-800 rounded-2xl shadow-xl p-8 flex flex-col gap-6">
              <h2 className="text-2xl font-extrabold uppercase tracking-tight">Results & Live</h2>
              <div className="space-y-4">
                {results.map((match) => {
                  const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED';
                  const isFavMatch = favTeam && (match.homeTeam.id === favTeam.id || match.awayTeam.id === favTeam.id);
                  return (
                    <div key={match.id} className={`bg-[#0a001a] border rounded-xl p-5 flex items-center justify-between hover:shadow-2xl transition-all ${isFavMatch ? "border-[#ea007f] border-2" : "border-gray-800"}`}>
                      <div className="w-28 border-r border-gray-800 pr-4 text-center flex flex-col justify-center">
                        <span className="text-xs font-medium text-gray-400 mb-1">{new Date(match.utcDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span className={`text-lg font-extrabold ${isLive ? 'text-[#ea007f] animate-pulse' : 'text-gray-500'}`}>{isLive ? 'LIVE' : 'FT'}</span>
                      </div>
                      <div className="flex-1 flex items-center justify-center gap-10">
                        <div className="flex items-center gap-4 w-48 justify-end cursor-pointer group" onClick={() => setSelectedTeamId(match.homeTeam.id)}>
                          <span className={`font-bold text-lg group-hover:text-[#ea007f] transition-colors ${match.homeTeam.id === favTeam?.id ? "text-[#ea007f]" : ""}`}>{match.homeTeam.shortName}</span>
                          <img src={match.homeTeam.crest} className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" alt="" />
                        </div>
                        <div className={`bg-[#1b0a3d] border px-6 py-3 rounded-xl text-2xl font-extrabold ${isLive ? 'border-[#ea007f] text-[#ea007f]' : 'border-gray-700 text-white'}`}>
                          {match.score.fullTime.home ?? 0} - {match.score.fullTime.away ?? 0}
                        </div>
                        <div className="flex items-center gap-4 w-48 justify-start cursor-pointer group" onClick={() => setSelectedTeamId(match.awayTeam.id)}>
                          <img src={match.awayTeam.crest} className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" alt="" />
                          <span className={`font-bold text-lg group-hover:text-[#ea007f] transition-colors ${match.awayTeam.id === favTeam?.id ? "text-[#ea007f]" : ""}`}>{match.awayTeam.shortName}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : selectedIndex === 3 ? (
             <div className="w-full max-w-5xl mx-auto bg-[#1b0a3d] border border-gray-800 rounded-2xl shadow-xl p-8">
              <table className="w-full text-center border-collapse">
                <thead className="bg-[#0a001a] border-b-2 border-[#ea007f]">
                  <tr><th className="py-4 px-4 font-semibold text-gray-300">#</th><th className="py-4 px-4 font-semibold text-gray-300">Player</th><th className="py-4 px-4 font-semibold text-gray-300">Club</th><th className="py-4 px-4 font-extrabold text-[#02ff5f]">Goals</th><th className="py-4 px-4 font-semibold text-gray-300">Assists</th></tr>
                </thead>
                <tbody>
                  {scorers.map((scorer, idx) => (
                    <tr key={scorer.player.id} className="border-b border-gray-800 hover:bg-gray-800 transition-colors">
                      <td className="py-4 px-4 font-medium text-gray-300">{idx + 1}</td>
                      <td className="py-4 px-4 font-extrabold text-white text-xl">{scorer.player.name}</td>
                      <td className="py-4 px-4 flex items-center justify-center gap-3 cursor-pointer group" onClick={() => setSelectedTeamId(scorer.team.id)}>
                        <img src={scorer.team.crest} alt={scorer.team.name} className="w-6 h-6 object-contain group-hover:scale-110 transition-transform" />
                        <span className={`text-lg font-bold group-hover:text-[#ea007f] transition-colors ${favTeam?.id === scorer.team.id ? "text-[#ea007f]" : "text-gray-300"}`}>{scorer.team.shortName}</span>
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

      {/* 팀 상세 정보 모달 */}
      {selectedTeamId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedTeamId(null)}>
          <div className="bg-[#1b0a3d] border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            {isModalLoading || !teamDetails ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <span className="text-[#ea007f] text-4xl animate-bounce">⚽</span>
                <span className="text-gray-400 font-bold animate-pulse">Loading Team Data...</span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-[#0a001a] rounded-t-2xl shrink-0">
                  <div className="flex items-center gap-5">
                    <div className="bg-white p-2 rounded-xl">
                      <img src={teamDetails.crest} alt={teamDetails.name} className="w-16 h-16 object-contain" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-extrabold text-white tracking-tight">{teamDetails.name}</h2>
                      <span className="text-[#ea007f] font-bold text-sm uppercase tracking-wider">{teamDetails.shortName} • Est. {teamDetails.founded}</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedTeamId(null)} className="text-gray-500 hover:text-white bg-gray-800 hover:bg-[#ea007f] rounded-full w-10 h-10 flex items-center justify-center transition-colors">✕</button>
                </div>
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-[#0a001a] p-4 rounded-xl border border-gray-800">
                      <span className="text-xs text-gray-500 uppercase block mb-1">Head Coach</span>
                      <span className="font-bold text-white text-lg">{teamDetails.coach?.name || "N/A"}</span>
                    </div>
                    <div className="bg-[#0a001a] p-4 rounded-xl border border-gray-800">
                      <span className="text-xs text-gray-500 uppercase block mb-1">Stadium (Venue)</span>
                      <span className="font-bold text-white text-lg">{teamDetails.venue || "N/A"}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2 flex justify-between">
                    First Team Squad <span className="text-[#02ff5f] text-sm">{teamDetails.squad?.length || 0} Players</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {teamDetails.squad?.map((player) => (
                      <div key={player.id} className="bg-[#0a001a] border border-gray-800 p-3 rounded-lg flex items-center justify-between hover:border-gray-500 transition-colors">
                        <span className="font-bold text-sm text-gray-200">{player.name}</span>
                        <span className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-[#1b0a3d] text-gray-400 border border-gray-700">
                          {player.position?.replace("Goalkeeper", "GK").replace("Defence", "DEF").replace("Midfield", "MID").replace("Offence", "FWD") || "N/A"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}