import { motion } from 'motion/react';
import { 
  Play, 
  RotateCcw, 
  Search, 
  Users, 
  Zap, 
  Clock, 
  ArrowRight,
  BrainCircuit,
  PenTool,
  Mic
} from 'lucide-react';
import { UserStats, ViewState, ProficiencyLevel } from '../types';
import { useTheme } from '../hooks/useTheme';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface DashboardProps {
  stats: UserStats;
  setView: (view: ViewState) => void;
  onProficiencyChange: (level: ProficiencyLevel) => void;
}

const data = [
  { name: 'Mon', xp: 150 },
  { name: 'Tue', xp: 230 },
  { name: 'Wed', xp: 180 },
  { name: 'Thu', xp: 320 },
  { name: 'Fri', xp: 210 },
  { name: 'Sat', xp: 450 },
  { name: 'Sun', xp: 380 },
];

export default function Dashboard({ stats, setView, onProficiencyChange }: DashboardProps) {
  const isBeginner = stats.proficiency === ProficiencyLevel.A1;
  const { isDark } = useTheme();
  const chartGrid = isDark ? '#334155' : '#F1F5F9';
  const chartTick = isDark ? '#94A3B8' : '#94A3B8';
  const chartCursor = isDark ? '#1e293b' : '#F8FAFC';
  const chartBarInactive = isDark ? '#475569' : '#E2E8F0';

  return (
    <div className="space-y-8 pb-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-indigo-600 p-8 md:p-12 text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-lg rounded-full text-xs font-bold uppercase tracking-wider mb-6"
          >
            <Zap size={14} className="text-amber-300 fill-amber-300" />
            {isBeginner ? 'El camino divertido para aprender inglés' : 'The fun way to learn English'}
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black font-display mb-6 leading-[1.1]">
            {isBeginner ? 'Aprende Inglés.' : 'Learn English.'} <br />
            <span className="text-indigo-200">{isBeginner ? 'Desbloquea tu Mundo.' : 'Unlock Your World.'}</span>
          </h1>
          <p className="text-indigo-100 text-lg mb-8 max-w-lg leading-relaxed">
            {isBeginner 
              ? 'Mejora tu conversación, escucha y gramática con lecciones de IA diseñadas para principiantes.'
              : 'Improve your speaking, listening, and grammar with AI-powered lessons tailored just for you.'
            }
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => setView('vocabulary')}
              className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-50 transition-all shadow-lg hover:translate-y-[-2px]"
            >
              {isBeginner ? 'Empezar Gratis' : 'Start Learning Free'}
              <ArrowRight size={18} />
            </button>
            
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 rounded-2xl border border-white/20">
               <span className="text-xs font-bold text-indigo-100 uppercase tracking-widest hidden sm:inline">Level:</span>
               <select 
                 value={stats.proficiency}
                 onChange={(e) => onProficiencyChange(e.target.value as ProficiencyLevel)}
                 className="bg-transparent text-white font-bold py-4 focus:outline-none cursor-pointer"
               >
                 {Object.values(ProficiencyLevel).map(level => (
                   <option key={level} value={level} className="text-slate-900">{level} - {level === 'A1' ? 'Beginner' : level === 'A2' ? 'Elementary' : level === 'B1' ? 'Intermediate' : 'Advanced'}</option>
                 ))}
               </select>
            </div>
          </div>
        </div>
        
        {/* Abstract shapes for hero background */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[100px] opacity-50" />
        <div className="absolute bottom-[-10%] right-[10%] w-[300px] h-[300px] bg-sky-400 rounded-full blur-[80px] opacity-30" />
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Practice Cards */}
        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-2xl font-bold font-display flex items-center gap-2 text-slate-900 dark:text-slate-100">
            {isBeginner ? 'Practica para la vida real' : 'Practice for real life'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PracticeCard 
              icon={BrainCircuit}
              title={isBeginner ? "Vocabulario" : "Vocabulary"}
              desc={isBeginner ? "Repetición espaciada" : "Spaced repetition"}
              color="bg-amber-50 text-amber-600 border-amber-100"
              onClick={() => setView('vocabulary')}
            />
            <PracticeCard 
              icon={PenTool}
              title={isBeginner ? "Gramática" : "Grammar"}
              desc={isBeginner ? "Tests interactivos" : "Interactive tests"}
              color="bg-emerald-50 text-emerald-600 border-emerald-100"
              onClick={() => setView('grammar')}
            />
            <PracticeCard 
              icon={Mic}
              title={isBeginner ? "Hablar" : "Speak"}
              desc={isBeginner ? "Coach de voz IA" : "AI voice coach"}
              color="bg-rose-50 text-rose-600 border-rose-100"
              onClick={() => setView('speech')}
            />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
             <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100">Activity Progress</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Your XP earnings this week</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">+1,820</span>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Total XP</p>
                </div>
             </div>
             
             <div className="h-[250px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGrid} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fontWeight: 600, fill: chartTick }}
                      dy={10}
                    />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{ fill: chartCursor }}
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                        color: isDark ? '#f1f5f9' : '#0f172a',
                      }}
                    />
                    <Bar dataKey="xp" radius={[6, 6, 0, 0]} barSize={32}>
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === data.length - 2 ? '#4F46E5' : chartBarInactive} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>

        {/* Right Column: Stats & Goals */}
        <div className="space-y-8">
           <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm h-full transition-colors duration-200">
              <h3 className="text-xl font-bold font-display mb-6 text-slate-900 dark:text-slate-100">Your Progress</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Level {stats.level} Intermediate</span>
                    <span className="text-sm font-black text-indigo-600">68%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '68%' }}
                      className="h-full bg-indigo-500 rounded-full"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">You're doing great! Keep it up! 💪</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <StatItem label="Lessons" value={stats.lessonsCompleted} />
                  <StatItem label="Words" value={stats.wordsLearned} />
                  <StatItem label="Hours" value={(stats.studyTimeSeconds / 3600).toFixed(1)} />
                  <StatItem label="Streak" value={stats.streak} suffix="Days" />
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Today's Goals</h4>
                  <GoalItem label="Vocab Practice" done={4} total={10} color="bg-amber-500" />
                  <GoalItem label="Speak with AI" done={15} total={20} color="bg-rose-500" unit="min" />
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function PracticeCard({ icon: Icon, title, desc, color, onClick }: any) {
  return (
    <motion.button
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="p-6 rounded-3xl border border-slate-200 dark:border-slate-700 text-left transition-all hover:shadow-xl text-indigo-600 dark:text-indigo-400 group w-full bg-white dark:bg-slate-900"
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${color} dark:opacity-90`}>
        <Icon size={24} />
      </div>
      <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight text-xs mb-1">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
        {desc}
      </p>
    </motion.button>
  );
}

function StatItem({ label, value, suffix = '' }: any) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
      <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">{label}</p>
      <p className="text-xl font-black text-slate-800 dark:text-slate-100">{value} <span className="text-xs text-slate-400 font-medium">{suffix}</span></p>
    </div>
  );
}

function GoalItem({ label, done, total, color, unit = '' }: any) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[11px] font-bold">
        <span className="text-slate-600 dark:text-slate-300">{label}</span>
        <span className="text-slate-400">{done}/{total} {unit}</span>
      </div>
      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${(done / total) * 100}%` }} />
      </div>
    </div>
  );
}
