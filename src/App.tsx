/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  Camera, 
  CheckCircle2, 
  ArrowLeft, 
  Sparkles, 
  User, 
  LayoutDashboard,
  FileText,
  Loader2,
  Calendar,
  Calendar as CalendarIcon,
  LogOut,
  Save,
  Edit3,
  Image as ImageIcon,
  Plus,
  Upload,
  Trash2,
  AlertTriangle,
  BarChart3,
  Heart,
  Send,
  X,
  Download,
  Share2,
  TreePine as Tree,
  Leaf
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { format, startOfDay, subDays, isSameDay, parseISO } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { cn } from './lib/utils';
import { Student, ObservationData, DIMENSIONS, MOODS, QUICK_TAGS, Teacher, TEACHERS, GeneratedReport } from './types';

const INITIAL_STUDENTS: Student[] = [
  { id: '1', studentId: 'MG-2026-001', name: 'Aarav Sharma', avatar: 'https://picsum.photos/seed/aarav/100', rollNumber: '101', guardianName: 'Rajesh Sharma', class: 'Pre-Primary A', assignedTeacherId: '1' },
  { id: '2', studentId: 'MG-2026-002', name: 'Zoya Khan', avatar: 'https://picsum.photos/seed/zoya/100', rollNumber: '102', guardianName: 'Imran Khan', class: 'Pre-Primary A', assignedTeacherId: '1' },
  { id: '3', studentId: 'MG-2026-003', name: 'Vihaan Gupta', avatar: 'https://picsum.photos/seed/vihaan/100', rollNumber: '103', guardianName: 'Sanjay Gupta', class: 'Pre-Primary B', assignedTeacherId: '2' },
  { id: '4', studentId: 'MG-2026-004', name: 'Ananya Iyer', avatar: 'https://picsum.photos/seed/ananya/100', rollNumber: '104', guardianName: 'Lakshmi Iyer', class: 'Pre-Primary B', assignedTeacherId: '2' },
  { id: '5', studentId: 'MG-2026-005', name: 'Ishaan Verma', avatar: 'https://picsum.photos/seed/ishaan/100', rollNumber: '105', guardianName: 'Anita Verma', class: 'Pre-Primary C', assignedTeacherId: '3' },
];

const INITIAL_OBSERVATIONS: ObservationData[] = [
  {
    studentId: '1',
    date: subDays(new Date(), 1).toISOString(),
    mood: 'happy',
    dimensions: { emotional: 4, social: 5, cognitive: 3, physical: 4, creative: 5 },
    tags: ['Shared with peers', 'Creative expression'],
    highlight: 'Aarav built a complex structure with blocks and invited Zoya to play along, showing great social initiative.',
    photo: 'https://picsum.photos/seed/blocks/800/600'
  },
  {
    studentId: '1',
    date: subDays(new Date(), 2).toISOString(),
    mood: 'thoughtful',
    dimensions: { emotional: 3, social: 2, cognitive: 5, physical: 3, creative: 4 },
    tags: ['Problem solving', 'Curiosity shown'],
    highlight: 'Spent a long time observing the lifecycle of a butterfly in the garden. Asked very insightful questions about nature.',
    photo: 'https://picsum.photos/seed/butterfly/800/600'
  },
  {
    studentId: '1',
    date: subDays(new Date(), 3).toISOString(),
    mood: 'energetic',
    dimensions: { emotional: 5, social: 4, cognitive: 4, physical: 5, creative: 3 },
    tags: ['Physical milestone', 'Language development'],
    highlight: 'Led the morning exercise routine with high energy. Clearly articulated the steps to his classmates.',
    photo: 'https://picsum.photos/seed/exercise/800/600'
  }
];

const INITIAL_REPORTS: GeneratedReport[] = [
  {
    id: 'sample-report-1',
    studentId: '1',
    teacherId: '1',
    startDate: subDays(new Date(), 14).toISOString(),
    endDate: new Date().toISOString(),
    content: "### Executive Summary\n\nHello! It is such a joy to share Aarav's journey with you over the last two weeks. He has been a bright spark in our classroom, showing wonderful engagement and a very happy spirit.\n\n### Our Journey Together\n\n- **Emotional & Social:** Aarav is very kind to his friends and often invites them to play. He shows great empathy and shares his toys willingly.\n- **Cognitive:** His curiosity is truly inspiring—he asks such thoughtful questions and shows a deep interest in how things work.\n- **Physical:** He is very active and loves leading our morning exercises. His coordination and balance have improved significantly.\n- **Creative:** He is a little artist, especially when building with blocks. He creates complex structures and explains the stories behind them.\n\n### Memorable Moments\n\n- **Building Together:** Aarav built a huge block tower and very patiently showed Zoya how to balance the pieces. It was a beautiful display of teamwork.\n- **Nature Exploration:** He spent a long time in the garden watching a butterfly, showing his amazing focus and love for the natural world.\n- **Morning Leader:** He confidently led the class in our 'Sun Salutation' exercise, encouraging everyone with a big smile.\n\n### Looking Ahead\n\n- Try building something together at home with recycled boxes!\n- Visit a local park to look for more butterflies or interesting insects.\n- Ask Aarav to 'lead' a small family activity to build his confidence.",
    recommendations: "We look forward to seeing more of these wonderful moments in the coming weeks!",
    status: 'final',
    images: [
      'https://picsum.photos/seed/blocks/800/600',
      'https://picsum.photos/seed/butterfly/800/600',
      'https://picsum.photos/seed/exercise/800/600'
    ]
  }
];

const ADMIN_PASSWORD = "admin";

