import { Shield, Zap, Users, TrendingUp, Lock, Smartphone } from 'lucide-react';

export function AboutValues() {
  const values = [
    {
      icon: Zap,
      title: 'Performance Máxima',
      description:
        'Infraestrutura otimizada com Next.js 16 e Turbopack para carregamento instantâneo e experiência fluida.',
    },
    {
      icon: Shield,
      title: 'Segurança em Primeiro Lugar',
      description:
        'Autenticação JWT, criptografia Bcrypt e proteção de dados em todos os níveis da aplicação.',
    },
    {
      icon: Users,
      title: 'Escalabilidade',
      description:
        'Arquitetura desacoplada que cresce com seu negócio, suportando múltiplas academias e milhares de alunos.',
    },
    {
      icon: TrendingUp,
      title: 'Análise Inteligente',
      description:
        'Dashboards interativos com Recharts para visualizar receitas, despesas e tendências em tempo real.',
    },
    {
      icon: Lock,
      title: 'Controle de Acesso',
      description:
        'Sistema RBAC (Role-Based Access Control) com perfis de Admin, Funcionário e Aluno para máxima segurança.',
    },
    {
      icon: Smartphone,
      title: 'Responsivo',
      description:
        'Design mobile-first que funciona perfeitamente em qualquer dispositivo, tablet ou desktop.',
    },
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-zinc-950 to-black border-t border-zinc-900">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">Por Que Escolher GymFlow</h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Recursos robustos desenvolvidos com tecnologia de ponta e pensado em cada detalhe
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((value, i) => {
            const Icon = value.icon;
            return (
              <div
                key={i}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition group hover:bg-zinc-850"
              >
                <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center mb-4 group-hover:bg-zinc-700 transition">
                  <Icon className="w-6 h-6 text-zinc-300" />
                </div>
                
                <h3 className="text-lg font-bold text-zinc-100 mb-2">{value.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{value.description}</p>
              </div>
            );
          })}
        </div>

        {/* Destacado */}
        <div className="mt-16 bg-gradient-to-r from-zinc-800 to-zinc-900 border border-zinc-700 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Desenvolvido como Trabalho de Conclusão de Curso</h3>
          <p className="text-zinc-300 max-w-2xl mx-auto">
            GymFlow é resultado de pesquisa, desenvolvimento e testes rigorosos, garantindo qualidade e confiabilidade
            para uso profissional em ambientes de produção.
          </p>
        </div>
      </div>
    </section>
  );
}