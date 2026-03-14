import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, ListTodo, TrendingUp, LogOut, Trophy, User, CalendarDays } from 'lucide-react'

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const name = localStorage.getItem('name') || 'Usuário'
  const avatar = localStorage.getItem('avatar') || ''

  const logout = () => { localStorage.clear(); navigate('/login') }
  const isActive = (path: string) => location.pathname === path

  const navItems = [
    { path: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { path: '/routines', icon: <ListTodo size={18} />, label: 'Rotinas' },
    { path: '/agenda', icon: <CalendarDays size={18} />, label: 'Agenda' },
    { path: '/history', icon: <TrendingUp size={18} />, label: 'Histórico' },
    { path: '/ranking', icon: <Trophy size={18} />, label: 'Ranking' },
  ]

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-64 bg-white/5 border-r border-white/10 flex-col min-h-screen">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold text-white">DayFlow</h1>
          <p className="text-purple-300 text-sm mt-1">Organize sua rotina</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(item => (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium
                ${isActive(item.path) ? 'bg-purple-600/30 text-purple-200' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}>
              {item.icon}{item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 cursor-pointer hover:bg-white/5 transition rounded-xl p-2"
            onClick={() => navigate('/profile')}>
            {avatar
              ? <img src={avatar} alt="Avatar" className="w-9 h-9 rounded-full object-cover" />
              : <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                  {name.charAt(0).toUpperCase()}
                </div>
            }
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{name}</p>
              <p className="text-white/40 text-xs">Ver perfil</p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition mt-1">
            <LogOut size={18} />Sair
          </button>
        </div>
      </aside>

      {/* Bottom navigation mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0f0a1e]/95 backdrop-blur border-t border-white/10 flex items-center justify-around px-2 py-2">
        {navItems.map(item => (
          <button key={item.path} onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition
              ${isActive(item.path) ? 'text-purple-400' : 'text-white/40 hover:text-white'}`}>
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
        <button onClick={() => navigate('/settings')}
          className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition
            ${isActive('/settings') ? 'text-purple-400' : 'text-white/40 hover:text-white'}`}>
          <User size={18} />
          <span className="text-[10px] font-medium">Perfil</span>
        </button>
      </nav>
    </>
  )
}