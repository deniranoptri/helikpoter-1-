import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { TeacherBankStore, TeacherBankRecord } from '../storage/TeacherBankStore';
import { EducationalContent } from '../engine/EducationalEngine';

interface TeacherBankModalProps {
  onClose: () => void;
}

export function TeacherBankModal({ onClose }: TeacherBankModalProps) {
  const [datasets, setDatasets] = useState<Record<string, TeacherBankRecord>>({});
  const [jenjang, setJenjang] = useState<string>('SD');
  const [fase, setFase] = useState<string>('');
  const [mapel, setMapel] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    total: number;
    valid: number;
    invalid: number;
    errors: string[];
    parsedQuestions: EducationalContent[];
  } | null>(null);

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = () => {
    setDatasets(TeacherBankStore.loadAll());
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      {
        PERTANYAAN: 'Apa warna langit saat cerah?',
        JAWABAN_BENAR: 'Biru',
        PENGECOH_1: 'Hijau',
        PENGECOH_2: 'Kuning',
        PENGECOH_3: 'Merah',
        PENJELASAN: 'Langit terlihat biru karena hamburan Rayleigh.',
        LEVEL_KESULITAN: 'EASY',
        TIPE_SOAL: 'IDENTIFY',
        CP_ID: '',
        TP_ID: ''
      }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Soal');
    XLSX.writeFile(wb, 'Template_Soal_Guru.xlsx');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setValidationResult(null);
    }
  };

  const validateFile = async () => {
    if (!file) return;
    if (!jenjang) {
      alert('Pilih Jenjang terlebih dahulu!');
      return;
    }
    const normalizedMapel = mapel.trim();
    if (!normalizedMapel) {
      alert('Masukkan Mata Pelajaran terlebih dahulu!');
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        let validCount = 0;
        let invalidCount = 0;
        const errors: string[] = [];
        const parsedQuestions: EducationalContent[] = [];

        rows.forEach((row, index) => {
          const rowNum = index + 2; // +1 for 0-index, +1 for header
          
          const pertanyaan = String(row['PERTANYAAN'] || '').trim();
          const jawabanBenar = String(row['JAWABAN_BENAR'] || '').trim();
          const p1 = String(row['PENGECOH_1'] || '').trim();
          const p2 = String(row['PENGECOH_2'] || '').trim();
          const p3 = String(row['PENGECOH_3'] || '').trim();
          const penjelasan = String(row['PENJELASAN'] || '').trim();
          
          const levelKesulitanRaw = String(row['LEVEL_KESULITAN'] || row['Level Kesulitan'] || '').trim().toUpperCase();
          const tipeSoalRaw = String(row['TIPE_SOAL'] || row['Tipe Soal'] || '').trim().toUpperCase();
          const cpIdRaw = String(row['CP_ID'] || row['CP ID'] || '').trim();
          const tpIdRaw = String(row['TP_ID'] || row['TP ID'] || '').trim();
          
          const validDifficulties = ['EASY', 'MEDIUM', 'HARD'];
          const difficulty = validDifficulties.includes(levelKesulitanRaw) ? (levelKesulitanRaw as any) : 'MEDIUM';
          
          const validChallengeTypes = ['IDENTIFY', 'CALCULATE', 'CLASSIFY', 'SEQUENCE', 'LOCATE', 'PRIORITIZE', 'MULTI_TARGET', 'LEGACY'];
          const challengeType = validChallengeTypes.includes(tipeSoalRaw) ? (tipeSoalRaw as any) : 'IDENTIFY';

          if (!pertanyaan && !jawabanBenar && !p1 && !p2 && !p3) {
            // Skip completely empty row silently
            return;
          }

          if (!pertanyaan) {
            errors.push(`Baris ${rowNum} — PERTANYAAN kosong`);
            invalidCount++;
            return;
          }
          if (!jawabanBenar) {
            errors.push(`Baris ${rowNum} — JAWABAN_BENAR kosong`);
            invalidCount++;
            return;
          }
          if (!p1) {
            errors.push(`Baris ${rowNum} — PENGECOH_1 kosong`);
            invalidCount++;
            return;
          }

          const pengecohList = [p1, p2, p3].filter(Boolean);
          const allOptions = [jawabanBenar, ...pengecohList];
          
          const uniqueOptions = new Set(allOptions);
          if (uniqueOptions.size !== allOptions.length) {
             errors.push(`Baris ${rowNum} — Ada opsi yang duplikat (jawaban benar atau pengecoh sama)`);
             invalidCount++;
             return;
          }

          const qId = `guru_${jenjang}_${normalizedMapel}_${Date.now()}_${index}`.toLowerCase().replace(/[^a-z0-9_]/g, '_');

          const isTrueFalse = allOptions.length === 2 && 
                              allOptions.some(o => o.toLowerCase() === 'benar' || o.toLowerCase() === 'true') && 
                              allOptions.some(o => o.toLowerCase() === 'salah' || o.toLowerCase() === 'false');
          
          let options = [...allOptions];
          if (!isTrueFalse && challengeType === 'IDENTIFY') {
             for (let i = options.length - 1; i > 0; i--) {
                 const j = Math.floor(Math.random() * (i + 1));
                 [options[i], options[j]] = [options[j], options[i]];
             }
          }

          parsedQuestions.push({
            id: qId,
            jenjang,
            kelasAtauFase: fase.trim() || undefined,
            mataPelajaran: normalizedMapel,
            pertanyaan,
            jawabanBenar,
            pengecoh: pengecohList,
            options,
            explanation: penjelasan,
            difficulty,
            challengeType,
            cpId: cpIdRaw || undefined,
            tpId: tpIdRaw || undefined
          });
          validCount++;
        });

        setValidationResult({
          total: validCount + invalidCount,
          valid: validCount,
          invalid: invalidCount,
          errors,
          parsedQuestions
        });
      } catch (err: any) {
        setValidationResult({
          total: 0,
          valid: 0,
          invalid: 1,
          errors: [`Gagal membaca file: ${err.message}`],
          parsedQuestions: []
        });
      } finally {
        setIsValidating(false);
      }
    };
    reader.onerror = () => {
      setValidationResult({
        total: 0,
        valid: 0,
        invalid: 1,
        errors: ['Gagal membaca file.'],
        parsedQuestions: []
      });
      setIsValidating(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const saveBank = () => {
    if (!validationResult || validationResult.invalid > 0 || validationResult.valid === 0) return;
    try {
      TeacherBankStore.save(jenjang, mapel.trim(), validationResult.parsedQuestions, fase.trim() || undefined);
      alert('Bank soal guru berhasil disimpan!');
      setFile(null);
      setMapel('');
      setFase('');
      setValidationResult(null);
      loadDatasets();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const deleteDataset = (id: string) => {
    if (confirm('Yakin ingin menghapus soal ini?')) {
      TeacherBankStore.remove(id);
      loadDatasets();
    }
  };

  const exportDataset = (record: TeacherBankRecord) => {
    const wsData = record.questions.map(q => ({
      PERTANYAAN: q.pertanyaan,
      JAWABAN_BENAR: q.jawabanBenar,
      PENGECOH_1: q.pengecoh?.[0] || '',
      PENGECOH_2: q.pengecoh?.[1] || '',
      PENGECOH_3: q.pengecoh?.[2] || '',
      PENJELASAN: q.explanation || ''
    }));
    
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Soal');
    XLSX.writeFile(wb, `Soal_Guru_${record.jenjang}_${record.mataPelajaran}.xlsx`);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 w-full max-w-2xl rounded-2xl border-2 border-indigo-500/50 flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800 rounded-t-2xl shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📚</span>
            <h2 className="text-xl font-black text-white">BANK SOAL GURU</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-8">
          
          {/* UPLOAD SECTION */}
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <h3 className="text-lg font-bold text-indigo-400 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              Tambah Soal Baru
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">Jenjang</label>
                <select value={jenjang} onChange={e => setJenjang(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg p-2 border border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">Fase / Kelas</label>
                <input type="text" value={fase} onChange={e => setFase(e.target.value)} placeholder="Opsional (misal: Fase A)" className="w-full bg-slate-700 text-white rounded-lg p-2 border border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">Mata Pelajaran</label>
                <input type="text" value={mapel} onChange={e => setMapel(e.target.value)} placeholder="Contoh: Matematika" className="w-full bg-slate-700 text-white rounded-lg p-2 border border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <button onClick={downloadTemplate} className="w-full sm:w-auto px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Template XLSX
              </button>
              
              <div className="w-full sm:flex-1 relative">
                <input type="file" accept=".xlsx" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className={`px-4 py-2 rounded-lg text-sm font-semibold text-center border-2 border-dashed ${file ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300' : 'border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500'}`}>
                  {file ? file.name : 'Pilih File XLSX'}
                </div>
              </div>
            </div>

            {file && (
              <div className="mt-4 flex justify-end">
                <button onClick={validateFile} disabled={isValidating} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg disabled:opacity-50 transition-colors">
                  {isValidating ? 'Memvalidasi...' : 'Validasi File'}
                </button>
              </div>
            )}

            {validationResult && (
              <div className={`mt-4 p-4 rounded-lg border ${validationResult.invalid > 0 ? 'bg-red-900/30 border-red-500/50' : 'bg-emerald-900/30 border-emerald-500/50'}`}>
                <h4 className={`font-bold mb-2 ${validationResult.invalid > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  Hasil Validasi: {validationResult.invalid > 0 ? 'Gagal' : 'Sukses'}
                </h4>
                <div className="flex gap-4 text-sm text-slate-300 mb-2">
                  <span>Total: <strong>{validationResult.total}</strong></span>
                  <span className="text-emerald-400">Valid: <strong>{validationResult.valid}</strong></span>
                  <span className={validationResult.invalid > 0 ? 'text-red-400' : ''}>Tidak Valid: <strong>{validationResult.invalid}</strong></span>
                </div>
                
                {validationResult.errors.length > 0 && (
                  <div className="mt-3 max-h-32 overflow-y-auto bg-black/40 rounded p-2 text-xs text-red-300 font-mono">
                    {validationResult.errors.map((err, i) => (
                      <div key={i} className="mb-1">{err}</div>
                    ))}
                  </div>
                )}

                {validationResult.invalid === 0 && validationResult.valid > 0 && (
                  <div className="mt-4 flex justify-end">
                    <button onClick={saveBank} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-colors">
                      Simpan Bank Soal
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* LIST SECTION */}
          <div>
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-lg font-bold text-slate-200">Soal Tersimpan</h3>
              {Object.keys(datasets).length > 0 && (
                <button onClick={() => {
                  if (confirm('Yakin ingin menghapus SEMUA soal guru?')) {
                    TeacherBankStore.clearAll();
                    loadDatasets();
                  }
                }} className="text-xs text-red-400 hover:text-red-300 font-semibold px-3 py-1 bg-red-500/10 hover:bg-red-500/20 rounded">
                  Hapus Semua
                </button>
              )}
            </div>
            
            {Object.keys(datasets).length === 0 ? (
              <div className="text-center p-8 bg-slate-800/30 rounded-xl border border-slate-700/50 text-slate-400 text-sm">
                Belum ada bank soal guru yang disimpan.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {Object.values(datasets).map((dataset: any) => (
                  <div key={dataset.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded">{dataset.jenjang}</span>
                        {dataset.fase && <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded">{dataset.fase}</span>}
                        <span className="font-bold text-slate-200">{dataset.mataPelajaran}</span>
                      </div>
                      <div className="text-xs text-slate-400 flex gap-3">
                        <span>{dataset.questions.length} Soal</span>
                        <span>Diunggah: {new Date(dataset.uploadDate).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button onClick={() => exportDataset(dataset)} className="flex-1 sm:flex-none px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded flex items-center justify-center gap-1 transition-colors">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Export
                      </button>
                      <button onClick={() => deleteDataset(dataset.id)} className="flex-1 sm:flex-none px-3 py-1.5 bg-red-900/50 hover:bg-red-500 text-red-200 text-xs font-bold rounded transition-colors">
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
