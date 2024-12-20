import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';

export default {
    content: ['./src/**/*.{html,js,svelte,ts}'],

    theme: {
        extend: {
            colors: {
                text: 'rgb(242, 223, 222)',
                background: 'rgb(14, 2, 1)',
                primary: 'rgb(230, 159, 152)',
                secondary: 'rgb(130, 32, 23)',
                accent: 'rgb(247, 40, 8)'
            },
            fontFamily: {
                poppins: ['Poppins', 'sans-serif'],
                roboto: ['Roboto', 'sans-serif']
            }
        }
    },

    plugins: [typography]
} satisfies Config;
