import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import Sidebar from '../components/Sidebar'
import AvatarUpload from '../components/AvatarUpload'
import UserMenu from '../components/UserMenu'
import { Settings } from 'lucide-react'

interface ScoreData {
  score: number
  grade: string
  streak: number
  perfectDays: number
  avgPercentage: number
}

const gradeConfig: Record<string, { color: string, bg: string, label: string, emoji: string }> = {
  'S': { color: 'text-yellow-300', bg: 'bg-yellow-500/20 border-yellow-500/30', label: 'Lendário', emoji: '🏆' },
  'A': { color: 'text-purple-300', bg: 'bg-purple-500/20 border-purple-500/30', label: 'Excelente', emoji: '⭐' },
  'B': { color: 'text-blue-300', bg: 'bg-blue-500/20 border-blue-500/30', label: 'Bom', emoji: '👍' },
  'C': { color: 'text-green-300', bg: 'bg-green-500/20 border-green-500/30', label: 'Regular', emoji: '📈' },
  'D': { color: 'text-white/50', bg: 'bg-white/5 border-white/10', label: 'Iniciante', emoji: '🔰' },
}

export default function UserProfile() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const [name, setName] = useState(localStorage.getItem('name') || '')
  const [email, setEmail] = useState('')
  const [avatar, setAvatar] = useState(localStorage.getItem('avatar') || '')
  const [score, setScore] = useState<ScoreData | null>(null)
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    fetchData()
    setTimeout(() => setVisible(true), 100)
    setTimeout(() => setAnimated(true), 600)
  }, [])

  const fetchData = async () => {
    try {
      const [profileRes, scoreRes] = await Promise.all([
        fetch('http://localhost:8080/auth/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:8080/score/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])
      const profileData = await profileRes.json()
      const scoreData = await scoreRes.json()
      setName(profileData.name)
      setEmail(profileData.email)
      setAvatar(profileData.avatarUrl || '')
      if (profileData.avatarUrl) localStorage.setItem('avatar', profileData.avatarUrl)
      setScore(scoreData)
    } catch {
      toast.error('Erro ao carregar perfil!')
    } finally {
      setLoading(false)
    }
  }

  const grade = score ? gradeConfig[score.grade] : gradeConfig['D']

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
            <h2 className="text-white font-semibold text-lg">Meu Perfil</h2>
            <p className="text-white/40 text-sm">Suas estatísticas e conquistas</p>
          </div>
          <UserMenu />
        </header>

        <div className="flex-1 p-6">
          {loading ? (
            <p className="text-white/40">Carregando...</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Card de perfil */}
              <div
                style={fadeUp(100)}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center"
              >
                <AvatarUpload
                  currentAvatar={avatar}
                  name={name}
                  onUpdate={(url) => {
                    setAvatar(url)
                    localStorage.setItem('avatar', url)
                  }}
                />
                <p className="text-white/40 text-xs mt-2 mb-4">Clique para alterar</p>
                <div className="flex items-center gap-2 mt-2">
                  <h3 className="text-white font-bold text-xl">{name}</h3>
                  <button
                    onClick={() => navigate('/settings')}
                    className="text-white/30 hover:text-white transition p-1 rounded-lg hover:bg-white/10"
                  >
                    <Settings size={16} />
                  </button>
                </div>
                <p className="text-white/40 text-sm">{email}</p>

                {score && (
                  <div
                    style={fadeUp(300)}
                    className={`mt-4 px-6 py-3 rounded-2xl border ${grade.bg} flex items-center gap-3`}
                  >
                    <span className="text-3xl font-black">{grade.emoji}</span>
                    <div className="text-left">
                      <p className={`text-2xl font-black ${grade.color}`}>Grade {score.grade}</p>
                      <p className={`text-sm ${grade.color} opacity-80`}>{grade.label}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Cards de estatísticas */}
              <div className="lg:col-span-2 space-y-4">
                {score && (
                  <>
                    {/* Score total */}
                    <div style={fadeUp(200)} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-white font-semibold">Score Total</p>
                        <p className={`text-3xl font-black ${grade.color}`}>{score.score}/100</p>
                      </div>
                      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            score.grade === 'S' ? 'bg-yellow-400' :
                            score.grade === 'A' ? 'bg-purple-500' :
                            score.grade === 'B' ? 'bg-blue-500' :
                            score.grade === 'C' ? 'bg-green-500' : 'bg-white/30'
                          }`}
                          style={{ width: animated ? `${score.score}%` : '0%' }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-white/30">
                        <span>D</span><span>C</span><span>B</span><span>A</span><span>S</span>
                      </div>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'Dias seguidos', value: `🔥 ${score.streak}`, color: 'text-orange-400', delay: 300 },
                        { label: 'Dias perfeitos', value: score.perfectDays, color: 'text-green-400', delay: 400 },
                        { label: 'Média geral', value: `${score.avgPercentage}%`, color: 'text-purple-400', delay: 500 },
                      ].map((stat, i) => (
                        <div
                          key={i}
                          style={fadeUp(stat.delay)}
                          className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center"
                        >
                          <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                          <p className="text-white/50 text-sm mt-1">{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Como melhorar */}
                    <div style={fadeUp(600)} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <h4 className="text-white font-semibold mb-3">💡 Como melhorar seu score</h4>
                      <div className="space-y-2">
                        {score.streak === 0 && (
                          <p className="text-white/50 text-sm flex items-center gap-2">
                            <span className="text-orange-400">•</span>
                            Complete tarefas hoje para começar um streak!
                          </p>
                        )}
                        {score.avgPercentage < 80 && (
                          <p className="text-white/50 text-sm flex items-center gap-2">
                            <span className="text-blue-400">•</span>
                            Tente concluir mais tarefas por dia para aumentar sua média
                          </p>
                        )}
                        {score.perfectDays < 5 && (
                          <p className="text-white/50 text-sm flex items-center gap-2">
                            <span className="text-green-400">•</span>
                            Complete 100% das tarefas do dia para ganhar dias perfeitos
                          </p>
                        )}
                        {score.score >= 90 && (
                          <p className="text-white/50 text-sm flex items-center gap-2">
                            <span className="text-yellow-400">•</span>
                            Incrível! Você está no topo. Continue assim! 🏆
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}