import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Loader2, CheckCircle2, TreePine as Tree, User, Calendar, Image as ImageIcon, Sparkles, Save, Edit3, Heart, Download, Share2, Send } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import html2pdf from 'html2pdf.js';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ReportScreen() {
  const navigate = useNavigate();
  const { 
    selectedStudent, isGenerating, currentReport, setCurrentReport, 
    isEditingReport, setIsEditingReport, currentTeacher, setReports
  } = useAppContext();
  
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const parsed = true; // Kept for minimal structural changes to conditional rendering

  const downloadReportAsPDF = () => {
    window.print();
  };

  const shareReport = () => {
    const message = `*Mind Garden: A Smart Start Preschool Progress Report*\n\n*Student:* ${selectedStudent.name}\n*Class:* ${selectedStudent.class}\nHello! I've generated the latest progress report for ${selectedStudent.name}. Please download the PDF and attach it to this message.`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!selectedStudent) return null;

  return (
    <motion.div
      key="report"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="space-y-8 pb-24 max-w-4xl mx-auto"
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

      {!isGenerating && currentReport && parsed && (
        <div ref={reportRef} data-report-container className="space-y-8">
          
          {/* PAGE 1 */}
          <div id="pdf-page-1" className="bg-white border border-stone-200 rounded-[2rem] overflow-hidden shadow-2xl shadow-stone-200/50">
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
              </div>
            </div>
            
            <div className="p-8 space-y-12">
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

              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <Sparkles size={20} />
                    </div>
                    <h4 className="text-lg font-serif italic text-stone-800">Detailed Narrative & Observations</h4>
                  </div>
                  <button 
                    onClick={async () => {
                      if (isEditingReport) {
                        try {
                          await fetch(`${API_URL}/api/reports/${currentReport.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                              content: currentReport.content, 
                              recommendations: currentReport.recommendations 
                            })
                          });
                          setReports(prev => prev.map(r => r.id === currentReport.id ? currentReport : r));
                        } catch (e) {
                          console.error("Failed to save edits", e);
                        }
                      }
                      setIsEditingReport(!isEditingReport);
                    }}
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
                  <div className="markdown-body">
                    <ReactMarkdown>{currentReport.content}</ReactMarkdown>
                  </div>
                )}
              </section>

              {/* Merged Teacher Recommendations Section */}
              {!isEditingReport && (
                <section className="space-y-6 pt-8 border-t border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <Heart size={20} />
                    </div>
                    <h4 className="text-lg font-serif italic text-stone-800">Teacher's Closing Recommendations</h4>
                  </div>
                  <div className="markdown-body italic font-medium text-emerald-800 mb-8">
                    <ReactMarkdown>{currentReport.recommendations}</ReactMarkdown>
                  </div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-900 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-900/20">
                        {currentTeacher?.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-stone-800 font-bold text-lg">{currentTeacher?.name}</p>
                        <p className="text-stone-500 text-sm">Lead Educator, {selectedStudent.class}</p>
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* Export Buttons */}
          {!isEditingReport && (
            <div className="flex flex-wrap gap-4 w-full md:w-auto pt-4 justify-end">
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
                onClick={async () => {
                  try {
                    await fetch(`${API_URL}/api/reports/${currentReport.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ status: 'final' })
                    });
                    setReports(prev => prev.map(r => r.id === currentReport.id ? { ...currentReport, status: 'final' } : r));
                    navigate('/admin');
                  } catch (e) {
                    console.error("Failed to finalize report", e);
                  }
                }}
                className="flex-1 md:flex-none bg-emerald-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-emerald-900/20 hover:bg-emerald-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Send size={20} />
                Finalize
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
