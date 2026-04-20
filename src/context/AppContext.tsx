import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode } from 'react';
import { startOfDay, subDays, isSameDay, parseISO, format } from 'date-fns';
import { GoogleGenAI } from "@google/genai";
import * as XLSX from 'xlsx';
import { Student, ObservationData, Teacher, TEACHERS, GeneratedReport, Section } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const INITIAL_STUDENTS: Student[] = [
  { id: '1', studentId: 'MG-2026-001', name: 'Aarav Sharma', avatar: 'https://picsum.photos/seed/aarav/100', rollNumber: '101', guardianName: 'Rajesh Sharma', class: 'Pre-Primary A', assignedTeacherId: '1' },
  { id: '2', studentId: 'MG-2026-002', name: 'Zoya Khan', avatar: 'https://picsum.photos/seed/zoya/100', rollNumber: '102', guardianName: 'Imran Khan', class: 'Pre-Primary A', assignedTeacherId: '1' },
  { id: '3', studentId: 'MG-2026-003', name: 'Vihaan Gupta', avatar: 'https://picsum.photos/seed/vihaan/100', rollNumber: '103', guardianName: 'Sanjay Gupta', class: 'Pre-Primary B', assignedTeacherId: '2' },
  { id: '4', studentId: 'MG-2026-004', name: 'Ananya Iyer', avatar: 'https://picsum.photos/seed/ananya/100', rollNumber: '104', guardianName: 'Lakshmi Iyer', class: 'Pre-Primary B', assignedTeacherId: '2' },
  { id: '5', studentId: 'MG-2026-005', name: 'Ishaan Verma', avatar: 'https://picsum.photos/seed/ishaan/100', rollNumber: '105', guardianName: 'Anita Verma', class: 'Pre-Primary C', assignedTeacherId: '3' },
];

const INITIAL_OBSERVATIONS: ObservationData[] = [];
const INITIAL_REPORTS: GeneratedReport[] = [];

export const ADMIN_PASSWORD = "admin";

interface AppContextType {
  sections: Section[];
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  selectedAdminSection: Section | null;
  setSelectedAdminSection: React.Dispatch<React.SetStateAction<Section | null>>;
  teachers: Teacher[];
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  currentTeacher: Teacher | null;
  setCurrentTeacher: React.Dispatch<React.SetStateAction<Teacher | null>>;
  isAdmin: boolean;
  setIsAdmin: React.Dispatch<React.SetStateAction<boolean>>;
  loginMode: 'teacher' | 'admin';
  setLoginMode: React.Dispatch<React.SetStateAction<'teacher' | 'admin'>>;
  selectedDate: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  observations: ObservationData[];
  setObservations: React.Dispatch<React.SetStateAction<ObservationData[]>>;
  selectedStudent: Student | null;
  setSelectedStudent: React.Dispatch<React.SetStateAction<Student | null>>;
  formData: ObservationData;
  setFormData: React.Dispatch<React.SetStateAction<ObservationData>>;
  isGenerating: boolean;
  reports: GeneratedReport[];
  setReports: React.Dispatch<React.SetStateAction<GeneratedReport[]>>;
  currentReport: GeneratedReport | null;
  setCurrentReport: React.Dispatch<React.SetStateAction<GeneratedReport | null>>;
  isEditingReport: boolean;
  setIsEditingReport: React.Dispatch<React.SetStateAction<boolean>>;
  viewingReportsForStudent: Student | null;
  setViewingReportsForStudent: React.Dispatch<React.SetStateAction<Student | null>>;
  
