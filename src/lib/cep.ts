// ViaCEP — API oficial de CEP do Brasil (gratuita, HTTPS, sem autenticação)
// Docs: https://viacep.com.br/

export interface CepResult {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

export async function fetchCep(cep: string): Promise<CepResult | null> {
  const digits = cep.replace(/\D/g, '');
  if (digits.length !== 8) return null;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return null;

    const data = await res.json();

    // ViaCEP returns `{ erro: true }` for invalid CEPs
    if (data.erro) return null;

    return {
      street: data.logradouro ?? '',
      neighborhood: data.bairro ?? '',
      city: data.localidade ?? '',
      state: data.uf ?? '',
    };
  } catch {
    return null;
  }
}
