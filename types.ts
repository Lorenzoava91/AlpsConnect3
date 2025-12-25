export enum Difficulty {
  Easy = 'Facile',
  Moderate = 'Intermedio',
  Hard = 'Difficile',
  Expert = 'Estremo'
}

export enum ActivityType {
  SkiTouring = 'Sci Alpinismo',
  Climbing = 'Arrampicata',
  Hiking = 'Trekking',
  Mountaineering = 'Alpinismo',
  Freeride = 'Freeride',
  IceClimbing = 'Cascate di Ghiaccio',
  Canyoning = 'Canyoning'
}

export interface Review {
  id: string;
  authorName: string;
  authorAvatar?: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  role: 'Guide' | 'Client';
}

export interface SportsPassport {
  level: string;
  verified: boolean;
  yearsExperience: number;
  lastAscents: string[];
  fitnessScore: number; // 0-100
  technicalScore: number; // 0-100
}

export interface BillingInfo {
  address: string;
  city: string;
  zipCode: string;
  country: string;
  taxId: string; // Codice Fiscale
  vatNumber?: string; // Partita IVA (optional)
  sdiCode?: string; // Codice Univoco
  pec?: string;
}

export interface PaymentTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'deposit' | 'full_payment' | 'refund' | 'balance'; // Acconto, Saldo, Rimborso
  status: 'completed' | 'pending' | 'failed';
  guideName: string;
  tripTitle: string;
  method?: 'Credit Card' | 'Bank Transfer' | 'Apple Pay';
}

export interface Client {
  id: string;
  name: string;
  email: string;
  passport: SportsPassport;
  billingInfo?: BillingInfo;
  reviews: Review[];
  requestedDate?: string; // The date the client wants to book
  transactions: PaymentTransaction[];
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Trip {
  id: string;
  title: string;
  location: string;
  coordinates: Coordinates;
  
  // Availability Logic
  availableFrom: string; // ISO Date YYYY-MM-DD
  availableTo: string;   // ISO Date YYYY-MM-DD
  durationDays: number;
  
  // Legacy/Display date (can be removed later or used as "Season Start")
  date: string; 

  price: number;
  difficulty: Difficulty;
  activityType: ActivityType;
  description: string;
  equipment: string[];
  
  // Guide Info
  guideId: string;
  guideName: string;
  guideAvatar: string;
  guideRating: number;

  image: string;
  maxParticipants: number;
  enrolledClients: Client[];
  pendingRequests: Client[];

  // Status Logic
  status?: 'completed' | 'cancelled' | 'upcoming';
  paymentStatus?: 'paid' | 'deposit' | 'pending';
}

// Analytics Types
export interface MonthlyEarning {
  month: string;
  amount: number;
  tripsCount: number; // Added trip count for seasonality
}

export interface MarketTrend {
  activity: string;
  demand: number; // 0-100
}

export interface ClientOrigin {
  region: string;
  count: number;
}

export interface ClientDemographic {
  range: string; // e.g. "18-25"
  count: number;
}

export interface ActivityPerformance {
  activity: string;
  revenue: number; // normalized 0-100
  demand: number; // normalized 0-100
  satisfaction: number; // normalized 0-100
}

export interface Invoice {
  id: string;
  clientName: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending';
}

// Chat Types
export interface ChatMessage {
  id: string;
  senderId: string; // 'me' or other ID
  text: string;
  timestamp: string; // ISO string
  read: boolean;
}

export interface ChatConversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  participantRole: 'Guide' | 'Client';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export interface Guide {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  avatar: string;
  alboNumber: string; // Numero Iscrizione Albo
  bio: string;
  reviews: Review[];
  
  // Analytics Data
  earningsHistory: MonthlyEarning[];
  marketTrends: MarketTrend[];
  clientOrigins: ClientOrigin[]; // New
  clientDemographics: ClientDemographic[]; // New
  activityPerformance: ActivityPerformance[]; // New
  invoices: Invoice[];
}