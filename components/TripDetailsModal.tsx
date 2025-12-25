import React from 'react';
import { Trip } from '../types';
import { X, MapPin, Calendar, Users, Mountain, CheckCircle, Shield, Activity, ArrowRight } from 'lucide-react';

interface Props {
  trip: Trip;
  onClose: () => void;
  onContact?: () => void;
  onBook?: () => void;
  onViewGuideProfile?: () => void;
  lang: 'it' | 'en';
  isGuideView?: boolean;
}

const TripDetailsModal: React.FC<Props> = ({ trip, onClose, onContact, onBook, onViewGuideProfile, lang, isGuideView = false }) => {
  
  const t = {
    it: {
      about: "Sull'attività",
      equipment: "Equipaggiamento Richiesto",
      guide: "La tua Guida",
      participants: "Partecipanti",
      level: "Livello",
      book: "Prenota",
      contact: "Contatta Guida",
      available: "Disponibilità",
      to: "al",
      from: "dal",
      price: "Prezzo a persona",
      included: "Cosa è incluso",
      includedList: ["Guida Alpina Certificata", "Assicurazione RC", "Briefing tecnico", "Assistenza durante l'uscita"],
      viewProfile: "Vedi Profilo"
    },
    en: {
      about: "About this trip",
      equipment: "Required Equipment",
      guide: "Your Guide",
      participants: "Participants",
      level: "Level",
      book: "Book Now",
      contact: "Contact Guide",
      available: "Availability",
      to: "to",
      from: "from",
      price: "Price per person",
      included: "What's included",
      includedList: ["Certified Alpine Guide", "Liability Insurance", "Technical Briefing", "Assistance during the trip"],
      viewProfile: "View Profile"
    }
  }[lang];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative">
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-20 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors backdrop-blur-md"
        >
          <X size={20} />
        </button>

        {/* Left Column: Image & Key Info (Mobile: Top) */}
        <div className="w-full md:w-2/5 h-48 md:h-auto relative bg-slate-100 shrink-0">
          <img 
            src={trip.image} 
            alt={trip.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
          <div className="absolute bottom-4 left-4 right-4 text-white">
             <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold mb-2 uppercase tracking-wide">
                <Mountain size={12} /> {trip.activityType}
             </div>
             <h2 className="text-2xl font-bold leading-tight mb-1">{trip.title}</h2>
             <div className="flex items-center gap-1 text-sm text-slate-200">
               <MapPin size={14} /> {trip.location}
             </div>
          </div>
        </div>

        {/* Right Column: Details & Scrollable */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
           <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
              
              {/* Key Stats Bar */}
              <div className="flex flex-wrap gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3 flex-1 min-w-[120px]">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                         <Calendar size={20} />
                      </div>
                      <div>
                         <p className="text-[10px] text-slate-500 font-bold uppercase">{t.available}</p>
                         <p className="text-sm font-bold text-slate-900">{t.from} {trip.availableFrom}</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-3 flex-1 min-w-[120px]">
                      <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                         <Activity size={20} />
                      </div>
                      <div>
                         <p className="text-[10px] text-slate-500 font-bold uppercase">{t.level}</p>
                         <p className="text-sm font-bold text-slate-900">{trip.difficulty}</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-3 flex-1 min-w-[120px]">
                      <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                         <Users size={20} />
                      </div>
                      <div>
                         <p className="text-[10px] text-slate-500 font-bold uppercase">{t.participants}</p>
                         <p className="text-sm font-bold text-slate-900">{trip.enrolledClients.length} / {trip.maxParticipants}</p>
                      </div>
                  </div>
              </div>

              {/* Description */}
              <div>
                 <h3 className="font-bold text-lg text-slate-900 mb-3">{t.about}</h3>
                 <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                    {trip.description}
                 </p>
              </div>

              {/* Equipment */}
              <div>
                 <h3 className="font-bold text-lg text-slate-900 mb-3">{t.equipment}</h3>
                 <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {trip.equipment.map((item, idx) => (
                       <li key={idx} className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                          <CheckCircle size={14} className="text-green-500 shrink-0" />
                          {item}
                       </li>
                    ))}
                 </ul>
              </div>

              {/* Guide Info */}
              <div>
                 <h3 className="font-bold text-lg text-slate-900 mb-3">{t.guide}</h3>
                 <div 
                    onClick={onViewGuideProfile}
                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors group"
                 >
                    <img src={trip.guideAvatar} alt={trip.guideName} className="w-12 h-12 rounded-full object-cover" />
                    <div className="flex-1">
                       <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{trip.guideName}</h4>
                       <div className="flex items-center gap-1 text-slate-500 text-xs">
                          <span className="font-normal hover:underline text-[10px] text-blue-600">{t.viewProfile}</span>
                       </div>
                    </div>
                    <div className="text-right">
                       <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-[10px] font-bold uppercase border border-blue-100">
                          <Shield size={10} /> Certified
                       </div>
                       <div className="text-slate-300 mt-1 hidden sm:block">
                           <ArrowRight size={16} />
                       </div>
                    </div>
                 </div>
              </div>

               {/* Included Items (Hardcoded for MVP visual) */}
               <div>
                 <h3 className="font-bold text-lg text-slate-900 mb-3">{t.included}</h3>
                 <ul className="space-y-2">
                    {t.includedList.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                           <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div> {item}
                        </li>
                    ))}
                 </ul>
               </div>

           </div>

           {/* Footer / Actions */}
           <div className="p-4 md:p-6 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div>
                 <p className="text-xs text-slate-500 font-bold uppercase mb-0.5">{t.price}</p>
                 <p className="text-2xl font-bold text-slate-900">€{trip.price}</p>
              </div>
              
              {!isGuideView && (
                <div className="flex gap-3 w-full sm:w-auto">
                    <button 
                    onClick={onContact}
                    className="flex-1 sm:flex-none px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors"
                    >
                        {t.contact}
                    </button>
                    <button 
                    onClick={onBook}
                    className="flex-1 sm:flex-none px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                    >
                        {t.book}
                    </button>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetailsModal;