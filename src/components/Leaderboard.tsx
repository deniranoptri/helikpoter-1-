import React, { useState, useEffect } from 'react';
import { LocalSessionStore } from '../storage/LocalSessionStore';
import { SessionResultSnapshot } from '../engine/ScoreEngine';
import * as XLSX from 'xlsx';

interface LeaderboardProps {
  onClose: () => void;
}

export function Leaderboard({ onClose }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<'SOLO' | 'DUEL' | 'SQUAD'>('SOLO');
  const [results, setResults] = useState<SessionResultSnapshot[]>([]);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = () => {
    setResults(LocalSessionStore.load());
  };

  const handleDelete = (sessionId: string) => {
    LocalSessionStore.remove(sessionId);
    loadResults();
  };

  const handleClearAll = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus SEMUA hasil?")) {
      LocalSessionStore.clear();
      loadResults();
    }
  };

  const handleExport = () => {
    const data = results.map((r, index) => {
      const row: any = {
        No: index + 1,
        Mode: r.gameMode === 'SOLO' ? 'PETUALANG' : r.gameMode === 'DUEL' ? 'DUEL' : 'TEAM DUEL',
        'Jenjang': r.jenjang,
        'Mata Pelajaran': r.mataPelajaran,
        'Tanggal': new Date(r.timestamp).toLocaleDateString('id-ID'),
        'Waktu': new Date(r.timestamp).toLocaleTimeString('id-ID'),
        'Durasi (detik)': r.duration,
        'Hasil / Juara': r.winner,
      };

      if (r.gameMode === 'SOLO') {
        row['Nama'] = r.p1Name || 'Tanpa Nama';
        row['Skor'] = r.players.P1?.totalScore || 0;
      } else if (r.gameMode === 'DUEL') {
        row['Pemain 1'] = r.p1Name || 'Tanpa Nama';
        row['Skor P1'] = r.players.P1?.totalScore || 0;
        row['Pemain 2'] = r.p2Name || 'Tanpa Nama';
        row['Skor P2'] = r.players.P2?.totalScore || 0;
      } else if (r.gameMode === 'SQUAD') {
        row['Team A'] = `${r.p1Name || 'P1'} & ${r.p2Name || 'P2'}`;
        row['Skor Team A'] = r.teamScore?.teamA || 0;
        row['Team B'] = `${r.p3Name || 'P3'} & ${r.p4Name || 'P4'}`;
        row['Skor Team B'] = r.teamScore?.teamB || 0;
      }

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leaderboard");
    XLSX.writeFile(workbook, "heli-rescue-leaderboard.xlsx");
  };

  const filteredResults = results
    .filter(r => r.gameMode === activeTab)
    .sort((a, b) => {
      if (activeTab === 'SOLO') {
        return (b.players.P1?.totalScore || 0) - (a.players.P1?.totalScore || 0);
      } else if (activeTab === 'DUEL') {
        const maxA = Math.max(a.players.P1?.totalScore || 0, a.players.P2?.totalScore || 0);
        const maxB = Math.max(b.players.P1?.totalScore || 0, b.players.P2?.totalScore || 0);
        return maxB - maxA;
      } else {
        const maxA = Math.max(a.teamScore?.teamA || 0, a.teamScore?.teamB || 0);
        const maxB = Math.max(b.teamScore?.teamA || 0, b.teamScore?.teamB || 0);
        return maxB - maxA;
      }
    });

  return (
    <div className="absolute inset-0 z-[100] bg-slate-900 flex flex-col p-4 sm:p-8 animate-pop-in overflow-hidden">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h2 className="text-3xl font-black text-amber-400 drop-shadow-md">🏆 JUARA</h2>
        <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg border border-slate-600 transition-colors">TUTUP</button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 shrink-0">
        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700 w-full sm:w-auto">
          <button onClick={() => setActiveTab('SOLO')} className={`flex-1 sm:px-6 py-2 rounded-md font-bold text-sm transition-colors ${activeTab === 'SOLO' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>PETUALANG</button>
          <button onClick={() => setActiveTab('DUEL')} className={`flex-1 sm:px-6 py-2 rounded-md font-bold text-sm transition-colors ${activeTab === 'DUEL' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>DUEL</button>
          <button onClick={() => setActiveTab('SQUAD')} className={`flex-1 sm:px-6 py-2 rounded-md font-bold text-sm transition-colors ${activeTab === 'SQUAD' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>TEAM DUEL</button>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
           <button onClick={handleExport} className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg border border-emerald-400 shadow-md transition-colors text-sm">📥 EXCEL</button>
           <button onClick={handleClearAll} className="flex-1 sm:flex-none px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg border border-rose-400 shadow-md transition-colors text-sm">🗑️ HAPUS SEMUA</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-800 rounded-xl border border-slate-700 p-2 sm:p-4 shadow-inner">
        {filteredResults.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 font-bold">Belum ada data juara.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredResults.map((result, index) => (
              <div key={result.sessionId} className="bg-slate-900 p-3 sm:p-4 rounded-lg border border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-500 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-black text-slate-300 border border-slate-600 shrink-0">{index + 1}</div>
                  <div className="flex flex-col">
                    <div className="text-sm font-bold text-white">
                      {activeTab === 'SOLO' && (
                        <span>{result.p1Name || <span className="text-slate-500 italic">Tanpa Nama</span>}</span>
                      )}
                      {activeTab === 'DUEL' && (
                        <span>
                          <span className={result.winner.includes('PEMAIN 1') ? 'text-emerald-400' : 'text-slate-400'}>{result.p1Name || 'P1'}</span>
                          <span className="text-slate-600 mx-2">VS</span>
                          <span className={result.winner.includes('PEMAIN 2') ? 'text-blue-400' : 'text-slate-400'}>{result.p2Name || 'P2'}</span>
                        </span>
                      )}
                      {activeTab === 'SQUAD' && (
                        <div className="flex flex-col text-xs sm:text-sm">
                          <span className={result.winner.includes('TEAM A') ? 'text-emerald-400' : 'text-slate-400'}>Team A ({result.p1Name || 'P1'}, {result.p2Name || 'P2'}) - {result.teamScore?.teamA}</span>
                          <span className={result.winner.includes('TEAM B') ? 'text-yellow-400' : 'text-slate-400'}>Team B ({result.p3Name || 'P3'}, {result.p4Name || 'P4'}) - {result.teamScore?.teamB}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {new Date(result.timestamp).toLocaleDateString('id-ID')} • {result.jenjang} • {result.mataPelajaran}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                  <div className="flex flex-col items-end">
                    <div className="text-sm text-slate-400 font-bold uppercase tracking-widest">{activeTab === 'SOLO' ? 'SKOR' : 'HASIL'}</div>
                    <div className="text-lg sm:text-xl font-black text-amber-400">
                      {activeTab === 'SOLO' ? (result.players.P1?.totalScore?.toLocaleString('id-ID') || 0) : result.winner}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(result.sessionId)} className="w-8 h-8 flex items-center justify-center rounded bg-slate-800 hover:bg-rose-600/20 text-slate-500 hover:text-rose-400 transition-colors shrink-0" title="Hapus">
                    ✖
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
