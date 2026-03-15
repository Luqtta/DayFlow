import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  CheckCircle2, Circle, ListTodo, Sun, Trophy, TrendingUp, Flame, Clock
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import UserMenu from '../components/UserMenu'

interface Task {
  id: number
  title: string
  description: string
  completed: boolean
  dueDate: string
  dueTime: string | null
  completedAt: string | null
  createdAt: string
}

interface ScoreData {
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

export default function Dashboard() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [score, setScore] = useState<ScoreData | null>(null)
  const [rankPosition, setRankPosition] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)
  const name = localStorage.getItem('name') || 'Usuário'
  const email = localStorage.getItem('email') || ''
  const token = localStorage.getItem('token')

  const progress = tasks.length > 0
    ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)
    : 0
  const completedCount = tasks.filter(t => t.completed).length

  const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    fetchAll()
    setTimeout(() => setVisible(true), 100)
  }, [])

  const fetchAll = async () => {
    try {
      const [tasksRes, scoreRes, rankingRes] = await Promise.all([
        fetch(`https://dayflow-production-724d.up.railway.app/tasks/today?today=${todayStr}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('https://dayflow-production-724d.up.railway.app/score/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('https://dayflow-production-724d.up.railway.app/score/ranking', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      if (tasksRes.status === 403) {
        localStorage.clear()
        navigate('/login')
        return
      }

      const tasksData = await tasksRes.json()
      const scoreData = await scoreRes.json()
      const rankingData = await rankingRes.json()

      setTasks(tasksData)
      setScore(scoreData)

      const myPosition = rankingData.find((u: any) => u.email === email)
      if (myPosition) setRankPosition(myPosition.position)

    } catch {
      toast.error('Erro ao carregar dados!')
    } finally {
      setLoading(false)
    }
  }

  const completeTask = async (id: number) => {
    try {
      const response = await fetch(`https://dayflow-production-724d.up.railway.app/tasks/${id}/complete`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) return
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: true } : t))
      toast.success('Tarefa concluída! 🎉')
    } catch {
      toast.error('Erro ao concluir tarefa!')
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  const fadeUp = (delay: number) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(20px)',
    transition: `all 0.5s ease ${delay}ms`
  })

  return (
    <div style={{ background: '#0f0a1e' }} className="min-h-screen flex">
      <Sidebar />

      <main className="flex-1 flex flex-col min-h-screen pb-20 lg:pb-0">
        <header className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
          <div style={fadeUp(0)}>
            <h2 className="text-white font-semibold text-base sm:text-lg flex items-center gap-2">
              <Sun size={20} className="text-yellow-400" />
              {getGreeting()}, {name}!
            </h2>
            <p className="text-white/40 text-xs sm:text-sm">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <UserMenu />
        </header>

        <div className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">

          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div style={fadeUp(100)} className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-5">
              <p className="text-white/50 text-xs sm:text-sm mb-1">Progresso</p>
              <p className="text-2xl sm:text-3xl font-bold text-white">{progress}%</p>
              <div className="mt-3 h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full transition-all duration-1000"
                  style={{ width: visible ? `${progress}%` : '0%' }} />
              </div>
            </div>
            <div style={fadeUp(200)} className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-5">
              <p className="text-white/50 text-xs sm:text-sm mb-1">Concluídas</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-400">{completedCount}</p>
              <p className="text-white/30 text-xs mt-1">de {tasks.length}</p>
            </div>
            <div style={fadeUp(300)} className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-5">
              <p className="text-white/50 text-xs sm:text-sm mb-1">Pendentes</p>
              <p className="text-2xl sm:text-3xl font-bold text-yellow-400">{tasks.length - completedCount}</p>
              <p className="text-white/30 text-xs mt-1">faltam</p>
            </div>
          </div>

          {score && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div style={fadeUp(400)} className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-5">
                <p className="text-white/50 text-xs sm:text-sm mb-1">Grade</p>
                <p className={`text-2xl sm:text-3xl font-black ${gradeColors[score.grade]}`}>{score.grade}</p>
                <p className="text-white/30 text-xs mt-1">{score.score}/100 pts</p>
              </div>
              <div style={fadeUp(500)} className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-5">
                <p className="text-white/50 text-xs sm:text-sm mb-1 flex items-center gap-1">
                  <Flame size={12} className="text-orange-400" /> Streak
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-orange-400">{score.streak}</p>
                <p className="text-white/30 text-xs mt-1">dias seguidos</p>
              </div>
              <div style={fadeUp(600)} className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-5">
                <p className="text-white/50 text-xs sm:text-sm mb-1 flex items-center gap-1">
                  <TrendingUp size={12} className="text-purple-400" /> Média
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-purple-400">{score.avgPercentage}%</p>
                <p className="text-white/30 text-xs mt-1">conclusão</p>
              </div>
              <div style={fadeUp(700)}
                className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-5 cursor-pointer hover:bg-white/10 transition"
                onClick={() => navigate('/ranking')}>
                <p className="text-white/50 text-xs sm:text-sm mb-1 flex items-center gap-1">
                  <Trophy size={12} className="text-yellow-400" /> Ranking
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-400">
                  {rankPosition ? `#${rankPosition}` : '-'}
                </p>
                <p className="text-white/30 text-xs mt-1">global →</p>
              </div>
            </div>
          )}

          <div style={fadeUp(800)} className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6">
            <h3 className="text-white font-semibold text-base sm:text-lg mb-4 flex items-center gap-2">
              <ListTodo size={20} className="text-purple-400" />
              Tarefas de hoje
            </h3>

            {loading ? (
              <p className="text-white/40 text-sm">Carregando tarefas...</p>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/40 text-sm">Nenhuma tarefa para hoje!</p>
                <p className="text-white/20 text-xs mt-1">Crie uma rotina e adicione tarefas para hoje</p>
                <button onClick={() => navigate('/routines')}
                  className="mt-4 text-purple-400 hover:text-purple-300 text-sm transition">
                  Ir para rotinas →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task, index) => (
                  <div key={task.id}
                    className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border transition-all duration-200
                      ${task.completed ? 'bg-green-500/10 border-green-500/20' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                    style={{
                      opacity: visible ? 1 : 0,
                      transform: visible ? 'translateY(0)' : 'translateY(10px)',
                      transition: `all 0.4s ease ${900 + index * 60}ms`
                    }}>
                    <button onClick={() => !task.completed && completeTask(task.id)}
                      disabled={task.completed} className="flex-shrink-0 transition">
                      {task.completed
                        ? <CheckCircle2 size={22} className="text-green-400" />
                        : <Circle size={22} className="text-white/30 hover:text-purple-400 transition" />
                      }
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm sm:text-base transition truncate ${task.completed ? 'line-through text-white/40' : 'text-white'}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {task.dueTime && (
                          <span className="text-purple-300 text-xs flex items-center gap-1">
                            <Clock size={10} /> {task.dueTime.slice(0, 5)}
                          </span>
                        )}
                        {task.description && (
                          <span className="text-white/40 text-xs truncate">{task.description}</span>
                        )}
                      </div>
                    </div>
                    {task.completed && <span className="text-green-400 text-xs font-medium flex-shrink-0">✓</span>}
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