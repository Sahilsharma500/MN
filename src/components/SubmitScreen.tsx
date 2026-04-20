import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Camera, Image as ImageIcon, Save } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function SubmitScreen() {
  const navigate = useNavigate();
  const { 
    selectedStudent, selectedDate, formData, setFormData, 
    saveObservation 
  } = useAppContext();

  if (!selectedStudent) return null;

  return (
    <motion.div
      key="submit"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8 pb-24"
    >
      <button 
        onClick={() => navigate('/form')}
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
          onClick={() => { saveObservation(); navigate('/home'); }}
          className="w-full max-w-md bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-emerald-900/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
        >
          Save Observation
          <Save size={20} />
        </button>
      </div>
    </motion.div>
  );
}
