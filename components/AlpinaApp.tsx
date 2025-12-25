import React, { useState } from 'react';
import { Trip, Client, Difficulty, ActivityType, SportsPassport, Review, Guide, ChatConversation } from '../types';
import Marketplace from './Marketplace';
import Dashboard from './Dashboard';
import ClientProfile from './ClientProfile';
import FeedbackModal from './FeedbackModal';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Mountain, LayoutDashboard, Compass, User, MessageSquare } from 'lucide-react';

// --- HELPER FOR DYNAMIC DATES ---
const getRelativeDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

// --- MOCK CHAT DATA ---
const MOCK_GUIDE_CHATS: ChatConversation[] = [
  {
    id: 'c1',
    participantId: 'client-1',
    participantName: 'Marco Rossi',
    participantAvatar: 'https://ui-avatars.com/api/?name=Marco+Rossi&background=random',
    participantRole: 'Client',
    lastMessage: 'Perfetto, ci vediamo al parcheggio alle 8:00.',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    unreadCount: 1,
    messages: [
      { id: 'm1', senderId: 'client-1', text: 'Ciao Jean-Pierre, per l\'uscita di domani serve il kit da valanga?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), read: true },
      { id: 'm2', senderId: 'me', text: 'Ciao Marco! Sì, assolutamente. ARTVA, pala e sonda sono obbligatori.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5).toISOString(), read: true },
      { id: 'm3', senderId: 'client-1', text: 'Perfetto, ci vediamo al parcheggio alle 8:00.', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), read: false }
    ]
  },
  {
    id: 'c2',
    participantId: 'client-2',
    participantName: 'Elena Bianchi',
    participantAvatar: 'https://ui-avatars.com/api/?name=Elena+Bianchi&background=random',
    participantRole: 'Client',
    lastMessage: 'Grazie mille per le informazioni!',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    unreadCount: 0,
    messages: [
      { id: 'm4', senderId: 'me', text: 'Ciao Elena, ho confermato la tua prenotazione per il corso.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(), read: true },
      { id: 'm5', senderId: 'client-2', text: 'Grazie mille per le informazioni!', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), read: true }
    ]
  }
];

const MOCK_CLIENT_CHATS: ChatConversation[] = [
  {
    id: 'c1',
    participantId: 'g1',
    participantName: 'Jean-Pierre Luc',
    participantAvatar: 'https://ui-avatars.com/api/?name=Jean+Pierre&background=0d9488&color=fff',
    participantRole: 'Guide',
    lastMessage: 'Ci vediamo al rifugio!',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    unreadCount: 0,
    messages: [
      { id: 'm1', senderId: 'me', text: 'Ciao, confermi che il meteo è buono per sabato?', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), read: true },
      { id: 'm2', senderId: 'g1', text: 'Sì, previsioni ottime. Sole e zero vento.', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), read: true },
      { id: 'm3', senderId: 'g1', text: 'Ci vediamo al rifugio!', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), read: true }
    ]
  }
];

// --- MOCK DATA ---
const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    authorName: 'Guida Alpina Marco',
    rating: 5,
    comment: 'Cliente eccellente, ottima preparazione fisica e tecnica. Molto rispettoso della montagna.',
    date: '2023-08-10',
    role: 'Guide'
  },
  {
    id: 'r2',
    authorName: 'Guida Luca B.',
    rating: 4,
    comment: 'Buona resistenza, tecnica da affinare sul ripido, ma grande entusiasmo.',
    date: '2023-02-15',
    role: 'Guide'
  }
];

const MOCK_PASSPORT: SportsPassport = {
  level: 'Intermedio',
  verified: true,
  yearsExperience: 5,
  lastAscents: ['Gran Paradiso', 'Breithorn Occidentale', 'Piz Palü'],
  fitnessScore: 85,
  technicalScore: 65
};

