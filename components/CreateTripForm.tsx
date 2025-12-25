import React, { useState } from 'react';
import { ActivityType, Difficulty, Trip } from '../types';
import { generateTripDraft } from '../services/geminiService';
import { Sparkles, MapPin, DollarSign, Loader2, Clock, Map as MapIcon } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

interface Props {
  onSave: (trip: Trip) => void;
  onCancel: () => void;
  lang?: 'it' | 'en';
}

// Component to handle map clicks
const LocationMarker = ({ position, setPosition }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position ? <Marker position={position} /> : null;
};

const CreateTripForm: React.FC<Props> = ({ onSave, onCancel, lang = 'it' }) => {
  const [loading, setLoading] = useState(false);
  const [mapPosition, setMapPosition] = useState<L.LatLng | null>(new L.LatLng(45.8, 9.0)); // Default roughly North Italy
  
  const [formData, setFormData] = useState<Partial<Trip>>({
    title: '',
    location: '',
    coordinates: { lat: 45.8, lng: 9.0 }, 
    activityType: ActivityType.SkiTouring,
    difficulty: Difficulty.Moderate,
    availableFrom: '',
    availableTo: '',
    durationDays: 1,
    price: 0,
    description: '',
    equipment: []
  });

  const t = {
    it: {
        title: "Crea Nuova Proposta",
        aiBtn: "Assistente AI",
        generating: "Generazione in corso...",
        formTitle: "Titolo Attività",
        location: "Località (Nome)",
        duration: "Durata (Giorni)",
        period: "Periodo Disponibilità",
        from: "Dal",
        to: "Al",
        activity: "Attività",
        difficulty: "Difficoltà",
        price: "Prezzo (€) a persona",
        map: "Seleziona Posizione sulla Mappa",
        mapDesc: "Clicca sulla mappa per impostare le coordinate precise.",
        desc: "Descrizione",
        descPlace: "Descrivi l'itinerario e i punti salienti...",
        aiWriting: "L'AI sta scrivendo...",
        equip: "Equipaggiamento Richiesto",
        equipHint: 'Clicca "Assistente AI" per suggerire l\'equipaggiamento.',
        cancel: "Annulla",
        publish: "Pubblica Proposta",
        placeTitle: "es. Traversata del Monte Bianco",
        placeLoc: "Zona"
    },
    en: {
        title: "Create New Trip",
        aiBtn: "AI Assistant",
        generating: "Generating...",
        formTitle: "Activity Title",
        location: "Location (Name)",
        duration: "Duration (Days)",
        period: "Availability Period",
        from: "From",
        to: "To",
        activity: "Activity",
        difficulty: "Difficulty",
        price: "Price (€) per person",
        map: "Select Position on Map",
        mapDesc: "Click on map to set precise coordinates.",
        desc: "Description",
        descPlace: "Describe the itinerary and highlights...",
        aiWriting: "AI is writing...",
        equip: "Required Equipment",
        equipHint: 'Click "AI Assistant" to suggest equipment.',
        cancel: "Cancel",
        publish: "Publish Trip",
        placeTitle: "ex. Mont Blanc Traverse",
        placeLoc: "Area"
    }
  }[lang];

  // Update coordinates when map is clicked
  const handleMapClick = (latlng: L.LatLng) => {
    setMapPosition(latlng);
    setFormData(prev => ({
      ...prev,
      coordinates: { lat: latlng.lat, lng: latlng.lng }
    }));
  };

  const handleGenerateAI = async () => {
    if (!formData.location) return;
    setLoading(true);
    try {
      const data = await generateTripDraft(
        formData.location, 
        formData.activityType as ActivityType, 
        formData.difficulty as Difficulty
      );
      setFormData(prev => ({
        ...prev,
        description: data.description,
        equipment: data.equipment,
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTrip: Trip = {
      ...formData as Trip,
      date: formData.availableFrom || '', // Fallback for list view
      id: Math.random().toString(36).substr(2, 9),
      guideId: 'guide-1',
      maxParticipants: 4,
      enrolledClients: [],
      pendingRequests: [],
      image: `https://picsum.photos/seed/${formData.location}/800/600`
    };
    onSave(newTrip);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800">{t.title}</h2>
        <button 
          type="button"
          onClick={handleGenerateAI}
          disabled={!formData.location || loading}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all
            ${!formData.location ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-purple-100 text-purple-700 hover:bg-purple-200 ring-1 ring-purple-500/20'}
          `}
        >
          {loading ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
          {loading ? t.generating : t.aiBtn}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* LEFT COLUMN: Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.formTitle}</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
                placeholder={t.placeTitle}
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">{t.location}</label>
                 <div className="relative">
                   <MapPin className="absolute left-3 top-2.5 text-slate-400" size={16} />
                   <input 
                    required
                    type="text" 
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-500 outline-none"
                    placeholder={t.placeLoc}
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                   />
                 </div>
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">{t.duration}</label>
                 <div className="relative">
                   <Clock className="absolute left-3 top-2.5 text-slate-400" size={16} />
                   <input 
                    required
                    type="number" 
                    min="1"
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-500 outline-none"
                    value={formData.durationDays}
                    onChange={e => setFormData({...formData, durationDays: parseInt(e.target.value)})}
                   />
                 </div>
              </div>
            </div>

            {/* Disponibilità Calendario */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">{t.period}</label>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">{t.from}</label>
                    <input 
                      required
                      type="date" 
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                      value={formData.availableFrom}
                      onChange={e => setFormData({...formData, availableFrom: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">{t.to}</label>
                    <input 
                      required
                      type="date" 
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                      value={formData.availableTo}
                      onChange={e => setFormData({...formData, availableTo: e.target.value})}
                    />
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.activity}</label>
                <select 
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-500 outline-none bg-white"
                  value={formData.activityType}
                  onChange={e => setFormData({...formData, activityType: e.target.value as ActivityType})}
                >
                  {Object.values(ActivityType).map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.difficulty}</label>
                <select 
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-500 outline-none bg-white"
                  value={formData.difficulty}
                  onChange={e => setFormData({...formData, difficulty: e.target.value as Difficulty})}
                >
                  {Object.values(Difficulty).map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>

             <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">{t.price}</label>
                 <div className="relative">
                   <DollarSign className="absolute left-3 top-2.5 text-slate-400" size={16} />
                   <input 
                    required
                    type="number" 
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-500 outline-none"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: parseInt(e.target.value)})}
                   />
                 </div>
              </div>
          </div>

          {/* RIGHT COLUMN: Map & Description */}
          <div className="space-y-4 flex flex-col">
            
            {/* Map Picker */}
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                 <MapIcon size={16} /> {t.map}
               </label>
               <div className="h-48 w-full rounded-xl overflow-hidden border border-slate-300 shadow-inner">
                  <MapContainer 
                    center={[45.8, 9.0]} 
                    zoom={6} 
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker position={mapPosition} setPosition={handleMapClick} />
                  </MapContainer>
               </div>
               <p className="text-xs text-slate-500 mt-1">{t.mapDesc}</p>
            </div>

            <div className="flex-1 flex flex-col">
              <label className="block text-sm font-medium text-slate-700 mb-1 flex justify-between">
                <span>{t.desc}</span>
                {loading && <span className="text-purple-600 text-xs animate-pulse">{t.aiWriting}</span>}
              </label>
              <textarea 
                required
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-500 outline-none resize-none text-sm leading-relaxed flex-1 min-h-[120px]"
                placeholder={t.descPlace}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">{t.equip}</label>
               <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 h-24 overflow-y-auto text-sm text-slate-600">
                  {formData.equipment && formData.equipment.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {formData.equipment.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  ) : (
                    <p className="text-slate-400 italic">{t.equipHint}</p>
                  )}
               </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-6 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium transition-colors"
          >
            {t.cancel}
          </button>
          <button 
            type="submit" 
            className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium transition-colors shadow-lg shadow-slate-200"
          >
            {t.publish}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTripForm;