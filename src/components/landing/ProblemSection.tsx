export function ProblemSection() {
  return (
    <section className="py-24 bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300 mb-4">
            A verdade sobre ter um barco
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Sem organização, o sonho náutico pode virar um pesadelo logístico e financeiro.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-slate-800/50 backdrop-blur border border-slate-700/50 my-auto text-center">
            <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Custos Inesperados</h3>
            <p className="text-slate-400">
              Despesas surpresas de manutenção que surgem por falta de planejamento e revisão preventiva.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-800/50 backdrop-blur border border-slate-700/50 transform md:-translate-y-4 text-center">
            <div className="bg-orange-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Conflito entre Sócios</h3>
            <p className="text-slate-400">
              Uso desorganizado, planilhas confusas e dificuldade na hora de dividir contas justas.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-800/50 backdrop-blur border border-slate-700/50 my-auto text-center">
            <div className="bg-purple-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Controle Manual</h3>
            <p className="text-slate-400">
              Cadernos de anotações e mensagens no WhatsApp que deixam a gestão profissional amadora.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
