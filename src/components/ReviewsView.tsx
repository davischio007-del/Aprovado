import React from "react";
import { CheckCircle, Clock, Calendar, AlertCircle, RefreshCw, Star } from "lucide-react";
import { Subject, Revision } from "../types";

interface ReviewsViewProps {
  subjects: Subject[];
  revisions: Revision[];
  onCompleteRevision: (id: string) => void;
  onClearCompletedRevisions: () => void;
}

export default function ReviewsView({
  subjects,
  revisions,
  onCompleteRevision,
  onClearCompletedRevisions,
}: ReviewsViewProps) {
  
  const getSubjectName = (subId: string) => {
    return subjects.find((s) => s.id === subId)?.name || "Matéria Geral";
  };

  const getTodayString = () => {
    return new Date().toISOString().substring(0, 10);
  };

  const todayStr = getTodayString();

  // FILTER REVISIONS
  const pendingToday = revisions.filter((r) => !r.completed && r.dueDate <= todayStr);
  const upcomingFuture = revisions.filter((r) => !r.completed && r.dueDate > todayStr);
  const completedList = revisions.filter((r) => r.completed);

  const getRevisionTypeBadge = (type: Revision['type']) => {
    switch (type) {
      case '24h':
        return "bg-amber-100 text-amber-800 border-amber-200";
      case '7d':
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case '30d':
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDueDate = (dateStr: string) => {
    if (dateStr === todayStr) return "Hoje";
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().substring(0, 10);
    if (dateStr === tomorrowStr) return "Amanhã";

    // Split and reformat YYYY-MM-DD to DD/MM/YYYY
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  return (
    <div id="spaced-repetition-section" className="space-y-6">
      
      {/* Intro info card */}
      <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin-slow" />
            <h3 className="font-bold text-gray-800 text-sm">Metodologia de Revisões Ativas</h3>
          </div>
          <p className="text-xs text-gray-400">
            Toda sessão registrada gera revisões de <b>24 Horas</b>, <b>7 Dias</b> e <b>30 Dias</b>. Pratique a recuperação ativa antes de concluir.
          </p>
        </div>

        {completedList.length > 0 && (
          <button
            onClick={onClearCompletedRevisions}
            className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 text-xs font-semibold rounded-xl border border-gray-150 transition-colors"
          >
            Limpar Concluídas
          </button>
        )}
      </div>

      {/* Grid of Pending vs. Future */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PENDING TODAY PANEL */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-50 pb-2">
            <h4 className="font-bold text-red-600 text-sm flex items-center gap-1.5">
              <Clock className="w-4.5 h-4.5" />
              Revisões Pendentes de Hoje
            </h4>
            <span className="text-[10px] font-bold bg-red-50 text-red-600 px-2.5 py-0.5 rounded-lg">
              {pendingToday.length} tarefas
            </span>
          </div>

          <div className="space-y-3.5 max-h-[450px] overflow-y-auto pr-1">
            {pendingToday.length === 0 ? (
              <div className="py-12 text-center text-gray-400 italic flex flex-col items-center justify-center space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
                <p className="text-xs font-bold text-gray-700">Tudo em dia!</p>
                <p className="text-[10px] text-gray-400">Você não tem nenhuma revisão acumulada para hoje.</p>
              </div>
            ) : (
              pendingToday.map((rev) => (
                <div 
                  key={rev.id} 
                  className="border border-gray-100 rounded-xl p-3 bg-white flex justify-between items-center gap-3 hover:border-emerald-200 transition-colors"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <span className="font-bold text-gray-800 text-xs block truncate">
                      {getSubjectName(rev.subjectId)}
                    </span>
                    <span className="text-[10px] text-gray-500 block truncate font-medium">
                      {rev.topic}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[8px] font-bold border rounded px-1.5 py-0.2 uppercase ${getRevisionTypeBadge(rev.type)}`}>
                        Rev {rev.type}
                      </span>
                      <span className="text-[9px] text-red-500 font-bold flex items-center gap-0.5">
                        <AlertCircle className="w-3 h-3" />
                        Atrasado
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onCompleteRevision(rev.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg shadow-xs transition-colors"
                  >
                    Marcar como Feito
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* UPCOMING REVISIONS PANEL */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-50 pb-2">
            <h4 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
              <Calendar className="w-4.5 h-4.5 text-emerald-600" />
              Próximas Recomendações de Revisão
            </h4>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-lg">
              {upcomingFuture.length} agendadas
            </span>
          </div>

          <div className="space-y-3.5 max-h-[450px] overflow-y-auto pr-1">
            {upcomingFuture.length === 0 ? (
              <p className="text-xs text-gray-400 italic text-center py-12">
                Nenhuma revisão agendada para os próximos dias. Continue estudando para gerar novos ciclos de revisão!
              </p>
            ) : (
              upcomingFuture
                .sort((a, b) => a.dueDate.localeCompare(b.dueDate)) // Order nearest first
                .map((rev) => (
                  <div 
                    key={rev.id} 
                    className="border border-gray-50 rounded-xl p-3 bg-gray-50/20 flex justify-between items-center gap-3"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <span className="font-bold text-gray-700 text-xs block truncate">
                        {getSubjectName(rev.subjectId)}
                      </span>
                      <span className="text-[10px] text-gray-400 block truncate">
                        {rev.topic}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[8px] font-bold border rounded px-1.5 py-0.2 uppercase ${getRevisionTypeBadge(rev.type)}`}>
                          Rev {rev.type}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-[9px] text-gray-400 font-bold block uppercase">Agendado para</span>
                      <span className="text-xs font-semibold text-emerald-700">{formatDueDate(rev.dueDate)}</span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
