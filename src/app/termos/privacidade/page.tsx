import React from 'react';

export const metadata = {
  title: 'Política de Privacidade - Nautify',
};

export default function PoliticaPrivacidade() {
  return (
    <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-muted-foreground">
      <h1 className="text-3xl font-bold mb-8 text-foreground">POLÍTICA DE PRIVACIDADE – NAUTIFY</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3 text-foreground">1. Coleta de Dados</h2>
          <p className="mb-2">Coletamos dados fornecidos pelo usuário, como:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Nome</li>
            <li>E-mail</li>
            <li>Telefone</li>
            <li>Informações de embarcações cadastradas</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-foreground">2. Uso das Informações</h2>
          <p className="mb-2">Os dados são utilizados para:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Operação da plataforma</li>
            <li>Gestão das embarcações</li>
            <li>Comunicação com o usuário</li>
            <li>Processamento de pagamentos</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-foreground">3. Compartilhamento de Dados</h2>
          <p>
            Os dados podem ser compartilhados com terceiros quando necessário, como plataformas de pagamento (ex: Asaas), sempre respeitando a legislação vigente.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-foreground">4. Segurança</h2>
          <p>
            Adotamos medidas para proteger os dados, mas não garantimos segurança absoluta contra acessos indevidos.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-foreground">5. Direitos do Usuário (LGPD)</h2>
          <p className="mb-2">O usuário pode:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Solicitar acesso aos dados</li>
            <li>Corrigir informações</li>
            <li>Solicitar exclusão da conta</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-foreground">6. Retenção de Dados</h2>
          <p>
            Os dados serão armazenados enquanto a conta estiver ativa ou conforme necessário para cumprimento legal.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-foreground">7. Alterações</h2>
          <p>
            Esta política pode ser atualizada a qualquer momento.
          </p>
        </section>
      </div>
    </div>
  );
}
