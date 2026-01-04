import { defineConfig } from 'vitepress'

export default defineConfig({
    title: "Resty.js",
    description: "Experimental Fast, opinionated, minimalist and testable web framework for Node.js",
    themeConfig: {
        nav: [
            { text: 'Home', link: '/' },
            { text: 'Guide', link: '/guide/getting-started' },
            { text: 'API', link: '/api/' }
        ],

        sidebar: {
            '/guide/': [
                {
                    text: 'Introduction',
                    items: [
                        { text: 'Getting Started', link: '/guide/getting-started' },
                        { text: 'Installation', link: '/guide/installation' }
                    ]
                },
                {
                    text: 'Essentials',
                    items: [
                        { text: 'Controllers', link: '/guide/controllers' },
                        { text: 'Routing', link: '/guide/routing' },
                        { text: 'Services', link: '/guide/services' }
                    ]
                }
            ]
        },

        socialLinks: [
            { icon: 'github', link: 'https://github.com/restyjs/resty' }
        ]
    }
})
