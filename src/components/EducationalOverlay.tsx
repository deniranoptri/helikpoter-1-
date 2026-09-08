import React, { useState, useEffect } from 'react';
import { EducationalEngine, EducationalContent, AnswerResult } from '../engine/EducationalEngine';

interface Props {
  engine: EducationalEngine;
  onClose: (result: AnswerResult | null) => void;
  playerId?: 'P1' | 'P2' | 'P3' | 'P4';
}

export function EducationalOverlay({ engine, onClose, playerId }: Props) {
  const [question, setQuestion] = useState<EducationalContent | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [result, setResult] = useState<AnswerResult | null>(null);

  useEffect(() => {
    // Load a random question for UI verification
    const q = engine.getRandomQuestion({});
    setQuestion(q || null);
  }, [engine]);

  const handleSubmit = () => {
    if (!question || !selectedAnswer) return;
    const res = engine.checkAnswer(question.id, selectedAnswer);
    setResult(res);
  };

  if (!question) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto p-4 touch-none select-none">
      <div className="bg-slate-800 p-8 rounded-2xl border-2 border-slate-600 shadow-[0_0_50px_rgba(0,0,0,0.8)] max-w-2xl w-full text-white animate-pop-in">
        
        <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
          <div className="flex items-center gap-3">
            {playerId && (
              <span className={`text-xs font-black px-2 py-1 rounded border-2 uppercase tracking-wider ${
                playerId === 'P1' ? 'text-emerald-400 border-emerald-500' : 
                playerId === 'P2' ? 'text-blue-400 border-blue-500' :
                playerId === 'P3' ? 'text-yellow-400 border-yellow-500' :
                'text-red-400 border-red-500'
              }`}>
                {playerId}
              </span>
            )}
            <span className="bg-blue-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {question.subject || question.mataPelajaran} &bull; {question.topic || question.topik}
            </span>
          </div>
          <span className="text-slate-400 text-sm font-bold tracking-wider">{question.difficulty}</span>
        </div>

        <h2 className="text-2xl font-bold mb-8 leading-relaxed">{question.question || question.pertanyaan}</h2>

        {!result ? (
          <div className="space-y-4 mb-8">
            {(question.options || (question.pengecoh && question.jawabanBenar ? [...question.pengecoh, question.jawabanBenar].sort() : [])).map((opt, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedAnswer(opt)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer touch-manipulation ${selectedAnswer === opt ? 'border-blue-500 bg-blue-500/20' : 'border-slate-600 hover:border-slate-400 bg-slate-700/50'}`}
              >
                <span className="font-bold mr-4 text-slate-400">{String.fromCharCode(65 + idx)}</span>
                <span className="text-lg">{opt}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className={`p-6 rounded-xl mb-8 ${result.correct ? 'bg-emerald-900/50 border-2 border-emerald-500' : 'bg-red-900/50 border-2 border-red-500'}`}>
             <h3 className={`text-2xl font-bold mb-2 ${result.correct ? 'text-emerald-400' : 'text-red-400'}`}>
               {result.correct ? 'Correct!' : 'Incorrect'}
             </h3>
             <p className="text-lg text-slate-200">{result.explanation}</p>
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-slate-700">
          <div className="text-sm text-slate-400 font-mono">
            Session: {engine.getSessionState().correctAnswers} / {engine.getSessionState().questionsAnswered}
          </div>
          {!result ? (
            <button 
              onClick={handleSubmit}
              disabled={!selectedAnswer}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg transition-colors cursor-pointer touch-manipulation"
            >
              SUBMIT
            </button>
          ) : (
            <button 
              onClick={() => onClose(result)}
              className="px-8 py-3 bg-slate-600 hover:bg-slate-500 text-white font-bold rounded-xl shadow-lg transition-colors cursor-pointer touch-manipulation"
            >
              CONTINUE
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
