import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { api } from '../api';
import { Mandado } from '../types';
import { MainStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<MainStackParamList, 'Home'>;

export default function HomeScreen() {
  const nav = useNavigation<Nav>();
  const [mandados, setMandados] = useState<Mandado[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadLocation();
    }, [])
  );

  async function loadLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos tu ubicación para mostrar mandados cerca');
      setLoading(false);
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    const coords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
    setLocation(coords);
    await loadMandados(coords);
  }

  async function loadMandados(coords: { lat: number; lng: number }) {
    setLoading(true);
    try {
      const res = await api.mandados.list({ ...coords });
      setMandados(res.data);
    } catch (err: any) {
      Alert.alert('Error', err.error || 'No se pudieron cargar los mandados');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.navigate('CreateMandado')} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>+ Crear mandado</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => nav.navigate('MisMandados')} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Mis mandados</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => nav.navigate('MisOfertas')} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Mis ofertas</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => nav.navigate('Profile')} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Perfil</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : mandados.length === 0 ? (
        <Text style={styles.empty}>No hay mandados cerca</Text>
      ) : (
        <FlatList
          data={mandados}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => nav.navigate('MandadoDetail', { mandadoId: item.id })}>
              <Text style={styles.cardTitle}>{item.titulo}</Text>
              <Text style={styles.cardSubtitle}>{item.tipo} · {item.estado}</Text>
              <Text style={styles.cardDate}>Límite: {new Date(item.fecha_hora_limite).toLocaleDateString()}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 8 },
  headerButton: { backgroundColor: '#007AFF', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8 },
  headerButtonText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  empty: { textAlign: 'center', marginTop: 40, color: '#666', fontSize: 16 },
  card: {
    marginHorizontal: 12, marginBottom: 8, padding: 16,
    backgroundColor: '#f9f9f9', borderRadius: 8, borderWidth: 1, borderColor: '#eee',
  },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: '#666', marginBottom: 2 },
  cardDate: { fontSize: 12, color: '#999' },
});
