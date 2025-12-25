import React, { useState, useEffect } from 'react';
import { Mountain, Shield, LayoutDashboard, ArrowRight, Star, Globe, Users, Share2, MessageSquare, BarChart, Languages, Calendar, CheckCircle, CreditCard, Activity, Search, ExternalLink, CloudSun, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FeedbackModal from './FeedbackModal';
import StatsModal from './StatsModal';

const LandingPage = () => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [lang, setLang] = useState<'it' | 'en'>('it');
  const [activeFeatureTab, setActiveFeatureTab] = useState<'client' | 'guide'>('client');
  const navigate = useNavigate();

  // Track Page Views on Mount
  useEffect(() => {
    const currentViews = parseInt(localStorage.getItem('alpina_page_views') || '0');
    localStorage.setItem('alpina_page_views', (currentViews + 1).toString());
  }, []);
  
  const handleEnterApp = (e?: React.MouseEvent) => {
    if(e) e.preventDefault();
    
    // FIX: Navigazione interna invece di window.open per compatibilità con ambienti Blob/Sandbox
    navigate(`/app?lang=${lang}`);
    window.scrollTo(0, 0);
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'AlpsConnect',
      text: lang === 'it' 
        ? 'La piattaforma digitale definitiva per Guide Alpine e appassionati.' 
        : 'The ultimate digital platform for Alpine Guides and enthusiasts.',
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.debug('Share cancelled');
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert(lang === 'it' ? 'Link copiato!' : 'Link copied!');
      } catch (err) {
        alert('Error copying link.');
      }
    }
  };

  // --- TRANSLATIONS DICTIONARY ---
  const t = {
    it: {
      share: "Condividi",
      demoBtn: "Prova Demo",
      heroTitle: <>Trova la tua Guida per<br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">ogni avventura.</span></>,
      heroSub: "Il marketplace per connettere Guide e appassionati di montagna, unito a un gestionale per semplificare il lavoro operativo dei professionisti.",
      ctaStart: "Prova Demo",
      ctaFeedback: "Feedback",
      ctaNote: "Aiutaci a migliorare l'MVP.",
      activitiesList: "SCI ALPINISMO • ARRAMPICATA • TREKKING • ALPINISMO • FREERIDE • GHIACCIO • CANYONING",
      
      // Features Section
      featuresTitle: "Cosa contiene la piattaforma",
      featuresSub: "Una suite completa di strumenti pensati per chi vive la montagna.",
      tabClient: "Per Appassionati",
      tabGuide: "Per Guide Alpine",
      
      // Client Features
      c1Title: "Marketplace Globale",
      c1Desc: "Trova avventure in tutto il mondo con filtri avanzati per attività e difficoltà.",
      c2Title: "Calendario Smart & Meteo",
      c2Desc: "Prenotazione intelligente che incrocia disponibilità e meteo previsto per la data scelta.",
      c3Title: "Diario Sportivo & Sync",
      c3Desc: "Sincronizza Strava o Garmin. Tieni traccia delle ascese e certifica il tuo livello.",
      c4Title: "Chat Diretta",
      c4Desc: "Parla direttamente con la tua guida prima di prenotare per personalizzare l'esperienza.",

      // Guide Features
      g1Title: "Gestionale & Meteo",
      g1Desc: "Dashboard operativa con calendario integrato alle previsioni meteo locali per ogni uscita.",
      g2Title: "Fatturazione Automatica",
      g2Desc: "Generazione automatica di fatture individuali per ciascun partecipante di ogni gita.",
      g3Title: "Check esperienza clienti",
      g3Desc: "Visualizza il diario sportivo dei clienti per valutare l'idoneità tecnica.",
      g4Title: "Business Analytics",
      g4Desc: "Analizza i trend del momento e scopri dove c'è più richiesta per le tue attività.",

      demoTitle: "Prova la Piattaforma",
      demoDesc: "Interagisci direttamente con l'interfaccia reale. Esplora il marketplace, gestisci il profilo cliente e visualizza la dashboard della guida.",
      systemOnline: "Sistema Online",
      footerDesc: "Connettiamo passione e professionalità. La piattaforma leader per l'alpinismo moderno.",
      product: "Prodotto",
      company: "Compagnia",
      feedbackTitle: "Feedback",
      feedbackDesc: "Aiutaci a migliorare la piattaforma.",
      rights: "Tutti i diritti riservati.",
      adminStats: "Statistiche Admin",
      launchApp: "Lancia App",
      launchSub: "Accedi all'applicazione completa."
    },
    en: {
      share: "Share",
      demoBtn: "Try Demo",
      heroTitle: <>Find your Guide for<br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">every adventure.</span></>,
      heroSub: "The marketplace connecting Guides and mountain enthusiasts, combined with management tools to simplify professionals' daily operations.",
      ctaStart: "Try Demo",
      ctaFeedback: "Feedback",
      ctaNote: "Help us improve this MVP.",
      activitiesList: "SKI TOURING • CLIMBING • HIKING • MOUNTAINEERING • FREERIDE • ICE CLIMBING • CANYONING",
      
      // Features Section
      featuresTitle: "Everything You Need",
      featuresSub: "A complete suite of tools designed for those who live the mountain life.",
      tabClient: "For Adventurers",
      tabGuide: "For Alpine Guides",

      // Client Features
      c1Title: "Global Marketplace",
      c1Desc: "Find adventures worldwide with advanced filters for activity and difficulty.",
      c2Title: "Smart Calendar & Weather",
      c2Desc: "Smart booking matching guide availability with forecasted weather for your dates.",
      c3Title: "Sports Diary & Sync",
      c3Desc: "Sync Strava or Garmin. Track your ascents and certify your skill level.",
      c4Title: "Direct Chat",
      c4Desc: "Chat directly with your guide before booking to customize the experience.",

      // Guide Features
      g1Title: "Management & Weather",
      g1Desc: "Operational dashboard with calendar integrated with local weather forecasts for each trip.",
      g2Title: "Auto Invoicing",
      g2Desc: "Automatic invoice generation for each participant of every trip.",
      g3Title: "Client Experience Check",
      g3Desc: "View clients' sports diaries to assess technical suitability.",
      g4Title: "Business Analytics",
      g4Desc: "Analyze current market trends and find out where demand is highest.",

      demoTitle: "Try the Platform",
      demoDesc: "Interact directly with the real interface. Explore the marketplace, manage the client profile, and view the guide dashboard.",
      systemOnline: "System Online",
      footerDesc: "Connecting passion and professionalism. The leading platform for modern alpinism.",
      product: "Product",
      company: "Company",
      feedbackTitle: "Feedback",
      feedbackDesc: "Help us improve the platform.",
      rights: "All rights reserved.",
      adminStats: "Admin Stats",
      launchApp: "Launch App",
      launchSub: "Access the full application."
    }
  }[lang];

  const clientFeatures = [
    { icon: Search, title: t.c1Title, desc: t.c1Desc },
    { icon: CloudSun, title: t.c2Title, desc: t.c2Desc },
    { icon: Activity, title: t.c3Title, desc: t.c3Desc },
    { icon: MessageSquare, title: t.c4Title, desc: t.c4Desc },
  ];

  const guideFeatures = [
    { icon: LayoutDashboard, title: t.g1Title, desc: t.g1Desc },
    { icon: Shield, title: t.g2Title, desc: t.g2Desc },
    { icon: Users, title: t.g3Title, desc: t.g3Desc },
    { icon: TrendingUp, title: t.g4Title, desc: t.g4Desc },
  ];

  return (
    <div className="font-sans text-slate-900 bg-white relative">
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} lang={lang} />
      <StatsModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} />

      {/* --- HERO SECTION --- */}
      <div className="relative min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="absolute top-0 w-full z-20 px-4 py-4 md:px-6 md:py-6 flex justify-between items-center max-w-7xl mx-auto left-0 right-0">
          <div className="flex items-center gap-2">
             <div className="bg-white p-1.5 md:p-2 rounded-xl">
               <Mountain size={20} className="text-slate-900 md:w-6 md:h-6" strokeWidth={2.5} />
             </div>
             <span className="font-bold text-lg md:text-xl tracking-tight text-white drop-shadow-md">AlpsConnect</span>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            {/* Language Switcher */}
            <button 
                onClick={() => setLang(lang === 'it' ? 'en' : 'it')}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-2.5 py-2 md:px-3 md:py-2.5 rounded-full font-bold text-xs md:text-sm transition-all flex items-center gap-2 cursor-pointer border border-white/10"
            >
                <img 
                  src={lang === 'it' ? "https://flagcdn.com/w40/it.png" : "https://flagcdn.com/w40/gb.png"} 
                  alt={lang === 'it' ? "Italiano" : "English"}
                  className="w-4 h-3 md:w-5 md:h-3.5 object-cover rounded-[2px]"
                />
                <span>{lang.toUpperCase()}</span>
            </button>

            <button 
              onClick={handleShare}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-3 py-2 md:px-4 md:py-2.5 rounded-full font-bold text-xs md:text-sm transition-all flex items-center gap-2 cursor-pointer border border-white/10"
              title={t.share}
            >
              <Share2 size={14} className="md:w-4 md:h-4" />
              <span className="hidden sm:inline">{t.share}</span>
            </button>
            {/* Removed top-right Demo Button as requested */}
          </div>
        </nav>

        {/* Hero Content */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden">
           <img 
             src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop" 
             className="absolute inset-0 w-full h-full object-cover"
             alt="Mountains"
           />
           <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 to-slate-900/40"></div>
           
           <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-16 md:mt-20">
              {/* Activity List Ticker */}
              <div className="mb-6 text-[10px] sm:text-xs md:text-sm font-bold tracking-widest text-blue-100/90 uppercase select-none">
                {t.activitiesList}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white tracking-tight mb-4 md:mb-6 drop-shadow-xl leading-tight">
                {t.heroTitle}
              </h1>
              <p className="text-base md:text-xl text-slate-200 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
                {t.heroSub}
              </p>
              
              <div className="flex flex-row gap-3 md:gap-4 justify-center items-center">
                 <button 
                   onClick={handleEnterApp}
                   className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 md:px-8 md:py-4 rounded-full font-bold text-sm md:text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2 cursor-pointer flex-1 sm:flex-none"
                 >
                   {t.ctaStart} <ArrowRight size={18} className="md:w-5 md:h-5"/>
                 </button>
                 <button 
                   onClick={() => setIsFeedbackOpen(true)}
                   className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-4 py-2.5 md:px-8 md:py-4 rounded-full font-bold text-sm md:text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2 cursor-pointer flex-1 sm:flex-none"
                 >
                   <MessageSquare size={18} className="md:w-5 md:h-5" /> {t.ctaFeedback}
                 </button>
              </div>
              <p className="mt-4 text-slate-300 text-xs md:text-sm opacity-80">{t.ctaNote}</p>
           </div>
        </div>
      </div>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
           <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">{t.featuresTitle}</h2>
              <p className="text-slate-500 max-w-2xl mx-auto mb-8 text-sm md:text-base">{t.featuresSub}</p>
              
              {/* Toggle Switch */}
              <div className="inline-flex bg-white p-1 rounded-full border border-slate-200 shadow-sm">
                 <button 
                   onClick={() => setActiveFeatureTab('client')}
                   className={`px-4 py-2 md:px-6 md:py-2.5 rounded-full text-xs md:text-sm font-bold transition-all ${activeFeatureTab === 'client' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                 >
                   {t.tabClient}
                 </button>
                 <button 
                   onClick={() => setActiveFeatureTab('guide')}
                   className={`px-4 py-2 md:px-6 md:py-2.5 rounded-full text-xs md:text-sm font-bold transition-all ${activeFeatureTab === 'guide' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                 >
                   {t.tabGuide}
                 </button>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {(activeFeatureTab === 'client' ? clientFeatures : guideFeatures).map((feature, idx) => (
                 <div key={idx} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-4 md:mb-6 transition-colors ${activeFeatureTab === 'client' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' : 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white'}`}>
                       <feature.icon size={24} className="md:w-7 md:h-7" />
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-slate-900 mb-2 md:mb-3">{feature.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {feature.desc}
                    </p>
                 </div>
              ))}
           </div>
        </div>
      </section>

      {/* --- DEMO SECTION --- */}
      <section id="demo" className="py-16 md:py-24 bg-slate-900 text-white overflow-hidden relative">
         {/* Background decoration */}
         <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>

         <div className="w-full md:max-w-7xl mx-auto px-2 md:px-6 relative z-10">
            <div className="flex flex-col md:flex-row items-end justify-between mb-8 md:mb-12 gap-6">
               <div className="max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] md:text-xs font-bold uppercase tracking-wide mb-4">
                     <Star size={12} fill="currentColor" /> Live Preview
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.demoTitle}</h2>
                  <p className="text-slate-400 text-sm md:text-lg">
                    {t.demoDesc}
                  </p>
               </div>
               <div className="flex items-center gap-4 text-xs md:text-sm font-medium text-slate-400">
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                     {t.systemOnline}
                  </div>
                  <div className="hidden md:block h-4 w-px bg-slate-700"></div>
                  <div className="hidden md:block">v2.4.0 Stable</div>
               </div>
            </div>

            {/* APP CONTAINER (Mock Window) */}
            <div className="rounded-2xl border border-slate-700/50 bg-slate-800 shadow-2xl overflow-hidden ring-1 ring-white/10 w-full">
               {/* Window Header */}
               <div className="h-10 md:h-12 bg-slate-800 border-b border-slate-700 flex items-center px-4 justify-between select-none">
                  <div className="flex gap-2">
                     <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500/80"></div>
                     <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500/80"></div>
                     <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-md text-[10px] md:text-xs text-slate-400 font-mono border border-slate-700">
                     <Shield size={10} /> app.alpsconnect.com
                  </div>
                  <div className="w-12 md:w-16"></div> {/* Spacer */}
               </div>

               {/* The Actual App Placeholder */}
               <div className="h-[400px] md:h-[500px] bg-slate-100 flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
                   <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 blur-sm"></div>
                   <div className="relative z-10 max-w-lg mx-auto">
                        <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-8 animate-in zoom-in duration-500">
                            <Mountain size={40} className="text-blue-600" />
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">{t.launchApp}</h3>
                        <p className="text-slate-500 mb-8 text-lg">{t.launchSub}</p>
                        <button 
                            onClick={handleEnterApp} 
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-blue-200 transition-all hover:scale-105 flex items-center justify-center gap-2 mx-auto"
                        >
                            {t.ctaStart} <ArrowRight size={20} />
                        </button>
                   </div>
               </div>
            </div>
         </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-100 py-12 md:py-16">
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12">
               <div>
                  <div className="flex items-center gap-2 mb-6">
                     <div className="bg-slate-900 p-1.5 rounded-lg text-white">
                        <Mountain size={20} strokeWidth={2.5} />
                     </div>
                     <span className="font-bold text-xl tracking-tight text-slate-900">AlpsConnect</span>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed">
                     {t.footerDesc}
                  </p>
               </div>
               
               <div>
                  <h4 className="font-bold text-slate-900 mb-4">{t.product}</h4>
                  <ul className="space-y-3 text-sm text-slate-500">
                     <li><a href="#" className="hover:text-blue-600 transition-colors">Features</a></li>
                     <li><a href="#" className="hover:text-blue-600 transition-colors">For Guides</a></li>
                     <li><a href="#" className="hover:text-blue-600 transition-colors">For Clients</a></li>
                     <li><a href="#" className="hover:text-blue-600 transition-colors">Pricing</a></li>
                  </ul>
               </div>

               <div>
                  <h4 className="font-bold text-slate-900 mb-4">{t.company}</h4>
                  <ul className="space-y-3 text-sm text-slate-500">
                     <li><a href="#" className="hover:text-blue-600 transition-colors">About</a></li>
                     <li><a href="#" className="hover:text-blue-600 transition-colors">Careers</a></li>
                     <li><a href="#" className="hover:text-blue-600 transition-colors">Blog</a></li>
                     <li><a href="#" className="hover:text-blue-600 transition-colors">Contact</a></li>
                  </ul>
               </div>

               <div>
                  <h4 className="font-bold text-slate-900 mb-4">{t.feedbackTitle}</h4>
                  <p className="text-sm text-slate-500 mb-4">{t.feedbackDesc}</p>
                  <button onClick={() => setIsFeedbackOpen(true)} className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
                     {t.ctaFeedback} <MessageSquare size={14} />
                  </button>
               </div>
            </div>
            
            <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
               <p>&copy; 2024 AlpsConnect Inc. {t.rights}</p>
               <div className="flex gap-6 mt-4 md:mt-0 items-center">
                  <a href="#" className="hover:text-slate-900">Privacy Policy</a>
                  <a href="#" className="hover:text-slate-900">Terms of Service</a>
                  <button 
                    onClick={() => setIsStatsOpen(true)} 
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 ml-4 transition-colors bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold"
                    title={t.adminStats}
                  >
                     <BarChart size={14} /> {t.adminStats}
                  </button>
               </div>
            </div>
         </div>
      </footer>

      {/* Floating Action Button (FAB) for Feedback - Always visible on scroll */}
      <button 
         onClick={() => setIsFeedbackOpen(true)}
         className="fixed bottom-6 right-6 z-40 bg-yellow-400 hover:bg-yellow-500 text-slate-900 p-3 md:p-4 rounded-full shadow-2xl transition-transform hover:scale-110 flex items-center gap-2 font-bold"
      >
         <MessageSquare size={20} className="md:w-6 md:h-6" />
         <span className="hidden md:inline">{t.ctaFeedback}</span>
      </button>
    </div>
  );
};

export default LandingPage;