import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { MOODS, DIMENSIONS, QUICK_TAGS, ObservationData } from '../types';

export default function ObservationForm() {
  const navigate = useNavigate();
  const { 
    selectedStudent, selectedDate, formData, setFormData, 
    setDimensionRating, toggleTag 
  } = useAppContext();

  if (!selectedStudent) return null;

  return (
    <motion.div
      key="form"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8 pb-24"
    >
      <button 
        onClick={() => navigate('/home')}
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
          onClick={() => navigate('/submit')}
          disabled={!formData.mood || Object.values(formData.dimensions).some(v => v === 0)}
          className="w-full max-w-md bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-emerald-900/20 hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          Continue to Highlights
          <ChevronRight size={20} />
        </button>
      </div>
    </motion.div>
  );
}
