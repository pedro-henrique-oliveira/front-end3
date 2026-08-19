"use client";

import {
  Activity,
  Bell,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Dumbbell,
  Key,
  LogOut,
  Mail,
  Phone,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  User,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/* =========================
   TIPOS E INTERFACES
========================= */

interface Funcionario {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  cargo?: string;
  turno?: string;
  adm?: boolean;
}

interface Aluno {
  id: number;
  nome: string;
  email?: string;
  idade?: number;
  cpf?: string | number;
  plano?: string;
  status?: string;
  createdAt?: string;
}

interface Treino {
  id: number;
  nome: string;
  descricao: string;
  dificuldade: string;
  duracao: number;
  tipoTreino: string;
  alunoId: number;
  aluno?: {
    nome: string;
  };
}

interface ConfigFuncionario {
  turno: string;
  notificacoesEmail: boolean;
  notificacoesPresenca: boolean;
  modoExibicao: string;
}

/* =========================
   HELPERS & UI
========================= */

function normalizarLista<T>(response: any): T[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.result)) return response.result;
  return [];
}

function formatarData(data?: string) {
  if (!data) return "-";
  const date = new Date(data);
  if (Number.isNaN(date.getTime())) return data;
  return date.toLocaleDateString("pt-BR");
}

function statusColor(status?: string) {
  switch (status?.toLowerCase()) {
    case "ativo":
      return "border-emerald-400/30 bg-emerald-400/10 text-emerald-400";
    case "pendente":
      return "border-amber-400/30 bg-amber-400/10 text-amber-400";
    case "inativo":
      return "border-red-400/30 bg-red-400/10 text-red-400";
    default:
      return "border-zinc-700 bg-zinc-800/50 text-zinc-400";
  }
}

function dificuldadeColor(dificuldade?: string) {
  switch (dificuldade?.toLowerCase()) {
    case "iniciante":
      return "border-emerald-400/30 bg-emerald-400/10 text-emerald-400";
    case "intermediário":
    case "intermediario":
      return "border-amber-400/30 bg-amber-400/10 text-amber-400";
    case "avançado":
    case "avancado":
      return "border-red-400/30 bg-red-400/10 text-red-400";
    default:
      return "border-zinc-700 bg-zinc-800/50 text-zinc-400";
  }
}

