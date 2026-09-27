// Consumo de la API publica de waifu.im (https://www.waifu.im/).
// Solo se piden imagenes SFW: is_nsfw=false y etiquetas seguras.

const BASE = 'https://api.waifu.im/search';

const ETIQUETAS_SEGURAS = ['waifu', 'maid', 'uniform'];

function construirUrl(cantidad) {
  const etiqueta = ETIQUETAS_SEGURAS[Math.floor(Math.random() * ETIQUETAS_SEGURAS.length)];

  return (
    BASE +
    '?included_tags=' + etiqueta +
    '&is_nsfw=false' +
    '&many=true' +
    '&limit=' + cantidad
  );
}

function esperar(ms) {
  return new Promise((listo) => setTimeout(listo, ms));
}

// Devuelve un arreglo de { url, color, fuente } listo para pintar en la app.
// Reintenta un par de veces porque la API a veces responde con un reto de
// Cloudflare cuando muchos dispositivos salen por la misma IP.
export async function obtenerWaifus(cantidad, intentos = 3) {
  for (let intento = 1; intento <= intentos; intento++) {
    try {
      return await pedirWaifus(cantidad);
    } catch (error) {
      if (intento === intentos) {
        throw error;
      }
      await esperar(intento * 1000);
    }
  }
}

async function pedirWaifus(cantidad) {
  const respuesta = await fetch(construirUrl(cantidad), {
    headers: { Accept: 'application/json' },
  });

  if (!respuesta.ok) {
    throw new Error('La API respondio ' + respuesta.status);
  }

  const datos = await respuesta.json();

  if (!datos.images || datos.images.length === 0) {
    throw new Error('La API no devolvio imagenes');
  }

  return datos.images
    .filter((imagen) => imagen.is_nsfw === false)
    .map((imagen) => ({
      url: imagen.url,
      color: imagen.dominant_color,
      fuente: imagen.source,
    }));
}
