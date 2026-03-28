import React from 'react';

export const metadata = {
  title: 'Termos de Uso - Nautify',
};

export default function TermosUso() {
  return (
    <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-muted-foreground">
      <h1 className="text-3xl font-bold mb-8 text-foreground">TERMOS DE USO – NAUTIFY</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3 text-foreground">1. Sobre a Plataforma</h2>
          <p>
            A Nautify é uma plataforma digital voltada ao gerenciamento de embarcações, permitindo que usuários cadastrem, organizem e acompanhem informações relacionadas aos seus bens náuticos.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-foreground">2. Aceitação dos Termos</h2>
          <p>
            Ao criar uma conta, o usuário declara que leu, entendeu e concorda integralmente com estes Termos de Uso.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-foreground">3. Cadastro de Conta</h2>
          <p className="mb-2">
            O usuário se compromete a fornecer informações verdadeiras, atualizadas e completas no momento do cadastro, sendo o único responsável pelos dados informados.
          </p>
          <p>
            A Nautify não se responsabiliza por informações incorretas fornecidas pelo usuário.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-foreground">4. Uso da Plataforma</h2>
          <p className="mb-2">O usuário concorda em utilizar a plataforma de forma legal, ética e de acordo com sua finalidade, sendo proibido:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Inserir dados falsos ou enganosos</li>
            <li>Utilizar a plataforma para fins ilícitos</li>
            <li>Tentar invadir, modificar ou prejudicar o sistema</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-foreground">5. Planos e Pagamentos</h2>
          <p className="mb-2">A Nautify poderá oferecer planos pagos mensais, semestrais e anuais.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Os pagamentos são recorrentes, podendo ser processados por plataformas terceiras</li>
            <li>A renovação ocorre automaticamente ao final do período contratado</li>
            <li>O não pagamento poderá resultar na suspensão ou cancelamento da conta</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-foreground">6. Cancelamento</h2>
          <p>
            O usuário poderá cancelar sua assinatura a qualquer momento. O cancelamento impede novas cobranças, mas não garante reembolso de valores já pagos.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-foreground">7. Limitação de Responsabilidade</h2>
          <p className="mb-2">A Nautify não garante disponibilidade contínua da plataforma e não se responsabiliza por:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Perdas financeiras</li>
            <li>Dados inseridos incorretamente pelo usuário</li>
            <li>Decisões tomadas com base nas informações da plataforma</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-foreground">8. Suspensão ou Encerramento de Conta</h2>
          <p className="mb-2">A Nautify poderá suspender ou encerrar contas em caso de:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Violação destes termos</li>
            <li>Suspeita de fraude ou uso indevido</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-foreground">9. Modificações nos Termos</h2>
          <p>
            Os termos podem ser alterados a qualquer momento, sendo responsabilidade do usuário revisá-los periodicamente.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-foreground">10. Foro</h2>
          <p>
            Fica eleito o foro da comarca do usuário para resolução de eventuais conflitos.
          </p>
        </section>
      </div>
    </div>
  );
}
