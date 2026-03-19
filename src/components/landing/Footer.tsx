import Image from 'next/image';

export function Footer() {
  return (
    <footer className="bg-[#020617] py-12 border-t border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2.5">
              <Image
                src="/logo-white.png"
                alt="Nautify Logo"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <span className="text-lg font-bold text-white">Nautify</span>
            </div>
            <span className="text-sm text-slate-500">
              Gestão náutica inteligente
            </span>
          </div>

          <div className="flex gap-8 text-sm text-slate-400">
            <a href="#" className="hover:text-white transition-colors">
              Termos de Uso
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Privacidade
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Contato
            </a>
          </div>

          <div className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Nautify. Todos os direitos
            reservados.
          </div>
        </div>
      </div>
    </footer>
  );
}
