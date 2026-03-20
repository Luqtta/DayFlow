import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import Sidebar from '../components/Sidebar'
import UserMenu from '../components/UserMenu'

interface DailyProgress {
  date: string
  total: number
  completed: number
  percentage: number
}

export default function History() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const [history, setHistory] = useState<DailyProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    fetchHistory()
    setTimeout(() => setVisible(true), 100)
    setTimeout(() => setAnimated(true), 600)
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await fetch('https://dayflow-production-724d.up.railway.app/score/history?days=30', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setHistory(data)
    } catch {
      toast.error('Erro ao carregar histórico!')
    } finally {
      setLoading(false)
    }
  }

  const getColor = (percentage: number, total?: number) => {
    if (total === 0) return 'bg-white/15'
    if (percentage === 100) return 'bg-green-500'
    if (percentage >= 70) return 'bg-blue-500'
    if (percentage >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getTextColor = (percentage: number, total?: number) => {
    if (total === 0) return 'text-white/30'
    if (percentage === 100) return 'text-green-400'
    if (percentage >= 70) return 'text-blue-400'
    if (percentage >= 40) return 'text-yellow-400'
    return 'text-red-400'
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  const daysWithTasks = history.filter(d => d.total > 0)
  const avgPercentage = daysWithTasks.length > 0
    ? Math.round(daysWithTasks.reduce((acc, d) => acc + d.percentage, 0) / daysWithTasks.length)
    : 0

  const perfectDays = daysWithTasks.filter(d => d.percentage === 100).length

  const fadeUp = (delay: number) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(20px)',
    transition: `all 0.5s ease ${delay}ms`
  })

  return (
    <div style={{ background: '#0f0a1e' }} className="min-h-screen flex">
      <Sidebar />

      <main className="flex-1 flex flex-col pb-20 lg:pb-0">
        <header className="flex items-center justify-between p-6 border-b border-white/10">
          <div style={fadeUp(0)}>
            <h2 className="text-white font-semibold text-lg">Histórico</h2>
            <p className="text-white/40 text-sm">Acompanhe sua consistência ao longo do tempo</p>
          </div>
          <UserMenu />
        </header>

        <div className="flex-1 p-6 space-y-6">

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div style={fadeUp(100)} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-white/50 text-sm mb-1">Média geral</p>
              <p className={`text-3xl font-bold ${getTextColor(avgPercentage)}`}>
                {animated ? avgPercentage : 0}%
              </p>
              <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${getColor(avgPercentage)}`}
                  style={{ width: animated ? `${avgPercentage}%` : '0%' }}
                />
              </div>
              <p className="text-white/30 text-xs mt-1">de conclusão por dia</p>
            </div>
            <div style={fadeUp(200)} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-white/50 text-sm mb-1">Dias perfeitos</p>
              <p className="text-3xl font-bold text-green-400">{perfectDays}</p>
              <p className="text-white/30 text-xs mt-1">100% concluído</p>
            </div>
            <div style={fadeUp(300)} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-white/50 text-sm mb-1">Dias registrados</p>
              <p className="text-3xl font-bold text-purple-400">{history.length}</p>
              <p className="text-white/30 text-xs mt-1">no total</p>
            </div>
          </div>

          {history.length > 0 && (
            <div style={fadeUp(400)} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-6">Progresso por dia</h3>
              <div className="flex items-end gap-2 h-40 overflow-x-auto pb-2">
                {[...history].reverse().map((day, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 min-w-[48px]">
                    <span className={`text-xs font-medium ${getTextColor(day.percentage, day.total)}`}>
                      {animated ? day.percentage : 0}%
                    </span>
                    <div className="w-full flex flex-col justify-end" style={{ height: '100px' }}>
                      <div
                        className={`w-full rounded-t-lg ${getColor(day.percentage, day.total)}`}
                        style={{
                          height: animated ? `${Math.max(day.percentage, 4)}%` : '4px',
                          transition: `height 0.8s ease ${i * 100}ms`
                        }}
                      />
                    </div>
                    <span className="text-white/30 text-xs text-center leading-tight">
                      {formatDate(day.date)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={fadeUp(500)} className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">Detalhes por dia</h3>
            {loading ? (
              <p className="text-white/40 text-sm">Carregando...</p>
            ) : history.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/40 text-sm">Nenhum histórico ainda!</p>
                <p className="text-white/20 text-xs mt-1">Complete tarefas para ver seu histórico aqui</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((day, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl"
                    style={{
                      opacity: visible ? 1 : 0,
                      transform: visible ? 'translateY(0)' : 'translateY(10px)',
                      transition: `all 0.4s ease ${600 + i * 80}ms`
                    }}>
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${getColor(day.percentage, day.total)}`} />
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{formatDate(day.date)}</p>
                      {day.total === 0 ? (
                        <p className="text-white/30 text-xs">Sem tarefas neste dia</p>
                      ) : (
                        <p className="text-white/40 text-xs">{day.completed} de {day.total} tarefas concluídas</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${getColor(day.percentage, day.total)}`}
                          style={{
                            width: animated ? `${day.percentage}%` : '0%',
                            transition: `width 0.8s ease ${i * 100}ms`
                          }} />
                      </div>
                      <span className={`text-sm font-semibold min-w-[40px] text-right ${getTextColor(day.percentage, day.total)}`}>
                        {day.percentage}%
                      </span>
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
