import React, { useState, useEffect } from 'react';
import { Trip } from '../types';
import { ChevronLeft, ChevronRight, X, Calendar, Clock, CheckCircle } from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  isWithinInterval,
  parseISO,
  isBefore,
  startOfDay,
  differenceInDays
} from 'date-fns';
import { it, enUS } from 'date-fns/locale';
import { fetchWeatherForecast, getWeatherIcon, WeatherData } from '../services/weatherService';

interface Props {
  trip: Trip;
  onClose: () => void;
  onConfirm: (date: string) => void;
  lang?: 'it' | 'en';
}

const BookingModal: React.FC<Props> = ({ trip, onClose, onConfirm, lang = 'it' }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [weatherMap, setWeatherMap] = useState<Record<string, WeatherData>>({});

  const tripStart = parseISO(trip.availableFrom);
  const tripEnd = parseISO(trip.availableTo);
  const today = startOfDay(new Date());
  
  const locale = lang === 'it' ? it : enUS;

  const t = {
    it: {
        selectDate: "Seleziona Data",
        duration: "Durata",
        day: "giorno",
        days: "giorni",
        availability: "Disponibilità dal",
        to: "al",
        forecast: "Meteo previsto",
        startDate: "Data Inizio",
        confirm: "Conferma e Prenota",
        weekDays: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']
    },
    en: {
        selectDate: "Select Date",
        duration: "Duration",
        day: "day",
        days: "days",
        availability: "Availability from",
        to: "to",
        forecast: "Forecast",
        startDate: "Start Date",
        confirm: "Confirm & Book",
        weekDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    }
  }[lang];

  // Fetch Weather Logic
  useEffect(() => {
    const loadWeatherForView = async () => {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(monthStart);
      const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
      const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

      let day = startDate;
      const daysToFetch: string[] = [];

      // Identify days to fetch (only within 14 days from now)
      while (day <= endDate) {
        const diff = differenceInDays(day, today);
        if (diff >= 0 && diff <= 13) {
           daysToFetch.push(format(day, 'yyyy-MM-dd'));
        }
        day = addDays(day, 1);
      }

      if (daysToFetch.length === 0) return;

      const newWeatherData: Record<string, WeatherData> = {};
      
      // Fetch in parallel (limited batch)
      await Promise.all(daysToFetch.map(async (dateStr) => {
         // Optimization: don't refetch if we have it
         if (!weatherMap[dateStr]) {
            const w = await fetchWeatherForecast(trip.coordinates.lat, trip.coordinates.lng, dateStr);
            if (w) newWeatherData[dateStr] = w;
         }
      }));

      if (Object.keys(newWeatherData).length > 0) {
        setWeatherMap(prev => ({ ...prev, ...newWeatherData }));
      }
    };

    loadWeatherForView();
  }, [currentMonth, trip.coordinates, today, weatherMap]);


  // Helper to check if a date is available
  const isDateAvailable = (date: Date) => {
    // 1. Check if within trip season
    const inSeason = isWithinInterval(date, { start: tripStart, end: tripEnd });
    if (!inSeason) return false;

    // 2. Check if in the past
    if (isBefore(date, today)) return false;

    // 3. Mock Guide Availability Logic
    const dayOfWeek = date.getDay(); // 0 = Sun, 3 = Wed
    if (dayOfWeek === 3) return false; 
    
    return true;
  };

  const handleDateClick = (date: Date) => {
    if (isDateAvailable(date)) {
      setSelectedDate(date);
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-slate-100 rounded-full">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-lg font-bold capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale })}
        </h2>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-slate-100 rounded-full">
          <ChevronRight size={20} />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    return (
      <div className="grid grid-cols-7 mb-2">
        {t.weekDays.map(day => (
          <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-2">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const dateStr = format(day, 'yyyy-MM-dd');
        const cloneDay = day;
        const isAvailable = isDateAvailable(cloneDay);
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        const isCurrentMonth = isSameMonth(day, monthStart);
        
        // Weather Info
        const weather = weatherMap[dateStr];
        const WeatherIcon = weather ? getWeatherIcon(weather.weatherCode).icon : null;
        const wColor = weather ? getWeatherIcon(weather.weatherCode).color : '';

        days.push(
          <div
            key={day.toString()}
            onClick={() => handleDateClick(cloneDay)}
            className={`
              relative h-16 flex flex-col items-center justify-start pt-2 rounded-xl text-sm font-medium transition-all m-0.5 cursor-pointer border
              ${!isCurrentMonth ? 'text-slate-300 border-transparent' : 'border-slate-50'}
              ${isAvailable && !isSelected ? 'hover:bg-slate-50 text-slate-700' : ''}
              ${!isAvailable && isCurrentMonth ? 'text-slate-300 cursor-not-allowed bg-slate-50/50' : ''}
              ${isSelected ? 'bg-slate-900 text-white shadow-lg shadow-slate-200 scale-105 z-10 border-slate-900' : ''}
            `}
          >
            <span>{formattedDate}</span>
            
            {/* Weather & Availability Indicators */}
            <div className="mt-1 flex flex-col items-center">
                {weather && WeatherIcon && isAvailable && (
                    <div className={`flex flex-col items-center leading-none ${isSelected ? 'text-white' : ''}`}>
                         <div className={`${isSelected ? 'text-yellow-300' : wColor} mb-0.5`}>
                             <WeatherIcon size={14} />
                         </div>
                         <span className={`text-[9px] font-bold ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                             {Math.round(weather.maxTemp)}°
                         </span>
                    </div>
                )}
                
                {/* Green Dot if available (and no weather or not overlapping visually too much) */}
                {isAvailable && isCurrentMonth && !isSelected && !weather && (
                  <div className="mt-1 w-1 h-1 bg-green-400 rounded-full"></div>
                )}
                
                {/* Strike line for unavailable */}
                {!isAvailable && isCurrentMonth && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-8 h-[1px] bg-slate-300 rotate-45"></div>
                    </div>
                )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="mb-6">{rows}</div>;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white shrink-0">
          <div className="flex justify-between items-start mb-4">
             <div>
                <h3 className="text-xl font-bold">{t.selectDate}</h3>
                <p className="text-slate-400 text-sm flex items-center gap-1 mt-1">
                   <Clock size={14} /> {t.duration}: {trip.durationDays} {trip.durationDays === 1 ? t.day : t.days}
                </p>
             </div>
             <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
               <X size={20} />
             </button>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium bg-slate-800/50 p-3 rounded-xl border border-white/10">
             <Calendar size={14} className="text-blue-400"/>
             <span>{t.availability} <b>{format(tripStart, 'd MMM', { locale })}</b> {t.to} <b>{format(tripEnd, 'd MMM yyyy', { locale })}</b></span>
          </div>
        </div>

        {/* Calendar Body */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          {renderHeader()}
          {renderDays()}
          {renderCells()}
          
          <div className="flex items-center gap-4 text-xs text-slate-500 justify-center">
             {selectedDate && weatherMap[format(selectedDate, 'yyyy-MM-dd')] && (
                 <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg text-blue-700 border border-blue-100 animate-in fade-in">
                    {(() => {
                        const w = weatherMap[format(selectedDate, 'yyyy-MM-dd')];
                        const Icon = getWeatherIcon(w.weatherCode).icon;
                        return <Icon size={14} />;
                    })()}
                    <span className="font-bold">{t.forecast}: {getWeatherIcon(weatherMap[format(selectedDate, 'yyyy-MM-dd')].weatherCode).label} ({weatherMap[format(selectedDate, 'yyyy-MM-dd')].minTemp}° / {weatherMap[format(selectedDate, 'yyyy-MM-dd')].maxTemp}°)</span>
                 </div>
             )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 shrink-0 bg-slate-50">
           <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-slate-500">{t.startDate}</span>
              <span className="font-bold text-slate-900 text-lg">
                {selectedDate ? format(selectedDate, 'd MMMM yyyy', { locale }) : '-'}
              </span>
           </div>
           <button 
             disabled={!selectedDate}
             onClick={() => selectedDate && onConfirm(format(selectedDate, 'yyyy-MM-dd'))}
             className={`w-full py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
               selectedDate 
               ? 'bg-slate-900 text-white shadow-lg hover:bg-slate-800 transform hover:-translate-y-0.5' 
               : 'bg-slate-200 text-slate-400 cursor-not-allowed'
             }`}
           >
             <CheckCircle size={20} /> {t.confirm}
           </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;