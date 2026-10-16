export default function Loading() {
    return (
        <div className="flex min-h-[60vh] items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <div
                    className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-holly"
                    role="status"
                    aria-label="Yükleniyor"
                />

                <span className="text-sm text-ink-soft">
                    Yükleniyor...
                </span>
            </div>
        </div>
    );
}
