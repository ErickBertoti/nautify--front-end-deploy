import React from 'react';
import Link from 'next/link';
import { ArrowRight, FileText, Lock, Shield } from 'lucide-react';

export const metadata = {
  title: 'Termos e Políticas - Nautify',
};

const documents = [
  {
    title: 'Termos de Uso',
    description: 'Regras e diretrizes para a utilização da plataforma Nautify.',
    href: '/termos/uso',
    icon: FileText,
  },
  {
    title: 'Política de Privacidade',
    description: 'Como coletamos, usamos e protegemos seus dados pessoais.',
    href: '/termos/privacidade',
    icon: Lock,
  },
  {
    title: 'Termo de Cadastro de Embarcação',
    description: 'Responsabilidades ao registrar uma embarcação na plataforma.',
    href: '/termos/cadastro-embarcacao',
    icon: Shield,
  },
];

export default function TermosHub() {
  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Termos e Políticas</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Transparência e segurança são fundamentais para nós. Acesse abaixo os documentos legais que regem nossa plataforma.
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6">
        {documents.map((doc) => (
          <Link
            key={doc.href}
            href={doc.href}
            className="group flex items-start sm:items-center gap-4 p-5 sm:p-6 rounded-xl border border-input bg-card hover:bg-accent hover:border-primary/50 transition-all shadow-sm hover:shadow-md"
          >
            <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
              <doc.icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                {doc.title}
              </h2>
              <p className="text-sm text-muted-foreground">{doc.description}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors hidden sm:block transform group-hover:translate-x-1" />
          </Link>
        ))}
      </div>
    </div>
  );
}
