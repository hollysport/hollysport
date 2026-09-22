export default function Loading() {
    return (
        <div className="flex min-h-[60vh] items-center justify-center bg-[#050505]">
            <div className="flex flex-col items-center gap-4">
                <div
                    className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-[#27D66B]"
                    role="status"
                    aria-label="Yükleniyor"
                />

                <span className="text-sm text-white/40">
                    Yükleniyor...
                </span>
            </div>
        </div>
    );
}
