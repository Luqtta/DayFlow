import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'

export default function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''

  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [visible, setVisible] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const submitting = useRef(false)

  useEffect(() => {
    if (!email) { navigate('/forgot-password'); return }
    setTimeout(() => setVisible(true), 100)
  }, [])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSubmit = async () => {
    if (submitting.current) return
    if (code.length !== 6) { toast.error('Digite o código de 6 dígitos!'); return }
    if (!newPassword) { toast.error('Digite a nova senha!'); return }
    if (newPassword.length < 6) { toast.error('A senha deve ter pelo menos 6 caracteres!'); return }
    if (newPassword !== confirmPassword) { toast.error('As senhas não coincidem!'); return }

    submitting.current = true
    setLoading(true)
    try {
      const response = await fetch('https://dayflow-production-724d.up.railway.app/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword })
      })
      const data = await response.json()
      if (!response.ok) { toast.error(data.error || 'Erro ao redefinir senha!'); return }
      toast.success('Senha redefinida com sucesso! 🎉')
      setTimeout(() => navigate('/login'), 1500)
    } catch {
      toast.error('Erro ao conectar com o servidor!')
    } finally {
      submitting.current = false
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0) return
    setResending(true)
    try {
      const response = await fetch('https://dayflow-production-724d.up.railway.app/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await response.json()
      if (!response.ok) { toast.error(data.error || 'Erro ao reenviar!'); return }
      toast.success('Novo código enviado! 📧')
      setCountdown(60)
    } catch {
      toast.error('Erro ao reenviar código!')
    } finally {
      setResending(false)
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
          <p className="text-purple-300">Redefinir senha</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">🔑</div>
            <h2 className="text-2xl font-semibold text-white mb-2">Redefinir senha</h2>
            <p className="text-white/50 text-sm">Enviamos um código para</p>
            <p className="text-purple-300 font-medium text-sm mt-1">{email}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-purple-200 text-sm font-medium mb-1 block">Código de verificação</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-white text-center text-2xl font-bold tracking-[0.5em] placeholder-white/20 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition"
              />
            </div>

            <div>
              <label className="text-purple-200 text-sm font-medium mb-1 block">Nova senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition"
                />
                {newPassword && (
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="text-purple-200 text-sm font-medium mb-1 block">Confirmar nova senha</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-white/40 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition"
                />
                {confirmPassword && (
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition">
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                )}
              </div>
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

            <button onClick={handleSubmit} disabled={loading || code.length !== 6 || !newPassword || !confirmPassword}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 hover:scale-[1.02]">
              {loading ? 'Redefinindo...' : 'Redefinir senha'}
            </button>

            <div className="text-center">
              <p className="text-white/40 text-sm">Não recebeu o código?</p>
              <button onClick={handleResend} disabled={resending || countdown > 0}
                className="text-purple-300 hover:text-purple-200 text-sm transition mt-1 disabled:text-white/30 disabled:cursor-not-allowed">
                {resending ? 'Reenviando...' :
                 countdown > 0 ? `Reenviar em ${countdown}s` :
                 'Reenviar código'}
              </button>
            </div>

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