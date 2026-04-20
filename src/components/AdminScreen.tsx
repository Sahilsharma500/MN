import React from 'react';
import { motion } from 'motion/react';
import { Loader2, Sparkles, Plus, Trash2, FileText, Upload, AlertTriangle, Edit3 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminScreen() {
  const { 
    isLoadingData,
    sections, setSections,
    selectedAdminSection, setSelectedAdminSection,
    adminTab, setAdminTab,
    teachers, setTeachers,
    students, setStudents,
    reports,
    isGenerating, generateAllReports, generatePeriodicReport,
    newTeacher, setNewTeacher,
    newStudent, setNewStudent,
    initiateDelete,
    editingTeacherClass, setEditingTeacherClass,
    newClassName, setNewClassName,
    downloadSampleExcel, handleFileUpload, handleAutoAssignUpload, addStudentManually,
    setCurrentReport, setViewingReportsForStudent,
    setSelectedStudent, refreshData
  } = useAppContext();

  const navigate = useNavigate();

  if (isLoadingData) {
    return (
      <div className="p-8 space-y-8 animate-pulse bg-stone-50 min-h-screen w-full rounded-tl-3xl shadow-inner pt-20 lg:pt-8 overflow-y-auto">
        <div className="h-10 bg-stone-200 rounded-xl w-1/4 mb-10"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="h-32 bg-stone-200 border border-stone-100 rounded-2xl w-full"></div>
          <div className="h-32 bg-stone-200 border border-stone-100 rounded-2xl w-full"></div>
          <div className="h-32 bg-stone-200 border border-stone-100 rounded-2xl w-full"></div>
        </div>
        <div className="h-64 bg-stone-200 border border-stone-100 rounded-2xl w-full mt-6"></div>
      </div>
    );
  }

  return (
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
                              <span key={c as string} className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded text-[10px] font-bold">{c as string}</span>
                            )) : <span className="text-stone-300 italic text-xs">No classes</span>}
                          </div>
                          <button 
                            onClick={() => {
                              setEditingTeacherClass({ teacherId: teacher.id, currentClasses: classes as string[] });
                              setNewClassName((classes[0] as string) || '');
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
            onClick={async () => {
              if (newTeacher.name && newTeacher.code) {
                try {
                  const res = await fetch(`${API_URL}/api/teachers`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: newTeacher.name,
                      employeeId: newTeacher.code,
                      department: newTeacher.department,
                      designation: newTeacher.designation
                    })
                  });
                  const saved = await res.json();
                  if (!res.ok) {
                    alert(`Failed to add teacher: ${saved.message || 'Unknown error'}`);
                    return;
                  }
                  await refreshData();
                  setNewTeacher({ name: '', code: '', department: '', designation: '' });
                } catch (e: any) {
                  alert(`Error saving teacher: ${e.message}`);
                }
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

      {/* 
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
                          onClick={() => { setCurrentReport(r); setSelectedStudent(student); navigate('/report'); }}
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
      */}

      {adminTab === 'students' && !selectedAdminSection && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-xl font-bold text-stone-700">Manage Sections</h3>
            <label className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-bold text-sm cursor-pointer hover:bg-emerald-100 transition-all flex items-center gap-2 shadow-sm">
              <Upload size={16} />
              Import Students
              <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleAutoAssignUpload} />
            </label>
          </div>

          <div className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm">
            <h4 className="font-bold text-stone-700 mb-4 flex items-center gap-2">
              <Plus size={18} className="text-emerald-500" />
              Add Section
            </h4>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Section Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Pre-Primary A"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full bg-stone-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
              <button 
                onClick={async () => {
                  if (newClassName) {
                    try {
                      const res = await fetch(`${API_URL}/api/sections`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: newClassName })
                      });
                      const saved = await res.json();
                      if (!res.ok) {
                        alert(`Failed to add section: ${saved.message || 'Unknown error'}`);
                        return;
                      }
                      await refreshData();
                      setNewClassName('');
                    } catch (e: any) {
                      alert(`Failed to reach backend: ${e.message}`);
                    }
                  }
                }}
                disabled={!newClassName}
                className="w-full sm:w-auto bg-emerald-500 text-white font-bold py-2 px-6 rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Add
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((section) => {
              const studentsInSection = students.filter(s => s.class === section.name);
              return (
                <button 
                  key={section.id}
                  onClick={() => setSelectedAdminSection(section)}
                  className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col text-left hover:border-emerald-500 transition-all group shadow-sm hover:shadow-md"
                >
                  <h4 className="font-bold text-xl text-stone-800 group-hover:text-emerald-700 transition-colors">{section.name}</h4>
                  <p className="text-sm font-medium text-stone-500 mt-2">{studentsInSection.length} Students</p>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {adminTab === 'students' && selectedAdminSection && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedAdminSection(null)}
                className="w-10 h-10 bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-700 rounded-xl flex items-center justify-center transition-all"
                title="Back to Sections"
              >
                ←
              </button>
              <h3 className="text-xl font-bold text-stone-700">Manage Students: <span className="text-emerald-600 italic">{selectedAdminSection.name}</span></h3>
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedAdminSection.assignedTeacherId || ''}
                onChange={async (e) => {
                  const newTeacherId = e.target.value;
                  try {
                    const res = await fetch(`${API_URL}/api/sections/${selectedAdminSection.id}/allocate-teacher`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ teacherId: newTeacherId })
                    });
                    if (!res.ok) {
                      const errorData = await res.json();
                      alert(`Failed to allocate teacher: ${errorData.message || 'Unknown error'}`);
                      return;
                    }
                    await refreshData();
                    // Optional: Reselect to immediately show accurate info if needed.
                    // But relying on context arrays would refresh the list on screen anyway.
                  } catch (e: any) { 
                    alert(`Failed to reach backend: ${e.message}`);
                  }
                }}
                className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-100 cursor-pointer transition-all outline-none"
              >
                <option value="">Manage Teacher (None)</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <button 
                onClick={downloadSampleExcel}
                className="bg-stone-100 text-stone-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-stone-200 transition-all flex items-center gap-2"
              >
                <FileText size={16} />
                Template
              </button>
              <label className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-bold text-sm cursor-pointer hover:bg-emerald-100 transition-all flex items-center gap-2">
                <Upload size={16} />
                Upload
                <input type="file" accept=".xlsx, .xls" className="hidden" onChange={(e) => {
                  handleFileUpload(e);
                  // Current implementation maps from file.
                }} />
              </label>
            </div>
          </div>

          <div className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm">
            <h4 className="font-bold text-stone-700 mb-4 flex items-center gap-2">
              <Plus size={18} className="text-emerald-500" />
              Add Student Manually
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            </div>
            <button 
              onClick={async () => {
                if (!newStudent.name) return;
                try {
                  const payload = {
                    name: newStudent.name,
                    rollNumber: newStudent.rollNumber,
                    guardianName: newStudent.guardianName,
                    sectionId: selectedAdminSection.id
                  };
                  
                  const res = await fetch(`${API_URL}/api/students`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                  });
                  const saved = await res.json();
                  
                  if (!res.ok) {
                    alert(`Backend Error: ${saved.message}`);
                    return;
                  }
                  
                  await refreshData();
                  setNewStudent({ studentId: '', name: '', rollNumber: '', guardianName: '', class: '', assignedTeacherId: '' });
                } catch (e: any) {
                  alert(`Failed to reach backend: ${e.message}`);
                }
              }}
              disabled={!newStudent.name}
              className="mt-6 w-full bg-emerald-500 text-white font-bold py-3 rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Add Student to Section
            </button>
          </div>

          <div className="grid gap-4">
            {students.filter(s => s.class === selectedAdminSection.name).map((student) => {
              const studentReports = reports
                .filter(r => r.studentId === student.id)
                .sort((a, b) => {
                  const dateA = a.createdAt ? new Date(a.createdAt).getTime() : new Date(a.startDate).getTime();
                  const dateB = b.createdAt ? new Date(b.createdAt).getTime() : new Date(b.startDate).getTime();
                  return dateB - dateA;
                });
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
                    <div className="flex">
                      {studentReports.slice(0, 1).map((r) => (
                        <button 
                          key={r.id} 
                          onClick={() => { setCurrentReport(r); setSelectedStudent(student); navigate('/report'); }}
                          className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-all flex items-center gap-2 border border-emerald-100 uppercase" 
                          title={`Report from ${format(parseISO(r.startDate), 'MMM d')}`}
                        >
                          <FileText size={14} />
                          {r.status}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => generatePeriodicReport(student)}
                      disabled={isGenerating}
                      className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      Generate
                    </button>

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
  );
}
