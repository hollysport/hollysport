"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Eye,
    EyeOff,
    Loader2,
    Plus,
    Save,
    Trash2,
    Upload,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type Sponsor = {
    id: string;
    name: string;
    logo_path: string;
    logo_storage_path: string | null;
    website: string | null;
    category: string;
    is_active: boolean;
    sort_order: number;
};

type SponsorManagerProps = {
    sponsors: Sponsor[];
};

const categories = [
    { value: "main_sponsor", label: "Ana Destekçi" },
    { value: "official_supporter", label: "Resmî Destekçi" },
    { value: "event_supporter", label: "Etkinlik Destekçisi" },
    { value: "venue_supporter", label: "Mekân Destekçisi" },
    { value: "equipment_supporter", label: "Ekipman Destekçisi" },
    { value: "solution_partner", label: "Çözüm Ortağı" },
];

function createSafeFileName(fileName: string) {
    const extension = fileName.split(".").pop()?.toLowerCase() || "png";

    return `${Date.now()}-${crypto.randomUUID()}.${extension}`;
}

export default function SponsorManager({
    sponsors,
}: SponsorManagerProps) {
    const router = useRouter();
    const supabase = createClient();

    const [name, setName] = useState("");
    const [website, setWebsite] = useState("");
    const [category, setCategory] = useState("official_supporter");
    const [sortOrder, setSortOrder] = useState("0");
    const [logo, setLogo] = useState<File | null>(null);

    const [loadingAction, setLoadingAction] = useState<string | null>(
        null,
    );

    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    async function handleCreate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setErrorMessage("");
        setSuccessMessage("");

        if (!logo) {
            setErrorMessage("Bir destekçi logosu seçmelisin.");
            return;
        }

        setLoadingAction("create");

        const storagePath = `logos/${createSafeFileName(logo.name)}`;

        const { error: uploadError } = await supabase.storage
            .from("supporter-media")
            .upload(storagePath, logo, {
                cacheControl: "3600",
                upsert: false,
            });

        if (uploadError) {
            console.error(uploadError);
            setLoadingAction(null);
            setErrorMessage("Logo yüklenemedi.");
            return;
        }

        const {
            data: { publicUrl },
        } = supabase.storage
            .from("supporter-media")
            .getPublicUrl(storagePath);

        const { error: insertError } = await supabase
            .from("sponsors")
            .insert({
                name: name.trim(),
                website: website.trim() || null,
                category,
                sort_order: Number(sortOrder) || 0,
                logo_path: publicUrl,
                logo_storage_path: storagePath,
                is_active: true,
            });

        if (insertError) {
            console.error(insertError);

            await supabase.storage
                .from("supporter-media")
                .remove([storagePath]);

            setLoadingAction(null);
            setErrorMessage("Destekçi kaydedilemedi.");
            return;
        }

        setName("");
        setWebsite("");
        setCategory("official_supporter");
        setSortOrder("0");
        setLogo(null);
        setLoadingAction(null);

        setSuccessMessage("Destekçi başarıyla eklendi.");
        router.refresh();
    }

    async function updateSponsor(
        sponsorId: string,
        changes: Partial<Sponsor>,
    ) {
        setLoadingAction(sponsorId);
        setErrorMessage("");

        const { error } = await supabase
            .from("sponsors")
            .update(changes)
            .eq("id", sponsorId);

        setLoadingAction(null);

        if (error) {
            console.error(error);
            setErrorMessage("Destekçi güncellenemedi.");
            return;
        }

        router.refresh();
    }

    async function deleteSponsor(sponsor: Sponsor) {
        const confirmed = window.confirm(
            `${sponsor.name} destekçisini tamamen silmek istiyor musun?`,
        );

        if (!confirmed) return;

        setLoadingAction(sponsor.id);
        setErrorMessage("");

        const { error } = await supabase
            .from("sponsors")
            .delete()
            .eq("id", sponsor.id);

        if (error) {
            console.error(error);
            setLoadingAction(null);
            setErrorMessage("Destekçi silinemedi.");
            return;
        }

        if (sponsor.logo_storage_path) {
            await supabase.storage
                .from("supporter-media")
                .remove([sponsor.logo_storage_path]);
        }

        setLoadingAction(null);
        router.refresh();
    }

    return (
        <div>
            <form
                onSubmit={handleCreate}
                className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
            >
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-white">
                        <Plus className="h-5 w-5" />
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-zinc-950">
                            Yeni kurumsal destekçi
                        </h2>

                        <p className="text-sm text-zinc-500">
                            Firma veya kurum logosunu yükle.
                        </p>
                    </div>
                </div>

                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                    <label>
                        <span className="mb-2 block text-sm font-semibold text-zinc-950">
                            Firma veya kurum adı
                        </span>

                        <input
                            required
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-orange-500"
                        />
                    </label>

                    <label>
                        <span className="mb-2 block text-sm font-semibold text-zinc-950">
                            İnternet sitesi
                        </span>

                        <input
                            type="url"
                            value={website}
                            onChange={(event) => setWebsite(event.target.value)}
                            placeholder="https://"
                            className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-orange-500"
                        />
                    </label>

                    <label>
                        <span className="mb-2 block text-sm font-semibold text-zinc-950">
                            Destekçi kategorisi
                        </span>

                        <select
                            value={category}
                            onChange={(event) => setCategory(event.target.value)}
                            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-orange-500"
                        >
                            {categories.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        <span className="mb-2 block text-sm font-semibold text-zinc-950">
                            Sıralama
                        </span>

                        <input
                            type="number"
                            min="0"
                            value={sortOrder}
                            onChange={(event) => setSortOrder(event.target.value)}
                            className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-orange-500"
                        />
                    </label>

                    <label className="sm:col-span-2">
                        <span className="mb-2 block text-sm font-semibold text-zinc-950">
                            Logo
                        </span>

                        <div className="rounded-2xl border border-dashed border-zinc-300 p-5">
                            <input
                                required
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                onChange={(event) =>
                                    setLogo(event.target.files?.[0] ?? null)
                                }
                                className="block w-full text-sm text-zinc-600"
                            />

                            <p className="mt-3 text-xs text-zinc-500">
                                PNG, JPG, WEBP veya SVG. En fazla 5 MB.
                            </p>
                        </div>
                    </label>
                </div>

                {errorMessage && (
                    <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                        {errorMessage}
                    </div>
                )}

                {successMessage && (
                    <div className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
                        {successMessage}
                    </div>
                )}

                <button
                    disabled={loadingAction !== null}
                    type="submit"
                    className="mt-7 inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
                >
                    {loadingAction === "create" ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Upload className="h-5 w-5" />
                    )}

                    Destekçiyi Ekle
                </button>
            </form>

            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {sponsors.map((sponsor) => (
                    <article
                        key={sponsor.id}
                        className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
                    >
                        <div className="flex h-28 items-center justify-center rounded-2xl bg-zinc-50 p-5">
                            <img
                                src={sponsor.logo_path}
                                alt={`${sponsor.name} logosu`}
                                className="max-h-full max-w-full object-contain"
                            />
                        </div>

                        <div className="mt-5 flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-zinc-950">
                                    {sponsor.name}
                                </h3>

                                <p className="mt-1 text-sm text-zinc-500">
                                    {categories.find(
                                        (item) => item.value === sponsor.category,
                                    )?.label ?? sponsor.category}
                                </p>
                            </div>

                            <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${sponsor.is_active
                                        ? "bg-green-50 text-green-700"
                                        : "bg-zinc-100 text-zinc-600"
                                    }`}
                            >
                                {sponsor.is_active ? "Yayında" : "Gizli"}
                            </span>
                        </div>

                        <div className="mt-5 grid gap-3">
                            <label>
                                <span className="mb-2 block text-xs font-semibold text-zinc-700">
                                    Kategori
                                </span>

                                <select
                                    defaultValue={sponsor.category}
                                    onChange={(event) =>
                                        updateSponsor(sponsor.id, {
                                            category: event.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500"
                                >
                                    {categories.map((item) => (
                                        <option key={item.value} value={item.value}>
                                            {item.label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                <span className="mb-2 block text-xs font-semibold text-zinc-700">
                                    Sıralama
                                </span>

                                <input
                                    type="number"
                                    min="0"
                                    defaultValue={sponsor.sort_order}
                                    onBlur={(event) =>
                                        updateSponsor(sponsor.id, {
                                            sort_order: Number(event.target.value) || 0,
                                        })
                                    }
                                    className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500"
                                />
                            </label>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2">
                            <button
                                type="button"
                                disabled={loadingAction !== null}
                                onClick={() =>
                                    updateSponsor(sponsor.id, {
                                        is_active: !sponsor.is_active,
                                    })
                                }
                                className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                            >
                                {loadingAction === sponsor.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : sponsor.is_active ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}

                                {sponsor.is_active ? "Gizle" : "Yayınla"}
                            </button>

                            <button
                                type="button"
                                disabled={loadingAction !== null}
                                onClick={() => deleteSponsor(sponsor)}
                                className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-50"
                            >
                                <Trash2 className="h-4 w-4" />
                                Sil
                            </button>
                        </div>
                    </article>
                ))}
            </div>

            {sponsors.length === 0 && (
                <div className="mt-10 rounded-3xl border border-zinc-200 bg-white px-6 py-16 text-center text-zinc-500">
                    Henüz kurumsal destekçi eklenmedi.
                </div>
            )}
        </div>
    );
}