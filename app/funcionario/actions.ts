"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// =========================
// INTERFACES
// =========================

export interface Funcionario {
  id: number;
  nome: string;
  email: string;
  idade?: number | null;
  dataNascimento?: string | null;
  cpf?: string;
  clt?: string;
  turno?: string;
  cargo?: string;
  adm?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Aluno {
  id: number;
  nome: string;
  email?: string;
  cpf?: string;
  plano?: string;
  idade?: number | null;
  dataNascimento?: string | null;
  ultimoAcesso?: string | null;
  funcionarioId?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Treino {
  id: number;
  nome: string;
  descricao?: string;
  dificuldade?: string;
  duracao?: number;
  tipoTreino?: string;
  alunoId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Presenca {
  id: number;
  alunoId: number;
  dataHora: string;
  aluno?: {
    id: number;
    nome: string;
  };
}

// =========================
// TOKEN
// =========================

async function getToken() {
  const cookieStore = await cookies();

  return cookieStore.get("access_token")?.value;
}

// =========================
// API FETCH
// =========================

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();

  if (!token) {
    redirect("/");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,

    headers: {
      ...(options.body instanceof FormData
        ? {}
        : {
            "Content-Type": "application/json",
          }),

      Authorization: `Bearer ${token}`,

      ...(options.headers || {}),
    },

    cache: "no-store",
  });

  // Token inválido ou expirado
  if (response.status === 401) {
    const cookieStore = await cookies();

    cookieStore.delete("access_token");
    cookieStore.delete("user_type");
    cookieStore.delete("funcionario");
    cookieStore.delete("funcionarioId");

    redirect("/");
  }

  if (!response.ok) {
    let message = `Erro ${response.status}`;

    try {
      const data = await response.json();

      message =
        data?.error ||
        data?.message ||
        message;
    } catch {
      // Mantém a mensagem padrão
    }

    throw new Error(message);
  }

  return response.json();
}

// =========================
// BUSCAR FUNCIONÁRIO
// =========================

export async function buscarFuncionario(): Promise<Funcionario | null> {
  const token = await getToken();

  if (!token) {
    return null;
  }

  const cookieStore = await cookies();

  // Verifica se o usuário é funcionário
  const userType =
    cookieStore.get("user_type")?.value;

  if (userType !== "funcionario") {
    return null;
  }

  // =========================
  // TENTA USAR FUNCIONÁRIO DO COOKIE
  // =========================

  const funcionarioCookie =
    cookieStore.get("funcionario")?.value;

  if (funcionarioCookie) {
    try {
      return JSON.parse(funcionarioCookie);
    } catch {
      // Continua para buscar pela API
    }
  }

  // =========================
  // BUSCA ID DO FUNCIONÁRIO
  // =========================

  const funcionarioId =
    cookieStore.get("funcionarioId")?.value;

  if (!funcionarioId) {
    return null;
  }

  try {
    const funcionario =
      await apiFetch<Funcionario>(
        `/funcionarios/${funcionarioId}`
      );

    return funcionario;
  } catch (error) {
    console.error(
      "Erro ao buscar funcionário:",
      error
    );

    return null;
  }
}

// =========================
// BUSCAR ALUNOS
// =========================

export async function buscarAlunos(): Promise<Aluno[]> {
  try {
    const data =
      await apiFetch<Aluno[]>("/alunos");

    return Array.isArray(data)
      ? data
      : [];
  } catch (error) {
    console.error(
      "Erro ao buscar alunos:",
      error
    );

    return [];
  }
}

// =========================
// BUSCAR TREINOS
// =========================

export async function buscarTreinos(): Promise<Treino[]> {
  try {
    const data =
      await apiFetch<Treino[]>("/treinos");

    return Array.isArray(data)
      ? data
      : [];
  } catch (error) {
    console.error(
      "Erro ao buscar treinos:",
      error
    );

    return [];
  }
}

// =========================
// BUSCAR PRESENÇAS DE HOJE
// =========================

export async function buscarPresencasHoje(): Promise<Presenca[]> {
  try {
    const data =
      await apiFetch<Presenca[]>(
        "/presencas/hoje"
      );

    return Array.isArray(data)
      ? data
      : [];
  } catch (error) {
    console.error(
      "Erro ao buscar presenças:",
      error
    );

    return [];
  }
}

// =========================
// LOGOUT
// =========================

export async function logoutAction() {
  const cookieStore = await cookies();

  cookieStore.delete("access_token");
  cookieStore.delete("user_type");
  cookieStore.delete("funcionario");
  cookieStore.delete("funcionarioId");

  redirect("/");
}