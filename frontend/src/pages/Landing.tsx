import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function Landing() {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  return (
    <div style={{ background: '#1e1b4b' }} className="h-screen flex flex-col items-center justify-center p-4 overflow-y-auto">

      {/* Círculos decorativos de fundo */}
      <div className="fixed top-[-100px] left-[-100px] w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-purple-800/20 rounded-full blur-3xl pointer-events-none" />

      {/* Conteúdo principal */}
      <div
        className="relative text-center max-w-2xl transition-all duration-700"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)'
        }}
      >
        <div className="inline-block bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm px-4 py-1.5 rounded-full mb-6">
          ✨ Organize sua vida de forma inteligente
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Sua rotina,<br />
          <span className="text-purple-400">do seu jeito</span>
        </h1>

        <p className="text-white/60 text-lg mb-10 leading-relaxed">
          DayFlow é um app de rotinas personalizado onde você cria seus hábitos,
          acompanha seu progresso diário e mantém o foco no que realmente importa.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/login')}
            className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg shadow-purple-500/25"
          >
            Começar agora
          </button>
          <button
            onClick={() => navigate('/login')}
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover:scale-105"
          >
            Já tenho conta
          </button>
        </div>
      </div>

      {/* Cards de features */}
      <div
        className="relative grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full mt-16 transition-all duration-700 delay-300"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)'
        }}
      >
        {[
          { icon: '📋', title: 'Rotinas personalizadas', desc: 'Crie rotinas com categorias como estudo, saúde e trabalho' },
          { icon: '✅', title: 'Checklist diário', desc: 'Marque suas tarefas e veja seu progresso em tempo real' },
          { icon: '📊', title: 'Histórico completo', desc: 'Acompanhe sua consistência nos últimos 30 dias' },
        ].map((feature, i) => (
          <div
            key={i}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left hover:bg-white/10 transition-all duration-200"
          >
            <div className="text-2xl mb-3">{feature.icon}</div>
            <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
            <p className="text-white/50 text-sm">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}