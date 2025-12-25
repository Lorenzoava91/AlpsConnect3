import React from 'react';
import { Client } from '../types';
import { X, CheckCircle, AlertTriangle, Activity, Mountain } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface Props {
  client: Client;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  lang?: 'it' | 'en';
}

const SportsPassportModal: React.FC<Props> = ({ client, onClose, onApprove, onReject, lang = 'it' }) => {
  
  const t = {
    it: {
        verified: "Verificato",
        passport: "Scheda Esperienza",
        profile: "Profilo Atletico",
        level: "Livello",
        years: "Anni Exp",
        ascents: "Ultime Ascensioni",
        reject: "Rifiuta",
        approve: "Accetta",
        tech: "Tecnica",
        fit: "Fitness",
        exp: "Esperienza",
        gear: "Attrezzatura"
    },
    en: {
        verified: "Verified",
        passport: "Experience Profile",
        profile: "Athletic Profile",
        level: "Level",
        years: "Years Exp",
        ascents: "Last Ascents",
        reject: "Reject",
        approve: "Approve",
        tech: "Technique",
        fit: "Fitness",
        exp: "Experience",
        gear: "Gear"
    }
  }[lang];

  const data = [
    { subject: t.tech, A: client.passport.technicalScore, fullMark: 100 },
    { subject: t.fit, A: client.passport.fitnessScore, fullMark: 100 },
    { subject: t.exp, A: Math.min(client.passport.yearsExperience * 10, 100), fullMark: 100 },
    { subject: t.gear, A: 90, fullMark: 100 }, // Simulated
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        <div className="bg-slate-900 text-white p-6 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold">{client.name}</h2>
              {client.passport.verified && (
                <span className="bg-green-500 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle size={12} /> {t.verified}
                </span>
              )}
            </div>
            <p className="text-slate-400 text-sm">{t.passport}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Stats */}
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">{t.profile}</h3>
            <div className="h-64 w-full -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                  <Radar
                    name={client.name}
                    dataKey="A"
                    stroke="#0f172a"
                    fill="#0f172a"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex gap-4 mt-2">
               <div className="flex-1 bg-slate-50 p-3 rounded-lg text-center border border-slate-100">
                  <Activity className="mx-auto mb-1 text-blue-500" size={20} />
                  <div className="text-xs text-slate-500">{t.level}</div>
                  <div className="font-bold text-slate-800">{client.passport.level}</div>
               </div>
               <div className="flex-1 bg-slate-50 p-3 rounded-lg text-center border border-slate-100">
                  <Mountain className="mx-auto mb-1 text-emerald-500" size={20} />
                  <div className="text-xs text-slate-500">{t.years}</div>
                  <div className="font-bold text-slate-800">{client.passport.yearsExperience}+</div>
               </div>
            </div>
          </div>

          {/* Right Column: History & Actions */}
          <div className="flex flex-col h-full">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">{t.ascents}</h3>
            <div className="bg-slate-50 rounded-lg p-4 mb-auto border border-slate-100 max-h-48 overflow-y-auto">
              <ul className="space-y-2">
                {client.passport.lastAscents.map((ascent, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                    {ascent}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
               <div className="flex gap-3">
                 <button 
                  onClick={onReject}
                  className="flex-1 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors flex justify-center items-center gap-2">
                    <AlertTriangle size={18} />
                    {t.reject}
                 </button>
                 <button 
                  onClick={onApprove}
                  className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium transition-colors shadow-lg shadow-slate-200 flex justify-center items-center gap-2">
                    <CheckCircle size={18} />
                    {t.approve}
                 </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SportsPassportModal;