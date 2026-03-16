import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { ProblemSection } from './ProblemSection';
import { FeaturesSection } from './FeaturesSection';
import { AudienceSection } from './AudienceSection';
import { CTASection } from './CTASection';
import { Footer } from './Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-blue-500/30">
      <Navbar />
      <main>
        <HeroSection />
        <ProblemSection />
        <FeaturesSection />
        <AudienceSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
