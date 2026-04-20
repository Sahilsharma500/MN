import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Sparkles, AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '../lib/utils';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export function PastReportsModal() {
  const navigate = useNavigate();
  const { 
    viewingReportsForStudent, setViewingReportsForStudent, 
    reports, setCurrentReport, setSelectedStudent, 
    generatePeriodicReport 
  } = useAppContext();

  return (
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
                reports.filter(r => r.studentId === viewingReportsForStudent.id).slice().reverse().map(report => (
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
                        navigate('/report');
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
  );
}

export function DeleteConfirmationModal() {
  const { deleteConfirmation, setDeleteConfirmation, confirmDelete } = useAppContext();

  return (
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
  );
}

export function ChangeTeacherClassModal() {
  const { 
    editingTeacherClass, setEditingTeacherClass, 
    teachers, newClassName, setNewClassName, saveTeacherClassChange 
  } = useAppContext();

  return (
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
  );
}
