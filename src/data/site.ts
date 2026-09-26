/**
 * Configuración central del sitio: identidad, contacto, redes y datos de negocio.
 * Todo el SEO (metadatos, JSON-LD, sitemap, robots.txt, llms.txt) se apoya en este archivo.
 * El origen canónico es `site` en `astro.config.mjs` (variable de entorno `SITE`).
 */

export const SITE_NAME = "MOART";

export const SITE_ORIGIN = (
  import.meta.env.SITE ?? "https://moarthouse.com/"
).replace(/\/$/, "");

export const SITE_LOCALE = "es_CO";
export const SITE_LANG = "es";
export const SITE_COUNTRY = "CO";
export const SITE_CURRENCY = "COP";

/**
 * Path base del despliegue, sin barra final. Vacío en la raíz, `/repo` en
 * GitHub Pages cuando el sitio vive en un subdirectorio.
 */
export const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, "");

/**
 * Construye una URL pública a partir de una ruta de la app (`/catalog`),
 * anteponiendo el `base` del despliegue.
 * No usar con rutas que ya incluyan el base, como `Astro.url.pathname`.
 */
export function siteUrl(path = "/"): string {
  const suffix = path === "/" || path === "" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `${SITE_ORIGIN}${BASE_PATH}${suffix}`;
}

export const SITE_DESCRIPTION =
  "MOART es un estudio taller en Medellín, Colombia, que crea esculturas de autor en marmolina. Figuras, navidad y relieves moldeados y pulidos a mano, siempre por encargo.";

export const SITE_SHORT_DESCRIPTION =
  "Esculturas de autor en marmolina moldeadas y pulidas a mano en Medellín, Colombia.";

/** Título por defecto. Cada página debe sobreescribirlo con uno único y descriptivo. */
export const SITE_DEFAULT_TITLE = "MOART — Esculturas de autor en marmolina";

export const SITE_LOGO = "/favicon.svg";
export const SITE_OG_IMAGE = "/og-default.jpg";

export const CONTACT = {
  email: "moart.house17@gmail.com",
  phone: "+57 312 770 1638",
  whatsapp: "573127701638",
} as const;

export const LOCATION = {
  locality: "Medellín",
  region: "Antioquia",
  country: "CO",
  countryName: "Colombia",
} as const;

export const SOCIAL_LINKS = [
  { href: "https://www.instagram.com/moart.house17/", label: "Instagram" },
  { href: "https://www.facebook.com/moart.house17/", label: "Facebook" },
  { href: "https://wa.me/573127701638", label: "WhatsApp" },
] as const;

/**
 * Datos delriever organization. Usados como `@id` referencia en el resto del schema.
 * `streetAddress` se omite a propósito: no hay dirección pública confirmada.
 */
export const ORGANIZATION = {
  name: SITE_NAME,
  legalName: "MOART",
  url: SITE_ORIGIN,
  logo: `${SITE_ORIGIN}${SITE_LOGO}`,
  description: SITE_DESCRIPTION,
  foundingDate: "2021",
  foundingLocation: `${LOCATION.locality}, ${LOCATION.countryName}`,
  email: CONTACT.email,
  telephone: CONTACT.phone,
  sameAs: SOCIAL_LINKS.map((social) => social.href),
} as const;

export const ORG_ID = `${SITE_ORIGIN}/#organization`;
export const WEBSITE_ID = `${SITE_ORIGIN}/#website`;
