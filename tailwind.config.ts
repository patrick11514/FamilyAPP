import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

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

    plugins: [
        typography,
        plugin(function({ addVariant }) {
            addVariant('swatch', ['&::-moz-color-swatch', '&::-webkit-color-swatch-wrapper', '&::-webkit-color-swatch']);
        })
    ]
} satisfies Config;
