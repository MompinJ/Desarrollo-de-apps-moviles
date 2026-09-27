// Catalogo completo de personajes que pueden salir en la invocacion.
// La rareza define la probabilidad: SSR es la mas dificil de obtener.

export const PROBABILIDADES = {
  SSR: 5,
  SR: 20,
  R: 75,
};

export const RAREZAS = ['SSR', 'SR', 'R'];

const PERSONAJES = [
  { id: 1, nombre: 'Ryuko Amaterasu', titulo: 'Espadachina Solar', rareza: 'SSR', elemento: 'Fuego', poder: 98 },
  { id: 2, nombre: 'Kaito Kurogane', titulo: 'Caballero de Obsidiana', rareza: 'SSR', elemento: 'Oscuridad', poder: 95 },
  { id: 3, nombre: 'Yuki Shiranami', titulo: 'Maga de Escarcha', rareza: 'SSR', elemento: 'Hielo', poder: 93 },

  { id: 4, nombre: 'Hana Tsukimori', titulo: 'Sacerdotisa Lunar', rareza: 'SR', elemento: 'Luz', poder: 78 },
  { id: 5, nombre: 'Rei Fujiwara', titulo: 'Tiradora de Precision', rareza: 'SR', elemento: 'Viento', poder: 75 },
  { id: 6, nombre: 'Sora Takamine', titulo: 'Piloto del Cielo', rareza: 'SR', elemento: 'Rayo', poder: 74 },
  { id: 7, nombre: 'Daichi Ishimura', titulo: 'Guardian de Piedra', rareza: 'SR', elemento: 'Tierra', poder: 72 },
  { id: 8, nombre: 'Mei Aoyagi', titulo: 'Alquimista Novata', rareza: 'SR', elemento: 'Agua', poder: 70 },

  { id: 9, nombre: 'Ken Ito', titulo: 'Aprendiz de Espada', rareza: 'R', elemento: 'Fuego', poder: 45 },
  { id: 10, nombre: 'Aoi Nakata', titulo: 'Exploradora', rareza: 'R', elemento: 'Viento', poder: 42 },
  { id: 11, nombre: 'Riku Sasaki', titulo: 'Herrero del Pueblo', rareza: 'R', elemento: 'Tierra', poder: 40 },
  { id: 12, nombre: 'Nao Hoshino', titulo: 'Estudiante Aplicada', rareza: 'R', elemento: 'Luz', poder: 38 },
  { id: 13, nombre: 'Taro Yamada', titulo: 'Repartidor Veloz', rareza: 'R', elemento: 'Rayo', poder: 36 },
  { id: 14, nombre: 'Emi Kobayashi', titulo: 'Cocinera del Gremio', rareza: 'R', elemento: 'Agua', poder: 34 },
  { id: 15, nombre: 'Jin Watanabe', titulo: 'Vigilante Nocturno', rareza: 'R', elemento: 'Oscuridad', poder: 32 },
];

export default PERSONAJES;

export function personajesPorRareza(rareza) {
  return PERSONAJES.filter((p) => p.rareza === rareza);
}

// Elige una rareza usando las probabilidades y luego un personaje al azar de esa rareza.
export function sacarPersonaje() {
  const tiro = Math.random() * 100;
  let rareza;

  if (tiro < PROBABILIDADES.SSR) {
    rareza = 'SSR';
  } else if (tiro < PROBABILIDADES.SSR + PROBABILIDADES.SR) {
    rareza = 'SR';
  } else {
    rareza = 'R';
  }

  const candidatos = personajesPorRareza(rareza);
  return candidatos[Math.floor(Math.random() * candidatos.length)];
}