  // Admin state
  isLoadingData: boolean;
  adminTab: 'dashboard' | 'teachers' | 'students';
  setAdminTab: React.Dispatch<React.SetStateAction<'dashboard' | 'teachers' | 'students'>>;
  newTeacher: { name: string; code: string; department: string; designation: string };
  setNewTeacher: React.Dispatch<React.SetStateAction<{ name: string; code: string; department: string; designation: string }>>;
  newStudent: { studentId: string; name: string; rollNumber: string; guardianName: string; class: string; assignedTeacherId: string };
  setNewStudent: React.Dispatch<React.SetStateAction<{ studentId: string; name: string; rollNumber: string; guardianName: string; class: string; assignedTeacherId: string }>>;
  deleteConfirmation: { id: string; type: 'teacher' | 'student'; step: 1 | 2 } | null;
  setDeleteConfirmation: React.Dispatch<React.SetStateAction<{ id: string; type: 'teacher' | 'student'; step: 1 | 2 } | null>>;
  editingTeacherClass: { teacherId: string; currentClasses: string[] } | null;
  setEditingTeacherClass: React.Dispatch<React.SetStateAction<{ teacherId: string; currentClasses: string[] } | null>>;
  newClassName: string;
  setNewClassName: React.Dispatch<React.SetStateAction<string>>;

  // Handlers
  downloadSampleExcel: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAutoAssignUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  addStudentManually: () => void;
  initiateDelete: (id: string, type: 'teacher' | 'student') => void;
  confirmDelete: () => void;
  saveTeacherClassChange: () => void;
  
