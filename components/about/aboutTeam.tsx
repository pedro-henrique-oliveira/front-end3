import { Mail } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';

export function AboutTeam() {
  const team = [
    {
      name: 'Kauan Matheus',
      role: 'Frontend Developer',
      bio: 'Desenvolvedor apaixonado por tecnologia e inovação',
      github: 'https://github.com/kauan-math',
      email: 'kauan.math.correa@gmail.com',
      image: '/kauan.png',
    },
    {
      name: 'Pedro Henrique',
      role: 'Full Stack Developer',
      bio: 'Desenvolvedor apaixonado por tecnologia e inovação',
      github: 'https://github.com/pedro-henrique-oliveira',
      email: 'henriqueoliveiradasilvapedro1@gmail.com',
      image: '/pedro.png',
    },
  ];

  return (
    <section className="py-20 px-4 bg-zinc-950">
      <div className="max-w-6xl mx-auto">
         

        {/* Título */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            A Equipe
          </h2>

          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Profissionais dedicados a entregar a melhor solução para sua academia
          </p>
        </div>

        {/* Equipe */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((member, i) => (
            <div
              key={i}
              className="
                bg-gradient-to-br from-zinc-900 to-zinc-950
                border border-zinc-800
                rounded-xl
                overflow-hidden
                hover:border-zinc-700
                transition
                group
              "
            >
              {/* FOTO */}
              <div className="h-48 w-full bg-zinc-900 overflow-hidden">
                {member.image ? (
                  <Image
                    src={member.image}
                    alt={`Foto de ${member.name}`}
                    width={600}
                    height={400}
                    priority={i === 0}
                    className="
                      w-full
                      h-full
                      object-cover
                      object-[center_29%]
                    "
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-4xl font-bold text-zinc-700">
                      {member.name.charAt(0)}
                    </div>
                  </div>
                )}
              </div>

              {/* CONTEÚDO */}
              <div className="p-6 space-y-3">

                <h3 className="text-xl font-bold text-zinc-100">
                  {member.name}
                </h3>

                <p className="text-sm text-zinc-500 font-medium">
                  {member.role}
                </p>

                <p className="text-zinc-400 text-sm leading-relaxed">
                  {member.bio}
                </p>

                {/* REDES SOCIAIS */}
                <div className="flex gap-3 pt-4 border-t border-zinc-800">

                  {member.github !== '#' && (
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        p-2
                        bg-zinc-800
                        hover:bg-zinc-700
                        rounded-lg
                        transition
                        text-zinc-400
                        hover:text-zinc-200
                      "
                      aria-label={`GitHub de ${member.name}`}
                    >
                      <FaGithub className="w-4 h-4" />
                    </a>
                  )}

                  {member.email !== '#' && (
                    <a
                      href={`mailto:${member.email}`}
                      className="
                        p-2
                        bg-zinc-800
                        hover:bg-zinc-700
                        rounded-lg
                        transition
                        text-zinc-400
                        hover:text-zinc-200
                      "
                      aria-label={`Enviar email para ${member.name}`}
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}

                </div>
              </div>
            </div>
          ))}
        </div>

        {/* STACK TECNOLÓGICO */}
        <div className="mt-16 pt-16 border-t border-zinc-900">

          <h3 className="text-2xl font-bold mb-8 text-center">
            Stack Tecnológico
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

            {[
              { name: 'Next.js 16', icon: '⚛️' },
              { name: 'React 19', icon: '⚛️' },
              { name: 'TypeScript', icon: '🔷' },
              { name: 'Tailwind CSS', icon: '🎨' },
              { name: 'Express 5', icon: '🚀' },
              { name: 'Prisma ORM', icon: '📦' },
              { name: 'SQLite', icon: '💾' },
              { name: 'JWT Auth', icon: '🔐' },
              { name: 'Recharts', icon: '📊' },
              { name: 'Axios', icon: '🔗' },
              { name: 'Lucide Icons', icon: '🎯' },
              { name: 'Node.js', icon: '🟢' },
            ].map((tech, i) => (
              <div
                key={i}
                className="
                  bg-zinc-900
                  border border-zinc-800
                  rounded-lg
                  p-4
                  text-center
                  hover:border-zinc-700
                  transition
                  group
                "
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition">
                  {tech.icon}
                </div>

                <p className="text-sm font-medium text-zinc-300">
                  {tech.name}
                </p>
              </div>
            ))}

          </div>
        </div>

      </div>
    </section>
  );
}
