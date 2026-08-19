"use client";

import Footer from "@/components/landing/Footer";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import {
  enviarSolicitacaoPlano,
  SolicitarPlanoPayload,
} from "@/src/services/plano";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  CreditCard,
  FileText,
  Lock,
  Mail,
  Phone,
  QrCode,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

interface PlanConfig {
  id: string;
  name: string;
  subtitle: string;
  monthlyPrice: number;
  annualPriceMonthly: number; // preco equivalente por mes no plano anual
  features: string[];
  popular?: boolean;
}

const PLANS_DATA: PlanConfig[] = [
  {
    id: "Starter",
    name: "Starter",
    subtitle: "Ideal para pequenas academias e estúdios",
    monthlyPrice: 99,
    annualPriceMonthly: 79,
    features: [
      "Até 100 alunos ativos",
      "Cadastro e gestão de alunos",
      "Controle simples de treinos",
      "Controle de mensalidades",
      "Suporte via e-mail",
    ],
  },
  {
    id: "Professional",
    name: "Professional",
    subtitle: "A melhor escolha para academias em crescimento",
    monthlyPrice: 199,
    annualPriceMonthly: 159,
    popular: true,
    features: [
      "Até 500 alunos ativos",
      "Aplicativo exclusivo do aluno",
      "Dashboard financeiro completo",
      "Relatórios inteligentes",
      "Controle de check-ins e catracas",
      "Suporte prioritário via WhatsApp",
    ],
  },
  {
    id: "Enterprise",
    name: "Enterprise",
    subtitle: "Para grandes academias e redes",
    monthlyPrice: 399,
    annualPriceMonthly: 319,
    features: [
      "Alunos ilimitados",
      "Múltiplas unidades e filiais",
      "Backup diário automático",
      "API aberta de integração",
      "Relatórios avançados com IA",
      "Gerente de contas exclusivo",
    ],
  },
];

function SolicitarPlanoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialPlanParam = searchParams.get("plan") || "Professional";

  // Step 1 = Detalhes do Plano + Dados, Step 2 = Pagamento, Step 3 = Sucesso
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Estado do Plano Escolhido
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    PLANS_DATA.some(
      (p) => p.id.toLowerCase() === initialPlanParam.toLowerCase(),
    )
      ? PLANS_DATA.find(
          (p) => p.id.toLowerCase() === initialPlanParam.toLowerCase(),
        )!.id
      : "Professional",
  );
  const [billingCycle, setBillingCycle] = useState<"mensal" | "anual">(
    "mensal",
  );

  // Estado dos Dados do Formulário
  const [formData, setFormData] = useState({
    nomeAcademia: "",
    responsavel: "",
    email: "",
    cpfCnpj: "",
    telefone: "",
  });

  // Estado do Método de Pagamento (cartao, pix, boleto)
  const [paymentMethod, setPaymentMethod] = useState<
    "cartao" | "pix" | "boleto"
  >("cartao");

  // Estado dos Dados do Cartão
  const [cardData, setCardData] = useState({
    numCartao: "",
    nomeCartao: "",
    validadeCartao: "",
    cvvCartao: "",
    parcelas: "1",
  });

  // Auxiliares de UI
  const [copiedPix, setCopiedPix] = useState(false);
  const [copiedBoleto, setCopiedBoleto] = useState(false);
  const [pixTimeLeft, setPixTimeLeft] = useState(900); // 15 minutos em segundos
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pedidoConfirmado, setPedidoConfirmado] = useState<any>(null);

  // Plan selecionado atual
  const activePlan =
    PLANS_DATA.find((p) => p.id === selectedPlanId) || PLANS_DATA[1];

  // Cálculo de Preço
  const currentPrice =
    billingCycle === "anual"
      ? activePlan.annualPriceMonthly
      : activePlan.monthlyPrice;
  const totalPriceCharged =
    billingCycle === "anual"
      ? activePlan.annualPriceMonthly * 12
      : activePlan.monthlyPrice;

  // Timer para Pix
  useEffect(() => {
    if (paymentMethod === "pix" && step === 2 && pixTimeLeft > 0) {
      const interval = setInterval(() => {
        setPixTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [paymentMethod, step, pixTimeLeft]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg(null);
  };

  const handleCardChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "numCartao") {
      const raw = value.replace(/\D/g, "").slice(0, 16);
      const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ");
      setCardData({ ...cardData, numCartao: formatted });
    } else if (name === "validadeCartao") {
      const raw = value.replace(/\D/g, "").slice(0, 4);
      const formatted =
        raw.length >= 3 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw;
      setCardData({ ...cardData, validadeCartao: formatted });
    } else if (name === "cvvCartao") {
      const raw = value.replace(/\D/g, "").slice(0, 4);
      setCardData({ ...cardData, cvvCartao: raw });
    } else {
      setCardData({ ...cardData, [name]: value });
    }
  };

  // Avançar da Etapa 1 para Etapa 2
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.nomeAcademia ||
      !formData.responsavel ||
      !formData.email ||
      !formData.cpfCnpj
    ) {
      setErrorMsg("Por favor, preencha todos os campos obrigatórios (*).");
      return;
    }
    setErrorMsg(null);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Submeter Pedido Final ao Backend
  const handleSubmitSubscription = async () => {
    setLoading(true);
    setErrorMsg(null);

    let formaPagamentoBackend = "Cartão de Crédito";
    if (paymentMethod === "pix") formaPagamentoBackend = "Pix";
    if (paymentMethod === "boleto") formaPagamentoBackend = "Boleto Bancário";

    const payload: SolicitarPlanoPayload = {
      plano: activePlan.name,
      ciclo: billingCycle,
      valor: totalPriceCharged,
      formaPagamento: formaPagamentoBackend,
      nomeAcademia: formData.nomeAcademia,
      responsavel: formData.responsavel,
      email: formData.email,
      cpfCnpj: formData.cpfCnpj,
      telefone: formData.telefone,
      ...(paymentMethod === "cartao" && {
        dadosPagamento: {
          numCartao: cardData.numCartao,
          nomeCartao: cardData.nomeCartao,
          validadeCartao: cardData.validadeCartao,
          cvvCartao: cardData.cvvCartao,
          parcelas: Number(cardData.parcelas),
        },
      }),
    };

    try {
      const res = await enviarSolicitacaoPlano(payload);
      setPedidoConfirmado(res.pedido);
      setStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("Erro ao solicitar plano:", err);
      setErrorMsg(
        err.response?.data?.error ||
          "Não foi possível processar o pagamento no momento. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPix = () => {
    const mockPixKey =
      "00020126580014BR.GOV.BCB.PIX0136gymflow-pagamentos-tcc-2026-pix5204000053039865405199.005802BR5920GymFlow Tecnologias6009SAO PAULO62070503***6304E8A9";
    navigator.clipboard.writeText(mockPixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const handleCopyBoleto = () => {
    const mockBoleto = "34191.09008 61728.910003 00123.456789 1 96410000019900";
    navigator.clipboard.writeText(mockBoleto);
    setCopiedBoleto(true);
    setTimeout(() => setCopiedBoleto(false), 3000);
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-yellow-400 selection:text-black">
      <main className="pt-28 pb-20">
        <Container>
          {/* Header e Barra de Progresso */}
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-yellow-400">
              <Sparkles size={14} /> Checkout Seguro GymFlow
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
              Solicitar <span className="text-yellow-400">Plano GymFlow</span>
            </h1>
            <p className="mt-3 text-zinc-400">
              Acelere a gestão da sua academia com a plataforma número 1 do
              Brasil.
            </p>

            {/* Stepper Indicator */}
            <div className="mt-10 flex items-center justify-center gap-2 sm:gap-6">
              {/* Step 1 */}
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all ${
                    step >= 1
                      ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/20"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {step > 1 ? <Check size={18} /> : "1"}
                </div>
                <span
                  className={`hidden text-sm font-medium sm:inline ${step >= 1 ? "text-white" : "text-zinc-500"}`}
                >
                  Detalhes do Plano
                </span>
              </div>

              <div
                className={`h-0.5 w-8 sm:w-16 transition-all ${step >= 2 ? "bg-yellow-400" : "bg-zinc-800"}`}
              />

              {/* Step 2 */}
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all ${
                    step >= 2
                      ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/20"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {step > 2 ? <Check size={18} /> : "2"}
                </div>
                <span
                  className={`hidden text-sm font-medium sm:inline ${step >= 2 ? "text-white" : "text-zinc-500"}`}
                >
                  Pagamento
                </span>
              </div>

              <div
                className={`h-0.5 w-8 sm:w-16 transition-all ${step === 3 ? "bg-yellow-400" : "bg-zinc-800"}`}
              />

              {/* Step 3 */}
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all ${
                    step === 3
                      ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/20"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  3
                </div>
                <span
                  className={`hidden text-sm font-medium sm:inline ${step === 3 ? "text-white" : "text-zinc-500"}`}
                >
                  Confirmação
                </span>
              </div>
            </div>
          </div>

          {/* Banner de Erro Global */}
          {errorMsg && (
            <div className="mx-auto mt-8 max-w-4xl rounded-2xl border border-red-500/40 bg-red-950/30 p-4 text-center text-sm font-medium text-red-300">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* ================================================================ */}
          {/* ETAPA 1: DETALHES DO PLANO & DADOS DA ACADEMIA                   */}
          {/* ================================================================ */}
          {step === 1 && (
            <div className="mx-auto mt-12 grid max-w-6xl gap-10 lg:grid-cols-12">
              {/* Coluna Esquerda: Escolha de Planos & Formulário */}
              <div className="lg:col-span-8">
                {/* 1. Seleção de Ciclo de Cobrança */}
                <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-sm sm:p-8">
                  <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        1. Escolha a Frequência
                      </h2>
                      <p className="text-sm text-zinc-400">
                        Economize 20% optando pelo plano anual.
                      </p>
                    </div>

                    <div className="inline-flex rounded-2xl border border-zinc-800 bg-zinc-900 p-1">
                      <button
                        type="button"
                        onClick={() => setBillingCycle("mensal")}
                        className={`rounded-xl px-5 py-2 text-sm font-semibold transition-all ${
                          billingCycle === "mensal"
                            ? "bg-yellow-400 text-black shadow-md shadow-yellow-400/20"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        Mensal
                      </button>
                      <button
                        type="button"
                        onClick={() => setBillingCycle("anual")}
                        className={`relative rounded-xl px-5 py-2 text-sm font-semibold transition-all ${
                          billingCycle === "anual"
                            ? "bg-yellow-400 text-black shadow-md shadow-yellow-400/20"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        Anual
                        <span className="ml-1.5 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                          -20%
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Cards de Seleção de Plano */}
                  <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    {PLANS_DATA.map((plan) => {
                      const isSelected = plan.id === selectedPlanId;
                      const price =
                        billingCycle === "anual"
                          ? plan.annualPriceMonthly
                          : plan.monthlyPrice;

                      return (
                        <div
                          key={plan.id}
                          onClick={() => setSelectedPlanId(plan.id)}
                          className={`relative cursor-pointer rounded-2xl border p-5 transition-all duration-300 ${
                            isSelected
                              ? "border-yellow-400 bg-zinc-900/90 shadow-xl shadow-yellow-400/10 ring-1 ring-yellow-400"
                              : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/60"
                          }`}
                        >
                          {plan.popular && (
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-yellow-400 px-3 py-0.5 text-[11px] font-bold text-black uppercase tracking-wider">
                              Mais Escolhido
                            </span>
                          )}

                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-white">
                              {plan.name}
                            </h3>
                            <div
                              className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                isSelected
                                  ? "border-yellow-400 bg-yellow-400 text-black"
                                  : "border-zinc-700"
                              }`}
                            >
                              {isSelected && (
                                <Check size={12} strokeWidth={3} />
                              )}
                            </div>
                          </div>

                          <div className="mt-4">
                            <span className="text-3xl font-extrabold text-yellow-400">
                              R$ {price}
                            </span>
                            <span className="text-xs text-zinc-400">/mês</span>
                          </div>

                          <p className="mt-2 text-xs text-zinc-400 line-clamp-2">
                            {plan.subtitle}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Formulário de Dados da Academia */}
                <form
                  onSubmit={handleProceedToPayment}
                  className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-sm sm:p-8"
                >
                  <h2 className="text-xl font-bold text-white">
                    2. Dados da Sua Academia
                  </h2>
                  <p className="text-sm text-zinc-400">
                    Preencha as informações para criação da conta corporativa.
                  </p>

                  <div className="mt-6 grid gap-6 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-zinc-300">
                        Nome da Academia *
                      </label>
                      <div className="relative">
                        <Building2
                          size={18}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                        />
                        <input
                          type="text"
                          name="nomeAcademia"
                          value={formData.nomeAcademia}
                          onChange={handleInputChange}
                          placeholder="Ex: Academia FitLife"
                          required
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold text-zinc-300">
                        Nome do Responsável *
                      </label>
                      <div className="relative">
                        <User
                          size={18}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                        />
                        <input
                          type="text"
                          name="responsavel"
                          value={formData.responsavel}
                          onChange={handleInputChange}
                          placeholder="Ex: Carlos Eduardo Silva"
                          required
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold text-zinc-300">
                        E-mail de Contato / Login *
                      </label>
                      <div className="relative">
                        <Mail
                          size={18}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                        />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="admin@suaacademia.com.br"
                          required
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold text-zinc-300">
                        CPF ou CNPJ *
                      </label>
                      <div className="relative">
                        <FileText
                          size={18}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                        />
                        <input
                          type="text"
                          name="cpfCnpj"
                          value={formData.cpfCnpj}
                          onChange={handleInputChange}
                          placeholder="000.000.000-00 ou 00.000.000/0001-00"
                          required
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-xs font-semibold text-zinc-300">
                        Telefone / WhatsApp
                      </label>
                      <div className="relative">
                        <Phone
                          size={18}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                        />
                        <input
                          type="text"
                          name="telefone"
                          value={formData.telefone}
                          onChange={handleInputChange}
                          placeholder="(11) 99999-8888"
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <Button
                      type="submit"
                      className="flex items-center gap-2 px-8 py-3.5 text-base"
                    >
                      Ir para Pagamento <ChevronRight size={18} />
                    </Button>
                  </div>
                </form>
              </div>

              {/* Coluna Direita: Resumo do Plano Selecionado */}
              <div className="lg:col-span-4">
                <div className="sticky top-28 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-sm">
                  <div className="border-b border-zinc-800 pb-5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-yellow-400">
                      Resumo da Solicitação
                    </span>
                    <h3 className="mt-1 text-2xl font-bold text-white">
                      Plano {activePlan.name}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Ciclo{" "}
                      {billingCycle === "anual"
                        ? "Anual (cobrado 12x)"
                        : "Mensal"}
                    </p>
                  </div>

                  {/* Preços */}
                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">Mensalidade base</span>
                      <span className="font-semibold text-white">
                        R$ {activePlan.monthlyPrice},00
                      </span>
                    </div>

                    {billingCycle === "anual" && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-emerald-400">
                          Desconto Anual (-20%)
                        </span>
                        <span className="font-semibold text-emerald-400">
                          - R${" "}
                          {activePlan.monthlyPrice -
                            activePlan.annualPriceMonthly}
                          ,00/mês
                        </span>
                      </div>
                    )}

                    <div className="border-t border-zinc-800 pt-3 flex items-center justify-between">
                      <span className="text-base font-bold text-white">
                        Total Hoje
                      </span>
                      <div className="text-right">
                        <span className="text-2xl font-extrabold text-yellow-400">
                          R$ {totalPriceCharged},00
                        </span>
                        {billingCycle === "anual" && (
                          <p className="text-[11px] text-zinc-500">
                            12x de R$ {activePlan.annualPriceMonthly},00
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Funcionalidades Inclusas */}
                  <div className="mt-6 border-t border-zinc-800 pt-5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                      O que está incluso:
                    </h4>
                    <ul className="mt-3 space-y-2.5">
                      {activePlan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2.5 text-xs text-zinc-300"
                        >
                          <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-yellow-400/20 text-yellow-400">
                            <Check size={10} strokeWidth={3} />
                          </div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Selos de Garantia */}
                  <div className="mt-6 rounded-2xl bg-zinc-900/60 p-4">
                    <div className="flex items-center gap-3 text-xs text-zinc-300">
                      <ShieldCheck
                        size={22}
                        className="shrink-0 text-yellow-400"
                      />
                      <div>
                        <p className="font-bold text-white">
                          Garantia Incondicional 7 Dias
                        </p>
                        <p className="text-zinc-400">
                          Cancele a qualquer momento sem custos adicionais.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* ETAPA 2: MÉTODO DE PAGAMENTO                                      */}
          {/* ================================================================ */}
          {step === 2 && (
            <div className="mx-auto mt-12 grid max-w-6xl gap-10 lg:grid-cols-12">
              {/* Coluna Esquerda: Formas de Pagamento */}
              <div className="lg:col-span-8">
                {/* Botão Voltar */}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-yellow-400 transition-colors"
                >
                  <ArrowLeft size={16} /> Voltar e alterar dados do plano
                </button>

                <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-sm sm:p-8">
                  <h2 className="text-xl font-bold text-white">
                    Forma de Pagamento
                  </h2>
                  <p className="text-sm text-zinc-400">
                    Escolha a maneira mais fácil para concluir a assinatura.
                  </p>

                  {/* Abas de Pagamento */}
                  <div className="mt-6 grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cartao")}
                      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition-all ${
                        paymentMethod === "cartao"
                          ? "border-yellow-400 bg-zinc-900 text-yellow-400 shadow-lg shadow-yellow-400/10"
                          : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-white"
                      }`}
                    >
                      <CreditCard size={22} />
                      <span className="text-xs font-bold sm:text-sm">
                        Cartão de Crédito
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("pix")}
                      className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition-all ${
                        paymentMethod === "pix"
                          ? "border-yellow-400 bg-zinc-900 text-yellow-400 shadow-lg shadow-yellow-400/10"
                          : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-white"
                      }`}
                    >
                      <span className="absolute -top-2.5 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-extrabold text-black uppercase">
                        Aprovação Instantânea
                      </span>
                      <QrCode size={22} />
                      <span className="text-xs font-bold sm:text-sm">Pix</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("boleto")}
                      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition-all ${
                        paymentMethod === "boleto"
                          ? "border-yellow-400 bg-zinc-900 text-yellow-400 shadow-lg shadow-yellow-400/10"
                          : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-white"
                      }`}
                    >
                      <FileText size={22} />
                      <span className="text-xs font-bold sm:text-sm">
                        Boleto Bancário
                      </span>
                    </button>
                  </div>

                  {/* Conteúdo: Cartão de Crédito */}
                  {paymentMethod === "cartao" && (
                    <div className="mt-8 space-y-6">
                      {/* Cartão 3D Simulado Preview */}
                      <div className="relative mx-auto h-48 w-full max-w-sm rounded-2xl bg-linear-to-tr from-zinc-900 via-zinc-800 to-yellow-500/20 p-6 text-white shadow-2xl border border-yellow-400/30 flex flex-col justify-between overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold tracking-widest uppercase text-yellow-400">
                            GymFlow Card
                          </span>
                          <span className="text-xs font-bold italic opacity-80">
                            VISA / Mastercard
                          </span>
                        </div>
                        <div className="my-2 text-xl font-mono tracking-widest text-zinc-200">
                          {cardData.numCartao || "•••• •••• •••• ••••"}
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <p className="text-[9px] uppercase tracking-wider text-zinc-400">
                              Titular
                            </p>
                            <p className="font-semibold uppercase truncate max-w-[180px]">
                              {cardData.nomeCartao ||
                                formData.responsavel ||
                                "SEU NOME AQUI"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase tracking-wider text-zinc-400">
                              Validade
                            </p>
                            <p className="font-semibold">
                              {cardData.validadeCartao || "MM/AA"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Campos do Cartão */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                            Número do Cartão
                          </label>
                          <input
                            type="text"
                            name="numCartao"
                            value={cardData.numCartao}
                            onChange={handleCardChange}
                            placeholder="0000 0000 0000 0000"
                            maxLength={19}
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 p-3 text-sm text-white placeholder-zinc-500 focus:border-yellow-400 focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                            Nome Impresso no Cartão
                          </label>
                          <input
                            type="text"
                            name="nomeCartao"
                            value={cardData.nomeCartao}
                            onChange={handleCardChange}
                            placeholder="Ex: CARLOS E SILVA"
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 p-3 text-sm text-white placeholder-zinc-500 focus:border-yellow-400 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                            Validade
                          </label>
                          <input
                            type="text"
                            name="validadeCartao"
                            value={cardData.validadeCartao}
                            onChange={handleCardChange}
                            placeholder="MM/AA"
                            maxLength={5}
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 p-3 text-sm text-white placeholder-zinc-500 focus:border-yellow-400 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                            CVV
                          </label>
                          <input
                            type="text"
                            name="cvvCartao"
                            value={cardData.cvvCartao}
                            onChange={handleCardChange}
                            placeholder="123"
                            maxLength={4}
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 p-3 text-sm text-white placeholder-zinc-500 focus:border-yellow-400 focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                            Parcelamento
                          </label>
                          <select
                            name="parcelas"
                            value={cardData.parcelas}
                            onChange={handleCardChange}
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 p-3 text-sm text-white focus:border-yellow-400 focus:outline-none"
                          >
                            <option value="1">
                              1x de R$ {totalPriceCharged},00 sem juros
                            </option>
                            <option value="2">
                              2x de R$ {(totalPriceCharged / 2).toFixed(2)} sem
                              juros
                            </option>
                            <option value="3">
                              3x de R$ {(totalPriceCharged / 3).toFixed(2)} sem
                              juros
                            </option>
                            <option value="6">
                              6x de R$ {(totalPriceCharged / 6).toFixed(2)} sem
                              juros
                            </option>
                            <option value="12">
                              12x de R$ {(totalPriceCharged / 12).toFixed(2)}{" "}
                              sem juros
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Conteúdo: Pix */}
                  {paymentMethod === "pix" && (
                    <div className="mt-8 flex flex-col items-center text-center">
                      <div className="rounded-2xl border border-yellow-400/40 bg-white p-4 shadow-xl">
                        {/* Simulação de QR Code Pix */}
                        <div className="relative flex h-48 w-48 items-center justify-center rounded-lg bg-zinc-100 p-2">
                          <QrCode size={160} className="text-black" />
                          <div className="absolute rounded-lg bg-yellow-400 p-1 font-bold text-[10px] text-black shadow-md">
                            GYMFLOW
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-4 py-1.5 text-xs text-yellow-400">
                        <Clock size={14} /> Expira em:{" "}
                        <span className="font-mono font-bold">
                          {formatTimer(pixTimeLeft)}
                        </span>
                      </div>

                      <p className="mt-4 text-xs text-zinc-400">
                        Abra o app do seu banco, escolha <strong>Pix</strong> e
                        escaneie o código acima ou copie a chave abaixo:
                      </p>

                      {/* Chave Pix Copia e Cola */}
                      <div className="mt-4 flex w-full max-w-md items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/90 p-2.5">
                        <span className="truncate font-mono text-xs text-zinc-300 px-2">
                          00020126580014BR.GOV.BCB.PIX...
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyPix}
                          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-yellow-400 px-3 py-1.5 text-xs font-bold text-black transition hover:bg-yellow-300"
                        >
                          {copiedPix ? (
                            <BadgeCheck size={14} />
                          ) : (
                            <Copy size={14} />
                          )}
                          {copiedPix ? "Copiado!" : "Copiar Chave Pix"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Conteúdo: Boleto */}
                  {paymentMethod === "boleto" && (
                    <div className="mt-8 space-y-6 text-center">
                      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
                        <FileText
                          size={48}
                          className="mx-auto text-yellow-400"
                        />
                        <h3 className="mt-3 text-lg font-bold text-white">
                          Boleto Bancário Gerado
                        </h3>
                        <p className="mt-1 text-xs text-zinc-400">
                          O boleto tem vencimento em{" "}
                          <strong>3 dias úteis</strong>. Após a confirmação do
                          pagamento, sua conta será liberada em até 24h.
                        </p>

                        {/* Código de barras simulado */}
                        <div className="mt-6 flex flex-col items-center">
                          <div className="h-12 w-full max-w-md bg-zinc-800 p-2 font-mono text-[10px] tracking-widest text-zinc-400 flex items-center justify-center border border-zinc-700 rounded-lg">
                            |||||| ||||| ||||||| |||| |||||||| |||||||||| |||
                            ||||
                          </div>
                          <p className="mt-2 font-mono text-xs font-semibold text-yellow-400">
                            34191.09008 61728.910003 00123.456789 1
                            96410000019900
                          </p>
                        </div>

                        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={handleCopyBoleto}
                            className="inline-flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-2.5 text-xs font-semibold text-white hover:bg-zinc-700 transition"
                          >
                            {copiedBoleto ? (
                              <BadgeCheck
                                size={14}
                                className="text-emerald-400"
                              />
                            ) : (
                              <Copy size={14} />
                            )}
                            {copiedBoleto
                              ? "Código Copiado!"
                              : "Copiar Linha Digitável"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Coluna Direita: Resumo do Pedido & Botão Finalizar */}
              <div className="lg:col-span-4">
                <div className="sticky top-28 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-sm">
                  <h3 className="text-lg font-bold text-white border-b border-zinc-800 pb-4">
                    Resumo do Pedido
                  </h3>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between text-zinc-400">
                      <span>Academia:</span>
                      <span className="font-semibold text-white">
                        {formData.nomeAcademia || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Responsável:</span>
                      <span className="font-semibold text-white">
                        {formData.responsavel || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>E-mail:</span>
                      <span className="font-semibold text-white truncate max-w-[150px]">
                        {formData.email || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Plano:</span>
                      <span className="font-semibold text-yellow-400">
                        GymFlow {activePlan.name}
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Pagamento via:</span>
                      <span className="font-semibold text-white uppercase">
                        {paymentMethod}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-zinc-800 pt-4 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-400">
                        Valor Total:
                      </span>
                      <p className="text-2xl font-extrabold text-yellow-400">
                        R$ {totalPriceCharged},00
                      </p>
                    </div>

                    <Lock size={20} className="text-emerald-400" />
                  </div>

                  {/* Botão de Finalizar */}
                  <Button
                    type="button"
                    onClick={handleSubmitSubscription}
                    disabled={loading}
                    className="mt-6 w-full py-4 text-base font-bold flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <svg
                          className="h-5 w-5 animate-spin text-black"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                        Processando...
                      </span>
                    ) : (
                      <>
                        <ShieldCheck size={20} /> Finalizar Assinatura
                      </>
                    )}
                  </Button>

                  <p className="mt-4 text-center text-[11px] text-zinc-500">
                    🔒 Transação criptografada de alta segurança.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* ETAPA 3: CONFIRMAÇÃO E SUCESSO                                    */}
          {/* ================================================================ */}
          {step === 3 && (
            <div className="mx-auto mt-12 max-w-2xl text-center">
              <div className="rounded-3xl border border-yellow-400/40 bg-zinc-950/90 p-8 shadow-2xl backdrop-blur-md sm:p-12">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-8 ring-emerald-500/10">
                  <CheckCircle2 size={48} />
                </div>

                <span className="mt-6 inline-block rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Assinatura Confirmada!
                </span>

                <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
                  Bem-vindo ao <span className="text-yellow-400">GymFlow</span>!
                </h2>

                <p className="mt-3 text-sm text-zinc-300">
                  Sua solicitação do plano{" "}
                  <strong>
                    GymFlow {pedidoConfirmado?.plano || activePlan.name}
                  </strong>{" "}
                  foi recebida e processada com sucesso.
                </p>

                {/* Recibo Box */}
                <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 text-left space-y-3 text-xs">
                  <div className="flex justify-between border-b border-zinc-800 pb-3">
                    <span className="text-zinc-400">Número do Pedido:</span>
                    <span className="font-mono font-bold text-yellow-400">
                      {pedidoConfirmado?.id || "#GYM-84920"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Academia:</span>
                    <span className="font-semibold text-white">
                      {pedidoConfirmado?.nomeAcademia || formData.nomeAcademia}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Responsável:</span>
                    <span className="font-semibold text-white">
                      {pedidoConfirmado?.responsavel || formData.responsavel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">E-mail:</span>
                    <span className="font-semibold text-white">
                      {pedidoConfirmado?.email || formData.email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Forma de Pagamento:</span>
                    <span className="font-semibold text-white uppercase">
                      {pedidoConfirmado?.formaPagamento || paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-800 pt-3 text-sm">
                    <span className="font-bold text-white">Valor Pago:</span>
                    <span className="font-extrabold text-yellow-400">
                      R$ {totalPriceCharged},00
                    </span>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button className="w-full px-8 py-3.5 text-sm font-bold flex items-center justify-center gap-2">
                      Acessar o Painel GymFlow <ChevronRight size={18} />
                    </Button>
                  </Link>

                  <Link href="/" className="w-full sm:w-auto">
                    <button
                      type="button"
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-3.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
                    >
                      Voltar ao Início
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </Container>
      </main>

      <Footer />
    </div>
  );
}

export default function SolicitarPlanoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          Carregando plano...
        </div>
      }
    >
      <SolicitarPlanoContent />
    </Suspense>
  );
}
