import type { ImageMetadata } from "astro";
import { getImage } from "astro:assets";
import {
  CONTACT,
  LOCATION,
  ORG_ID,
  ORGANIZATION,
  SITE_CURRENCY,
  SITE_LANG,
  SITE_LOCALE,
  SITE_NAME,
  SITE_ORIGIN,
  WEBSITE_ID,
} from "@/data/site.js";
import type { Product } from "@/data/products.js";

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

export type ImageInput = ImageMetadata | string | undefined;

export interface ResolvedImage {
  url: string;
  width: number;
  height: number;
}

/** Normaliza cualquier entrada a una URL absoluta usando el origen del sitio. */
export function absoluteUrl(path = "/", origin: string = SITE_ORIGIN): string {
  if (/^https?:\/\//i.test(path)) return path;
  const base = origin.replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix === "/" ? "" : suffix}`;
}

/** Deja el texto en un máximo de caracteres sin cortar palabras a la mitad. */
export function truncate(text: string, max = 160): string {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const sliced = clean.slice(0, max - 1);
  const lastSpace = sliced.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? sliced.slice(0, lastSpace) : sliced).replace(/[,.;:—-]+$/, "")}…`;
}

/** Título de marca: "Página — MOART" sin duplicar el nombre si ya está incluido. */
export function pageTitle(title?: string): string {
  const clean = (title ?? "").replace(/\s+/g, " ").trim();
  if (!clean) return SITE_NAME;
  if (clean.toLowerCase().includes(SITE_NAME.toLowerCase())) return clean;
  return `${clean} — ${SITE_NAME}`;
}

/**
 * Resuelve la URL pública y las dimensiones reales de una imagen.
 * Las imágenes de `astro:assets` se optimizan y se sirven con hash, por lo que hay
 * que pedirlas para conocer su ruta definitiva.
 */
export async function resolveImage(image: ImageInput): Promise<ResolvedImage | undefined> {
  if (!image) return undefined;
  if (typeof image === "string") {
    return { url: absoluteUrl(image), width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT };
  }
  const optimized = await getImage({
    src: image,
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
    fit: "cover",
    position: "centre",
  });
  return {
    url: new URL(optimized.src, SITE_ORIGIN).href,
    width: optimized.attributes.width,
    height: optimized.attributes.height,
  };
}

/** Solo la URL de la imagen optimizada. */
export async function resolveImageUrl(image: ImageInput): Promise<string | undefined> {
  return (await resolveImage(image))?.url;
}

export function organizationSchema() {
  return {
    "@type": "LocalBusiness",
    "@id": ORG_ID,
    name: ORGANIZATION.name,
    url: ORGANIZATION.url,
    description: ORGANIZATION.description,
    logo: ORGANIZATION.logo,
    image: absoluteUrl("/og-default.jpg"),
    email: ORGANIZATION.email,
    telephone: ORGANIZATION.telephone,
    foundingDate: ORGANIZATION.foundingDate,
    priceRange: "$$$",
    currenciesAccepted: SITE_CURRENCY,
    paymentAccepted: "Transferencia bancaria",
    address: {
      "@type": "PostalAddress",
      addressLocality: LOCATION.locality,
      addressRegion: LOCATION.region,
      addressCountry: LOCATION.country,
    },
    areaServed: [
      { "@type": "Country", name: LOCATION.countryName },
      { "@type": "AdministrativeArea", name: "Antioquia" },
    ],
    knowsAbout: [
      "Escultura en marmolina",
      "Escultura artesanal",
      "Figuras decorativas",
      "Relieves murales",
      "Decoración natal",
    ],
    makesOffer: {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Esculturas en marmolina por encargo",
        description:
          "Modelado, moldeado y pulido a mano de esculturas únicas en marmolina blanca.",
      },
    },
    sameAs: ORGANIZATION.sameAs,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: CONTACT.email,
        telephone: CONTACT.phone,
        availableLanguage: [SITE_LANG],
        areaServed: "Worldwide",
      },
    ],
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_ORIGIN,
    name: SITE_NAME,
    description: ORGANIZATION.description,
    inLanguage: SITE_LOCALE,
    publisher: { "@id": ORG_ID },
  };
}

export type BreadcrumbEntry = { name: string; href: string };

export function breadcrumbSchema(entries: BreadcrumbEntry[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: absoluteUrl(entry.href),
    })),
  };
}

export function productSchema(product: Product, imageUrls: string[]) {
  const url = absoluteUrl(`/products/${product.slug}`);
  return {
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    description: product.description,
    url,
    sku: product.slug,
    category: product.category,
    material: product.material,
    inLanguage: SITE_LOCALE,
    image: imageUrls.length > 0 ? imageUrls : [absoluteUrl("/og-default.jpg")],
    brand: { "@type": "Brand", name: SITE_NAME },
    manufacturer: { "@id": ORG_ID },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: SITE_CURRENCY,
      price: product.price,
      priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
      availability: "https://schema.org/PreOrder",
      itemCondition: "https://schema.org/NewCondition",
      businessFunction: "https://schema.org/Sell",
      seller: { "@id": ORG_ID },
      acceptedPaymentMethod: {
        "@type": "PaymentMethod",
        name: "Transferencia bancaria",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: product.packagingPrice,
          currency: SITE_CURRENCY,
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: LOCATION.country,
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 7,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 15,
            unitCode: "DAY",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: LOCATION.country,
        returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
        merchantReturnDays: 0,
        returnFees: "https://schema.org/ReturnFeesNotApplicable",
      },
    },
  };
}

export function itemListSchema(products: Product[], name: string, path: string) {
  return {
    "@type": "ItemList",
    name,
    url: absoluteUrl(path),
    numberOfItems: products.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/products/${product.slug}`),
      name: product.name,
    })),
  };
}

/**
 * Agrupa un conjunto de nodos JSON-LD para referenciarlos por `@id` y evitar
 * duplicar datos entre páginas. `Seo.astro` los envuelve en un único `@graph`.
 */
export function graph(...nodes: object[]) {
  return nodes.flat().filter(Boolean);
}
