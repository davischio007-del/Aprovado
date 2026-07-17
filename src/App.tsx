import React, { useState, useEffect } from "react";
import { 
  BookOpen, Calendar, Clock, Trophy, RefreshCw, BarChart2, 
  FileText, Sparkles, Plus, Trash2, CheckSquare, Zap, AlertCircle,
  Shield, Users, LogOut
} from "lucide-react";

import { Subject, TopicPerformance, StudySession, ScheduledTask, Revision, MockExam, ExamDate, UserAccount } from "./types";
import Stopwatch from "./components/Stopwatch";
import SyllabusTracker from "./components/SyllabusTracker";
import StatsReports from "./components/StatsReports";
import MockExams from "./components/MockExams";
import WeeklyScheduleView from "./components/WeeklyScheduleView";
import ReviewsView from "./components/ReviewsView";
import EbookReader from "./components/EbookReader";
import AdminPanel from "./components/AdminPanel";
import LoginScreen from "./components/LoginScreen";

// INITIAL DEFAULT SYLLABUS DATA (PRE-LOADED FOR AMAZING OOB EXPERIENCE)
const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: "portugues",
    name: "Língua Portuguesa",
    weeklyHours: 4,
    topics: ["Compreensão e Interpretação de Texto", "Ortografia Oficial e Acentuação", "Sintaxe da Oração", "Sinais de Pontuação"]
  },
  {
    id: "constitucional",
    name: "Direito Constitucional",
    weeklyHours: 3,
    topics: ["Direitos e Garantias Fundamentais", "Artigo 5º da CF/88", "Organização do Estado", "Administração Pública"]
  },
  {
    id: "raciocinio",
    name: "Raciocínio Lógico-Matemático",
    weeklyHours: 3,
    topics: ["Lógica Proposicional e Conectivos", "Equivalências Lógicas", "Análise Combinatória", "Probabilidade"]
  }
];

const DEFAULT_SCHEDULE_ITEMS = [
  { day: 1, subjectId: "portugues", topic: "Compreensão e Interpretação de Texto", durationMinutes: 90 },
  { day: 2, subjectId: "constitucional", topic: "Artigo 5º da CF/88", durationMinutes: 90 },
  { day: 3, subjectId: "raciocinio", topic: "Lógica Proposicional e Conectivos", durationMinutes: 90 },
  { day: 4, subjectId: "portugues", topic: "Ortografia Oficial e Acentuação", durationMinutes: 90 },
  { day: 5, subjectId: "constitucional", topic: "Direitos e Garantias Fundamentais", durationMinutes: 90 },
  { day: 6, subjectId: "raciocinio", topic: "Equivalências Lógicas", durationMinutes: 90 }
];

const DEFAULT_EXAMS: ExamDate[] = [
  { id: "1", name: "Concurso Público Unificado", date: "2026-11-22" }
];

const DEFAULT_USERS: UserAccount[] = [
  {
    id: "user-admin-1",
    name: "Davi Schio",
    email: "davi.schio007@gmail.com",
    role: "admin",
    passwordPlain: "admin123",
    status: "active",
    createdAt: "2026-07-17T12:00:00Z"
  },
  {
    id: "user-student-2",
    name: "João Roberto",
    email: "joao.estudante@gmail.com",
    role: "external_student",
    passwordPlain: "aluno2026",
    status: "active",
    createdAt: "2026-07-17T12:05:00Z"
  }
];

