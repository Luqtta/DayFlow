import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, ListTodo, TrendingUp, LogOut, Trophy } from 'lucide-react'

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const name = localStorage.getItem('name') || 'Usuário'
  const avatar = localStorage.getItem('avatar') || ''

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <aside className="hidden lg:flex w-64 bg-white/5 border-r border-white/10 flex-col min-h-screen">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-bold text-white">DayFlow</h1>
        <p className="text-purple-300 text-sm mt-1">Organize sua rotina</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <button onClick={() => navigate('/dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${isActive('/dashboard') ? 'bg-purple-600/30 text-purple-200' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}>
          <LayoutDashboard size={18} />Dashboard
        </button>
        <button onClick={() => navigate('/routines')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${isActive('/routines') ? 'bg-purple-600/30 text-purple-200' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}>
          <ListTodo size={18} />Rotinas
        </button>
        <button onClick={() => navigate('/history')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${isActive('/history') ? 'bg-purple-600/30 text-purple-200' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}>
          <TrendingUp size={18} />Histórico
        </button>
        <button onClick={() => navigate('/ranking')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${isActive('/ranking') ? 'bg-purple-600/30 text-purple-200' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}>
          <Trophy size={18} />Ranking
        </button>
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 cursor-pointer hover:bg-white/5 transition rounded-xl p-2" onClick={() => navigate('/profile')}>
          {avatar ? (
            <img src={avatar} alt="Avatar" className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold text-sm">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{name}</p>
            <p className="text-white/40 text-xs">Ver perfil</p>
          </div>
        </div>

        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition mt-1">
          <LogOut size={18} />Sair
        </button>
      </div>
    </aside>
  )
}