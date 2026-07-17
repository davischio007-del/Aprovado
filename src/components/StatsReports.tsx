import React from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line 
} from "recharts";
import { 
  Clock, HelpCircle, Trophy, Zap, TrendingUp, Award, Calendar, BookOpen 
} from "lucide-react";
import { Subject, StudySession, TopicPerformance, MockExam } from "../types";

interface StatsReportsProps {
  subjects: Subject[];
  sessions: StudySession[];
  topicPerformances: TopicPerformance[];
  mockExams: MockExam[];
  weeklyGoalHours: number;
}

export default function StatsReports({
  subjects,
  sessions,
  topicPerformances,
  mockExams,
  weeklyGoalHours,
}: StatsReportsProps) {
  
  // COLOR PALETTE FOR GRAPHS
  const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ec4899", "#14b8a6", "#f43f5e"];

  // 1. HIGH-LEVEL METRICS CALCULATIONS
  const totalStudyMinutes = sessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);

  let totalQuestionsCorrect = 0;
  let totalQuestionsAttempted = 0;

  topicPerformances.forEach((p) => {
    totalQuestionsCorrect += p.questionsCorrect;
    totalQuestionsAttempted += p.questionsAttempted;
  });

  const overallAccuracy = totalQuestionsAttempted > 0 
    ? Math.round((totalQuestionsCorrect / totalQuestionsAttempted) * 100) 
    : 0;

  // Study streak calculation
  const getStudyStreak = () => {
    if (sessions.length === 0) return 0;
    
    // Extract unique study dates (YYYY-MM-DD) sorted descending
    const uniqueDates = Array.from(
      new Set(sessions.map((s) => s.date.substring(0, 10)))
    ).sort((a, b) => b.localeCompare(a));

    if (uniqueDates.length === 0) return 0;

    let streak = 0;
    const todayStr = new Date().toISOString().substring(0, 10);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().substring(0, 10);

    // If latest study date is neither today nor yesterday, streak is broken
    if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
      return 0;
    }

    let currentDate = new Date(uniqueDates[0]);
    for (let i = 0; i < uniqueDates.length; i++) {
      const dateStr = currentDate.toISOString().substring(0, 10);
      if (uniqueDates.includes(dateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const streak = getStudyStreak();

  // Progress relative to weekly hours goal
  const currentWeekMinutes = sessions.reduce((acc, curr) => {
    // Basic check if session is within the last 7 days (simplified week check)
    const sessDate = new Date(curr.date);
    const diffTime = Math.abs(new Date().getTime() - sessDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) return acc + curr.durationMinutes;
    return acc;
  }, 0);
  const currentWeekHours = (currentWeekMinutes / 60).toFixed(1);
  const weeklyGoalPercent = Math.min(
    100,
    Math.round((parseFloat(currentWeekHours) / weeklyGoalHours) * 100)
  );

  // 2. DATA PREPARATION FOR CHARTS

  // A. Study Hours per day in the last 7 days
  const getDailyStudyData = () => {
    const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const daysData = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().substring(0, 10);
      const label = weekdays[d.getDay()];

      const dailyMinutes = sessions
        .filter((s) => s.date.substring(0, 10) === dateStr)
        .reduce((sum, curr) => sum + curr.durationMinutes, 0);

      daysData.push({
        name: label,
        Horas: parseFloat((dailyMinutes / 60).toFixed(2)),
      });
    }
    return daysData;
  };

  const dailyStudyData = getDailyStudyData();

  // B. Answer accuracy by subject
  const getAccuracyData = () => {
    return subjects.map((sub) => {
      let correct = 0;
      let attempted = 0;

      topicPerformances
        .filter((p) => p.subjectId === sub.id)
        .forEach((perf) => {
          correct += perf.questionsCorrect;
          attempted += perf.questionsAttempted;
        });

      const rate = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

      return {
        name: sub.name,
        Acertos: rate,
        Resolvidas: attempted,
      };
    }).filter(d => d.Resolvidas > 0); // Only show subjects with questions resolved
  };

  const accuracyData = getAccuracyData();

  // C. Study time distribution per subject
  const getTimeDistributionData = () => {
    const distribution = subjects.map((sub) => {
      const subjectMinutes = sessions
        .filter((s) => s.subjectId === sub.id)
        .reduce((sum, curr) => sum + curr.durationMinutes, 0);

      return {
        name: sub.name,
        value: parseFloat((subjectMinutes / 60).toFixed(1)),
      };
    }).filter(d => d.value > 0);

    return distribution.length > 0 ? distribution : [{ name: "Nenhuma matéria", value: 1 }];
  };

  const timeDistributionData = getTimeDistributionData();

  // D. Mock Exam Performance progression over time
  const getMockProgressionData = () => {
    return mockExams
      .map((m) => {
        const rate = m.questionsAttempted > 0 
          ? Math.round((m.questionsCorrect / m.questionsAttempted) * 100) 
          : 0;
        return {
          name: m.name,
          date: m.date,
          Aproveitamento: rate,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date)); // chronological order
  };

  const mockProgressionData = getMockProgressionData();

  return (
    <div id="stats-section" className="space-y-6">
      
      {/* High-level performance cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total hours */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Horas Líquidas</span>
            <span className="text-xl font-bold text-gray-800">{totalStudyHours}h</span>
            <span className="text-[10px] text-emerald-600 block mt-0.5">Estudadas no total</span>
          </div>
        </div>

        {/* Accuracy */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Aproveitamento</span>
            <span className="text-xl font-bold text-gray-800">{overallAccuracy}%</span>
            <span className="text-[10px] text-blue-600 block mt-0.5">Taxa de acertos</span>
          </div>
        </div>

        {/* Questions solved */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Questões Feitas</span>
            <span className="text-xl font-bold text-gray-800">{totalQuestionsAttempted}</span>
            <span className="text-[10px] text-indigo-600 block mt-0.5">{totalQuestionsCorrect} corretas</span>
          </div>
        </div>

        {/* Study Streak */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
            <Zap className="w-5 h-5 fill-amber-500" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Constância / Streak</span>
            <span className="text-xl font-bold text-gray-800">{streak} {streak === 1 ? "dia" : "dias"}</span>
            <span className="text-[10px] text-amber-600 block mt-0.5">Estudos seguidos</span>
          </div>
        </div>

      </div>

      {/* Goal gauge and streak tracker */}
      <div className="bg-white rounded-3xl border border-gray-100 p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <h4 className="font-bold text-gray-800 text-sm">Meta Semanal de Horas Líquidas</h4>
          </div>
          <p className="text-xs text-gray-400">Progresso acumulado de estudos líquidos nos últimos 7 dias.</p>
        </div>

        <div className="flex-1 max-w-lg w-full space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-emerald-700">Progresso: {currentWeekHours}h de {weeklyGoalHours}h</span>
            <span className="text-gray-500">{weeklyGoalPercent}% concluída</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
              style={{ width: `${weeklyGoalPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Bar Chart: Daily Study Hours */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
            <Calendar className="w-4.5 h-4.5 text-emerald-600" />
            <h4 className="font-bold text-gray-800 text-sm">Horas de Estudo nos Últimos 7 Dias</h4>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyStudyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="h" />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #f1f5f9' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                />
                <Bar dataKey="Horas" fill="#10b981" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Horizontal Bar: Performance by Subject */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
            <TrendingUp className="w-4.5 h-4.5 text-blue-600" />
            <h4 className="font-bold text-gray-800 text-sm">Aproveitamento por Disciplina (%)</h4>
          </div>
          <div className="h-64">
            {accuracyData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <p className="text-xs text-gray-400 italic">Nenhum dado de questões cadastrado ainda.</p>
                <p className="text-[10px] text-gray-400 mt-1">Registre o acerto de questões no cronômetro ou controle de edital.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  layout="vertical" 
                  data={accuracyData} 
                  margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={10} unit="%" />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} width={85} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #f1f5f9' }}
                  />
                  <Bar dataKey="Acertos" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16}>
                    {accuracyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.Acertos >= 75 ? "#10b981" : entry.Acertos >= 50 ? "#f59e0b" : "#ef4444"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 3. Pie Chart: Study Time Distribution */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
            <BookOpen className="w-4.5 h-4.5 text-indigo-600" />
            <h4 className="font-bold text-gray-800 text-sm">Distribuição do Tempo de Estudo</h4>
          </div>
          <div className="h-64 flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="w-full h-44 sm:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={timeDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {timeDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} horas`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Custom Legend */}
            <div className="w-full sm:w-1/2 overflow-y-auto max-h-48 space-y-1.5 px-2">
              {timeDistributionData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <div 
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-gray-600 font-medium truncate max-w-[120px]">{entry.name}</span>
                  <span className="text-gray-400 font-bold ml-auto">{entry.value}h</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Line Chart: Mock Exam Score Progression */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
            <TrendingUp className="w-4.5 h-4.5 text-purple-600" />
            <h4 className="font-bold text-gray-800 text-sm">Evolução em Simulados (%)</h4>
          </div>
          <div className="h-64">
            {mockProgressionData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <p className="text-xs text-gray-400 italic">Nenhum simulado cadastrado para traçar a evolução.</p>
                <p className="text-[10px] text-gray-400 mt-1">Insira seus simulados na aba "Simulados & Provas" para visualizar o gráfico de progressão.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockProgressionData} margin={{ top: 10, right: 20, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 100]} unit="%" />
                  <Tooltip 
                    contentStyle={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #f1f5f9' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Aproveitamento" 
                    stroke="#8b5cf6" 
                    strokeWidth={3} 
                    activeDot={{ r: 6 }} 
                    dot={{ stroke: '#8b5cf6', strokeWidth: 2, r: 4, fill: '#ffffff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