const MOCK_CLIENT: Client = {
  id: 'client-1',
  name: 'Marco Rossi',
  email: 'marco@test.com',
  passport: MOCK_PASSPORT,
  billingInfo: {
    address: 'Via delle Alpi 12',
    city: 'Milano',
    zipCode: '20100',
    country: 'Italia',
    taxId: 'RSSMRC80A01H501U'
  },
  reviews: MOCK_REVIEWS,
  transactions: [
    {
      id: 'tx-001',
      date: '2023-12-15',
      description: 'Acconto prenotazione',
      amount: 150,
      type: 'deposit',
      status: 'completed',
      guideName: 'Jean-Pierre Luc',
      tripTitle: 'Freeride a Courmayeur',
      method: 'Credit Card'
    },
    {
      id: 'tx-002',
      date: getRelativeDate(-1), // Yesterday
      description: 'Saldo finale',
      amount: 200,
      type: 'balance',
      status: 'pending',
      guideName: 'Jean-Pierre Luc',
      tripTitle: 'Freeride a Courmayeur',
      method: 'Bank Transfer'
    },
    {
      id: 'tx-003',
      date: '2023-11-20',
      description: 'Pagamento completo',
      amount: 360,
      type: 'full_payment',
      status: 'completed',
      guideName: 'Sara Conti',
      tripTitle: 'Corso Base Arrampicata',
      method: 'Apple Pay'
    },
    {
      id: 'tx-004',
      date: '2023-10-05',
      description: 'Rimborso per maltempo',
      amount: 120,
      type: 'refund',
      status: 'completed',
      guideName: 'Marco Belli',
      tripTitle: 'Canyoning Val Bodengo',
      method: 'Credit Card'
    }
  ]
};

const SECOND_CLIENT: Client = {
  id: 'client-2',
  name: 'Elena Bianchi',
  email: 'elena@test.com',
  passport: { ...MOCK_PASSPORT, level: 'Esperto', yearsExperience: 8 },
  reviews: [],
  requestedDate: getRelativeDate(2),
  transactions: []
};

const THIRD_CLIENT: Client = {
  id: 'client-3',
  name: 'Roberto Verdi',
  email: 'rob@test.com',
  passport: { ...MOCK_PASSPORT, level: 'Principiante', yearsExperience: 1 },
  reviews: [],
  requestedDate: getRelativeDate(5),
  transactions: []
};

const MOCK_GUIDE: Guide = {
  id: 'g1',
  name: 'Jean-Pierre Luc',
  email: 'jp.luc@guidealpine.it',
  phoneNumber: '+39 333 1234567',
  avatar: 'https://ui-avatars.com/api/?name=Jean+Pierre&background=0d9488&color=fff',
  alboNumber: 'IT-AO-1234',
  bio: 'Guida Alpina UIAGM con oltre 15 anni di esperienza. Specializzato in sci alpinismo e alta quota. Vivo a Courmayeur.',
  reviews: [
      { id: 'gr1', authorName: 'Paolo V.', rating: 5, comment: 'Jean-Pierre è una sicurezza. Conosce il Monte Bianco come le sue tasche.', date: '2023-04-12', role: 'Client' },
      { id: 'gr2', authorName: 'Anna S.', rating: 5, comment: 'Gita fantastica, grande professionalità e simpatia.', date: '2023-08-20', role: 'Client' },
      { id: 'gr3', authorName: 'Mark D.', rating: 4, comment: 'Very good guide, excellent English.', date: '2023-02-10', role: 'Client' }
  ],
  earningsHistory: [
    { month: 'Gen', amount: 3200, tripsCount: 8 },
    { month: 'Feb', amount: 4500, tripsCount: 12 },
    { month: 'Mar', amount: 3800, tripsCount: 10 },
    { month: 'Apr', amount: 2100, tripsCount: 5 },
    { month: 'Mag', amount: 1500, tripsCount: 4 },
    { month: 'Giu', amount: 4200, tripsCount: 11 },
    { month: 'Lug', amount: 5100, tripsCount: 14 },
    { month: 'Ago', amount: 4800, tripsCount: 13 },
    { month: 'Set', amount: 3000, tripsCount: 7 },
    { month: 'Ott', amount: 1800, tripsCount: 4 },
    { month: 'Nov', amount: 1200, tripsCount: 3 },
    { month: 'Dic', amount: 2900, tripsCount: 8 },
  ],
  marketTrends: [
    { activity: 'Ski Touring', demand: 85 },
    { activity: 'Freeride', demand: 60 },
    { activity: 'Ice Climbing', demand: 30 },
    { activity: 'Alpinismo', demand: 75 },
  ],
  clientOrigins: [
    { region: 'Lombardia', count: 45 },
    { region: 'Piemonte', count: 20 },
    { region: 'Veneto', count: 15 },
    { region: 'Estero (UE)', count: 12 },
    { region: 'Estero (Extra UE)', count: 8 },
  ],
  clientDemographics: [
    { range: '16-25', count: 12 },
    { range: '26-40', count: 45 },
    { range: '41-55', count: 28 },
    { range: '55-70', count: 10 },
    { range: 'Over 70', count: 5 },
  ],
  activityPerformance: [
    { activity: 'Sci Alp.', revenue: 90, demand: 85, satisfaction: 95 },
    { activity: 'Alpin.', revenue: 80, demand: 70, satisfaction: 88 },
    { activity: 'Arram.', revenue: 60, demand: 50, satisfaction: 92 },
    { activity: 'Freeride', revenue: 75, demand: 65, satisfaction: 90 },
    { activity: 'Canyon.', revenue: 40, demand: 30, satisfaction: 85 },
    { activity: 'Ghiac.', revenue: 55, demand: 40, satisfaction: 98 },
  ],
  invoices: [
    { id: 'INV-001', clientName: 'Mario Rossi', date: '2024-02-10', amount: 350, status: 'Paid' },
    { id: 'INV-002', clientName: 'Giulia Bianchi', date: '2024-02-15', amount: 400, status: 'Pending' },
    { id: 'INV-003', clientName: 'Team RedBull', date: '2024-01-20', amount: 1200, status: 'Paid' },
  ]
};

