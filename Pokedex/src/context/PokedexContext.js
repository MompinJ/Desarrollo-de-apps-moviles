// Estado compartido de la app. El catalogo esta incluido en la app (src/data) y
// el progreso del usuario se guarda en un archivo JSON.

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import CATALOGO from '../data/pokemon';
import { guardarJson, leerJson } from '../storage/archivos';

const ARCHIVO_PROGRESO = 'progreso.json';

const PokedexContext = createContext(null);

export function PokedexProvider({ children }) {
  const [encontrados, setEncontrados] = useState({});
  const [listo, setListo] = useState(false);

  // Los listeners de Bluetooth y de los sensores guardan funciones viejas, asi
  // que el progreso se lee siempre desde esta referencia.
  const encontradosRef = useRef({});

  useEffect(() => {
    leerJson(ARCHIVO_PROGRESO, {}).then((guardado) => {
      guardar(guardado, false);
      setListo(true);
    });
  }, []);

  function guardar(siguiente, aDisco = true) {
    encontradosRef.current = siguiente;
    setEncontrados(siguiente);

    if (aDisco) {
      guardarJson(ARCHIVO_PROGRESO, siguiente);
    }
  }

  function alternarEncontrado(id) {
    const siguiente = { ...encontradosRef.current };

    if (siguiente[id]) {
      delete siguiente[id];
    } else {
      siguiente[id] = new Date().toISOString();
    }

    guardar(siguiente);
  }

  // Intercambio: se pierde el pokemon entregado y se gana el recibido.
  function intercambiar(entregadoId, recibidoId) {
    const siguiente = { ...encontradosRef.current };

    delete siguiente[entregadoId];
    siguiente[recibidoId] = new Date().toISOString();

    guardar(siguiente);
  }

  return (
    <PokedexContext.Provider
      value={{
        catalogo: CATALOGO,
        encontrados,
        listo,
        alternarEncontrado,
        intercambiar,
        encontradosRef,
      }}
    >
      {children}
    </PokedexContext.Provider>
  );
}

export function usePokedex() {
  return useContext(PokedexContext);
}
