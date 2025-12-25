import React, { useState, useEffect } from 'react';
import { Trip, Client, Guide, Coordinates, ChatConversation } from '../types';
import CreateTripForm from './CreateTripForm';
import SportsPassportModal from './SportsPassportModal';
import TripDetailsModal from './TripDetailsModal';
import ChatInterface from './ChatInterface';
import { Plus, Users, Calendar as CalendarIcon, Wallet, ChevronRight, Clock, BarChart3, UserCog, ScrollText, CheckCircle, Upload, Save, TrendingUp, FileText, Mountain, ChevronLeft, MapPin, X, AlertCircle, Map as MapIcon, Globe, Trophy, Timer, History, MessageSquare, Shield, PieChart as PieChartIcon, LineChart, FileCheck, XCircle, AlertTriangle, Download, Filter, Ban } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell, PieChart, Pie, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Line, ComposedChart } from 'recharts';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, isWithinInterval, parseISO, isBefore, startOfDay } from 'date-fns';
import { it, enUS } from 'date-fns/locale';
import { fetchWeatherForecast, getWeatherIcon, WeatherData } from '../services/weatherService';

interface Props {
  trips: Trip[];
  onAddTrip: (trip: Trip) => void;
  onApproveRequest: (tripId: string, client: Client) => void;
  guide: Guide;
  chats: ChatConversation[];
  lang: 'it' | 'en';
}

interface CalendarEvent {
    date: string;
    type: 'pending' | 'confirmed';
    client: string;
    tripTitle: string;
    coords: Coordinates;
    location: string;
}

// Mock Data for Market Analytics Section
const MOCK_MARKET_STATS = {
    trends: [
        { activity: 'Sci Alp.', demand: 92, marketAvg: 75 },
        { activity: 'Alpin.', demand: 68, marketAvg: 60 },
        { activity: 'Arram.', demand: 55, marketAvg: 50 },
        { activity: 'Freeride', demand: 80, marketAvg: 70 },
        { activity: 'Ghiac.', demand: 45, marketAvg: 30 }
    ],
    priceComparison: [
        { activity: 'Sci Alp.', myPrice: 350, avgPrice: 320 },
        { activity: 'Alpin.', myPrice: 450, avgPrice: 400 },
        { activity: 'Arram.', myPrice: 360, avgPrice: 300 },
        { activity: 'Freeride', myPrice: 350, avgPrice: 340 }
    ]
};

