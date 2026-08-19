"use client";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  Download,
  Filter,
  History,
  LogOut,
  Mail,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  UserCog,
  Users,
  Wallet,
  X,
  CheckCircle,
  Clock,
  DollarSign,
  Dumbbell,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  Legend,
} from "recharts";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/* =========================
   TIPOS
========================= */

interface Aluno {
  id: number;
  nome: string;
  email?: string;
  idade?: number;
  cpf?: string | number;
  dataNascimento?: string;
  plano?: string;
  status?: string;
  createdAt?: string;
}

interface Funcionario {
  id: number;
  nome: string;
  cargo?: string;
  turno?: string;
  status?: string;
  email?: string;
}

interface Receita {
  id: number;
  pagamento?: string;
  dataPagamento?: string;
  valorPagamento?: string | number;
  status?: string;
  formaPagamento?: string;
  createdAt?: string;
}

interface Despesa {
  id: number;
  descricao: string;
  valor: number;
  categoria: string;
  dataVencimento: string;
  dataPagamento?: string | null;
  status?: string;
  createdAt?: string;
}

interface Configuracao {
  unidade: string;
  endereco: string;
  horario: string;
  capacidadeMaxima: string;
}

function categoriaColor(categoria: string) {
  switch (categoria?.toUpperCase()) {
    case "LUZ":
      return "bg-amber-500/20 text-amber-300 border border-amber-500/30";
    case "AGUA":
      return "bg-blue-500/20 text-blue-300 border border-blue-500/30";
    case "INTERNET":
      return "bg-purple-500/20 text-purple-300 border border-purple-500/30";
    case "MANUTENCAO":
      return "bg-orange-500/20 text-orange-300 border border-orange-500/30";
    default:
      return "bg-zinc-800 text-zinc-300 border border-zinc-700";
  }
}

/* =========================
   HELPERS
========================= */

function normalizarLista<T>(response: any): T[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.result)) {
    return response.result;
  }

  return [];
}

function formatarData(data?: string) {
  if (!data) return "-";

  const date = new Date(data);

  if (Number.isNaN(date.getTime())) {
    return data;
  }

  return date.toLocaleDateString("pt-BR");
}

