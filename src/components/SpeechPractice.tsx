import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Mic, 
  MicOff, 
  Loader2, 
  Volume2, 
  Sparkles,
  MessageSquare,
  BarChart2,
  CheckCircle2,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { UserStats, ProficiencyLevel } from '../types';
import { geminiService } from '../lib/gemini';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { cn } from '../lib/utils';

interface SpeechPracticeProps {
  stats: UserStats;
  onUpdateStats: (updater: (stats: UserStats) => UserStats) => void;
  onComplete: () => void;
}

const B1_PHRASES = [
  "I would like to improve my English speaking skills.",
  "Spaced repetition is a very effective way to memorize new words.",
  "AI technology is transforming how we learn languages today.",
  "Can you help me practice my pronunciation for this sentence?",
  "Living in a foreign country is the best way to immerse yourself in a language."
];

const A1_PHRASES = [
  "Hello, my name is John.",
  "How are you today?",
  "I am learning English.",
  "The apple is red.",
  "Nice to meet you."
];

export default function SpeechPractice({ stats, onUpdateStats, onComplete }: SpeechPracticeProps) {
  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ score: number; feedback: string } | null>(null);
  const [totalXp, setTotalXp] = useState(0);
  const [completed, setCompleted] = useState(false);

  const phrases = stats.proficiency === ProficiencyLevel.A1 ? A1_PHRASES : B1_PHRASES;
  const targetText = phrases[currentIdx];

  const handleStopAndAnalyze = async () => {
    stopListening();
    if (!transcript && !isListening) return;
    
    setLoading(true);
    try {
      const result = await geminiService.analyzePronunciation(targetText, transcript);
      setFeedback(result);
      setTotalXp(prev => prev + Math.round(result.score));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setFeedback(null);
    if (currentIdx < phrases.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setCompleted(true);
      onUpdateStats(s => ({
        ...s,
        xp: s.xp + totalXp,
        lessonsCompleted: s.lessonsCompleted + 1,
        studyTimeSeconds: s.studyTimeSeconds + 600, // Est 10 mins
        lastPracticeDate: new Date().toISOString()
      }));
    }
  };

  if (completed) {
     return (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-xl text-center"
        >
          <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mic size={40} />
          </div>
          <h2 className="text-3xl font-black font-display mb-2 text-slate-900 dark:text-slate-100">Great Speaking!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">Your pronunciation is getting better every day.</p>
          
          <div className="bg-rose-50 dark:bg-rose-950/50 rounded-2xl p-6 mb-8 border border-rose-100 dark:border-rose-900/50 flex flex-col items-center gap-2">
              <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Total Speaking XP</p>
              <p className="text-3xl font-black text-rose-700">+{totalXp}</p>
          </div>

          <button onClick={onComplete} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            Finish Practice
          </button>
        </motion.div>
     );
  }

  return (
    <div className="max-w-3xl mx-auto pb-20 space-y-12">
      <div className="flex items-center justify-between px-2">
         <button onClick={onComplete} className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
            <X size={24} />
         </button>
         <div className="flex items-center gap-2 px-4 py-1.5 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-full border border-rose-100 dark:border-rose-900/50 font-black text-xs uppercase tracking-widest">
            Pronunciation Session
         </div>
         <span className="text-sm font-bold text-slate-400">{currentIdx + 1} / {phrases.length}</span>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 md:p-16 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-12 text-center relative overflow-hidden">
        {/* Animated background rings when listening */}
        {isListening && (
            <div className="absolute inset-x-0 bottom-0 pointer-events-none">
               <motion.div 
                 initial={{ scale: 0.5, opacity: 0 }}
                 animate={{ scale: 2, opacity: [0, 0.2, 0] }}
                 transition={{ duration: 2, repeat: Infinity }}
                 className="w-full h-32 bg-rose-200 rounded-full blur-3xl mx-auto"
               />
            </div>
        )}

        <div className="space-y-6 relative z-10">
           <h4 className="text-sm font-black text-rose-400 uppercase tracking-[0.2em]">Read this out loud</h4>
           <p className="text-3xl md:text-4xl font-bold font-display text-slate-800 dark:text-slate-100 leading-tight md:px-10">
             "{targetText}"
           </p>
           <button className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-950/50 px-4 py-2 rounded-xl transition-all">
             <Volume2 size={20} />
             Listen Example
           </button>
        </div>

        <div className="flex flex-col items-center gap-6 relative z-10">
          <button
            onClick={isListening ? handleStopAndAnalyze : () => startListening()}
            disabled={loading}
            className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl",
              isListening ? "bg-rose-500 scale-110 shadow-rose-200 ring-8 ring-rose-100" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100"
            )}
          >
            {loading ? (
               <Loader2 className="animate-spin text-white" size={36} />
            ) : isListening ? (
               <MicOff className="text-white" size={36} />
            ) : (
               <Mic className="text-white" size={36} />
            )}
          </button>
          
          <div className="h-10">
            {isListening ? (
              <motion.div 
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex items-center gap-2 text-rose-500 font-black uppercase tracking-widest text-xs"
              >
                <div className="flex gap-1">
                   {[1, 2, 3].map(i => <div key={i} className="w-1 h-3 bg-current rounded-full" />)}
                </div>
                Listening...
              </motion.div>
            ) : transcript && !feedback ? (
              <p className="text-slate-500 font-medium italic">" {transcript} "</p>
            ) : (
              <p className="text-slate-400 text-sm font-medium">Tap the mic and speak clearly</p>
            )}
          </div>
        </div>

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-6 p-8 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 space-y-6 relative z-10"
            >
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                   <div className={cn(
                     "w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner",
                     feedback.score > 80 ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                   )}>
                     {Math.round(feedback.score)}
                   </div>
                   <div className="text-left">
                     <p className="text-xs font-black uppercase tracking-wider text-slate-400">Score</p>
                     <p className="font-bold text-slate-800 dark:text-slate-100">{feedback.score > 80 ? 'Excellent!' : 'Good Effort'}</p>
                   </div>
                </div>

                <div className="flex-1 text-left md:border-l md:border-slate-200 dark:md:border-slate-700 md:pl-8">
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {feedback.feedback}
                  </p>
                </div>
              </div>

              <button 
                onClick={handleNext}
                className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 py-4 rounded-2xl font-black text-indigo-600 dark:text-indigo-400 hover:border-indigo-600 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-all flex items-center justify-center gap-2"
              >
                {currentIdx < phrases.length - 1 ? 'Next Phrase' : 'See Summary'}
                <ArrowRight size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <TipCard icon={MessageSquare} title="Accuracy" desc="Speak at natural pace" />
         <TipCard icon={BarChart2} title="AI Feedback" desc="Learn from mistakes" />
         <TipCard icon={CheckCircle2} title="Rewards" desc="Earn XP for fluency" />
      </div>
    </div>
  );
}

function TipCard({ icon: Icon, title, desc }: any) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
        <Icon size={24} />
      </div>
      <div>
        <h5 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{title}</h5>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{desc}</p>
      </div>
    </div>
  );
}
