import { useState, useEffect } from "react";

export default function App() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [standings, setStandings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 컴포넌트가 처음 화면에 나타날 때 API에서 데이터를 가져오는 마법의 코드입니다.
  useEffect(() => {
    const fetchStandings = async () => {
      setIsLoading(true); // 로딩 시작
      try {
        const response = await fetch("/api/v4/competitions/PL/standings", {
          headers: {
            "X-Auth-Token": "ac5ab1a6a9754ba2bb017cfc31388208" // 발급받으신 API 키
          }
        });
        const data = await response.json();
        
        // 데이터가 정상적으로 들어왔다면 standings 상태에 저장합니다.
        if (data.standings && data.standings.length > 0) {
          setStandings(data.standings[0].table);
        }
      } catch (error) {
        console.error("데이터를 불러오는데 실패했습니다:", error);
      } finally {
        setIsLoading(false); // 로딩 끝
      }
    };

    fetchStandings();
  }, []);

  const menuItems = [
    { label: "전체 순위" },
    { label: "경기 일정", content: "경기 일정 데이터가 준비 중입니다." },
    { label: "득점 랭킹", content: "득점 랭킹 데이터가 준비 중입니다." },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow h-16 flex items-center px-8">
        <h1 className="text-2xl font-bold text-gray-800">EPL Live Dashboard</h1>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
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
        
        {/* Main Content */}
        <main className="flex-1 bg-gray-100 p-8 overflow-y-auto">
          <div className="w-full h-full bg-white border border-gray-200 rounded-lg shadow-sm flex items-start justify-center min-h-[400px] p-6">
            
            {/* 전체 순위 탭이 선택되었을 때 */}
            {selectedIndex === 0 ? (
              isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <span className="text-xl font-bold text-gray-400 animate-pulse">실시간 데이터를 불러오는 중입니다... ⚽</span>
                </div>
              ) : (
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
              )
            ) : (
              /* 다른 탭이 선택되었을 때 */
              <div className="flex items-center justify-center h-full">
                <span className="text-lg text-gray-400">
                  {menuItems[selectedIndex].content}
                </span>
              </div>
            )}
            
          </div>
        </main>
      </div>
    </div>
  );
}