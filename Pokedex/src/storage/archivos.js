// Persistencia en archivos JSON dentro del directorio de documentos de la app.
// Sobreviven al cierre de la app y a las actualizaciones.

import { File, Paths } from 'expo-file-system';

function archivo(nombre) {
  return new File(Paths.document, nombre);
}

// Devuelve el contenido del archivo ya convertido, o `porDefecto` si no existe
// o si esta danado.
export async function leerJson(nombre, porDefecto) {
  try {
    const f = archivo(nombre);

    if (!f.exists) {
      return porDefecto;
    }

    return JSON.parse(await f.text());
  } catch (error) {
    console.log('No se pudo leer ' + nombre + ':', error.message);
    return porDefecto;
  }
}

export function guardarJson(nombre, datos) {
  try {
    const f = archivo(nombre);

    if (!f.exists) {
      f.create();
    }

    f.write(JSON.stringify(datos));
  } catch (error) {
    console.log('No se pudo guardar ' + nombre + ':', error.message);
  }
}
