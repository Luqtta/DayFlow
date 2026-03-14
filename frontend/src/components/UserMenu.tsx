import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Trophy, LogOut, Settings } from 'lucide-react'

export default function UserMenu() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [avatar, setAvatar] = useState(localStorage.getItem('avatar') || '')
  const ref = useRef<HTMLDivElement>(null)
  const name = localStorage.getItem('name') || 'Usuário'
  const email = localStorage.getItem('email') || ''

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const current = localStorage.getItem('avatar') || ''
      if (current !== avatar) setAvatar(current)
    }, 1000)
    return () => clearInterval(interval)
  }, [avatar])

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full overflow-hidden hover:ring-2 hover:ring-purple-400 transition"
      >
        {avatar ? (
          <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-purple-600 flex items-center justify-center text-white font-semibold">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-56 bg-[#1a1030] border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-white text-sm font-medium truncate">{name}</p>
            <p className="text-white/40 text-xs truncate">{email}</p>
          </div>

          <div className="p-2">
            <button
              onClick={() => { navigate('/profile'); setOpen(false) }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition text-sm"
            >
              <User size={16} />
              Ver perfil e score
            </button>
            <button
              onClick={() => { navigate('/ranking'); setOpen(false) }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition text-sm"
            >
              <Trophy size={16} />
              Ranking global
            </button>
            <button
              onClick={() => { navigate('/settings'); setOpen(false) }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition text-sm"
            >
              <Settings size={16} />
              Configurações
            </button>
          </div>

          <div className="p-2 border-t border-white/10">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition text-sm"
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  )
}