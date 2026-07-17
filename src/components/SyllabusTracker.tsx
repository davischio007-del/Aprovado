import React, { useState } from "react";
import { 
  Sparkles, BookOpen, Plus, ChevronDown, ChevronUp, CheckCircle, 
  HelpCircle, Trash, Star, Play, Circle, BarChart, Settings, RefreshCw 
} from "lucide-react";
import { Subject, TopicPerformance } from "../types";

interface SyllabusTrackerProps {
  subjects: Subject[];
  topicPerformances: TopicPerformance[];
  onImportSyllabus: (plan: { examName: string; subjects: Subject[]; weeklySchedule: any[] }) => void;
  onUpdateTopicStatus: (subjectId: string, topic: string, status: TopicPerformance['status']) => void;
  onUpdateTopicQuestions: (subjectId: string, topic: string, attempted: number, correct: number) => void;
  onAddSubject: (name: string, weeklyHours: number) => void;
  onAddTopic: (subjectId: string, topicName: string) => void;
  onDeleteSubject: (subjectId: string) => void;
  onStartStudyPreset: (subjectId: string, topic: string) => void;
}

export default function SyllabusTracker({
  subjects,
  topicPerformances,
  onImportSyllabus,
  onUpdateTopicStatus,
  onUpdateTopicQuestions,
  onAddSubject,
  onAddTopic,
  onDeleteSubject,
  onStartStudyPreset,
}: SyllabusTrackerProps) {
  // Onboarding / Generation view state
  const [syllabusInput, setSyllabusInput] = useState("");
  const [focusArea, setFocusArea] = useState("Geral");
  const [weeklyHours, setWeeklyHours] = useState(20);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessageIdx, setLoadingMessageIdx] = useState(0);

  // Expanded subjects accordion
  const [expandedSubjectIds, setExpandedSubjectIds] = useState<Record<string, boolean>>({});

  // Manual Add Form states
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectHours, setNewSubjectHours] = useState(4);

  const [addingTopicSubjectId, setAddingTopicSubjectId] = useState<string | null>(null);
  const [newTopicName, setNewTopicName] = useState("");

  // Quick log questions modal
  const [loggingQuestionSubject, setLoggingQuestionSubject] = useState<{ subId: string; topicName: string } | null>(null);
  const [qAttempted, setQAttempted] = useState<number>(10);
  const [qCorrect, setQCorrect] = useState<number>(8);

  const loadingMessages = [
    "Analisando estrutura do edital fornecido...",
    "Identificando disciplinas principais e pesos...",
    "Sugerindo tópicos fundamentais por matéria...",
    "Criando cronograma semanal estratégico...",
    "Otimizando sessões de estudo para suas horas líquidas...",
    "Finalizando formatação do seu edital verticalizado..."
  ];

  const handleGenerateSyllabus = async () => {
    if (!syllabusInput.trim()) {
      alert("Por favor, cole o texto do seu edital ou digite os temas que pretende estudar.");
      return;
    }

    setIsGenerating(true);
    setLoadingMessageIdx(0);

    // Dynamic rotation of loading messages
    const interval = setInterval(() => {
      setLoadingMessageIdx((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);

    try {
      const response = await fetch("/api/plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          syllabusText: syllabusInput,
          weeklyHours,
          focusArea,
        }),
      });

      const data = await response.json();
      if (data.success && data.plan) {
        onImportSyllabus(data.plan);
      } else {
        alert("Erro ao processar edital: " + (data.error || "Tente novamente com outro formato."));
      }
    } catch (err: any) {
      console.error("Error generating syllabus:", err);
      alert("Houve uma falha ao conectar com o servidor. Verifique se o servidor está ativo.");
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  const toggleExpand = (subId: string) => {
    setExpandedSubjectIds(prev => ({
      ...prev,
      [subId]: !prev[subId]
    }));
  };

  const getTopicPerformance = (subId: string, topic: string): TopicPerformance => {
    const perf = topicPerformances.find(p => p.subjectId === subId && p.topic === topic);
    return perf || {
      subjectId: subId,
      topic,
      status: 'not_started',
      questionsAttempted: 0,
      questionsCorrect: 0
    };
  };

  const handleAddSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    onAddSubject(newSubjectName.trim(), newSubjectHours);
    setNewSubjectName("");
    setShowAddSubject(false);
  };

  const handleAddTopicSubmit = (subId: string) => {
    if (!newTopicName.trim()) return;
    onAddTopic(subId, newTopicName.trim());
    setNewTopicName("");
    setAddingTopicSubjectId(null);
  };

  const handleSaveQuestionsLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggingQuestionSubject) return;
    onUpdateTopicQuestions(
      loggingQuestionSubject.subId,
      loggingQuestionSubject.topicName,
      qAttempted,
      qCorrect
    );
    setLoggingQuestionSubject(null);
  };

  const getStatusStyle = (status: TopicPerformance['status']) => {
    switch (status) {
      case "not_started":
        return "bg-gray-100 text-gray-600 border-gray-200";
      case "studying":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "studied":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "reviewed":
        return "bg-sky-50 text-sky-700 border-sky-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getStatusLabel = (status: TopicPerformance['status']) => {
    switch (status) {
      case "not_started": return "Não Iniciado";
      case "studying": return "Estudando";
      case "studied": return "Concluído";
      case "reviewed": return "Revisado";
    }
  };

  // Helper to calculate completion stats for a subject
  const getSubjectStats = (subject: Subject) => {
    const total = subject.topics.length;
    if (total === 0) return { percentComplete: 0, accuracy: 0 };
    
    let completedCount = 0;
    let totalCorrect = 0;
    let totalAttempted = 0;

    subject.topics.forEach(t => {
      const perf = getTopicPerformance(subject.id, t);
      if (perf.status === 'studied' || perf.status === 'reviewed') {
        completedCount++;
      }
      totalCorrect += perf.questionsCorrect;
      totalAttempted += perf.questionsAttempted;
    });

    const percentComplete = Math.round((completedCount / total) * 100);
    const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

    return { percentComplete, accuracy, totalAttempted };
  };

  return (
    <div id="syllabus-tracker-section" className="space-y-6">
      
      {/* ONBOARDING STATE: No syllabus loaded */}
      {subjects.length === 0 ? (
        <div id="syllabus-onboarding" className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Verticalização de Edital Inteligente</h2>
            <p className="text-sm text-gray-500">
              Cole o conteúdo programático do seu edital, ou digite as matérias que você quer estudar. Nossa inteligência artificial irá criar seu banco de matérias e organizar seu quadro de horários semanal.
            </p>
          </div>

          {isGenerating ? (
            <div id="syllabus-loading" className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-semibold text-gray-700">{loadingMessages[loadingMessageIdx]}</p>
              <p className="text-xs text-gray-400">Isso pode levar alguns segundos...</p>
            </div>
          ) : (
            <div className="space-y-5 max-w-4xl mx-auto">
              {/* Form config Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Horas Semanais Disponíveis</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Área do Concurso/Estudo</label>
                  <select
                    value={focusArea}
                    onChange={(e) => setFocusArea(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors"
                  >
                    <option value="Geral">Área Geral / ENEM</option>
                    <option value="Policial">Policial (PF, PRF, PM)</option>
                    <option value="Tribunais">Tribunais e Judiciária (AJAJ, TRE)</option>
                    <option value="Fiscal">Fiscal e Controle (Receita, SEFAZ)</option>
                    <option value="Bancária">Bancária (Banco do Brasil, CEF)</option>
                    <option value="OAB">Exame de Ordem (OAB)</option>
                    <option value="Saude">Residência Médica / Saúde</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleGenerateSyllabus}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl py-2.5 shadow-md flex items-center justify-center gap-1.5 transition-all text-sm hover:scale-[1.01]"
                  >
                    <Sparkles className="w-4 h-4 fill-white" />
                    Gerar Planejamento com IA
                  </button>
                </div>
              </div>

              {/* Syllabus input area */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Edital / Temas de Estudo</label>
                <textarea
                  value={syllabusInput}
                  onChange={(e) => setSyllabusInput(e.target.value)}
                  rows={8}
                  placeholder={`Cole aqui o conteúdo programático ou temas. Exemplo:
PORTUGUÊS: Compreensão de texto, Sintaxe, Ortografia.
DIREITO CONSTITUCIONAL: Direitos Fundamentais, Artigo 5º, Administração Pública.
INFORMÁTICA: Redes, Segurança, Excel.`}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-2xl p-4 text-sm outline-none transition-colors resize-none font-sans"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-2">Ou selecione um exemplo rápido:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setSyllabusInput("Língua Portuguesa: Ortografia, Acentuação, Sintaxe. Direito Constitucional: Direitos e deveres individuais, Poderes do Estado. Raciocínio Lógico: Lógica de proposições, Argumentação.");
                      setFocusArea("Geral");
                    }}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors"
                  >
                    Concurso Geral
                  </button>
                  <button
                    onClick={() => {
                      setSyllabusInput("Constitucional: Direitos Fundamentais. Administrativo: Atos administrativos, Licitações. Penal: Crimes contra a administração, Teoria do Crime.");
                      setFocusArea("Policial");
                    }}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors"
                  >
                    Carreiras Policiais
                  </button>
                  <button
                    onClick={() => {
                      setSyllabusInput("Português: Redação, Interpretação. Matemática: Álgebra, Probabilidade, Geometria. Biologia: Genética, Ecologia, Fisiologia.");
                      setFocusArea("Geral");
                    }}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors"
                  >
                    Vestibular / ENEM
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* SYLLABUS LOADED: Verticalized Accordion List */
        <div id="syllabus-manager" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-gray-800">Seu Edital Verticalizado</h3>
              <p className="text-xs text-gray-500">Acompanhe a sua evolução teórica e o desempenho em questões de cada tópico.</p>
            </div>
            
            <div className="flex gap-2">
              <button
                id="add-subject-btn"
                onClick={() => setShowAddSubject(!showAddSubject)}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1 border border-emerald-100"
              >
                <Plus className="w-4 h-4" />
                Nova Disciplina
              </button>
              <button
                onClick={() => {
                  if(confirm("Deseja redefinir seu edital? Suas estatísticas atuais serão redefinidas.")) {
                    onImportSyllabus({ examName: "", subjects: [], weeklySchedule: [] });
                  }
                }}
                className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1 border border-gray-100"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Redefinir
              </button>
            </div>
          </div>

          {/* Add Subject Inline Form */}
          {showAddSubject && (
            <form onSubmit={handleAddSubjectSubmit} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3 animate-fade-in">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Nome da Disciplina</label>
                <input
                  required
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="Ex: Direito Administrativo"
                  className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3 py-1.5 text-xs outline-none transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Horas Semanais Recomendadas</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  max="40"
                  value={newSubjectHours}
                  onChange={(e) => setNewSubjectHours(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3 py-1.5 text-xs outline-none transition-colors"
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="flex-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl"
                >
                  Adicionar
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddSubject(false)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs rounded-xl"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {/* Subject Accordions */}
          <div className="space-y-3">
            {subjects.map((sub) => {
              const { percentComplete, accuracy, totalAttempted } = getSubjectStats(sub);
              const isExpanded = !!expandedSubjectIds[sub.id];

              return (
                <div key={sub.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  
                  {/* Subject Header Trigger */}
                  <div 
                    onClick={() => toggleExpand(sub.id)}
                    className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 cursor-pointer hover:bg-gray-50/55 transition-colors"
                  >
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm">{sub.name}</h4>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {sub.weeklyHours}h recomendadas/semana • {sub.topics.length} assuntos
                        </span>
                      </div>
                    </div>

                    {/* Progress indicators */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                      <div className="text-left sm:text-right space-y-0.5">
                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Teoria Concluída</span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full" 
                              style={{ width: `${percentComplete}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-semibold text-gray-700">{percentComplete}%</span>
                        </div>
                      </div>

                      <div className="text-left sm:text-right space-y-0.5">
                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Acertos</span>
                        <span className={`text-xs font-bold ${accuracy >= 75 ? "text-emerald-600" : accuracy >= 50 ? "text-amber-600" : "text-red-500"}`}>
                          {totalAttempted > 0 ? `${accuracy}%` : "--"}
                        </span>
                      </div>

                      <div className="text-gray-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Subject Topics Expanded Panel */}
                  {isExpanded && (
                    <div className="border-t border-gray-50 bg-gray-50/30 p-4 space-y-3 animate-fade-in">
                      
                      {/* Sub-actions block */}
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
                        <span className="text-xs font-semibold text-gray-600">Conteúdo Programático</span>
                        <button
                          onClick={() => setAddingTopicSubjectId(sub.id)}
                          className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-0.5"
                        >
                          <Plus className="w-3.5 h-3.5" /> Adicionar Tópico
                        </button>
                      </div>

                      {/* Manual Add Topic input */}
                      {addingTopicSubjectId === sub.id && (
                        <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-2 animate-fade-in">
                          <input
                            required
                            type="text"
                            value={newTopicName}
                            onChange={(e) => setNewTopicName(e.target.value)}
                            placeholder="Ex: Lei nº 8.112 de 1990"
                            className="flex-1 bg-transparent px-2 py-1 text-xs outline-none border-none"
                          />
                          <button
                            onClick={() => handleAddTopicSubmit(sub.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2.5 py-1 rounded-lg font-semibold"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={() => setAddingTopicSubjectId(null)}
                            className="text-gray-400 hover:text-gray-600 text-xs px-1.5"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}

                      {/* Topics row list */}
                      <div className="space-y-2">
                        {sub.topics.length === 0 ? (
                          <p className="text-xs text-gray-400 italic text-center py-2">Nenhum tópico cadastrado nesta disciplina.</p>
                        ) : (
                          sub.topics.map((topic, idx) => {
                            const perf = getTopicPerformance(sub.id, topic);
                            const percent = perf.questionsAttempted > 0 
                              ? Math.round((perf.questionsCorrect / perf.questionsAttempted) * 100) 
                              : 0;

                            return (
                              <div 
                                key={idx} 
                                className="bg-white rounded-xl border border-gray-100 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:shadow-xs transition-shadow"
                              >
                                <span className="text-xs font-semibold text-gray-700 sm:max-w-[45%]">
                                  {topic}
                                </span>

                                {/* Topic Performance actions row */}
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-between sm:justify-end">
                                  {/* Study status Badge with selector */}
                                  <select
                                    value={perf.status}
                                    onChange={(e) => onUpdateTopicStatus(sub.id, topic, e.target.value as TopicPerformance['status'])}
                                    className={`text-[10px] font-bold border rounded-lg px-2 py-1 outline-none cursor-pointer ${getStatusStyle(perf.status)}`}
                                  >
                                    <option value="not_started">Não Iniciado</option>
                                    <option value="studying">Estudando</option>
                                    <option value="studied">Concluído</option>
                                    <option value="reviewed">Revisado</option>
                                  </select>

                                  {/* Question statistics block */}
                                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <BarChart className="w-3.5 h-3.5 text-gray-400" />
                                    <span>
                                      {perf.questionsAttempted > 0 
                                        ? `${perf.questionsCorrect}/${perf.questionsAttempted} (${percent}%)` 
                                        : "Nenhuma questão"}
                                    </span>
                                  </div>

                                  {/* Quick Actions Row */}
                                  <div className="flex items-center gap-1.5 border-l border-gray-100 pl-2">
                                    <button
                                      onClick={() => setLoggingQuestionSubject({ subId: sub.id, topicName: topic })}
                                      className="p-1 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                      title="Registrar questões resolvidas"
                                    >
                                      <HelpCircle className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => onStartStudyPreset(sub.id, topic)}
                                      className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-0.5 text-[10px] font-bold"
                                      title="Iniciar Cronômetro"
                                    >
                                      <Play className="w-3.5 h-3.5 fill-emerald-600" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Subject delete action */}
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => {
                            if (confirm(`Excluir disciplina "${sub.name}"? Isso apagará todos os seus tópicos.`)) {
                              onDeleteSubject(sub.id);
                            }
                          }}
                          className="text-[10px] text-red-400 hover:text-red-600 font-semibold flex items-center gap-0.5"
                        >
                          <Trash className="w-3 h-3" /> Excluir Disciplina
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Log Questions Modal */}
      {loggingQuestionSubject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h4 className="font-bold text-gray-800 text-sm">Registrar Questões</h4>
              <button 
                onClick={() => setLoggingQuestionSubject(null)}
                className="text-gray-400 font-semibold text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500 font-medium">
              Atualize as estatísticas para o tópico <b className="text-emerald-600">{loggingQuestionSubject.topicName}</b>:
            </p>

            <form onSubmit={handleSaveQuestionsLog} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Questões Resolvidas</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={qAttempted}
                    onChange={(e) => setQAttempted(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Questões Acertadas</label>
                  <input
                    required
                    type="number"
                    min="0"
                    max={qAttempted}
                    value={qCorrect}
                    onChange={(e) => setQCorrect(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setLoggingQuestionSubject(null)}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
