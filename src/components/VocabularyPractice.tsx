import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Check, 
  Loader2, 
  ShieldCheck, 
  Search, 
  ArrowRight,
  Volume2,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { UserStats, VocabWord, ProficiencyLevel } from '../types';
import { geminiService } from '../lib/gemini';
import { storage } from '../lib/storage';
import { cn } from '../lib/utils';

interface VocabularyPracticeProps {
  stats: UserStats;
  onUpdateStats: (updater: (stats: UserStats) => UserStats) => void;
  onComplete: () => void;
}

export default function VocabularyPractice({ stats, onUpdateStats, onComplete }: VocabularyPracticeProps) {
  const [loading, setLoading] = useState(false);
  const [words, setWords] = useState<VocabWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    setLoading(true);
    try {
      const stored = storage.getVocab();
      // Filter words for review or get new ones
      const now = Date.now();
      const forReview = stored.filter(w => w.nextReview <= now);
      
      if (forReview.length < 5) {
        // Generate new session
        const newWords = await geminiService.generateVocabBatch(stats.proficiency, 5);
        const mapped: VocabWord[] = newWords.map((w: any) => ({
          ...w,
          id: Math.random().toString(36).substring(7),
          level: stats.proficiency,
          nextReview: Date.now(),
          interval: 1,
          ease: 2.5
        }));
        
        // Save new words to storage
        const allVocab = [...stored, ...mapped];
        storage.saveVocab(allVocab);
        setWords(mapped);
      } else {
        setWords(forReview.slice(0, 8));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = (isCorrect: boolean) => {
    const word = words[currentIndex];
    const updatedWords = storage.getVocab().map(w => {
      if (w.id === word.id) {
        const interval = isCorrect ? Math.max(1, w.interval * w.ease) : 1;
        return {
          ...w,
          nextReview: Date.now() + (interval * 24 * 60 * 60 * 1000),
          interval,
          ease: isCorrect ? Math.min(5, w.ease + 0.1) : Math.max(1.3, w.ease - 0.2)
        };
      }
      return w;
    });
    
    storage.saveVocab(updatedWords);
    if (isCorrect) setSessionScore(s => s + 1);

    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowDefinition(false);
    } else {
      setCompleted(true);
      onUpdateStats(s => ({
        ...s,
        xp: s.xp + (sessionScore + (isCorrect ? 1 : 0)) * 20,
        wordsLearned: s.wordsLearned + (sessionScore + (isCorrect ? 1 : 0)),
        lessonsCompleted: s.lessonsCompleted + 1,
        streak: s.streak === 0 ? 1 : s.streak, // Simplified streak increment logic
        lastPracticeDate: new Date().toISOString()
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          className="text-indigo-600 mb-4"
        >
          <RefreshCw size={48} />
        </motion.div>
        <p className="text-slate-500 font-bold animate-pulse">Personalizing your vocabulary deck...</p>
      </div>
    );
  }

  if (completed) {
    return (
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md mx-auto bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-xl text-center"
      >
        <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles size={40} />
        </div>
        <h2 className="text-3xl font-black font-display mb-2">Session Complete!</h2>
        <p className="text-slate-500 mb-8 font-medium">You've mastered {sessionScore} new words today.</p>
        
        <div className="bg-indigo-50 rounded-2xl p-6 mb-8 border border-indigo-100 flex flex-wrap gap-4 items-center justify-center">
            <div className="text-center px-4">
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">XP Earned</p>
              <p className="text-2xl font-black text-indigo-700">+{sessionScore * 20}</p>
            </div>
            <div className="w-px h-10 bg-indigo-200" />
            <div className="text-center px-4">
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Accuracy</p>
              <p className="text-2xl font-black text-indigo-700">{Math.round((sessionScore / words.length) * 100)}%</p>
            </div>
        </div>

        <button 
          onClick={onComplete}
          className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-indigo-200 hover:translate-y-[-2px] transition-all"
        >
          Go Back Home
        </button>
      </motion.div>
    );
  }

  const currentWord = words[currentIndex];

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between px-2">
         <button onClick={onComplete} className="text-slate-400 hover:text-slate-900 transition-colors">
            <X size={24} />
         </button>
         <div className="flex-1 max-w-[60%] mx-6 h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(currentIndex / words.length) * 100}%` }}
              className="h-full bg-indigo-600 rounded-full"
            />
         </div>
         <span className="text-sm font-bold text-slate-400">{currentIndex + 1} / {words.length}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
           key={currentIndex}
           initial={{ x: 50, opacity: 0 }}
           animate={{ x: 0, opacity: 1 }}
           exit={{ x: -50, opacity: 0 }}
           className="bg-white rounded-[3rem] p-10 md:p-16 border-2 border-slate-100 shadow-2xl relative overflow-hidden group"
        >
          {/* Card background embellishment */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 -mr-16 -mt-16 rounded-full group-hover:scale-110 transition-transform duration-500" />

          <div className="relative text-center space-y-8">
            <div className="space-y-4">
               <motion.h3 
                 layoutId="word"
                 className="text-5xl md:text-7xl font-black text-slate-900 font-display tracking-tight"
                >
                 {currentWord?.word}
               </motion.h3>
               <p className="text-lg text-indigo-600 font-bold uppercase tracking-widest">{currentWord?.translation}</p>
            </div>

            <div className="h-24 flex items-center justify-center">
              {showDefinition ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <p className="text-lg text-slate-600 italic leading-relaxed">"{currentWord?.example}"</p>
                  <p className="text-sm text-slate-400 font-medium px-8">{currentWord?.definition}</p>
                </motion.div>
              ) : (
                <button 
                  onClick={() => setShowDefinition(true)}
                  className="px-6 py-3 bg-slate-50 text-slate-400 rounded-2xl font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center gap-2"
                >
                  <RefreshCw size={18} />
                  Reveal Meaning
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => handleResponse(false)}
          className="bg-white border-2 border-slate-200 text-slate-400 p-6 rounded-[2rem] font-bold hover:border-rose-200 hover:text-rose-500 hover:bg-rose-50 transition-all flex flex-col items-center gap-2 group"
        >
          <X size={32} className="group-hover:scale-110 transition-transform" />
          Still Learning
        </button>
         <button 
          onClick={() => handleResponse(true)}
          className="bg-white border-2 border-slate-200 text-slate-400 p-6 rounded-[2rem] font-bold hover:border-emerald-200 hover:text-emerald-500 hover:bg-emerald-50 transition-all flex flex-col items-center gap-2 group"
        >
          <Check size={32} className="group-hover:scale-110 transition-transform" />
          I Know This
        </button>
      </div>

      <div className="flex justify-center">
        <button className="flex items-center gap-2 text-slate-400 font-bold hover:text-indigo-600 transition-colors">
          <Volume2 size={20} />
          Listen Pronunciation
        </button>
      </div>
    </div>
  );
}
