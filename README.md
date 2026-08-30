# MOART - Tema de esculturas en marmolina

[![Vista previa del tema MOART](preview.webp)](https://moart.example/)

![Astro 7](https://img.shields.io/badge/Astro-7.2.9-ff5d01?style=for-the-badge&logo=astro&logoColor=white)
![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4.1-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=for-the-badge&logo=typescript&logoColor=white)
![MIT License](https://img.shields.io/badge/License-MIT-27272a?style=for-the-badge)

Vista previa: [https://moart.example/](https://moart.example/)

MOART es un tema editorial y sereno de Astro para un pequeño estudio taller de esculturas en marmolina. Totalmente estático, con pequeñas mejoras en JavaScript para los filtros del catálogo, la galería de productos y la colección local.

## Features

- Polished homepage with hero, featured products, material story, newsletter form, and footer
- Catalogue page with client-side category and material filters, and price sorting
- Static product detail pages generated from Markdown content with Zod-validated frontmatter
- Product image gallery with thumbnail navigation
- LocalStorage cart with quantity controls and a multi-step checkout preview
- About page with workshop story, principles, image-led sections, and contact CTA
- Astro-optimized images served in WebP with responsive widths
- Self-hosted WOFF2 fonts (Inter, Instrument Serif) — no external requests
- Full SEO: canonical URLs, Open Graph, Twitter cards, Product and Organization JSON-LD, sitemap, dynamic `robots.txt`
- Accessible: skip-to-content link, ARIA labels, focus-managed mobile menu, semantic HTML
- Strict TypeScript throughout

## Tech Stack

- Astro 7
- Tailwind CSS 4
- TypeScript (strict)
- Static output

## Getting Started

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Theme Setup

Update the production URL before publishing:

```bash
SITE=https://your-domain.com npm run build
```

The configured `site` value is used for canonical URLs, sitemap generation, and `robots.txt`. The default preview site is `https://moart.example/`.

Main content files:

- `src/content/products/*.md` — entradas del catálogo de esculturas, frontmatter, imágenes y descripciones
- `src/content.config.ts` — esquema de la colección de contenido de productos
- `src/data/products.ts` — utilidades que leen y ordenan el contenido de productos
- `src/layouts/BaseLayout.astro` — metadatos compartidos, estructura global, slots de cabecera/pie y ayudante de colección
- `src/components/SiteHeader.astro` — navegación y badge de la colección
- `src/components/SiteFooter.astro` — enlaces del pie y texto del estudio
- `src/styles.css` — tokens de diseño, configuración de Tailwind y fuentes locales

## Añadir esculturas

Añade un archivo Markdown por escultura en `src/content/products/`. El nombre del archivo se convierte en el slug de la URL, así que `escultura-aurora.md` se convierte en `/products/escultura-aurora`.

```md
---
name: Aurora
collection: Colección I — Figuras
category: Figuras
material: Marmolina
price: 840
shortDescription: Figura de marmolina
dimensions: 32 × 28 × 54 cm
finish: Mate natural
leadTime: 4–6 semanas
images:
  - /assets/catalogo/catalogo-01.jpg
  - /assets/catalogo/catalogo-02.jpg
order: 2
---

Escultura figurativa en marmolina, Aurora interpreta el gesto de un cuerpo en equilibrio. Cada pieza se moldea y pule a mano en nuestro taller.
```

Las imágenes de producto viven en `src/assets/catalogo/` y se referencian en el frontmatter con su ruta pública `/assets/catalogo/...`. Durante el build, `src/data/product-images.ts` las resuelve a imágenes optimizadas por Astro. Las categorías y materiales se derivan automáticamente de los archivos de producto y aparecen como filtros del catálogo.

## Content Management (Pages CMS)

El tema incluye `.pages.yml` en la raíz para gestionar el catálogo desde [Pages CMS](https://pagescms.org) sin tocar Markdown a mano: puedes crear y editar esculturas, y subir imágenes desde el navegador.

1. Sube el repositorio a GitHub. `.pages.yml` debe estar en la rama por defecto para que Pages CMS lo detecte.
2. Entra en <https://pagescms.org>, autoriza con GitHub y selecciona el repositorio.
3. En la pestaña **Products**, crea, edita o borra esculturas. Cada producto se guarda como un `.md` nuevo en `src/content/products/` y el nombre del archivo se convierte en el slug de la URL.
4. En el campo *images*, usa **Añadir imagen** para subir desde el navegador. Los archivos se guardan en `src/assets/catalogo/` y la ruta `/assets/catalogo/...` se escribe automáticamente en el frontmatter; Astro las optimiza en build.
5. Publica el commit con Git y despliega como cualquier otra versión del sitio.

Para desarrollar el CMS en local, sigue la [guía de instalación de Pages CMS](https://pagescms.org/docs/).

## Pages

- `/` — Homepage
- `/catalog` — Full catalogue with filters
- `/products/[slug]` — Product detail
- `/about` — Studio story
- `/cart` — Cart and checkout preview

## Images and Fonts

Theme images live in `src/assets` and render through Astro's image pipeline. Local fonts live in `src/assets/fonts`; only the weights and styles used by the theme are included.

Use `public/` only for files that should be served as-is.

## SEO

- Unique page titles and descriptions
- Canonical URLs
- Open Graph and Twitter card metadata
- Sitemap generation via `@astrojs/sitemap`
- Dynamic `robots.txt`
- Product JSON-LD on product pages
- Organization JSON-LD on the homepage
- `noindex` on cart and 404

## Deployment

The theme builds to static files in `dist/` and deploys to any static host. Set `SITE` to the production origin during deployment so SEO URLs are correct.

## License

This project is licensed under the [MIT License](LICENSE).

## Notes

- Replace the demo product copy, prices, and images with your own catalogue before publishing.
- The newsletter and checkout flows are design previews; connect them to your preferred backend or form provider if needed.
