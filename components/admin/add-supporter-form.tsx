"use client";

import { FormEvent, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

const supportTypeOptions = [
    { value: "volunteer", label: "Gönüllü destek" },
    { value: "social_media", label: "Sosyal medya" },
    { value: "photo_video", label: "Fotoğraf ve video" },
    { value: "design_content", label: "Grafik tasarım ve içerik" },
    { value: "software", label: "Yazılım ve teknik destek" },
    { value: "event_operations", label: "Etkinlik ve organizasyon" },
    { value: "transport_logistics", label: "Ulaşım ve lojistik" },
    { value: "venue", label: "Mekân desteği" },
    { value: "equipment_product", label: "Ekipman veya ürün" },
    { value: "financial_support", label: "Maddi destek" },
    { value: "mentorship_network", label: "Mentorluk ve bağlantı" },
    { value: "other", label: "Diğer" },
];

export default function AddSupporterForm() {
    const router = useRouter();
    const supabase = createClient();

    const [isOpen, setIsOpen] = useState(false);
    const [displayName, setDisplayName] = useState("");
    const [category, setCategory] = useState("angel_investor");
    const [supportTypes, setSupportTypes] = useState<string[]>([]);
    const [sortOrder, setSortOrder] = useState("0");
    const [isActive, setIsActive] = useState(true);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    function toggleSupportType(value: string) {
        setSupportTypes((current) =>
            current.includes(value)
                ? current.filter((item) => item !== value)
                : [...current, value],
        );
    }

    function resetForm() {
        setDisplayName("");
        setCategory("angel_investor");
        setSupportTypes([]);
        setSortOrder("0");
        setIsActive(true);
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setErrorMessage("");
        setSuccessMessage("");

        const cleanDisplayName = displayName.trim();
        const numericSortOrder = Number(sortOrder);

        if (cleanDisplayName.length < 2) {
            setErrorMessage("Görünecek isim en az 2 karakter olmalıdır.");
            return;
        }

        if (!Number.isInteger(numericSortOrder) || numericSortOrder < 0) {
            setErrorMessage("Sıralama değeri sıfır veya pozitif tam sayı olmalıdır.");
            return;
        }

        setIsSubmitting(true);

        const { error } = await supabase
            .from("individual_supporters")
            .insert({
                display_name: cleanDisplayName,
                supporter_category: category,
                support_types: supportTypes,
                sort_order: numericSortOrder,
                is_active: isActive,
            });

        setIsSubmitting(false);

        if (error) {
            console.error(error);
            setErrorMessage(`Yatırımcı eklenemedi: ${error.message}`);
            return;
        }

        resetForm();
        setSuccessMessage("Bireysel yatırımcı başarıyla eklendi.");
        router.refresh();
    }

    return (
        <div>
            <button
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#27D66B] px-6 text-sm font-bold text-black transition hover:bg-[#45e27f]"
            >
                {isOpen ? (
                    <>
                        <X className="h-5 w-5" />
                        Formu Kapat
                    </>
                ) : (
                    <>
                        <Plus className="h-5 w-5" />
                        Yeni Yatırımcı Ekle
                    </>
                )}
            </button>

            {isOpen && (
                <form
                    onSubmit={handleSubmit}
                    className="mt-6 rounded-[2rem] border border-white/10 bg-[#111111] p-6 sm:p-8"
                >
                    <div>
                        <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#27D66B]">
                            Yeni kayıt
                        </p>

                        <h2 className="mt-3 text-2xl font-bold text-white">
                            Bireysel yatırımcı ekle
                        </h2>
                    </div>

                    <div className="mt-7 grid gap-6 md:grid-cols-2">
                        <label>
                            <span className="mb-2 block text-sm font-semibold text-white">
                                Görünecek isim
                            </span>

                            <input
                                type="text"
                                value={displayName}
                                onChange={(event) =>
                                    setDisplayName(event.target.value)
                                }
                                placeholder="Umut K*****"
                                maxLength={100}
                                required
                                className="form-field-dark min-h-12 w-full rounded-2xl border border-white/10 bg-[#1a1a1a] px-4 outline-none transition focus:border-[#27D66B]"
                            />
                        </label>

                        <label>
                            <span className="mb-2 block text-sm font-semibold text-white">
                                Kategori
                            </span>

                            <select
                                value={category}
                                onChange={(event) =>
                                    setCategory(event.target.value)
                                }
                                className="form-field-dark min-h-12 w-full rounded-2xl border border-white/10 bg-[#1a1a1a] px-4 outline-none transition focus:border-[#27D66B]"
                            >
                                <option value="individual">
                                    Bireysel destekçi
                                </option>

                                <option value="volunteer">
                                    Gönüllü destekçi
                                </option>

                                <option value="angel_investor">
                                    Stratejik yatırımcı
                                </option>
                            </select>
                        </label>

                        <label>
                            <span className="mb-2 block text-sm font-semibold text-white">
                                Gösterim sırası
                            </span>

                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={sortOrder}
                                onChange={(event) =>
                                    setSortOrder(event.target.value)
                                }
                                className="form-field-dark min-h-12 w-full rounded-2xl border border-white/10 bg-[#1a1a1a] px-4 outline-none transition focus:border-[#27D66B]"
                            />
                        </label>

                        <label>
                            <span className="mb-2 block text-sm font-semibold text-white">
                                Yayın durumu
                            </span>

                            <select
                                value={isActive ? "active" : "passive"}
                                onChange={(event) =>
                                    setIsActive(
                                        event.target.value === "active",
                                    )
                                }
                                className="form-field-dark min-h-12 w-full rounded-2xl border border-white/10 bg-[#1a1a1a] px-4 outline-none transition focus:border-[#27D66B]"
                            >
                                <option value="active">
                                    Ana sayfada göster
                                </option>

                                <option value="passive">
                                    Ana sayfada gizle
                                </option>
                            </select>
                        </label>
                    </div>

                    <div className="mt-6">
                        <p className="text-sm font-semibold text-white">
                            Destek türleri
                        </p>

                        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {supportTypeOptions.map((option) => (
                                <label
                                    key={option.value}
                                    className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                                >
                                    <input
                                        type="checkbox"
                                        checked={supportTypes.includes(
                                            option.value,
                                        )}
                                        onChange={() =>
                                            toggleSupportType(option.value)
                                        }
                                        className="h-4 w-4 accent-[#27D66B]"
                                    />

                                    <span className="text-sm text-white/65">
                                        {option.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="mt-6 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                            {errorMessage}
                        </div>
                    )}

                    {successMessage && (
                        <div className="mt-6 rounded-2xl border border-[#27D66B]/25 bg-[#27D66B]/10 px-4 py-3 text-sm text-[#67eb9b]">
                            {successMessage}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#27D66B] px-7 text-sm font-bold text-black transition hover:bg-[#45e27f] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSubmitting && (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        )}

                        {isSubmitting
                            ? "Ekleniyor"
                            : "Yatırımcıyı Ekle"}
                    </button>
                </form>
            )}
        </div>
    );
}