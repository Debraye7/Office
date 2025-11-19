import { LuMoon, LuSun, LuMonitorSmartphone } from 'react-icons/lu'
import { useTheme } from '@shared/context/ThemeContext'
import { ReactNode } from 'react';

const options: { value: 'light' | 'dark' | 'system'; label: string; icon:ReactNode }[] = [
  {
    value: 'light',
    label: 'Claro',
    icon: <LuSun className="text-xl text-yellow-light dark:text-yellow-dark" />
  },
  {
    value: 'dark',
    label: 'Oscuro',
    icon: <LuMoon className="text-xl text-primary-dark dark:text-primary-light" />
  },
  {
    value: 'system',
    label: 'Navegador',
    icon: <LuMonitorSmartphone className="text-xl text-blue-light dark:text-blue-dark" />
  }
]

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex flex-col sm:flex-row gap-1 card">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold text-lg text-primary-dark dark:text-primary-light border ${theme === opt.value ? 'bg-secondary-light dark:bg-secondary-dark border-tertiary-light dark:border-tertiary-dark cursor-not-allowed' : 'bg-transparent hover:border-tertiary-light dark:hover:border-tertiary-dark border-transparent cursor-pointer'} duration-300`}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  )
}