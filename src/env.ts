import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
        PAYSTACK_SECRET_KEY: z.string().min(1),
        RESEND_API_KEY: z.string().min(1),
        GOOGLE_GEMINI_API_KEY: z.string().min(1),
        NODE_ENV: z.enum(["development", "test", "production"]),
    },
    client: {
        NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
        NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
        NEXT_PUBLIC_APP_URL: z.string().url().optional(),
    },
    runtimeEnv: {
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
        PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
        RESEND_API_KEY: process.env.RESEND_API_KEY,
        GOOGLE_GEMINI_API_KEY: process.env.GOOGLE_GEMINI_API_KEY,
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    },
});