  dailyObservations: ObservationData[];
  filteredStudents: Student[];
  getStudentStatus: (studentId: string) => 'empty' | 'complete' | 'partial';
  handleTeacherSelect: (teacher: Teacher) => void;
  handleStudentSelect: (student: Student) => void;
  saveObservation: () => void;
  toggleTag: (tag: string) => void;
  setDimensionRating: (dimId: keyof ObservationData['dimensions'], rating: number) => void;
  generatePeriodicReport: (studentOverride?: Student) => Promise<void>;
  generateAllReports: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedAdminSection, setSelectedAdminSection] = useState<Section | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const fetchAllData = async () => {
    setIsLoadingData(true);
    try {
      const [sectRes, teachRes, studRes, obsRes, repRes] = await Promise.all([
        fetch(`${API_URL}/api/sections`),
        fetch(`${API_URL}/api/teachers`),
        fetch(`${API_URL}/api/students`),
        fetch(`${API_URL}/api/observations`),
        fetch(`${API_URL}/api/reports`)
      ]);
      const sectData = await sectRes.json();
      const teachData = await teachRes.json();
      const studData = await studRes.json();
      const obsData = await obsRes.json();
      const repData = await repRes.json();

      setSections(sectData.map((s: any) => ({
        id: s._id,
        name: s.name,
        assignedTeacherId: s.teacher?._id || s.teacher || undefined
      })));

      setTeachers(teachData.map((t: any) => ({
        id: t._id,
        name: t.name,
        code: t.employeeId,
        department: t.department || '',
        designation: t.designation || ''
      })));

      setStudents(studData.map((st: any) => ({
        id: st._id,
        studentId: st.studentId,
        name: st.name,
        avatar: `https://picsum.photos/seed/${st._id}/100`,
        rollNumber: st.rollNumber || '',
        guardianName: st.guardianName || '',
        class: st.section?.name || '',
        assignedTeacherId: st.section?.teacher?._id || st.section?.teacher || ''
      })));

      setObservations(obsData.map((o: any) => ({
        studentId: o.studentId?._id || o.studentId,
        date: o.date,
        mood: o.mood,
        dimensions: o.dimensions,
        tags: o.tags,
        highlight: o.highlight,
        photo: o.photo
      })));

      setReports(repData.map((r: any) => ({
        id: r._id,
        studentId: r.studentId?._id || r.studentId,
        teacherId: r.teacherId?._id || r.teacherId,
        startDate: r.startDate,
        endDate: r.endDate,
        content: r.content,
        recommendations: r.recommendations,
        status: r.status,
        images: r.images,
        createdAt: r.createdAt
      })));
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginMode, setLoginMode] = useState<'teacher' | 'admin'>('teacher');
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

      const newStudents = data.map((row, index) => {
        const teacherName = row['Teacher Name'] || row.teacherName;
        const matchedTeacher = teachers.find(t => t.name.toLowerCase() === teacherName?.toString().toLowerCase());
        
        return {
          studentId: row['Student ID'] || row.studentId || '',
          name: row['Student Name'] || row.Name || row.name || `Student ${index + 1}`,
          rollNumber: row['Roll Number'] || row.rollNumber || '',
          guardianName: row['Guardian Name'] || row.guardianName || '',
          // Use selected section if available, otherwise just try string matching
          sectionId: selectedAdminSection?.id || '',
        };
      });

      fetch(`${API_URL}/api/students/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: newStudents })
      })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json();
          alert(`Bulk Upload Failed: ${err.message || 'Unknown error'}`);
          return;
        }
        await fetchAllData();
      })
      .catch(e => {
        console.error(e);
        alert(`Failed to reach backend during bulk upload: ${e.message}`);
      });
    };
    reader.readAsBinaryString(file);
  };

  const handleAutoAssignUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      
      // Use header: 1 to get an array of arrays to handle multiple tables and title rows
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

      const newStudents: any[] = [];
      let colMap = {
        studentId: -1,
        name: -1,
        grade: -1,
        rollNumber: -1,
        guardianName: -1
      };

      rows.forEach((row, index) => {
        if (!row || row.length === 0) return;

        // Check if this row is a header row
        const rowString = row.join(' ').toLowerCase();
        if (rowString.includes('student id') && rowString.includes('student name')) {
          row.forEach((cell, colIndex) => {
            if (typeof cell !== 'string') return;
            const lowerCell = cell.toLowerCase().trim();
            if (lowerCell === 'student id') colMap.studentId = colIndex;
            else if (lowerCell === 'student name') colMap.name = colIndex;
            else if (lowerCell === 'grade') colMap.grade = colIndex;
            else if (lowerCell === 'roll no.' || lowerCell === 'roll no' || lowerCell === 'roll number') colMap.rollNumber = colIndex;
            else if (lowerCell === 'guardian name') colMap.guardianName = colIndex;
          });
          return; // Skip the header row itself
        }

        // Check if we hit a data row
        if (colMap.studentId !== -1 && colMap.name !== -1) {
          const studentId = row[colMap.studentId];
          const name = row[colMap.name];
          
          // Skip if missing name, or if it looks like a title row
          if (!name || (typeof name === 'string' && name.toLowerCase().includes('grade:'))) return;
          if (typeof studentId === 'string' && studentId.toLowerCase() === 'student id') return;

          newStudents.push({
            studentId: studentId ? String(studentId).trim() : '',
            name: name ? String(name).trim() : `Student ${index + 1}`,
            rollNumber: colMap.rollNumber !== -1 && row[colMap.rollNumber] ? String(row[colMap.rollNumber]).trim() : '',
            guardianName: colMap.guardianName !== -1 && row[colMap.guardianName] ? String(row[colMap.guardianName]).trim() : '',
            grade: colMap.grade !== -1 && row[colMap.grade] ? String(row[colMap.grade]).trim() : '',
            originalRow: index + 1 // Add this to help backend give accurate error logs
          });
        }
      });

      if (newStudents.length === 0) {
        alert("Could not find any student records. Please ensure your Excel sheet has headers like 'Student ID', 'Student name', and 'Grade'.");
        return;
      }

      fetch(`${API_URL}/api/students/auto-assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: newStudents })
      })
      .then(async res => {
        const responseData = await res.json();
        if (!res.ok) {
          alert(`Auto-assign Import Failed: ${responseData.message || 'Unknown error'}`);
          return;
        }
        await fetchAllData();
        
        let message = `Successfully imported ${responseData.insertedCount} students.`;
        if (responseData.skippedCount && responseData.skippedCount > 0) {
           message += `\n\nSkipped ${responseData.skippedCount} rows as section doesn't exist or Grade is missing:\n${responseData.skippedDetails.join('\n')}`;
        }
        alert(message);
      })
      .catch(e => {
        console.error(e);
        alert(`Failed to reach backend during auto-assign import: ${e.message}`);
      });
    };
    reader.readAsBinaryString(file);
    // Reset file input so same file can be uploaded again if needed
    e.target.value = '';
  };

  const addStudentManually = () => {
    // Deprecated. Handled directly inside AdminScreen.
  };

  const initiateDelete = (id: string, type: 'teacher' | 'student') => {
    setDeleteConfirmation({ id, type, step: 1 });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;

    if (deleteConfirmation.step === 1) {
      setDeleteConfirmation({ ...deleteConfirmation, step: 2 });
    } else {
      try {
        if (deleteConfirmation.type === 'teacher') {
          const res = await fetch(`${API_URL}/api/teachers/${deleteConfirmation.id}`, { method: 'DELETE' });
          if (!res.ok) {
             const message = await res.text();
             alert(`Failed to delete teacher: ${message}`);
             return;
          }
        } else {
          const res = await fetch(`${API_URL}/api/students/${deleteConfirmation.id}`, { method: 'DELETE' });
          if (!res.ok) {
             const message = await res.text();
             alert(`Failed to delete student: ${message}`);
             return;
          }
        }
        await fetchAllData();
      } catch (e: any) {
        console.error("Failed to delete", e);
        alert(`Failed to reach backend during deletion: ${e.message}`);
      } finally {
        setDeleteConfirmation(null);
      }
    }
  };

  const saveTeacherClassChange = () => {
    // Deprecated. Handled by Section teacher allocation.
    setEditingTeacherClass(null);
    setNewClassName('');
  };

  const dailyObservations = useMemo(() => {
    return observations.filter(obs => isSameDay(parseISO(obs.date), selectedDate));
  }, [observations, selectedDate]);

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
  };

  const saveObservation = async () => {
    try {
      const res = await fetch(`${API_URL}/api/observations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const error = await res.json();
        alert(`Failed to save observation: ${error.message || 'Unknown error'}`);
        return;
      }
      await fetchAllData();
    } catch (e: any) {
      alert(`Failed to reach backend during save: ${e.message}`);
      console.error(e);
    }
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

    try {
      const endDate = selectedDate;
      const startDate = subDays(endDate, 13);
      
      const payload = {
        studentId: student.id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      };

      const res = await fetch(`${API_URL}/api/reports/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const savedReport = await res.json();

      if (!res.ok) {
        alert(`Failed to generate report: ${savedReport.message || 'Unknown error'}`);
        return;
      }

      await fetchAllData();

      const report: GeneratedReport = {
        ...savedReport,
        id: savedReport._id,
      };

      setCurrentReport(report);
    } catch (error: any) {
      alert(`Backend AI Generation Error: ${error.message}`);
      console.error("Backend AI Generation Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };



  const generateAllReports = async () => {
    setIsGenerating(true);
    try {
      const endDate = selectedDate;
      const startDate = subDays(endDate, 13);
      
      for (const student of students) {
        const payload = {
          studentId: student.id,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        };
        
        try {
          const res = await fetch(`${API_URL}/api/reports/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const savedReport = await res.json();
          if (!res.ok) {
             console.error(`Backend failed for ${student.name}: ${savedReport.message}`);
          }
        } catch (e: any) {
          console.error(`Network or fetch failed for ${student.name}`, e);
        }
      }
      await fetchAllData();
    } catch (err: any) {
      alert(`Bulk Generation Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppContext.Provider value={{
      isLoadingData,
      sections, setSections,
      selectedAdminSection, setSelectedAdminSection,
      teachers, setTeachers,
      students, setStudents,
      currentTeacher, setCurrentTeacher,
      isAdmin, setIsAdmin,
      loginMode, setLoginMode,
      selectedDate, setSelectedDate,
      observations, setObservations,
      selectedStudent, setSelectedStudent,
      formData, setFormData,
      isGenerating,
      reports, setReports,
      currentReport, setCurrentReport,
      isEditingReport, setIsEditingReport,
      viewingReportsForStudent, setViewingReportsForStudent,
      adminTab, setAdminTab,
      newTeacher, setNewTeacher,
      newStudent, setNewStudent,
      deleteConfirmation, setDeleteConfirmation,
      editingTeacherClass, setEditingTeacherClass,
      newClassName, setNewClassName,
      downloadSampleExcel, handleFileUpload, handleAutoAssignUpload, addStudentManually,
      initiateDelete, confirmDelete, saveTeacherClassChange,
      dailyObservations, filteredStudents, getStudentStatus,
      handleTeacherSelect, handleStudentSelect, saveObservation,
      toggleTag, setDimensionRating, generatePeriodicReport, generateAllReports,
      refreshData: fetchAllData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
