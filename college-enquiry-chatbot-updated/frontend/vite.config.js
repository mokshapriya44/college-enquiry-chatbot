import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const frontendRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
    const frontendEnv = loadEnv(mode, frontendRoot, "VITE_");
    const backendEnv = loadEnv(mode, resolve(frontendRoot, "../backend"), "VITE_");
    const turnstileSiteKey =
        frontendEnv.VITE_TURNSTILE_SITE_KEY ||
        backendEnv.VITE_TURNSTILE_SITE_KEY ||
        "";

    return {
        plugins: [react()],
        define: {
            "import.meta.env.VITE_TURNSTILE_SITE_KEY": JSON.stringify(turnstileSiteKey)
        }
    };
});
