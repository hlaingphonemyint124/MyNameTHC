import { Navbar } from "@/components/Navbar";
import { PageTransition } from "@/components/PageTransition";
import { Leaf, Award, Users, Heart } from "lucide-react";

const About = () => {
  return (
    <PageTransition>
      <div className="min-h-screen">
        <Navbar />
        
        <div className="container pt-28 md:pt-32 pb-20 md:pb-28">
          {/* Header */}
          <div className="text-center mb-16 md:mb-24 reveal max-w-3xl mx-auto">
            <p className="eyebrow mb-4">Our Story</p>
            <h1 className="font-display text-display-xl text-foreground mb-5">
              About My Name THC
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Quality medical-grade cannabis at fair local prices
            </p>
          </div>

        {/* Mission Section */}
        <div className="max-w-4xl mx-auto mb-16 md:mb-24 reveal">
          <div className="bg-gradient-card rounded-2xl p-8 md:p-12 hairline-strong">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center shadow-md">
                <Leaf className="h-5 w-5 md:h-6 md:w-6 text-accent-foreground" />
              </div>
              <h2 className="font-display text-display-md text-foreground">Our Mission</h2>
            </div>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              My Name THC offers high-quality, medical-grade cannabis and accessories at fair local prices. 
              Proudly serving customers throughout Thailand with trusted products and professional, reliable service.
            </p>
          </div>
        </div>

        {/* Values Grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-24">
          {[
            { icon: Award, title: "Quality First", body: "We showcase only the finest, lab-tested strains that meet our rigorous quality standards." },
            { icon: Users, title: "Community Focused", body: "Building a knowledgeable and responsible cannabis community through education." },
            { icon: Heart, title: "Passion Driven", body: "Our team consists of cannabis enthusiasts and experts who love what they do." },
          ].map((v, i) => (
            <div
              key={v.title}
              className="bg-gradient-card rounded-xl p-8 hairline card-lift text-center reveal"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="w-14 h-14 rounded-full bg-accent/10 hairline flex items-center justify-center mx-auto mb-5">
                <v.icon className="h-6 w-6 text-accent" strokeWidth={1.75} />
              </div>
              <h3 className="font-display text-xl font-semibold mb-3 text-foreground">{v.title}</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>

        {/* Story Section */}
        <div className="max-w-3xl mx-auto reveal">
          <p className="eyebrow mb-3 text-center">The Journey</p>
          <h2 className="font-display text-display-lg mb-8 text-center text-foreground">Our Story</h2>
          <div className="space-y-5 text-base md:text-lg text-muted-foreground leading-relaxed">
            <p>
              Founded by a group of cannabis connoisseurs and wellness advocates, Premium Cannabis 
              began with a simple vision: to create a trusted resource for cannabis education and 
              strain information.
            </p>
            <p>
              What started as a small passion project has grown into a comprehensive platform 
              dedicated to showcasing the finest cannabis strains available. We work with experts 
              in cultivation, testing, and cannabis science to ensure our information is accurate, 
              up-to-date, and valuable to our community.
            </p>
            <p>
              While we don't sell products directly, we're proud to serve as an educational resource, 
              helping consumers understand the unique characteristics of different strains, their 
              effects, and their optimal uses. Our commitment to transparency and education sets us 
              apart in the cannabis industry.
            </p>
          </div>
        </div>

        {/* Legal Notice */}
        <div className="mt-20 max-w-3xl mx-auto bg-surface-deep/40 rounded-xl p-8 hairline reveal">
          <p className="eyebrow mb-3">Legal & Compliance</p>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            My Name THC operates in full compliance with Thai cannabis regulations. 
            We are committed to providing safe, quality products and responsible service. 
            All customers must be 21 years of age or older. Please verify local laws 
            regarding cannabis use and possession in your area.
          </p>
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default About;
