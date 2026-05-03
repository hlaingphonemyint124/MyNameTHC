import { Navbar } from "@/components/Navbar";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { NewProducts } from "@/components/NewProducts";
import { PageTransition } from "@/components/PageTransition";
import { Footer } from "@/components/Footer";
import { VisitUs } from "@/components/VisitUs";
import { ProcessStrip } from "@/components/ProcessStrip";

const Home = () => {
  return (
    <PageTransition>
      <div className="min-h-screen">
        <Navbar />
        
        {/* Hero Slideshow - Full Screen */}
        <HeroSlideshow />

        {/* Featured Products Section */}
        <FeaturedProducts />

        {/* New Products Section */}
        <NewProducts />

        {/* Process / Trust Strip */}
        <ProcessStrip />

        {/* Visit Us — store info + map */}
        <VisitUs />

        <Footer />
      </div>
    </PageTransition>
  );
};

export default Home;
