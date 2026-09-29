import Link from "next/link";
import { Inbox, Mail, Phone } from "lucide-react";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { GOALS } from "@/lib/data/exercises";
import ProgramRequestStatusActions from "./status-buttons";
import ProgramRequestDeleteButton from "./delete-button";
import type { ProgramRequestStatus } from "./actions";

type ProgramRequestRow = {
    id: string;
    full_name: string;
    contact_info: string;
    age: number | null;
    height: number | null;
    weight: number | null;
    goal: string;
    notes: string | null;
    status?: ProgramRequestStatus;
    created_at: string;
};

const STATUS_LABELS: Record<string, string> = {
    pending: "Bekliyor",
    reviewed: "İncelendi",
};

const STATUS_CLASSES: Record<string, string> = {
    pending: "bg-yellow-500/15 text-yellow-300 border-yellow-500/25",
    reviewed: "bg-[#27D66B]/15 text-[#27D66B] border-[#27D66B]/30",
};

const FULL_SELECT =
    "id, full_name, contact_info, age, height, weight, goal, notes, status, created_at";

const FALLBACK_SELECT =
    "id, full_name, contact_info, age, height, weight, goal, notes, created_at";

function formatDate(date: string) {
    return new Intl.DateTimeFormat("tr-TR", {
        dateStyle: "long",
        timeStyle: "short",
        timeZone: "Europe/Istanbul",
    }).format(new Date(date));
}

function isEmail(value: string) {
    return value.includes("@");
}

/*
 * Admin — "Kişiye Özel Antrenman Programı" talepleri.
 *
 * Okuma service-role ile yapılır (requireAdmin oturumu doğrular),
 * böylece tabloda SELECT politikası olmasa da liste görünür.
 * `status` kolonu henüz eklenmemişse (PGRST204) sorgu kolonsuz
 * tekrarlanır ve sayfa boşuna kırılmaz.
 */
