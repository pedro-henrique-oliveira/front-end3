import { api } from "./api";

export interface SolicitarPlanoPayload {
  plano: string;
  ciclo: "mensal" | "anual";
  valor: number;
  formaPagamento: string;
  nomeAcademia: string;
  responsavel: string;
  email: string;
  cpfCnpj: string;
  telefone: string;
  dadosPagamento?: {
    numCartao?: string;
    nomeCartao?: string;
    validadeCartao?: string;
    cvvCartao?: string;
    parcelas?: number;
  };
}

export interface SolicitarPlanoResposta {
  success: boolean;
  message: string;
  pedido: {
    id: string;
    receitaId: number;
    plano: string;
    ciclo: string;
    valor: number;
    formaPagamento: string;
    statusPagamento: string;
    nomeAcademia: string;
    responsavel: string;
    email: string;
    createdAt: string;
  };
}

export async function enviarSolicitacaoPlano(
  data: SolicitarPlanoPayload,
): Promise<SolicitarPlanoResposta> {
  const response = await api.post<SolicitarPlanoResposta>(
    "/solicitar-plano",
    data,
  );
  return response.data;
}
