import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	server: {
		proxy: {
			"/api/google-script": {
				target: "https://script.google.com",
				changeOrigin: true,
				rewrite: (path) =>
					path.replace(
						/^\/api\/google-script/,
						"/macros/s/AKfycbzTHqHDGZgPwVKssuAqvci71vZoQueWh8zvOo-oBUQaT3n2mtDzRaP8nwXRVLIJgm7x/exec"
					),
			},
		},
	},
});