export default async function CustomTrainingRequestsPage() {
    await requireAdmin();

    let rows: ProgramRequestRow[] = [];
    let loadError: string | null = null;
    let statusAvailable = true;

    try {
        const supabaseAdmin = createAdminClient();

        const { data, error } = await supabaseAdmin
            .from("custom_program_requests")
            .select(FULL_SELECT)
            .order("created_at", { ascending: false });

        if (error && error.code === "PGRST204") {
            statusAvailable = false;

            console.warn(
                "CustomTrainingRequests: `status` kolonu yok, kolonsuz sorgu ile devam ediliyor:",
                { message: error.message, code: error.code },
            );

            const fallback = await supabaseAdmin
                .from("custom_program_requests")
                .select(FALLBACK_SELECT)
                .order("created_at", { ascending: false });

            if (fallback.error) {
                console.error(
                    "CustomTrainingRequests: kolonsuz sorgu da başarısız:",
                    {
                        message: fallback.error.message,
                        code: fallback.error.code,
                    },
                );
                loadError = `${fallback.error.code ?? "?"}: ${fallback.error.message}`;
            } else {
                rows = (fallback.data ??
                    []) as unknown as ProgramRequestRow[];
            }
        } else if (error) {
            console.error(
                "CustomTrainingRequests: liste okunamadı:",
                {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                },
            );
            loadError = `${error.code ?? "?"}: ${error.message}`;
        } else {
            rows = (data ?? []) as unknown as ProgramRequestRow[];
        }
    } catch (clientError) {
        const message =
            clientError instanceof Error
                ? clientError.message
                : String(clientError);

        console.error(
            "CustomTrainingRequests: admin client hatası:",
            { message },
        );
        loadError = message;
    }

    return (
        <main className="min-h-screen bg-[#050505] px-6 py-10 text-white md:px-10 lg:px-16">
            <div className="mx-auto max-w-5xl">
                <header className="border-b border-white/10 pb-9">
                    <Link
                        href="/admin"
                        className="text-sm font-semibold uppercase tracking-wider text-white/40 transition-colors hover:text-[#27D66B]"
                    >
                        ← Yönetim paneli
                    </Link>

                    <h1 className="mt-7 text-4xl font-bold tracking-tight md:text-5xl">
                        Özel Antrenman Talepleri
                    </h1>

                    <p className="mt-4 max-w-2xl leading-7 text-white/40">
                        &quot;Kişisel Antrenman Programı İstiyorum&quot;
                        formundan gelen talepleri görüntüle; bilgileri
                        inceleyip durumunu güncelle veya gerekiyorsa
                        sil.
                    </p>
                </header>

                {!statusAvailable && (
                    <div className="mt-8 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5 text-sm leading-6 text-yellow-200">
                        <strong className="block font-semibold">
                            Durum kolonu henüz eklenmemiş.
                        </strong>
                        <span className="mt-1 block text-yellow-200/70">
                            Bekliyor/İncelendi durumunu kaydetmek için
                            Supabase dashboard&apos;unda şu SQL&apos;i
                            çalıştır (ben çalıştırmam):
                        </span>
                        <code className="mt-3 block overflow-x-auto rounded-xl bg-black/40 p-3 text-xs text-yellow-100">
                            alter table
                            public.custom_program_requests add column
                            if not exists status text not null
                            default &apos;pending&apos;;
                        </code>
                    </div>
                )}

                {loadError && (
                    <div
                        role="alert"
                        className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm leading-6 text-red-300"
                    >
                        Talepler yüklenemedi: {loadError}
                    </div>
                )}

                {!loadError && rows.length === 0 && (
                    <div className="mt-10 rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center">
                        <Inbox className="mx-auto h-10 w-10 text-white/20" />
                        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-white/45">
                            Henüz gönderilmiş bir özel antrenman talebi
                            yok.
                        </p>
                    </div>
                )}

                {!loadError && rows.length > 0 && (
                    <ul className="mt-8 space-y-5">
                        {rows.map((request) => {
                            const statusKey = request.status ?? "pending";
                            const email = request.contact_info;
                            const hasContact = Boolean(email);

                            return (
                                <li
                                    key={request.id}
                                    className="rounded-3xl border border-white/10 bg-[#111111] p-6 sm:p-7"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span
                                                    className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                                                        STATUS_CLASSES[
                                                            statusKey
                                                        ] ??
                                                        STATUS_CLASSES.pending
                                                    }`}
                                                >
                                                    {STATUS_LABELS[
                                                        statusKey
                                                    ] ?? "Bekliyor"}
                                                </span>

                                                <span className="text-xs text-white/30">
                                                    {formatDate(
                                                        request.created_at,
                                                    )}
                                                </span>
                                            </div>

                                            <h2
                                                title={
                                                    request.full_name
                                                }
                                                className="mt-3 truncate text-xl font-semibold sm:text-2xl"
                                            >
                                                {request.full_name}
                                            </h2>

                                            {hasContact ? (
                                                <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                                                    {isEmail(email) ? (
                                                        <a
                                                            href={`mailto:${email}`}
                                                            className="inline-flex items-center gap-2 font-semibold text-[#27D66B] transition-colors hover:underline"
                                                        >
                                                            <Mail className="h-4 w-4" />
                                                            {email}
                                                        </a>
                                                    ) : (
                                                        <a
                                                            href={`tel:${email}`}
                                                            className="inline-flex items-center gap-2 font-semibold text-[#27D66B] transition-colors hover:underline"
                                                        >
                                                            <Phone className="h-4 w-4" />
                                                            {email}
                                                        </a>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="mt-2 text-sm text-white/30">
                                                    İletişim
                                                    belirtilmemiş
                                                </p>
                                            )}

                                            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                                                <span className="rounded-full border border-white/10 px-3 py-1 text-white/55">
                                                    {GOALS.find(
                                                        (item) =>
                                                            item.key ===
                                                            request.goal,
                                                    )?.label ??
                                                        request.goal}
                                                </span>

                                                {request.age !== null && (
                                                    <span className="rounded-full border border-white/10 px-3 py-1 text-white/55">
                                                        {request.age}{" "}
                                                        yaş
                                                    </span>
                                                )}

                                                {request.height !==
                                                    null && (
                                                    <span className="rounded-full border border-white/10 px-3 py-1 text-white/55">
                                                        {
                                                            request.height
                                                        }{" "}
                                                        cm
                                                    </span>
                                                )}

                                                {request.weight !==
                                                    null && (
                                                    <span className="rounded-full border border-white/10 px-3 py-1 text-white/55">
                                                        {
                                                            request.weight
                                                        }{" "}
                                                        kg
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <ProgramRequestDeleteButton
                                            requestId={
                                                request.id
                                            }
                                            fullName={
                                                request.full_name
                                            }
                                        />
                                    </div>

                                    {request.notes && (
                                        <p className="mt-4 whitespace-pre-wrap break-words rounded-2xl border border-white/10 bg-[#050505] px-4 py-4 text-sm leading-6 text-white/60">
                                            {request.notes}
                                        </p>
                                    )}

                                    {statusAvailable && (
                                        <ProgramRequestStatusActions
                                            requestId={
                                                request.id
                                            }
                                            currentStatus={
                                                statusKey as ProgramRequestStatus
                                            }
                                        />
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </main>
    );
}