const GuideCalendar = ({ trips, lang }: { trips: Trip[], lang: 'it' | 'en' }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [weatherMap, setWeatherMap] = useState<Record<string, WeatherData>>({});
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  
  const locale = lang === 'it' ? it : enUS;

  const t = {
    it: {
        calendar: "Calendario Uscite",
        pending: "In Attesa",
        confirmed: "Confermate",
        client: "Cliente",
        activity: "Attività",
        weather: "Meteo Previsto",
        avg: "Media",
        weatherWarn: "Prevista pioggia/neve. Controlla l'equipaggiamento impermeabile.",
        weatherSafe: "Condizioni stabili. Ricorda occhiali da sole e protezione solare.",
        noWeather: "Meteo non disponibile (data troppo lontana o passata).",
        days: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']
    },
    en: {
        calendar: "Trip Calendar",
        pending: "Pending",
        confirmed: "Confirmed",
        client: "Client",
        activity: "Activity",
        weather: "Forecast",
        avg: "Avg",
        weatherWarn: "Rain/Snow expected. Check waterproof gear.",
        weatherSafe: "Stable conditions. Remember sunglasses and sunscreen.",
        noWeather: "Weather unavailable (date too far or past).",
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    }
  }[lang];

  const events: CalendarEvent[] = trips.flatMap(trip => {
     const pending = trip.pendingRequests
       .filter(c => c.requestedDate)
       .map(c => ({ 
           date: c.requestedDate!, 
           type: 'pending' as const, 
           client: c.name, 
           tripTitle: trip.title, 
           location: trip.location,
           coords: trip.coordinates 
       }));
     
     const confirmed = trip.enrolledClients
       .filter(c => c.requestedDate)
       .map(c => ({ 
           date: c.requestedDate!, 
           type: 'confirmed' as const, 
           client: c.name, 
           tripTitle: trip.title, 
           location: trip.location,
           coords: trip.coordinates 
       }));

     return [...pending, ...confirmed];
  });

  useEffect(() => {
     const loadWeather = async () => {
        const newWeatherMap: Record<string, WeatherData> = {};
        for (const event of events) {
           const key = `${event.date}-${event.tripTitle}`;
           if (!weatherMap[key]) {
              const w = await fetchWeatherForecast(event.coords.lat, event.coords.lng, event.date);
              if (w) newWeatherMap[key] = w;
           }
        }
        if (Object.keys(newWeatherMap).length > 0) {
           setWeatherMap(prev => ({ ...prev, ...newWeatherMap }));
        }
     };
     loadWeather();
  }, [currentMonth, trips]);

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayEvents = events.filter(e => e.date === dateStr);
        const isCurrentMonth = isSameMonth(day, monthStart);

        days.push(
          <div key={day.toString()} className={`min-h-[120px] border border-slate-100 p-2 relative flex flex-col ${!isCurrentMonth ? 'bg-slate-50/50' : 'bg-white'}`}>
            <span className={`text-xs font-bold ${isSameDay(day, new Date()) ? 'bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-full' : 'text-slate-400'}`}>
              {format(day, 'd')}
            </span>
            
            <div className="mt-2 space-y-1.5 flex-1 overflow-y-auto max-h-[100px] no-scrollbar">
              {dayEvents.map((evt, idx) => {
                 const weather = weatherMap[`${evt.date}-${evt.tripTitle}`];
                 const WeatherIcon = weather ? getWeatherIcon(weather.weatherCode).icon : null;
                 const wColor = weather ? getWeatherIcon(weather.weatherCode).color : '';
                 
                 return (
                  <button 
                    key={idx} 
                    onClick={() => setSelectedEvent(evt)}
                    className={`w-full p-1.5 rounded-lg text-[10px] border flex items-center justify-between group relative transition-all hover:shadow-md cursor-pointer text-left ${evt.type === 'confirmed' ? 'bg-green-50 border-green-100 text-green-800 hover:bg-green-100' : 'bg-orange-50 border-orange-100 text-orange-800 hover:bg-orange-100'}`}
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-bold block truncate">{evt.client}</span>
                      <span className="opacity-75 block truncate">{evt.tripTitle}</span>
                    </div>
                    
                    {weather && WeatherIcon && (
                       <div className={`ml-1 flex flex-col items-center justify-center bg-white/50 rounded p-0.5 px-1 min-w-[20px]`}>
                          <div className={wColor}><WeatherIcon size={10} /></div>
                       </div>
                    )}
                  </button>
                 )
              })}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div key={day.toString()} className="grid grid-cols-7 min-w-[600px] md:min-w-0">{days}</div>);
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
       <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
             <CalendarIcon size={18} /> {t.calendar}
          </h3>
          <div className="flex items-center gap-4">
             <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft size={20} /></button>
             <span className="font-bold capitalize">{format(currentMonth, 'MMMM yyyy', { locale })}</span>
             <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight size={20} /></button>
          </div>
       </div>
       
       <div className="overflow-x-auto">
         <div className="min-w-[600px] md:min-w-0">
            <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-100">
                {t.days.map(d => (
                <div key={d} className="py-2 text-center text-xs font-bold text-slate-400 uppercase">{d}</div>
                ))}
            </div>
            {renderCells()}
         </div>
       </div>

       {selectedEvent && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className={`p-4 text-white flex justify-between items-start ${selectedEvent.type === 'confirmed' ? 'bg-green-600' : 'bg-orange-500'}`}>
                    <div>
                        <h4 className="font-bold text-lg">{selectedEvent.type === 'confirmed' ? t.confirmed : t.pending}</h4>
                        <p className="text-white/80 text-xs flex items-center gap-1"><CalendarIcon size={12}/> {format(new Date(selectedEvent.date), 'd MMMM yyyy', {locale})}</p>
                    </div>
                    <button onClick={() => setSelectedEvent(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X size={18}/></button>
                </div>
                <div className="p-5 space-y-4">
                    <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.client}</span>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">{selectedEvent.client.charAt(0)}</div>
                            <span className="font-bold text-slate-900">{selectedEvent.client}</span>
                        </div>
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.activity}</span>
                        <h5 className="font-bold text-slate-800">{selectedEvent.tripTitle}</h5>
                        <p className="text-sm text-slate-500 flex items-center gap-1"><MapPin size={14}/> {selectedEvent.location}</p>
                    </div>
                    
                    {weatherMap[`${selectedEvent.date}-${selectedEvent.tripTitle}`] ? (
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 mt-2">
                             {(() => {
                                 const w = weatherMap[`${selectedEvent.date}-${selectedEvent.tripTitle}`];
                                 const WIcon = getWeatherIcon(w.weatherCode).icon;
                                 return (
                                     <div className="flex items-center justify-between">
                                         <div>
                                             <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">{t.weather}</div>
                                             <div className="font-bold text-blue-900 flex items-center gap-2">
                                                 <WIcon size={20} /> {getWeatherIcon(w.weatherCode).label}
                                             </div>
                                             <div className="text-sm text-blue-700 mt-1">
                                                Min: <b>{w.minTemp}°</b>  Max: <b>{w.maxTemp}°</b>
                                             </div>
                                         </div>
                                         <div className="text-center">
                                             <div className="text-3xl font-bold text-blue-600">{Math.round((w.minTemp + w.maxTemp)/2)}°</div>
                                             <div className="text-[10px] text-blue-400">{t.avg}</div>
                                         </div>
                                     </div>
                                 )
                             })()}
                             <div className="mt-3 pt-3 border-t border-blue-100 flex gap-2 text-xs text-blue-700 items-start">
                                <AlertCircle size={14} className="shrink-0 mt-0.5"/>
                                <span>
                                    {weatherMap[`${selectedEvent.date}-${selectedEvent.tripTitle}`].weatherCode > 50 
                                     ? t.weatherWarn 
                                     : t.weatherSafe}
                                </span>
                             </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center text-slate-400 text-xs italic">
                            {t.noWeather}
                        </div>
                    )}
                </div>
             </div>
          </div>
       )}
    </div>
  );
};

