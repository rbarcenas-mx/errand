import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { api } from '../api';
import { MainStackParamList } from '../navigation/AppNavigator';

type Route = RouteProp<MainStackParamList, 'Rate'>;

export default function RateScreen() {
  const route = useRoute<Route>();
  const nav = useNavigation();
  const [puntuacion, setPuntuacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRate() {
    if (puntuacion === 0) {
      Alert.alert('Error', 'Selecciona una puntuación');
      return;
    }
    setLoading(true);
    try {
      await api.calificaciones.create({
        id_mandado: route.params.mandadoId,
        id_calificado: route.params.idCalificado,
        puntuacion,
        comentario: comentario.trim() || undefined,
      });
      Alert.alert('Calificado', 'Gracias por tu calificación');
      nav.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.error || 'No se pudo calificar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calificar a {route.params.nombreCalificado}</Text>

      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity key={n} onPress={() => setPuntuacion(n)}>
            <Text style={[styles.star, n <= puntuacion && styles.starActive]}>★</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput style={styles.input} placeholder="Comentario (opcional)" value={comentario} onChangeText={setComentario} multiline />

      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleRate} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Enviando...' : 'Calificar'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 24, textAlign: 'center' },
  stars: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  star: { fontSize: 36, color: '#ddd' },
  starActive: { color: '#FFD700' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 12, backgroundColor: '#f9f9f9', height: 80, textAlignVertical: 'top' },
  button: { backgroundColor: '#007AFF', borderRadius: 8, padding: 14, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
