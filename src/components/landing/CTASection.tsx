export function CTASection() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-blue-600" />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-600 opacity-90" />
      
      {/* Background decoration */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
          Pronto para desamarrar as cordas?
        </h2>
        <p className="text-xl text-blue-100 mb-10">
          Junte-se à nova era da gestão náutica. Organize sua embarcação, simplifique a divisão de custos e aproveite o mar sem dor de cabeça.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/login"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-blue-900 transition-all duration-200 bg-white border border-transparent rounded-full hover:bg-blue-50 hover:scale-105 shadow-xl shadow-blue-900/20"
          >
            Acessar Plataforma Agora
          </a>
        </div>
      </div>
    </section>
  );
}