function StatCard({
  icon: Icon,
  label,
  valor,
  subtext,
}: {
  icon: React.ElementType;
  label: string;
  valor: string;
  subtext: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {label}
        </span>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-yellow-400 ring-1 ring-zinc-800">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-extrabold text-white">{valor}</p>
      <p className="mt-1 text-xs text-zinc-500">{subtext}</p>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  subtitle,
  action,
  children,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950 p-6 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white sm:text-lg">{title}</h2>
            {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
          <h3 className="text-base font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-zinc-500 transition-colors hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

function Field({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-wide text-zinc-500 font-semibold">
        {label}
      </span>
      <input
        {...props}
        className="rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 outline-none transition-colors focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20"
      />
    </label>
  );
}

/* =========================
   PAINEL DO FUNCIONÁRIO
========================= */

export default function FuncionarioDashboardPage() {
  const router = useRouter();

  const [funcionario, setFuncionario] = useState<Funcionario | null>(null);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [presencasHojeCount, setPresencasHojeCount] = useState<number>(0);

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [buscaAluno, setBuscaAluno] = useState("");
  const [buscaTreino, setBuscaTreino] = useState("");
  const [mostrarTodosAlunos, setMostrarTodosAlunos] = useState(false);

  // Configurações Pessoais do Funcionário
  const [configFunc, setConfigFunc] = useState<ConfigFuncionario>({
    turno: "Manhã (06:00 - 14:00)",
    notificacoesEmail: true,
    notificacoesPresenca: true,
    modoExibicao: "Modo Escuro (Padrão)",
  });

  // Modais
  const [modalSenha, setModalSenha] = useState(false);
  const [modalPerfil, setModalPerfil] = useState(false);
  const [modalConfig, setModalConfig] = useState(false);
  const [modalNovoTreino, setModalNovoTreino] = useState(false);

  // Form de alteração de senha
  const [senhaForm, setSenhaForm] = useState({
    atual: "",
    nova: "",
    confirmar: "",
  });
  const [senhaErro, setSenhaErro] = useState("");

  // Form de perfil
  const [perfilForm, setPerfilForm] = useState({
    nome: "",
    telefone: "",
    cargo: "",
  });

  // Form de novo treino
  const [novoTreino, setNovoTreino] = useState({
    nome: "",
    descricao: "",
    dificuldade: "Iniciante",
    duracao: 45,
    tipoTreino: "Musculação",
    alunoId: "",
  });

  /* =========================
     CARREGAR DADOS DA API
  ========================= */

  async function carregarDados() {
    try {
      setErro("");

      const token = localStorage.getItem("token");
      const funcStorage = localStorage.getItem("funcionario");

      if (!token || !funcStorage) {
        router.push("/login");
        return;
      }

      const funcObj = JSON.parse(funcStorage);
      setFuncionario(funcObj);
      setPerfilForm({
        nome: funcObj.nome || "",
        telefone: funcObj.telefone || "",
        cargo: funcObj.cargo || "Instrutor",
      });

      if (funcObj.turno) {
        setConfigFunc((prev) => ({ ...prev, turno: funcObj.turno }));
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [alunosRes, treinosRes, presencasRes] = await Promise.all([
        fetch(`${API_URL}/alunos`, { method: "GET", headers, cache: "no-store" }),
        fetch(`${API_URL}/treinos`, { method: "GET", headers, cache: "no-store" }),
        fetch(`${API_URL}/presencas/hoje`, { method: "GET", headers, cache: "no-store" }),
      ]);

      if (alunosRes.status === 401 || treinosRes.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("funcionario");
        router.push("/login");
        return;
      }

      if (alunosRes.ok) {
        const dataAlunos = await alunosRes.json();
        setAlunos(normalizarLista<Aluno>(dataAlunos));
      }

      if (treinosRes.ok) {
        const dataTreinos = await treinosRes.json();
        setTreinos(normalizarLista<Treino>(dataTreinos));
      }

      if (presencasRes.ok) {
        const dataPresencas = await presencasRes.json();
        const listaPresencas = normalizarLista<any>(dataPresencas);
        setPresencasHojeCount(listaPresencas.length);
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setErro("Não foi possível conectar ao servidor backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Carrega preferências salvas no localStorage se existirem
    const savedConfig = localStorage.getItem("config_funcionario");
    if (savedConfig) {
      try {
        setConfigFunc(JSON.parse(savedConfig));
      } catch (e) {
        console.error(e);
      }
    }

    carregarDados();

    const interval = setInterval(carregarDados, 30000);
    return () => clearInterval(interval);
  }, []);

  /* =========================
     FILTROS
  ========================= */

  const alunosFiltrados = useMemo(() => {
    return alunos.filter((aluno) =>
      aluno.nome?.toLowerCase().includes(buscaAluno.toLowerCase())
    );
  }, [alunos, buscaAluno]);

  const alunosVisiveis = mostrarTodosAlunos
    ? alunosFiltrados
    : alunosFiltrados.slice(0, 5);

  const treinosFiltrados = useMemo(() => {
    return treinos.filter(
      (t) =>
        t.nome?.toLowerCase().includes(buscaTreino.toLowerCase()) ||
        t.aluno?.nome?.toLowerCase().includes(buscaTreino.toLowerCase()) ||
        t.tipoTreino?.toLowerCase().includes(buscaTreino.toLowerCase())
    );
  }, [treinos, buscaTreino]);

  const alunosAtivosCount = useMemo(() => {
    return alunos.filter((a) => a.status?.toLowerCase() === "ativo").length;
  }, [alunos]);

  /* =========================
     AÇÕES
  ========================= */

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("funcionario");
    router.push("/login");
  }

  async function handleCriarTreino(e: React.FormEvent) {
    e.preventDefault();
    if (!novoTreino.nome || !novoTreino.alunoId) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/treinos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome: novoTreino.nome,
          descricao: novoTreino.descricao,
          dificuldade: novoTreino.dificuldade,
          duracao: Number(novoTreino.duracao),
          tipoTreino: novoTreino.tipoTreino,
          alunoId: Number(novoTreino.alunoId),
        }),
      });

      if (!res.ok) {
        throw new Error("Erro ao cadastrar treino.");
      }

      setSucesso("Treino cadastrado com sucesso!");
      setTimeout(() => setSucesso(""), 4000);
      setModalNovoTreino(false);
      setNovoTreino({
        nome: "",
        descricao: "",
        dificuldade: "Iniciante",
        duracao: 45,
        tipoTreino: "Musculação",
        alunoId: "",
      });
      await carregarDados();
    } catch (err) {
      console.error(err);
      setErro(err instanceof Error ? err.message : "Erro ao cadastrar treino.");
    }
  }

  async function handleSalvarPerfil(e: React.FormEvent) {
    e.preventDefault();
    if (!funcionario) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/funcionarios/${funcionario.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome: perfilForm.nome,
          cargo: perfilForm.cargo,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const atualizado = {
          ...funcionario,
          ...data,
          telefone: perfilForm.telefone,
        };
        setFuncionario(atualizado);
        localStorage.setItem("funcionario", JSON.stringify(atualizado));
      } else {
        const atualizado = {
          ...funcionario,
          nome: perfilForm.nome,
          telefone: perfilForm.telefone,
          cargo: perfilForm.cargo,
        };
        setFuncionario(atualizado);
        localStorage.setItem("funcionario", JSON.stringify(atualizado));
      }

      setModalPerfil(false);
      setSucesso("Dados do perfil atualizados com sucesso!");
      setTimeout(() => setSucesso(""), 4000);
    } catch (err) {
      console.error(err);
      const atualizado = {
        ...funcionario,
        nome: perfilForm.nome,
        telefone: perfilForm.telefone,
        cargo: perfilForm.cargo,
      };
      setFuncionario(atualizado);
      localStorage.setItem("funcionario", JSON.stringify(atualizado));
      setModalPerfil(false);
      setSucesso("Dados salvos com sucesso!");
      setTimeout(() => setSucesso(""), 4000);
    }
  }

  function handleSalvarConfig(e: React.FormEvent) {
    e.preventDefault();
    localStorage.setItem("config_funcionario", JSON.stringify(configFunc));
    setModalConfig(false);
    setSucesso("Preferências de funcionário salvas!");
    setTimeout(() => setSucesso(""), 4000);
  }

  async function handleAlterarSenha(e: React.FormEvent) {
    e.preventDefault();
    setSenhaErro("");

    if (!senhaForm.atual) {
      setSenhaErro("Informe a senha atual.");
      return;
    }

    if (senhaForm.nova.length < 6) {
      setSenhaErro("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (senhaForm.nova !== senhaForm.confirmar) {
      setSenhaErro("As senhas não coincidem.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token || !funcionario?.id) {
        setSenhaErro("Sessão inválida. Faça login novamente.");
        return;
      }

      const res = await fetch(`${API_URL}/funcionarios/${funcionario.id}/senha`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          senhaAtual: senhaForm.atual,
          novaSenha: senhaForm.nova,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setSenhaErro(data.error || data.message || "Erro ao alterar a senha.");
        return;
      }

      setSenhaForm({ atual: "", nova: "", confirmar: "" });
      setModalSenha(false);
      setSucesso("Senha alterada com sucesso!");
      setTimeout(() => setSucesso(""), 4000);
    } catch (err) {
      console.error(err);
      setSenhaErro("Não foi possível conectar ao servidor para alterar a senha.");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent" />
          <span className="text-sm text-zinc-400 font-medium">
            Carregando painel do funcionário...
          </span>
        </div>
      </div>
    );
  }

  if (!funcionario) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HEADER DA PÁGINA */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Image
              src="/icon.png"
              alt="GymFlow"
              width={32}
              height={32}
              priority
            />
            <span className="text-lg font-bold tracking-wide text-white">
              Gym<span className="text-yellow-400">Flow</span>
            </span>
            <span className="ml-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-2.5 py-0.5 text-xs font-bold text-yellow-400">
              Painel do Funcionário
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400 border-r border-zinc-800 pr-4">
              <User className="h-3.5 w-3.5 text-yellow-400" />
              <span>{funcionario.nome}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-400 transition-colors hover:border-zinc-600 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* NOTIFICAÇÕES */}
        {erro && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400 flex items-center justify-between">
            <span>{erro}</span>
            <button onClick={() => setErro("")}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {sucesso && (
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{sucesso}</span>
          </div>
        )}

        {/* CABEÇALHO BOAS-VINDAS */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
              Olá, {funcionario.nome} 👋
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Acompanhe alunos, gerencie treinos e consulte suas preferências operacionais.
            </p>
          </div>

          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <button
              onClick={() => setModalNovoTreino(true)}
              className="flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2.5 text-xs font-bold text-black transition-colors hover:bg-yellow-300"
            >
              <Plus className="h-4 w-4" />
              Novo Treino
            </button>

            <button
              onClick={carregarDados}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-zinc-400 transition-colors hover:border-zinc-600 hover:text-white"
              title="Atualizar dados"
            >
              <Activity className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* MÉTRICAS OPERACIONAIS (SEM EQUIPE/CONTAGEM DE FUNCIONÁRIOS) */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Users}
            label="Alunos Ativos"
            valor={String(alunosAtivosCount)}
            subtext={`${alunos.length} alunos cadastrados`}
          />

          <StatCard
            icon={Dumbbell}
            label="Treinos Cadastrados"
            valor={String(treinos.length)}
            subtext="Fichas ativas no sistema"
          />

          <StatCard
            icon={UserCheck}
            label="Presenças Hoje"
            valor={String(presencasHojeCount)}
            subtext="Acessos registrados"
          />

          <StatCard
            icon={Clock}
            label="Turno Atual"
            valor={configFunc.turno.split(" ")[0]}
            subtext={configFunc.turno}
          />
        </div>

        {/* SEÇÕES DO PAINEL DO FUNCIONÁRIO */}
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* ALUNOS DA ACADEMIA */}
          <SectionCard
            icon={Users}
            title="Alunos Registrados"
            subtitle="Consulte os alunos matriculados na academia"
            action={
              <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-1.5">
                <Search className="h-3.5 w-3.5 text-zinc-500" />
                <input
                  value={buscaAluno}
                  onChange={(e) => setBuscaAluno(e.target.value)}
                  placeholder="Buscar aluno..."
                  className="w-32 bg-transparent text-xs text-zinc-300 outline-none placeholder:text-zinc-600 sm:w-40"
                />
              </div>
            }
          >
            <div className="flex flex-col divide-y divide-zinc-900">
              {alunosVisiveis.length === 0 && (
                <p className="py-4 text-center text-sm text-zinc-500">
                  {buscaAluno ? "Nenhum aluno encontrado." : "Carregando alunos..."}
                </p>
              )}

              {alunosVisiveis.map((aluno) => (
                <div
                  key={aluno.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-yellow-400 ring-1 ring-zinc-800">
                      {aluno.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {aluno.nome}
                      </p>
                      <p className="text-xs text-zinc-500">
                        Plano {aluno.plano || "Padrão"} · desde{" "}
                        {formatarData(aluno.createdAt)}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusColor(
                      aluno.status || "Ativo"
                    )}`}
                  >
                    {aluno.status || "Ativo"}
                  </span>
                </div>
              ))}
            </div>

            {alunosFiltrados.length > 5 && (
              <button
                onClick={() => setMostrarTodosAlunos((v) => !v)}
                className="mt-4 w-full rounded-xl border border-zinc-800 py-2.5 text-xs font-bold text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white"
              >
                {mostrarTodosAlunos ? "Mostrar menos" : `Ver todos (${alunosFiltrados.length})`}
              </button>
            )}
          </SectionCard>

          {/* LISTA DE TREINOS */}
          <SectionCard
            icon={Dumbbell}
            title="Treinos & Acompanhamento"
            subtitle="Fichas de exercícios cadastradas"
            action={
              <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-1.5">
                <Search className="h-3.5 w-3.5 text-zinc-500" />
                <input
                  value={buscaTreino}
                  onChange={(e) => setBuscaTreino(e.target.value)}
                  placeholder="Buscar treino..."
                  className="w-32 bg-transparent text-xs text-zinc-300 outline-none placeholder:text-zinc-600 sm:w-40"
                />
              </div>
            }
          >
            <div className="flex flex-col divide-y divide-zinc-900">
              {treinosFiltrados.length === 0 && (
                <div className="py-6 text-center">
                  <p className="text-sm text-zinc-500">
                    Nenhum treino cadastrado até o momento.
                  </p>
                  <button
                    onClick={() => setModalNovoTreino(true)}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-yellow-400 hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" /> Criar primeiro treino
                  </button>
                </div>
              )}

              {treinosFiltrados.slice(0, 5).map((treino) => (
                <div
                  key={treino.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white">
                        {treino.nome}
                      </p>
                      <span className="rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] text-zinc-400 font-medium border border-zinc-800">
                        {treino.tipoTreino}
                      </span>
                    </div>

                    <p className="mt-0.5 text-xs text-zinc-500">
                      Aluno:{" "}
                      <span className="text-zinc-300">
                        {treino.aluno?.nome || `ID ${treino.alunoId}`}
                      </span>{" "}
                      · Duração: {treino.duracao} min
                    </p>
                  </div>

                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${dificuldadeColor(
                      treino.dificuldade
                    )}`}
                  >
                    {treino.dificuldade}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* SEGUNDA LINHA: CONFIGURAÇÕES DO FUNCIONÁRIO E SUA CONTA */}
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* CONFIGURAÇÕES DO FUNCIONÁRIO (NÃO DA ACADEMIA) */}
          <SectionCard
            icon={Settings}
            title="Configurações do Funcionário"
            subtitle="Suas preferências de turno e notificações operacionais"
          >
            <div className="flex flex-col divide-y divide-zinc-900">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-white">Turno de Trabalho</p>
                  <p className="text-xs text-zinc-500">Seu horário padrão cadastrado</p>
                </div>
                <span className="text-xs font-semibold text-yellow-400 bg-yellow-400/10 px-2.5 py-1 rounded-full border border-yellow-400/20">
                  {configFunc.turno}
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-white">Notificações no E-mail</p>
                  <p className="text-xs text-zinc-500">Alertas de treinos e avisos</p>
                </div>
                <span className="text-xs font-medium text-emerald-400">
                  {configFunc.notificacoesEmail ? "Ativado" : "Desativado"}
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-white">Alertas de Presença</p>
                  <p className="text-xs text-zinc-500">Avisos de entrada de alunos</p>
                </div>
                <span className="text-xs font-medium text-emerald-400">
                  {configFunc.notificacoesPresenca ? "Ativado" : "Desativado"}
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-white">Modo de Exibição</p>
                  <p className="text-xs text-zinc-500">Tema da interface do painel</p>
                </div>
                <span className="text-xs font-medium text-zinc-400">
                  {configFunc.modoExibicao}
                </span>
              </div>
            </div>

            <button
              onClick={() => setModalConfig(true)}
              className="mt-4 w-full rounded-xl border border-zinc-800 py-2.5 text-xs font-bold text-white transition-colors hover:border-zinc-700 hover:bg-zinc-900"
            >
              Editar preferências
            </button>
          </SectionCard>

          {/* SUA CONTA (MELHORADA) */}
          <SectionCard
            icon={User}
            title="Sua Conta"
            subtitle="Gerencie seus dados de acesso e perfil pessoal"
          >
            <div className="flex flex-col divide-y divide-zinc-900">
              <div className="flex items-center justify-between py-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Nome Completo
                </span>
                <span className="text-sm font-semibold text-white">
                  {funcionario.nome}
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  E-mail de Acesso
                </span>
                <span className="text-sm font-medium text-zinc-300">
                  {funcionario.email}
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Cargo / Função
                </span>
                <span className="text-sm font-medium text-zinc-300">
                  {funcionario.cargo || "Instrutor"}
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Telefone
                </span>
                <span className="text-sm font-medium text-zinc-300">
                  {funcionario.telefone || "Não informado"}
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Nível de Permissão
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-2.5 py-0.5 text-xs font-bold text-yellow-400">
                  <ShieldCheck className="h-3 w-3" /> Funcionário Operacional
                </span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={() => setModalPerfil(true)}
                className="rounded-xl border border-zinc-800 py-2.5 text-xs font-bold text-white transition-colors hover:border-zinc-700 hover:bg-zinc-900"
              >
                Editar meus dados
              </button>

              <button
                onClick={() => setModalSenha(true)}
                className="rounded-xl border border-zinc-800 py-2.5 text-xs font-bold text-yellow-400 transition-colors hover:border-yellow-400/40 hover:bg-yellow-400/10"
              >
                Alterar senha
              </button>
            </div>
          </SectionCard>
        </div>
      </main>

      {/* MODAL CONFIGURAÇÕES DO FUNCIONÁRIO */}
      <Modal
        open={modalConfig}
        onClose={() => setModalConfig(false)}
        title="Editar Preferências do Funcionário"
      >
        <form onSubmit={handleSalvarConfig} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Turno de Trabalho
            </span>
            <select
              value={configFunc.turno}
              onChange={(e) =>
                setConfigFunc((prev) => ({ ...prev, turno: e.target.value }))
              }
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 outline-none focus:border-yellow-400"
            >
              <option>Manhã (06:00 - 14:00)</option>
              <option>Tarde (14:00 - 22:00)</option>
              <option>Noite (16:00 - 00:00)</option>
              <option>Integral</option>
            </select>
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 cursor-pointer">
            <input
              type="checkbox"
              checked={configFunc.notificacoesEmail}
              onChange={(e) =>
                setConfigFunc((prev) => ({
                  ...prev,
                  notificacoesEmail: e.target.checked,
                }))
              }
              className="h-4 w-4 rounded accent-yellow-400"
            />
            <div>
              <p className="text-xs font-semibold text-white">
                Notificações por E-mail
              </p>
              <p className="text-[11px] text-zinc-500">
                Receber resumo de atividades
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 cursor-pointer">
            <input
              type="checkbox"
              checked={configFunc.notificacoesPresenca}
              onChange={(e) =>
                setConfigFunc((prev) => ({
                  ...prev,
                  notificacoesPresenca: e.target.checked,
                }))
              }
              className="h-4 w-4 rounded accent-yellow-400"
            />
            <div>
              <p className="text-xs font-semibold text-white">
                Alertas de Entrada de Alunos
              </p>
              <p className="text-[11px] text-zinc-500">
                Notificar presenças registradas
              </p>
            </div>
          </label>

          <button
            type="submit"
            className="mt-2 w-full rounded-xl bg-yellow-400 py-3 text-xs font-bold text-black transition-colors hover:bg-yellow-300"
          >
            Salvar preferências
          </button>
        </form>
      </Modal>

      {/* MODAL EDITAR PERFIL */}
      <Modal
        open={modalPerfil}
        onClose={() => setModalPerfil(false)}
        title="Editar Meus Dados"
      >
        <form onSubmit={handleSalvarPerfil} className="flex flex-col gap-4">
          <Field
            label="Nome Completo"
            value={perfilForm.nome}
            onChange={(e) =>
              setPerfilForm((prev) => ({ ...prev, nome: e.target.value }))
            }
            required
          />

          <Field
            label="Telefone / WhatsApp"
            value={perfilForm.telefone}
            onChange={(e) =>
              setPerfilForm((prev) => ({ ...prev, telefone: e.target.value }))
            }
            placeholder="(11) 99999-9999"
          />

          <Field
            label="Cargo / Função"
            value={perfilForm.cargo}
            onChange={(e) =>
              setPerfilForm((prev) => ({ ...prev, cargo: e.target.value }))
            }
          />

          <button
            type="submit"
            className="mt-2 w-full rounded-xl bg-yellow-400 py-3 text-xs font-bold text-black transition-colors hover:bg-yellow-300"
          >
            Salvar alterações
          </button>
        </form>
      </Modal>

      {/* MODAL ALTERAR SENHA */}
      <Modal
        open={modalSenha}
        onClose={() => {
          setModalSenha(false);
          setSenhaErro("");
        }}
        title="Alterar Senha de Acesso"
      >
        <form onSubmit={handleAlterarSenha} className="flex flex-col gap-4">
          <Field
            label="Senha Atual"
            type="password"
            value={senhaForm.atual}
            onChange={(e) =>
              setSenhaForm((prev) => ({ ...prev, atual: e.target.value }))
            }
            required
          />

          <Field
            label="Nova Senha"
            type="password"
            value={senhaForm.nova}
            onChange={(e) =>
              setSenhaForm((prev) => ({ ...prev, nova: e.target.value }))
            }
            required
          />

          <Field
            label="Confirmar Nova Senha"
            type="password"
            value={senhaForm.confirmar}
            onChange={(e) =>
              setSenhaForm((prev) => ({ ...prev, confirmar: e.target.value }))
            }
            required
          />

          {senhaErro && (
            <p className="text-xs font-medium text-red-400">{senhaErro}</p>
          )}

          <button
            type="submit"
            className="mt-2 w-full rounded-xl bg-yellow-400 py-3 text-xs font-bold text-black transition-colors hover:bg-yellow-300"
          >
            Salvar nova senha
          </button>
        </form>
      </Modal>

      {/* MODAL CADASTRAR TREINO */}
      <Modal
        open={modalNovoTreino}
        onClose={() => setModalNovoTreino(false)}
        title="Cadastrar Novo Treino para Aluno"
      >
        <form onSubmit={handleCriarTreino} className="flex flex-col gap-4">
          <Field
            label="Nome do Treino"
            value={novoTreino.nome}
            onChange={(e) =>
              setNovoTreino((prev) => ({ ...prev, nome: e.target.value }))
            }
            placeholder="Ex.: Treino A - Hipertrofia Peito/Tríceps"
            required
          />

          <Field
            label="Descrição / Observações"
            value={novoTreino.descricao}
            onChange={(e) =>
              setNovoTreino((prev) => ({ ...prev, descricao: e.target.value }))
            }
            placeholder="Ex.: 4 séries de 12 repetições com intervalo de 60s"
            required
          />

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Aluno Destino
            </span>
            <select
              value={novoTreino.alunoId}
              onChange={(e) =>
                setNovoTreino((prev) => ({ ...prev, alunoId: e.target.value }))
              }
              required
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 outline-none focus:border-yellow-400"
            >
              <option value="">Selecione um aluno</option>
              {alunos.map((aluno) => (
                <option key={aluno.id} value={aluno.id}>
                  {aluno.nome} ({aluno.email || `ID ${aluno.id}`})
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Dificuldade
              </span>
              <select
                value={novoTreino.dificuldade}
                onChange={(e) =>
                  setNovoTreino((prev) => ({ ...prev, dificuldade: e.target.value }))
                }
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 outline-none focus:border-yellow-400"
              >
                <option>Iniciante</option>
                <option>Intermediário</option>
                <option>Avançado</option>
              </select>
            </label>

            <Field
              label="Duração (minutos)"
              type="number"
              value={novoTreino.duracao}
              onChange={(e) =>
                setNovoTreino((prev) => ({
                  ...prev,
                  duracao: Number(e.target.value),
                }))
              }
              required
            />
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Tipo de Treino
            </span>
            <select
              value={novoTreino.tipoTreino}
              onChange={(e) =>
                setNovoTreino((prev) => ({ ...prev, tipoTreino: e.target.value }))
              }
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-200 outline-none focus:border-yellow-400"
            >
              <option>Musculação</option>
              <option>Cardio</option>
              <option>Funcional</option>
              <option>Reabilitação</option>
            </select>
          </label>

          <button
            type="submit"
            className="mt-2 w-full rounded-xl bg-yellow-400 py-3 text-xs font-bold text-black transition-colors hover:bg-yellow-300"
          >
            Cadastrar Treino
          </button>
        </form>
      </Modal>
    </div>
  );
}