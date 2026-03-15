import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const submitting = useRef(false)

  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  const handleSubmit = async () => {
    if (submitting.current) return
    if (!email.trim()) { toast.error('Digite seu email!'); return }
    submitting.current = true
    setLoading(true)
    try {
      const response = await fetch('https://dayflow-production-724d.up.railway.app/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await response.json()
      if (!response.ok) { toast.error(data.error || 'Erro ao enviar código!'); return }
      toast.success('Código enviado para seu email! 📧')
      setTimeout(() => navigate('/reset-password', { state: { email } }), 1500)
    } catch {
      toast.error('Erro ao conectar com o servidor!')
    } finally {
      submitting.current = false
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="fixed top-[-100px] left-[-100px] w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-purple-800/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)' }}>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 cursor-pointer hover:text-purple-300 transition"
            onClick={() => navigate('/')}>DayFlow</h1>
          <p className="text-purple-300">Recuperar senha</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">🔐</div>
            <h2 className="text-2xl font-semibold text-white mb-2">Esqueceu sua senha?</h2>
            <p className="text-white/50 text-sm">Digite seu email e enviaremos um código para redefinir sua senha</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-purple-200 text-sm font-medium mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="seu@email.com"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition"
              />
            </div>

            <button onClick={handleSubmit} disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 hover:scale-[1.02]">
              {loading ? 'Enviando...' : 'Enviar código'}
            </button>

            <button onClick={() => navigate('/login')}
              className="w-full text-white/30 hover:text-white/60 text-sm transition text-center">
              ← Voltar ao login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}