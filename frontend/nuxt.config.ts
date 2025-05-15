import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2024-11-01',
	devtools: { enabled: true },
	css: ['~/assets/css/main.css'],
	vite: {
		plugins: [tailwindcss()],
		optimizeDeps: {
			include: ['chart.js', '@kurkle/color', 'vue-toastification'],
		},
	},
	build: {
		transpile: ['chart.js', '@kurkle/color', 'vue-toastification'],
	},
});
