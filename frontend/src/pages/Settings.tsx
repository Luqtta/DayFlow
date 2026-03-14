import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import Sidebar from '../components/Sidebar'
import AvatarUpload from '../components/AvatarUpload'
import UserMenu from '../components/UserMenu'
import { User, Lock, Camera } from 'lucide-react'

const BAD_WORDS = ['puta', 'merda', 'corno', 'viado', 'buceta', 'pau', 'pica', 'caralho', 'fodase', 'foda', 'cu', 'otario', 'idiota', 'imbecil', 'retardado', 'vagabunda', 'piranha', 'safada']

function containsBadWord(text: string) {
  const lower = text.toLowerCase().replace(/\s/g, '')
  return BAD_WORDS.some(word => lower.includes(word))
}

export default function Settings() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [avatar, setAvatar] = useState(localStorage.getItem('avatar') || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loadingName, setLoadingName] = useState(false)
  const [loadingPassword, setLoadingPassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    fetchProfile()
    setTimeout(() => setVisible(true), 100)
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('https://dayflow-production-724d.up.railway.app/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setName(data.name)
      setEmail(data.email)
      setAvatar(data.avatarUrl || '')
    } catch {
      toast.error('Erro ao carregar perfil!')
    } finally {
      setLoading(false)
    }
  }

  const updateName = async () => {
    if (!name.trim()) { toast.error('Nome não pode ser vazio!'); return }
    if (name.trim().length < 2) { toast.error('O nome deve ter pelo menos 2 caracteres!'); return }
    if (name.trim().length > 16) { toast.error('O nome deve ter no máximo 16 caracteres!'); return }
    if (containsBadWord(name)) { toast.error('Nome inválido! Use um nome apropriado.'); return }

    setLoadingName(true)
    try {
      const response = await fetch('https://dayflow-production-724d.up.railway.app/auth/name', {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() })
      })
      if (!response.ok) { toast.error('Erro ao atualizar nome!'); return }
      localStorage.setItem('name', name.trim())
      toast.success('Nome atualizado! 🎉')
    } catch {
      toast.error('Erro ao atualizar nome!')
    } finally {
      setLoadingName(false)
    }
  }

  const updatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Preencha todos os campos!')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem!')
      return
    }
    if (newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres!')
      return
    }
    setLoadingPassword(true)
    try {
      const response = await fetch('https://dayflow-production-724d.up.railway.app/auth/password', {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      })
      const data = await response.json()
      if (!response.ok) { toast.error(data.error || 'Erro ao atualizar senha!'); return }
      toast.success('Senha atualizada! 🎉')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      toast.error('Erro ao atualizar senha!')
    } finally {
      setLoadingPassword(false)
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

      <main className="flex-1 flex flex-col pb-20 lg:pb-0">
        <header className="flex items-center justify-between p-6 border-b border-white/10">
          <div style={fadeUp(0)}>
            <h2 className="text-white font-semibold text-lg">Configurações</h2>
            <p className="text-white/40 text-sm">Gerencie suas informações pessoais</p>
          </div>
          <UserMenu />
        </header>

        <div className="flex-1 p-4 sm:p-6">
          {loading ? (
            <p className="text-white/40">Carregando...</p>
          ) : (
            <div className="max-w-2xl">

              <div style={fadeUp(100)} className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 flex items-center gap-6">
                <div className="relative">
                  <AvatarUpload
                    currentAvatar={avatar}
                    name={name}
                    onUpdate={(url) => {
                      setAvatar(url)
                      localStorage.setItem('avatar', url)
                    }}
                  />
                  <div className="absolute -bottom-1 -right-1 bg-purple-600 rounded-full p-1">
                    <Camera size={10} className="text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">{name}</h3>
                  <p className="text-white/40 text-sm">{email}</p>
                  <p className="text-white/20 text-xs mt-1">Clique na foto para alterar</p>
                </div>
              </div>

              <div style={fadeUp(200)} className="flex gap-2 mb-6">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition
                    ${activeTab === 'profile' ? 'bg-purple-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}
                >
                  <User size={15} /> Dados pessoais
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition
                    ${activeTab === 'password' ? 'bg-purple-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}
                >
                  <Lock size={15} /> Senha
                </button>
              </div>

              {activeTab === 'profile' && (
                <div style={fadeUp(300)} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <User size={16} className="text-purple-400" /> Dados pessoais
                  </h3>
                  <div>
                    <label className="text-purple-200 text-sm mb-1 block">
                      Nome <span className="text-white/30 text-xs">({name.length}/16)</span>
                    </label>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value.slice(0, 16))}
                      maxLength={16}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400 transition"
                    />
                  </div>
                  <div>
                    <label className="text-purple-200 text-sm mb-1 block">Email</label>
                    <div className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/40 text-sm flex items-center justify-between">
                      <span>{email}</span>
                      <span className="text-white/20 text-xs">não editável</span>
                    </div>
                  </div>
                  <button
                    onClick={updateName}
                    disabled={loadingName}
                    className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition hover:scale-[1.01]"
                  >
                    {loadingName ? 'Salvando...' : 'Salvar alterações'}
                  </button>
                </div>
              )}

              {activeTab === 'password' && (
                <div style={fadeUp(300)} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Lock size={16} className="text-purple-400" /> Alterar senha
                  </h3>
                  <div>
                    <label className="text-purple-200 text-sm mb-1 block">Senha atual</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-400 transition"
                    />
                  </div>
                  <div>
                    <label className="text-purple-200 text-sm mb-1 block">Nova senha</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-400 transition"
                    />
                  </div>
                  <div>
                    <label className="text-purple-200 text-sm mb-1 block">Confirmar nova senha</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-400 transition"
                    />
                  </div>

                  {newPassword && (
                    <div>
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            newPassword.length >= i * 3
                              ? newPassword.length >= 12 ? 'bg-green-500'
                              : newPassword.length >= 8 ? 'bg-yellow-500'
                              : 'bg-red-500'
                              : 'bg-white/10'
                          }`} />
                        ))}
                      </div>
                      <p className="text-white/30 text-xs">
                        {newPassword.length < 6 ? 'Muito fraca' :
                         newPassword.length < 8 ? 'Fraca' :
                         newPassword.length < 12 ? 'Boa' : 'Forte'}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={updatePassword}
                    disabled={loadingPassword}
                    className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition hover:scale-[1.01]"
                  >
                    {loadingPassword ? 'Alterando...' : 'Alterar senha'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}