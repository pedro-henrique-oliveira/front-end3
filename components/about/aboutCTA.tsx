import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { FaGithub } from "react-icons/fa";

export function AboutCTA() {
  return (
    <section className="py-20 px-4 bg-zinc-950 border-t border-zinc-900">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-zinc-800 rounded-2xl p-12 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              Pronto para Transformar Sua Academia?
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Experimente a GymFlow e descubra como a tecnologia pode revolucionar a gestão do seu negócio.
            </p>
          </div>

          {/* Botões CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/solicitar-plano"
              className="inline-flex items-center justify-center px-8 py-3 bg-zinc-100 text-zinc-950 font-bold rounded-lg hover:bg-zinc-200 transition group"
            >
              Começar Agora
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition" />
            </Link>

            <a
              href="https://github.com/kauan-math/TCC-Frontend2"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-3 bg-zinc-900 text-zinc-100 font-bold rounded-lg border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 transition group"
            >
              <FaGithub className="w-4 h-4 mr-2" />
              Ver no GitHub
            </a>
          </div>

          {/* Informações adicionais */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-8 border-t border-zinc-800">
            {[
              { label: 'Repositórios', value: '2' },
              { label: 'Módulos', value: '6+' },
              { label: 'Endpoints', value: '25+' },
            ].map((item, i) => (
              <div key={i}>
                <div className="text-2xl font-bold text-zinc-100">{item.value}</div>
                <div className="text-sm text-zinc-500">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Links úteis */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Documentação', href: 'https://github.com/kauan-math/TCC-back-end' },
            { label: 'API Backend', href: 'https://github.com/kauan-math/TCC-back-end' },
            { label: 'Frontend', href: 'https://github.com/kauan-math/TCC-Frontend2' },
            { label: 'Contato', href: '#' },
          ].map((link, i) => (
            <a
              key={i}
              href={link.href}
              className="text-center text-zinc-400 hover:text-zinc-100 py-3 border border-zinc-800 rounded-lg hover:border-zinc-700 transition group"
            >
              {link.label}
              <ArrowRight className="w-3 h-3 inline-block ml-1 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}