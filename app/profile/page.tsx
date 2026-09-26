import type { Metadata } from "next";
import { redirect } from "next/navigation";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ProfileDashboard from "@/components/auth/profile-dashboard";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
    title: "Profilim",
    description: "Holly Sport üyelik hesabın ve kayıtlı antrenman programların.",
};

export default async function ProfilePage() {
    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        redirect("/");
    }

    const [{ data: profile }, { data: workouts }] =
        await Promise.all([
            supabase
                .from("profiles")
                .select(
                    "id, email, full_name, age, gender, avatar_url, birth_date, join_date, interested_sports",
                )
                .eq("id", user.id)
                .maybeSingle(),
            supabase
                .from("saved_workouts")
                .select(
                    "id, user_id, title, goal, environment, muscles, exercises, created_at",
                )
                .eq("user_id", user.id)
                .order("created_at", { ascending: false }),
        ]);

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-[#050505] px-6 py-24 text-white md:px-10 lg:px-16">
                <ProfileDashboard
                    email={user.email ?? ""}
                    profile={profile}
                    workouts={workouts ?? []}
                />
            </main>

            <Footer />
        </>
    );
}