function formatarMoeda(valor?: string | number) {
  if (valor === undefined || valor === null || valor === "") {
    return "R$ 0,00";
  }

  const numero =
    typeof valor === "number"
      ? valor
      : Number(String(valor).replace(",", "."));

  if (Number.isNaN(numero)) {
    return `R$ ${valor}`;
  }

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/* =========================
   CORREÇÃO DO TOOLTIP
========================= */

function formatarTooltip(value: unknown) {
  if (typeof value === "number" || typeof value === "string") {
    return formatarMoeda(value);
  }

  return "R$ 0,00";
}

function numero(valor?: string | number) {
  if (typeof valor === "number") return valor;

  if (!valor) return 0;

  let str = String(valor).replace("R$", "").trim();

  if (str.includes(",")) {
    str = str.replace(/\./g, "").replace(",", ".");
  }

  const convertido = Number(str);

  return Number.isNaN(convertido) ? 0 : convertido;
}

function statusColor(status: string) {
  switch (status?.toLowerCase()) {
    case "ativo":
      return "border-emerald-400/30 bg-emerald-400/10 text-emerald-400";

    case "pago":
      return "border-emerald-400/30 bg-emerald-400/10 text-emerald-400";

    case "pendente":
      return "border-amber-400/30 bg-amber-400/10 text-amber-400";

    case "atrasado":
      return "border-amber-400/30 bg-amber-400/10 text-amber-400";

    case "férias":
      return "border-sky-400/30 bg-sky-400/10 text-sky-400";

    case "inativo":
      return "border-red-400/30 bg-red-400/10 text-red-400";

    default:
      return "border-zinc-700 bg-zinc-800/50 text-zinc-400";
  }
}

const CORES_CHART = [
  "#10b981",
  "#f59e0b",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

/* =========================
   COMPONENTES
========================= */

function StatCard({
  icon: Icon,
  label,
  valor,
  variacao,
  trend,
}: {
  icon: React.ElementType;
  label: string;
  valor: string;
  variacao: string;
  trend?: "up" | "down";
}) {
  return (
    <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950 p-5 hover:border-zinc-700 transition">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-zinc-500">
          {label}
        </span>

        <Icon className="h-4 w-4 text-zinc-500" />
      </div>

      <p className="mt-3 text-2xl font-extrabold text-white">
        {valor}
      </p>

      <div className="mt-1 flex items-center gap-1">
        {trend === "up" && (
          <TrendingUp className="h-3 w-3 text-emerald-400" />
        )}

        {trend === "down" && (
          <TrendingDown className="h-3 w-3 text-red-400" />
        )}

        <p
          className={`text-xs ${
            trend === "up"
              ? "text-emerald-400"
              : trend === "down"
              ? "text-red-400"
              : "text-zinc-500"
          }`}
        >
          {variacao}
        </p>
      </div>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  action,
  children,
  fullWidth,
}: {
  icon: React.ElementType;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-zinc-800/70 bg-zinc-950 p-6 sm:p-7 ${
        fullWidth ? "col-span-full" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-zinc-300">
            <Icon className="h-4 w-4" />
          </div>

          <h2 className="text-base font-bold text-white sm:text-lg">
            {title}
          </h2>
        </div>

        {action}
      </div>

      <div className="mt-5">{children}</div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">
            {title}
          </h3>

          <button
            onClick={onClose}
            className="rounded-md p-1 text-zinc-500 transition-colors hover:text-white"
            aria-label="Fechar"
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
      <span className="text-xs uppercase tracking-wide text-zinc-500">
        {label}
      </span>

      <input
        {...props}
        className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-500"
      />
    </label>
  );
}

function AlertCard({
  icon: Icon,
  title,
  description,
  type = "warning",
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  type?: "warning" | "info" | "error" | "success";
}) {
  const baseColor = {
    warning:
      "border-amber-400/30 bg-amber-400/10 text-amber-400",
    info: "border-blue-400/30 bg-blue-400/10 text-blue-400",
    error: "border-red-400/30 bg-red-400/10 text-red-400",
    success:
      "border-emerald-400/30 bg-emerald-400/10 text-emerald-400",
  }[type];

  return (
    <div
      className={`rounded-xl border p-4 ${baseColor} flex gap-3`}
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />

      <div>
        <p className="text-sm font-semibold">{title}</p>

        <p className="text-xs opacity-80">
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================
   DASHBOARD
========================= */

export default function AdminDashboardPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [isAdm, setIsAdm] = useState<boolean>(true);

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [searchAlunos, setSearchAlunos] = useState("");
  const [searchFuncionarios, setSearchFuncionarios] = useState("");
  const [searchDespesas, setSearchDespesas] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("TODAS");

  const [filterStatus, setFilterStatus] = useState("todos");

  const [modalEquipe, setModalEquipe] = useState(false);
  const [modalConfig, setModalConfig] = useState(false);
  const [modalSenha, setModalSenha] = useState(false);
  const [modalDespesa, setModalDespesa] = useState(false);

  const [novaDespesa, setNovaDespesa] = useState({
    descricao: "",
    valor: "",
    categoria: "LUZ",
    dataVencimento: new Date().toISOString().split("T")[0],
    dataPagamento: "",
    status: "PENDENTE",
  });

  const [novoFuncionario, setNovoFuncionario] = useState({
    nome: "",
    cargo: "",
    turno: "Manhã",
  });

  const [configForm, setConfigForm] =
    useState<Configuracao>({
      unidade: "GymFlow",
      endereco: "Não cadastrado",
      horario: "Não cadastrado",
      capacidadeMaxima: "100",
    });

  const [senhaForm, setSenhaForm] = useState({
    atual: "",
    nova: "",
    confirmar: "",
  });

  const [senhaErro, setSenhaErro] = useState("");

  /* =========================
     CARREGAR DADOS
  ========================= */

  useEffect(() => {
    // Detecta se o usuário logado é Admin ou Funcionário comum
    const funcStorage = localStorage.getItem("funcionario");
    if (funcStorage) {
      try {
        const func = JSON.parse(funcStorage);
        setIsAdm(Boolean(func.adm));
      } catch (e) {
        console.error("Erro ao ler dados do funcionário:", e);
      }
    }

    const savedConfig = localStorage.getItem("config");
    if (savedConfig) {
      try {
        setConfigForm(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Erro ao carregar config:", e);
      }
    }

    carregarDados();

    const intervalo = setInterval(() => {
      carregarDados();
    }, 30000);

    return () => clearInterval(intervalo);
  }, []);

  async function carregarDados() {
    try {
      setErro("");
      setLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const [resAlunos, resFuncionarios, resReceitas, resDespesas] = await Promise.all([
        fetch(`${API_URL}/alunos`, { headers, cache: "no-store" }),
        fetch(`${API_URL}/funcionarios`, { headers, cache: "no-store" }),
        fetch(`${API_URL}/receitas`, { headers, cache: "no-store" }),
        fetch(`${API_URL}/despesas`, { headers, cache: "no-store" }),
      ]);

      if (
        resAlunos.status === 401 ||
        resFuncionarios.status === 401 ||
        resReceitas.status === 401 ||
        resDespesas.status === 401
      ) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      if (
        !resAlunos.ok ||
        !resFuncionarios.ok ||
        !resReceitas.ok ||
        !resDespesas.ok
      ) {
        const respostas = [
          ["alunos", resAlunos],
          ["funcionarios", resFuncionarios],
          ["receitas", resReceitas],
          ["despesas", resDespesas],
        ] as const;

        const respostaComErro = respostas.find(([, res]) => !res.ok);
        const nomeEndpoint = respostaComErro?.[0] || "API";
        throw new Error(
          `Erro ao carregar ${nomeEndpoint} (HTTP ${respostaComErro?.[1].status || "desconhecido"})`
        );
      }

      const dataAlunos = await resAlunos.json();
      const dataFuncionarios = await resFuncionarios.json();
      const dataReceitas = await resReceitas.json();
      const dataDespesas = await resDespesas.json();

      setAlunos(normalizarLista<Aluno>(dataAlunos));
      setFuncionarios(normalizarLista<Funcionario>(dataFuncionarios));
      setReceitas(normalizarLista<Receita>(dataReceitas));

      const listaDespesas =
        dataDespesas?.despesas ??
        dataDespesas?.data ??
        dataDespesas?.result ??
        dataDespesas;

      setDespesas(normalizarLista<Despesa>(listaDespesas));
    } catch (err) {
      setErro(
        err instanceof Error
          ? err.message
          : "Erro ao carregar dados"
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================
     FUNCIONÁRIOS
  ========================= */

  async function adicionarFuncionario(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (
      !novoFuncionario.nome ||
      !novoFuncionario.cargo
    ) {
      alert("Preencha os campos obrigatórios");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      // Gerar campos obrigatórios para o backend funcionar corretamente
      const payload = {
        nome: novoFuncionario.nome,
        cargo: novoFuncionario.cargo,
        turno: novoFuncionario.turno,
        email: `${novoFuncionario.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, ".")}@gymflow.com`,
        senha: "123456", // Senha padrão para novos colaboradores
        idade: 30,
        dataNascimento: "1995-01-01T00:00:00.000Z",
        cpf: `${Math.floor(100 + Math.random() * 900)}.${Math.floor(100 + Math.random() * 900)}.${Math.floor(100 + Math.random() * 900)}-${Math.floor(10 + Math.random() * 90)}`,
        clt: String(Math.floor(1000000000 + Math.random() * 9000000000)),
      };

      const res = await fetch(
        `${API_URL}/funcionarios`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erro ao adicionar funcionário");
      }

      setNovoFuncionario({
        nome: "",
        cargo: "",
        turno: "Manhã",
      });

      setModalEquipe(false);

      carregarDados();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Erro ao adicionar"
      );
    }
  }

  async function deletarFuncionario(id: number) {
    if (
      !confirm(
        "Tem certeza que deseja deletar este funcionário?"
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/funcionarios/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Erro ao deletar");
      }

      carregarDados();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Erro ao deletar"
      );
    }
  }

  /* =========================
     CONFIGURAÇÕES
  ========================= */

  async function salvarConfig(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    try {
      localStorage.setItem(
        "config",
        JSON.stringify(configForm)
      );

      setModalConfig(false);

      alert("Configurações salvas!");
    } catch (err) {
      alert("Erro ao salvar");
    }
  }

  /* =========================
     SENHA
  ========================= */

  async function alterarSenha(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setSenhaErro("");

    if (
      senhaForm.nova !== senhaForm.confirmar
    ) {
      setSenhaErro("As senhas não coincidem");
      return;
    }

    if (senhaForm.nova.length < 6) {
      setSenhaErro(
        "A senha deve ter no mínimo 6 caracteres"
      );
      return;
    }

    try {
      setSenhaForm({
        atual: "",
        nova: "",
        confirmar: "",
      });

      setModalSenha(false);

      alert("Senha alterada com sucesso!");
    } catch (err) {
      setSenhaErro("Erro ao alterar senha");
    }
  }

  /* =========================
     RECEITAS
  ========================= */

  async function marcarComoPago(receita: Receita) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/receitas/${receita.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            pagamento: receita.pagamento || "Mensalidade",
            dataPagamento: receita.dataPagamento || new Date().toISOString(),
            valorPagamento: receita.valorPagamento || 0,
            status: "Pago",
            formaPagamento: receita.formaPagamento || "Dinheiro",
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Erro ao atualizar pagamento");
      }

      carregarDados();
    } catch (err) {
    }
  }

  /* =========================
     FILTROS
  ========================= */

  const alunosFiltrados = useMemo(() => {
    return alunos.filter((aluno) => {
      const matchNome = aluno.nome
        .toLowerCase()
        .includes(searchAlunos.toLowerCase());

      const matchStatus =
        filterStatus === "todos" ||
        aluno.status === filterStatus;

      return matchNome && matchStatus;
    });
  }, [alunos, searchAlunos, filterStatus]);

  const funcionariosFiltrados = useMemo(() => {
    return funcionarios.filter((func) =>
      func.nome
        .toLowerCase()
        .includes(
          searchFuncionarios.toLowerCase()
        )
    );
  }, [funcionarios, searchFuncionarios]);

  const despesasFiltradas = useMemo(() => {
    const busca = searchDespesas.trim().toLowerCase();

    return despesas.filter((despesa) => {
      const correspondeBusca =
        !busca ||
        despesa.descricao.toLowerCase().includes(busca) ||
        despesa.categoria.toLowerCase().includes(busca);

      const correspondeCategoria =
        categoriaFilter === "TODAS" ||
        despesa.categoria.toUpperCase() === categoriaFilter;

      return correspondeBusca && correspondeCategoria;
    });
  }, [despesas, searchDespesas, categoriaFilter]);

  /* =========================
     GRÁFICOS
  ========================= */

  const receitaPorPlano = useMemo(() => {
    const agrupar = alunos.reduce(
      (acc, aluno) => {
        const plano = aluno.plano || "Sem plano";

        const existente = acc.find(
          (r) => r.plano === plano
        );

        if (existente) {
          existente.valor += 50;
        } else {
          acc.push({
            plano,
            valor: 50,
          });
        }

        return acc;
      },
      [] as {
        plano: string;
        valor: number;
      }[]
    );

    const total = agrupar.reduce(
      (sum, r) => sum + r.valor,
      0
    );

    return agrupar.map((r) => ({
      ...r,
      porcentagem:
        total > 0
          ? (r.valor / total) * 100
          : 0,
    }));
  }, [alunos]);

  const receitasChartData = useMemo(() => {
    return [
      {
        mes: "Jan",
        receita: 4000,
      },
      {
        mes: "Fev",
        receita: 3000,
      },
      {
        mes: "Mar",
        receita: 4500,
      },
      {
        mes: "Abr",
        receita: 5200,
      },
      {
        mes: "Mai",
        receita: 4800,
      },
      {
        mes: "Jun",
        receita: 6100,
      },
    ];
  }, []);

  const totalReceita = useMemo(() => {
    return receitas.reduce(
      (sum, r) =>
        sum + numero(r.valorPagamento),
      0
    );
  }, [receitas]);

  const receitasPendentes = useMemo(() => {
    return receitas.filter(
      (r) =>
        r.status?.toLowerCase() ===
          "pendente" ||
        r.status?.toLowerCase() ===
          "atrasado"
    ).length;
  }, [receitas]);

  const taxaOcupacao = useMemo(() => {
    return configForm.capacidadeMaxima
      ? Math.round(
          (alunos.length /
            parseInt(
              configForm.capacidadeMaxima
            )) *
            100
        )
      : 0;
  }, [alunos, configForm]);

  /* =========================
     DESPESAS
  ========================= */

  async function adicionarDespesa(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!novaDespesa.descricao.trim()) {
      alert("Informe a descrição da despesa.");
      return;
    }

    const valor = Number(
      String(novaDespesa.valor).replace(",", ".")
    );

    if (!Number.isFinite(valor) || valor <= 0) {
      alert("Informe um valor válido para a despesa.");
      return;
    }

    if (!novaDespesa.dataVencimento) {
      alert("Informe a data de vencimento.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const res = await fetch(`${API_URL}/despesas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          descricao: novaDespesa.descricao.trim(),
          valor,
          categoria: novaDespesa.categoria,
          dataVencimento: `${novaDespesa.dataVencimento}T00:00:00.000Z`,
          dataPagamento: novaDespesa.dataPagamento
            ? `${novaDespesa.dataPagamento}T00:00:00.000Z`
            : null,
          status: novaDespesa.status,
        }),
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      if (!res.ok) {
        let mensagem = "Erro ao cadastrar despesa.";

        try {
          const erroApi = await res.json();
          mensagem =
            erroApi?.error ||
            erroApi?.message ||
            mensagem;
        } catch {
          // Mantém a mensagem padrão se a API não retornar JSON.
        }

        throw new Error(mensagem);
      }

      setNovaDespesa({
        descricao: "",
        valor: "",
        categoria: "LUZ",
        dataVencimento: new Date()
          .toISOString()
          .split("T")[0],
        dataPagamento: "",
        status: "PENDENTE",
      });

      setModalDespesa(false);
      await carregarDados();
      alert("Despesa cadastrada com sucesso!");
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Erro ao cadastrar despesa."
      );
    }
  }

  async function deletarDespesa(id: number) {
    if (!confirm("Tem certeza que deseja excluir esta despesa?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const res = await fetch(`${API_URL}/despesas/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      if (!res.ok) {
        let mensagem = "Erro ao excluir despesa.";

        try {
          const erroApi = await res.json();
          mensagem =
            erroApi?.error ||
            erroApi?.message ||
            mensagem;
        } catch {
          // Mantém a mensagem padrão.
        }

        throw new Error(mensagem);
      }

      await carregarDados();
      alert("Despesa excluída com sucesso!");
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Erro ao excluir despesa."
      );
    }
  }

  async function marcarDespesaComoPaga(id: number) {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const res = await fetch(`${API_URL}/despesas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "PAGO",
          dataPagamento: new Date().toISOString(),
        }),
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      if (!res.ok) {
        let mensagem = "Erro ao marcar despesa como paga.";

        try {
          const erroApi = await res.json();
          mensagem =
            erroApi?.error ||
            erroApi?.message ||
            mensagem;
        } catch {
          // Mantém a mensagem padrão.
        }

        throw new Error(mensagem);
      }

      await carregarDados();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Erro ao marcar despesa como paga."
      );
    }
  }

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-950 p-4 sm:p-6 lg:p-8">
      <div className="space-y-8">

        {/* HEADER */}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Dashboard
            </h1>

            <p className="text-zinc-500 text-sm mt-1">
              {new Date().toLocaleDateString(
                "pt-BR",
                {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={carregarDados}
              className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-white hover:border-zinc-500 transition"
            >
              <Download className="h-4 w-4" />
              Atualizar
            </button>

            <button
              onClick={() =>
                setModalConfig(true)
              }
              className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-white hover:border-zinc-500 transition"
            >
              <Settings className="h-4 w-4" />
              Config
            </button>

            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("funcionario");
                window.location.href = "/login";
              }}
              className="flex items-center gap-2 rounded-lg border border-red-900/50 bg-red-950/20 px-4 py-2 text-sm font-medium text-red-400 hover:border-red-500 transition"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </div>

        {/* ERRO */}

        {erro && (
          <AlertCard
            icon={AlertTriangle}
            title="Erro ao carregar dados"
            description={erro}
            type="error"
          />
        )}

        {/* ALERTAS */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {receitasPendentes > 0 && (
            <AlertCard
              icon={Clock}
              title="Pagamentos pendentes"
              description={`${receitasPendentes} recebimento(s) aguardando confirmação`}
              type="warning"
            />
          )}

          {taxaOcupacao > 90 && (
            <AlertCard
              icon={Activity}
              title="Academia no limite"
              description={`Ocupação de ${taxaOcupacao}% da capacidade`}
              type="warning"
            />
          )}

          {alunos.length === 0 && (
            <AlertCard
              icon={Users}
              title="Sem alunos"
              description="Nenhum aluno registrado ainda"
              type="info"
            />
          )}
        </div>

        {!loading && (
          <div>

            {/* STATS */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={Users}
                label="Alunos ativos"
                valor={alunos
                  .filter(
                    (a) => a.status === "ativo"
                  )
                  .length.toString()}
                variacao={`Total: ${alunos.length}`}
                trend={
                  alunos.length > 10
                    ? "up"
                    : "down"
                }
              />

              <StatCard
                icon={UserCog}
                label="Funcionários"
                valor={funcionarios.length.toString()}
                variacao={`Ativos: ${
                  funcionarios.filter(
                    (f) =>
                      f.status !== "inativo"
                  ).length
                }`}
                trend="up"
              />

              <StatCard
                icon={DollarSign}
                label="Receita total"
                valor={formatarMoeda(
                  totalReceita
                )}
                variacao={`Pendente: ${receitasPendentes}`}
                trend="up"
              />

              <StatCard
                icon={Dumbbell}
                label="Taxa de ocupação"
                valor={`${taxaOcupacao}%`}
                variacao={`${alunos.length} de ${
                  configForm.capacidadeMaxima ||
                  "?"
                }`}
                trend={
                  taxaOcupacao > 80
                    ? "up"
                    : "down"
                }
              />
            </div>

            {/* GRÁFICOS */}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

              {/* RECEITAS */}

              <SectionCard
                icon={BarChart3}
                title="Receitas por mês"
                fullWidth={false}
              >
                <ResponsiveContainer
                  width="100%"
                  height={250}
                >
                  <LineChart
                    data={receitasChartData}
                  >
                    <XAxis
                      dataKey="mes"
                      stroke="#71717a"
                      style={{
                        fontSize: "12px",
                      }}
                    />

                    <YAxis
                      stroke="#71717a"
                      style={{
                        fontSize: "12px",
                      }}
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor:
                          "#18181b",
                        border:
                          "1px solid #27272a",
                      }}
                      formatter={(value) =>
                        formatarTooltip(value)
                      }
                    />

                    <Line
                      type="monotone"
                      dataKey="receita"
                      stroke="#10b981"
                      dot={false}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </SectionCard>

              {/* PLANOS */}

              <SectionCard
                icon={Wallet}
                title="Planos contratados"
                fullWidth={false}
              >
                {receitaPorPlano.length > 0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height={250}
                  >
                    <PieChart>
                      <Pie
                        data={receitaPorPlano}
                        dataKey="valor"
                        nameKey="plano"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                      >
                        {receitaPorPlano.map(
                          (_, index) => (
                            <Cell
                              key={index}
                              fill={
                                CORES_CHART[
                                  index %
                                    CORES_CHART.length
                                ]
                              }
                            />
                          )
                        )}
                      </Pie>

                      <Tooltip
                        formatter={(value) =>
                          formatarTooltip(value)
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-zinc-500">
                    Sem dados
                  </p>
                )}
              </SectionCard>

              {/* RESUMO */}

              <SectionCard
                icon={CheckCircle}
                title="Resumo do mês"
                fullWidth={false}
              >
                <div className="space-y-3">

                  <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg">
                    <span className="text-sm text-zinc-400">
                      Novos alunos
                    </span>

                    <span className="text-lg font-bold text-emerald-400">
                      +
                      {Math.floor(
                        alunos.length * 0.2
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg">
                    <span className="text-sm text-zinc-400">
                      Cancelamentos
                    </span>

                    <span className="text-lg font-bold text-red-400">
                      -2
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg">
                    <span className="text-sm text-zinc-400">
                      Taxa conversão
                    </span>

                    <span className="text-lg font-bold text-blue-400">
                      87%
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg">
                    <span className="text-sm text-zinc-400">
                      Satisfação
                    </span>

                    <span className="text-lg font-bold text-amber-400">
                      4.8/5
                    </span>
                  </div>

                </div>
              </SectionCard>
            </div>

            {/* TABELAS */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* ALUNOS */}

              <SectionCard
                icon={Users}
                title="Alunos"
                action={
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Buscar aluno..."
                      value={searchAlunos}
                      onChange={(e) =>
                        setSearchAlunos(
                          e.target.value
                        )
                      }
                      className="px-3 py-1.5 text-xs rounded-lg border border-zinc-800 bg-zinc-900 text-white placeholder-zinc-600 focus:border-zinc-600 outline-none"
                    />

                    <select
                      value={filterStatus}
                      onChange={(e) =>
                        setFilterStatus(
                          e.target.value
                        )
                      }
                      className="px-3 py-1.5 text-xs rounded-lg border border-zinc-800 bg-zinc-900 text-white focus:border-zinc-600 outline-none"
                    >
                      <option value="todos">
                        Todos
                      </option>

                      <option value="ativo">
                        Ativo
                      </option>

                      <option value="inativo">
                        Inativo
                      </option>
                    </select>
                  </div>
                }
              >
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {alunosFiltrados.length ===
                  0 ? (
                    <p className="text-sm text-zinc-500">
                      Nenhum aluno encontrado
                    </p>
                  ) : (
                    alunosFiltrados
                      .slice(0, 8)
                      .map((aluno) => (
                        <div
                          key={aluno.id}
                          className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg hover:bg-zinc-900 transition"
                        >
                          <div>
                            <p className="text-sm font-medium text-white">
                              {aluno.nome}
                            </p>

                            <p className="text-xs text-zinc-500">
                              {aluno.email ||
                                "Sem email"}
                            </p>
                          </div>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusColor(
                              aluno.status || ""
                            )}`}
                          >
                            {aluno.status ||
                              "Sem status"}
                          </span>
                        </div>
                      ))
                  )}
                </div>
              </SectionCard>

              {/* FUNCIONÁRIOS */}

              <SectionCard
                icon={UserCog}
                title="Funcionários"
                action={
                  isAdm && (
                    <button
                      onClick={() =>
                        setModalEquipe(true)
                      }
                      className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-black hover:bg-zinc-200 transition"
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar
                    </button>
                  )
                }
              >
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {funcionariosFiltrados.length ===
                  0 ? (
                    <p className="text-sm text-zinc-500">
                      Nenhum funcionário
                      registrado
                    </p>
                  ) : (
                    funcionariosFiltrados
                      .slice(0, 8)
                      .map((func) => (
                        <div
                          key={func.id}
                          className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg hover:bg-zinc-900 transition group"
                        >
                          <div>
                            <p className="text-sm font-medium text-white">
                              {func.nome}
                            </p>

                            <p className="text-xs text-zinc-500">
                              {func.cargo ||
                                "Sem cargo"}
                            </p>
                          </div>

                          {isAdm && (
                            <button
                              onClick={() =>
                                deletarFuncionario(
                                  func.id
                                )
                              }
                              className="opacity-0 group-hover:opacity-100 rounded px-2 py-1 text-xs text-red-400 hover:bg-red-400/10 transition"
                            >
                              Remover
                            </button>
                          )}
                        </div>
                      ))
                  )}
                </div>
              </SectionCard>
            </div>

            {/* RECEITAS */}

            <div className="mt-6">
              <SectionCard
                icon={Wallet}
                title="Últimas receitas"
                action={
                  <span className="text-xs text-zinc-500">
                    {receitas.length} registros
                  </span>
                }
                fullWidth
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {receitas.length === 0 ? (
                    <p className="text-sm text-zinc-500">
                      Sem receitas registradas
                    </p>
                  ) : (
                    receitas
                      .slice(0, 6)
                      .map((receita) => (
                        <div
                          key={receita.id}
                          className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800/50"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-sm font-medium text-white">
                                {receita.pagamento ||
                                  "Pagamento"}
                              </p>

                              <p className="text-xs text-zinc-500">
                                {formatarData(
                                  receita.dataPagamento
                                )}
                              </p>
                            </div>

                            <span
                              className={`rounded-full border px-2 py-1 text-xs font-semibold ${statusColor(
                                receita.status ||
                                  ""
                              )}`}
                            >
                              {receita.status ||
                                "Sem status"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <p className="text-lg font-bold text-white">
                              {formatarMoeda(
                                receita.valorPagamento
                              )}
                            </p>

                            {(receita.status?.toLowerCase() === "atrasado" ||
                              receita.status?.toLowerCase() === "pendente") && (
                              <button
                                onClick={() =>
                                  marcarComoPago(receita)
                                }
                                className="text-xs px-2 py-1 rounded bg-emerald-400/20 text-emerald-400 hover:bg-emerald-400/30 transition"
                              >
                                Marcar pago
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </SectionCard>
            </div>

            {/* DESPESAS & CONTAS A PAGAR */}

            <div className="mt-6">
              <SectionCard
                icon={TrendingDown}
                title="Despesas & Contas da Academia"
                action={
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      placeholder="Buscar despesa..."
                      value={searchDespesas}
                      onChange={(e) => setSearchDespesas(e.target.value)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-zinc-800 bg-zinc-900 text-white placeholder-zinc-600 focus:border-zinc-600 outline-none"
                    />

                    <select
                      value={categoriaFilter}
                      onChange={(e) => setCategoriaFilter(e.target.value)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-zinc-800 bg-zinc-900 text-white focus:border-zinc-600 outline-none"
                    >
                      <option value="TODAS">Todas Categorias</option>
                      <option value="LUZ">Luz / Energia</option>
                      <option value="AGUA">Água e Esgoto</option>
                      <option value="INTERNET">Internet</option>
                      <option value="MANUTENCAO">Manutenção</option>
                      <option value="OUTROS">Outros</option>
                    </select>

                    {isAdm && (
                      <button
                        onClick={() => setModalDespesa(true)}
                        className="flex items-center gap-1.5 rounded-lg bg-yellow-400 px-3 py-1.5 text-xs font-bold text-black hover:bg-yellow-300 transition"
                      >
                        <Plus className="h-4 w-4" />
                        Nova Despesa
                      </button>
                    )}
                  </div>
                }
                fullWidth
              >
                <div className="overflow-x-auto rounded-lg border border-zinc-800/80 bg-zinc-950">
                  <table className="w-full text-left text-xs text-zinc-300">
                    <thead className="bg-zinc-900/90 uppercase text-[11px] font-semibold text-zinc-400 border-b border-zinc-800">
                      <tr>
                        <th className="px-4 py-3">id</th>
                        <th className="px-4 py-3">descricao</th>
                        <th className="px-4 py-3">valor</th>
                        <th className="px-4 py-3">categoria</th>
                        <th className="px-4 py-3">dataVencimento</th>
                        <th className="px-4 py-3">dataPagamento</th>
                        <th className="px-4 py-3">status</th>
                        {isAdm && <th className="px-4 py-3 text-right">ações</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900 font-mono">
                      {despesasFiltradas.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-6 text-center text-zinc-500 font-sans">
                            Nenhuma despesa registrada.
                          </td>
                        </tr>
                      ) : (
                        despesasFiltradas.map((despesa) => (
                          <tr key={despesa.id} className="hover:bg-zinc-900/40 transition">
                            <td className="px-4 py-3 font-semibold text-white">{despesa.id}</td>
                            <td className="px-4 py-3 font-sans font-medium text-white">{despesa.descricao}</td>
                            <td className="px-4 py-3 font-bold text-yellow-400">
                              {formatarMoeda(despesa.valor)}
                            </td>
                            <td className="px-4 py-3 font-sans">
                              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider ${categoriaColor(despesa.categoria)}`}>
                                {despesa.categoria}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-zinc-400">
                              {formatarData(despesa.dataVencimento)}
                            </td>
                            <td className="px-4 py-3 text-zinc-400">
                              {despesa.dataPagamento ? formatarData(despesa.dataPagamento) : "-"}
                            </td>
                            <td className="px-4 py-3 font-sans">
                              <span
                                className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusColor(
                                  despesa.status || (despesa.dataPagamento ? "pago" : "pendente")
                                )}`}
                              >
                                {despesa.status || (despesa.dataPagamento ? "PAGO" : "PENDENTE")}
                              </span>
                            </td>
                            {isAdm && (
                              <td className="px-4 py-3 text-right font-sans">
                                <div className="flex items-center justify-end gap-2">
                                  {!despesa.dataPagamento && despesa.status?.toUpperCase() !== "PAGO" && (
                                    <button
                                      onClick={() => marcarDespesaComoPaga(despesa.id)}
                                      className="px-2 py-1 rounded bg-emerald-400/20 text-emerald-400 text-xs hover:bg-emerald-400/30 transition font-semibold"
                                    >
                                      Pagar
                                    </button>
                                  )}
                                  <button
                                    onClick={() => deletarDespesa(despesa.id)}
                                    className="px-2 py-1 rounded text-xs text-red-400 hover:bg-red-400/10 transition"
                                  >
                                    Excluir
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            </div>

            {/* STATUS DA CONEXÃO */}

            <div className="mt-6">
              <SectionCard
                icon={History}
                title="Sistema"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  <div className="flex items-center gap-3 p-4 bg-zinc-900/30 rounded-lg border border-zinc-800/50">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>

                    <div>
                      <p className="text-sm font-medium text-white">
                        API Backend
                      </p>

                      <p className="text-xs text-zinc-500">
                        Conectado
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-zinc-900/30 rounded-lg border border-zinc-800/50">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>

                    <div>
                      <p className="text-sm font-medium text-white">
                        Banco de Dados
                      </p>

                      <p className="text-xs text-zinc-500">
                        Sincronizado
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-zinc-900/30 rounded-lg border border-zinc-800/50">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>

                    <div>
                      <p className="text-sm font-medium text-white">
                        Servidor
                      </p>

                      <p className="text-xs text-zinc-500">
                        Operacional
                      </p>
                    </div>
                  </div>

                </div>
              </SectionCard>
            </div>

          </div>
        )}

        {/* LOADING */}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">

              <div className="h-8 w-8 rounded-full border-2 border-zinc-700 border-t-white mx-auto animate-spin"></div>

              <p className="text-zinc-500 mt-4">
                Carregando dados...
              </p>

            </div>
          </div>
        )}
      </div>

      {/* =========================
          MODAL FUNCIONÁRIO
      ========================= */}

      <Modal
        open={modalEquipe}
        onClose={() =>
          setModalEquipe(false)
        }
        title="Adicionar funcionário"
      >
        <form
          onSubmit={adicionarFuncionario}
          className="flex flex-col gap-4"
        >
          <Field
            label="Nome"
            value={novoFuncionario.nome}
            onChange={(e) =>
              setNovoFuncionario(
                (prev) => ({
                  ...prev,
                  nome: e.target.value,
                })
              )
            }
            placeholder="Nome completo"
            required
          />

          <Field
            label="Cargo"
            value={novoFuncionario.cargo}
            onChange={(e) =>
              setNovoFuncionario(
                (prev) => ({
                  ...prev,
                  cargo: e.target.value,
                })
              )
            }
            placeholder="Ex.: Instrutor de musculação"
            required
          />

          <label className="flex flex-col gap-1.5">
            <span className="text-xs uppercase tracking-wide text-zinc-500">
              Turno
            </span>

            <select
              value={novoFuncionario.turno}
              onChange={(e) =>
                setNovoFuncionario(
                  (prev) => ({
                    ...prev,
                    turno: e.target.value,
                  })
                )
              }
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-500"
            >
              <option>Manhã</option>
              <option>Tarde</option>
              <option>Noite</option>
            </select>
          </label>

          <button
            type="submit"
            className="mt-2 w-full rounded-lg bg-white py-2.5 text-sm font-bold text-black transition-colors hover:bg-zinc-200"
          >
            Adicionar
          </button>
        </form>
      </Modal>

      {/* =========================
          MODAL CONFIG
      ========================= */}

      <Modal
        open={modalConfig}
        onClose={() =>
          setModalConfig(false)
        }
        title="Editar configurações"
      >
        <form
          onSubmit={salvarConfig}
          className="flex flex-col gap-4"
        >
          <Field
            label="Unidade"
            value={configForm.unidade}
            onChange={(e) =>
              setConfigForm(
                (prev) => ({
                  ...prev,
                  unidade: e.target.value,
                })
              )
            }
            placeholder="Nome da unidade"
          />

          <Field
            label="Endereço"
            value={configForm.endereco}
            onChange={(e) =>
              setConfigForm(
                (prev) => ({
                  ...prev,
                  endereco: e.target.value,
                })
              )
            }
            placeholder="Rua, número..."
          />

          <Field
            label="Horário de funcionamento"
            value={configForm.horario}
            onChange={(e) =>
              setConfigForm(
                (prev) => ({
                  ...prev,
                  horario: e.target.value,
                })
              )
            }
            placeholder="Ex.: 06:00 - 23:00"
          />

          <Field
            label="Capacidade máxima"
            type="number"
            value={
              configForm.capacidadeMaxima
            }
            onChange={(e) =>
              setConfigForm(
                (prev) => ({
                  ...prev,
                  capacidadeMaxima:
                    e.target.value,
                })
              )
            }
            placeholder="Ex.: 100"
          />

          <button
            type="submit"
            className="mt-2 w-full rounded-lg bg-white py-2.5 text-sm font-bold text-black transition-colors hover:bg-zinc-200"
          >
            Salvar alterações
          </button>
        </form>
      </Modal>

      {/* =========================
          MODAL SENHA
      ========================= */}

      <Modal
        open={modalSenha}
        onClose={() => {
          setModalSenha(false);
          setSenhaErro("");
        }}
        title="Alterar senha"
      >
        <form
          onSubmit={alterarSenha}
          className="flex flex-col gap-4"
        >
          <Field
            label="Senha atual"
            type="password"
            value={senhaForm.atual}
            onChange={(e) =>
              setSenhaForm(
                (prev) => ({
                  ...prev,
                  atual: e.target.value,
                })
              )
            }
            required
          />

          <Field
            label="Nova senha"
            type="password"
            value={senhaForm.nova}
            onChange={(e) =>
              setSenhaForm(
                (prev) => ({
                  ...prev,
                  nova: e.target.value,
                })
              )
            }
            required
          />

          <Field
            label="Confirmar nova senha"
            type="password"
            value={senhaForm.confirmar}
            onChange={(e) =>
              setSenhaForm(
                (prev) => ({
                  ...prev,
                  confirmar: e.target.value,
                })
              )
            }
            required
          />

          {senhaErro && (
            <p className="text-xs text-red-400">
              {senhaErro}
            </p>
          )}

          <button
            type="submit"
            className="mt-2 w-full rounded-lg bg-white py-2.5 text-sm font-bold text-black transition-colors hover:bg-zinc-200"
          >
            Salvar nova senha
          </button>
        </form>
      </Modal>

      {/* =========================
          MODAL DESPESA
      ========================= */}

      <Modal
        open={modalDespesa}
        onClose={() => setModalDespesa(false)}
        title="Cadastrar Nova Despesa"
      >
        <form onSubmit={adicionarDespesa} className="flex flex-col gap-4">
          <Field
            label="Descrição da Despesa"
            value={novaDespesa.descricao}
            onChange={(e) =>
              setNovaDespesa((prev) => ({ ...prev, descricao: e.target.value }))
            }
            placeholder="Ex: Conta de Energia Elétrica"
            required
          />

          <Field
            label="Valor (R$)"
            type="number"
            step="0.01"
            value={novaDespesa.valor}
            onChange={(e) =>
              setNovaDespesa((prev) => ({ ...prev, valor: e.target.value }))
            }
            placeholder="Ex: 850.00"
            required
          />

          <label className="flex flex-col gap-1.5">
            <span className="text-xs uppercase tracking-wide text-zinc-500 font-semibold">
              Categoria
            </span>
            <select
              value={novaDespesa.categoria}
              onChange={(e) =>
                setNovaDespesa((prev) => ({ ...prev, categoria: e.target.value }))
              }
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-500"
            >
              <option value="LUZ">Luz / Energia</option>
              <option value="AGUA">Água e Esgoto</option>
              <option value="INTERNET">Internet / Telecom</option>
              <option value="MANUTENCAO">Manutenção</option>
              <option value="OUTROS">Outros</option>
            </select>
          </label>

          <Field
            label="Data de Vencimento"
            type="date"
            value={novaDespesa.dataVencimento}
            onChange={(e) =>
              setNovaDespesa((prev) => ({ ...prev, dataVencimento: e.target.value }))
            }
            required
          />

          <Field
            label="Data de Pagamento (opcional)"
            type="date"
            value={novaDespesa.dataPagamento}
            onChange={(e) =>
              setNovaDespesa((prev) => ({ ...prev, dataPagamento: e.target.value }))
            }
          />

          <label className="flex flex-col gap-1.5">
            <span className="text-xs uppercase tracking-wide text-zinc-500 font-semibold">
              Status do Pagamento
            </span>
            <select
              value={novaDespesa.status}
              onChange={(e) =>
                setNovaDespesa((prev) => ({ ...prev, status: e.target.value }))
              }
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-500"
            >
              <option value="PENDENTE">Pendente</option>
              <option value="PAGO">Pago</option>
              <option value="ATRASADO">Atrasado</option>
            </select>
          </label>

          <button
            type="submit"
            className="mt-2 w-full rounded-lg bg-yellow-400 py-3 text-sm font-bold text-black transition-colors hover:bg-yellow-300"
          >
            Cadastrar Despesa
          </button>
        </form>
      </Modal>
    </div>
  );
}