const Dashboard: React.FC<Props> = ({ trips, onAddTrip, onApproveRequest, guide, chats, lang }) => {
  const [activeTab, setActiveTab] = useState<'activities' | 'calendar' | 'analytics' | 'chat' | 'reputation' | 'profile'>('activities');
  const [showForm, setShowForm] = useState(false);
  const [selectedClientForReview, setSelectedClientForReview] = useState<{client: Client, tripId: string} | null>(null);
  const [activityFilter, setActivityFilter] = useState<'all' | 'upcoming' | 'requests' | 'completed'>('all');
  const [viewDetailsTrip, setViewDetailsTrip] = useState<Trip | null>(null);

  const t = {
    it: {
        tabs: { activities: "Attività", calendar: "Calendario", analytics: "Analytics", chat: "Chat", reputation: "Storico & Pagamenti", profile: "Profilo" },
        kpi: { next: "Prossime", pending: "Richieste", earn: "Guadagni" }, 
        manageTitle: "Gestione Uscite",
        newActivity: "Nuova Attività",
        noActivities: "Nessuna attività programmata.",
        noFilteredActivities: "Nessuna attività trovata per questo filtro.",
        available: "Disponibile",
        notAvailable: "Non Disponibile",
        participants: "Partecipanti",
        freeSpots: "Posti Liberi",
        waiting: "In attesa",
        manage: "Gestisci",
        incomingReq: "Richiesta in arrivo",
        wantsJoin: "Vuole unirsi al gruppo",
        checkPassport: "Verifica Esperienza",
        noReq: "Nessuna nuova richiesta.",
        confirmed: "Confermate",
        annualEarn: "Fatturato Annuo Corrente",
        monthTrend: "Andamento Finanziario",
        marketTrend: "Provenienza Clienti",
        profileTitle: "Dati Personali",
        save: "Salva Modifiche",
        name: "Nome Completo",
        phone: "Telefono",
        cert: "Certificazioni & Albo",
        certSub: "Verifica Professionale",
        certDesc: "Il numero di iscrizione all'albo è obbligatorio per esercitare. Viene verificato automaticamente con il collegio nazionale.",
        alboNum: "Numero Iscrizione Albo",
        bio: "Bio & Esperienza",
        msgProfileUp: "Profilo aggiornato con successo! I dati dell'albo verranno verificati.",
        // Reputation / History
        repTitle: "Storico & Feedback",
        historyTitle: "Storico Gite",
        reviewsTitle: "Feedback Clienti",
        noPastTrips: "Nessuna gita conclusa.",
        noReviews: "Non hai ancora ricevuto recensioni.",
        status: "Stato",
        payment: "Pagamento",
        invoice: "Genera Fattura",
        completed: "Completata",
        cancelled: "Annullata",
        upcoming: "Prenotata",
        paid: "Saldato",
        deposit: "Acconto",
        pending: "In Attesa",
        filterActive: "Filtro Attivo",
        resetFilter: "Mostra Tutto",
        // Analytics Specifics
        analytics: {
            revenueMonth: "Ricavo Medio/Mese",
            avgAge: "Età Media Clienti",
            retention: "Tasso di Ritorno",
            topRegion: "Top Regione",
            seasonality: "Stagionalità (Uscite)",
            demographics: "Fasce d'Età",
            performance: "Performance Attività",
            radarKey: ["Richiesta", "Guadagno", "Soddisfazione"],
            sections: {
                personal: "Le Tue Performance",
                market: "Analisi di Mercato (Benchmark)",
                marketPrice: "Confronto Prezzi vs Mercato",
                marketTrend: "Trend di Mercato"
            }
        }
    },
    en: {
        tabs: { activities: "Activities", calendar: "Calendar", analytics: "Analytics", chat: "Chat", reputation: "History & Payments", profile: "Profile" },
        kpi: { next: "Upcoming", pending: "Requests", earn: "Earnings" },
        manageTitle: "Manage Trips",
        newActivity: "New Activity",
        noActivities: "No activities scheduled.",
        noFilteredActivities: "No activities found for this filter.",
        available: "Available",
        notAvailable: "Not Available",
        participants: "Participants",
        freeSpots: "Free Spots",
        waiting: "Waiting",
        manage: "Manage",
        incomingReq: "Incoming Request",
        wantsJoin: "Wants to join group",
        checkPassport: "Check Experience",
        noReq: "No new requests.",
        confirmed: "Confirmed",
        annualEarn: "Current Annual Revenue",
        monthTrend: "Financial Trend",
        marketTrend: "Client Origins",
        profileTitle: "Personal Data",
        save: "Save Changes",
        name: "Full Name",
        phone: "Phone",
        cert: "Certifications & Registry",
        certSub: "Professional Verification",
        certDesc: "Registry number is mandatory to practice. It is automatically verified with the national board.",
        alboNum: "Registry Number",
        bio: "Bio & Experience",
        msgProfileUp: "Profile updated successfully! Registry data will be verified.",
        // Reputation / History
        repTitle: "History & Feedback",
        historyTitle: "Trip History",
        reviewsTitle: "Client Feedback",
        noPastTrips: "No completed trips.",
        noReviews: "No reviews received yet.",
        status: "Status",
        payment: "Payment",
        invoice: "Generate Invoice",
        completed: "Completed",
        cancelled: "Cancelled",
        upcoming: "Booked",
        paid: "Paid",
        deposit: "Deposit",
        pending: "Pending",
        filterActive: "Filter Active",
        resetFilter: "Show All",
        // Analytics Specifics
        analytics: {
            revenueMonth: "Avg Rev/Month",
            avgAge: "Avg Client Age",
            retention: "Retention Rate",
            topRegion: "Top Region",
            seasonality: "Seasonality (Trips)",
            demographics: "Age Groups",
            performance: "Activity Performance",
            radarKey: ["Demand", "Revenue", "Satisfaction"],
            sections: {
                personal: "Your Performance",
                market: "Market Analysis (Benchmark)",
                marketPrice: "Price Comparison vs Market",
                marketTrend: "Market Trends"
            }
        }
    }
  }[lang];

  // Logic for Past Trips
  const today = startOfDay(new Date());
  // Show trips that are marked as completed/cancelled OR are in the past
  const pastTrips = trips.filter(trip => {
      if (trip.status === 'completed' || trip.status === 'cancelled') return true;
      return isBefore(parseISO(trip.date), today);
  }).sort((a,b) => b.date.localeCompare(a.date));

  const totalEarnings = trips.reduce((acc, t) => acc + (t.price * t.enrolledClients.length), 0);
  const pendingRequestsCount = trips.reduce((acc, t) => acc + t.pendingRequests.length, 0);

  // Filter Logic
  const filteredTrips = trips.filter(trip => {
      if (activityFilter === 'all') return true; // In 'all' mode, we show everything (Catalog view)
      if (activityFilter === 'upcoming') {
        // Only show upcoming trips that have enrolled clients
        return trip.status === 'upcoming' && trip.enrolledClients.length > 0;
      }
      if (activityFilter === 'requests') return trip.pendingRequests.length > 0;
      if (activityFilter === 'completed') return trip.status === 'completed';
      return true;
  });

  // KPI Logic: Upcoming count reflects booked trips
  const upcomingCount = trips.filter(t => t.status === 'upcoming' && t.enrolledClients.length > 0).length;

  // Analytics Calculations
  const avgMonthlyRevenue = Math.round(totalEarnings / 12); // Approximate
  const retentionRate = 18; // Fake data
  const topRegionName = guide.clientOrigins.sort((a,b) => b.count - a.count)[0]?.region || '-';
  const averageClientAge = 34; // Derived from demographics in real app

  // Helper to determine availability based on date range (Catalog Logic)
  const getCatalogStatus = (trip: Trip) => {
    const from = parseISO(trip.availableFrom);
    const to = parseISO(trip.availableTo);
    const isAvailable = isWithinInterval(today, { start: from, end: to });
    return {
        label: isAvailable ? t.available : t.notAvailable,
        color: isAvailable ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500',
        icon: isAvailable ? CheckCircle : Ban
    };
  };

  if (showForm) {
    return <CreateTripForm onSave={(trip) => { onAddTrip(trip); setShowForm(false); }} onCancel={() => setShowForm(false)} lang={lang} />;
  }

  const handleProfileUpdate = (e: React.FormEvent) => {
      e.preventDefault();
      alert(t.msgProfileUp);
  }

  const handleGenerateInvoice = (trip: Trip) => {
      alert(`Fattura generata per la gita: ${trip.title}\nTotale: €${trip.price * trip.enrolledClients.length}`);
  };

  // Colors for Demographics Pie Chart
  const DEMO_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6'];

  return (
    <div className="space-y-6 md:space-y-8 pb-20">
      
      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl p-1.5 md:p-2 shadow-sm border border-slate-100 flex overflow-x-auto no-scrollbar">
        {[
            { id: 'activities', label: t.tabs.activities, icon: Mountain },
            { id: 'calendar', label: t.tabs.calendar, icon: CalendarIcon },
            { id: 'analytics', label: t.tabs.analytics, icon: BarChart3 },
            { id: 'chat', label: t.tabs.chat, icon: MessageSquare },
            { id: 'reputation', label: t.tabs.reputation, icon: History }, 
            { id: 'profile', label: t.tabs.profile, icon: UserCog },
        ].map((tab) => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 py-2 md:py-3 px-2 md:px-4 rounded-xl text-[10px] md:text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.id 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
            >
                <tab.icon size={18} className="md:w-5 md:h-5" />
                <span>{tab.label}</span>
            </button>
        ))}
      </div>

      {/* --- TAB: ACTIVITIES --- */}
      {activeTab === 'activities' && (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
            {/* KPI Stats - CLICKABLE FILTERS */}
            <div className="grid grid-cols-3 gap-2 md:gap-6">
                <div 
                    onClick={() => setActivityFilter(activityFilter === 'upcoming' ? 'all' : 'upcoming')}
                    className={`bg-white p-2 md:p-6 rounded-xl md:rounded-2xl shadow-sm border flex flex-col md:flex-row items-center md:items-start text-center md:text-left cursor-pointer transition-all hover:shadow-md ${activityFilter === 'upcoming' ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/30' : 'border-slate-100'}`}
                >
                    <div className="p-2 md:p-3 bg-blue-50 text-blue-600 rounded-lg md:rounded-xl mb-1 md:mb-0 md:mr-4 shrink-0">
                       <CalendarIcon size={16} className="md:w-6 md:h-6" />
                    </div>
                    <div>
                       <p className="text-[10px] md:text-sm text-slate-500 font-medium uppercase tracking-tight">{t.kpi.next}</p>
                       <h3 className="text-sm md:text-2xl font-bold text-slate-900">{upcomingCount}</h3>
                    </div>
                </div>
                
                <div 
                    onClick={() => setActivityFilter(activityFilter === 'requests' ? 'all' : 'requests')}
                    className={`bg-white p-2 md:p-6 rounded-xl md:rounded-2xl shadow-sm border flex flex-col md:flex-row items-center md:items-start text-center md:text-left cursor-pointer transition-all hover:shadow-md ${activityFilter === 'requests' ? 'border-orange-500 ring-2 ring-orange-500/20 bg-orange-50/30' : 'border-slate-100'}`}
                >
                    <div className="p-2 md:p-3 bg-orange-50 text-orange-600 rounded-lg md:rounded-xl mb-1 md:mb-0 md:mr-4 shrink-0">
                       <Users size={16} className="md:w-6 md:h-6" />
                    </div>
                    <div>
                       <p className="text-[10px] md:text-sm text-slate-500 font-medium uppercase tracking-tight">{t.kpi.pending}</p>
                       <h3 className="text-sm md:text-2xl font-bold text-slate-900">{pendingRequestsCount}</h3>
                    </div>
                </div>

                <div 
                    onClick={() => setActivityFilter(activityFilter === 'completed' ? 'all' : 'completed')}
                    className={`bg-white p-2 md:p-6 rounded-xl md:rounded-2xl shadow-sm border flex flex-col md:flex-row items-center md:items-start text-center md:text-left cursor-pointer transition-all hover:shadow-md ${activityFilter === 'completed' ? 'border-green-500 ring-2 ring-green-500/20 bg-green-50/30' : 'border-slate-100'}`}
                >
                    <div className="p-2 md:p-3 bg-green-50 text-green-600 rounded-lg md:rounded-xl mb-1 md:mb-0 md:mr-4 shrink-0">
                       <Wallet size={16} className="md:w-6 md:h-6" />
                    </div>
                    <div>
                       <p className="text-[10px] md:text-sm text-slate-500 font-medium uppercase tracking-tight">{t.kpi.earn}</p>
                       <h3 className="text-sm md:text-2xl font-bold text-slate-900">€{totalEarnings}</h3>
                    </div>
                </div>
            </div>

            {/* Activities Management */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg md:text-xl font-bold text-slate-800">{t.manageTitle}</h2>
                        {activityFilter !== 'all' && (
                            <div className="flex items-center gap-2">
                                <span className="hidden md:inline text-slate-300">|</span>
                                <span className="text-xs font-bold text-blue-600 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md">
                                    <Filter size={12}/> {t.filterActive}: 
                                    {activityFilter === 'upcoming' ? t.kpi.next : activityFilter === 'requests' ? t.kpi.pending : t.completed}
                                </span>
                                <button onClick={() => setActivityFilter('all')} className="text-xs text-slate-400 hover:text-slate-600 underline">
                                    {t.resetFilter}
                                </button>
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={() => setShowForm(true)}
                        className="bg-slate-900 text-white px-3 py-2 md:px-4 md:py-2.5 rounded-xl font-bold text-xs md:text-sm hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 flex items-center gap-2"
                    >
                        <Plus size={18} /> <span className="hidden sm:inline">{t.newActivity}</span>
                    </button>
                </div>
                
                {filteredTrips.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        <Mountain size={48} className="mx-auto mb-4 text-slate-200" />
                        <p>{activityFilter === 'all' ? t.noActivities : t.noFilteredActivities}</p>
                        {activityFilter !== 'all' && (
                             <button onClick={() => setActivityFilter('all')} className="mt-2 text-sm text-blue-600 font-bold hover:underline">
                                {t.resetFilter}
                             </button>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredTrips.map(trip => {
                            // Calculate Display Status based on Filter Mode
                            let statusBadge;
                            if (activityFilter === 'all') {
                                const status = getCatalogStatus(trip);
                                statusBadge = (
                                    <span className={`mt-2 md:mt-0 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1 ${status.color}`}>
                                        <status.icon size={12} /> {status.label}
                                    </span>
                                );
                            } else if (activityFilter === 'upcoming') {
                                statusBadge = (
                                    <span className="mt-2 md:mt-0 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-blue-100 text-blue-700 flex items-center gap-1">
                                        <CheckCircle size={12} /> {t.upcoming}
                                    </span>
                                );
                            } else {
                                // Default/Previous logic for other tabs
                                statusBadge = (
                                    <span className={`mt-2 md:mt-0 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${trip.status === 'completed' ? 'bg-green-100 text-green-700' : trip.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                        {trip.status === 'completed' ? t.completed : trip.status === 'cancelled' ? t.cancelled : t.available}
                                    </span>
                                );
                            }

                            return (
                                <div 
                                    key={trip.id} 
                                    className="p-4 md:p-6 hover:bg-slate-50 transition-colors group cursor-pointer"
                                    onClick={() => setViewDetailsTrip(trip)}
                                >
                                    <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                                        <div className="w-full md:w-32 h-32 rounded-xl overflow-hidden shrink-0 relative">
                                            <img src={trip.image} alt={trip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wide text-slate-800">
                                                {trip.activityType}
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1">
                                            <div className="flex flex-col md:flex-row justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{trip.title}</h3>
                                                    <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-1 text-sm text-slate-500">
                                                        <span className="flex items-center gap-1">
                                                            <CalendarIcon size={14}/> 
                                                            {format(parseISO(trip.availableFrom), 'd MMM')} - {format(parseISO(trip.availableTo), 'd MMM yyyy')}
                                                        </span>
                                                        <span className="flex items-center gap-1"><MapPin size={14}/> {trip.location}</span>
                                                        <span className="flex items-center gap-1 font-bold text-slate-700">€{trip.price}</span>
                                                    </div>
                                                </div>
                                                {statusBadge}
                                            </div>

                                            {/* Participants / Availability - Only show in 'Upcoming' or if needed */}
                                            {activityFilter === 'upcoming' && (
                                                <div className="mt-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex -space-x-2">
                                                            {trip.enrolledClients.slice(0,3).map((client, i) => (
                                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                                    {client.name.charAt(0)}
                                                                </div>
                                                            ))}
                                                            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">
                                                                +{Math.max(0, trip.maxParticipants - trip.enrolledClients.length)}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm text-slate-700 font-bold">
                                                                {trip.enrolledClients.length}/{trip.maxParticipants} {t.participants}
                                                            </span>
                                                            <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                                {Math.max(0, trip.maxParticipants - trip.enrolledClients.length)} {t.freeSpots}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* PENDING REQUESTS SECTION - Only show in 'Requests' mode */}
                                            {activityFilter === 'requests' && trip.pendingRequests.length > 0 && (
                                                <div className="mt-4 bg-orange-50 border border-orange-100 rounded-xl p-3 md:p-4 animate-in slide-in-from-top-2">
                                                    <h4 className="text-sm font-bold text-orange-800 mb-3 flex items-center gap-2">
                                                        <AlertCircle size={16} /> {t.incomingReq} ({trip.pendingRequests.length})
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {trip.pendingRequests.map(client => (
                                                            <div key={client.id} className="bg-white p-3 rounded-lg border border-orange-100 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                                                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                                                                        {client.name.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold text-slate-900">{client.name}</div>
                                                                        <div className="text-xs text-slate-500">{t.wantsJoin}: <span className="font-semibold text-orange-600">{client.requestedDate || trip.date}</span></div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-2 w-full sm:w-auto">
                                                                    <button 
                                                                        onClick={(e) => { e.stopPropagation(); setSelectedClientForReview({client, tripId: trip.id}); }}
                                                                        className="flex-1 sm:flex-none px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                                                                    >
                                                                        {t.checkPassport}
                                                                    </button>
                                                                    <button 
                                                                        onClick={(e) => { e.stopPropagation(); onApproveRequest(trip.id, client); }}
                                                                        className="flex-1 sm:flex-none px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors shadow-md"
                                                                    >
                                                                        Accetta
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
      )}

      {/* --- TAB: CALENDAR --- */}
      {activeTab === 'calendar' && (
        <div className="animate-in fade-in duration-300">
           <GuideCalendar trips={trips} lang={lang} />
        </div>
      )}

      {/* --- TAB: ANALYTICS (SPLIT SECTIONS) --- */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-in fade-in duration-300">
           
           {/* SECTION 1: PERSONAL BUSINESS */}
           <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <TrendingUp size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">{t.analytics.sections.personal}</h2>
                </div>

                {/* Top KPI Cards (Personal) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100">
                            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wide truncate">{t.annualEarn}</p>
                            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mt-1">€{totalEarnings}</h3>
                            <div className="text-[10px] md:text-xs text-green-600 font-bold mt-1 flex items-center gap-1">
                                <TrendingUp size={12} /> +12%
                            </div>
                        </div>
                        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100">
                            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wide truncate">{t.analytics.revenueMonth}</p>
                            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mt-1">€{avgMonthlyRevenue}</h3>
                        </div>
                        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100">
                            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wide truncate">{t.analytics.avgAge}</p>
                            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mt-1">{averageClientAge}</h3>
                        </div>
                        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100">
                            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wide truncate">{t.analytics.topRegion}</p>
                            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mt-1 truncate">{topRegionName}</h3>
                        </div>
                </div>

                {/* Personal Charts */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Revenue Chart */}
                    <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm min-h-[300px]">
                        <h3 className="font-bold text-slate-800 mb-6">{t.monthTrend}</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={guide.earningsHistory}>
                                <defs>
                                    <linearGradient id="colorEarn" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                <Area type="monotone" dataKey="amount" stroke="#0f172a" strokeWidth={3} fillOpacity={1} fill="url(#colorEarn)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Activity Performance (Radar) */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm min-h-[300px]">
                        <h3 className="font-bold text-slate-800 mb-2">{t.analytics.performance}</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <RadarChart cx="50%" cy="50%" outerRadius="60%" data={guide.activityPerformance}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="activity" tick={{ fill: '#475569', fontSize: 11, fontWeight: 'bold' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                                <Radar name={t.analytics.radarKey[0]} dataKey="demand" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                                <Radar name={t.analytics.radarKey[1]} dataKey="revenue" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                                <Legend />
                                <Tooltip contentStyle={{borderRadius: '12px', border: 'none'}} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Demographics */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm min-h-[300px]">
                        <h3 className="font-bold text-slate-800 mb-2">{t.analytics.demographics}</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={guide.clientDemographics}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="range"
                                >
                                    {guide.clientDemographics.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={DEMO_COLORS[index % DEMO_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{borderRadius: '12px', border: 'none'}} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Seasonality (Trips) */}
                    <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm min-h-[300px]">
                        <h3 className="font-bold text-slate-800 mb-6">{t.analytics.seasonality}</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={guide.earningsHistory}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <Tooltip contentStyle={{borderRadius: '12px', border: 'none'}} />
                                <Bar dataKey="tripsCount" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
           </div>

           {/* SECTION 2: MARKET BENCHMARK */}
           <div className="space-y-6 pt-4">
                <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                        <Globe size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">{t.analytics.sections.market}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Market Trends */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm min-h-[350px]">
                        <h3 className="font-bold text-slate-800 mb-6">{t.analytics.sections.marketTrend}</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={MOCK_MARKET_STATS.trends} layout="vertical" margin={{ left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="activity" type="category" width={60} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                <Legend />
                                <Bar name="Richiesta Globale" dataKey="demand" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={15} />
                                <Bar name="Media Mercato" dataKey="marketAvg" fill="#e2e8f0" radius={[0, 4, 4, 0]} barSize={15} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Price Comparison */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm min-h-[350px]">
                        <h3 className="font-bold text-slate-800 mb-6">{t.analytics.sections.marketPrice}</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <ComposedChart data={MOCK_MARKET_STATS.priceComparison}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="activity" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                <Legend />
                                <Bar name="Il Tuo Prezzo" dataKey="myPrice" barSize={20} fill="#0f172a" radius={[4, 4, 0, 0]} />
                                <Line type="monotone" name="Media Mercato" dataKey="avgPrice" stroke="#ef4444" strokeWidth={3} dot={{r: 4}} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
           </div>

        </div>
      )}

      {/* --- TAB: CHAT --- */}
      {activeTab === 'chat' && (
        <div className="animate-in fade-in duration-300">
           <ChatInterface 
              conversations={chats} 
              currentUserAvatar={guide.avatar}
              lang={lang} 
           />
        </div>
      )}

      {/* --- TAB: REPUTATION / HISTORY (Updated) --- */}
      {activeTab === 'reputation' && (
          <div className="space-y-8 animate-in fade-in duration-300">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Reputation Score (Left) */}
                <div className="lg:col-span-1">
                   <div className="bg-white p-6 rounded-3xl border border-slate-100 sticky top-24">
                       <h3 className="font-bold text-slate-900 mb-2">{t.repTitle}</h3>
                       <div className="flex items-end gap-3 mb-4">
                          <span className="text-5xl font-bold text-slate-900">4.9</span>
                          <div className="mb-2 flex text-yellow-400">
                             {[1,2,3,4,5].map(i => <Globe key={i} size={16} fill="currentColor" className={i===5 ? 'text-slate-200' : ''} />)} 
                          </div>
                       </div>
                       <p className="text-sm text-slate-500 mb-6">Basato su {guide.reviews.length} recensioni verificate.</p>
                       
                       <div className="space-y-3">
                          <div className="flex items-center gap-3 text-sm">
                             <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div className="bg-green-500 h-full w-[90%]"></div>
                             </div>
                             <span className="font-bold text-slate-700">5 ★</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                             <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div className="bg-green-400 h-full w-[10%]"></div>
                             </div>
                             <span className="font-bold text-slate-700">4 ★</span>
                          </div>
                       </div>
                   </div>
                </div>

                {/* History List & Reviews (Right) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Activity History */}
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 mb-4">{t.historyTitle}</h3>
                        {pastTrips.length > 0 ? (
                            <div className="space-y-4">
                                {pastTrips.map(trip => (
                                    <div key={trip.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-4 group hover:shadow-md transition-all">
                                        <img src={trip.image} alt="" className="w-full sm:w-20 h-24 sm:h-20 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all" />
                                        
                                        <div className="flex-1 min-w-0 w-full">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                                                <h4 className="font-bold text-slate-900 truncate">{trip.title}</h4>
                                                {/* Status Badge */}
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase flex items-center gap-1 shrink-0 ${
                                                    trip.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                                    trip.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {trip.status === 'completed' ? <FileCheck size={14}/> : trip.status === 'cancelled' ? <XCircle size={14}/> : <CalendarIcon size={14}/>}
                                                    {trip.status === 'completed' ? t.completed : trip.status === 'cancelled' ? t.cancelled : t.upcoming}
                                                </span>
                                            </div>
                                            
                                            <p className="text-xs text-slate-500 mb-2">{trip.date} • {trip.enrolledClients.length} {t.participants}</p>
                                            
                                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-400 uppercase">{t.payment}:</span>
                                                    <span className={`text-xs font-bold ${
                                                        trip.paymentStatus === 'paid' ? 'text-green-600' : 
                                                        trip.paymentStatus === 'deposit' ? 'text-orange-500' : 'text-slate-400'
                                                    }`}>
                                                        {trip.paymentStatus === 'paid' ? t.paid : trip.paymentStatus === 'deposit' ? t.deposit : t.pending}
                                                    </span>
                                                </div>

                                                {/* Invoice Button - Only if Completed */}
                                                {trip.status === 'completed' && (
                                                    <button 
                                                        onClick={() => handleGenerateInvoice(trip)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                                                    >
                                                        <Download size={12} /> {t.invoice}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <p className="text-slate-500 italic">{t.noPastTrips}</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Reviews */}
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 mb-4">{t.reviewsTitle}</h3>
                        <div className="space-y-4">
                            {guide.reviews.map(review => (
                                <div key={review.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="font-bold text-slate-900">{review.authorName}</div>
                                            <span className="text-slate-300">•</span>
                                            <span className="text-xs text-slate-400">{review.date}</span>
                                        </div>
                                        <div className="flex text-yellow-400 text-xs gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-slate-600 text-sm italic">"{review.comment}"</p>
                                </div>
                            ))}
                            {guide.reviews.length === 0 && <p className="text-slate-500 italic">{t.noReviews}</p>}
                        </div>
                    </div>
                </div>
             </div>
          </div>
      )}

      {/* --- TAB: PROFILE --- */}
      {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto animate-in fade-in duration-300">
             <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                 <div className="bg-slate-900 p-6 text-white">
                     <h3 className="font-bold text-lg flex items-center gap-2">
                         <UserCog size={20} /> {t.profileTitle}
                     </h3>
                 </div>
                 <form onSubmit={handleProfileUpdate} className="p-6 md:p-8 space-y-6">
                     <div className="flex items-center gap-6 mb-6">
                         <div className="w-20 h-20 rounded-full bg-slate-100 overflow-hidden shrink-0 relative group cursor-pointer">
                             <img src={guide.avatar} alt="Avatar" className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                 <Upload size={20} className="text-white" />
                             </div>
                         </div>
                         <div>
                             <h4 className="font-bold text-slate-900 text-lg">{guide.name}</h4>
                             <p className="text-slate-500 text-sm">Guida Alpina UIAGM</p>
                         </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                             <label className="block text-sm font-bold text-slate-700 mb-1">{t.name}</label>
                             <input type="text" defaultValue={guide.name} className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900 transition-all" />
                         </div>
                         <div>
                             <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                             <input type="email" defaultValue={guide.email} className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900 transition-all" />
                         </div>
                         <div>
                             <label className="block text-sm font-bold text-slate-700 mb-1">{t.phone}</label>
                             <input type="tel" defaultValue={guide.phoneNumber} className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900 transition-all" />
                         </div>
                     </div>

                     <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 mt-4">{t.cert}</h4>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
                            <h5 className="font-bold text-blue-800 text-sm flex items-center gap-2 mb-1">
                                <Shield size={16} /> {t.certSub}
                            </h5>
                            <p className="text-blue-600/80 text-xs">
                                {t.certDesc}
                            </p>
                        </div>
                        <div>
                             <label className="block text-sm font-bold text-slate-700 mb-1">{t.alboNum}</label>
                             <input type="text" defaultValue={guide.alboNumber} className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900 transition-all font-mono uppercase" />
                        </div>
                     </div>

                     <div>
                         <label className="block text-sm font-bold text-slate-700 mb-1">{t.bio}</label>
                         <textarea rows={4} defaultValue={guide.bio} className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900 transition-all text-sm leading-relaxed" />
                     </div>

                     <div className="pt-4 flex justify-end">
                         <button type="submit" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center gap-2">
                             <Save size={18} /> {t.save}
                         </button>
                     </div>
                 </form>
             </div>
          </div>
      )}

      {/* SPORTS PASSPORT MODAL (Nested) */}
      {selectedClientForReview && (
          <SportsPassportModal 
              client={selectedClientForReview.client}
              onClose={() => setSelectedClientForReview(null)}
              onApprove={() => {
                  onApproveRequest(selectedClientForReview.tripId, selectedClientForReview.client);
                  setSelectedClientForReview(null);
              }}
              onReject={() => setSelectedClientForReview(null)}
              lang={lang}
          />
      )}

      {/* TRIP DETAILS MODAL (Guide View) */}
      {viewDetailsTrip && (
        <TripDetailsModal
          trip={viewDetailsTrip}
          onClose={() => setViewDetailsTrip(null)}
          lang={lang}
          isGuideView={true}
        />
      )}
    </div>
  );
};

export default Dashboard;