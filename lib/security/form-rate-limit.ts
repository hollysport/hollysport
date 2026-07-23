import "server-only";

import { createHash } from "node:crypto";

import { createAdminClient } from "@/lib/supabase/admin";

export function getClientIp(request: Request) {
    const cloudflareIp = request.headers.get(
        "cf-connecting-ip",
    );

    if (cloudflareIp) {
        return cloudflareIp.trim();
    }

    const forwardedFor = request.headers.get(
        "x-forwarded-for",
    );

    if (forwardedFor) {
        return forwardedFor
            .split(",")[0]
            .trim();
    }

    const realIp = request.headers.get("x-real-ip");

    return realIp?.trim() || "unknown";
}

function createIdentifierHash(request: Request) {
    const salt = process.env.FORM_RATE_LIMIT_SALT;

    if (!salt) {
        throw new Error(
            "FORM_RATE_LIMIT_SALT tanımlanmamış.",
        );
    }

    const ipAddress = getClientIp(request);
    const userAgent =
        request.headers.get("user-agent") ?? "unknown";

    const identifier =
        ipAddress === "unknown"
            ? `${ipAddress}:${userAgent}`
            : ipAddress;

    return createHash("sha256")
        .update(`${salt}:${identifier}`)
        .digest("hex");
}

type RateLimitOptions = {
    request: Request;
    formKey: string;
    limit?: number;
    windowSeconds?: number;
};

export async function checkFormRateLimit({
    request,
    formKey,
    limit = 3,
    windowSeconds = 600,
}: RateLimitOptions) {
    const identifierHash =
        createIdentifierHash(request);

    const supabase = createAdminClient();

    const { data, error } = await supabase.rpc(
        "check_and_record_form_rate_limit",
        {
            p_form_key: formKey,
            p_identifier_hash: identifierHash,
            p_limit: limit,
            p_window_seconds: windowSeconds,
        },
    );

    if (error) {
        console.error(
            "Form hız sınırı kontrol hatası:",
            error,
        );

        throw new Error(
            "Form hız sınırı kontrol edilemedi.",
        );
    }

    return data === true;
}