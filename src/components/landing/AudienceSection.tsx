export function AudienceSection() {
  return (
    <section className="py-24 bg-slate-900 text-white border-t border-b border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Feito para quem vive o mar
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            A Nautify é flexível e atende desde o uso pessoal recreativo até a operação comercial de frotas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-slate-800/30 rounded-3xl p-8 border border-slate-700/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z"/></svg>
            </div>
            <h3 className="text-2xl font-bold text-blue-400 mb-4">Proprietários Individuais</h3>
            <ul className="space-y-4 text-slate-300 relative z-10">
              <li className="flex items-start gap-3">
                <div className="mt-1 text-green-400">✓</div>
                <span>Controle exato de quanto o barco custa por mês.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 text-green-400">✓</div>
                <span>Histórico de manutenções valorizando a embarcação na revenda.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 text-green-400">✓</div>
                <span>Tudo protegido digitalmente.</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-b from-blue-900/40 to-slate-800/30 rounded-3xl p-8 border border-blue-500/30 relative overflow-hidden transform lg:-translate-y-4 shadow-xl shadow-blue-900/20">
             <div className="absolute top-0 right-0 p-4 opacity-10 text-blue-300">
              <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
            </div>
            <div className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded-full mb-4">Mais Popular</div>
            <h3 className="text-2xl font-bold text-white mb-4">Múltiplos Sócios</h3>
            <ul className="space-y-4 text-slate-300 relative z-10">
              <li className="flex items-start gap-3">
                <div className="mt-1 text-green-400">✓</div>
                <span>Agendamento justo e sem atritos por datas.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 text-green-400">✓</div>
                <span>Despesas fracionadas automaticamente conforme a cota.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 text-green-400">✓</div>
                <span>Transparência total na prestação de contas.</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-800/30 rounded-3xl p-8 border border-slate-700/50 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
              <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6V4h16v2H4zm0 14v-2h16v2H4zm2-10h12v6H6v-6z"/></svg>
            </div>
            <h3 className="text-2xl font-bold text-blue-400 mb-4">Locação & Frotas</h3>
            <ul className="space-y-4 text-slate-300 relative z-10">
              <li className="flex items-start gap-3">
                <div className="mt-1 text-green-400">✓</div>
                <span>Visão macro de todas as embarcações em um dashboard.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 text-green-400">✓</div>
                <span>Controle de tripulação e check-lists operacionais rigorosos.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 text-green-400">✓</div>
                <span>Gestão da margem de lucro por operação.</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}
