export interface Subject {
  id: string;
  name: string;
  weeklyHours: number;
  topics: string[];
}

export interface TopicPerformance {
  subjectId: string;
  topic: string;
  status: 'not_started' | 'studying' | 'studied' | 'reviewed';
  questionsAttempted: number;
  questionsCorrect: number;
  notes?: string;
  lastStudyDate?: string;
}

export interface StudySession {
  id: string;
  subjectId: string;
  topic: string;
  durationMinutes: number;
  date: string; // ISO date string
  questionsAttempted: number;
  questionsCorrect: number;
  notes?: string;
}

export interface ScheduledTask {
  id: string;
  day: number; // 1 = Monday, ..., 7 = Sunday
  subjectId: string;
  topic: string;
  durationMinutes: number;
  completed: boolean;
  type: 'study' | 'review';
}

export interface Revision {
  id: string;
  subjectId: string;
  topic: string;
  dueDate: string; // YYYY-MM-DD
  completed: boolean;
  type: '24h' | '7d' | '30d' | 'custom';
}

export interface MockExam {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  questionsAttempted: number;
  questionsCorrect: number;
  durationMinutes?: number;
  notes?: string;
}

export interface ExamDate {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'external_student' | 'mentor';
  passwordPlain: string;
  status: 'active' | 'suspended';
  createdAt: string;
}

export interface Ebook {
  id: string;
  title: string;
  category: string;
  readingTime: string;
  summary: string;
  content: string[]; // List of paragraphs/sections
}
