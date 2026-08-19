import { Target, Eye, Heart } from 'lucide-react';

export function AboutMission() {
  const items = [
    {
      icon: Target,
      title: 'Nossa Missão',
      description:
        'Centralizar e simplificar todas as operações de uma academia em um único ecossistema digital, permitindo que proprietários, gestores, instrutores e alunos focarem no que realmente importa: saúde e resultados.',
    },
    {
      icon: Eye,
      title: 'Nossa Visão',
      description:
        'Ser a plataforma número um em gestão de academias no Brasil, oferecendo tecnologia robusta, intuitiva e acessível que transforme a forma como negócios de fitness operam.',
    },
    {
      icon: Heart,
      title: 'Nossos Valores',
      description:
        'Inovação, confiabilidade, segurança e excelência no atendimento. Acreditamos que tecnologia deve simplificar, nunca complicar.',
    },
  ];

  return (
    <section className="relative py-20 px-4 bg-zinc-950 border-t border-zinc-900">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">Quem Somos</h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Uma equipe dedicada a transformar a gestão de academias através da tecnologia
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="group bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-8 hover:border-zinc-700 transition-all duration-300 hover:shadow-xl hover:shadow-zinc-950"
              >
                <div className="mb-4 inline-block p-3 bg-zinc-800 rounded-lg group-hover:bg-zinc-700 transition">
                  <Icon className="w-6 h-6 text-zinc-300" />
                </div>
                
                <h3 className="text-xl font-bold mb-3 text-zinc-100">{item.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}