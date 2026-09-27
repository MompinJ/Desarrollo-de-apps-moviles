import { Pressable, StyleSheet, Text, View } from 'react-native';

const PRIORIDAD_COLOR = {
  alta: '#e5484d',
  media: '#f5a524',
  baja: '#30a46c',
};

export default function TareaItem({ tarea, onAlternar, onEliminar }) {
  return (
    <Pressable
      onPress={() => onAlternar(tarea.id)}
      onLongPress={() => onEliminar(tarea.id)}
      style={({ pressed }) => [styles.item, pressed && styles.presionado]}
    >
      <View style={[styles.marca, { backgroundColor: PRIORIDAD_COLOR[tarea.prioridad] }]} />
      <View style={[styles.check, tarea.hecha && styles.checkActivo]}>
        {tarea.hecha && <View style={styles.punto} />}
      </View>
      <Text style={[styles.texto, tarea.hecha && styles.textoHecho]}>{tarea.texto}</Text>
      <Text style={styles.prioridad}>{tarea.prioridad}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 10,
    paddingVertical: 14,
    paddingRight: 14,
    overflow: 'hidden',
    elevation: 2,
  },
  presionado: {
    opacity: 0.6,
  },
  marca: {
    width: 5,
    alignSelf: 'stretch',
    marginRight: 12,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#9aa4b2',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkActivo: {
    backgroundColor: '#6e56cf',
    borderColor: '#6e56cf',
  },
  punto: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  texto: {
    flex: 1,
    fontSize: 16,
    color: '#1c2024',
  },
  textoHecho: {
    textDecorationLine: 'line-through',
    color: '#9aa4b2',
  },
  prioridad: {
    fontSize: 12,
    color: '#60646c',
    textTransform: 'uppercase',
  },
});
