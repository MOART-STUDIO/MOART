import { getProducts } from "@/data/products.js";
import { formatPrice } from "@/data/products.js";
import {
  CONTACT,
  LOCATION,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_ORIGIN,
} from "@/data/site.js";

/** Datos derivados del catálogo que se repiten en `llms.txt` y `llms-full.txt`. */
export async function buildCatalogFacts() {
  const products = await getProducts();
  const categories = [...new Set(products.map((product) => product.category))].sort();
  const collections = [...new Set(products.map((product) => product.collection))].sort();
  const prices = products.map((product) => product.price);
  return {
    products,
    categories,
    collections,
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
  };
}

export const BUSINESS_FACTS = [
  `- **Nombre:** ${SITE_NAME}`,
  `- **Categoría:** Estudio de escultura artesanal / tienda de e-commerce`,
  `- **Qué hace:** Diseño, moldeado y pulido a mano de esculturas de marmolina. Todas las piezas se hacen por encargo; no hay stock genérico.`,
  `- **Materia prima:** Marmolina blanca de carga mineral clara, sin pigmentos, acabado mate. Una sola familia de material.`,
  `- **Ubicación:** ${LOCATION.locality}, ${LOCATION.region}, ${LOCATION.countryName}`,
  `- **Email:** ${CONTACT.email}`,
  `- **Teléfono / WhatsApp:** ${CONTACT.phone}`,
  `- **Redes:** https://www.instagram.com/moart.house17/ · https://www.facebook.com/moart.house17/`,
  `- **Moneda:** COP (pesos colombianos)`,
  `- **Envíos:** Entrega en Colombia y envío internacional bajo petición.`,
  `- **Plazo de fabricación:** 1 a 7 días según la pieza.`,
  `- **Devoluciones:** No se aceptan devoluciones, salvo que el cliente haya contratado y pagado el servicio adicional de envoltura de protección premium en el momento de la compra.`,
  `- **Idioma del sitio:** español (es-CO).`,
];

export function renderLlmsTxt({
  products,
  categories,
  collections,
  minPrice,
  maxPrice,
}: Awaited<ReturnType<typeof buildCatalogFacts>>) {
  const catalogByCategory = categories
    .map((category) => {
      const inCategory = products.filter((product) => product.category === category);
      return [
        `## ${category} (${inCategory.length} piezas)`,
        "",
        inCategory
          .map((product) => {
            const url = `${SITE_ORIGIN}/products/${product.slug}`;
            return `- [${product.name}](${url}): ${product.shortDescription}. ${product.material}, ${product.dimensions}. ${formatPrice(product.price)}. ${product.leadTime}.`;
          })
          .join("\n"),
      ].join("\n");
    })
    .join("\n\n");

  return `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

Catálogo activo con ${products.length} esculturas en marmolina, agrupadas en ${categories.length} categorías (${categories.join(", ")}) y ${collections.length} colecciones. Rango de precios: ${formatPrice(minPrice)} a ${formatPrice(maxPrice)}.

${BUSINESS_FACTS.join("\n")}

## Páginas principales

- [Inicio](${SITE_ORIGIN}/): presentación del estudio y piezas destacadas.
- [Catálogo](${SITE_ORIGIN}/catalog): todas las esculturas, con filtros por categoría y material.
- [Nosotros](${SITE_ORIGIN}/about): el taller, el proceso y los materiales.

## Cómo pedir una pieza

1. En [el catálogo](${SITE_ORIGIN}/catalog) filtra por categoría o material.
2. Abre la ficha de la pieza para ver dimensiones, acabado, plazo y precio.
3. Añádela a la colección y envía el pedido por WhatsApp al ${CONTACT.phone} o por email a ${CONTACT.email}, indicando la referencia (el nombre de la pieza).

## Contenido completo

- [llms-full.txt](${SITE_ORIGIN}/llms-full.txt): texto íntegro de la web y ficha completa de cada pieza, pensado para responder preguntas con detalle.

## Notas

- Cada pieza es única y se fabrica bajo pedido: las medidas y el acabado pueden variar ligeramente respecto a la foto.
- No hay devoluciones. Solo existe la opción de contratar la envoltura de protección premium al comprar, que es el único servicio que cubre la pieza frente a daños.
- MOART es un estudio de dos personas, no una fábrica.

${catalogByCategory}

## Contacto

- Email: ${CONTACT.email}
- WhatsApp: ${CONTACT.phone} (${SITE_ORIGIN} es el canal web principal)
`;
}

export function renderLlmsFullTxt({ products }: Awaited<ReturnType<typeof buildCatalogFacts>>) {
  const sections = products.map((product) => {
    const url = `${SITE_ORIGIN}/products/${product.slug}`;
    return [
      `## ${product.name}`,
      "",
      `- **URL:** ${url}`,
      `- **Categoría:** ${product.category}`,
      `- **Colección:** ${product.collection}`,
      `- **Material:** ${product.material}`,
      `- **Dimensiones:** ${product.dimensions}`,
      `- **Acabado:** ${product.finish}`,
      `- **Plazo de fabricación:** ${product.leadTime}`,
      `- **Precio base:** ${formatPrice(product.price)} (COP, no incluye empaque: ${formatPrice(product.packagingPrice)})`,
      `- **Disponibilidad:** PreOrder — se fabrica bajo encargo.`,
      "",
      product.description,
    ].join("\n");
  });

  return `# ${SITE_NAME} — texto íntegro

> ${SITE_DESCRIPTION}

Este documento contiene el contenido completo de ${SITE_ORIGIN} en texto plano, pensado para que un modelo de lenguaje pueda citarlo sin raspar la web.

## Sobre el estudio

${SITE_NAME} es un estudio taller de dos personas fundado en 2021 en Medellín, Colombia. Diseña, mezcla, moldea y pule esculturas de marmolina a mano. El catálogo es deliberadamente pequeño: prefieren dominar pocas piezas antes que ofrecer muchas que no controlan. El trabajo sigue tres reglas: siempre marmolina, casi siempre a mano, y hecho para durar. Los acabados mate se pueden retocar en casa y cualquier pieza puede restaurarse y pasar a otra generación.

## Datos del negocio

${BUSINESS_FACTS.join("\n")}

## Proceso

1. **Encargo.** Eliges una pieza del catálogo o pides un encargo a medida describiendo la forma, el tamaño y el espacio donde vivirá.
2. **Selección de materia.** Cada lote de marmolina se elige para la pieza concreta, a veces meses antes de moldearse.
3. **Modelado y moldeado.** La mezcla se prepara con cuidado y el molde se trabaja a mano.
4. **Pulido y acabado.** El pulido, el acabado y los detalles se hacen a mano. Es más lento y se nota.
5. **Envío.** La pieza viaja envuelta y con cuidado dentro de Colombia, o bajo petición al resto del mundo.

## Catálogo completo (${products.length} piezas)

${sections.join("\n\n")}

## Preguntas frecuentes

**¿MOART vende piezas ya hechas?**
No. Todas las piezas se fabrican bajo pedido. El plazo de cada ficha aparece en su ficha de producto y suele ir de 1 a 7 días.

**¿Cada pieza es idéntica a la foto?**
No exactamente. Al ser moldeada a mano hay variaciones leves de acabado y medidas. Las dimensiones de cada ficha son las de referencia.

**¿Qué material usan?**
Marmolina blanca de carga mineral clara, sin pigmentos, acabado mate. No usan resinas baratas ni núcleos industriales.

**¿Cuánto tarda un encargo?**
De 1 a 7 días según la pieza. El plazo exacto aparece en cada ficha de producto.

**¿A qué países envían?**
Dentro de Colombia se entrega sin coste adicional. Al resto del mundo, bajo petición: se calcula el coste según el código postal.

**¿Puedo devolver una pieza?**
No se aceptan devoluciones. La única excepción es la pieza cuyo pedido contrató y pagó el servicio adicional de envoltura de protección premium en el momento de la compra; ese es el único servicio que cubre la escultura frente a daños de transporte.

**¿Qué es la envoltura de protección premium?**
Es un servicio opcional que se añade al comprar una pieza. Envuelve la escultura en material protector reforzado para el transporte. Si lo contratas, la pieza queda cubierta; si no, no hay cobertura ni devolución posible.

**¿Hacen encargos a medida?**
Sí. Escribe a ${CONTACT.email} o por WhatsApp al ${CONTACT.phone} con la idea, el espacio y el presupuesto aproximado.

**¿Cómo se paga?**
Por transferencia bancaria o PSE, en pesos colombianos (COP). El pedido se confirma cuando el taller acepta el encargo.

**¿Puedo visitar el taller?**
Sí, se coordinan visitas en Medellín, Colombia.

## Contacto

- **Email:** ${CONTACT.email}
- **WhatsApp:** ${CONTACT.phone}
- **Instagram:** https://www.instagram.com/moart.house17/
- **Facebook:** https://www.facebook.com/moart.house17/
- **Web:** ${SITE_ORIGIN}
`;
}
