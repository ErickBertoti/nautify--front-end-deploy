'use client';

import { motion } from 'framer-motion';

const plans = [
  {
    code: 'jet_ski',
    name: 'Jet Ski',
    description: 'Para quem tem um ou mais jet skis no grupo.',
    price: '74,99',
    cents: '99',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5 12 3l8.25 10.5M5.25 9.75 12 4.5l6.75 5.25M3 19.5h18m-15.75-3 1.5 3m13.5-3-1.5 3" />
      </svg>
    ),
    highlighted: false,
  },
  {
    code: 'lancha_veleiro',
    name: 'Lancha & Veleiro',
    description: 'Para lanchas, veleiros e demais embarcações.',
    price: '197,99',
    cents: '99',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3 2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75 2.25-1.313M12 21.75V19.5m0 2.25-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
      </svg>
    ),
    highlighted: true,
  },
];

const sharedBenefits = [
  'Gestão financeira completa (despesas, receitas, fluxo de caixa)',
  'Rateio automático entre sócios',
  'Agenda compartilhada com sincronização das saídas',
  'Controle de manutenções, combustível e documentos',
  'Anexo de notas fiscais e comprovantes',
  'Notificações em tempo real',
  'Suporte por e-mail',
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-28 bg-[#0b1120] overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-blue-600/10 rounded-full blur-[120px]" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-blue-300">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            10 dias grátis em qualquer plano
          </span>
          <h2 className="mt-6 text-3xl md:text-5xl font-bold text-white mb-5">
            Planos que cabem na{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              sua frota
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Mensalidade única por embarcação. Sem fidelidade, sem taxa de adesão.
            Comece o trial e ative o plano só quando estiver pronto.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.code}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className={`relative flex flex-col rounded-2xl p-8 border transition-all duration-300 ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-blue-900/30 to-slate-900/60 border-blue-500/40 shadow-2xl shadow-blue-900/30 md:-translate-y-3'
                  : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600/80'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center px-4 py-1 bg-blue-500 text-white text-xs font-bold rounded-full shadow-lg shadow-blue-500/30">
                    Mais popular
                  </span>
                </div>
              )}

              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${
                  plan.highlighted
                    ? 'bg-blue-500/15 text-blue-300'
                    : 'bg-slate-700/50 text-slate-300'
                }`}
              >
                {plan.icon}
              </div>

              <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
              <p className="text-sm text-slate-400 mb-6">{plan.description}</p>

              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-sm font-semibold text-slate-400">R$</span>
                <span className="text-5xl font-extrabold tracking-tight text-white">
                  {plan.price.split(',')[0]}
                </span>
                <span className="text-2xl font-bold text-white">,{plan.price.split(',')[1]}</span>
                <span className="ml-1 text-sm text-slate-400">/ mês por embarcação</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {sharedBenefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3 text-sm text-slate-300">
                    <svg
                      className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <a
                href="/register"
                className={`inline-flex w-full items-center justify-center px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  plan.highlighted
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 hover:shadow-lg hover:shadow-blue-500/25'
                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20'
                }`}
              >
                Começar trial grátis
              </a>
            </motion.div>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-slate-500">
          Cobrança recorrente via boleto, pix ou cartão. Cancele a qualquer momento sem multa.
        </p>
      </div>
    </section>
  );
}
