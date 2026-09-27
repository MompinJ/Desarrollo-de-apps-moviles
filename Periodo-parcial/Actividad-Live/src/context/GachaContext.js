// Estado compartido de la app: inventario, tiradas y las imagenes de la API.

import { createContext, useContext, useEffect, useState } from 'react';
import PERSONAJES, { sacarPersonaje } from '../data/personajes';
import { obtenerWaifus } from '../api/waifuApi';

const GachaContext = createContext(null);

export function GachaProvider({ children }) {
  const [inventario, setInventario] = useState([]);
  const [tiradas, setTiradas] = useState(0);

  // Cada personaje del catalogo recibe una imagen de waifu.im.
  const [imagenes, setImagenes] = useState({});
  const [estadoApi, setEstadoApi] = useState('cargando');

  async function cargarImagenes() {
    setEstadoApi('cargando');

    try {
      const resultado = await obtenerWaifus(PERSONAJES.length);
      const mapa = {};

      PERSONAJES.forEach((personaje, indice) => {
        mapa[personaje.id] = resultado[indice % resultado.length];
      });

      setImagenes(mapa);
      setEstadoApi('listo');
    } catch (error) {
      console.log('waifu.im fallo:', error.message);
      setEstadoApi('error');
    }
  }

  useEffect(() => {
    cargarImagenes();
  }, []);

  function imagenDe(id) {
    return imagenes[id] || null;
  }

  function invocar() {
    const personaje = sacarPersonaje();

    setTiradas((n) => n + 1);
    setInventario((lista) => [
      { ...personaje, clave: Date.now() + '-' + lista.length },
      ...lista,
    ]);

    return personaje;
  }

  function reiniciar() {
    setInventario([]);
    setTiradas(0);
  }

  function copiasDe(id) {
    return inventario.filter((p) => p.id === id).length;
  }

  return (
    <GachaContext.Provider
      value={{
        inventario,
        tiradas,
        invocar,
        reiniciar,
        copiasDe,
        imagenDe,
        estadoApi,
        cargarImagenes,
      }}
    >
      {children}
    </GachaContext.Provider>
  );
}

export function useGacha() {
  return useContext(GachaContext);
}
