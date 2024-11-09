// tailwind.config.js
module.exports = {
    content: [
        "./templates/*.html",
        "./static/js/*.js",
        // Добавьте другие пути, если необходимо
    ],
    theme: {
        extend: {
            colors: {
                'pantone-432c': '#394149',
                'pantone-7536c': '#A69F88',
                'pantone-663c': '#F2E8E1',
            },
        },
    },
    plugins: [],
}
