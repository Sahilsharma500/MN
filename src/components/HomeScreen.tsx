import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, CheckCircle2, Calendar as CalendarIcon, FileText } from 'lucide-react';
import { startOfDay, format } from 'date-fns';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function HomeScreen() {
  const navigate = useNavigate();
  const { 
    selectedDate, setSelectedDate, filteredStudents, getStudentStatus, 
    handleStudentSelect, isAdmin, setSelectedStudent, generatePeriodicReport 
  } = useAppContext();

  return (
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
              onClick={() => {
                handleStudentSelect(student);
                navigate('/form');
              }}
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
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setSelectedStudent(student); 
                      generatePeriodicReport(student);
                      navigate('/report');
                    }}
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
  );
}
