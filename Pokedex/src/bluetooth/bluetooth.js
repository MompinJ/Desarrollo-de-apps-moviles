// Envoltorio sobre react-native-bluetooth-classic (Bluetooth clasico, RFCOMM).
// La libreria es codigo nativo: en Expo Go no existe, solo en el APK compilado.
// Por eso se carga con require protegido y la app sigue abriendo sin ella.

import { NativeModules, PermissionsAndroid, Platform } from 'react-native';

// Mensajes de una linea cada uno (JSON + salto de linea).
const OPCIONES = { delimiter: '\n' };

export const disponible = Platform.OS === 'android' && !!NativeModules.RNBluetoothClassic;

const modulo = disponible ? require('react-native-bluetooth-classic').default : null;

function resumen(dispositivo) {
  return { address: dispositivo.address, nombre: dispositivo.name || dispositivo.address };
}

export async function pedirPermisos() {
  if (Platform.Version >= 31) {
    const resultado = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]);

    return Object.values(resultado).every((r) => r === PermissionsAndroid.RESULTS.GRANTED);
  }

  const resultado = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);

  return resultado === PermissionsAndroid.RESULTS.GRANTED;
}

export async function activarBluetooth() {
  if (await modulo.isBluetoothEnabled()) {
    return true;
  }

  return modulo.requestBluetoothEnabled();
}

export async function dispositivosVinculados() {
  return (await modulo.getBondedDevices()).map(resumen);
}

// Busca dispositivos visibles cerca (tarda unos 12 segundos).
export async function descubrir() {
  return (await modulo.startDiscovery()).map(resumen);
}

export function cancelarBusqueda() {
  return modulo.cancelDiscovery().catch(() => {});
}

// Espera a que otro celular se conecte a este. Se resuelve con la conexion.
export function esperarConexion() {
  return modulo.accept(OPCIONES);
}

export function cancelarEspera() {
  return modulo.cancelAccept().catch(() => {});
}

export function conectar(address) {
  return modulo.connectToDevice(address, OPCIONES);
}

export function enviar(conexion, mensaje) {
  return conexion.write(JSON.stringify(mensaje) + '\n');
}

export function escuchar(conexion, alRecibir) {
  return conexion.onDataReceived((evento) => {
    try {
      alRecibir(JSON.parse(evento.data));
    } catch (error) {
      console.log('Mensaje Bluetooth invalido:', error.message);
    }
  });
}

export function alDesconectar(alPerderConexion) {
  return modulo.onDeviceDisconnected(alPerderConexion);
}

export function desconectar(conexion) {
  return conexion.disconnect().catch(() => {});
}

export function abrirAjustes() {
  modulo.openBluetoothSettings();
}
