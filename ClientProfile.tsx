import React, { useState } from 'react';
import { Client, BillingInfo, ChatConversation } from '../types';
import ChatInterface from './ChatInterface';
import { MapPin, Calendar, Camera, Activity, Award, Link as LinkIcon, Smartphone, Mountain, Settings, Plus, User, Shield, CreditCard, Save, MessageSquare, Quote, Wallet, Clock, ArrowDownLeft, ArrowUpRight, CheckCircle2, Star } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface Props {
  client: Client;
  chats: ChatConversation[];
  lang: 'it' | 'en';
}

// --- MOCK DATA ---
const mockStravaData = [
  { time: '0h', alt: 1200, hr: 90 },
  { time: '1h', alt: 1600, hr: 135 },
  { time: '2h', alt: 2100, hr: 155 },
  { time: '3h', alt: 2800, hr: 162 },
  { time: '4h', alt: 2200, hr: 120 },
  { time: '5h', alt: 1200, hr: 100 },
];

const mockGallery = [
  'https://images.unsplash.com/photo-1522690984813-f9a882d92176?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1551524559-8af4e6624178?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?q=80&w=600&auto=format&fit=crop',
];

interface ActivityLog {
  id: string | number;
  title: string;
  date: string;
  location: string;
  type: 'guided' | 'personal';
  guideName?: string;
  stats?: string;
}

const initialActivities: ActivityLog[] = [
  { id: 1, title: 'Gran Paradiso Vetta', date: '2023-07-15', guideName: 'Mario Rossi', location: 'Valsavarenche', type: 'guided', stats: '1300m d+' },
  { id: 2, title: 'Corso Ghiaccio Base', date: '2023-02-02', guideName: 'Luca Bianchi', location: 'Cogne', type: 'guided' },
  { id: 3, title: 'Allenamento Sella', date: '2023-11-10', location: 'Dolomiti', type: 'personal', stats: '800m d+' },
];

