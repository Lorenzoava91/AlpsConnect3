import React, { useState, useMemo } from 'react';
import { Trip, Difficulty, ActivityType, Guide, Review } from '../types';
import { MapPin, Calendar, ArrowRight, List, Map as MapIcon, X, MessageCircle, Send, Search, Info } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import BookingModal from './BookingModal';
import TripDetailsModal from './TripDetailsModal';
import GuideProfileModal from './GuideProfileModal';
import L from 'leaflet';
import { isBefore, parseISO, startOfDay } from 'date-fns';

interface Props {
  trips: Trip[];
  onRequestJoin: (tripId: string, date: string) => void;
  lang: 'it' | 'en';
}

// Fix for default Leaflet marker icons not loading in some bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Helper to generate a mock full guide object from partial trip info
const getMockGuideFromTrip = (trip: Trip): Guide => {
    // Generate some random reviews
    const mockReviews: Review[] = [
        { id: '1', authorName: 'Alice M.', date: '2023-11-12', rating: 5, comment: 'Esperienza fantastica, guida super professionale!', role: 'Client' },
        { id: '2', authorName: 'Bob J.', date: '2023-09-05', rating: 4, comment: 'Molto bravo, itinerario bellissimo.', role: 'Client' },
        { id: '3', authorName: 'Charlie', date: '2023-01-20', rating: 5, comment: 'Sicurezza al primo posto. Consigliato.', role: 'Client' }
    ];

    return {
        id: trip.guideId,
        name: trip.guideName,
        email: 'guide@example.com',
        avatar: trip.guideAvatar,
        alboNumber: `IT-UV-${trip.guideId.toUpperCase()}`,
        bio: `Sono ${trip.guideName}, una Guida Alpina certificata con una grande passione per la montagna. Vivo e opero principalmente nella zona di ${trip.location}. Organizzo uscite di scialpinismo, arrampicata e alpinismo classico.`,
        reviews: mockReviews,
        earningsHistory: [],
        marketTrends: [],
        clientOrigins: [],
        clientDemographics: [],
        activityPerformance: [],
        invoices: []
    };
};

