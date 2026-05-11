import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Check, 
  Loader2, 
  ArrowRight,
  Sparkles,
  HelpCircle,
  AlertCircle,
  Lightbulb,
  PenTool,
  Trophy
} from 'lucide-react';
import { UserStats, GrammarExercise, ProficiencyLevel } from '../types';
import { geminiService } from '../lib/gemini';
import { cn } from '../lib/utils';

interface GrammarPracticeProps {
  stats: UserStats;
  onUpdateStats: (updater: (stats: UserStats) => UserStats) => void;
  onComplete: () => void;
}

export default function GrammarPractice({ stats, onUpdateStats, onComplete }: GrammarPracticeProps) {
  const [loading, setLoading] = useState(false);
  const [exercises, setExercises] = useState<GrammarExercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    setLoading(true);
    try {
      const data = await geminiService.generateGrammarExercises(stats.proficiency, 4);
      setExercises(data.map((ex: any, i: number) => ({ ...ex, id: i.toString() })));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const currentEx = exercises[currentIndex];

  const handleConfirm = () => {
    if (!selectedOption) return;
    setIsConfirmed(true);
    if (selectedOption === currentEx.correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsConfirmed(false);
    } else {
      setCompleted(true);
      onUpdateStats(s => ({
        ...s,
        xp: s.xp + score * 50,
        lessonsCompleted: s.lessonsCompleted + 1,
        lastPracticeDate: new Date().toISOString()
      }));
    }
  };

  if (loading) {
     return (
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
           <div className="relative">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }} className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full" />
              <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                <PenTool size={20} />
              </div>
           </div>
           <p className="text-slate-500 font-bold">Parsing grammar rules...</p>
        </div>
     );
  }

  if (completed) {
     return (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="max-w-md mx-auto bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-xl text-center"
        >
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy size={40} />
          </div>
          <h2 className="text-3xl font-black font-display mb-2">Well Done!</h2>
          <p className="text-slate-500 mb-8 font-medium">You got {score} out of {exercises.length} correct.</p>
          
          <div className="bg-emerald-50 rounded-2xl p-6 mb-8 border border-emerald-100 grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest">XP Earned</p>
                <p className="text-2xl font-black text-emerald-700">+{score * 50}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest">Score</p>
                <p className="text-2xl font-black text-emerald-700">{Math.round((score / exercises.length) * 100)}%</p>
              </div>
          </div>

          <button onClick={onComplete} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all">
            Finish Lesson
          </button>
        </motion.div>
     );
  }

  return (
    <div className="max-w-3xl mx-auto pb-20 space-y-8">
      <div className="flex items-center justify-between px-2">
         <button onClick={onComplete} className="text-slate-400 hover:text-slate-900 transition-colors">
            <AlertCircle size={24} />
         </button>
         <div className="flex-1 mx-6 h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(currentIndex / exercises.length) * 100}%` }}
              className="h-full bg-brand-primary rounded-full"
            />
         </div>
         <span className="text-sm font-bold text-slate-400">{currentIndex + 1} / {exercises.length}</span>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-200 shadow-xl space-y-10">
         <div className="space-y-4">
            <div className="flex items-center gap-3 text-indigo-600">
               <HelpCircle size={20} />
               <span className="text-xs font-black uppercase tracking-widest">Select the correct option</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold font-display text-slate-800 leading-tight">
              {currentEx?.question}
            </h3>
         </div>

         <div className="space-y-4">
            {currentEx?.options.map((option, idx) => {
              const isSelected = selectedOption === option;
              const isCorrect = option === currentEx.correctAnswer;
              const status = isConfirmed 
                ? (isCorrect ? 'correct' : (isSelected ? 'wrong' : 'idle'))
                : (isSelected ? 'selected' : 'idle');

              return (
                <button
                  key={idx}
                  disabled={isConfirmed}
                  onClick={() => setSelectedOption(option)}
                  className={cn(
                    "w-full text-left p-6 rounded-2xl border-2 font-bold transition-all flex items-center justify-between group",
                    status === 'idle' && "border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 text-slate-600",
                    status === 'selected' && "border-indigo-600 bg-indigo-50 text-indigo-700",
                    status === 'correct' && "border-emerald-500 bg-emerald-50 text-emerald-700",
                    status === 'wrong' && "border-rose-500 bg-rose-50 text-rose-700"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black border-2 transition-colors",
                      status === 'idle' && "border-slate-100 bg-slate-50 text-slate-400 group-hover:border-indigo-200 group-hover:bg-white group-hover:text-indigo-400",
                      status === 'selected' && "border-indigo-600 bg-indigo-600 text-white",
                      status === 'correct' && "border-emerald-500 bg-emerald-500 text-white",
                      status === 'wrong' && "border-rose-500 bg-rose-500 text-white"
                    )}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    {option}
                  </div>
                  {isConfirmed && isCorrect && <Check size={20} className="text-emerald-500" />}
                  {isConfirmed && !isCorrect && isSelected && <X size={20} className="text-rose-500" />}
                </button>
              );
            })}
         </div>

         <AnimatePresence>
            {isConfirmed && (
               <motion.div 
                 initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                 className={cn(
                   "rounded-[2rem] p-6 border-l-4",
                   selectedOption === currentEx.correctAnswer ? "bg-emerald-50 border-emerald-500" : "bg-rose-50 border-rose-500"
                 )}
               >
                  <div className="flex items-start gap-4">
                     <div className={cn("mt-1 p-2 rounded-lg", selectedOption === currentEx.correctAnswer ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600")}>
                        {selectedOption === currentEx.correctAnswer ? <Sparkles size={20} /> : <AlertCircle size={20} />}
                     </div>
                     <div className="flex-1 space-y-1">
                        <p className="font-bold text-slate-800">
                          {selectedOption === currentEx.correctAnswer ? "Brilliant!" : "Not quite..."}
                        </p>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">{currentEx.explanation}</p>
                     </div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         <div className="pt-4">
            <button
               onClick={isConfirmed ? handleNext : handleConfirm}
               disabled={!selectedOption}
               className={cn(
                 "w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl",
                 !selectedOption ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" : "bg-indigo-600 text-white hover:bg-indigo-700 hover:translate-y-[-2px]"
               )}
            >
               {isConfirmed ? (currentIndex === exercises.length - 1 ? 'Show Results' : 'Next Question') : 'Check Answer'}
               <ArrowRight size={20} />
            </button>
         </div>
      </div>
    </div>
  );
}
