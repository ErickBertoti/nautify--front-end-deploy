'use client';

import { motion } from 'framer-motion';

const faqs = [
  {
    question: 'Como funciona o trial gratuito de 10 dias?',
    answer:
      'Ao criar sua conta e cadastrar a primeira embarcação, você recebe automaticamente 10 dias para usar todas as funcionalidades sem qualquer cobrança. Não pedimos cartão de crédito antecipado. Quando o trial termina, você decide se ativa o plano ou se cancela.',
  },
  {
    question: 'Posso cancelar quando quiser?',
    answer:
      'Sim. Não há fidelidade nem multa de cancelamento. Você pode cancelar a assinatura a qualquer momento direto pelo painel. O acesso permanece ativo até o fim do ciclo já pago.',
  },
  {
    question: 'Como funciona o rateio entre sócios?',
    answer:
      'Cada despesa pode ser cadastrada como rateada (dividida entre todos os sócios ativos da embarcação) ou exclusiva (paga por um sócio específico). O sistema calcula automaticamente o valor por sócio e mantém o histórico de quem deve o quê. Você também define a participação percentual e a contribuição mensal de cada sócio.',
  },
  {
    question: 'Os sócios precisam ter conta separada?',
    answer:
      'Sim. Cada sócio tem o próprio acesso, com permissões definidas por papel: admin (gerencia tudo), sócio (vê e lança financeiro) ou marinheiro (registra saídas e abastecimentos sem ver finanças). Você convida os demais por e-mail e eles entram na sua embarcação.',
  },
  {
    question: 'Tenho mais de uma embarcação. Como cobra?',
    answer:
      'A cobrança é por embarcação. Se você tem um jet ski e uma lancha, paga R$ 74,99 + R$ 197,99 por mês. Cada embarcação é independente — pode ter sócios diferentes, agenda diferente e financeiro separado.',
  },
  {
    question: 'Meus documentos e dados financeiros estão seguros?',
    answer:
      'Sim. Os dados ficam isolados por embarcação (apenas membros ativos enxergam) e os anexos (notas fiscais, comprovantes, documentos) ficam em storage criptografado. Tokens de acesso expiram automaticamente quando uma conta é suspensa.',
  },
  {
    question: 'Preciso instalar algum aplicativo?',
    answer:
      'Não. O Nautify roda no navegador, em qualquer dispositivo (celular, tablet, computador). Funciona offline para consulta dos últimos dados carregados.',
  },
];

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export function FAQSection() {
  return (
    <section id="faq" className="relative py-28 bg-[#0f172a] overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-5">
            Dúvidas{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              frequentes
            </span>
          </h2>
          <p className="text-lg text-slate-400">
            Tudo que você precisa saber antes de começar.
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.details
              key={faq.question}
              custom={i}
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              className="group rounded-xl border border-slate-700/60 bg-slate-800/30 hover:border-slate-600/80 transition-colors duration-200 overflow-hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left text-base font-semibold text-white list-none [&::-webkit-details-marker]:hidden">
                {faq.question}
                <svg
                  className="h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </summary>
              <div className="px-6 pb-5 text-sm leading-relaxed text-slate-400">
                {faq.answer}
              </div>
            </motion.details>
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-slate-500">
          Ainda tem dúvidas?{' '}
          <a
            href="mailto:contato@nautifyapp.com.br"
            className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
          >
            Fale com a gente
          </a>
        </p>
      </div>
    </section>
  );
}
