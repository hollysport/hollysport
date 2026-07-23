import "server-only";

type TurnstileVerificationResponse = {
    success: boolean;
    action?: string;
    hostname?: string;
    challenge_ts?: string;
    "error-codes"?: string[];
};

type VerifyTurnstileOptions = {
    token: string;
    ipAddress?: string;
    expectedAction?: string;
};

export async function verifyTurnstileToken({
    token,
    ipAddress,
    expectedAction,
}: VerifyTurnstileOptions) {
    const secretKey =
        process.env.TURNSTILE_SECRET_KEY;

    if (!secretKey) {
        throw new Error(
            "TURNSTILE_SECRET_KEY tanımlanmamış.",
        );
    }

    if (!token) {
        return {
            success: false,
            errors: ["missing-input-response"],
        };
    }

    const requestBody = new URLSearchParams({
        secret: secretKey,
        response: token,
    });

    if (ipAddress && ipAddress !== "unknown") {
        requestBody.set("remoteip", ipAddress);
    }

    const response = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/x-www-form-urlencoded",
            },
            body: requestBody,
            cache: "no-store",
        },
    );

    if (!response.ok) {
        return {
            success: false,
            errors: ["siteverify-request-failed"],
        };
    }

    const result =
        (await response.json()) as TurnstileVerificationResponse;

    if (!result.success) {
        return {
            success: false,
            errors: result["error-codes"] ?? [],
        };
    }

    if (
        expectedAction &&
        result.action !== expectedAction
    ) {
        return {
            success: false,
            errors: ["invalid-action"],
        };
    }

    return {
        success: true,
        errors: [],
    };
}