// --- DATA GENERATION HELPERS ---

const LOCATIONS = [
  { loc: 'Courmayeur, AO', lat: 45.7969, lng: 6.9672, img: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=1000' },
  { loc: 'Dolomiti, TN', lat: 46.4102, lng: 11.8440, img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000' },
  { loc: 'Cervinia, AO', lat: 45.9336, lng: 7.6310, img: 'https://images.unsplash.com/photo-1518182170546-07fa6ee06940?q=80&w=1000' },
  { loc: 'Gran Sasso, AQ', lat: 42.4529, lng: 13.5574, img: 'https://images.unsplash.com/photo-1662973767675-eb7ac8c3a276?q=80&w=1000' },
  { loc: 'Finale Ligure, SV', lat: 44.1706, lng: 8.3435, img: 'https://images.unsplash.com/photo-1522690984813-f9a882d92176?q=80&w=1000' },
  { loc: 'Etna, CT', lat: 37.7510, lng: 14.9934, img: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=1000' },
  { loc: 'Val di Mello, SO', lat: 46.2084, lng: 9.6322, img: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?q=80&w=1000' },
  { loc: 'Adamello, BS', lat: 46.1500, lng: 10.5000, img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1000' }
];

const ACTIVITIES = [
  { type: ActivityType.SkiTouring, title: 'Ski Tour Adventure', diff: Difficulty.Hard, price: 350 },
  { type: ActivityType.Climbing, title: 'Corso Arrampicata', diff: Difficulty.Moderate, price: 300 },
  { type: ActivityType.Mountaineering, title: 'Salita Classica Vetta', diff: Difficulty.Expert, price: 450 },
  { type: ActivityType.Freeride, title: 'Powder Day', diff: Difficulty.Hard, price: 380 },
  { type: ActivityType.Hiking, title: 'Trekking Panoramico', diff: Difficulty.Easy, price: 150 },
  { type: ActivityType.Canyoning, title: 'Canyoning Experience', diff: Difficulty.Moderate, price: 200 },
];

const GUIDE_NAMES = ['Jean-Pierre Luc', 'Sara Conti', 'Marco Belli', 'Luca Ferrari', 'Giulia Bianchi'];
const GUIDE_AVATARS = [
    'https://ui-avatars.com/api/?name=Jean+Pierre&background=0d9488&color=fff',
    'https://ui-avatars.com/api/?name=Sara+Conti&background=ec4899&color=fff',
    'https://ui-avatars.com/api/?name=Marco+Belli&background=f59e0b&color=fff',
    'https://ui-avatars.com/api/?name=Luca+Ferrari&background=3b82f6&color=fff',
    'https://ui-avatars.com/api/?name=Giulia+Bianchi&background=8b5cf6&color=fff'
];

// Base trips to preserve specific data
const BASE_TRIPS: Trip[] = [
  {
    id: 't1',
    title: 'Freeride a Courmayeur',
    location: 'Courmayeur, AO',
    coordinates: { lat: 45.7969, lng: 6.9672 },
    date: getRelativeDate(2),
    availableFrom: getRelativeDate(-2),
    availableTo: getRelativeDate(25),
    durationDays: 1,
    price: 350,
    difficulty: Difficulty.Hard,
    activityType: ActivityType.SkiTouring,
    description: 'Giornata dedicata al freeride sui pendii del Monte Bianco. Richiesta ottima tecnica di sci fuoripista.',
    equipment: ['ARTVA', 'Pala', 'Sonda', 'Sci larghi'],
    guideId: 'g1',
    guideName: 'Jean-Pierre Luc',
    guideAvatar: 'https://ui-avatars.com/api/?name=Jean+Pierre&background=0d9488&color=fff',
    guideRating: 4.9,
    maxParticipants: 4,
    enrolledClients: [{...SECOND_CLIENT, requestedDate: getRelativeDate(1)}], 
    pendingRequests: [{ ...MOCK_CLIENT, requestedDate: getRelativeDate(2) }],
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=1000&auto=format&fit=crop',
    status: 'upcoming',
    paymentStatus: 'deposit'
  },
  {
    id: 't2',
    title: 'Corso Base Arrampicata',
    location: 'Arco, TN',
    coordinates: { lat: 45.9177, lng: 10.8867 },
    date: getRelativeDate(10),
    availableFrom: getRelativeDate(5),
    availableTo: getRelativeDate(60),
    durationDays: 3,
    price: 360,
    difficulty: Difficulty.Easy,
    activityType: ActivityType.Climbing,
    description: 'Impara le basi della sicurezza e del movimento in verticale nella mecca dell\'arrampicata italiana. Corso di 3 giorni.',
    equipment: ['Scarpette', 'Imbrago', 'Casco'],
    guideId: 'g2',
    guideName: 'Sara Conti',
    guideAvatar: 'https://ui-avatars.com/api/?name=Sara+Conti&background=ec4899&color=fff',
    guideRating: 4.8,
    maxParticipants: 6,
    enrolledClients: [],
    pendingRequests: [],
    image: 'https://images.unsplash.com/photo-1522690984813-f9a882d92176?q=80&w=1000&auto=format&fit=crop',
    status: 'upcoming',
    paymentStatus: 'pending'
  },
  {
    id: 't3',
    title: 'Corso Cascate Ghiaccio',
    location: 'Cogne, AO',
    coordinates: { lat: 45.6083, lng: 7.3556 },
    date: getRelativeDate(5),
    availableFrom: getRelativeDate(3),
    availableTo: getRelativeDate(12),
    durationDays: 2,
    price: 400,
    difficulty: Difficulty.Moderate,
    activityType: ActivityType.IceClimbing,
    description: 'Introduzione all\'arrampicata su ghiaccio nelle famose cascate di Lillaz.',
    equipment: ['Ramponi', 'Piccozze', 'Imbrago', 'Casco'],
    guideId: 'g1',
    guideName: 'Jean-Pierre Luc',
    guideAvatar: 'https://ui-avatars.com/api/?name=Jean+Pierre&background=0d9488&color=fff',
    guideRating: 4.9,
    maxParticipants: 4,
    enrolledClients: [{...SECOND_CLIENT, requestedDate: getRelativeDate(5)}],
    pendingRequests: [],
    image: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?q=80&w=1000&auto=format&fit=crop',
    status: 'upcoming',
    paymentStatus: 'pending'
  },
  {
    id: 't4',
    title: 'Haute Route Chamonix-Zermatt',
    location: 'Chamonix, FR',
    coordinates: { lat: 45.9237, lng: 6.8694 },
    date: getRelativeDate(20),
    availableFrom: getRelativeDate(18),
    availableTo: getRelativeDate(25),
    durationDays: 6,
    price: 1200,
    difficulty: Difficulty.Expert,
    activityType: ActivityType.SkiTouring,
    description: 'La traversata scialpinistica più famosa delle Alpi. 6 giorni di avventura pura.',
    equipment: ['Kit completo scialpinismo', 'Ramponi', 'Piccozza', 'Imbrago'],
    guideId: 'g1',
    guideName: 'Jean-Pierre Luc',
    guideAvatar: 'https://ui-avatars.com/api/?name=Jean+Pierre&background=0d9488&color=fff',
    guideRating: 4.9,
    maxParticipants: 6,
    enrolledClients: [],
    pendingRequests: [{ ...MOCK_CLIENT, requestedDate: getRelativeDate(20) }],
    image: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?q=80&w=1000&auto=format&fit=crop',
    status: 'upcoming',
    paymentStatus: 'pending'
  },
  {
    id: 't7',
    title: 'Ascesa al Gran Paradiso',
    location: 'Valsavarenche, AO',
    coordinates: { lat: 45.5204, lng: 7.2662 },
    date: getRelativeDate(1),
    availableFrom: getRelativeDate(0),
    availableTo: getRelativeDate(15),
    durationDays: 2,
    price: 450,
    difficulty: Difficulty.Hard,
    activityType: ActivityType.Mountaineering,
    description: 'L\'unico 4000 interamente italiano. Salita classica dal rifugio Vittorio Emanuele.',
    equipment: ['Ramponi', 'Piccozza', 'Imbrago', 'Casco'],
    guideId: 'g1',
    guideName: 'Jean-Pierre Luc',
    guideAvatar: 'https://ui-avatars.com/api/?name=Jean+Pierre&background=0d9488&color=fff',
    guideRating: 4.9,
    maxParticipants: 4,
    enrolledClients: [{...THIRD_CLIENT, requestedDate: getRelativeDate(1)}],
    pendingRequests: [],
    image: 'https://images.unsplash.com/photo-1605540436563-5bca919bdd35?q=80&w=1000&auto=format&fit=crop',
    status: 'upcoming',
    paymentStatus: 'paid'
  }
];

// Generator to reach 40 items
const generateMockTrips = (targetCount: number): Trip[] => {
    const generated: Trip[] = [];
    const needed = targetCount - BASE_TRIPS.length;

    for (let i = 0; i < needed; i++) {
        const loc = LOCATIONS[i % LOCATIONS.length];
        const act = ACTIVITIES[i % ACTIVITIES.length];
        const guideIdx = i % GUIDE_NAMES.length;
        
        // Randomize date between -20 days and +60 days
        const offset = Math.floor(Math.random() * 80) - 20; 
        const date = getRelativeDate(offset);
        
        let status: Trip['status'] = 'upcoming';
        let payment: Trip['paymentStatus'] = 'pending';
        
        if (offset < 0) {
            status = Math.random() > 0.8 ? 'cancelled' : 'completed';
            payment = status === 'completed' ? 'paid' : 'deposit';
        } else {
            status = 'upcoming';
            payment = Math.random() > 0.5 ? 'deposit' : 'pending';
        }

        generated.push({
            id: `gen-${i}`,
            title: `${act.title} @ ${loc.loc.split(',')[0]}`,
            location: loc.loc,
            coordinates: { lat: loc.lat + (Math.random() * 0.05 - 0.025), lng: loc.lng + (Math.random() * 0.05 - 0.025) }, // Jitter coords
            date: date,
            availableFrom: getRelativeDate(offset - 2),
            availableTo: getRelativeDate(offset + 5),
            durationDays: Math.floor(Math.random() * 3) + 1,
            price: act.price + Math.floor(Math.random() * 50),
            difficulty: act.diff,
            activityType: act.type,
            description: `Un'esperienza indimenticabile di ${act.type} nella splendida cornice di ${loc.loc}. Adatto a chi cerca avventura e natura.`,
            equipment: ['Attrezzatura tecnica', 'Abbigliamento adeguato', 'Zaino 30L', 'Pranzo al sacco'],
            guideId: `g-${guideIdx}`,
            guideName: GUIDE_NAMES[guideIdx],
            guideAvatar: GUIDE_AVATARS[guideIdx],
            guideRating: 4.5 + (Math.random() * 0.5),
            maxParticipants: 4 + Math.floor(Math.random() * 4),
            enrolledClients: Math.random() > 0.5 ? [{...SECOND_CLIENT, requestedDate: date}] : [],
            pendingRequests: Math.random() > 0.7 ? [{...MOCK_CLIENT, requestedDate: date}] : [],
            image: loc.img,
            status: status,
            paymentStatus: payment
        });
    }

    // Sort all by date
    return [...BASE_TRIPS, ...generated].sort((a, b) => a.date.localeCompare(b.date));
};

const EXTRA_GUIDE_TRIPS: Trip[] = [];

// 15 Future Trips for g1
for(let i=0; i<15; i++) {
    const act = ACTIVITIES[i % ACTIVITIES.length];
    const loc = LOCATIONS[i % LOCATIONS.length];
    EXTRA_GUIDE_TRIPS.push({
        id: `g1-future-${i}`,
        title: `${act.title} - Gruppo ${i+1}`,
        location: loc.loc,
        coordinates: { lat: loc.lat, lng: loc.lng },
        date: getRelativeDate(3 + i), // Starting from 3 days in future
        availableFrom: getRelativeDate(1 + i),
        availableTo: getRelativeDate(10 + i),
        durationDays: 1,
        price: act.price,
        difficulty: act.diff,
        activityType: act.type,
        description: "Uscita di gruppo organizzata per livelli intermedi.",
        equipment: ["Kit standard"],
        guideId: 'g1',
        guideName: 'Jean-Pierre Luc',
        guideAvatar: 'https://ui-avatars.com/api/?name=Jean+Pierre&background=0d9488&color=fff',
        guideRating: 4.9,
        maxParticipants: 6,
        enrolledClients: [],
        pendingRequests: [],
        image: loc.img,
        status: 'upcoming',
        paymentStatus: 'pending'
    });
}

// 10 Past Trips for g1 (History)
for(let i=0; i<10; i++) {
    const act = ACTIVITIES[(i+2) % ACTIVITIES.length];
    const loc = LOCATIONS[(i+2) % LOCATIONS.length];
    EXTRA_GUIDE_TRIPS.push({
        id: `g1-past-${i}`,
        title: `${act.title} - Sessione ${i+1}`,
        location: loc.loc,
        coordinates: { lat: loc.lat, lng: loc.lng },
        date: getRelativeDate(-10 - (i*2)), // Past dates
        availableFrom: getRelativeDate(-15 - (i*2)),
        availableTo: getRelativeDate(-5 - (i*2)),
        durationDays: 1,
        price: act.price,
        difficulty: act.diff,
        activityType: act.type,
        description: "Uscita completata con successo.",
        equipment: ["Kit standard"],
        guideId: 'g1',
        guideName: 'Jean-Pierre Luc',
        guideAvatar: 'https://ui-avatars.com/api/?name=Jean+Pierre&background=0d9488&color=fff',
        guideRating: 4.9,
        maxParticipants: 4,
        enrolledClients: [{...MOCK_CLIENT}, {...SECOND_CLIENT}],
        pendingRequests: [],
        image: loc.img,
        status: 'completed',
        paymentStatus: 'paid'
    });
}

const INITIAL_TRIPS: Trip[] = [...generateMockTrips(80), ...EXTRA_GUIDE_TRIPS].sort((a, b) => a.date.localeCompare(b.date));

const Navbar = ({ lang }: { lang: 'it' | 'en' }) => {
  const location = useLocation();
  const isDashboard = location.pathname.includes('/dashboard');
  const isProfile = location.pathname.includes('/profile');
  const isMarketplace = !isDashboard && !isProfile;

  const t = {
    it: {
      market: "Marketplace",
      guideArea: "Area Guide",
      profile: "Area Clienti"
    },
    en: {
      market: "Marketplace",
      guideArea: "Guide Area",
      profile: "Client Area"
    }
  }[lang];

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/50 supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="bg-slate-900 p-1.5 rounded-lg text-white transition-transform group-hover:scale-110 duration-300">
              <Mountain size={18} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900 hidden sm:block">AlpsConnect</span>
          </Link>
          
          <div className="flex items-center gap-1 md:gap-4 flex-1 justify-end">
            <Link 
              to="/app" 
              className={`flex flex-col md:flex-row items-center gap-0.5 md:gap-2 px-2 md:px-3 py-1 md:py-2 rounded-lg md:rounded-full transition-all ${isMarketplace ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              <Compass size={18} className="md:w-5 md:h-5" /> 
              <span className="text-[10px] md:text-sm font-medium">{t.market}</span>
            </Link>
            
            <Link 
              to="/app/dashboard" 
              className={`flex flex-col md:flex-row items-center gap-0.5 md:gap-2 px-2 md:px-3 py-1 md:py-2 rounded-lg md:rounded-full transition-all ${isDashboard ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              <LayoutDashboard size={18} className="md:w-5 md:h-5" /> 
              <span className="text-[10px] md:text-sm font-medium">{t.guideArea}</span>
            </Link>
            
            <Link 
              to="/app/profile" 
              className={`flex flex-col md:flex-row items-center gap-0.5 md:gap-2 px-2 md:px-3 py-1 md:py-2 rounded-lg md:rounded-full transition-all ${isProfile ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              <User size={18} className="md:w-5 md:h-5" /> 
              <span className="text-[10px] md:text-sm font-medium">{t.profile}</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

const AlpinaApp = ({ lang }: { lang: 'it' | 'en' }) => {
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);
  const [chats, setChats] = useState<ChatConversation[]>(MOCK_GUIDE_CHATS); // Default to guide view chats
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const location = useLocation();

  const handleAddTrip = (newTrip: Trip) => {
    setTrips([...trips, newTrip]);
  };

  const handleRequestJoin = (tripId: string, date: string) => {
    // Mock functionality: Add pending request to trip
    setTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        return {
          ...t,
          pendingRequests: [...t.pendingRequests, { ...MOCK_CLIENT, requestedDate: date }]
        };
      }
      return t;
    }));
    alert(lang === 'it' ? "Richiesta inviata con successo!" : "Request sent successfully!");
  };

  const handleApproveRequest = (tripId: string, client: Client) => {
    setTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        return {
          ...t,
          pendingRequests: t.pendingRequests.filter(req => req.id !== client.id),
          enrolledClients: [...t.enrolledClients, client]
        };
      }
      return t;
    }));
  };

  const t = {
    it: { feedback: "Feedback" },
    en: { feedback: "Feedback" }
  }[lang];

  // Only show trips belonging to the logged-in guide (Mock Guide ID: g1)
  const myTrips = trips.filter(t => t.guideId === 'g1');

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <Navbar lang={lang} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Routes>
          <Route 
            path="/" 
            element={<Marketplace trips={trips.filter(t => t.status !== 'cancelled')} onRequestJoin={handleRequestJoin} lang={lang} />} 
          />
          <Route 
            path="/dashboard" 
            element={
              <Dashboard 
                trips={myTrips} 
                onAddTrip={handleAddTrip} 
                onApproveRequest={handleApproveRequest}
                guide={MOCK_GUIDE}
                chats={MOCK_GUIDE_CHATS}
                lang={lang}
              />
            } 
          />
          <Route 
            path="/profile" 
            element={<ClientProfile client={MOCK_CLIENT} chats={MOCK_CLIENT_CHATS} lang={lang} />} 
          />
        </Routes>
      </div>

      {/* Floating Feedback Button (Mini) - Always present in App too */}
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} lang={lang} /> 

      {/* Floating Action Button */}
      <button 
         onClick={() => setIsFeedbackOpen(true)}
         className="fixed bottom-6 right-6 z-50 bg-yellow-400 hover:bg-yellow-500 text-slate-900 p-3 md:p-4 rounded-full shadow-2xl transition-transform hover:scale-110 flex items-center gap-2 font-bold"
      >
         <MessageSquare size={20} className="md:w-6 md:h-6" />
         <span className="hidden md:inline">{t.feedback}</span>
      </button>
    </div>
  );
};

export default AlpinaApp;