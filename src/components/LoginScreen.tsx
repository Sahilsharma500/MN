import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TreePine as Tree, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAppContext, ADMIN_PASSWORD } from '../context/AppContext';

export default function LoginScreen() {
  const navigate = useNavigate();
  const { teachers, handleTeacherSelect, loginMode, setLoginMode, setIsAdmin } = useAppContext();
  const [password, setPassword] = useState('');

  return (
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
              onClick={() => {
                handleTeacherSelect(teacher);
                navigate('/home');
              }}
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
                navigate('/admin');
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
  );
}
