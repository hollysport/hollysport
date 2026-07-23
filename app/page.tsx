import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Stats from "@/components/sections/Stats";
import EventMarquee from "@/components/sections/EventMarquee";
import Sports from "@/components/sections/Sports";
import UpcomingEvents from "@/components/sections/UpcomingEvents";
import Gallery from "@/components/sections/Gallery";
import JoinCommunity from "@/components/sections/JoinCommunity";
import HowItWorks from "@/components/sections/HowItWorks";
import Faq from "@/components/sections/Faq";
import Supporters from "@/components/sections/Supporters";

import TestimonialsSection from "@/components/reviews/TestimonialsSection";

export default function HomePage() {
    return (
        <main>
            <Navbar />
            <Hero />
            <About />
            <Stats />
            <EventMarquee />
            <Sports />
            <UpcomingEvents />
            <Gallery />
            <JoinCommunity />
            <TestimonialsSection />
            <HowItWorks />
            <Faq />
            <Supporters />
            <Footer />
        </main>
    );
}