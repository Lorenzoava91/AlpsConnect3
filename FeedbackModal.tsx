import React, { useState } from 'react';
import { Mail, FileText, X, Send, Star, MessageSquare, CheckCircle, User, AlertCircle, Sparkles, Loader2, Heart } from 'lucide-react';

// ----------------------------------------------------------------------
// CONFIGURAZIONE: Inserisci qui il tuo ID Formspree (es. 'xjdqlekw')
// Vai su https://formspree.io/ per crearne uno gratuito.
// Se lasciato vuoto, il sistema userà il client email (mailto) come fallback.
const FORMSPREE_ID = "xkowqwkq"; 
// ----------------------------------------------------------------------

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'it' | 'en';
}

const FeedbackModal: React.FC<Props> = ({ isOpen, onClose, lang = 'it' }) => {
  const [step, setStep] = useState<'choice' | 'form' | 'success'>('choice');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    rating: 0,
    role: 'Guida Alpina', 
    comment: '',
    // Specific for Guides
    q1_intro: '',
    q2_pain: '',
    q3_solution: '',
    // Specific for Fans (Appassionato)
    fan_email: '',
    fan_age: '',
    fan_level: '',
    fan_nationality: '',
    fan_prev_exp: '',
    fan_usage: ''
  });

  if (!isOpen) return null;

  const t = {
    it: {
      title: "Il tuo parere conta!",
      subtitle: "Aiutaci a costruire lo strumento definitivo. Come preferisci inviarci il tuo feedback?",
      btnEmail: "Invia una Email",
      btnEmailSub: "Apri il tuo client di posta",
      btnForm: "Compila Questionario",
      btnFormSub: "Rispondi a poche domande chiave",
      formTitle: "La tua esperienza",
      roleLabel: "Ti identifichi come:",
      roles: {
        guide: "Guida Alpina / Aspirante",
        fan: "Appassionato / Cliente",
        investor: "Investitore / Partner",
        other: "Altro"
      },
      ratingLabel: "Valutazione Idea",
      // Guide Section
      guideSection: "Domande specifiche per Professionisti (dal documento di progetto)",
      q1Label: "1. Intro",
      q1Desc: "Chi sei, da quanto tempo fai la Guida Alpina e in che zona operi?",
      q1Place: "Es. Marco, Guida da 10 anni in Dolomiti...",
      q2Label: "2. I \"Dolori\" (Pain Points)",
      q2Desc: "Qual è la parte più frustrante del tuo lavoro? (Visibilità, pagamenti, burocrazia...?)",
      q2Place: "Es. Rincorrere i clienti per i pagamenti, gestire le cancellazioni...",
      q3Label: "3. La Soluzione Ideale",
      q3Desc: "Se avessi una bacchetta magica, quale funzionalità ti cambierebbe la vita?",
      q3Place: "Es. Vorrei che la fattura partisse da sola appena il cliente paga...",
      // Fan Section
      fanSection: "Domande per Appassionati",
      fanEmail: "Indirizzo Email",
      fanAge: "Età",
      fanLevel: "Livello di esperienza in montagna",
      fanNationality: "Nazionalità",
      fanPrevExp: "Hai già avuto esperienze con guide alpine?",
      fanUsage: "Utilizzeresti questa app?",
      fanPlaceText: "Scrivi qui...",
      // General
      generalComment: "Suggerimenti o Commenti",
      generalPlace: "Cosa aggiungeresti o cambieresti?",
      submit: "Invia Risposte",
      sending: "Invio in corso...",
      back: "Indietro",
      thanks: "Grazie!",
      thanksGuide: "Le tue risposte sono state registrate nel nostro database.",
      thanksGen: "Il tuo feedback è stato salvato con successo.",
      centralizedNote: "Nota: I dati sono stati salvati in modo sicuro e centralizzato.",
      fallbackNote: "Nota: Si aprirà il tuo client di posta per l'invio manuale.",
      close: "Torna al Sito",
      error: "Si è verificato un errore durante l'invio. Riprova o usa l'email."
    },
    en: {
      title: "Your opinion matters!",
      subtitle: "Help us build the ultimate tool. How would you like to send your feedback?",
      btnEmail: "Send an Email",
      btnEmailSub: "Open your mail client",
      btnForm: "Fill out Questionnaire",
      btnFormSub: "Answer a few key questions",
      formTitle: "Your Experience",
      roleLabel: "You identify as:",
      roles: {
        guide: "Alpine Guide / Aspirant",
        fan: "Enthusiast / Client",
        investor: "Investor / Partner",
        other: "Other"
      },
      ratingLabel: "Idea Rating",
      // Guide Section
      guideSection: "Specific questions for Professionals",
      q1Label: "1. Intro",
      q1Desc: "Who are you, how long have you been a Guide, and where do you operate?",
      q1Place: "Ex. Mark, Guide for 10 years in the Dolomites...",
      q2Label: "2. Pain Points",
      q2Desc: "What is the most frustrating part of your job? (Visibility, payments, bureaucracy...?)",
      q2Place: "Ex. Chasing clients for payments, handling cancellations...",
      q3Label: "3. The Ideal Solution",
      q3Desc: "If you had a magic wand, what feature would change your work life?",
      q3Place: "Ex. I want invoices to send automatically when a client pays...",
      // Fan Section
      fanSection: "Questions for Enthusiasts",
      fanEmail: "Email Address",
      fanAge: "Age",
      fanLevel: "Mountain experience level",
      fanNationality: "Nationality",
      fanPrevExp: "Have you had experiences with alpine guides?",
      fanUsage: "Would you use this app?",
      fanPlaceText: "Type here...",
      // General
      generalComment: "Suggestions or Comments",
      generalPlace: "What would you add or change?",
      submit: "Send Answers",
      sending: "Sending...",
      back: "Back",
      thanks: "Thank you!",
      thanksGuide: "Your answers have been recorded in our database.",
      thanksGen: "Your feedback has been saved successfully.",
      centralizedNote: "Note: Data has been securely saved centrally.",
      fallbackNote: "Note: Your email client will open for manual sending.",
      close: "Back to Site",
      error: "An error occurred. Please try again or use email."
    }
  }[lang];

  const handleEmailClick = () => {
    window.location.href = "mailto:lorenzo.avanzini@gsom.polimi.it?subject=Feedback AlpsConnect";
    onClose();
  };

  const triggerMailtoFallback = () => {
    // Construct Email Body
    let emailBody = `New Feedback Received (${lang.toUpperCase()}) - ${new Date().toLocaleString()}\n\n`;
    emailBody += `Role: ${formData.role}\n`;
    emailBody += `Rating: ${formData.rating}/5 Stars\n\n`;
    
    if (formData.role === 'Guida Alpina') {
        emailBody += `--- ALPINE GUIDE INTERVIEW ---\n\n`;
        emailBody += `1. INTRO & ZONE:\n${formData.q1_intro}\n\n`;
        emailBody += `2. PAIN POINTS:\n${formData.q2_pain}\n\n`;
        emailBody += `3. IDEAL SOLUTION:\n${formData.q3_solution}\n`;
    } else if (formData.role === 'Appassionato') {
        emailBody += `--- ENTHUSIAST INTERVIEW ---\n\n`;
        emailBody += `Email: ${formData.fan_email}\n`;
        emailBody += `Age: ${formData.fan_age}\n`;
        emailBody += `Nationality: ${formData.fan_nationality}\n`;
        emailBody += `Level: ${formData.fan_level}\n`;
        emailBody += `Prev Experience: ${formData.fan_prev_exp}\n`;
        emailBody += `Would use app: ${formData.fan_usage}\n`;
    } else {
        emailBody += `--- GENERAL COMMENT ---\n\n`;
        emailBody += `${formData.comment}\n`;
    }

    const subject = encodeURIComponent(`Feedback AlpsConnect: ${formData.role}`);
    const body = encodeURIComponent(emailBody);
    window.location.href = `mailto:lorenzo.avanzini@gsom.polimi.it?subject=${subject}&body=${body}`;
    setStep('success');
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionError(null);

    // 1. Save to LocalStorage (Backup local history)
    const existingReviews = JSON.parse(localStorage.getItem('alpina_feedback_data') || '[]');
    const newReview = {
      id: Date.now(),
      date: new Date().toLocaleString('it-IT'),
      ...formData
    };
    localStorage.setItem('alpina_feedback_data', JSON.stringify([newReview, ...existingReviews]));

    // 2. Check if Formspree is configured
    if (!FORMSPREE_ID) {
        // Fallback to mailto
        setTimeout(() => {
            setIsSubmitting(false);
            triggerMailtoFallback();
        }, 1000);
        return;
    }

    // 3. Send to Formspree
    try {
        const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...formData,
                _subject: `AlpsConnect Feedback (${formData.role})`
            })
        });

        if (response.ok) {
            setStep('success');
        } else {
            throw new Error("Form submission failed");
        }
    } catch (error) {
        console.error("Submission Error:", error);
        setSubmissionError(t.error);
        // Optional: Trigger fallback automatically on error? 
        // triggerMailtoFallback(); 
    } finally {
        setIsSubmitting(false);
    }
  };

  const isGuide = formData.role === 'Guida Alpina';
  const isFan = formData.role === 'Appassionato';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors z-10"
        >
          <X size={24} />
        </button>

        {/* --- STEP 1: CHOICE --- */}
        {step === 'choice' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
               <MessageSquare size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{t.title}</h2>
            <p className="text-slate-500 mb-8">{t.subtitle}</p>
            
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={handleEmailClick}
                className="flex items-center justify-center gap-3 w-full p-4 rounded-xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className="bg-slate-100 group-hover:bg-white p-2 rounded-lg text-slate-600 group-hover:text-blue-600">
                   <Mail size={24} />
                </div>
                <div className="text-left">
                   <div className="font-bold text-slate-900">{t.btnEmail}</div>
                   <div className="text-xs text-slate-500">{t.btnEmailSub}</div>
                </div>
              </button>

              <button 
                onClick={() => setStep('form')}
                className="flex items-center justify-center gap-3 w-full p-4 rounded-xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className="bg-slate-100 group-hover:bg-white p-2 rounded-lg text-slate-600 group-hover:text-blue-600">
                   <FileText size={24} />
                </div>
                <div className="text-left">
                   <div className="font-bold text-slate-900">{t.btnForm}</div>
                   <div className="text-xs text-slate-500">{t.btnFormSub}</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 2: FORM --- */}
        {step === 'form' && (
          <form onSubmit={handleSubmitForm} className="p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">{t.formTitle}</h2>
            
            <div className="space-y-6">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t.roleLabel}</label>
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 font-medium"
                >
                  <option value="Guida Alpina">{t.roles.guide}</option>
                  <option value="Appassionato">{t.roles.fan}</option>
                  <option value="Investitore">{t.roles.investor}</option>
                  <option value="Altro">{t.roles.other}</option>
                </select>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t.ratingLabel}</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({...formData, rating: star})}
                      className={`p-1 transition-transform hover:scale-110 ${formData.rating >= star ? 'text-yellow-400' : 'text-slate-200'}`}
                    >
                      <Star size={32} fill="currentColor" />
                    </button>
                  ))}
                </div>
              </div>

              {/* CONDITIONAL QUESTIONS */}
              {isGuide ? (
                <div className="space-y-5 pt-4 border-t border-slate-100">
                    <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 mb-2">
                        {t.guideSection}
                    </div>

                    {/* Q1: Intro */}
                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
                           <User size={16} className="text-blue-500"/> {t.q1Label}
                        </label>
                        <p className="text-xs text-slate-500 mb-2">{t.q1Desc}</p>
                        <textarea 
                            required
                            rows={2}
                            value={formData.q1_intro}
                            onChange={(e) => setFormData({...formData, q1_intro: e.target.value})}
                            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-slate-50 focus:bg-white"
                            placeholder={t.q1Place}
                        />
                    </div>

                    {/* Q2: Pain Points */}
                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
                           <AlertCircle size={16} className="text-orange-500"/> {t.q2Label}
                        </label>
                        <p className="text-xs text-slate-500 mb-2">{t.q2Desc}</p>
                        <textarea 
                            required
                            rows={3}
                            value={formData.q2_pain}
                            onChange={(e) => setFormData({...formData, q2_pain: e.target.value})}
                            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-slate-50 focus:bg-white"
                            placeholder={t.q2Place}
                        />
                    </div>

                    {/* Q3: Magic Wand */}
                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
                           <Sparkles size={16} className="text-purple-500"/> {t.q3Label}
                        </label>
                        <p className="text-xs text-slate-500 mb-2">{t.q3Desc}</p>
                        <textarea 
                            required
                            rows={3}
                            value={formData.q3_solution}
                            onChange={(e) => setFormData({...formData, q3_solution: e.target.value})}
                            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-slate-50 focus:bg-white"
                            placeholder={t.q3Place}
                        />
                    </div>
                </div>
              ) : isFan ? (
                <div className="space-y-5 pt-4 border-t border-slate-100">
                    <div className="bg-green-50 p-3 rounded-lg text-xs text-green-700 mb-2">
                        {t.fanSection}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1">{t.fanEmail}</label>
                        <input 
                            required
                            type="email"
                            value={formData.fan_email}
                            onChange={(e) => setFormData({...formData, fan_email: e.target.value})}
                            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none text-sm bg-slate-50 focus:bg-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Age */}
                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-1">{t.fanAge}</label>
                            <input 
                                required
                                type="text"
                                value={formData.fan_age}
                                onChange={(e) => setFormData({...formData, fan_age: e.target.value})}
                                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none text-sm bg-slate-50 focus:bg-white"
                            />
                        </div>
                        {/* Nationality */}
                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-1">{t.fanNationality}</label>
                            <input 
                                required
                                type="text"
                                value={formData.fan_nationality}
                                onChange={(e) => setFormData({...formData, fan_nationality: e.target.value})}
                                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none text-sm bg-slate-50 focus:bg-white"
                            />
                        </div>
                    </div>

                    {/* Level */}
                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1">{t.fanLevel}</label>
                        <input 
                            required
                            type="text"
                            value={formData.fan_level}
                            onChange={(e) => setFormData({...formData, fan_level: e.target.value})}
                            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none text-sm bg-slate-50 focus:bg-white"
                        />
                    </div>

                    {/* Prev Experience */}
                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1">{t.fanPrevExp}</label>
                        <input 
                            required
                            type="text"
                            placeholder={t.fanPlaceText}
                            value={formData.fan_prev_exp}
                            onChange={(e) => setFormData({...formData, fan_prev_exp: e.target.value})}
                            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none text-sm bg-slate-50 focus:bg-white"
                        />
                    </div>

                    {/* Usage */}
                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
                           <Heart size={16} className="text-red-500"/> {t.fanUsage}
                        </label>
                        <input 
                            required
                            type="text"
                            placeholder={t.fanPlaceText}
                            value={formData.fan_usage}
                            onChange={(e) => setFormData({...formData, fan_usage: e.target.value})}
                            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none text-sm bg-slate-50 focus:bg-white"
                        />
                    </div>
                </div>
              ) : (
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t.generalComment}</label>
                    <textarea 
                      required
                      rows={4}
                      value={formData.comment}
                      onChange={(e) => setFormData({...formData, comment: e.target.value})}
                      className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
                      placeholder={t.generalPlace}
                    ></textarea>
                </div>
              )}

              {submissionError && (
                 <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-center gap-2">
                    <AlertCircle size={16} /> {submissionError}
                 </div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-blue-200"
              >
                {isSubmitting ? (
                    <>
                        <Loader2 size={18} className="animate-spin" /> {t.sending}
                    </>
                ) : (
                    <>
                        {t.submit} <Send size={18} />
                    </>
                )}
              </button>
            </div>
            
            <button 
              type="button" 
              onClick={() => setStep('choice')}
              className="mt-4 text-xs text-slate-400 font-bold hover:text-slate-600 w-full text-center"
            >
              {t.back}
            </button>
          </form>
        )}

        {/* --- STEP 3: SUCCESS --- */}
        {step === 'success' && (
          <div className="p-12 text-center">
             <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-300">
               <CheckCircle size={40} />
             </div>
             <h2 className="text-2xl font-bold text-slate-900 mb-2">{t.thanks}</h2>
             <p className="text-slate-500 mb-4">
               {formData.role === 'Guida Alpina' || formData.role === 'Appassionato' ? t.thanksGuide : t.thanksGen}
             </p>
             <div className={`p-4 rounded-xl text-xs mb-8 border ${FORMSPREE_ID ? 'bg-green-50 text-green-800 border-green-200' : 'bg-yellow-50 text-yellow-800 border-yellow-200'}`}>
                <strong>{FORMSPREE_ID ? t.centralizedNote : t.fallbackNote}</strong>
             </div>
             <button 
                onClick={onClose}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all"
              >
                {t.close}
              </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;