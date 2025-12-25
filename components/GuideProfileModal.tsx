import React, { useState } from 'react';
import { Guide, Trip, Review } from '../types';
import { X, MapPin, Shield, Award, CheckCircle, Clock } from 'lucide-react';

interface Props {
  guide: Guide;
  pastTrips: Trip[];
  onClose: () => void;
  lang: 'it' | 'en';
}

const GuideProfileModal: React.FC<Props> = ({ guide, pastTrips, onClose, lang }) => {
  const [activeTab, setActiveTab] = useState<'bio' | 'reviews' | 'history'>('bio');

  const t = {
    it: {
      verified: "Guida Verificata",
      uiagm: "Certificato UIAGM",
      bio: "Biografia",
      reviews: "Recensioni",
      history: "Storico Gite",
      completedTrips: "Gite Completate",
      rating: "Valutazione Media",
      memberSince: "Membro dal 2018",
      contact: "Contatta",
      noReviews: "Nessuna recensione ancora.",
      noTrips: "Nessuna gita conclusa registrata.",
      reviewDate: "Recensito il",
      tripDate: "Svolta il"
    },
    en: {
      verified: "Verified Guide",
      uiagm: "UIAGM Certified",
      bio: "Biography",
      reviews: "Reviews",
      history: "Trip History",
      completedTrips: "Completed Trips",
      rating: "Avg Rating",
      memberSince: "Member since 2018",
      contact: "Contact",
      noReviews: "No reviews yet.",
      noTrips: "No completed trips recorded.",
      reviewDate: "Reviewed on",
      tripDate: "Took place on"
    }
  }[lang];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative">
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors backdrop-blur-md"
        >
          <X size={20} />
        </button>

        {/* Header Cover & Avatar */}
        <div className="h-32 bg-slate-900 relative shrink-0">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
           <div className="absolute -bottom-12 left-8">
               <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-xl">
                   <img src={guide.avatar} alt={guide.name} className="w-full h-full object-cover rounded-xl" />
               </div>
           </div>
        </div>

        {/* Info Header */}
        <div className="pt-14 px-8 pb-4">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        {guide.name} 
                        <Shield size={18} className="text-blue-500" fill="currentColor" fillOpacity={0.2} />
                    </h2>
                    <div className="flex items-center gap-4 text-sm mt-1">
                        <span className="text-slate-500 font-bold">
                            ({guide.reviews.length} {t.reviews.toLowerCase()})
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">{guide.alboNumber}</span>
                    </div>
                </div>
                <div className="text-right hidden sm:block">
                     <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-bold uppercase border border-green-100">
                          <CheckCircle size={12} /> {t.uiagm}
                     </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 mt-6 border-b border-slate-100">
                {[
                    { id: 'bio', label: t.bio },
                    { id: 'reviews', label: t.reviews },
                    { id: 'history', label: t.history },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`pb-3 text-sm font-bold transition-all relative ${
                            activeTab === tab.id 
                            ? 'text-slate-900' 
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        {tab.label}
                        {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-900 rounded-full"></div>}
                    </button>
                ))}
            </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8">
            
            {/* TAB: BIO */}
            {activeTab === 'bio' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                            <Award size={18} className="text-slate-400" /> {t.bio}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                            {guide.bio || "Nessuna biografia disponibile."}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                              <div className="text-slate-400 text-xs font-bold uppercase mb-1">{t.completedTrips}</div>
                              <div className="text-2xl font-bold text-slate-900">{pastTrips.length}</div>
                         </div>
                         <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                              <div className="text-slate-400 text-xs font-bold uppercase mb-1">{t.memberSince}</div>
                              <div className="text-sm font-bold text-slate-900">2018</div>
                         </div>
                    </div>
                </div>
            )}

            {/* TAB: REVIEWS */}
            {activeTab === 'reviews' && (
                <div className="space-y-4">
                    {guide.reviews.length > 0 ? (
                        guide.reviews.map(review => (
                            <div key={review.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-xs text-slate-600">
                                            {review.authorName.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-slate-900">{review.authorName}</div>
                                            <div className="text-[10px] text-slate-400">{t.reviewDate} {review.date}</div>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-slate-600 text-sm italic">"{review.comment}"</p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-slate-400 italic">
                            {t.noReviews}
                        </div>
                    )}
                </div>
            )}

            {/* TAB: HISTORY */}
            {activeTab === 'history' && (
                <div className="space-y-4">
                    {pastTrips.length > 0 ? (
                        pastTrips.map(trip => (
                            <div key={trip.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                                <div className="w-16 h-16 rounded-xl bg-slate-100 shrink-0 overflow-hidden">
                                    <img src={trip.image} alt="" className="w-full h-full object-cover grayscale opacity-80" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm text-slate-900 truncate">{trip.title}</h4>
                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                        <MapPin size={10} /> {trip.location}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-medium">
                                            {trip.activityType}
                                        </span>
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                            <Clock size={10} /> {t.tripDate} {trip.date}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-slate-400 italic">
                            {t.noTrips}
                        </div>
                    )}
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default GuideProfileModal;