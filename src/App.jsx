import { useState, useEffect } from "react";

export default function App() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [standings, setStandings] = useState([]);
  const [matches, setMatches] = useState([]); // 경기 일정 데이터를 담을 공간 추가!
  const [scorers, setScorers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. 전체 순위
        if (selectedIndex === 0 && standings.length === 0) {
          const response = await fetch("/api/v4/competitions/PL/standings", {
            headers: { "X-Auth-Token": "ac5ab1a6a9754ba2bb017cfc31388208" }
          });
          const data = await response.json();
          if (data.standings) setStandings(data.standings[0].table);
        } 
        // 2. 경기 일정 (예정된 경기만 가져오기)
        else if (selectedIndex === 1 && matches.length === 0) {
          const response = await fetch("/api/v4/competitions/PL/matches?status=SCHEDULED", {
            headers: { "X-Auth-Token": "ac5ab1a6a9754ba2bb017cfc31388208" }
          });
          const data = await response.json();
          if (data.matches) {
            // 예정된 경기 중 딱 10개만 잘라서 가져옵니다.
            setMatches(data.matches.slice(0, 10));
          }
        }
        // 3. 득점 랭킹
        else if (selectedIndex === 2 && scorers.length === 0) {
          const response = await fetch("/api/v4/competitions/PL/scorers", {
            headers: { "X-Auth-Token": "ac5ab1a6a9754ba2bb017cfc31388208" }
          });
          const data = await response.json();
          if (data.scorers) setScorers(data.scorers);
        }
      } catch (error) {
        console.error("데이터를 불러오는데 실패했습니다:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedIndex, standings.length, matches.length, scorers.length]);

  const menuItems = [
    { label: "전체 순위" },
    { label: "경기 일정" },
    { label: "득점 랭킹" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow h-16 flex items-center px-8">
        <h1 className="text-2xl font-bold text-gray-800">EPL Live Dashboard</h1>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-56 bg-gray-900 text-gray-100 flex flex-col py-8 px-4">
          <nav className="flex flex-col gap-4">
            {menuItems.map((item, idx) => (
              <button
                key={item.label}
                className={`text-lg font-medium rounded px-3 py-2 text-left transition-colors ${
                  selectedIndex === idx
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-800 text-gray-300"
                }`}
                onClick={() => setSelectedIndex(idx)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>
        
        <main className="flex-1 bg-gray-100 p-8 overflow-y-auto">
          <div className="w-full h-full bg-white border border-gray-200 rounded-lg shadow-sm flex items-start justify-center min-h-[400px] p-6">
            
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <span className="text-xl font-bold text-gray-400 animate-pulse">데이터를 불러오는 중입니다... ⚽</span>
              </div>
            ) : selectedIndex === 0 ? (
              // --- 전체 순위 UI ---
              <div className="w-full max-w-5xl">
                <table className="w-full text-center border-collapse">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="py-4 px-4 font-semibold text-gray-600">순위</th>
                      <th className="py-4 px-4 font-semibold text-gray-600 text-left">클럽</th>
                      <th className="py-4 px-4 font-semibold text-gray-600">경기</th>
                      <th className="py-4 px-4 font-semibold text-gray-600">승</th>
                      <th className="py-4 px-4 font-semibold text-gray-600">무</th>
                      <th className="py-4 px-4 font-semibold text-gray-600">패</th>
                      <th className="py-4 px-4 font-bold text-blue-600">승점</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((team) => (
                      <tr key={team.team.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-gray-700">{team.position}</td>
                        <td className="py-3 px-4 flex items-center gap-4 text-left">
                          <img src={team.team.crest} alt={team.team.name} className="w-8 h-8 object-contain" />
                          <span className="font-bold text-gray-800">{team.team.shortName}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{team.playedGames}</td>
                        <td className="py-3 px-4 text-gray-600">{team.won}</td>
                        <td className="py-3 px-4 text-gray-600">{team.draw}</td>
                        <td className="py-3 px-4 text-gray-600">{team.lost}</td>
                        <td className="py-3 px-4 font-bold text-blue-600 text-lg">{team.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : selectedIndex === 1 ? (
              // --- 경기 일정 UI (새로 추가된 부분) ---
              <div className="w-full max-w-4xl flex flex-col gap-4">
                <h2 className="text-xl font-bold text-gray-800 mb-2 px-2">다가오는 경기 일정</h2>
                {matches.map((match) => {
                  // UTC 시간을 한국 시간으로 예쁘게 변환
                  const matchDate = new Date(match.utcDate);
                  const formattedDate = matchDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
                  const formattedTime = matchDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div key={match.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                      {/* 날짜 및 시간 영역 */}
                      <div className="flex flex-col items-center justify-center w-32 border-r border-gray-100 pr-4">
                        <span className="text-sm text-gray-500 font-medium">{formattedDate}</span>
                        <span className="text-lg font-bold text-blue-600">{formattedTime}</span>
                      </div>
                      
                      {/* 팀 대결 영역 */}
                      <div className="flex-1 flex items-center justify-center gap-8">
                        {/* 홈팀 */}
                        <div className="flex items-center gap-4 w-48 justify-end">
                          <span className="font-bold text-gray-800 text-right">{match.homeTeam.shortName}</span>
                          <img src={match.homeTeam.crest} alt={match.homeTeam.name} className="w-10 h-10 object-contain" />
                        </div>
                        
                        {/* VS 마크 */}
                        <div className="bg-gray-100 px-4 py-2 rounded-full text-sm font-bold text-gray-400">
                          VS
                        </div>
                        
                        {/* 어웨이팀 */}
                        <div className="flex items-center gap-4 w-48 justify-start">
                          <img src={match.awayTeam.crest} alt={match.awayTeam.name} className="w-10 h-10 object-contain" />
                          <span className="font-bold text-gray-800 text-left">{match.awayTeam.shortName}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : selectedIndex === 2 ? (
              // --- 득점 랭킹 UI ---
              <div className="w-full max-w-5xl">
                <table className="w-full text-center border-collapse">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="py-4 px-4 font-semibold text-gray-600">순위</th>
                      <th className="py-4 px-4 font-semibold text-gray-600">선수명</th>
                      <th className="py-4 px-4 font-semibold text-gray-600">소속팀</th>
                      <th className="py-4 px-4 font-semibold text-gray-600">득점</th>
                      <th className="py-4 px-4 font-semibold text-gray-600">도움</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scorers.map((scorer, idx) => (
                      <tr key={scorer.player.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-gray-700">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-gray-800">{scorer.player.name}</td>
                        <td className="py-3 px-4 flex items-center justify-center gap-3">
                          <img src={scorer.team.crest} alt={scorer.team.name} className="w-6 h-6 object-contain" />
                          <span className="text-gray-700">{scorer.team.shortName}</span>
                        </td>
                        <td className="py-3 px-4 font-bold text-blue-600 text-lg">{scorer.goals}</td>
                        <td className="py-3 px-4 text-gray-600">{scorer.assists || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
            
          </div>
        </main>
      </div>
    </div>
  );
}