export default function App() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'schedule' | 'syllabus' | 'reviews' | 'stats' | 'mocks' | 'ebooks' | 'admin'>('dashboard');

  // Core Application States (Synced with localStorage)
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [loadedUserEmail, setLoadedUserEmail] = useState<string>("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topicPerformances, setTopicPerformances] = useState<TopicPerformance[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [scheduleTasks, setScheduleTasks] = useState<ScheduledTask[]>([]);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [mockExams, setMockExams] = useState<MockExam[]>([]);
  const [examDates, setExamDates] = useState<ExamDate[]>([]);
  const [weeklyGoal, setWeeklyGoal] = useState<number>(15);

  // For Stopwatch Preselections (e.g. studied from list)
  const [preselectedSubId, setPreselectedSubId] = useState("");
  const [preselectedTopic, setPreselectedTopic] = useState("");

  // Target Exam Date Form state
  const [newExamName, setNewExamName] = useState("");
  const [newExamDate, setNewExamDate] = useState("");
  const [showExamForm, setShowExamForm] = useState(false);

  // 1. INITIALIZE USERS AND CURRENT SESSION FROM LOCALSTORAGE
  useEffect(() => {
    const cachedUsers = localStorage.getItem("aprovado_users");
    const cachedCurrentUser = localStorage.getItem("aprovado_current_user");

    let loadedUsers = DEFAULT_USERS;
    if (cachedUsers) {
      loadedUsers = JSON.parse(cachedUsers);
      setUsers(loadedUsers);
    } else {
      setUsers(DEFAULT_USERS);
      localStorage.setItem("aprovado_users", JSON.stringify(DEFAULT_USERS));
    }

    if (cachedCurrentUser) {
      setCurrentUser(JSON.parse(cachedCurrentUser));
    } else {
      setCurrentUser(null);
    }
  }, []);

  // Sync users list to localStorage
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem("aprovado_users", JSON.stringify(users));
    }
  }, [users]);

  // Sync current user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("aprovado_current_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("aprovado_current_user");
    }
  }, [currentUser]);

  // Whenever currentUser changes, load their specific data atomically!
  useEffect(() => {
    if (!currentUser) {
      setLoadedUserEmail("");
      return;
    }

    const email = currentUser.email;
    const cachedSubjects = localStorage.getItem(`aprovado_subjects_${email}`);
    const cachedPerformances = localStorage.getItem(`aprovado_topic_performances_${email}`);
    const cachedSessions = localStorage.getItem(`aprovado_sessions_${email}`);
    const cachedTasks = localStorage.getItem(`aprovado_schedule_tasks_${email}`);
    const cachedRevisions = localStorage.getItem(`aprovado_revisions_${email}`);
    const cachedMocks = localStorage.getItem(`aprovado_mock_exams_${email}`);
    const cachedDates = localStorage.getItem(`aprovado_exam_dates_${email}`);
    const cachedGoal = localStorage.getItem(`aprovado_weekly_goal_${email}`);

    if (cachedSubjects) {
      setSubjects(JSON.parse(cachedSubjects));
    } else {
      setSubjects(DEFAULT_SUBJECTS);
    }

    if (cachedPerformances) {
      setTopicPerformances(JSON.parse(cachedPerformances));
    } else {
      const initialPerf: TopicPerformance[] = [];
      DEFAULT_SUBJECTS.forEach(sub => {
        sub.topics.forEach(t => {
          initialPerf.push({
            subjectId: sub.id,
            topic: t,
            status: "not_started",
            questionsAttempted: 0,
            questionsCorrect: 0
          });
        });
      });
      setTopicPerformances(initialPerf);
    }

    if (cachedSessions) {
      setSessions(JSON.parse(cachedSessions));
    } else {
      setSessions([]);
    }

    if (cachedTasks) {
      setScheduleTasks(JSON.parse(cachedTasks));
    } else {
      const initialTasks = DEFAULT_SCHEDULE_ITEMS.map((item, idx) => ({
        id: `default-task-${idx}`,
        day: item.day,
        subjectId: item.subjectId,
        topic: item.topic,
        durationMinutes: item.durationMinutes,
        completed: false,
        type: "study" as const
      }));
      setScheduleTasks(initialTasks);
    }

    if (cachedRevisions) {
      setRevisions(JSON.parse(cachedRevisions));
    } else {
      setRevisions([]);
    }

    if (cachedMocks) {
      setMockExams(JSON.parse(cachedMocks));
    } else {
      setMockExams([]);
    }

    if (cachedDates) {
      setExamDates(JSON.parse(cachedDates));
    } else {
      setExamDates(DEFAULT_EXAMS);
    }

    if (cachedGoal) {
      setWeeklyGoal(Number(cachedGoal));
    } else {
      setWeeklyGoal(15);
    }

    setLoadedUserEmail(email);
  }, [currentUser]);

  // Caching updates to localStorage (ONLY if loadedUserEmail matches currentUser.email to avoid stale overwrite race conditions!)
  useEffect(() => {
    if (!currentUser || loadedUserEmail !== currentUser.email) return;
    localStorage.setItem(`aprovado_subjects_${currentUser.email}`, JSON.stringify(subjects));
  }, [subjects, currentUser, loadedUserEmail]);

  useEffect(() => {
    if (!currentUser || loadedUserEmail !== currentUser.email) return;
    localStorage.setItem(`aprovado_topic_performances_${currentUser.email}`, JSON.stringify(topicPerformances));
  }, [topicPerformances, currentUser, loadedUserEmail]);

  useEffect(() => {
    if (!currentUser || loadedUserEmail !== currentUser.email) return;
    localStorage.setItem(`aprovado_sessions_${currentUser.email}`, JSON.stringify(sessions));
  }, [sessions, currentUser, loadedUserEmail]);

  useEffect(() => {
    if (!currentUser || loadedUserEmail !== currentUser.email) return;
    localStorage.setItem(`aprovado_schedule_tasks_${currentUser.email}`, JSON.stringify(scheduleTasks));
  }, [scheduleTasks, currentUser, loadedUserEmail]);

  useEffect(() => {
    if (!currentUser || loadedUserEmail !== currentUser.email) return;
    localStorage.setItem(`aprovado_revisions_${currentUser.email}`, JSON.stringify(revisions));
  }, [revisions, currentUser, loadedUserEmail]);

  useEffect(() => {
    if (!currentUser || loadedUserEmail !== currentUser.email) return;
    localStorage.setItem(`aprovado_mock_exams_${currentUser.email}`, JSON.stringify(mockExams));
  }, [mockExams, currentUser, loadedUserEmail]);

  useEffect(() => {
    if (!currentUser || loadedUserEmail !== currentUser.email) return;
    localStorage.setItem(`aprovado_exam_dates_${currentUser.email}`, JSON.stringify(examDates));
  }, [examDates, currentUser, loadedUserEmail]);

  useEffect(() => {
    if (!currentUser || loadedUserEmail !== currentUser.email) return;
    localStorage.setItem(`aprovado_weekly_goal_${currentUser.email}`, weeklyGoal.toString());
  }, [weeklyGoal, currentUser, loadedUserEmail]);

  // 3. HANDLER FUNCTIONS

  // Trigger Study Selection preset & switch to dashboard
  const handleStartStudyPreset = (subId: string, topic: string) => {
    setPreselectedSubId(subId);
    setPreselectedTopic(topic);
    setActiveTab('dashboard');
    // Scroll smoothly to stopwatch on dashboard
    setTimeout(() => {
      document.getElementById("stopwatch-container")?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

  // Import AI Plan from parsed Syllabus (Edital)
  const handleImportSyllabus = (plan: { examName: string; subjects: Subject[]; weeklySchedule: any[] }) => {
    if (plan.subjects.length === 0) {
      // Reset state to empty
      setSubjects([]);
      setTopicPerformances([]);
      setScheduleTasks([]);
      setRevisions([]);
      return;
    }

    setSubjects(plan.subjects);

    // Build performances mapping
    const newPerformances: TopicPerformance[] = [];
    plan.subjects.forEach(sub => {
      sub.topics.forEach(t => {
        newPerformances.push({
          subjectId: sub.id,
          topic: t,
          status: "not_started",
          questionsAttempted: 0,
          questionsCorrect: 0
        });
      });
    });
    setTopicPerformances(newPerformances);

    // Build schedule task list
    const newTasks = plan.weeklySchedule.map((item, idx) => ({
      id: `task-${Date.now()}-${idx}`,
      day: item.day,
      subjectId: item.subjectId,
      topic: item.topic,
      durationMinutes: item.durationMinutes,
      completed: false,
      type: "study" as const
    }));
    setScheduleTasks(newTasks);

    // Clear old state
    setRevisions([]);
    setSessions([]);

    // Add target exam countdown if parsed
    if (plan.examName) {
      const today = new Date();
      today.setDate(today.getDate() + 90); // Default to 90 days out
      const dateStr = today.toISOString().substring(0, 10);
      setExamDates([{ id: `exam-${Date.now()}`, name: plan.examName, date: dateStr }]);
    }

    // Switch to weekly schedule tab to showcase the automatic generation
    setActiveTab('schedule');
  };

  // Save timing & questions logged from Stopwatch
  const handleSaveSession = (session: {
    subjectId: string;
    topic: string;
    durationMinutes: number;
    questionsAttempted: number;
    questionsCorrect: number;
    notes: string;
  }) => {
    const newSession: StudySession = {
      id: `session-${Date.now()}`,
      subjectId: session.subjectId,
      topic: session.topic,
      durationMinutes: session.durationMinutes,
      date: new Date().toISOString(),
      questionsAttempted: session.questionsAttempted,
      questionsCorrect: session.questionsCorrect,
      notes: session.notes
    };

    setSessions((prev) => [newSession, ...prev]);

    // Update topic performance (status to studied, adding questions)
    setTopicPerformances((prev) => {
      const exists = prev.some(p => p.subjectId === session.subjectId && p.topic === session.topic);
      if (exists) {
        return prev.map(p => {
          if (p.subjectId === session.subjectId && p.topic === session.topic) {
            return {
              ...p,
              status: p.status === 'not_started' ? 'studying' : p.status, // set studying
              questionsAttempted: p.questionsAttempted + session.questionsAttempted,
              questionsCorrect: p.questionsCorrect + session.questionsCorrect,
              notes: session.notes || p.notes,
              lastStudyDate: new Date().toISOString()
            };
          }
          return p;
        });
      } else {
        return [
          ...prev,
          {
            subjectId: session.subjectId,
            topic: session.topic,
            status: "studying",
            questionsAttempted: session.questionsAttempted,
            questionsCorrect: session.questionsCorrect,
            notes: session.notes,
            lastStudyDate: new Date().toISOString()
          }
        ];
      }
    });

    // PROGRAM REVISIONS: Setup 24h, 7d and 30d revisions automatically!
    const addDays = (date: Date, days: number): string => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result.toISOString().substring(0, 10);
    };

    const today = new Date();
    const rev24h: Revision = {
      id: `rev-24h-${Date.now()}`,
      subjectId: session.subjectId,
      topic: session.topic,
      dueDate: addDays(today, 1),
      completed: false,
      type: "24h"
    };

    const rev7d: Revision = {
      id: `rev-7d-${Date.now()}`,
      subjectId: session.subjectId,
      topic: session.topic,
      dueDate: addDays(today, 7),
      completed: false,
      type: "7d"
    };

    const rev30d: Revision = {
      id: `rev-30d-${Date.now()}`,
      subjectId: session.subjectId,
      topic: session.topic,
      dueDate: addDays(today, 30),
      completed: false,
      type: "30d"
    };

    setRevisions((prev) => [...prev, rev24h, rev7d, rev30d]);

    // Update matching tasks in schedule if applicable
    setScheduleTasks((prev) => {
      return prev.map(t => {
        if (!t.completed && t.subjectId === session.subjectId && t.topic === session.topic) {
          return { ...t, completed: true };
        }
        return t;
      });
    });
  };

  // Syllabus tracker callbacks
  const handleUpdateTopicStatus = (subjectId: string, topic: string, status: TopicPerformance['status']) => {
    setTopicPerformances((prev) => {
      const exists = prev.some(p => p.subjectId === subjectId && p.topic === topic);
      if (exists) {
        return prev.map(p => {
          if (p.subjectId === subjectId && p.topic === topic) {
            return { ...p, status, lastStudyDate: new Date().toISOString() };
          }
          return p;
        });
      } else {
        return [
          ...prev,
          {
            subjectId,
            topic,
            status,
            questionsAttempted: 0,
            questionsCorrect: 0,
            lastStudyDate: new Date().toISOString()
          }
        ];
      }
    });
  };

  const handleUpdateTopicQuestions = (subjectId: string, topic: string, attempted: number, correct: number) => {
    setTopicPerformances((prev) => {
      const exists = prev.some(p => p.subjectId === subjectId && p.topic === topic);
      if (exists) {
        return prev.map(p => {
          if (p.subjectId === subjectId && p.topic === topic) {
            return {
              ...p,
              questionsAttempted: p.questionsAttempted + attempted,
              questionsCorrect: p.questionsCorrect + correct,
              lastStudyDate: new Date().toISOString()
            };
          }
          return p;
        });
      } else {
        return [
          ...prev,
          {
            subjectId,
            topic,
            status: "studying",
            questionsAttempted: attempted,
            questionsCorrect: correct,
            lastStudyDate: new Date().toISOString()
          }
        ];
      }
    });
  };

  const handleAddSubject = (name: string, weeklyHours: number) => {
    const newSub: Subject = {
      id: name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      name,
      weeklyHours,
      topics: []
    };
    setSubjects((prev) => [...prev, newSub]);
  };

  const handleAddTopic = (subId: string, topicName: string) => {
    setSubjects((prev) => {
      return prev.map(s => {
        if (s.id === subId) {
          return { ...s, topics: [...s.topics, topicName] };
        }
        return s;
      });
    });

    setTopicPerformances((prev) => [
      ...prev,
      {
        subjectId: subId,
        topic: topicName,
        status: "not_started",
        questionsAttempted: 0,
        questionsCorrect: 0
      }
    ]);
  };

  const handleDeleteSubject = (subId: string) => {
    setSubjects((prev) => prev.filter(s => s.id !== subId));
    setTopicPerformances((prev) => prev.filter(p => p.subjectId !== subId));
    setScheduleTasks((prev) => prev.filter(t => t.subjectId !== subId));
    setRevisions((prev) => prev.filter(r => r.subjectId !== subId));
  };

  // Schedule task actions
  const handleToggleTaskCompleted = (taskId: string) => {
    setScheduleTasks((prev) => {
      return prev.map(t => {
        if (t.id === taskId) {
          return { ...t, completed: !t.completed };
        }
        return t;
      });
    });
  };

  // Restore schedule tasks with standard slots
  const handleRegenerateSchedule = () => {
    // Generate schedule tasks based on parsed subjects or default items
    const sourceItems = subjects === DEFAULT_SUBJECTS ? DEFAULT_SCHEDULE_ITEMS : [];
    
    let generatedTasks: ScheduledTask[] = [];
    if (sourceItems.length > 0) {
      generatedTasks = sourceItems.map((item, idx) => ({
        id: `task-${Date.now()}-${idx}`,
        day: item.day,
        subjectId: item.subjectId,
        topic: item.topic,
        durationMinutes: item.durationMinutes,
        completed: false,
        type: "study" as const
      }));
    } else {
      // Loop over subjects and create some basic slots
      let idx = 0;
      subjects.forEach((sub, sIdx) => {
        sub.topics.forEach((t, tIdx) => {
          if (idx < 12) { // limit 12 schedule blocks
            generatedTasks.push({
              id: `task-${Date.now()}-${idx}`,
              day: (idx % 6) + 1, // distribute Mon-Sat
              subjectId: sub.id,
              topic: t,
              durationMinutes: 90,
              completed: false,
              type: "study" as const
            });
            idx++;
          }
        });
      });
    }

    setScheduleTasks(generatedTasks);
  };

  // Spaced repetitions completion
  const handleCompleteRevision = (id: string) => {
    const matchedRev = revisions.find(r => r.id === id);
    setRevisions((prev) => {
      return prev.map(r => {
        if (r.id === id) return { ...r, completed: true };
        return r;
      });
    });

    // Mark matched topic status to 'reviewed'
    if (matchedRev) {
      handleUpdateTopicStatus(matchedRev.subjectId, matchedRev.topic, "reviewed");
    }
  };

  const handleClearCompletedRevisions = () => {
    if (confirm("Tem certeza que deseja excluir permanentemente todas as revisões concluídas?")) {
      setRevisions((prev) => prev.filter(r => !r.completed));
    }
  };

  // Mock Exams actions
  const handleAddMockExam = (exam: Omit<MockExam, 'id'>) => {
    const newExam: MockExam = {
      ...exam,
      id: `mock-${Date.now()}`,
    };
    setMockExams((prev) => [newExam, ...prev]);
  };

  const handleDeleteMockExam = (id: string) => {
    setMockExams((prev) => prev.filter(m => m.id !== id));
  };

  // Exam Date actions
  const handleAddExamDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamName.trim() || !newExamDate) return;
    const newExam: ExamDate = {
      id: `exam-${Date.now()}`,
      name: newExamName.trim(),
      date: newExamDate
    };
    setExamDates((prev) => [newExam, ...prev]);
    setNewExamName("");
    setNewExamDate("");
    setShowExamForm(false);
  };

  const handleDeleteExamDate = (id: string) => {
    const exam = examDates.find(e => e.id === id);
    if (confirm(`Tem certeza que deseja excluir permanentemente o registro da prova "${exam?.name || ""}"?`)) {
      setExamDates((prev) => prev.filter(e => e.id !== id));
    }
  };

  // Days remaining calculation
  const getDaysRemaining = (targetDateStr: string) => {
    const target = new Date(targetDateStr);
    const today = new Date();
    today.setHours(0,0,0,0);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // User Accounts Handlers
  const handleAddUser = (newUser: Omit<UserAccount, 'id' | 'createdAt'>) => {
    const user: UserAccount = {
      ...newUser,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setUsers((prev) => [...prev, user]);
  };

  const handleDeleteUser = (id: string) => {
    setUsers((prev) => prev.filter(u => u.id !== id));
  };

  const handleUpdateUser = (updated: UserAccount) => {
    setUsers((prev) => prev.map(u => u.id === updated.id ? updated : u));
    if (currentUser && currentUser.id === updated.id) {
      setCurrentUser(updated);
    }
  };

  const handleSwitchUser = (user: UserAccount) => {
    setCurrentUser(user);
  };

  if (!currentUser) {
    return (
      <LoginScreen 
        users={users} 
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] text-gray-800 flex flex-col font-sans">
      
      {/* 1. BRAND HEADER */}
      <header className="bg-white border-b border-gray-100 py-3.5 px-6 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-md shadow-emerald-600/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-gray-900">Aprovado</h1>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block -mt-0.5">Planejador de Estudos Inteligente</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* User Badge */}
          <div className="text-right hidden sm:block">
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-xs font-bold text-gray-700 block">{currentUser.name}</span>
              <span className={`text-[8px] font-bold uppercase border rounded px-1 px-0.2 ${
                currentUser.role === 'admin' 
                  ? "bg-purple-100 text-purple-700 border-purple-200" 
                  : "bg-blue-100 text-blue-700 border-blue-200"
              }`}>
                {currentUser.role === 'admin' ? "ADMIN" : "ALUNO"}
              </span>
            </div>
            <span className="text-[10px] text-gray-400 font-medium block -mt-0.5">{currentUser.email}</span>
          </div>
          <div className="h-9 w-9 bg-emerald-100 rounded-xl border border-emerald-200 text-emerald-800 font-extrabold flex items-center justify-center text-sm shadow-inner uppercase">
            {currentUser.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>

          {/* Logout Button */}
          <button
            onClick={() => {
              if (confirm("Tem certeza que deseja sair do sistema?")) {
                setCurrentUser(null);
                setActiveTab('dashboard');
              }
            }}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. MAIN LAYOUT CONTAINER */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        
        {/* Navigation Sidebar/Rail */}
        <aside className="bg-white border-r border-gray-100 w-full lg:w-64 p-4 shrink-0 flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto justify-start items-center lg:items-stretch shadow-xs shrink-0">
          
          <button
            id="tab-dashboard-btn"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap lg:whitespace-normal w-auto lg:w-full ${
              activeTab === 'dashboard'
                ? "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Trophy className="w-4 h-4" />
            Painel Geral
          </button>

          <button
            id="tab-schedule-btn"
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap lg:whitespace-normal w-auto lg:w-full ${
              activeTab === 'schedule'
                ? "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Cronograma Semanal
          </button>

          <button
            id="tab-syllabus-btn"
            onClick={() => setActiveTab('syllabus')}
            className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap lg:whitespace-normal w-auto lg:w-full ${
              activeTab === 'syllabus'
                ? "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            Controle de Edital
          </button>

          <button
            id="tab-reviews-btn"
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap lg:whitespace-normal w-auto lg:w-full ${
              activeTab === 'reviews'
                ? "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            Revisões Spaced
          </button>

          <button
            id="tab-stats-btn"
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap lg:whitespace-normal w-auto lg:w-full ${
              activeTab === 'stats'
                ? "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            Desempenho e Estatísticas
          </button>

          <button
            id="tab-mocks-btn"
            onClick={() => setActiveTab('mocks')}
            className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap lg:whitespace-normal w-auto lg:w-full ${
              activeTab === 'mocks'
                ? "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <FileText className="w-4 h-4" />
            Simulados e Provas
          </button>

          <button
            id="tab-ebooks-btn"
            onClick={() => setActiveTab('ebooks')}
            className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap lg:whitespace-normal w-auto lg:w-full ${
              activeTab === 'ebooks'
                ? "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Biblioteca E-books
          </button>

          <button
            id="tab-admin-btn"
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap lg:whitespace-normal w-auto lg:w-full ${
              activeTab === 'admin'
                ? "bg-purple-50 text-purple-700 border-l-4 border-purple-600"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Shield className="w-4 h-4" />
            Gerenciar Acessos
          </button>

        </aside>

        {/* Primary View Container */}
        <main className="flex-1 p-5 md:p-8 overflow-y-auto min-w-0 space-y-6">
          
          {/* A. DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div id="dashboard-view" className="space-y-6 animate-fade-in">
              
              {/* Top motivation row */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-emerald-600 rounded-3xl p-6 text-white shadow-lg shadow-emerald-600/10">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-5 h-5 fill-white text-emerald-200" />
                    <h2 className="text-lg md:text-xl font-bold">Olá, Davi Schio! Pronto para render hoje?</h2>
                  </div>
                  <p className="text-xs md:text-sm text-emerald-50 font-medium">
                    A constância é o segredo do sucesso. Complete suas metas semanais e marque suas horas líquidas no cronômetro interativo abaixo.
                  </p>
                </div>
                
                {/* Micro goal stats */}
                <div className="bg-emerald-700/50 border border-emerald-500/30 rounded-2xl px-4 py-2 flex items-center gap-3">
                  <Zap className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <div>
                    <span className="text-[10px] text-emerald-100 uppercase font-extrabold tracking-wider">Estudo Líquido Hoje</span>
                    <span className="text-sm font-extrabold block">
                      {(sessions
                        .filter(s => s.date.substring(0, 10) === new Date().toISOString().substring(0,10))
                        .reduce((sum, curr) => sum + curr.durationMinutes, 0) / 60).toFixed(1)}h
                    </span>
                  </div>
                </div>
              </div>

              {/* Interactive Stopwatch (Hours tracking) */}
              <Stopwatch 
                subjects={subjects}
                onSaveSession={handleSaveSession}
                preselectedSubjectId={preselectedSubId}
                preselectedTopic={preselectedTopic}
                onClearPreselections={() => {
                  setPreselectedSubId("");
                  setPreselectedTopic("");
                }}
              />

              {/* Two Column Grid: Countdown & Goals / Tasks list */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Column 1: Exams Countdown Date Tracker */}
                <div className="lg:col-span-1 bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                    <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                      <Calendar className="w-4.5 h-4.5 text-emerald-600" />
                      Provas Agendadas
                    </h3>
                    <button
                      onClick={() => setShowExamForm(!showExamForm)}
                      className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Adicionar prova"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {showExamForm && (
                    <form onSubmit={handleAddExamDate} className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-2 animate-fade-in">
                      <input
                        required
                        type="text"
                        value={newExamName}
                        onChange={(e) => setNewExamName(e.target.value)}
                        placeholder="Nome (ex: Receita Federal)"
                        className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                      />
                      <input
                        required
                        type="date"
                        value={newExamDate}
                        onChange={(e) => setNewExamDate(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setShowExamForm(false)}
                          className="px-2 py-1 bg-gray-200 text-[10px] font-bold rounded-lg"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-2 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg"
                        >
                          Salvar
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-3.5">
                    {examDates.length === 0 ? (
                      <p className="text-xs text-gray-400 italic text-center py-4">Nenhuma data registrada.</p>
                    ) : (
                      examDates.map((ex) => {
                        const days = getDaysRemaining(ex.date);
                        const isExpired = days < 0;

                        return (
                          <div key={ex.id} className="border border-gray-100 rounded-2xl p-4.5 bg-gray-50/20 relative group">
                            <h4 className="font-bold text-xs text-gray-700">{ex.name}</h4>
                            <span className="text-[10px] text-gray-400 block mt-0.5">{ex.date}</span>
                            
                            <div className="mt-3">
                              {isExpired ? (
                                <span className="text-xs font-semibold text-gray-400">Prova realizada</span>
                              ) : (
                                <div className="flex items-baseline gap-1">
                                  <span className="text-2xl font-black text-emerald-600">{days}</span>
                                  <span className="text-[10px] text-gray-400 font-bold uppercase">dias restantes</span>
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => handleDeleteExamDate(ex.id)}
                              className="absolute top-3 right-3 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remover prova"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Column 2: Quick Daily Goals & Streak Tracking */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                    <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                      <CheckSquare className="w-4.5 h-4.5 text-emerald-600" />
                      Tarefas Recomendadas de Hoje
                    </h3>
                    <button
                      onClick={() => setActiveTab('schedule')}
                      className="text-[10px] text-emerald-600 hover:underline font-bold"
                    >
                      Ver Cronograma Completo
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    {scheduleTasks.filter(t => !t.completed).slice(0, 4).length === 0 ? (
                      <div className="py-8 text-center text-gray-400 italic flex flex-col items-center justify-center space-y-2">
                        <Trophy className="w-8 h-8 text-emerald-500" />
                        <p className="text-xs font-bold text-gray-700">Meta diária concluída!</p>
                        <p className="text-[10px] text-gray-400">Você cumpriu todos os blocos recomendados para hoje.</p>
                      </div>
                    ) : (
                      scheduleTasks
                        .filter(t => !t.completed)
                        .slice(0, 4)
                        .map((task) => (
                          <div key={task.id} className="border border-gray-150 rounded-xl p-3 flex justify-between items-center bg-white hover:border-emerald-200 transition-colors">
                            <div>
                              <span className="font-bold text-xs text-gray-800 block">
                                {subjects.find(s => s.id === task.subjectId)?.name || "Matéria"}
                              </span>
                              <span className="text-[10px] text-gray-500 block font-medium">
                                {task.topic}
                              </span>
                              <span className="text-[9px] text-emerald-600 font-bold block mt-1 uppercase">
                                {task.durationMinutes} minutos líquidos
                              </span>
                            </div>

                            <button
                              onClick={() => handleStartStudyPreset(task.subjectId, task.topic)}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-extrabold rounded-lg transition-colors flex items-center gap-0.5"
                            >
                              <Clock className="w-3.5 h-3.5" />
                              Iniciar
                            </button>
                          </div>
                        ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* B. WEEKLY SCHEDULE VIEW */}
          {activeTab === 'schedule' && (
            <div className="animate-fade-in">
              <WeeklyScheduleView 
                subjects={subjects}
                scheduleTasks={scheduleTasks}
                onToggleTaskCompleted={handleToggleTaskCompleted}
                onStartStudyPreset={handleStartStudyPreset}
                onRegenerateSchedule={handleRegenerateSchedule}
              />
            </div>
          )}

          {/* C. SYLLABUS TRACKER VIEW */}
          {activeTab === 'syllabus' && (
            <div className="animate-fade-in">
              <SyllabusTracker 
                subjects={subjects}
                topicPerformances={topicPerformances}
                onImportSyllabus={handleImportSyllabus}
                onUpdateTopicStatus={handleUpdateTopicStatus}
                onUpdateTopicQuestions={handleUpdateTopicQuestions}
                onAddSubject={handleAddSubject}
                onAddTopic={handleAddTopic}
                onDeleteSubject={handleDeleteSubject}
                onStartStudyPreset={handleStartStudyPreset}
              />
            </div>
          )}

          {/* D. SPACED REPETITION PANEL */}
          {activeTab === 'reviews' && (
            <div className="animate-fade-in">
              <ReviewsView 
                subjects={subjects}
                revisions={revisions}
                onCompleteRevision={handleCompleteRevision}
                onClearCompletedRevisions={handleClearCompletedRevisions}
              />
            </div>
          )}

          {/* E. ANALYTICS / STATS REPORT */}
          {activeTab === 'stats' && (
            <div className="animate-fade-in">
              <StatsReports 
                subjects={subjects}
                sessions={sessions}
                topicPerformances={topicPerformances}
                mockExams={mockExams}
                weeklyGoalHours={weeklyGoal}
              />
            </div>
          )}

          {/* F. MOCK EXAMS TRACKER */}
          {activeTab === 'mocks' && (
            <div className="animate-fade-in">
              <MockExams 
                mockExams={mockExams}
                onAddMockExam={handleAddMockExam}
                onDeleteMockExam={handleDeleteMockExam}
              />
            </div>
          )}

          {/* G. EBOOKS LIBRARY */}
          {activeTab === 'ebooks' && (
            <div className="animate-fade-in">
              <EbookReader />
            </div>
          )}

          {/* H. ADMIN PANEL */}
          {activeTab === 'admin' && currentUser && (
            <div className="animate-fade-in">
              <AdminPanel 
                users={users}
                onAddUser={handleAddUser}
                onDeleteUser={handleDeleteUser}
                onUpdateUser={handleUpdateUser}
                currentUser={currentUser}
                onSwitchUser={handleSwitchUser}
              />
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
