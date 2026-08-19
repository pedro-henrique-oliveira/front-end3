import { AboutHero } from '../../components/about/aboutHero';
import { AboutMission } from '../../components/about/aboutMission';
import { AboutTeam } from '../../components/about/aboutTeam';
import { AboutValues } from '../../components/about/aboutValues';
import { AboutCTA } from '../../components/about/aboutCTA';

export const metadata = {
  title: 'Sobre Nós | GymFlow',
  description: 'Conheça a GymFlow, a plataforma integrada de gestão para academias e centros esportivos.',
};

export default function SobreNos() {
  return (
    <main className="bg-zinc-950 text-white">
      <AboutHero />
      <AboutMission />
      <AboutValues />
      <AboutTeam />
      <AboutCTA />
    </main>
  );
}