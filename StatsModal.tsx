import React, { useEffect, useState } from 'react';
import { X, Eye, MessageSquare, Trash2, Calendar, User, AlertCircle, Sparkles, Lock, ChevronRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface FeedbackItem {
  id: number;
  date: string;
  rating: number;
  role: string;
  comment: string;
  // Specific Guide Questions
  q1_intro?: string;
  q2_pain?: string;
  q3_solution?: string;
  // Specific Fan Questions
  fan_email?: string;
  fan_age?: string;
  fan_level?: string;
  fan_nationality?: string;
  fan_prev_exp?: string;
  fan_usage?: string;
}

const StatsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [views, setViews] = useState(0);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset auth state when modal opens (optional: remove if you want session persistence)
      setIsAuthenticated(false);
      setPasswordInput('');
      setError(false);

      // Read data from localStorage
      const storedViews = localStorage.getItem('alpina_page_views') || '0';
      const storedFeedbacks = JSON.parse(localStorage.getItem('alpina_feedback_data') || '[]');
      
      setViews(parseInt(storedViews));
      setFeedbacks(storedFeedbacks);
    }
  }, [isOpen]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'Deicide1991!') {
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPasswordInput('');
    }
  };

  const clearData = () => {
    if(confirm('Sei sicuro di voler cancellare tutte le statistiche?')) {
        localStorage.removeItem('alpina_page_views');
        localStorage.removeItem('alpina_feedback_data');
        setViews(0);
        setFeedbacks([]);
    }
  };

  if (!isOpen) return null;

  // --- AUTH SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative">
           <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors">
              <X size={24} />
           </button>
           
           <div className="p-8 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-900">
                 <Lock size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Area Riservata</h2>
              <p className="text-sm text-slate-500 mb-6">Inserisci la password amministratore per visualizzare i dati.</p>
              
              <form onSubmit={handleLogin} className="space-y-4">
                 <div>
                    <input 
                      autoFocus
                      type="password" 
                      value={passwordInput}
                      onChange={(e) => { setPasswordInput(e.target.value); setError(false); }}
                      className={`w-full px-4 py-3 rounded-xl border outline-none text-center font-bold tracking-widest placeholder:font-normal placeholder:tracking-normal transition-all ${error ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-100'}`}
                      placeholder="Password"
                    />
                    {error && <p className="text-red-500 text-xs mt-2 font-bold animate-pulse">Password errata</p>}
                 </div>
                 <button 
                   type="submit"
                   className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                 >
                   Accedi <ChevronRight size={16} />
                 </button>
              </form>
           </div>
        </div>
      </div>
    );
  }

  // --- DASHBOARD SCREEN ---
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 p-6 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            📊 Statistiche Admin (MVP)
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto bg-slate-50 flex-1">
           {/* KPI Cards */}
           <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                 <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
                    <Eye size={32} />
                 </div>
                 <div>
                    <p className="text-slate-500 text-sm font-bold uppercase">Visualizzazioni Pagina</p>
                    <h3 className="text-4xl font-bold text-slate-900">{views}</h3>
                 </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                 <div className="p-4 bg-purple-50 text-purple-600 rounded-xl">
                    <MessageSquare size={32} />
                 </div>
                 <div>
                    <p className="text-slate-500 text-sm font-bold uppercase">Risposte Form</p>
                    <h3 className="text-4xl font-bold text-slate-900">{feedbacks.length}</h3>
                 </div>
              </div>
           </div>

           {/* Feedback List */}
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                 <h3 className="font-bold text-slate-900">Feedback Ricevuti</h3>
                 <button onClick={clearData} className="text-red-500 text-xs font-bold flex items-center gap-1 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                    <Trash2 size={14} /> Reset Dati
                 </button>
              </div>
              
              {feedbacks.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                      <p>Nessun feedback ricevuto ancora.</p>
                  </div>
              ) : (
                  <div className="divide-y divide-slate-100">
                     {feedbacks.map((fb) => (
                        <div key={fb.id} className="p-6 hover:bg-slate-50 transition-colors">
                           <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-2">
                                 <span className={`font-bold px-2 py-0.5 rounded-md text-sm ${fb.role === 'Guida Alpina' ? 'bg-blue-100 text-blue-700' : fb.role === 'Appassionato' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                                    {fb.role}
                                 </span>
                                 <span className="text-slate-300">•</span>
                                 <span className="text-xs text-slate-500 flex items-center gap-1">
                                    <Calendar size={12} /> {fb.date}
                                 </span>
                              </div>
                              <div className="flex gap-1">
                                 {[1, 2, 3, 4, 5].map(star => (
                                     <span key={star} className={star <= fb.rating ? 'text-yellow-400' : 'text-slate-200'}>★</span>
                                 ))}
                              </div>
                           </div>
                           
                           {/* Content Logic based on Role */}
                           {fb.role === 'Guida Alpina' && (fb.q1_intro || fb.q2_pain || fb.q3_solution) ? (
                               <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                   <div>
                                       <div className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                                           <User size={12}/> Intro & Zona
                                       </div>
                                       <p className="text-slate-800 text-sm">{fb.q1_intro}</p>
                                   </div>
                                   <div>
                                       <div className="text-xs font-bold text-orange-400 uppercase mb-1 flex items-center gap-1">
                                           <AlertCircle size={12}/> Pain Points
                                       </div>
                                       <p className="text-slate-800 text-sm">{fb.q2_pain}</p>
                                   </div>
                                   <div>
                                       <div className="text-xs font-bold text-purple-400 uppercase mb-1 flex items-center gap-1">
                                           <Sparkles size={12}/> Soluzione Ideale
                                       </div>
                                       <p className="text-slate-800 text-sm">{fb.q3_solution}</p>
                                   </div>
                               </div>
                           ) : fb.role === 'Appassionato' && (fb.fan_email || fb.fan_age) ? (
                               <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                   <div className="grid grid-cols-2 gap-4">
                                       <div>
                                           <div className="text-xs font-bold text-slate-400 uppercase mb-1">Email</div>
                                           <p className="text-slate-800 text-sm truncate">{fb.fan_email}</p>
                                       </div>
                                       <div>
                                           <div className="text-xs font-bold text-slate-400 uppercase mb-1">Età & Nazionalità</div>
                                           <p className="text-slate-800 text-sm">{fb.fan_age} - {fb.fan_nationality}</p>
                                       </div>
                                   </div>
                                   <div>
                                       <div className="text-xs font-bold text-slate-400 uppercase mb-1">Livello</div>
                                       <p className="text-slate-800 text-sm">{fb.fan_level}</p>
                                   </div>
                                   <div>
                                       <div className="text-xs font-bold text-slate-400 uppercase mb-1">Esperienze Precedenti</div>
                                       <p className="text-slate-800 text-sm">{fb.fan_prev_exp}</p>
                                   </div>
                                   <div>
                                       <div className="text-xs font-bold text-slate-400 uppercase mb-1">Utilizzo App</div>
                                       <p className="text-slate-800 text-sm">{fb.fan_usage}</p>
                                   </div>
                               </div>
                           ) : (
                               <p className="text-slate-600 text-sm leading-relaxed italic">"{fb.comment}"</p>
                           )}
                        </div>
                     ))}
                  </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default StatsModal;