export default function App() {
  const [teachers, setTeachers] = useState<Teacher[]>(TEACHERS);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [screen, setScreen] = useState<'login' | 'home' | 'form' | 'submit' | 'report' | 'admin'>('login');
  const [loginMode, setLoginMode] = useState<'teacher' | 'admin'>('teacher');
  const [password, setPassword] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [observations, setObservations] = useState<ObservationData[]>(INITIAL_OBSERVATIONS);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<ObservationData>({
    studentId: '',
    date: '',
    mood: '',
    dimensions: { emotional: 0, social: 0, cognitive: 0, physical: 0, creative: 0 },
    tags: [],
    highlight: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [reports, setReports] = useState<GeneratedReport[]>(INITIAL_REPORTS);
  const [currentReport, setCurrentReport] = useState<GeneratedReport | null>(null);
  const [isEditingReport, setIsEditingReport] = useState(false);
  const [viewingReportsForStudent, setViewingReportsForStudent] = useState<Student | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Admin state
  const [adminTab, setAdminTab] = useState<'dashboard' | 'teachers' | 'students'>('dashboard');
  const [newTeacher, setNewTeacher] = useState({ name: '', code: '', department: '', designation: '' });
  const [newStudent, setNewStudent] = useState({ studentId: '', name: '', rollNumber: '', guardianName: '', class: '', assignedTeacherId: '' });
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string, type: 'teacher' | 'student', step: 1 | 2 } | null>(null);
  const [editingTeacherClass, setEditingTeacherClass] = useState<{ teacherId: string, currentClasses: string[] } | null>(null);
  const [newClassName, setNewClassName] = useState('');

  const downloadSampleExcel = () => {
    const headers = [['Student ID', 'Student Name', 'Roll Number', 'Guardian Name', 'Class', 'Teacher Name']];
    const sampleData = [
      ['MG-2026-001', 'Aarav Sharma', '101', 'Rajesh Sharma', 'Pre-Primary A', 'PRAVEEN KUMARI'],
      ['MG-2026-002', 'Zoya Khan', '102', 'Imran Khan', 'Pre-Primary A', 'PRAVEEN KUMARI']
    ];
    const ws = XLSX.utils.aoa_to_sheet([...headers, ...sampleData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students Template");
    XLSX.writeFile(wb, "MindGarden_Student_Template.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws) as any[];

      const newStudents: Student[] = data.map((row, index) => {
        const teacherName = row['Teacher Name'] || row.teacherName;
        const matchedTeacher = teachers.find(t => t.name.toLowerCase() === teacherName?.toString().toLowerCase());
        
        return {
          id: Math.random().toString(36).substr(2, 9),
          studentId: row['Student ID'] || row.studentId || `MG-${Date.now()}-${index}`,
          name: row['Student Name'] || row.Name || row.name || `Student ${index + 1}`,
          rollNumber: row['Roll Number'] || row.rollNumber || '',
          guardianName: row['Guardian Name'] || row.guardianName || '',
          class: row['Class'] || row.class || '',
          avatar: `https://picsum.photos/seed/${Math.random()}/100`,
          assignedTeacherId: matchedTeacher?.id || undefined
        };
      });

      setStudents(prev => [...prev, ...newStudents]);
    };
    reader.readAsBinaryString(file);
  };

  const addStudentManually = () => {
    if (!newStudent.name || !newStudent.studentId) return;
    const student: Student = {
      id: Math.random().toString(36).substr(2, 9),
      ...newStudent,
      avatar: `https://picsum.photos/seed/${Math.random()}/100`,
    };
    setStudents(prev => [...prev, student]);
    setNewStudent({ studentId: '', name: '', rollNumber: '', guardianName: '', class: '', assignedTeacherId: '' });
  };

  const initiateDelete = (id: string, type: 'teacher' | 'student') => {
    setDeleteConfirmation({ id, type, step: 1 });
  };

  const confirmDelete = () => {
    if (!deleteConfirmation) return;

    if (deleteConfirmation.step === 1) {
      setDeleteConfirmation({ ...deleteConfirmation, step: 2 });
    } else {
      if (deleteConfirmation.type === 'teacher') {
        setTeachers(teachers.filter(t => t.id !== deleteConfirmation.id));
        setStudents(students.map(s => s.assignedTeacherId === deleteConfirmation.id ? { ...s, assignedTeacherId: undefined } : s));
      } else {
        setStudents(students.filter(s => s.id !== deleteConfirmation.id));
        setObservations(observations.filter(o => o.studentId !== deleteConfirmation.id));
      }
      setDeleteConfirmation(null);
    }
  };

  const saveTeacherClassChange = () => {
    if (!editingTeacherClass) return;
    setStudents(students.map(s => 
      s.assignedTeacherId === editingTeacherClass.teacherId 
        ? { ...s, class: newClassName } 
        : s
    ));
    setEditingTeacherClass(null);
    setNewClassName('');
  };

  // Derived state: observations for the selected date
  const dailyObservations = useMemo(() => {
    return observations.filter(obs => isSameDay(parseISO(obs.date), selectedDate));
  }, [observations, selectedDate]);

  // Filter students based on current teacher (if not admin)
  const filteredStudents = useMemo(() => {
    if (isAdmin) return students;
    if (!currentTeacher) return [];
    return students.filter(s => s.assignedTeacherId === currentTeacher.id);
  }, [students, currentTeacher, isAdmin]);

  const getStudentStatus = (studentId: string) => {
    const obs = dailyObservations.find(o => o.studentId === studentId);
    if (!obs) return 'empty';
    if (obs.mood && obs.highlight && !Object.values(obs.dimensions).some(v => v === 0)) return 'complete';
    return 'partial';
  };

  const handleTeacherSelect = (teacher: Teacher) => {
    setCurrentTeacher(teacher);
    setScreen('home');
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    const existingObs = dailyObservations.find(o => o.studentId === student.id);
    if (existingObs) {
      setFormData(existingObs);
    } else {
      setFormData({
        studentId: student.id,
        date: selectedDate.toISOString(),
        mood: '',
        dimensions: { emotional: 0, social: 0, cognitive: 0, physical: 0, creative: 0 },
        tags: [],
        highlight: '',
      });
    }
    setScreen('form');
  };

  const saveObservation = () => {
    setObservations(prev => {
      const filtered = prev.filter(o => !(o.studentId === formData.studentId && isSameDay(parseISO(o.date), parseISO(formData.date))));
      return [...filtered, formData];
    });
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag) 
        : [...prev.tags, tag]
    }));
  };

  const setDimensionRating = (dimId: keyof ObservationData['dimensions'], rating: number) => {
    setFormData(prev => ({
      ...prev,
      dimensions: { ...prev.dimensions, [dimId]: rating }
    }));
  };

  const generatePeriodicReport = async (studentOverride?: Student) => {
    const student = studentOverride || selectedStudent;
    if (!student || !currentTeacher) return;
    setIsGenerating(true);
    setScreen('report');

    // Get last 14 days of data for this student
    const endDate = selectedDate;
    const startDate = subDays(endDate, 13);
    const periodData = observations.filter(obs => {
      const d = parseISO(obs.date);
      return obs.studentId === student.id && d >= startDate && d <= endDate;
    });

    const periodImages = periodData.filter(obs => obs.photo).map(obs => obs.photo as string);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const prompt = `
        Generate a warm, simple, and narrative periodic report (fortnightly) for a parent about their child ${student.name}.
        
        IMPORTANT: 
        - DO NOT include any numerical scales (e.g., "4/5" or "80%"). 
        - Use warm, simple language that is easy for parents to read.
        - Focus on storytelling and growth.
        - The teacher's name is ${currentTeacher.name}. Write as if the teacher is speaking directly to the parent.
        
        Student Details:
        - Name: ${student.name}
        - Class: ${student.class}
        - Teacher: ${currentTeacher.name}
        - Period: ${format(startDate, 'MMM d')} to ${format(endDate, 'MMM d, yyyy')}

        Observation Data for the last 14 days:
        ${periodData.map(d => `
          Date: ${format(parseISO(d.date), 'MMM d')}
          Mood: ${d.mood}
          Dimensions (for your context only, do not show numbers): Emotional: ${d.dimensions.emotional}, Social: ${d.dimensions.social}, Cognitive: ${d.dimensions.cognitive}, Physical: ${d.dimensions.physical}, Creative: ${d.dimensions.creative}
          Tags: ${d.tags.join(', ')}
          Daily Highlight/Special Note: ${d.highlight}
        `).join('\n')}
        
        Requirements for the report:
        1. Executive Summary: A warm opening from ${currentTeacher.name} summarizing the child's overall well-being.
        2. Our Journey Together (Dimension Analysis): Narrate the child's progress in the 5 dimensions (Emotional, Social, Cognitive, Physical, Creative). Use bullet points for specific observations within each dimension. Focus on what they enjoyed and how they grew. NO NUMBERS.
        3. Memorable Moments: A bulleted list summarizing the daily highlights and special moments.
        4. Looking Ahead: 3-4 simple, warm suggestions for parents to try at home to keep the momentum going, presented as a clear list.
        
        Tone: Warm, simple, encouraging, and personal.
        Length: Approximately 400-600 words.
        Format: Use clear headings and bullet points for readability. Avoid long, dense paragraphs.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const report: GeneratedReport = {
        id: Math.random().toString(36).substr(2, 9),
        studentId: student.id,
        teacherId: currentTeacher.id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        content: response.text || "Failed to generate report content.",
        recommendations: "We look forward to seeing more of these wonderful moments in the coming weeks!",
        status: 'draft',
        images: periodImages
      };

      setReports(prev => [...prev, report]);
      setCurrentReport(report);
    } catch (error) {
      console.error("AI Generation Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAllReports = async () => {
    setIsGenerating(true);
    const endDate = selectedDate;
    const startDate = subDays(endDate, 13);
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    for (const student of students) {
      const periodData = observations.filter(obs => {
        const d = parseISO(obs.date);
        return obs.studentId === student.id && d >= startDate && d <= endDate;
      });

      if (periodData.length === 0) continue;

      const teacher = teachers.find(t => t.id === student.assignedTeacherId) || teachers[0];

      try {
        const prompt = `
          Generate a comprehensive, detailed, and professional fortnightly progress report for a parent about their child ${student.name}.
          
          Student Details:
          - Name: ${student.name}
          - Class: ${student.class}
          - Teacher: ${teacher.name}
          
          Observation Data (Last 14 Days):
          ${periodData.map(d => `
            Date: ${format(parseISO(d.date), 'MMM d')}
            Mood: ${d.mood}
            Dimensions (1-5): Emotional: ${d.dimensions.emotional}, Social: ${d.dimensions.social}, Cognitive: ${d.dimensions.cognitive}, Physical: ${d.dimensions.physical}, Creative: ${d.dimensions.creative}
            Tags: ${d.tags.join(', ')}
            Special Note/Highlight: ${d.highlight}
          `).join('\n')}
          
          Report Structure Requirements:
          1. **Executive Summary**: A warm opening summarizing the child's overall well-being and engagement.
          2. **Dimension Analysis**: Detailed analysis for each of the 5 dimensions (Emotional, Social, Cognitive, Physical, Creative). Use bullet points to highlight specific progress and trends.
          3. **Daily Highlights Log**: A bulleted list of the "Special Notes" and key moments from the period.
          4. **AI Recommendations for Growth**: For each dimension, provide 1-2 specific, actionable recommendations for parents to implement at home, presented as a clear list.
          
          Tone: Professional yet warm, collaborative, and highly personalized.
          Length: Aim for a detailed report (approx 400-600 words).
          Format: Use clear headings and bullet points for readability. Avoid long, dense paragraphs.
        `;

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
        });

        const report: GeneratedReport = {
          id: Math.random().toString(36).substr(2, 9),
          studentId: student.id,
          teacherId: teacher.id,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          content: response.text || "Failed to generate report content.",
          recommendations: "Please review the 'Recommendations for Growth' section in the report above.",
          status: 'draft'
        };
        setReports(prev => [...prev, report]);
      } catch (e) {
        console.error(`Failed to generate report for ${student.name}`, e);
      }
    }
    setIsGenerating(false);
  };

  const downloadReportAsPDF = async () => {
    if (!reportRef.current || !selectedStudent) return;
    setIsExporting(true);
    
    try {
      const element = reportRef.current;
      
      // Use html2canvas to capture the element
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff',
        scrollY: 0,
        height: element.scrollHeight,
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('[data-report-container]') as HTMLElement;
          if (clonedElement) {
            clonedElement.style.height = 'auto';
            clonedElement.style.overflow = 'visible';
            clonedElement.style.borderRadius = '0';
            clonedElement.style.boxShadow = 'none';
          }
          
          // Aggressive fix for oklch/oklab errors
          const allElements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i] as HTMLElement;
            // Remove backdrop filters which often cause issues with oklch in Tailwind v4
            if (el.className && (el.className.includes('backdrop-blur') || el.className.includes('bg-white/'))) {
              el.style.backdropFilter = 'none';
              (el.style as any).webkitBackdropFilter = 'none';
              // Force a safe background color if it's a glass effect
              if (el.className.includes('bg-white/')) {
                el.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }
            }
          }

          // Remove buttons and other UI elements from the clone
          const buttons = clonedDoc.querySelectorAll('button');
          buttons.forEach(btn => btn.style.display = 'none');
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const fileName = `MindGarden_Report_${selectedStudent.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("PDF Export Error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Failed to generate PDF: ${errorMessage}\n\nThis is often due to unsupported CSS features in the browser's capture engine. Please try again or use a different browser.`);
    } finally {
      setIsExporting(false);
    }
  };

  const shareReport = async () => {
    if (!reportRef.current || !selectedStudent) return;
    setIsExporting(true);
    
    try {
      const element = reportRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff',
        scrollY: 0,
        height: element.scrollHeight,
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('[data-report-container]') as HTMLElement;
          if (clonedElement) {
            clonedElement.style.height = 'auto';
            clonedElement.style.overflow = 'visible';
            clonedElement.style.borderRadius = '0';
            clonedElement.style.boxShadow = 'none';
          }

          // Aggressive fix for oklch/oklab errors
          const allElements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i] as HTMLElement;
            if (el.className && (el.className.includes('backdrop-blur') || el.className.includes('bg-white/'))) {
              el.style.backdropFilter = 'none';
              (el.style as any).webkitBackdropFilter = 'none';
              if (el.className.includes('bg-white/')) {
                el.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }
            }
          }

          const buttons = clonedDoc.querySelectorAll('button');
          buttons.forEach(btn => btn.style.display = 'none');
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const pdfBlob = pdf.output('blob');
      const fileName = `MindGarden_Report_${selectedStudent.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`;
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${selectedStudent.name}'s Progress Report`,
          text: `Please find the progress report for ${selectedStudent.name}.`,
        });
      } else {
        // Fallback to WhatsApp link (text only)
        const message = `*Mind Garden: A Smart Start Preschool Progress Report*\n\n` +
          `*Student:* ${selectedStudent.name}\n` +
          `*Class:* ${selectedStudent.class}\n` +
          `Hello! I've generated the latest progress report for ${selectedStudent.name}. Please download the PDF from the portal.`;
        
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        alert("Direct PDF sharing is not supported in this browser. A WhatsApp message has been prepared, but you will need to download and attach the PDF manually.");
      }
    } catch (error) {
      console.error("Share Error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Failed to share report: ${errorMessage}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-[#2D2D2D] font-sans selection:bg-emerald-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <Tree size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-emerald-900 leading-none">Mind Garden</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 mt-1">A Smart Start Preschool</p>
          </div>
        </div>
        {currentTeacher || isAdmin ? (
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">{isAdmin ? 'Administrator' : currentTeacher?.designation}</p>
              <p className="text-sm font-semibold">{isAdmin ? 'Admin Panel' : currentTeacher?.name}</p>
            </div>
            <button 
              onClick={() => { setCurrentTeacher(null); setIsAdmin(false); setScreen('login'); setPassword(''); }}
              className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 hover:text-rose-500 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : null}
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {screen === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8 text-center"
            >
              <div className="space-y-4">
                <div className="w-24 h-24 bg-emerald-600 rounded-[2rem] flex items-center justify-center text-white mx-auto shadow-2xl shadow-emerald-200">
                  <Tree size={48} />
                </div>
                <div className="space-y-1">
                  <h2 className="text-4xl font-serif italic text-stone-800">Mind Garden</h2>
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-600">A Smart Start Preschool</p>
                </div>
                <p className="text-stone-500 max-w-xs mx-auto">Welcome to our personalised AI reporting portal. Please select your login type to continue.</p>
              </div>

              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => setLoginMode('teacher')}
                  className={cn("px-6 py-2 rounded-full font-bold transition-all", loginMode === 'teacher' ? "bg-emerald-600 text-white" : "bg-stone-100 text-stone-400")}
                >
                  Teacher Login
                </button>
                <button 
                  onClick={() => setLoginMode('admin')}
                  className={cn("px-6 py-2 rounded-full font-bold transition-all", loginMode === 'admin' ? "bg-emerald-600 text-white" : "bg-stone-100 text-stone-400")}
                >
                  Admin Login
                </button>
              </div>

              {loginMode === 'teacher' ? (
                <div className="grid gap-4">
                  {teachers.map((teacher) => (
                    <button
                      key={teacher.id}
                      onClick={() => handleTeacherSelect(teacher)}
                      className="bg-white border border-stone-200 rounded-2xl p-6 flex items-center justify-between hover:border-emerald-300 hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
                          {teacher.name.charAt(0)}
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-lg group-hover:text-emerald-700">{teacher.name}</h3>
                          <p className="text-xs text-stone-400 uppercase tracking-widest">{teacher.designation} • {teacher.department}</p>
                        </div>
                      </div>
                      <ChevronRight className="text-stone-200 group-hover:text-emerald-500" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="max-w-sm mx-auto space-y-4">
                  <input 
                    type="password"
                    placeholder="Enter Admin Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-2xl p-4 text-center outline-none focus:border-emerald-500 transition-all"
                  />
                  <button 
                    onClick={() => {
                      if (password === ADMIN_PASSWORD) {
                        setIsAdmin(true);
                        setScreen('admin');
                      } else {
                        alert("Incorrect Password!");
                      }
                    }}
                    className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all"
                  >
                    Enter Admin Panel
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {screen === 'admin' && isAdmin && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-3xl font-serif italic text-stone-800">Admin Panel</h2>
                <div className="flex bg-stone-100 p-1 rounded-xl">
                  <button 
                    onClick={() => setAdminTab('dashboard')}
                    className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", adminTab === 'dashboard' ? "bg-white text-emerald-600 shadow-sm" : "text-stone-500 hover:text-stone-700")}
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={() => setAdminTab('teachers')}
                    className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", adminTab === 'teachers' ? "bg-white text-emerald-600 shadow-sm" : "text-stone-500 hover:text-stone-700")}
                  >
                    Teachers
                  </button>
                  <button 
                    onClick={() => setAdminTab('students')}
                    className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", adminTab === 'students' ? "bg-white text-emerald-600 shadow-sm" : "text-stone-500 hover:text-stone-700")}
                  >
                    Students
                  </button>
                </div>
              </div>

              {adminTab === 'dashboard' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-stone-700">School Overview</h3>
                    <button 
                      onClick={generateAllReports}
                      disabled={isGenerating}
                      className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20 disabled:opacity-50"
                    >
                      {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                      Generate All Reports
                    </button>
                  </div>

                  <div className="bg-white border border-stone-200 rounded-[2rem] overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-stone-50 border-b border-stone-200">
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-stone-400">Lead Teacher</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-stone-400">Class</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-stone-400">Total Students</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teachers.map(teacher => {
                          const teacherStudents = students.filter(s => s.assignedTeacherId === teacher.id);
                          const classes = Array.from(new Set(teacherStudents.map(s => s.class).filter(Boolean)));
                          return (
                            <tr key={teacher.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-xs">
                                    {teacher.name.charAt(0)}
                                  </div>
                                  <span className="font-semibold text-stone-700">{teacher.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-between group">
                                  <div className="flex flex-wrap gap-1">
                                    {classes.length > 0 ? classes.map(c => (
                                      <span key={c} className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded text-[10px] font-bold">{c}</span>
                                    )) : <span className="text-stone-300 italic text-xs">No classes</span>}
                                  </div>
                                  <button 
                                    onClick={() => {
                                      setEditingTeacherClass({ teacherId: teacher.id, currentClasses: classes });
                                      setNewClassName(classes[0] || '');
                                    }}
                                    className="p-1.5 text-stone-300 hover:text-emerald-600 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Change Class"
                                  >
                                    <Edit3 size={14} />
                                  </button>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-mono font-bold text-emerald-600">{teacherStudents.length}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {adminTab === 'teachers' && (
                <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-stone-700">Manage Teachers</h3>
                </div>
                
                <div className="bg-white border border-stone-200 rounded-3xl p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      placeholder="Teacher Name"
                      value={newTeacher.name}
                      onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                      className="bg-stone-50 border border-stone-100 rounded-xl px-4 py-2 outline-none focus:border-emerald-500"
                    />
                    <input 
                      placeholder="Employee Code"
                      value={newTeacher.code}
                      onChange={(e) => setNewTeacher({ ...newTeacher, code: e.target.value })}
                      className="bg-stone-50 border border-stone-100 rounded-xl px-4 py-2 outline-none focus:border-emerald-500"
                    />
                    <input 
                      placeholder="Department"
                      value={newTeacher.department}
                      onChange={(e) => setNewTeacher({ ...newTeacher, department: e.target.value })}
                      className="bg-stone-50 border border-stone-100 rounded-xl px-4 py-2 outline-none focus:border-emerald-500"
                    />
                    <input 
                      placeholder="Designation"
                      value={newTeacher.designation}
                      onChange={(e) => setNewTeacher({ ...newTeacher, designation: e.target.value })}
                      className="bg-stone-50 border border-stone-100 rounded-xl px-4 py-2 outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button 
                    onClick={() => {
                      if (newTeacher.name && newTeacher.code) {
                        setTeachers([...teachers, { ...newTeacher, id: Math.random().toString(36).substr(2, 9) }]);
                        setNewTeacher({ name: '', code: '', department: '', designation: '' });
                      }
                    }}
                    className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    Add Teacher
                  </button>
                </div>

                <div className="grid gap-4">
                  {teachers.map((teacher) => (
                    <div key={teacher.id} className="bg-white border border-stone-200 rounded-2xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
                          {teacher.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold">{teacher.name}</h4>
                          <p className="text-xs text-stone-400">{teacher.designation} • {teacher.code}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => initiateDelete(teacher.id, 'teacher')}
                        className="p-2 text-stone-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {adminTab === 'students' && (
                <section className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="text-xl font-bold text-stone-700">Manage Students</h3>
                    <div className="flex gap-2">
                      <button 
                        onClick={downloadSampleExcel}
                        className="bg-stone-100 text-stone-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-stone-200 transition-all flex items-center gap-2"
                      >
                        <FileText size={16} />
                        Download Template
                      </button>
                      <label className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-bold text-sm cursor-pointer hover:bg-emerald-100 transition-all flex items-center gap-2">
                        <Upload size={16} />
                        Bulk Upload
                        <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileUpload} />
                      </label>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-widest">
                      <AlertTriangle size={14} />
                      Required Excel Format
                    </div>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      Please ensure your Excel file has these exact column headers:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['Student ID', 'Student Name', 'Roll Number', 'Guardian Name', 'Class', 'Teacher Name'].map(label => (
                        <span key={label} className="bg-white px-2 py-1 rounded-md text-[10px] font-bold border border-amber-200 text-amber-600">
                          {label}
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] text-amber-600/70 mt-2 italic">
                      * Tip: Use the exact Teacher Name as shown in the "Manage Teachers" section above.
                    </p>
                  </div>

                  {/* Manual Add Student */}
                  <div className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm">
                    <h4 className="font-bold text-stone-700 mb-4 flex items-center gap-2">
                      <Plus size={18} className="text-emerald-500" />
                      Add Student Manually
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Student ID</label>
                        <input 
                          type="text" 
                          placeholder="e.g. MG-2026-001"
                          value={newStudent.studentId}
                          onChange={(e) => setNewStudent({ ...newStudent, studentId: e.target.value })}
                          className="w-full bg-stone-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Student Name</label>
                        <input 
                          type="text" 
                          placeholder="Full Name"
                          value={newStudent.name}
                          onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                          className="w-full bg-stone-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Roll Number</label>
                        <input 
                          type="text" 
                          placeholder="Roll No."
                          value={newStudent.rollNumber}
                          onChange={(e) => setNewStudent({ ...newStudent, rollNumber: e.target.value })}
                          className="w-full bg-stone-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Guardian Name</label>
                        <input 
                          type="text" 
                          placeholder="Guardian Name"
                          value={newStudent.guardianName}
                          onChange={(e) => setNewStudent({ ...newStudent, guardianName: e.target.value })}
                          className="w-full bg-stone-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Class</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Pre-Primary A"
                          value={newStudent.class}
                          onChange={(e) => setNewStudent({ ...newStudent, class: e.target.value })}
                          className="w-full bg-stone-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Assign Teacher</label>
                        <select 
                          value={newStudent.assignedTeacherId}
                          onChange={(e) => setNewStudent({ ...newStudent, assignedTeacherId: e.target.value })}
                          className="w-full bg-stone-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        >
                          <option value="">Unassigned</option>
                          {teachers.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <button 
                      onClick={addStudentManually}
                      disabled={!newStudent.name || !newStudent.studentId}
                      className="mt-6 w-full bg-emerald-500 text-white font-bold py-3 rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Plus size={18} />
                      Add Student
                    </button>
                  </div>

                  <div className="grid gap-4">
                    {students.map((student) => {
                      const studentReports = reports.filter(r => r.studentId === student.id);
                      return (
                        <div key={student.id} className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <img src={student.avatar} className="w-12 h-12 rounded-full border-2 border-stone-100" referrerPolicy="no-referrer" />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-stone-800">{student.name}</h4>
                                <span className="bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-tighter">{student.studentId}</span>
                              </div>
                              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">Roll: {student.rollNumber || 'N/A'}</span>
                                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">Class: {student.class || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                              {studentReports.slice(0, 3).map((r, i) => (
                                <button 
                                  key={r.id} 
                                  onClick={() => { setCurrentReport(r); setScreen('report'); }}
                                  className="w-8 h-8 rounded-full bg-emerald-50 border-2 border-white flex items-center justify-center text-emerald-600 shadow-sm hover:bg-emerald-100 transition-all" 
                                  title={`Report from ${format(parseISO(r.startDate), 'MMM d')}`}
                                >
                                  <FileText size={12} />
                                </button>
                              ))}
                              {studentReports.length > 3 && (
                                <button 
                                  onClick={() => setViewingReportsForStudent(student)}
                                  className="w-8 h-8 rounded-full bg-stone-100 border-2 border-white flex items-center justify-center text-stone-500 text-[10px] font-bold hover:bg-stone-200 transition-all"
                                >
                                  +{studentReports.length - 3}
                                </button>
                              )}
                            </div>
                            
                            <button 
                              onClick={() => setViewingReportsForStudent(student)}
                              className="bg-stone-100 text-stone-600 px-4 py-2 rounded-xl font-bold text-xs hover:bg-stone-200 transition-all flex items-center gap-2"
                            >
                              <FileText size={14} />
                              Past Reports
                            </button>
                            
                            <button 
                              onClick={() => initiateDelete(student.id, 'student')}
                              className="p-2 text-stone-300 hover:text-rose-500 transition-colors"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </motion.div>
          )}

          {screen === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-serif italic text-stone-800 mb-2">Daily Command Centre</h2>
                  <p className="text-stone-500">Managing logs for {format(selectedDate, 'MMMM do, yyyy')}</p>
                </div>
                <div className="relative">
                  <input 
                    type="date" 
                    value={format(selectedDate, 'yyyy-MM-dd')}
                    onChange={(e) => setSelectedDate(startOfDay(new Date(e.target.value)))}
                    className="bg-white border border-stone-200 rounded-xl px-4 py-2 text-sm font-medium outline-none focus:border-emerald-500 transition-all"
                  />
                  <CalendarIcon size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                </div>
              </section>

              <div className="grid gap-4">
                {filteredStudents.map((student) => {
                  const status = getStudentStatus(student.id);
                  return (
                    <button
                      key={student.id}
                      onClick={() => handleStudentSelect(student)}
                      className="w-full bg-white border border-stone-200 rounded-2xl p-4 flex items-center gap-4 hover:border-emerald-300 hover:shadow-lg transition-all group text-left"
                    >
                      <div className="relative">
                        <img 
                          src={student.avatar} 
                          alt={student.name} 
                          className="w-14 h-14 rounded-full object-cover border-2 border-stone-100"
                          referrerPolicy="no-referrer"
                        />
                        {status === 'complete' && (
                          <div className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-white">
                            <CheckCircle2 size={12} />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg group-hover:text-emerald-700">{student.name}</h3>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex gap-1 h-1.5 w-24 bg-stone-100 rounded-full overflow-hidden">
                            <div className={cn("h-full", status === 'complete' ? "bg-emerald-500 w-full" : status === 'partial' ? "bg-amber-400 w-1/2" : "w-0")} />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{status}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isAdmin && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedStudent(student); generatePeriodicReport(); }}
                            className="p-2 rounded-lg text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                            title="Generate Periodic Report"
                          >
                            <FileText size={20} />
                          </button>
                        )}
                        <ChevronRight className="text-stone-300 group-hover:text-emerald-500" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {screen === 'form' && selectedStudent && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 pb-24"
            >
              <button 
                onClick={() => setScreen('home')}
                className="flex items-center gap-2 text-stone-500 hover:text-emerald-600 transition-colors"
              >
                <ArrowLeft size={18} />
                <span className="text-sm font-medium">Back to Dashboard</span>
              </button>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img 
                    src={selectedStudent.avatar} 
                    alt={selectedStudent.name} 
                    className="w-16 h-16 rounded-full border-2 border-emerald-100"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h2 className="text-2xl font-serif italic text-stone-800">{selectedStudent.name}</h2>
                    <p className="text-stone-500 text-sm">{format(selectedDate, 'MMM do, yyyy')}</p>
                  </div>
                </div>
              </div>

              {/* Mood Selector */}
              <section className="bg-white border border-stone-200 rounded-3xl p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400">Current Mood</h3>
                <div className="flex justify-between gap-2">
                  {MOODS.map((mood) => (
                    <button
                      key={mood.id}
                      onClick={() => setFormData({ ...formData, mood: mood.id })}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all flex-1",
                        formData.mood === mood.id 
                          ? "bg-emerald-50 border-2 border-emerald-500 shadow-sm" 
                          : "bg-stone-50 border-2 border-transparent hover:bg-stone-100"
                      )}
                    >
                      <span className="text-2xl">{mood.emoji}</span>
                      <span className="text-[10px] font-bold uppercase tracking-tighter">{mood.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Dimensions */}
              <section className="bg-white border border-stone-200 rounded-3xl p-6 space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400">Core Dimensions</h3>
                <div className="space-y-6">
                  {DIMENSIONS.map((dim) => (
                    <div key={dim.id} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-stone-700">{dim.label}</span>
                        <span className="text-xs font-mono text-stone-400">{formData.dimensions[dim.id as keyof ObservationData['dimensions']] || 0}/5</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => setDimensionRating(dim.id as keyof ObservationData['dimensions'], rating)}
                            className={cn(
                              "w-10 h-10 rounded-full transition-all flex items-center justify-center border-2",
                              formData.dimensions[dim.id as keyof ObservationData['dimensions']] >= rating
                                ? `${dim.color} border-transparent text-white shadow-md scale-110`
                                : "bg-stone-50 border-stone-100 text-stone-300 hover:border-stone-200"
                            )}
                          >
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              formData.dimensions[dim.id as keyof ObservationData['dimensions']] >= rating ? "bg-white" : "bg-stone-200"
                            )} />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Quick Tags */}
              <section className="bg-white border border-stone-200 rounded-3xl p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400">Quick Observation Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {QUICK_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                        formData.tags.includes(tag)
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-md"
                          : "bg-white border-stone-200 text-stone-600 hover:border-emerald-300"
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </section>

              <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-lg border-t border-stone-200 flex justify-center">
                <button
                  onClick={() => setScreen('submit')}
                  disabled={!formData.mood || Object.values(formData.dimensions).some(v => v === 0)}
                  className="w-full max-w-md bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-emerald-900/20 hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  Continue to Highlights
                  <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {screen === 'submit' && selectedStudent && (
            <motion.div
              key="submit"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 pb-24"
            >
              <button 
                onClick={() => setScreen('form')}
                className="flex items-center gap-2 text-stone-500 hover:text-emerald-600 transition-colors"
              >
                <ArrowLeft size={18} />
                <span className="text-sm font-medium">Back to Dimensions</span>
              </button>

              <div className="flex items-center gap-4">
                <img 
                  src={selectedStudent.avatar} 
                  alt={selectedStudent.name} 
                  className="w-16 h-16 rounded-full border-2 border-emerald-100"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h2 className="text-2xl font-serif italic text-stone-800">Highlights & Media</h2>
                  <p className="text-stone-500 text-sm">{format(selectedDate, 'MMM do, yyyy')}</p>
                </div>
              </div>

              <section className="bg-white border border-stone-200 rounded-3xl p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400">What stood out today?</h3>
                <textarea
                  value={formData.highlight}
                  onChange={(e) => setFormData({ ...formData, highlight: e.target.value })}
                  placeholder="E.g., Aarav was very helpful today during clean-up time..."
                  className="w-full h-40 bg-stone-50 border-2 border-stone-100 rounded-2xl p-4 text-stone-800 placeholder:text-stone-300 focus:border-emerald-500 focus:bg-white transition-all outline-none resize-none"
                />
              </section>

              <section className="bg-white border border-stone-200 rounded-3xl p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400">Daily Photo</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => document.getElementById('photo-upload')?.click()}
                    className="aspect-square bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-stone-400 hover:border-emerald-300 hover:text-emerald-500 transition-all overflow-hidden relative"
                  >
                    {formData.photo ? (
                      <img src={formData.photo} className="w-full h-full object-cover" alt="Selected" />
                    ) : (
                      <>
                        <Camera size={32} />
                        <span className="text-xs font-bold uppercase">Take Photo</span>
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => document.getElementById('photo-upload')?.click()}
                    className="aspect-square bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-stone-400 hover:border-emerald-300 hover:text-emerald-500 transition-all"
                  >
                    <ImageIcon size={32} />
                    <span className="text-xs font-bold uppercase">From Gallery</span>
                  </button>
                  <input 
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData({ ...formData, photo: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
              </section>

              <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-lg border-t border-stone-200 flex justify-center">
                <button
                  onClick={() => { saveObservation(); setScreen('home'); }}
                  className="w-full max-w-md bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-emerald-900/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  Save Observation
                  <Save size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {screen === 'report' && selectedStudent && (
            <motion.div
              key="report"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-8 pb-24"
            >
              <div className="text-center space-y-4 py-8">
                {isGenerating ? (
                  <>
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                      <Loader2 className="text-emerald-600 animate-spin" size={40} />
                    </div>
                    <h2 className="text-2xl font-serif italic text-stone-800">Analyzing Observations...</h2>
                    <p className="text-stone-500">Synthesizing the last 14 days for {selectedStudent.name}.</p>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-900/20">
                      <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-2xl font-serif italic text-stone-800">Periodic Report Ready!</h2>
                    <p className="text-stone-500">Review and add your recommendations before finalizing.</p>
                  </>
                )}
              </div>

              {!isGenerating && currentReport && (
                <div ref={reportRef} data-report-container className="bg-white border border-stone-200 rounded-[2rem] overflow-hidden shadow-2xl shadow-stone-200/50">
                  {/* Report Header */}
                  <div className="bg-emerald-900 p-10 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/10 rounded-full -ml-24 -mb-24 blur-2xl" />
                    
                    <div className="relative flex flex-col md:flex-row justify-between items-center gap-8">
                      <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="relative">
                          <img 
                            src={selectedStudent.avatar} 
                            alt={selectedStudent.name} 
                            className="w-32 h-32 rounded-3xl border-4 border-white/20 shadow-2xl object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg">
                            {selectedStudent.class}
                          </div>
                        </div>
                        <div className="text-center md:text-left">
                          <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                            <Tree size={16} className="text-emerald-300" />
                            <p className="text-emerald-300 text-[10px] font-bold uppercase tracking-[0.3em]">Mind Garden: A Smart Start Preschool</p>
                          </div>
                          <h3 className="text-4xl font-serif italic mb-2">{selectedStudent.name}</h3>
                          <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                            <span className="flex items-center gap-1.5 bg-white/10 px-4 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm">
                              <User size={14} className="text-emerald-300" />
                              ID: {selectedStudent.studentId}
                            </span>
                            <span className="flex items-center gap-1.5 bg-white/10 px-4 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm">
                              <Calendar size={14} className="text-emerald-300" />
                              {format(parseISO(currentReport.startDate), 'MMM d')} - {format(parseISO(currentReport.endDate), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center md:items-end gap-2">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white font-bold text-xl backdrop-blur-md border border-white/10">
                          {currentTeacher?.name.charAt(0)}
                        </div>
                        <div className="text-center md:text-right">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">Lead Teacher</p>
                          <p className="font-medium">{currentTeacher?.name}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8 space-y-12">
                    {/* Photos Section */}
                    {currentReport.images && currentReport.images.length > 0 && (
                      <section className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <ImageIcon size={20} />
                          </div>
                          <h4 className="text-lg font-serif italic text-stone-800">Memorable Moments in Photos</h4>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {currentReport.images.map((img, idx) => (
                            <div key={idx} className="aspect-square rounded-3xl overflow-hidden border-4 border-white shadow-lg shadow-stone-200">
                              <img src={img} className="w-full h-full object-cover" alt={`Moment ${idx + 1}`} referrerPolicy="no-referrer" />
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* AI Content Section */}
                    <section className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <Sparkles size={20} />
                          </div>
                          <h4 className="text-lg font-serif italic text-stone-800">Detailed Narrative & Observations</h4>
                        </div>
                        <button 
                          onClick={() => setIsEditingReport(!isEditingReport)}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all",
                            isEditingReport ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20" : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                          )}
                        >
                          {isEditingReport ? <Save size={14} /> : <Edit3 size={14} />}
                          {isEditingReport ? 'Save Changes' : 'Edit Report'}
                        </button>
                      </div>
                      
                      {isEditingReport ? (
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-2">Main Report Content</label>
                            <textarea 
                              value={currentReport.content}
                              onChange={(e) => setCurrentReport({ ...currentReport, content: e.target.value })}
                              className="w-full h-[600px] p-8 bg-stone-50 border-2 border-stone-100 rounded-[2rem] text-stone-600 leading-relaxed outline-none focus:border-emerald-500 transition-all font-sans text-lg shadow-inner"
                              placeholder="Write the detailed report content here..."
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-2">Final Teacher Recommendations</label>
                            <textarea 
                              value={currentReport.recommendations}
                              onChange={(e) => setCurrentReport({ ...currentReport, recommendations: e.target.value })}
                              className="w-full h-40 p-6 bg-emerald-50/30 border-2 border-emerald-100 rounded-[2rem] text-stone-600 leading-relaxed outline-none focus:border-emerald-500 transition-all font-sans shadow-inner"
                              placeholder="Add your personalized recommendations for parents..."
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-10">
                          <div className="markdown-body">
                            <ReactMarkdown>{currentReport.content}</ReactMarkdown>
                          </div>
                          
                          <div className="bg-gradient-to-br from-emerald-50 to-stone-50 p-10 rounded-[2.5rem] border border-emerald-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/20 rounded-full -mr-16 -mt-16 blur-2xl" />
                            <h3 className="text-xl font-serif italic text-emerald-900 mb-6 flex items-center gap-3">
                              <Heart size={24} className="text-emerald-500" />
                              Teacher's Closing Recommendations
                            </h3>
                            <div className="markdown-body italic font-medium text-emerald-800">
                              <ReactMarkdown>{currentReport.recommendations}</ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      )}
                    </section>

                    {/* Footer / Sign-off */}
                    <div className="pt-10 border-t border-stone-100 flex flex-col md:flex-row justify-between items-center gap-8">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-900 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-900/20">
                          {currentTeacher?.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-stone-800 font-bold text-lg">{currentTeacher?.name}</p>
                          <p className="text-stone-400 text-sm">Lead Educator, {selectedStudent.class}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 w-full md:w-auto">
                        <button
                          onClick={downloadReportAsPDF}
                          disabled={isExporting}
                          className="flex-1 md:flex-none bg-stone-100 text-stone-600 px-6 py-4 rounded-2xl font-bold hover:bg-stone-200 transition-all flex items-center justify-center gap-2"
                        >
                          {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                          PDF
                        </button>
                        <button
                          onClick={shareReport}
                          disabled={isExporting}
                          className="flex-1 md:flex-none bg-emerald-50 text-emerald-600 px-6 py-4 rounded-2xl font-bold hover:bg-emerald-100 transition-all flex items-center justify-center gap-2"
                        >
                          {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
                          WhatsApp
                        </button>
                        <button
                          onClick={() => {
                            setReports(prev => prev.map(r => r.id === currentReport.id ? { ...currentReport, status: 'final' } : r));
                            setScreen('admin');
                          }}
                          className="flex-1 md:flex-none bg-emerald-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-emerald-900/20 hover:bg-emerald-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          <Send size={20} />
                          Finalize
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Past Reports Modal */}
      <AnimatePresence>
        {viewingReportsForStudent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingReportsForStudent(null)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                <div>
                  <h3 className="text-2xl font-serif italic text-stone-800">Past Reports</h3>
                  <p className="text-stone-500 text-sm">Viewing all generated reports for {viewingReportsForStudent.name}</p>
                </div>
                <button 
                  onClick={() => setViewingReportsForStudent(null)}
                  className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-400 hover:text-rose-500 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-4">
                {reports.filter(r => r.studentId === viewingReportsForStudent.id).length > 0 ? (
                  reports.filter(r => r.studentId === viewingReportsForStudent.id).map(report => (
                    <div key={report.id} className="bg-stone-50 border border-stone-100 rounded-2xl p-6 flex items-center justify-between hover:border-emerald-200 transition-all group">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-1">
                          {format(parseISO(report.startDate), 'MMM d')} - {format(parseISO(report.endDate), 'MMM d, yyyy')}
                        </p>
                        <h4 className="font-bold text-stone-800 group-hover:text-emerald-700 transition-colors">Periodic Progress Report</h4>
                        <p className="text-xs text-stone-400 mt-1">Status: <span className="text-emerald-600 font-bold uppercase">{report.status}</span></p>
                      </div>
                      <button 
                        onClick={() => {
                          setCurrentReport(report);
                          setSelectedStudent(viewingReportsForStudent);
                          setScreen('report');
                          setViewingReportsForStudent(null);
                        }}
                        className="bg-white text-stone-600 px-4 py-2 rounded-xl border border-stone-200 font-bold text-xs hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all flex items-center gap-2"
                      >
                        <FileText size={14} />
                        View Full Report
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-300">
                      <FileText size={32} />
                    </div>
                    <p className="text-stone-400 font-medium italic">No reports generated yet for this student.</p>
                    <button 
                      onClick={() => {
                        setSelectedStudent(viewingReportsForStudent);
                        generatePeriodicReport(viewingReportsForStudent);
                        setViewingReportsForStudent(null);
                      }}
                      className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all flex items-center gap-2 mx-auto"
                    >
                      <Sparkles size={16} />
                      Generate First Report
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmation && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmation(null)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[2rem] p-8 shadow-2xl space-y-6 text-center"
            >
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center mx-auto",
                deleteConfirmation.step === 1 ? "bg-amber-100 text-amber-600" : "bg-rose-100 text-rose-600"
              )}>
                <AlertTriangle size={32} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-serif italic text-stone-800">
                  {deleteConfirmation.step === 1 ? "Are you sure?" : "Final Confirmation"}
                </h3>
                <p className="text-stone-500">
                  {deleteConfirmation.step === 1 
                    ? `You are about to delete this ${deleteConfirmation.type}. This action cannot be undone.`
                    : `This is your LAST warning. Deleting this ${deleteConfirmation.type} will remove all associated data.`}
                </p>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setDeleteConfirmation(null)}
                  className="flex-1 py-4 rounded-2xl font-bold text-stone-400 hover:bg-stone-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className={cn(
                    "flex-1 py-4 rounded-2xl font-bold text-white shadow-lg transition-all",
                    deleteConfirmation.step === 1 ? "bg-amber-500 hover:bg-amber-600 shadow-amber-900/20" : "bg-rose-500 hover:bg-rose-600 shadow-rose-900/20"
                  )}
                >
                  {deleteConfirmation.step === 1 ? "Yes, I'm sure" : "Delete Forever"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Change Teacher Class Modal */}
      <AnimatePresence>
        {editingTeacherClass && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingTeacherClass(null)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-serif italic text-stone-800">Change Class</h3>
                <button 
                  onClick={() => setEditingTeacherClass(null)}
                  className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 hover:text-stone-600 transition-all"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">
                    Teacher
                  </label>
                  <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
                      {teachers.find(t => t.id === editingTeacherClass.teacherId)?.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-stone-800">
                        {teachers.find(t => t.id === editingTeacherClass.teacherId)?.name}
                      </p>
                      <p className="text-xs text-stone-400">
                        Current: {editingTeacherClass.currentClasses.join(', ') || 'No class'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 block">
                    New Class Name
                  </label>
                  <input 
                    type="text"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="e.g. Pre-Primary A"
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                    autoFocus
                  />
                  <p className="text-[10px] text-stone-400 mt-2 italic">
                    * This will update the class for all students assigned to this teacher.
                  </p>
                </div>

                <div className="flex gap-4 pt-2">
                  <button 
                    onClick={() => setEditingTeacherClass(null)}
                    className="flex-1 px-6 py-3 rounded-xl border border-stone-200 font-bold text-stone-600 hover:bg-stone-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={saveTeacherClassChange}
                    className="flex-1 px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Navigation Rail (Desktop) */}
      <nav className="fixed left-0 top-0 bottom-0 w-20 bg-white border-r border-stone-200 hidden lg:flex flex-col items-center py-8 gap-8">
        <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-900/20">
          <Sparkles size={24} />
        </div>
        <div className="flex flex-col gap-6 mt-8">
          <button 
            onClick={() => setScreen('home')}
            className={cn("p-3 rounded-xl transition-all", screen === 'home' ? "bg-emerald-50 text-emerald-600" : "text-stone-400 hover:bg-stone-50")}
          >
            <LayoutDashboard size={24} />
          </button>
          {isAdmin && (
            <button 
              onClick={() => setScreen('admin')}
              className={cn("p-3 rounded-xl transition-all", screen === 'admin' ? "bg-emerald-50 text-emerald-600" : "text-stone-400 hover:bg-stone-50")}
            >
              <User size={24} />
            </button>
          )}
          <button className="p-3 rounded-xl text-stone-400 hover:bg-stone-50 transition-all">
            <FileText size={24} />
          </button>
        </div>
      </nav>
    </div>
  );
}
