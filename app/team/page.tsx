import type { Metadata } from "next";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import FounderTeam from "@/components/sections/FounderTeam";

export const metadata: Metadata = {
    title: "Takım | Holly Sport",
    description:
        "Holly Sport kurucu takımını ve topluluğun arkasındaki isimleri tanıyın.",
};

export default function TeamPage() {
    return (
        <main>
            <Navbar />
            <FounderTeam />
            <Footer />
        </main>
    );
}