import { defineConfig } from 'vitepress'

export default defineConfig({
    title: "Resty.js",
    description: "A modern, lightweight, and type-safe framework for building server-side applications with Node.js and TypeScript.",
    themeConfig: {
        nav: [
            { text: 'Home', link: '/' },
            { text: 'Guide', link: '/guide/getting-started' },
            { text: 'API', link: '/api/reference' }
        ],
        sidebar: [
            {
                text: 'Guide',
                items: [
                    { text: 'Getting Started', link: '/guide/getting-started' },
                    { text: 'Migration Guide', link: '/guide/migration' }
                ]
            },
            {
                text: 'API',
                items: [
                    { text: 'Reference', link: '/api/reference' }
                ]
            }
        ],
        socialLinks: [
            { icon: 'github', link: 'https://github.com/restyjs/resty' }
        ]
    }
})
