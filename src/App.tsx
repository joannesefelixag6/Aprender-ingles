import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  BookOpen, 
  PenTool, 
  Mic, 
  Settings as SettingsIcon, 
  Trophy, 
  Flame,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  GraduationCap
} from 'lucide-react';
import { storage } from './lib/storage';
import { UserStats, ViewState, ProficiencyLevel } from './types';
import Dashboard from './components/Dashboard';
import VocabularyPractice from './components/VocabularyPractice';
import GrammarPractice from './components/GrammarPractice';
import SpeechPractice from './components/SpeechPractice';

export default function App() {
  const [view, setView] = useState<ViewState>('dashboard');
  const [stats, setStats] = useState<UserStats>(storage.getStats());

  useEffect(() => {
    // Basic streak check on load
    const today = new Date().toISOString().split('T')[0];
    const lastDay = stats.lastPracticeDate.split('T')[0];
    
    if (today !== lastDay) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (lastDay !== yesterdayStr) {
        // Streak lost
        const updated = storage.updateStats(s => ({ ...s, streak: 0 }));
        setStats(updated);
      }
    }
  }, []);

  const handleStatsUpdate = (updater: (stats: UserStats) => UserStats) => {
    const updated = storage.updateStats(updater);
    setStats(updated);
  };

  const handleProficiencyChange = (level: ProficiencyLevel) => {
    handleStatsUpdate(s => ({ ...s, proficiency: level }));
  };

  const isBeginner = stats.proficiency === ProficiencyLevel.A1;

  const navItems = [
    { id: 'dashboard', icon: Home, label: isBeginner ? 'Inicio' : 'Home' },
    { id: 'vocabulary', icon: BrainCircuit, label: isBeginner ? 'Vocabulario' : 'Vocabulary' },
    { id: 'grammar', icon: PenTool, label: isBeginner ? 'Gramática' : 'Grammar' },
    { id: 'speech', icon: Mic, label: isBeginner ? 'Hablar' : 'Speech' },
  ];

  return (
    <div className="min-h-screen flex text-slate-900 bg-[#F8FAFC]">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-10 px-2 text-indigo-600">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <GraduationCap size={24} />
          </div>
          <span className="text-xl font-bold font-display tracking-tight text-slate-900">LingoUp</span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewState)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                view === item.id 
                  ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {view === item.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <Flame size={18} className="text-orange-500 fill-orange-500" />
              <span className="text-sm font-bold">{stats.streak} Day Streak</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-500 transition-all duration-1000" 
                style={{ width: `${Math.min((stats.streak / 7) * 100, 100)}%` }}
              />
            </div>
          </div>
          
          <button className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-700 transition-colors w-full">
            <SettingsIcon size={20} />
            <span className="text-sm font-medium">Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white/50 backdrop-blur-sm border-b border-slate-200 flex items-center justify-between px-8 z-10">
          <div className="md:hidden flex items-center gap-2 text-indigo-600">
             <GraduationCap size={28} />
             <span className="font-bold text-xl font-display text-slate-900">LingoUp</span>
          </div>

          <div className="hidden md:flex items-center gap-4 ml-auto">
            <div className="flex items-center bg-amber-50 text-amber-700 px-4 py-1.5 rounded-full border border-amber-100 text-sm font-bold shadow-sm">
              <Trophy size={16} className="mr-2" />
              Lvl {stats.level}
            </div>
            <div className="flex items-center bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full border border-indigo-100 text-sm font-bold shadow-sm">
              <TrendingUp size={16} className="mr-2" />
              {stats.xp} XP
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold ring-4 ring-indigo-50">
              {stats.streak > 0 ? '🔥' : 'U'}
            </div>
          </div>
        </header>

        {/* Scrollable View */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="max-w-6xl mx-auto w-full"
            >
              {view === 'dashboard' && (
                <Dashboard 
                  stats={stats} 
                  setView={setView} 
                  onProficiencyChange={handleProficiencyChange}
                />
              )}
              {view === 'vocabulary' && (
                <VocabularyPractice 
                  stats={stats}
                  onUpdateStats={handleStatsUpdate}
                  onComplete={() => setView('dashboard')}
                />
              )}
              {view === 'grammar' && (
                <GrammarPractice 
                  stats={stats}
                  onUpdateStats={handleStatsUpdate}
                  onComplete={() => setView('dashboard')}
                />
              )}
              {view === 'speech' && (
                <SpeechPractice 
                  stats={stats}
                  onUpdateStats={handleStatsUpdate}
                  onComplete={() => setView('dashboard')}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden h-20 bg-white border-t border-slate-200 flex items-center justify-around px-2 pb-2">
           {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewState)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
                view === item.id ? 'text-indigo-600' : 'text-slate-400'
              }`}
            >
              <item.icon size={22} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
}
