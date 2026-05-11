import React from 'react';

export const metadata = {
  title: 'Termo de Cadastro de Embarcação - Nautify',
};

export default function TermoCadastroEmbarcacao() {
  return (
    <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-muted-foreground">
      <h1 className="text-3xl font-bold mb-8 text-foreground">TERMO DE CADASTRO DE EMBARCAÇÃO – NAUTIFY</h1>
      
      <p className="mb-4 text-foreground font-medium">Ao cadastrar uma embarcação na plataforma Nautify, o usuário declara que:</p>
      
      <ol className="list-decimal pl-6 mb-8 space-y-2">
        <li>É o proprietário da embarcação ou possui autorização legal para cadastrá-la</li>
        <li>Todas as informações fornecidas são verdadeiras e atualizadas</li>
        <li>Assume total responsabilidade pelos dados inseridos</li>
      </ol>
      
      <p className="mb-4 text-foreground font-medium">A Nautify não realiza validação de propriedade e não se responsabiliza por:</p>
      
      <ul className="list-disc pl-6 mb-8 space-y-2">
        <li>Informações incorretas</li>
        <li>Disputas de propriedade</li>
        <li>Uso indevido de dados cadastrados</li>
      </ul>
      
      <p className="mb-4">
        O usuário concorda que os dados da embarcação poderão ser utilizados dentro da plataforma para fins de gerenciamento.
      </p>
      
      <p>
        A Nautify se reserva o direito de remover cadastros suspeitos ou inconsistentes.
      </p>
    </div>
  );
}
