import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus, X, ChevronDown, ChevronUp, Trash2, RefreshCw, Pencil, Clock } from 'lucide-react'
import { createPortal } from 'react-dom'
import Sidebar from '../components/Sidebar'
import UserMenu from '../components/UserMenu'

interface Task {
  id: number
  title: string
  description: string
  completed: boolean
  dueDate: string
  dueTime: string | null
  recurrent: boolean
}

interface Routine {
  id: number
  title: string
  description: string
  category: string
  createdAt: string
}

const CATEGORIES = ['estudo', 'saúde', 'trabalho', 'pessoal', 'exercício', 'outro']

function RoutineTasks({ routineId, token, refreshKey, onDelete }: {
  routineId: number
  token: string
  refreshKey: number
  onDelete: () => void
}) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [confirmDeleteTaskId, setConfirmDeleteTaskId] = useState<number | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`https://dayflow-production-724d.up.railway.app/tasks/routine/${routineId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setTasks(data))
      .finally(() => setLoading(false))
  }, [routineId, refreshKey])

  const deleteTask = async (id: number) => {
    try {
      await fetch(`https://dayflow-production-724d.up.railway.app/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setTasks(prev => prev.filter(t => t.id !== id))
      setConfirmDeleteTaskId(null)
      toast.success('Tarefa deletada!')
      onDelete()
    } catch {
      toast.error('Erro ao deletar tarefa!')
    }
  }

  const updateTask = async () => {
    if (!editingTask) return
    if (!editingTask.title) { toast.error('Título é obrigatório!'); return }
    try {
      const response = await fetch(`https://dayflow-production-724d.up.railway.app/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingTask.title,
          description: editingTask.description,
          dueDate: editingTask.recurrent ? null : editingTask.dueDate,
          dueTime: editingTask.dueTime || null,
          recurrent: editingTask.recurrent,
          routineId
        })
      })
      if (!response.ok) { toast.error('Erro ao atualizar tarefa!'); return }
      toast.success('Tarefa atualizada! 🎉')
      setEditingTask(null)
      onDelete()
    } catch {
      toast.error('Erro ao atualizar tarefa!')
    }
  }

  if (loading) return <p className="text-white/30 text-sm py-3">Carregando...</p>
  if (tasks.length === 0) return <p className="text-white/30 text-sm py-3">Nenhuma tarefa nessa rotina ainda.</p>

  return (
    <>
      <div className="space-y-2 mt-3">
        {tasks.map(task => (
          <div key={task.id} className="flex items-center gap-3 py-2">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${task.completed ? 'bg-green-400' : 'bg-purple-400'}`} />
            <span className={`text-sm flex-1 ${task.completed ? 'line-through text-white/30' : 'text-white/70'}`}>
              {task.title}
            </span>
            {task.dueTime && (
              <span className="text-purple-300/70 text-xs flex items-center gap-1">
                <Clock size={10} /> {task.dueTime.slice(0, 5)}
              </span>
            )}
            {task.recurrent ? (
              <span className="text-purple-400/70 text-xs flex items-center gap-1">
                <RefreshCw size={10} /> recorrente
              </span>
            ) : (
              <span className="text-white/20 text-xs">{task.dueDate}</span>
            )}
              <div className="flex items-center gap-1">
              <button onClick={() => setEditingTask({ ...task })}
                className="text-white/30 hover:text-purple-400 transition p-1 rounded-lg hover:bg-purple-500/10">
                <Pencil size={13} />
              </button>
              <button onClick={() => setConfirmDeleteTaskId(task.id)}
                className="text-red-400/50 hover:text-red-400 transition p-1 rounded-lg hover:bg-red-500/10">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {confirmDeleteTaskId && createPortal(
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1030] border border-white/20 rounded-2xl p-6 w-full max-w-sm text-center">
            <div className="text-4xl mb-4">🗑️</div>
            <h3 className="text-white font-semibold text-lg mb-2">Deletar tarefa?</h3>
            <p className="text-white/40 text-sm mb-6">Essa tarefa será deletada permanentemente.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteTaskId(null)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl transition">Cancelar</button>
              <button onClick={() => deleteTask(confirmDeleteTaskId)}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-xl transition">Deletar</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {editingTask && createPortal(
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1030] border border-white/20 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-lg">Editar tarefa</h3>
              <button onClick={() => setEditingTask(null)} className="text-white/50 hover:text-white transition">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-purple-200 text-sm mb-1 block">Título</label>
                <input value={editingTask.title}
                  onChange={e => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400 transition" />
              </div>
              <div>
                <label className="text-purple-200 text-sm mb-1 block">Descrição (opcional)</label>
                <input value={editingTask.description || ''}
                  onChange={e => setEditingTask({ ...editingTask, description: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400 transition" />
              </div>
              <div>
                <label className="text-purple-200 text-sm mb-1 block">Horário (opcional)</label>
                <input type="time" value={editingTask.dueTime ? editingTask.dueTime.slice(0, 5) : ''}
                  onChange={e => setEditingTask({ ...editingTask, dueTime: e.target.value || null })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400 transition" />
              </div>
              <div onClick={() => setEditingTask({ ...editingTask, recurrent: !editingTask.recurrent, dueDate: '' })}
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition
                  ${editingTask.recurrent ? 'bg-purple-600/20 border-purple-500/40' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                <div className="flex items-center gap-3">
                  <RefreshCw size={16} className={editingTask.recurrent ? 'text-purple-400' : 'text-white/30'} />
                  <div>
                    <p className={`text-sm font-medium ${editingTask.recurrent ? 'text-purple-200' : 'text-white/60'}`}>Tarefa recorrente</p>
                    <p className="text-white/30 text-xs">Aparece todo dia no checklist</p>
                  </div>
                </div>
                <div className={`w-10 h-5 rounded-full transition-colors ${editingTask.recurrent ? 'bg-purple-600' : 'bg-white/10'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform ${editingTask.recurrent ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
              </div>
              {!editingTask.recurrent && (
                <div>
                  <label className="text-purple-200 text-sm mb-1 block">Data</label>
                  <input type="date" value={editingTask.dueDate || ''}
                    onChange={e => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400 transition" />
                </div>
              )}
              <button onClick={updateTask}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-xl transition">
                Salvar alterações
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default function Routines() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const [routines, setRoutines] = useState<Routine[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedRoutine, setExpandedRoutine] = useState<number | null>(null)
  const [refreshKeys, setRefreshKeys] = useState<Record<number, number>>({})
  const [visible, setVisible] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null)

  const [showRoutineModal, setShowRoutineModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [selectedRoutineId, setSelectedRoutineId] = useState<number | null>(null)

  const [routineForm, setRoutineForm] = useState({ title: '', description: '', category: 'estudo' })
  const [taskForm, setTaskForm] = useState({ title: '', description: '', dueDate: '', dueTime: '', recurrent: false })

  const creatingRoutine = useRef(false)
  const creatingTask = useRef(false)

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    fetchRoutines()
    setTimeout(() => setVisible(true), 100)
  }, [])

  const fetchRoutines = async () => {
    try {
      const response = await fetch('https://dayflow-production-724d.up.railway.app/routines', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setRoutines(data)
    } catch {
      toast.error('Erro ao carregar rotinas!')
    } finally {
      setLoading(false)
    }
  }

  const createRoutine = async () => {
    if (creatingRoutine.current) return
    if (!routineForm.title) { toast.error('Título é obrigatório!'); return }
    creatingRoutine.current = true
    try {
      const response = await fetch('https://dayflow-production-724d.up.railway.app/routines', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(routineForm)
      })
      if (!response.ok) { toast.error('Erro ao criar rotina!'); return }
      toast.success('Rotina criada! 🎉')
      setShowRoutineModal(false)
      setRoutineForm({ title: '', description: '', category: 'estudo' })
      fetchRoutines()
    } catch {
      toast.error('Erro ao criar rotina!')
    } finally {
      creatingRoutine.current = false
    }
  }

  const updateRoutine = async () => {
    if (!editingRoutine) return
    if (!editingRoutine.title) { toast.error('Título é obrigatório!'); return }
    try {
      const response = await fetch(`https://dayflow-production-724d.up.railway.app/routines/${editingRoutine.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingRoutine.title,
          description: editingRoutine.description,
          category: editingRoutine.category
        })
      })
      if (!response.ok) { toast.error('Erro ao atualizar rotina!'); return }
      toast.success('Rotina atualizada! 🎉')
      setEditingRoutine(null)
      fetchRoutines()
    } catch {
      toast.error('Erro ao atualizar rotina!')
    }
  }

  const deleteRoutine = async (id: number) => {
    try {
      await fetch(`https://dayflow-production-724d.up.railway.app/routines/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      toast.success('Rotina deletada!')
      setConfirmDeleteId(null)
      fetchRoutines()
    } catch {
      toast.error('Erro ao deletar rotina!')
    }
  }

  const createTask = async () => {
    if (creatingTask.current) return
    if (!taskForm.title) { toast.error('Título é obrigatório!'); return }
    if (!taskForm.recurrent && !taskForm.dueDate) { toast.error('Selecione uma data ou marque como recorrente!'); return }
    creatingTask.current = true
    try {
      const response = await fetch('https://dayflow-production-724d.up.railway.app/tasks', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskForm.title,
          description: taskForm.description,
          dueDate: taskForm.dueDate || null,
          dueTime: taskForm.dueTime || null,
          recurrent: taskForm.recurrent,
          routineId: selectedRoutineId
        })
      })
      if (!response.ok) { toast.error('Erro ao criar tarefa!'); return }
      toast.success('Tarefa criada! 🎉')
      setShowTaskModal(false)
      setTaskForm({ title: '', description: '', dueDate: '', dueTime: '', recurrent: false })
      setRefreshKeys(prev => ({ ...prev, [selectedRoutineId!]: (prev[selectedRoutineId!] || 0) + 1 }))
      setExpandedRoutine(selectedRoutineId)
    } catch {
      toast.error('Erro ao criar tarefa!')
    } finally {
      creatingTask.current = false
    }
  }

  const categoryColors: Record<string, string> = {
    'estudo': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'saúde': 'bg-green-500/20 text-green-300 border-green-500/30',
    'trabalho': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    'pessoal': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'exercício': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    'outro': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  }

  return (
    <div style={{ background: '#0f0a1e' }} className="min-h-screen flex">
      <Sidebar />

      <main className="flex-1 flex flex-col pb-20 lg:pb-0">
        <header className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
          <div>
            <h2 className="text-white font-semibold text-lg">Minhas Rotinas</h2>
            <p className="text-white/40 text-sm">Gerencie suas rotinas e tarefas</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowRoutineModal(true)}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl transition hover:scale-[1.02]">
              <Plus size={18} />
              <span className="hidden sm:inline">Nova rotina</span>
            </button>
            <UserMenu />
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-6 space-y-4">
          {loading ? (
            <p className="text-white/40">Carregando rotinas...</p>
          ) : routines.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-white/40 text-lg">Nenhuma rotina criada ainda!</p>
              <p className="text-white/20 text-sm mt-1">Clique em "Nova rotina" pra começar</p>
            </div>
          ) : (
            routines.map((routine, index) => (
              <div key={routine.id} className="bg-white/5 border border-white/10 rounded-2xl"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(20px)',
                  transition: `all 0.5s ease ${index * 80}ms`
                }}>
                <div className="flex items-center justify-between p-4 sm:p-5">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <button onClick={() => setExpandedRoutine(expandedRoutine === routine.id ? null : routine.id)}>
                      {expandedRoutine === routine.id
                        ? <ChevronUp size={20} className="text-white/50" />
                        : <ChevronDown size={20} className="text-white/50" />
                      }
                    </button>
                    <div className="min-w-0">
                      <h3 className="text-white font-semibold truncate">{routine.title}</h3>
                      {routine.description && <p className="text-white/40 text-sm truncate">{routine.description}</p>}
                    </div>
                    <span className={`hidden sm:inline text-xs px-3 py-1 rounded-full border flex-shrink-0 ${categoryColors[routine.category] || categoryColors['outro']}`}>
                      {routine.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <button onClick={() => { setSelectedRoutineId(routine.id); setShowTaskModal(true) }}
                      className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm transition px-2 sm:px-3 py-1.5 rounded-lg hover:bg-purple-500/10">
                      <Plus size={16} />
                      <span className="hidden sm:inline">Tarefa</span>
                    </button>
                    <button onClick={() => setEditingRoutine(routine)}
                      className="text-white/30 hover:text-purple-400 transition p-1.5 rounded-lg hover:bg-purple-500/10">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => setConfirmDeleteId(routine.id)}
                      className="text-red-400/50 hover:text-red-400 transition p-1.5 rounded-lg hover:bg-red-500/10">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="transition-all duration-300"
                  style={{ maxHeight: expandedRoutine === routine.id ? '500px' : '0px', overflow: 'hidden' }}>
                  <div className="border-t border-white/10 px-5 pb-4">
                    <RoutineTasks
                      routineId={routine.id}
                      token={token!}
                      refreshKey={refreshKeys[routine.id] || 0}
                      onDelete={() => setRefreshKeys(prev => ({
                        ...prev,
                        [routine.id]: (prev[routine.id] || 0) + 1
                      }))}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Modal confirmar delete rotina */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1030] border border-white/20 rounded-2xl p-6 w-full max-w-sm text-center">
            <div className="text-4xl mb-4">🗑️</div>
            <h3 className="text-white font-semibold text-lg mb-2">Deletar rotina?</h3>
            <p className="text-white/40 text-sm mb-6">Todas as tarefas serão deletadas permanentemente.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteId(null)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl transition">Cancelar</button>
              <button onClick={() => deleteRoutine(confirmDeleteId)}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-xl transition">Deletar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal editar rotina */}
      {editingRoutine && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1030] border border-white/20 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-lg">Editar rotina</h3>
              <button onClick={() => setEditingRoutine(null)} className="text-white/50 hover:text-white transition"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-purple-200 text-sm mb-1 block">Título</label>
                <input value={editingRoutine.title}
                  onChange={e => setEditingRoutine({ ...editingRoutine, title: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400 transition" />
              </div>
              <div>
                <label className="text-purple-200 text-sm mb-1 block">Descrição (opcional)</label>
                <input value={editingRoutine.description || ''}
                  onChange={e => setEditingRoutine({ ...editingRoutine, description: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400 transition" />
              </div>
              <div>
                <label className="text-purple-200 text-sm mb-1 block">Categoria</label>
                <select value={editingRoutine.category}
                  onChange={e => setEditingRoutine({ ...editingRoutine, category: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400 transition">
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat} style={{ background: '#1a1030' }}>{cat}</option>
                  ))}
                </select>
              </div>
              <button onClick={updateRoutine}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-xl transition">
                Salvar alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal criar rotina */}
      {showRoutineModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1030] border border-white/20 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-lg">Nova rotina</h3>
              <button onClick={() => setShowRoutineModal(false)} className="text-white/50 hover:text-white transition"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-purple-200 text-sm mb-1 block">Título</label>
                <input value={routineForm.title}
                  onChange={e => setRoutineForm({ ...routineForm, title: e.target.value })}
                  placeholder="Ex: Rotina de estudos"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-400 transition" />
              </div>
              <div>
                <label className="text-purple-200 text-sm mb-1 block">Descrição (opcional)</label>
                <input value={routineForm.description}
                  onChange={e => setRoutineForm({ ...routineForm, description: e.target.value })}
                  placeholder="Ex: Estudar todos os dias"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-400 transition" />
              </div>
              <div>
                <label className="text-purple-200 text-sm mb-1 block">Categoria</label>
                <select value={routineForm.category}
                  onChange={e => setRoutineForm({ ...routineForm, category: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400 transition">
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat} style={{ background: '#1a1030' }}>{cat}</option>
                  ))}
                </select>
              </div>
              <button onClick={createRoutine}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-xl transition">
                Criar rotina
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal criar tarefa */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1030] border border-white/20 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-lg">Nova tarefa</h3>
              <button onClick={() => setShowTaskModal(false)} className="text-white/50 hover:text-white transition"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-purple-200 text-sm mb-1 block">Título</label>
                <input value={taskForm.title}
                  onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="Ex: Estudar Spring Boot"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-400 transition" />
              </div>
              <div>
                <label className="text-purple-200 text-sm mb-1 block">Descrição (opcional)</label>
                <input value={taskForm.description}
                  onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Ex: Estudar JPA e Hibernate"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-400 transition" />
              </div>
              <div>
                <label className="text-purple-200 text-sm mb-1 block">Horário (opcional)</label>
                <input type="time" value={taskForm.dueTime}
                  onChange={e => setTaskForm({ ...taskForm, dueTime: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400 transition" />
              </div>
              <div onClick={() => setTaskForm({ ...taskForm, recurrent: !taskForm.recurrent, dueDate: '' })}
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition
                  ${taskForm.recurrent ? 'bg-purple-600/20 border-purple-500/40' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                <div className="flex items-center gap-3">
                  <RefreshCw size={16} className={taskForm.recurrent ? 'text-purple-400' : 'text-white/30'} />
                  <div>
                    <p className={`text-sm font-medium ${taskForm.recurrent ? 'text-purple-200' : 'text-white/60'}`}>Tarefa recorrente</p>
                    <p className="text-white/30 text-xs">Aparece todo dia no checklist</p>
                  </div>
                </div>
                <div className={`w-10 h-5 rounded-full transition-colors ${taskForm.recurrent ? 'bg-purple-600' : 'bg-white/10'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform ${taskForm.recurrent ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
              </div>
              {!taskForm.recurrent && (
                <div>
                  <label className="text-purple-200 text-sm mb-1 block">Data</label>
                  <input type="date" value={taskForm.dueDate}
                    onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400 transition" />
                </div>
              )}
              <button onClick={createTask}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-xl transition">
                Criar tarefa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}