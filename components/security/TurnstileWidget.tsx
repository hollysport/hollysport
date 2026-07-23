"use client";

import Script from "next/script";
import {
    useCallback,
    useEffect,
    useRef,
} from "react";

type TurnstileRenderOptions = {
    sitekey: string;
    action?: string;
    theme?: "light" | "dark" | "auto";
    callback?: (token: string) => void;
    "expired-callback"?: () => void;
    "error-callback"?: () => void;
};

type TurnstileApi = {
    render: (
        container: HTMLElement,
        options: TurnstileRenderOptions,
    ) => string;
    reset: (widgetId?: string) => void;
    remove: (widgetId: string) => void;
};

declare global {
    interface Window {
        turnstile?: TurnstileApi;
    }
}

type TurnstileWidgetProps = {
    action: string;
    onTokenChange: (token: string | null) => void;
    resetKey?: number;
    theme?: "light" | "dark" | "auto";
};

export default function TurnstileWidget({
    action,
    onTokenChange,
    resetKey = 0,
    theme = "dark",
}: TurnstileWidgetProps) {
    const containerRef =
        useRef<HTMLDivElement>(null);

    const widgetIdRef = useRef<string | null>(null);

    const callbackRef = useRef(onTokenChange);

    const siteKey =
        process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    useEffect(() => {
        callbackRef.current = onTokenChange;
    }, [onTokenChange]);

    const renderWidget = useCallback(() => {
        if (
            !siteKey ||
            !containerRef.current ||
            !window.turnstile ||
            widgetIdRef.current
        ) {
            return;
        }

        widgetIdRef.current =
            window.turnstile.render(
                containerRef.current,
                {
                    sitekey: siteKey,
                    action,
                    theme,
                    callback(token) {
                        callbackRef.current(token);
                    },
                    "expired-callback"() {
                        callbackRef.current(null);
                    },
                    "error-callback"() {
                        callbackRef.current(null);
                    },
                },
            );
    }, [action, siteKey, theme]);

    useEffect(() => {
        renderWidget();

        const intervalId = window.setInterval(() => {
            if (window.turnstile) {
                renderWidget();
                window.clearInterval(intervalId);
            }
        }, 250);

        return () => {
            window.clearInterval(intervalId);

            if (
                widgetIdRef.current &&
                window.turnstile
            ) {
                window.turnstile.remove(
                    widgetIdRef.current,
                );
            }

            widgetIdRef.current = null;
        };
    }, [renderWidget]);

    useEffect(() => {
        if (
            resetKey > 0 &&
            widgetIdRef.current &&
            window.turnstile
        ) {
            window.turnstile.reset(
                widgetIdRef.current,
            );

            callbackRef.current(null);
        }
    }, [resetKey]);

    if (!siteKey) {
        return (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                Turnstile site anahtarı tanımlanmamış.
            </div>
        );
    }

    return (
        <>
            <Script
                src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
                strategy="afterInteractive"
                onLoad={renderWidget}
            />

            <div
                ref={containerRef}
                className="min-h-[65px]"
            />
        </>
    );
}