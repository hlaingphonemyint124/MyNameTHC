import { Navbar } from "@/components/Navbar";
import { PageTransition } from "@/components/PageTransition";
import { Mail, Phone, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Contact = () => {
  const handleEmailClick = () => {
    window.location.href = "mailto:thcmyname@gmail.com";
  };

  const handlePhoneClick = () => {
    window.location.href = "tel:0973595888";
  };

  const handleMapClick = () => {
    window.open("https://maps.app.goo.gl/kx85waNAaVYgbcnW6", "_blank");
  };

  return (
    <PageTransition>
      <div className="min-h-screen">
        <Navbar />
        
        <div className="container pt-28 md:pt-32 pb-20 md:pb-28">
          {/* Header */}
          <div className="text-center mb-16 md:mb-20 reveal max-w-3xl mx-auto">
            <p className="eyebrow mb-4">Contact Us</p>
            <h1 className="font-display text-display-xl text-foreground mb-5">
              Get In Touch
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto mb-16 md:mb-20">
            {[
              { icon: Mail, title: "Email Us", body: "thcmyname@gmail.com", onClick: handleEmailClick, breakAll: true },
              { icon: Phone, title: "Call Us", body: "0973595888", onClick: handlePhoneClick, breakAll: false },
              { icon: MapPin, title: "Visit Us", body: "9/10, Hussadhisawee Rd, Chiang Mai 50300", onClick: handleMapClick, breakAll: false, span: true },
            ].map((c, i) => (
              <Card
                key={c.title}
                onClick={c.onClick}
                className={`bg-gradient-card hairline card-lift cursor-pointer group reveal ${c.span ? "sm:col-span-2 md:col-span-1" : ""}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <CardContent className="pt-8 pb-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-accent/10 hairline flex items-center justify-center mx-auto mb-5 group-hover:bg-accent/20 transition-colors duration-300">
                    <c.icon className="h-6 w-6 text-accent" strokeWidth={1.75} />
                  </div>
                  <p className="eyebrow mb-2">{c.title}</p>
                  <p className={`text-sm md:text-base text-muted-foreground group-hover:text-foreground transition-colors duration-300 ${c.breakAll ? "break-all" : ""}`}>
                    {c.body}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Google Maps Embed */}
          <div className="max-w-6xl mx-auto mb-16 md:mb-20 reveal">
            <p className="eyebrow mb-3 text-center">Location</p>
            <h2 className="font-display text-display-md mb-8 text-center text-foreground">Find Us on the Map</h2>
            <div className="rounded-2xl overflow-hidden hairline-strong shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3776.5!2d98.9847!3d18.8047!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30da3a7e9a4ae1e3%3A0x9d5f3d8c2e8e8e8e!2s9%2F10%20Hussadhisawee%20Rd%2C%20Tambon%20Chang%20Phueak%2C%20Mueang%20Chiang%20Mai%20District%2C%20Chiang%20Mai%2050300!5e0!3m2!1sen!2sth!4v1699999999999!5m2!1sen!2sth"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              />
            </div>
          </div>

          {/* Info Section */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-card rounded-2xl p-5 sm:p-8 md:p-12 hairline-strong reveal">
              <p className="eyebrow mb-3">Details</p>
              <h2 className="font-display text-display-md mb-8 text-foreground">Contact Information</h2>

              <div className="space-y-8 text-muted-foreground">
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">Business Hours</h3>
                  <p className="leading-relaxed text-sm md:text-base">
                    Monday - Friday: 9:00 AM - 6:00 PM<br />
                    Saturday: 10:00 AM - 4:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>

                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">General Inquiries</h3>
                  <p className="leading-relaxed text-sm md:text-base">
                    For general questions about strains, effects, or our platform, please email us at 
                    thcmyname@gmail.com. We typically respond within 24-48 hours.
                  </p>
                </div>

                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">Educational Resources</h3>
                  <p className="leading-relaxed text-sm md:text-base">
                    Interested in learning more about cannabis? We're here to help! Contact us for 
                    information about strains, consumption methods, effects, and responsible use.
                  </p>
                </div>
              </div>
            </div>

            {/* Legal Notice */}
            <div className="mt-8 bg-surface-deep/40 rounded-xl p-6 hairline reveal">
              <p className="text-xs md:text-sm text-muted-foreground text-center leading-relaxed">
                <strong>Legal Notice:</strong> My Name THC operates in compliance with Thai cannabis regulations. 
                This platform is for educational and informational purposes only. For adults 21+ only. 
                Please verify local laws regarding cannabis use and possession.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Contact;
