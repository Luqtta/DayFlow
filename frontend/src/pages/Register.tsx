import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'

const BAD_WORDS = ['puta', 'merda', 'corno', 'viado', 'buceta', 'pau', 'pica', 'caralho', 'fodase', 'foda', 'cu', 'otario', 'idiota', 'imbecil', 'retardado', 'vagabunda', 'piranha', 'safada']

function containsBadWord(text: string) {
  const lower = text.toLowerCase().replace(/\s/g, '')
  return BAD_WORDS.some(word => lower.includes(word))
}

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !email || !password || !confirmPassword) {
      toast.error('Preencha todos os campos!')
      return
    }
    if (name.trim().length < 2) {
      toast.error('O nome deve ter pelo menos 2 caracteres!')
      return
    }
    if (name.trim().length > 16) {
      toast.error('O nome deve ter no máximo 16 caracteres!')
      return
    }
    if (containsBadWord(name)) {
      toast.error('Nome inválido! Use um nome apropriado.')
      return
    }
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem!')
      return
    }
    if (password.length < 6) {
      toast.error('A senha precisa ter pelo menos 6 caracteres!')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('https://dayflow-production-724d.up.railway.app/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email, password })
      })
      const data = await response.json()
      if (!response.ok) { toast.error(data.error || 'Erro ao criar conta!'); return }
      toast.success('Conta criada! Verifique seu email 📧')
      setTimeout(() => navigate('/verify-email', { state: { email } }), 1500)
    } catch {
      toast.error('Erro ao conectar com o servidor!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="fixed top-[-100px] left-[-100px] w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-purple-800/20 rounded-full blur-3xl pointer-events-none" />

      <div
        className="relative w-full max-w-md transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)' }}
      >
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-bold text-white mb-2 cursor-pointer hover:text-purple-300 transition"
            onClick={() => navigate('/')}
          >
            DayFlow
          </h1>
          <p className="text-purple-300">Crie sua conta e organize sua rotina</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
          <h2 className="text-2xl font-semibold text-white mb-6">Criar conta</h2>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="text-purple-200 text-sm font-medium mb-1 block">
                Nome <span className="text-white/30 text-xs">({name.length}/16)</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value.slice(0, 16))}
                placeholder="Seu nome"
                maxLength={16}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition"
              />
            </div>

            <div>
              <label className="text-purple-200 text-sm font-medium mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition"
              />
            </div>

            <div>
              <label className="text-purple-200 text-sm font-medium mb-1 block">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition"
                />
                {password && (
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="text-purple-200 text-sm font-medium mb-1 block">Confirmar senha</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition"
                />
                {confirmPassword && (
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition">
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 mt-2 hover:scale-[1.02]"
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <p className="text-center text-white/50 text-sm mt-6">
            Já tem conta?{' '}
            <span onClick={() => navigate('/login')}
              className="text-purple-300 hover:text-purple-200 cursor-pointer transition">
              Fazer login
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}