const Marketplace: React.FC<Props> = ({ trips, onRequestJoin, lang }) => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');
  const [contactModalTrip, setContactModalTrip] = useState<Trip | null>(null);
  const [bookingModalTrip, setBookingModalTrip] = useState<Trip | null>(null);
  const [viewDetailsTrip, setViewDetailsTrip] = useState<Trip | null>(null);
  const [selectedGuideProfile, setSelectedGuideProfile] = useState<Guide | null>(null);

  // Filters State
  const t = {
    it: {
      exploreTitle: "Esplora le Alpi e non solo",
      exploreSub: "Trova la tua prossima avventura con le migliori guide alpine.",
      all: "TUTTE",
      list: "Elenco",
      map: "Mappa",
      guide: "Guida Alpina",
      chat: "Chat",
      book: "Prenota",
      details: "Dettagli",
      customize: "Personalizza",
      days: "gg",
      availableUntil: "Disponibile fino al",
      customizeTitle: "Personalizza Esperienza",
      writeTo: "Scrivi a",
      subject: "Oggetto",
      messageLabel: "Il tuo Messaggio",
      messagePlaceholder: "Ciao! Vorrei sapere se è possibile modificare l'itinerario...",
      sendMessage: "Invia Messaggio",
      reqInfo: "Richiesta info",
      msgSent: "Messaggio inviato a",
      msgSentSub: "Ti risponderà presto.",
      when: "Quando vuoi partire?",
      from: "Dal",
      to: "Al",
      where: "Dove vuoi andare?",
      locationPlaceholder: "Cerca località...",
      noResults: "Nessuna gita trovata per i filtri selezionati.",
      reset: "Rimuovi Filtri",
      // Legend
      legendTitle: "Legenda Attività",
    },
    en: {
      exploreTitle: "Explore the Alps and Beyond",
      exploreSub: "Find your next adventure with the best alpine guides.",
      all: "ALL",
      list: "List",
      map: "Map",
      guide: "Alpine Guide",
      chat: "Chat",
      book: "Book",
      details: "Details",
      customize: "Customize",
      days: "days",
      availableUntil: "Available until",
      customizeTitle: "Customize Experience",
      writeTo: "Write to",
      subject: "Subject",
      messageLabel: "Your Message",
      messagePlaceholder: "Hi! I would like to know if it's possible to change the itinerary...",
      sendMessage: "Send Message",
      reqInfo: "Info request",
      msgSent: "Message sent to",
      msgSentSub: "They will reply soon.",
      when: "When do you want to go?",
      from: "From",
      to: "To",
      where: "Where to go?",
      locationPlaceholder: "Search location...",
      noResults: "No trips found for selected filters.",
      reset: "Reset Filters",
      // Legend
      legendTitle: "Activity Legend",
    }
  }[lang];

  // Constant for "All" filter to be language-independent in logic
  const CATEGORY_ALL = 'ALL';

  const [selectedCategory, setSelectedCategory] = useState<string>(CATEGORY_ALL);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [locationQuery, setLocationQuery] = useState('');

  // Translation map for ActivityType (assuming keys match enum values or using values directly)
  const activityLabels: Record<string, string> = {
    [ActivityType.SkiTouring]: lang === 'en' ? 'Ski Touring' : ActivityType.SkiTouring,
    [ActivityType.Climbing]: lang === 'en' ? 'Climbing' : ActivityType.Climbing,
    [ActivityType.Hiking]: lang === 'en' ? 'Hiking' : ActivityType.Hiking,
    [ActivityType.Mountaineering]: lang === 'en' ? 'Mountaineering' : ActivityType.Mountaineering,
    [ActivityType.Freeride]: lang === 'en' ? 'Freeride' : ActivityType.Freeride,
    [ActivityType.IceClimbing]: lang === 'en' ? 'Ice Climbing' : ActivityType.IceClimbing,
    [ActivityType.Canyoning]: lang === 'en' ? 'Canyoning' : ActivityType.Canyoning,
  };

  // Helper function to shorten labels for the compact bar
  const getCompactLabel = (cat: string) => {
    if (cat === CATEGORY_ALL) return t.all;
    
    // Custom abbreviations to fit single line on mobile
    if (lang === 'it') {
        if (cat === ActivityType.SkiTouring) return 'Sci Alp';
        if (cat === ActivityType.IceClimbing) return 'Ghiaccio';
        if (cat === ActivityType.Mountaineering) return 'Alpinismo'; // Already mostly ok
    }
    
    return activityLabels[cat] || cat;
  };

  // Color mapping function for activities
  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case ActivityType.SkiTouring: return '#3b82f6'; // Blue
      case ActivityType.Climbing: return '#f97316';   // Orange
      case ActivityType.Hiking: return '#22c55e';     // Green
      case ActivityType.Mountaineering: return '#ef4444'; // Red
      case ActivityType.Freeride: return '#8b5cf6';   // Violet
      case ActivityType.IceClimbing: return '#06b6d4'; // Cyan
      case ActivityType.Canyoning: return '#14b8a6';  // Teal
      default: return '#64748b'; // Slate
    }
  };

  const categories = [CATEGORY_ALL, ...Object.values(ActivityType)];

  // Filtering Logic
  const filteredTrips = useMemo(() => {
    return trips.filter(trip => {
      // 1. Category Filter
      const categoryMatch = selectedCategory === CATEGORY_ALL || trip.activityType === selectedCategory;
      
      // 2. Date Filter
      let dateMatch = true;
      if (dateRange.start) {
         dateMatch = dateMatch && trip.date >= dateRange.start;
      }
      if (dateRange.end) {
         dateMatch = dateMatch && trip.date <= dateRange.end;
      }

      // 3. Location Filter
      const searchLower = locationQuery.toLowerCase();
      const locationMatch = !locationQuery || 
                            trip.location.toLowerCase().includes(searchLower) || 
                            trip.title.toLowerCase().includes(searchLower);

      return categoryMatch && dateMatch && locationMatch;
    });
  }, [trips, selectedCategory, dateRange, locationQuery]);

  // Handle Guide Click
  const handleGuideClick = (e: React.MouseEvent, trip: Trip) => {
      e.stopPropagation();
      const mockGuide = getMockGuideFromTrip(trip);
      setSelectedGuideProfile(mockGuide);
  };

  // Handle Guide Click from Detail Modal
  const handleViewGuideProfile = (trip: Trip) => {
      const mockGuide = getMockGuideFromTrip(trip);
      setSelectedGuideProfile(mockGuide);
      setViewDetailsTrip(null); // Close detail modal to show guide profile
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`${t.msgSent} ${contactModalTrip?.guideName}! ${t.msgSentSub}`);
    setContactModalTrip(null);
  };

  const handleBookingConfirm = (date: string) => {
    if (bookingModalTrip) {
      onRequestJoin(bookingModalTrip.id, date);
      setBookingModalTrip(null);
    }
  };

  // Custom function to create div icons for the map
  const createCustomIcon = (price: number, activityType: ActivityType) => {
    const colorClass = getActivityColor(activityType);
    
    return L.divIcon({
      className: 'custom-pin',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="width: 32px; height: 32px; border-radius: 9999px; background-color: ${colorClass}; border: 2px solid white; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); display: flex; align-items: center; justify-content: center; color: white;">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>
          </div>
          <div style="position: absolute; top: 100%; margin-top: 4px; background-color: rgba(0,0,0,0.75); color: white; font-size: 10px; padding: 2px 6px; border-radius: 4px; white-space: nowrap; backdrop-filter: blur(4px);">
             €${price}
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16], // Center
      popupAnchor: [0, -20]
    });
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-20">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden h-[250px] md:h-[300px] text-white shadow-2xl">
        <img 
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop" 
          alt="Suggestive Alpine Landscape" 
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 35%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent flex flex-col justify-end p-6 md:p-12">
           <h1 className="text-2xl md:text-4xl font-bold mb-2 drop-shadow-lg">
             {t.exploreTitle}
           </h1>
           <p className="text-slate-100 text-sm md:text-base max-w-xl drop-shadow-md font-medium">
             {t.exploreSub}
           </p>
        </div>
      </div>

      {/* FILTERS BAR */}
      <div className="sticky top-4 z-30 space-y-3">
        {/* Row 1: Categories - Horizontal Scrollable List for Mobile */}
        <div className="flex w-full overflow-x-auto gap-2 px-1 pb-1 no-scrollbar">
          {categories.map((cat, i) => (
            <button 
              key={i} 
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wide transition-all shadow-sm whitespace-nowrap border ${
                selectedCategory === cat 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                  : 'bg-white text-slate-500 hover:bg-slate-100 border-slate-200'
              }`}
              title={cat === CATEGORY_ALL ? t.all : activityLabels[cat] || cat}
            >
              {getCompactLabel(cat)}
            </button>
          ))}
        </div>

        {/* Row 2: Location, Date Search & View Toggle */}
        <div className="flex flex-col md:flex-row gap-3 bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-sm border border-slate-200">
           
           {/* Location Input */}
           <div className="flex-1 md:flex-[1.2] bg-slate-50 rounded-xl p-1 border border-slate-200 flex items-center gap-2 group focus-within:ring-2 focus-within:ring-slate-200 transition-all">
              <div className="px-3 text-slate-400">
                <Search size={18} />
              </div>
              <div className="relative flex-1">
                  <label className="absolute -top-3 left-0 text-[8px] font-bold text-slate-400 uppercase bg-slate-50 px-1 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200">{t.where}</label>
                  <input
                    type="text"
                    placeholder={t.locationPlaceholder}
                    className="w-full bg-transparent border-none text-sm font-medium text-slate-700 focus:ring-0 p-1 outline-none h-8 placeholder:text-slate-400"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                  />
              </div>
              {locationQuery && (
                <button 
                  onClick={() => setLocationQuery('')}
                  className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors mr-1"
                >
                  <X size={14} />
                </button>
              )}
           </div>

           {/* Date Inputs */}
           <div className="flex-1 flex items-center gap-2 bg-slate-50 rounded-xl p-1 border border-slate-200">
              <div className="px-3 text-slate-400">
                <Calendar size={18} />
              </div>
              <div className="flex-1 flex items-center gap-2">
                 <div className="relative flex-1 group">
                    <label className="absolute -top-1.5 left-2 text-[8px] font-bold text-slate-400 uppercase bg-slate-50 px-1">{t.from}</label>
                    <input 
                      type="date" 
                      className="w-full bg-transparent border-none text-sm font-medium text-slate-700 focus:ring-0 p-1 outline-none h-8"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    />
                 </div>
                 <div className="w-px h-6 bg-slate-300"></div>
                 <div className="relative flex-1 group">
                    <label className="absolute -top-1.5 left-2 text-[8px] font-bold text-slate-400 uppercase bg-slate-50 px-1">{t.to}</label>
                    <input 
                      type="date" 
                      className="w-full bg-transparent border-none text-sm font-medium text-slate-700 focus:ring-0 p-1 outline-none h-8"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    />
                 </div>
              </div>
              {(dateRange.start || dateRange.end) && (
                <button 
                  onClick={() => setDateRange({start: '', end: ''})}
                  className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                  title={t.reset}
                >
                  <X size={14} />
                </button>
              )}
           </div>

           {/* View Mode Toggle */}
           <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
             <button 
               onClick={() => setViewMode('list')}
               className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all flex-1 md:flex-none ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               <List size={16} /> {t.list}
             </button>
             <button 
               onClick={() => setViewMode('map')}
               className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all flex-1 md:flex-none ${viewMode === 'map' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               <MapIcon size={16} /> {t.map}
             </button>
           </div>
        </div>
      </div>

      {/* MAP VIEW */}
      {viewMode === 'map' && (
        <div className="bg-slate-100 rounded-3xl overflow-hidden h-[600px] relative border border-slate-200 shadow-inner z-0">
            <MapContainer 
                center={[45.8, 9.0]} 
                zoom={7} 
                style={{ height: '100%', width: '100%' }}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {filteredTrips.map(trip => (
                    <Marker 
                        key={trip.id} 
                        position={[trip.coordinates.lat, trip.coordinates.lng]}
                        icon={createCustomIcon(trip.price, trip.activityType)}
                    >
                        <Popup className="custom-popup" closeButton={false} maxWidth={300} minWidth={280}>
                           <div className="p-0">
                                <div className="relative cursor-pointer" onClick={() => setViewDetailsTrip(trip)}>
                                    <img src={trip.image} className="w-full h-32 object-cover rounded-t-xl hover:opacity-90 transition-opacity" alt="" />
                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                                        {trip.activityType}
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/20 transition-opacity">
                                       <span className="bg-white/90 text-slate-900 px-3 py-1 rounded-full text-xs font-bold shadow-sm">{t.details}</span>
                                    </div>
                                </div>
                                <div className="p-3">
                                    <div 
                                        className="flex items-center gap-1 text-slate-600 text-xs font-bold mb-1 cursor-pointer hover:underline"
                                        onClick={(e) => handleGuideClick(e, trip)}
                                    >
                                        <span className="font-normal">{trip.guideName}</span>
                                    </div>
                                    <h4 
                                      className="font-bold text-slate-900 text-sm leading-tight mb-1 cursor-pointer hover:text-blue-600 transition-colors"
                                      onClick={() => setViewDetailsTrip(trip)}
                                    >
                                      {trip.title}
                                    </h4>
                                    <p className="text-xs text-slate-500 mb-3 flex items-center gap-1"><MapPin size={10}/> {trip.location}</p>
                                    
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setViewDetailsTrip(trip); }}
                                            className="flex-1 bg-white border border-slate-200 text-slate-700 text-xs font-bold py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
                                        >
                                            <Info size={12} /> {t.details}
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setBookingModalTrip(trip); }}
                                            className="flex-1 bg-slate-900 text-white text-xs font-bold py-2 rounded-lg hover:bg-slate-800 transition-colors"
                                        >
                                            {t.book}
                                        </button>
                                    </div>
                                </div>
                           </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Custom Legend for Map */}
            <div className="absolute bottom-6 left-6 z-[400] bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl max-h-[300px] overflow-y-auto no-scrollbar">
               <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2 sticky top-0 bg-white/90 pb-2 border-b border-slate-100">
                 <Info size={12} /> {t.legendTitle}
               </h4>
               <div className="space-y-2">
                  {Object.values(ActivityType).map((type) => (
                    <div key={type} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full border border-black/10 shadow-sm shrink-0" 
                          style={{ backgroundColor: getActivityColor(type) }}
                        ></div>
                        <span className="text-xs font-medium text-slate-600">{activityLabels[type] || type}</span>
                    </div>
                  ))}
               </div>
            </div>
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <>
          {filteredTrips.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
               <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                 <Search size={32} />
               </div>
               <p className="text-slate-500 font-medium">{t.noResults}</p>
               <button 
                  onClick={() => {setSelectedCategory(CATEGORY_ALL); setDateRange({start: '', end: ''}); setLocationQuery('');}}
                  className="mt-4 text-sm text-blue-600 font-bold hover:underline"
               >
                 {t.reset}
               </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
              {filteredTrips.map(trip => (
                <div key={trip.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col h-full">
                  {/* Image Header */}
                  <div className="relative h-56 overflow-hidden cursor-pointer" onClick={() => setViewDetailsTrip(trip)}>
                    <img 
                      src={trip.image} 
                      alt={trip.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-slate-900 uppercase tracking-wide">
                      {trip.activityType}
                    </div>
                    <div className="absolute bottom-4 left-4 text-white">
                        <div className="flex items-center gap-1.5 text-sm font-medium bg-black/40 px-2 py-1 rounded-md backdrop-blur-sm">
                          <MapPin size={14} /> {trip.location}
                        </div>
                    </div>
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white/90 text-slate-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                           {t.details}
                        </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <h3 
                        className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight cursor-pointer"
                        onClick={() => setViewDetailsTrip(trip)}
                      >
                        {trip.title}
                      </h3>
                      <span className="text-lg font-bold text-slate-900">€{trip.price}</span>
                    </div>
                    
                    <div className="flex gap-4 mb-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1.5">
                          <Calendar size={16} className="text-blue-500" />
                          {trip.durationDays} {t.days}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          {t.availableUntil} {trip.availableTo}
                      </div>
                    </div>

                    <div className="border-t border-slate-100 my-4 pt-4">
                      <div className="flex items-center justify-between">
                        <div 
                            className="flex items-center gap-2 cursor-pointer group/guide"
                            onClick={(e) => handleGuideClick(e, trip)}
                        >
                          <img src={trip.guideAvatar} alt={trip.guideName} className="w-8 h-8 rounded-full border border-slate-200 group-hover/guide:ring-2 group-hover/guide:ring-blue-100 transition-all" />
                          <div>
                            <div className="text-xs text-slate-500 font-medium">{t.guide}</div>
                            <div className="text-sm font-bold text-slate-800 flex items-center gap-1 group-hover/guide:text-blue-600 transition-colors">
                              {trip.guideName}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-auto flex gap-3">
                      <button 
                        onClick={() => setContactModalTrip(trip)}
                        className="flex-1 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                        <MessageCircle size={16} /> {t.customize}
                      </button>
                      <button 
                        onClick={() => setBookingModalTrip(trip)}
                        className="flex-1 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                        {t.book} <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* MODALS */}
      
      {/* Trip Details Modal */}
      {viewDetailsTrip && (
         <TripDetailsModal 
           trip={viewDetailsTrip}
           onClose={() => setViewDetailsTrip(null)}
           onContact={() => { setViewDetailsTrip(null); setContactModalTrip(viewDetailsTrip); }}
           onBook={() => { setViewDetailsTrip(null); setBookingModalTrip(viewDetailsTrip); }}
           onViewGuideProfile={() => handleViewGuideProfile(viewDetailsTrip)}
           lang={lang}
         />
      )}

      {/* Guide Profile Modal */}
      {selectedGuideProfile && (
          <GuideProfileModal 
              guide={selectedGuideProfile}
              pastTrips={trips.filter(t => t.guideId === selectedGuideProfile.id && isBefore(parseISO(t.date), startOfDay(new Date())))}
              onClose={() => setSelectedGuideProfile(null)}
              lang={lang}
          />
      )}

      {/* Contact Modal */}
      {contactModalTrip && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="bg-slate-900 text-white p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold">{t.customizeTitle}</h3>
                  <button onClick={() => setContactModalTrip(null)} className="text-slate-300 hover:text-white">
                    <X size={24} />
                  </button>
                </div>
                <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                  <img src={contactModalTrip.guideAvatar} className="w-10 h-10 rounded-full" alt="Guide" />
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold">{t.writeTo}</p>
                    <p className="font-bold">{contactModalTrip.guideName}</p>
                  </div>
                </div>
              </div>
              <form onSubmit={handleContactSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">{t.subject}</label>
                  <input 
                    readOnly
                    value={`${t.reqInfo}: ${contactModalTrip.title}`}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-sm font-medium"
                  />
                </div>
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1">{t.messageLabel}</label>
                   <textarea 
                     rows={4}
                     className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm resize-none"
                     placeholder={t.messagePlaceholder}
                     autoFocus
                   ></textarea>
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
                  <Send size={18} /> {t.sendMessage}
                </button>
              </form>
           </div>
        </div>
      )}

      {/* Booking Modal */}
      {bookingModalTrip && (
        <BookingModal 
          trip={bookingModalTrip} 
          onClose={() => setBookingModalTrip(null)} 
          onConfirm={handleBookingConfirm} 
          lang={lang}
        />
      )}
    </div>
  );
};

export default Marketplace;