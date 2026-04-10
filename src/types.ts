export interface Teacher {
  id: string;
  name: string;
  code: string;
  department: string;
  designation: string;
}

export interface Student {
  id: string;
  studentId: string;
  name: string;
  avatar: string;
  rollNumber?: string;
  guardianName?: string;
  class?: string;
  assignedTeacherId?: string;
}

export interface ObservationData {
  studentId: string;
  date: string; // ISO string
  mood: string;
  dimensions: {
    emotional: number;
    social: number;
    cognitive: number;
    physical: number;
    creative: number;
  };
  tags: string[];
  highlight: string;
  photo?: string;
}

export interface GeneratedReport {
  id: string;
  studentId: string;
  teacherId: string;
  startDate: string;
  endDate: string;
  content: string;
  recommendations: string;
  status: 'draft' | 'final';
  images?: string[];
}

export const DIMENSIONS = [
  { id: 'emotional', label: 'Emotional', color: 'bg-rose-400' },
  { id: 'social', label: 'Social', color: 'bg-emerald-400' },
  { id: 'cognitive', label: 'Cognitive', color: 'bg-sky-400' },
  { id: 'physical', label: 'Physical', color: 'bg-amber-400' },
  { id: 'creative', label: 'Creative', color: 'bg-purple-400' },
] as const;

export const MOODS = [
  { id: 'happy', label: 'Happy', emoji: '😊' },
  { id: 'calm', label: 'Calm', emoji: '😌' },
  { id: 'energetic', label: 'Energetic', emoji: '⚡' },
  { id: 'thoughtful', label: 'Thoughtful', emoji: '🤔' },
  { id: 'tired', label: 'Tired', emoji: '😴' },
];

export const QUICK_TAGS = [
  "Shared with peers",
  "Focused play",
  "Problem solving",
  "Creative expression",
  "Physical milestone",
  "Language development",
  "Emotional regulation",
  "Curiosity shown",
];

export const TEACHERS: Teacher[] = [
  { id: '1', name: 'PRAVEEN KUMARI', code: '20250051', department: 'Department (Pre-Primary)', designation: 'N.T.T.' },
  { id: '2', name: 'Sheffali Joshi', code: '20240055', department: 'Department (Pre-Primary)', designation: 'N.T.T.' },
  { id: '3', name: 'SUNITA DEVI', code: '20240015', department: 'Department (Pre-Primary)', designation: 'N.T.T.' },
  { id: '4', name: 'SHIVALI', code: '20240062', department: 'Department (TGT- Science)', designation: 'T.G.T(SCI.)' },
];
