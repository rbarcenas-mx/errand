import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from '../api';
import { Mandado } from '../types';
import { MainStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<MainStackParamList, 'MisMandados'>;

export default function MisMandadosScreen() {
  const nav = useNavigation<Nav>();
  const [mandados, setMandados] = useState<Mandado[]>([]);

  useFocusEffect(
    useCallback(() => {
      api.mandados.misMandados().then((r) => setMandados(r.data)).catch(() => {});
    }, [])
  );

  return (
    <View style={styles.container}>
      {mandados.length === 0 ? (
        <Text style={styles.empty}>No tienes mandados activos</Text>
      ) : (
        <FlatList
          data={mandados}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => nav.navigate('MandadoDetail', { mandadoId: item.id })}>
              <Text style={styles.title}>{item.titulo}</Text>
              <Text style={styles.subtitle}>{item.tipo} · {item.estado}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  empty: { textAlign: 'center', marginTop: 40, color: '#666', fontSize: 16 },
  card: { padding: 16, backgroundColor: '#f9f9f9', borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#eee' },
  title: { fontSize: 16, fontWeight: '600' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
});
