// Catalogo local de los 151 pokemones de la primera generacion.
// Los datos se descargaron una sola vez de PokeAPI y viven en pokemon.json.

import datos from './pokemon.json';

export const TOTAL = datos.length;

const POR_ID = {};
datos.forEach((p) => {
  POR_ID[p.id] = p;
});

export function obtenerPokemon(id) {
  return POR_ID[id];
}

export default datos;
