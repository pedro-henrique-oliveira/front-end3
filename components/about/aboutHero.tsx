import { Dumbbell, Zap } from 'lucide-react';
import Link from 'next/link';

export function AboutHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20">

      {/* Fundo gradiente */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black -z-10" />

      {/* Elementos decorativos */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-zinc-800 rounded-full blur-3xl opacity-20 -z-10" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-zinc-800 rounded-full blur-3xl opacity-20 -z-10" />

      {/* Botão Voltar - topo esquerdo */}
      <Link
        href="/"
        className="mb-10 inline-flex items-center gap-2 rounded-lg border border-gray-800 bg-zinc-950 px-4 py-2 text-sm text-gray-300 transition hover:border-gray-600 hover:bg-zinc-900 hover:text-white absolute top-35 left-58"
      >
        ← Voltar
      </Link>

      <div className="max-w-4xl mx-auto text-center space-y-8">

        {/* Icon e Heading */}
        <div className="space-y-4">

          <div className="flex justify-center gap-3">
            <Dumbbell className="w-12 h-12 text-zinc-400" />
            <Zap className="w-12 h-12 text-zinc-400" />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Conheça a{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-400">
              GymFlow
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-zinc-400 leading-relaxed">
            A plataforma integrada que revoluciona a gestão de academias,
            trazendo eficiência, segurança e inteligência aos seus negócios.
          </p>

        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">

          {[
            { number: '2025', label: 'Fundação' },
            { number: '100%', label: 'Web-based' },
            { number: '6+', label: 'Módulos' },
            { number: 'REST', label: 'API' },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition"
            >
              <div className="text-2xl font-bold text-zinc-100">
                {stat.number}
              </div>

              <div className="text-sm text-zinc-500 mt-1">
                {stat.label}
              </div>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}