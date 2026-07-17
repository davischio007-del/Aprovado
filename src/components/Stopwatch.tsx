import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Save, Timer, Award, CheckCircle, BookOpen, Clock } from "lucide-react";
import { Subject } from "../types";

interface StopwatchProps {
  subjects: Subject[];
  onSaveSession: (session: {
    subjectId: string;
    topic: string;
    durationMinutes: number;
    questionsAttempted: number;
    questionsCorrect: number;
    notes: string;
  }) => void;
  preselectedSubjectId?: string;
  preselectedTopic?: string;
  onClearPreselections?: () => void;
}

export default function Stopwatch({
  subjects,
  onSaveSession,
  preselectedSubjectId = "",
  preselectedTopic = "",
  onClearPreselections,
}: StopwatchProps) {
  // Timer Mode: 'stopwatch' (progressive) or 'pomodoro' (regressive)
  const [mode, setMode] = useState<'stopwatch' | 'pomodoro'>('stopwatch');
  const [isPlaying, setIsPlaying] = useState(false);
  const [seconds, setSeconds] = useState(0);
  
  // Pomodoro config (default 25 minutes)
  const [pomodoroMinutes, setPomodoroMinutes] = useState(25);
  const [isPomodoroBreak, setIsPomodoroBreak] = useState(false);

  // Session Logging form state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(preselectedSubjectId);
  const [selectedTopic, setSelectedTopic] = useState(preselectedTopic);
  const [questionsAttempted, setQuestionsAttempted] = useState<number>(0);
  const [questionsCorrect, setQuestionsCorrect] = useState<number>(0);
  const [notes, setNotes] = useState("");

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync pre-selections
  useEffect(() => {
    if (preselectedSubjectId) {
      setSelectedSubjectId(preselectedSubjectId);
    }
    if (preselectedTopic) {
      setSelectedTopic(preselectedTopic);
    }
  }, [preselectedSubjectId, preselectedTopic]);

  // Audio alert play function (using standard Web Audio API synthesis so no external audio file is required)
  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5

      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.log("Audio synthesis error: ", e);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        if (mode === 'stopwatch') {
          setSeconds((prev) => prev + 1);
        } else {
          // Pomodoro countdown
          setSeconds((prev) => {
            if (prev <= 1) {
              setIsPlaying(false);
              playAlertSound();
              if (intervalRef.current) clearInterval(intervalRef.current);
              
              if (!isPomodoroBreak) {
                // Work completed! Open save dialog
                setShowSaveModal(true);
                // Pre-fill time with Pomodoro duration
                setSeconds(0);
                return 0;
              } else {
                // Break completed
                setIsPomodoroBreak(false);
                return pomodoroMinutes * 60;
              }
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, mode, isPomodoroBreak, pomodoroMinutes]);

  const handleStartPause = () => {
    // If starting pomodoro and timer is 0, initialize
    if (mode === 'pomodoro' && seconds === 0) {
      setSeconds(isPomodoroBreak ? 5 * 60 : pomodoroMinutes * 60);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    if (mode === 'stopwatch') {
      setSeconds(0);
    } else {
      setSeconds(isPomodoroBreak ? 5 * 60 : pomodoroMinutes * 60);
    }
  };

  const handleModeChange = (newMode: 'stopwatch' | 'pomodoro') => {
    setIsPlaying(false);
    setMode(newMode);
    setIsPomodoroBreak(false);
    if (newMode === 'stopwatch') {
      setSeconds(0);
    } else {
      setSeconds(pomodoroMinutes * 60);
    }
  };

  const startPomodoroBreak = () => {
    setIsPlaying(false);
    setIsPomodoroBreak(true);
    setSeconds(5 * 60); // 5 min break
  };

  const skipPomodoroBreak = () => {
    setIsPlaying(false);
    setIsPomodoroBreak(false);
    setSeconds(pomodoroMinutes * 60);
  };

  // Convert seconds to readable display format (HH:MM:SS)
  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Trigger Save Form
  const handleOpenSaveDialog = () => {
    setIsPlaying(false);
    setShowSaveModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) {
      alert("Por favor, selecione uma matéria.");
      return;
    }

    // Calculate duration in minutes (ensure at least 1 minute)
    let calculatedMinutes = 1;
    if (mode === 'stopwatch') {
      calculatedMinutes = Math.max(1, Math.round(seconds / 60));
    } else {
      // For Pomodoro, log the completed duration session
      calculatedMinutes = isPomodoroBreak ? 5 : pomodoroMinutes;
    }

    onSaveSession({
      subjectId: selectedSubjectId,
      topic: selectedTopic || "Geral / Revisão Geral",
      durationMinutes: calculatedMinutes,
      questionsAttempted,
      questionsCorrect,
      notes,
    });

    // Reset stopwatch/timer and modal state
    setShowSaveModal(false);
    setSeconds(0);
    setQuestionsAttempted(0);
    setQuestionsCorrect(0);
    setNotes("");
    if (onClearPreselections) onClearPreselections();
  };

  // Get active topics list for the selected subject
  const currentSubject = subjects.find(s => s.id === selectedSubjectId);
  const availableTopics = currentSubject ? currentSubject.topics : [];

  // Calculate percentage of circular progress ring
  const getProgressPercentage = () => {
    if (mode === 'stopwatch') {
      // Just a dynamic aesthetic pulse or loop every hour
      return (seconds % 3600) / 3600 * 100;
    } else {
      const totalSeconds = isPomodoroBreak ? 5 * 60 : pomodoroMinutes * 60;
      if (totalSeconds === 0) return 0;
      return ((totalSeconds - seconds) / totalSeconds) * 100;
    }
  };

  const percentage = getProgressPercentage();
  const strokeDashoffset = 280 - (280 * percentage) / 100;

  return (
    <div id="stopwatch-container" className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left column: Quick explanations and Mode Selectors */}
        <div className="flex-1 space-y-4 w-full">
          <div className="flex items-center gap-2">
            <Timer className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-semibold text-gray-800">Horas Líquidas de Estudo</h2>
          </div>
          <p className="text-sm text-gray-500">
            Cronometre seu tempo ativo livre de distrações. Quando salvar, seu progresso alimentará seus relatórios e ativará as revisões programadas.
          </p>

          {/* Mode Switcher Buttons */}
          <div className="inline-flex p-1 bg-gray-100 rounded-xl w-full sm:w-auto">
            <button
              id="mode-stopwatch-btn"
              onClick={() => handleModeChange('stopwatch')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg transition-all ${
                mode === 'stopwatch'
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Clock className="w-4 h-4" />
              Cronômetro Livre
            </button>
            <button
              id="mode-pomodoro-btn"
              onClick={() => handleModeChange('pomodoro')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg transition-all ${
                mode === 'pomodoro'
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Timer className="w-4 h-4" />
              Pomodoro
            </button>
          </div>

          {/* Preset details if loaded from a schedule slot */}
          {preselectedSubjectId && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 flex items-start gap-2.5">
              <BookOpen className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-emerald-800">Sessão Pré-selecionada</p>
                <p className="text-xs text-emerald-700 font-medium">
                  {subjects.find(s => s.id === preselectedSubjectId)?.name} • <span className="italic">{preselectedTopic}</span>
                </p>
                <button
                  onClick={onClearPreselections}
                  className="text-[10px] text-emerald-600 hover:underline mt-1 font-medium block"
                >
                  Limpar predefinição e estudar livre
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right column: The visual timer ring & controls */}
        <div className="flex flex-col items-center gap-4 flex-shrink-0">
          
          {/* Progress Ring */}
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Background Circle */}
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="80"
                className="stroke-gray-100 fill-none"
                strokeWidth="8"
              />
              <circle
                cx="96"
                cy="96"
                r="80"
                className={`fill-none transition-all duration-300 ${
                  isPomodoroBreak ? "stroke-sky-500" : "stroke-emerald-500"
                }`}
                strokeWidth="8"
                strokeDasharray="502"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>

            {/* Time Indicators */}
            <div className="text-center z-10">
              {mode === 'pomodoro' && (
                <span className={`text-[10px] uppercase tracking-wider font-semibold block ${
                  isPomodoroBreak ? "text-sky-600" : "text-emerald-600"
                }`}>
                  {isPomodoroBreak ? "Intervalo" : "Estudo"}
                </span>
              )}
              <span className="text-3xl font-bold font-mono text-gray-800 tabular-nums">
                {formatTime(seconds)}
              </span>
              <span className="text-[10px] text-gray-400 block mt-1">
                {mode === 'stopwatch' ? "Tempo de estudo" : isPomodoroBreak ? "Descanse" : "Mantenha o foco"}
              </span>
            </div>
          </div>

          {/* Playback Controls Row */}
          <div className="flex items-center gap-3">
            <button
              id="timer-reset-btn"
              onClick={handleReset}
              className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-600 hover:text-gray-900 border border-gray-100 transition-colors"
              title="Reiniciar"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              id="timer-start-pause-btn"
              onClick={handleStartPause}
              className={`p-4 rounded-full text-white shadow-md hover:scale-105 active:scale-95 transition-all ${
                isPlaying 
                  ? "bg-amber-500 hover:bg-amber-600" 
                  : isPomodoroBreak 
                    ? "bg-sky-600 hover:bg-sky-700" 
                    : "bg-emerald-600 hover:bg-emerald-700"
              }`}
              title={isPlaying ? "Pausar" : "Iniciar"}
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
            </button>
            
            {/* Action button */}
            {mode === 'stopwatch' ? (
              <button
                id="timer-save-btn"
                onClick={handleOpenSaveDialog}
                disabled={seconds === 0}
                className={`p-2.5 rounded-full border transition-all ${
                  seconds > 0 
                    ? "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 cursor-pointer" 
                    : "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed"
                }`}
                title="Registrar estudo de forma líquida"
              >
                <Save className="w-5 h-5" />
              </button>
            ) : (
              // For Pomodoro, let them trigger break early or skip
              isPomodoroBreak ? (
                <button
                  onClick={skipPomodoroBreak}
                  className="px-3 py-1.5 text-xs font-semibold bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 rounded-xl"
                >
                  Pular Descanso
                </button>
              ) : (
                <button
                  onClick={startPomodoroBreak}
                  className="px-3 py-1.5 text-xs font-semibold bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 rounded-xl"
                >
                  Intervalo Rápido
                </button>
              )
            )}
          </div>

        </div>
      </div>

      {/* Save Study Log Modal */}
      {showSaveModal && (
        <div id="save-session-modal" className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                Registrar Tempo de Estudo Líquido
              </h3>
              <button 
                onClick={() => setShowSaveModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              
              {/* Display calculated study time */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex justify-between items-center">
                <span className="text-xs font-semibold text-emerald-800">Tempo Líquido a Registrar:</span>
                <span className="text-lg font-bold text-emerald-700 font-mono">
                  {mode === 'stopwatch' 
                    ? `${Math.max(1, Math.round(seconds / 60))} min (${formatTime(seconds)})` 
                    : `${pomodoroMinutes} min (Sessão Pomodoro)`}
                </span>
              </div>

              {/* Subject Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Disciplina/Matéria <span className="text-red-500">*</span></label>
                <select
                  required
                  value={selectedSubjectId}
                  onChange={(e) => {
                    setSelectedSubjectId(e.target.value);
                    setSelectedTopic("");
                  }}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors"
                >
                  <option value="">-- Escolha a matéria --</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Topic Input or Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Assunto/Tópico do Edital</label>
                {availableTopics.length > 0 ? (
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors"
                  >
                    <option value="">-- Escolha um assunto do edital --</option>
                    {availableTopics.map((top, idx) => (
                      <option key={idx} value={top}>
                        {top}
                      </option>
                    ))}
                    <option value="Geral">Outro / Geral</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    placeholder="Ex: Teoria Geral, Sintaxe, etc."
                    className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors"
                  />
                )}
              </div>

              {/* Questions Answered Tracking */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Questões Resolvidas</label>
                  <input
                    type="number"
                    min="0"
                    value={questionsAttempted || ""}
                    onChange={(e) => setQuestionsAttempted(Number(e.target.value))}
                    placeholder="Ex: 10"
                    className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Questões Acertadas</label>
                  <input
                    type="number"
                    min="0"
                    max={questionsAttempted}
                    value={questionsCorrect || ""}
                    onChange={(e) => setQuestionsCorrect(Number(e.target.value))}
                    placeholder="Ex: 8"
                    className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Anotações / Dificuldades</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Escreva pontos importantes que errou ou conceitos que precisa revisar..."
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2 text-sm outline-none transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  Salvar Sessão
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
