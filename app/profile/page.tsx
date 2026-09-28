import type { Metadata } from "next";
import { redirect } from "next/navigation";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ProfileDashboard, {
    type MyRegistration,
} from "@/components/auth/profile-dashboard";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
                    "id, email, phone, full_name, gender, avatar_url, birth_date, join_date, interested_sports",
                )
                .eq("id", user.id)
                .maybeSingle(),
            supabase
                .from("saved_workouts")
                .select(
                    "id, user_id, template_name, target_goal, exercises, created_at",
                )
                .eq("user_id", user.id)
                .order("created_at", { ascending: false }),
        ]);

    /*
     * "Etkinliklerim" listesi: RLS'ten bağımsız okunabilsin diye
     * oturum doğrulandıktan sonra service-role client ile çekilir;
     * sorgu daima kendi user_id'si ile sınırlıdır.
     */
    let registrations: MyRegistration[] = [];

    try {
        const supabaseAdmin = createAdminClient();

        const { data, error } = await supabaseAdmin
            .from("event_registrations")
            .select(
                "id, event_id, status, created_at, event:events ( id, title, slug, starts_at, location )",
            )
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error(
                "ProfilePage: etkinlik kayıtları okunamadı:",
                { message: error.message, code: error.code },
            );
        } else {
            registrations = (data ?? []) as unknown as MyRegistration[];
        }
    } catch (lookupError) {
        console.error(
            "ProfilePage: etkinlik kayıtları hatası:",
            lookupError,
        );
    }

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-[#050505] px-6 py-24 text-white md:px-10 lg:px-16">
                <ProfileDashboard
                    email={user.email ?? ""}
                    profile={profile}
                    workouts={workouts ?? []}
                    registrations={registrations}
                    metadata={
                        (user.user_metadata as Record<
                            string,
                            unknown
                        > | null) ?? null
                    }
                />
            </main>

            <Footer />
        </>
    );
}
