import React, { useState } from "react";
import { Plus, Award, Calendar, HelpCircle, FileText, Trash, ChevronDown, ChevronUp } from "lucide-react";
import { MockExam } from "../types";

interface MockExamsProps {
  mockExams: MockExam[];
  onAddMockExam: (exam: Omit<MockExam, 'id'>) => void;
  onDeleteMockExam: (id: string) => void;
}

export default function MockExams({
  mockExams,
  onAddMockExam,
  onDeleteMockExam,
}: MockExamsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [questionsAttempted, setQuestionsAttempted] = useState<number>(90);
  const [questionsCorrect, setQuestionsCorrect] = useState<number>(72);
  const [durationMinutes, setDurationMinutes] = useState<number>(240);
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !questionsAttempted) return;

    onAddMockExam({
      name: name.trim(),
      date,
      questionsAttempted,
      questionsCorrect,
      durationMinutes: durationMinutes || undefined,
      notes: notes.trim() || undefined,
    });

    // Reset Form
    setName("");
    setNotes("");
    setShowAddForm(false);
  };

  const getPerformanceBadge = (percent: number) => {
    if (percent >= 80) {
      return { label: "Excelente", style: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    } else if (percent >= 70) {
      return { label: "Bom", style: "bg-blue-50 text-blue-700 border-blue-200" };
    } else if (percent >= 50) {
      return { label: "Regular", style: "bg-amber-50 text-amber-700 border-amber-200" };
    } else {
      return { label: "Atenção", style: "bg-red-50 text-red-700 border-red-200" };
    }
  };

  const calculateStats = () => {
    if (mockExams.length === 0) return { avgAccuracy: 0, totalExams: 0, bestScore: 0 };
    
    let totalCorrect = 0;
    let totalAttempted = 0;
    let bestScore = 0;

    mockExams.forEach((m) => {
      totalCorrect += m.questionsCorrect;
      totalAttempted += m.questionsAttempted;
      const rate = m.questionsAttempted > 0 ? (m.questionsCorrect / m.questionsAttempted) * 100 : 0;
      if (rate > bestScore) bestScore = rate;
    });

    return {
      avgAccuracy: totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0,
      totalExams: mockExams.length,
      bestScore: Math.round(bestScore),
    };
  };

  const { avgAccuracy, totalExams, bestScore } = calculateStats();

  return (
    <div id="mock-exams-section" className="space-y-6">
      
      {/* High-level summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Total de Simulados</span>
            <span className="text-xl font-bold text-gray-800">{totalExams}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Média Geral</span>
            <span className="text-xl font-bold text-gray-800">{avgAccuracy}% acertos</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Melhor Aproveitamento</span>
            <span className="text-xl font-bold text-gray-800">{bestScore}%</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl border border-gray-100 p-5 md:p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-800">Histórico de Provas e Simulados</h3>
            <p className="text-xs text-gray-400">Registre os simulados periódicos realizados para medir sua maturidade no edital.</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Simulado
          </button>
        </div>

        {/* Dynamic add form */}
        {showAddForm && (
          <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-4 md:p-5 border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Nome da Prova / Simulado</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Simulado Nacional 01 - Receita"
                className="w-full bg-white border border-gray-200 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Data da Realização</label>
              <input
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-gray-200 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Tempo Gasto (minutos)</label>
              <input
                type="number"
                min="10"
                value={durationMinutes || ""}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                placeholder="Ex: 240"
                className="w-full bg-white border border-gray-200 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Total de Questões</label>
              <input
                required
                type="number"
                min="1"
                value={questionsAttempted || ""}
                onChange={(e) => setQuestionsAttempted(Number(e.target.value))}
                placeholder="Ex: 90"
                className="w-full bg-white border border-gray-200 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Questões Acertadas</label>
              <input
                required
                type="number"
                min="0"
                max={questionsAttempted}
                value={questionsCorrect || ""}
                onChange={(e) => setQuestionsCorrect(Number(e.target.value))}
                placeholder="Ex: 72"
                className="w-full bg-white border border-gray-200 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Anotações / Análise de Erros</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Fui bem em português, mas vacilei em informática..."
                className="w-full bg-white border border-gray-200 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs outline-none"
              />
            </div>

            <div className="md:col-span-3 flex justify-end gap-2.5 pt-2 border-t border-gray-150">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs"
              >
                Salvar Prova
              </button>
            </div>
          </form>
        )}

        {/* Exams Table/List */}
        <div className="space-y-3.5">
          {mockExams.length === 0 ? (
            <p className="text-xs text-gray-400 italic text-center py-6">Você ainda não registrou nenhum simulado.</p>
          ) : (
            mockExams.map((exam) => {
              const percent = exam.questionsAttempted > 0 
                ? Math.round((exam.questionsCorrect / exam.questionsAttempted) * 100) 
                : 0;

              const badge = getPerformanceBadge(percent);

              return (
                <div 
                  key={exam.id} 
                  className="border border-gray-100 rounded-2xl p-4 hover:shadow-xs transition-all bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800 text-sm">{exam.name}</span>
                      <span className={`text-[10px] font-bold border rounded-lg px-1.5 py-0.5 ${badge.style}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {exam.date}
                      </span>
                      {exam.durationMinutes && (
                        <span>Tempo: {Math.floor(exam.durationMinutes / 60)}h{exam.durationMinutes % 60}m</span>
                      )}
                    </div>

                    {exam.notes && (
                      <p className="text-xs text-gray-400 italic font-medium bg-gray-50/50 p-2 rounded-xl mt-1.5">
                        &ldquo;{exam.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Math score details */}
                  <div className="flex items-center gap-4 self-stretch justify-between md:justify-end border-t md:border-none border-gray-50 pt-2 md:pt-0">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-gray-400 font-bold block uppercase">Placar</span>
                      <span className="text-sm font-bold text-gray-700">
                        {exam.questionsCorrect} <span className="text-gray-400 font-medium text-xs">/ {exam.questionsAttempted}</span>
                      </span>
                    </div>

                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full border-2 border-emerald-500 flex items-center justify-center font-bold text-emerald-600 text-xs md:text-sm">
                      {percent}%
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`Excluir histórico do simulado "${exam.name}"?`)) {
                          onDeleteMockExam(exam.id);
                        }
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir Simulado"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
