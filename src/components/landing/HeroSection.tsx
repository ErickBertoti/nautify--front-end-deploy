export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-900 to-slate-900" />
      
      {/* Abstract blurred background shapes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-cyan-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 animate-fade-in-up">
          A Evolução na Gestão da <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
            Sua Embarcação
          </span>
        </h1>
        
        <p className="mt-6 max-w-2xl mx-auto text-xl text-blue-100/80 mb-10 animate-fade-in-up animation-delay-200">
          Nautify é o software definitivo para proprietários, sócios e frotas. 
          Simplifique manutenções, divida custos sem estresse e tenha o controle total na palma da sua mão.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
          <a
            href="#features"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-200 bg-blue-600 border border-transparent rounded-full hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-500/40"
          >
            Conhecer Funcionalidades
          </a>
          <a
            href="/login"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-200 bg-white/10 border border-white/20 rounded-full hover:bg-white/20 backdrop-blur-sm"
          >
            Fazer Login
          </a>
        </div>
      </div>
    </section>
  );
}
