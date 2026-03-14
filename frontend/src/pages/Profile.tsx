import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import Sidebar from '../components/Sidebar'
import AvatarUpload from '../components/AvatarUpload'

export default function Profile() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const [name, setName] = useState(localStorage.getItem('name') || '')
  const [email, setEmail] = useState('')
  const [avatar, setAvatar] = useState(localStorage.getItem('avatar') || '')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('http://localhost:8080/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setName(data.name)
      setEmail(data.email)
      setAvatar(data.avatarUrl || '')
      if (data.avatarUrl) localStorage.setItem('avatar', data.avatarUrl)
    } catch {
      toast.error('Erro ao carregar perfil!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#0f0a1e' }} className="min-h-screen flex">
      <Sidebar />

      <main className="flex-1 flex flex-col">
        <header className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-white font-semibold text-lg">Meu Perfil</h2>
            <p className="text-white/40 text-sm">Gerencie suas informações</p>
          </div>
        </header>

        <div className="flex-1 p-6">
          {loading ? (
            <p className="text-white/40">Carregando...</p>
          ) : (
            <div className="max-w-md">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8">

                {/* Avatar */}
                <div className="flex flex-col items-center mb-8">
                  <AvatarUpload
                    currentAvatar={avatar}
                    name={name}
                    onUpdate={(url) => setAvatar(url)}
                  />
                  <p className="text-white/40 text-sm mt-3">Clique na foto para alterar</p>
                </div>

                {/* Infos */}
                <div className="space-y-4">
                  <div>
                    <label className="text-purple-200 text-sm mb-1 block">Nome</label>
                    <div className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                      {name}
                    </div>
                  </div>
                  <div>
                    <label className="text-purple-200 text-sm mb-1 block">Email</label>
                    <div className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                      {email}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}