const ClientProfile: React.FC<Props> = ({ client, chats, lang }) => {
  const [isStravaConnected, setIsStravaConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'journal' | 'media' | 'billing' | 'chat' | 'reviews' | 'payments'>('journal');
  
  // Activity State
  const [activities, setActivities] = useState<ActivityLog[]>(initialActivities);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [newActivity, setNewActivity] = useState({ title: '', date: '', location: '', stats: '' });

  // Billing State
  const [billingInfo, setBillingInfo] = useState<BillingInfo>(client.billingInfo || {
    address: '', city: '', zipCode: '', country: 'Italia', taxId: '', vatNumber: '', sdiCode: ''
  });

  const t = {
    it: {
        tabs: { journal: "Diario", media: "Media", payments: "Spese", reviews: "Feedback", billing: "Dati", chat: "Chat" },
        level: "Livello",
        feedback: "Feedback",
        journalTitle: "Il tuo Diario",
        logActivity: "Registra Attività",
        badges: "Badge Conquistati",
        totalSpent: "Totale Speso",
        toPay: "Da Saldare",
        refunds: "Rimborsi",
        transactions: "Storico Transazioni",
        deposit: "Acconto",
        balance: "Saldo",
        refund: "Rimborso",
        payment: "Pagamento",
        completed: "Completato",
        pending: "In Sospeso",
        failed: "Fallito",
        noTx: "Nessuna transazione trovata.",
        sync: "Sincronizzazione",
        stravaDesc: "Sincronizza automaticamente le tue attività per tenere traccia dei dislivelli e migliorare il tuo Profilo Esperienza.",
        connectStrava: "Connetti Account Strava",
        syncActive: "Sincronizzazione Attiva",
        gallery: "Galleria Fotografica",
        reviewsTitle: "Cosa dicono di te",
        reviewsDesc: "Le recensioni delle Guide Alpine sono basate sulle esperienze condivise in montagna. Costruisci la tua reputazione dimostrando preparazione, rispetto e spirito di adattamento.",
        noReviews: "Non hai ancora ricevuto feedback dalle guide.",
        billingTitle: "Dati di Fatturazione",
        billingDesc: "Questi dati verranno utilizzati dalle Guide Alpine per emettere le fatture automaticamente.",
        address: "Indirizzo di Residenza",
        fiscal: "Dati Fiscali",
        save: "Salva Dati",
        newActTitle: "Nuova Attività Personale",
        cancel: "Annulla",
        saveJournal: "Salva nel Diario"
    },
    en: {
        tabs: { journal: "Journal", media: "Media", payments: "Expenses", reviews: "Feedback", billing: "Info", chat: "Chat" },
        level: "Level",
        feedback: "Feedback",
        journalTitle: "Your Journal",
        logActivity: "Log Activity",
        badges: "Badges Earned",
        totalSpent: "Total Spent",
        toPay: "To Pay",
        refunds: "Refunds",
        transactions: "Transaction History",
        deposit: "Deposit",
        balance: "Balance",
        refund: "Refund",
        payment: "Payment",
        completed: "Completed",
        pending: "Pending",
        failed: "Failed",
        noTx: "No transactions found.",
        sync: "Synchronization",
        stravaDesc: "Automatically sync your activities to track elevation gain and improve your Experience Profile.",
        connectStrava: "Connect Strava Account",
        syncActive: "Sync Active",
        gallery: "Photo Gallery",
        reviewsTitle: "What they say about you",
        reviewsDesc: "Reviews from Alpine Guides are based on shared mountain experiences. Build your reputation by demonstrating preparation, respect, and adaptability.",
        noReviews: "You haven't received feedback from guides yet.",
        billingTitle: "Billing Information",
        billingDesc: "This data will be used by Alpine Guides to issue invoices automatically.",
        address: "Residential Address",
        fiscal: "Fiscal Data",
        save: "Save Data",
        newActTitle: "New Personal Activity",
        cancel: "Cancel",
        saveJournal: "Save to Journal"
    }
  }[lang];

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    const activity: ActivityLog = {
      id: Date.now(),
      title: newActivity.title,
      date: newActivity.date,
      location: newActivity.location,
      stats: newActivity.stats,
      type: 'personal'
    };
    setActivities([activity, ...activities]);
    setShowActivityModal(false);
    setNewActivity({ title: '', date: '', location: '', stats: '' });
  };

  return (
    <div className="space-y-6 md:space-y-10 pb-20 font-sans text-slate-900">
      
      {/* --- HEADER --- */}
      <div className="relative">
        <div className="h-32 md:h-48 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        </div>
        
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center md:items-end -mt-12 md:-mt-16 gap-4 md:gap-6 mb-6">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-white p-1 shadow-2xl shrink-0">
              <img 
                src={`https://ui-avatars.com/api/?name=${client.name}&background=0f172a&color=fff&size=200`} 
                alt={client.name} 
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            
            <div className="flex-1 pb-2 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{client.name}</h1>
              <p className="text-slate-500 font-medium text-sm md:text-base">{client.email}</p>
            </div>

            <div className="flex gap-3 mb-2 shrink-0">
               <div className="bg-white px-3 py-2 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center">
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.level}</span>
                 <span className="font-bold text-slate-900 text-sm">{client.passport.level}</span>
               </div>
               <div className="bg-white px-3 py-2 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center">
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.feedback}</span>
                 <div className="font-bold text-blue-600 flex items-center gap-1 text-sm">
                    <MessageSquare size={14} fill="currentColor" className="text-blue-200" /> {client.reviews.length}
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- NAVIGATION --- */}
      <div className="max-w-5xl mx-auto px-2 md:px-6 sticky top-20 z-10 bg-zinc-50/95 backdrop-blur-sm pt-2">
        <div className="flex justify-between md:justify-start overflow-x-auto no-scrollbar gap-1 border-b border-slate-200">
          {[
            { id: 'journal', label: t.tabs.journal, icon: Calendar },
            { id: 'chat', label: t.tabs.chat, icon: MessageSquare },
            { id: 'media', label: t.tabs.media, icon: Activity },
            { id: 'payments', label: t.tabs.payments, icon: Wallet },
            { id: 'reviews', label: t.tabs.reviews, icon: Star },
            { id: 'billing', label: t.tabs.billing, icon: CreditCard },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-3 py-2 md:px-6 md:py-4 text-[10px] md:text-sm font-semibold transition-all border-b-2 whitespace-nowrap flex-1 md:flex-none ${
                activeTab === tab.id 
                  ? 'border-slate-900 text-slate-900' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <tab.icon size={18} className="md:w-5 md:h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* --- CONTENT --- */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* JOURNAL TAB */}
        {activeTab === 'journal' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg md:text-xl text-slate-900 tracking-tight">{t.journalTitle}</h3>
                <button 
                  onClick={() => setShowActivityModal(true)}
                  className="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs md:text-sm font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 flex items-center gap-2"
                >
                  <Plus size={16} /> {t.logActivity}
                </button>
              </div>

              <div className="space-y-4">
                {activities.map(activity => (
                  <div key={activity.id} className="group bg-white p-4 md:p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-start gap-4">
                    <div className={`p-2 md:p-3 rounded-xl shrink-0 ${activity.type === 'guided' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                      {activity.type === 'guided' ? <Shield size={20} className="md:w-6 md:h-6" /> : <User size={20} className="md:w-6 md:h-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="truncate pr-2">
                          <h4 className="font-bold text-base md:text-lg text-slate-900 group-hover:text-blue-600 transition-colors truncate">{activity.title}</h4>
                          <p className="text-xs md:text-sm text-slate-500 flex items-center gap-2 mt-1 truncate">
                            <MapPin size={12} /> {activity.location} 
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <Calendar size={12} /> {activity.date}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border shrink-0 ${
                          activity.type === 'guided' 
                            ? 'bg-indigo-50 border-indigo-100 text-indigo-600' 
                            : 'bg-amber-50 border-amber-100 text-amber-600'
                        }`}>
                          {activity.type === 'guided' ? 'Guidata' : 'Personale'}
                        </span>
                      </div>
                      
                      <div className="mt-2 md:mt-3 flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm">
                        {activity.guideName && (
                          <span className="text-slate-600 font-medium">Guida: {activity.guideName}</span>
                        )}
                        {activity.stats && (
                          <span className="text-slate-600 font-medium flex items-center gap-1">
                             <Activity size={12} className="text-slate-400" /> {activity.stats}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
               <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl">
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <Award size={20} className="text-yellow-400" /> {t.badges}
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                      {[
                        { icon: '🏔️', name: '4000m Club', active: true },
                        { icon: '❄️', name: 'Ice Master', active: false },
                        { icon: '⛷️', name: 'Skimo Racer', active: false },
                        { icon: '🧗', name: 'Climber', active: true },
                        { icon: '🦅', name: 'Explorer', active: false },
                        { icon: '⛺', name: 'Wild', active: false },
                      ].map((badge, i) => (
                        <div key={i} className={`bg-white/10 p-3 rounded-2xl text-center backdrop-blur-sm border border-white/10 ${badge.active ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                          <div className="text-2xl mb-1">{badge.icon}</div>
                          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-200">{badge.name}</div>
                        </div>
                      ))}
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* CHAT TAB (NEW) */}
        {activeTab === 'chat' && (
            <div className="animate-in fade-in duration-300">
               <ChatInterface 
                  conversations={chats} 
                  currentUserAvatar={`https://ui-avatars.com/api/?name=${client.name}&background=0f172a&color=fff`}
                  lang={lang} 
               />
            </div>
        )}

        {/* PAYMENTS TAB */}
        {activeTab === 'payments' && (
            <div className="space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center md:block gap-4">
                        <div className="flex items-center gap-3 mb-0 md:mb-4 shrink-0">
                            <div className="p-2 md:p-3 bg-green-50 text-green-600 rounded-xl">
                                <Wallet size={20} className="md:w-6 md:h-6" />
                            </div>
                        </div>
                        <div>
                             <span className="text-slate-500 font-bold text-[10px] md:text-sm uppercase tracking-wide">{t.totalSpent}</span>
                             <h3 className="text-xl md:text-3xl font-bold text-slate-900">
                                  €{client.transactions.filter(t => t.status === 'completed' && t.type !== 'refund').reduce((acc, t) => acc + t.amount, 0).toFixed(2)}
                             </h3>
                        </div>
                    </div>

                    <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center md:block gap-4">
                        <div className="flex items-center gap-3 mb-0 md:mb-4 shrink-0">
                            <div className="p-2 md:p-3 bg-orange-50 text-orange-600 rounded-xl">
                                <Clock size={20} className="md:w-6 md:h-6" />
                            </div>
                        </div>
                        <div>
                             <span className="text-slate-500 font-bold text-[10px] md:text-sm uppercase tracking-wide">{t.toPay}</span>
                             <h3 className="text-xl md:text-3xl font-bold text-slate-900">
                                 €{client.transactions.filter(t => t.status === 'pending').reduce((acc, t) => acc + t.amount, 0).toFixed(2)}
                             </h3>
                        </div>
                    </div>

                    <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center md:block gap-4">
                         <div className="flex items-center gap-3 mb-0 md:mb-4 shrink-0">
                            <div className="p-2 md:p-3 bg-purple-50 text-purple-600 rounded-xl">
                                <ArrowDownLeft size={20} className="md:w-6 md:h-6" />
                            </div>
                        </div>
                        <div>
                             <span className="text-slate-500 font-bold text-[10px] md:text-sm uppercase tracking-wide">{t.refunds}</span>
                             <h3 className="text-xl md:text-3xl font-bold text-slate-900">
                                 €{client.transactions.filter(t => t.type === 'refund').reduce((acc, t) => acc + t.amount, 0).toFixed(2)}
                             </h3>
                        </div>
                    </div>
                </div>

                {/* Transactions List */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 md:px-8 md:py-6 border-b border-slate-100">
                        <h3 className="font-bold text-lg text-slate-900">{t.transactions}</h3>
                    </div>
                    
                    {client.transactions.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {client.transactions.map((tx) => (
                                <div key={tx.id} className="p-4 md:p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 ${
                                            tx.type === 'refund' ? 'bg-purple-50 text-purple-600' :
                                            tx.status === 'pending' ? 'bg-orange-50 text-orange-600' :
                                            'bg-green-50 text-green-600'
                                        }`}>
                                            {tx.type === 'refund' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-900 text-sm md:text-base">{tx.tripTitle}</h4>
                                            <p className="text-xs text-slate-500">{tx.description} • {tx.date}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between w-full md:w-auto md:ml-auto gap-4">
                                        <div className="text-right">
                                            <div className={`font-bold text-sm md:text-base ${tx.type === 'refund' ? 'text-purple-600' : 'text-slate-900'}`}>
                                                {tx.type === 'refund' ? '+' : '-'}€{tx.amount}
                                            </div>
                                            <div className="text-[10px] text-slate-400 uppercase font-bold">{tx.method}</div>
                                        </div>
                                        <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                                            tx.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            tx.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            {tx.status === 'completed' ? t.completed : 
                                             tx.status === 'pending' ? t.pending : t.failed}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-slate-500">
                            <Wallet size={32} className="mx-auto mb-3 text-slate-300" />
                            <p>{t.noTx}</p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === 'reviews' && (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                  <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 sticky top-24">
                      <h3 className="font-bold text-blue-900 mb-2">{t.reviewsTitle}</h3>
                      <p className="text-sm text-blue-700 leading-relaxed mb-6">
                         {t.reviewsDesc}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                         <span className="text-4xl font-bold text-blue-900">4.8</span>
                         <div className="flex text-yellow-400">
                            <Star size={20} fill="currentColor" />
                            <Star size={20} fill="currentColor" />
                            <Star size={20} fill="currentColor" />
                            <Star size={20} fill="currentColor" />
                            <Star size={20} fill="currentColor" className="text-blue-200" />
                         </div>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-400">{client.reviews.length} {t.feedback}</span>
                  </div>
              </div>
              <div className="md:col-span-2 space-y-4">
                  {client.reviews.length > 0 ? (
                      client.reviews.map(review => (
                          <div key={review.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative">
                              <Quote className="absolute top-6 right-6 text-slate-100" size={40} />
                              <div className="flex items-center gap-3 mb-4">
                                  <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                                     <img src={`https://ui-avatars.com/api/?name=${review.authorName}&background=random`} alt={review.authorName} />
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-slate-900 text-sm">{review.authorName}</h4>
                                      <div className="flex text-yellow-400 text-xs">
                                          {[...Array(5)].map((_, i) => (
                                              <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i >= review.rating ? "text-slate-200" : ""} />
                                          ))}
                                      </div>
                                  </div>
                                  <span className="ml-auto text-xs text-slate-400">{review.date}</span>
                              </div>
                              <p className="text-slate-600 text-sm italic leading-relaxed relative z-10">
                                  "{review.comment}"
                              </p>
                          </div>
                      ))
                  ) : (
                      <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                          <p className="text-slate-400">{t.noReviews}</p>
                      </div>
                  )}
              </div>
           </div>
        )}

        {/* BILLING TAB */}
        {activeTab === 'billing' && (
           <div className="max-w-2xl mx-auto">
               <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                   <div className="bg-slate-900 p-6 text-white">
                       <h3 className="font-bold text-lg flex items-center gap-2">
                           <CreditCard size={20} /> {t.billingTitle}
                       </h3>
                       <p className="text-slate-400 text-sm mt-1">{t.billingDesc}</p>
                   </div>
                   <div className="p-6 md:p-8 space-y-6">
                       <div>
                           <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">{t.address}</h4>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div className="md:col-span-2">
                                   <label className="block text-sm font-bold text-slate-700 mb-1">Indirizzo</label>
                                   <input 
                                     type="text" 
                                     value={billingInfo.address} 
                                     onChange={(e) => setBillingInfo({...billingInfo, address: e.target.value})}
                                     className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                                   />
                               </div>
                               <div>
                                   <label className="block text-sm font-bold text-slate-700 mb-1">Città</label>
                                   <input 
                                     type="text" 
                                     value={billingInfo.city} 
                                     onChange={(e) => setBillingInfo({...billingInfo, city: e.target.value})}
                                     className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                                   />
                               </div>
                               <div>
                                   <label className="block text-sm font-bold text-slate-700 mb-1">CAP</label>
                                   <input 
                                     type="text" 
                                     value={billingInfo.zipCode} 
                                     onChange={(e) => setBillingInfo({...billingInfo, zipCode: e.target.value})}
                                     className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                                   />
                               </div>
                           </div>
                       </div>

                       <div>
                           <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">{t.fiscal}</h4>
                           <div className="space-y-4">
                               <div>
                                   <label className="block text-sm font-bold text-slate-700 mb-1">Codice Fiscale</label>
                                   <input 
                                     type="text" 
                                     value={billingInfo.taxId} 
                                     onChange={(e) => setBillingInfo({...billingInfo, taxId: e.target.value})}
                                     className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none transition-all uppercase"
                                   />
                               </div>
                               <div>
                                   <label className="block text-sm font-bold text-slate-700 mb-1">Partita IVA (Opzionale)</label>
                                   <input 
                                     type="text" 
                                     value={billingInfo.vatNumber} 
                                     onChange={(e) => setBillingInfo({...billingInfo, vatNumber: e.target.value})}
                                     className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                                   />
                               </div>
                               <div>
                                   <label className="block text-sm font-bold text-slate-700 mb-1">Codice SDI (Opzionale)</label>
                                   <input 
                                     type="text" 
                                     value={billingInfo.sdiCode} 
                                     onChange={(e) => setBillingInfo({...billingInfo, sdiCode: e.target.value})}
                                     className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none transition-all uppercase"
                                   />
                               </div>
                           </div>
                       </div>

                       <div className="pt-4 flex justify-end">
                           <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center gap-2">
                               <Save size={18} /> {t.save}
                           </button>
                       </div>
                   </div>
               </div>
           </div>
        )}

        {/* MEDIA/SYNC TAB */}
        {activeTab === 'media' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-orange-50 p-6 md:p-8 rounded-3xl border border-orange-100">
                   <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
                       <Activity size={24} />
                   </div>
                   <h3 className="font-bold text-xl text-orange-900 mb-2">{t.sync}</h3>
                   <p className="text-orange-800/70 text-sm mb-8 leading-relaxed">
                       {t.stravaDesc}
                   </p>
                   
                   {!isStravaConnected ? (
                       <button 
                         onClick={() => setIsStravaConnected(true)}
                         className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
                       >
                           <LinkIcon size={18} /> {t.connectStrava}
                       </button>
                   ) : (
                       <div className="bg-white p-4 rounded-xl border border-orange-100 flex items-center justify-between">
                           <span className="font-bold text-orange-600 flex items-center gap-2">
                               <CheckCircle2 size={18} /> {t.syncActive}
                           </span>
                           <button onClick={() => setIsStravaConnected(false)} className="text-xs text-slate-400 hover:text-slate-600">Disconnetti</button>
                       </div>
                   )}
               </div>

               <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
                   <h3 className="font-bold text-xl text-slate-900 mb-6 flex items-center gap-2">
                       <Camera size={24} className="text-purple-500" /> {t.gallery}
                   </h3>
                   <div className="grid grid-cols-2 gap-3">
                       {mockGallery.map((src, i) => (
                           <div key={i} className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                               <img src={src} alt="Gallery" className="w-full h-full object-cover" />
                           </div>
                       ))}
                       <button className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all">
                           <Plus size={32} />
                       </button>
                   </div>
               </div>
           </div>
        )}
      </div>

      {/* ACTIVITY MODAL */}
      {showActivityModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                  <h3 className="font-bold text-lg mb-4">{t.newActTitle}</h3>
                  <form onSubmit={handleSaveActivity} className="space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Titolo</label>
                          <input required type="text" className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-900" value={newActivity.title} onChange={e => setNewActivity({...newActivity, title: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-1">Data</label>
                              <input required type="date" className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-900" value={newActivity.date} onChange={e => setNewActivity({...newActivity, date: e.target.value})} />
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-1">Luogo</label>
                              <input required type="text" className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-900" value={newActivity.location} onChange={e => setNewActivity({...newActivity, location: e.target.value})} />
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Statistiche (opzionale)</label>
                          <input type="text" placeholder="es. 1200m d+, 5h" className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-900" value={newActivity.stats} onChange={e => setNewActivity({...newActivity, stats: e.target.value})} />
                      </div>
                      <div className="flex gap-3 pt-4">
                          <button type="button" onClick={() => setShowActivityModal(false)} className="flex-1 py-2 border border-slate-200 rounded-lg font-bold text-slate-600">{t.cancel}</button>
                          <button type="submit" className="flex-1 py-2 bg-slate-900 text-white rounded-lg font-bold">{t.saveJournal}</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default ClientProfile;