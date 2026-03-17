import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, Plus, X, Clock, CheckCircle2, Circle, Trash2, Pencil } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import UserMenu from '../components/UserMenu'

interface Task {
  id: number
  title: string
  description: string
  completed: boolean
  dueDate: string
  dueTime: string | null
  agendaEvent: boolean
  recurrent: boolean
  recurrenceDays?: string | number[] | null
}

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function Agenda() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string>(todayStr)
  const [monthTasks, setMonthTasks] = useState<Task[]>([])
  const [dayTasks, setDayTasks] = useState<Task[]>([])
  const [loadingDay, setLoadingDay] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [visible, setVisible] = useState(false)
  const creating = useRef(false)

  const [form, setForm] = useState({ title: '', description: '', dueDate: selectedDate, dueTime: '' })
  const [editForm, setEditForm] = useState({ title: '', description: '', dueDate: '', dueTime: '' })

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    setTimeout(() => setVisible(true), 100)
  }, [])

  useEffect(() => { fetchMonthTasks() }, [currentYear, currentMonth])
  useEffect(() => {
    fetchDayTasks()
    setForm(f => ({ ...f, dueDate: selectedDate }))
  }, [selectedDate])

  const fetchMonthTasks = async () => {
    try {
      const res = await fetch(
        `https://dayflow-production-724d.up.railway.app/tasks/month?year=${currentYear}&month=${currentMonth + 1}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      setMonthTasks(await res.json())
    } catch { toast.error('Erro ao carregar agenda!') }
  }

  const fetchDayTasks = async () => {
    setLoadingDay(true)
    try {
      const res = await fetch(
        `https://dayflow-production-724d.up.railway.app/tasks/date?date=${selectedDate}&today=${todayStr}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      setDayTasks(await res.json())
    } catch { toast.error('Erro ao carregar tarefas do dia!') }
    finally { setLoadingDay(false) }
  }

  const createEvent = async () => {
    if (creating.current) return
    if (!form.title.trim()) { toast.error('Título é obrigatório!'); return }
    creating.current = true
    try {
      const res = await fetch('https://dayflow-production-724d.up.railway.app/tasks', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description,
          dueDate: form.dueDate,
          dueTime: form.dueTime || null,
          agendaEvent: true,
          recurrent: false
        })
      })
      if (!res.ok) { toast.error('Erro ao criar evento!'); return }
      toast.success('Evento criado! 🎉')
      setShowModal(false)
      setForm({ title: '', description: '', dueDate: selectedDate, dueTime: '' })
      fetchDayTasks()
      fetchMonthTasks()
    } catch { toast.error('Erro ao criar evento!') }
    finally { creating.current = false }
  }

  const openEdit = (task: Task) => {
    setEditingTask(task)
    setEditForm({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate,
      dueTime: task.dueTime ? task.dueTime.slice(0, 5) : '',
    })
  }

  const saveEdit = async () => {
    if (!editingTask) return
    if (!editForm.title.trim()) { toast.error('Título é obrigatório!'); return }
    try {
      const res = await fetch(`https://dayflow-production-724d.up.railway.app/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title.trim(),
          description: editForm.description,
          dueDate: editForm.dueDate,
          dueTime: editForm.dueTime || null,
          agendaEvent: true,
          recurrent: false
        })
      })
      if (!res.ok) { toast.error('Erro ao editar evento!'); return }
      toast.success('Evento atualizado! 🎉')
      setEditingTask(null)
      fetchDayTasks()
      fetchMonthTasks()
    } catch { toast.error('Erro ao editar evento!') }
  }

  const completeTask = async (id: number) => {
    try {
      await fetch(`https://dayflow-production-724d.up.railway.app/tasks/${id}/complete`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setDayTasks(prev => prev.map(t => t.id === id ? { ...t, completed: true } : t))
      toast.success('Evento concluído! 🎉')
    } catch { toast.error('Erro ao concluir evento!') }
  }

  const deleteTask = async (id: number) => {
    try {
      await fetch(`https://dayflow-production-724d.up.railway.app/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setDayTasks(prev => prev.filter(t => t.id !== id))
      fetchMonthTasks()
      toast.success('Evento deletado!')
    } catch { toast.error('Erro ao deletar evento!') }
  }

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }

  const getDaysInMonth = () => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const days: (number | null)[] = Array(firstDay).fill(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)
    return days
  }

  const getDateStr = (day: number) => {
    const m = String(currentMonth + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    return `${currentYear}-${m}-${d}`
  }

  const hasTasksOnDay = (day: number) => monthTasks.some(t => t.dueDate === getDateStr(day))
  const isToday = (day: number) => getDateStr(day) === todayStr
  const isSelected = (day: number) => getDateStr(day) === selectedDate

  const selectedDateLabel = () => {
    const [y, m, d] = selectedDate.split('-')
    const date = new Date(Number(y), Number(m) - 1, Number(d))
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  const isSelectedToday = selectedDate === todayStr
  const selectedDateObj = new Date(`${selectedDate}T00:00:00`)
  const todayDateObj = new Date(`${todayStr}T00:00:00`)
  const isSelectedPast = selectedDateObj.getTime() < todayDateObj.getTime()

  return (
    <div style={{ background: '#0f0a1e' }} className="min-h-screen flex">
      <Sidebar />

      <main className="flex-1 flex flex-col pb-20 lg:pb-0">
        <header className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
          <div style={{ opacity: visible ? 1 : 0, transition: 'all 0.5s ease' }}>
            <h2 className="text-white font-semibold text-lg">Agenda</h2>
            <p className="text-white/40 text-sm">Organize seus compromissos</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl transition hover:scale-[1.02]">
              <Plus size={18} />
              <span className="hidden sm:inline">Novo evento</span>
            </button>
            <UserMenu />
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-6 flex flex-col lg:flex-row gap-6">

          {/* Calendário */}
          <div className="lg:w-96 flex-shrink-0">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-6">
                <button onClick={prevMonth} className="text-white/50 hover:text-white transition p-1 rounded-lg hover:bg-white/10">
                  <ChevronLeft size={20} />
                </button>
                <h3 className="text-white font-semibold text-lg">{MONTHS[currentMonth]} {currentYear}</h3>
                <button onClick={nextMonth} className="text-white/50 hover:text-white transition p-1 rounded-lg hover:bg-white/10">
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="grid grid-cols-7 mb-2">
                {WEEKDAYS.map(d => (
                  <div key={d} className="text-center text-white/30 text-xs font-medium py-1">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth().map((day, idx) => (
                  <div key={idx} className="aspect-square">
                    {day ? (
                      <button onClick={() => setSelectedDate(getDateStr(day))}
                        className={`w-full h-full flex flex-col items-center justify-center rounded-xl text-sm transition relative
                          ${isSelected(day) ? 'bg-purple-600 text-white font-semibold' :
                            isToday(day) ? 'bg-purple-600/20 text-purple-300 font-semibold' :
                            'text-white/70 hover:bg-white/10'}`}>
                        {day}
                        {hasTasksOnDay(day) && !isSelected(day) && (
                          <div className="absolute bottom-1 w-1 h-1 rounded-full bg-purple-400" />
                        )}
                      </button>
                    ) : <div />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tarefas do dia */}
          <div className="flex-1">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold capitalize">{selectedDateLabel()}</h3>
                <button onClick={() => setShowModal(true)}
                  className="text-purple-400 hover:text-purple-300 transition text-sm flex items-center gap-1">
                  <Plus size={16} /> Adicionar
                </button>
              </div>

              {loadingDay ? (
                <p className="text-white/40 text-sm">Carregando...</p>
              ) : dayTasks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-white/40 text-sm">Nenhuma tarefa ou evento neste dia</p>
                  <p className="text-white/20 text-xs mt-1">Clique em "+ Adicionar" para criar um evento</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dayTasks.map(task => (
                    <div key={task.id}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition
                        ${task.completed ? 'bg-green-500/10 border-green-500/20' : 'bg-white/5 border-white/10'}`}>

                      {/* Botão de completar — só eventos do dia de hoje */}
                      <div className="flex-shrink-0">
                        {task.completed ? (
                          <CheckCircle2 size={22} className="text-green-400" />
                        ) : task.agendaEvent && isSelectedToday ? (
                          <button onClick={() => completeTask(task.id)}>
                            <Circle size={22} className="text-white/30 hover:text-purple-400 transition" />
                          </button>
                        ) : isSelectedPast ? (
                          <X size={22} className="text-red-400/60" />
                        ) : (
                          <Circle size={22} className="text-white/10" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm truncate ${task.completed ? 'line-through text-white/40' : 'text-white'}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {task.dueTime && (
                            <span className="text-purple-300 text-xs flex items-center gap-1">
                              <Clock size={10} /> {task.dueTime.slice(0, 5)}
                            </span>
                          )}
                          {task.agendaEvent && (
                            <span className="text-blue-300 text-xs px-2 py-0.5 bg-blue-500/10 rounded-full">evento</span>
                          )}
                          {!task.agendaEvent && (
                            <span className="text-emerald-300 text-xs px-2 py-0.5 bg-emerald-500/10 rounded-full">rotina</span>
                          )}
                          {task.recurrent && (
                            <span className="text-purple-300 text-xs px-2 py-0.5 bg-purple-500/10 rounded-full">recorrente</span>
                          )}
                          {task.description && (
                            <span className="text-white/30 text-xs truncate">{task.description}</span>
                          )}
                        </div>
                      </div>

                      {/* Botões editar/deletar — só eventos de agenda */}
                      {task.agendaEvent && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!task.completed && (
                            <button onClick={() => openEdit(task)}
                              className="text-white/30 hover:text-purple-400 transition p-1 rounded-lg hover:bg-purple-500/10">
                              <Pencil size={14} />
                            </button>
                          )}
                          <button onClick={() => deleteTask(task.id)}
                            className="text-red-400/50 hover:text-red-400 transition p-1 rounded-lg hover:bg-red-500/10">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal criar evento */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1030] border border-white/20 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-lg">Novo evento</h3>
              <button onClick={() => setShowModal(false)} className="text-white/50 hover:text-white transition">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-purple-200 text-sm mb-1 block">Título</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Consulta médica"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-400 transition" />
              </div>
              <div>
                <label className="text-purple-200 text-sm mb-1 block">Descrição (opcional)</label>
                <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Ex: Dr. João - Clínica São Lucas"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-400 transition" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-purple-200 text-sm mb-1 block">Data</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400 transition" />
                </div>
                <div>
                  <label className="text-purple-200 text-sm mb-1 block">Horário (opcional)</label>
                  <input type="time" value={form.dueTime} onChange={e => setForm({ ...form, dueTime: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400 transition" />
                </div>
              </div>
              <button onClick={createEvent}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-xl transition">
                Criar evento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal editar evento */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1030] border border-white/20 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-lg">Editar evento</h3>
              <button onClick={() => setEditingTask(null)} className="text-white/50 hover:text-white transition">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-purple-200 text-sm mb-1 block">Título</label>
                <input value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400 transition" />
              </div>
              <div>
                <label className="text-purple-200 text-sm mb-1 block">Descrição (opcional)</label>
                <input value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400 transition" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-purple-200 text-sm mb-1 block">Data</label>
                  <input type="date" value={editForm.dueDate} onChange={e => setEditForm({ ...editForm, dueDate: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400 transition" />
                </div>
                <div>
                  <label className="text-purple-200 text-sm mb-1 block">Horário (opcional)</label>
                  <input type="time" value={editForm.dueTime} onChange={e => setEditForm({ ...editForm, dueTime: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400 transition" />
                </div>
              </div>
              <button onClick={saveEdit}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-xl transition">
                Salvar alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
