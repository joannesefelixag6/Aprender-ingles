import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';

interface ThemeToggleProps {
  className?: string;
  variant?: 'icon' | 'menu';
}

export default function ThemeToggle({ className, variant = 'icon' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  if (variant === 'menu') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isLight ? 'Activar modo oscuro' : 'Activar modo claro'}
        className={cn(
          'flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all duration-200',
          'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200',
          className
        )}
      >
        {isLight ? <Moon size={20} /> : <Sun size={20} />}
        <span className="text-sm font-medium">{isLight ? 'Modo oscuro' : 'Modo claro'}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isLight ? 'Activar modo oscuro' : 'Activar modo claro'}
      title={isLight ? 'Modo oscuro' : 'Modo claro'}
      className={cn(
        'flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-200 shrink-0',
        'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-900',
        'dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white',
        className
      )}
    >
      {isLight ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}
