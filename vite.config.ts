import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        sveltekit(),
        SvelteKitPWA({
            manifest: {
                name: 'Family APP',
                short_name: 'Family APP',
                start_url: '/',
                display: 'standalone',
                background_color: '#0e0201',
                lang: 'cs',
                scope: '/'
            }
        })
    ]
});
