import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import Sidebar from '../components/Sidebar'
import UserMenu from '../components/UserMenu'

interface RankingUser {
  position: number
  name: string
  email: string
  avatarUrl: string
  score: number
  grade: string
  streak: number
  perfectDays: number
  avgPercentage: number
}

const gradeColors: Record<string, string> = {
  'S': 'text-yellow-300',
  'A': 'text-purple-300',
  'B': 'text-blue-300',
  'C': 'text-green-300',
  'D': 'text-white/40',
}

const positionEmoji: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
}

export default function Ranking() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const [myEmail, setMyEmail] = useState(localStorage.getItem('email') || '')
  const [ranking, setRanking] = useState<RankingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    fetch('http://localhost:8080/auth/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setMyEmail(data.email)
        localStorage.setItem('email', data.email)
      })
    fetchRanking()
    setTimeout(() => setVisible(true), 100)
  }, [])

  const fetchRanking = async () => {
    try {
      const response = await fetch('http://localhost:8080/score/ranking', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setRanking(data)
    } catch {
      toast.error('Erro ao carregar ranking!')
    } finally {
      setLoading(false)
    }
  }

  const fadeUp = (delay: number) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(20px)',
    transition: `all 0.5s ease ${delay}ms`
  })

  return (
    <div style={{ background: '#0f0a1e' }} className="min-h-screen flex">
      <Sidebar />

      <main className="flex-1 flex flex-col">
        <header className="flex items-center justify-between p-6 border-b border-white/10">
          <div style={fadeUp(0)}>
            <h2 className="text-white font-semibold text-lg">Ranking Global</h2>
            <p className="text-white/40 text-sm">Os usuários mais consistentes do DayFlow</p>
          </div>
          <UserMenu />
        </header>

        <div className="flex-1 p-6 space-y-6">

          {/* Top 3 — só aparece se tiver 3 ou mais usuários */}
          {ranking.length >= 3 && (
            <div style={fadeUp(100)} className="grid grid-cols-3 gap-4">
              {[ranking[1], ranking[0], ranking[2]].map((user, i) => {
                const realPos = i === 0 ? 2 : i === 1 ? 1 : 3
                const isFirst = realPos === 1
                const isMe = user.email === myEmail
                return (
                  <div
                    key={user.position}
                    className={`bg-white/5 border rounded-2xl p-6 text-center flex flex-col items-center transition-all duration-300
                      ${isFirst ? 'border-yellow-500/40 bg-yellow-500/5 scale-105' : 'border-white/10'}
                      ${isMe ? 'ring-2 ring-purple-500' : ''}`}
                    style={{
                      opacity: visible ? 1 : 0,
                      transform: visible
                        ? isFirst ? 'scale(1.05)' : 'translateY(0)'
                        : 'translateY(30px)',
                      transition: `all 0.5s ease ${100 + i * 100}ms`
                    }}
                  >
                    <span className="text-3xl mb-2">{positionEmoji[realPos]}</span>
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-14 h-14 rounded-full object-cover mb-2" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center text-white text-xl font-bold mb-2">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <p className="text-white font-semibold text-sm truncate w-full">{user.name}</p>
                    {isMe && <span className="text-purple-400 text-xs">(você)</span>}
                    <p className={`text-2xl font-black mt-1 ${gradeColors[user.grade]}`}>Grade {user.grade}</p>
                    <p className="text-white/50 text-sm">{user.score} pts</p>
                  </div>
                )
              })}
            </div>
          )}

          {/* Lista completa */}
          <div style={fadeUp(400)} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10">
              <h3 className="text-white font-semibold">Todos os jogadores</h3>
            </div>

            {loading ? (
              <p className="text-white/40 text-sm p-6">Carregando ranking...</p>
            ) : ranking.length === 0 ? (
              <p className="text-white/40 text-sm p-6">Nenhum usuário no ranking ainda!</p>
            ) : (
              <div className="divide-y divide-white/5">
                {ranking.map((user, index) => (
                  <div
                    key={user.position}
                    className={`flex items-center gap-4 px-6 py-4 transition hover:bg-white/5
                      ${user.email === myEmail ? 'bg-purple-500/10' : ''}`}
                    style={{
                      opacity: visible ? 1 : 0,
                      transform: visible ? 'translateX(0)' : 'translateX(-20px)',
                      transition: `all 0.4s ease ${500 + index * 60}ms`
                    }}
                  >
                    <span className="text-white/40 text-sm font-mono w-6 text-center">
                      {positionEmoji[user.position] || `#${user.position}`}
                    </span>

                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1">
                      <p className="text-white font-medium text-sm flex items-center gap-2">
                        {user.name}
                        {user.email === myEmail && <span className="text-purple-400 text-xs">(você)</span>}
                      </p>
                      <p className="text-white/30 text-xs">🔥 {user.streak} streak · {user.perfectDays} dias perfeitos · {user.avgPercentage}% média</p>
                    </div>

                    <div className="text-right">
                      <p className={`text-lg font-black ${gradeColors[user.grade]}`}>Grade {user.grade}</p>
                      <p className="text-white/40 text-xs">{user.score} pts</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}