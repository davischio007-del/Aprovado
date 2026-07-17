import React from "react";
import { Calendar, Clock, CheckCircle, Circle, Play, AlertCircle, RefreshCw } from "lucide-react";
import { Subject, ScheduledTask } from "../types";

interface WeeklyScheduleViewProps {
  subjects: Subject[];
  scheduleTasks: ScheduledTask[];
  onToggleTaskCompleted: (taskId: string) => void;
  onStartStudyPreset: (subjectId: string, topic: string) => void;
  onRegenerateSchedule: () => void;
}

export default function WeeklyScheduleView({
  subjects,
  scheduleTasks,
  onToggleTaskCompleted,
  onStartStudyPreset,
  onRegenerateSchedule,
}: WeeklyScheduleViewProps) {
  
  const daysOfWeek = [
    { dayNum: 1, name: "Segunda-feira" },
    { dayNum: 2, name: "Terça-feira" },
    { dayNum: 3, name: "Quarta-feira" },
    { dayNum: 4, name: "Quinta-feira" },
    { dayNum: 5, name: "Sexta-feira" },
    { dayNum: 6, name: "Sábado" },
    { dayNum: 7, name: "Domingo" },
  ];

  const getSubjectName = (subId: string) => {
    return subjects.find((s) => s.id === subId)?.name || "Matéria Independente";
  };

  return (
    <div id="weekly-schedule-section" className="space-y-6">
      
      {/* Header card with action */}
      <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-gray-800 text-sm">Cronograma Semanal Dinâmico</h3>
          </div>
          <p className="text-xs text-gray-400">
            Seu quadro semanal gerado de forma automática de acordo com o peso de cada matéria e suas horas livres.
          </p>
        </div>

        {scheduleTasks.length > 0 && (
          <button
            onClick={() => {
              if (confirm("Deseja restaurar/reorganizar as tarefas semanais padrão com base na última importação?")) {
                onRegenerateSchedule();
              }
            }}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reiniciar Ciclo
          </button>
        )}
      </div>

      {scheduleTasks.length === 0 ? (
        /* EMPTY STATE if no tasks */
        <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center max-w-xl mx-auto space-y-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-full inline-block">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-gray-800">Seu cronograma está vazio</h4>
          <p className="text-xs text-gray-400">
            Acesse a aba <b>&ldquo;Controle de Edital&rdquo;</b> para verticalizar seu edital de forma automática com a nossa inteligência artificial. Isso gerará o seu quadro semanal automaticamente!
          </p>
        </div>
      ) : (
        /* Weekly Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {daysOfWeek.map((day) => {
            const dayTasks = scheduleTasks.filter((t) => t.day === day.dayNum);
            const totalMinutes = dayTasks.reduce((acc, curr) => acc + curr.durationMinutes, 0);

            return (
              <div 
                key={day.dayNum} 
                className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col min-h-[300px] hover:border-emerald-200/60 transition-colors"
              >
                {/* Day Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-50 mb-3.5">
                  <span className="font-bold text-gray-800 text-xs uppercase tracking-wider">{day.name}</span>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                    {totalMinutes >= 60 ? `${(totalMinutes / 60).toFixed(1)}h líquidas` : `${totalMinutes} min`}
                  </span>
                </div>

                {/* Day Tasks List */}
                <div className="space-y-3.5 flex-1">
                  {dayTasks.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center p-4">
                      <p className="text-[10px] text-gray-400 italic">Dia livre ou focado em revisões gerais.</p>
                    </div>
                  ) : (
                    dayTasks.map((task) => {
                      const completedStyle = task.completed 
                        ? "line-through text-gray-400" 
                        : "text-gray-800";

                      return (
                        <div 
                          key={task.id} 
                          className={`group border border-gray-50 rounded-xl p-3 hover:bg-gray-50/50 transition-all flex items-start gap-2.5 ${
                            task.completed ? "bg-gray-50/30 opacity-75" : "bg-white"
                          }`}
                        >
                          {/* Toggle Completion Clickbox */}
                          <button
                            onClick={() => onToggleTaskCompleted(task.id)}
                            className="text-gray-300 hover:text-emerald-600 transition-colors mt-0.5"
                          >
                            {task.completed ? (
                              <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-50" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </button>

                          {/* Task details */}
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <span className={`font-bold text-xs block truncate ${completedStyle}`}>
                              {getSubjectName(task.subjectId)}
                            </span>
                            <span className="text-[10px] text-gray-500 block truncate font-medium">
                              {task.topic}
                            </span>
                            <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-bold uppercase mt-1">
                              <Clock className="w-3 h-3" />
                              <span>{task.durationMinutes} min</span>
                              {task.type === 'review' && (
                                <span className="bg-sky-50 text-sky-600 px-1 py-0.2 rounded-md">Revisão</span>
                              )}
                            </div>
                          </div>

                          {/* Play button hover preset trigger */}
                          {!task.completed && (
                            <button
                              onClick={() => onStartStudyPreset(task.subjectId, task.topic)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all ml-auto self-center"
                              title="Estudar agora no cronômetro"
                            >
                              <Play className="w-3.5 h-3.5 fill-emerald-600" />
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
