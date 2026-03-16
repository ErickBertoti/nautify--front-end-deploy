export function Footer() {
  return (
    <footer className="bg-slate-950 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <svg
              className="w-6 h-6 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
               <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span className="text-xl font-bold text-slate-300">Nautify</span>
          </div>
          
          <div className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Nautify. Todos os direitos reservados.
          </div>
          
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-blue-400 transition-colors">Termos</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Privacidade</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Contato</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
