import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from '../api';
import { Oferta } from '../types';
import { MainStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<MainStackParamList, 'MisOfertas'>;

export default function MisOfertasScreen() {
  const nav = useNavigation<Nav>();
  const [ofertas, setOfertas] = useState<Oferta[]>([]);

  useFocusEffect(
    useCallback(() => {
      api.ofertas.misOfertas().then((r) => setOfertas(r.data)).catch(() => {});
    }, [])
  );

  const pendientes = ofertas.filter((o) => o.estado === 'pendiente');
  const activas = ofertas.filter((o) => o.estado === 'aceptada');

  return (
    <View style={styles.container}>
      {pendientes.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Pendientes ({pendientes.length})</Text>
          <FlatList
            data={pendientes}
            keyExtractor={(o) => o.id}
            renderItem={({ item }) => {
              const mandado = item.mandado;
              return (
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => mandado && nav.navigate('MandadoDetail', { mandadoId: mandado.id })}
                >
                  <Text style={styles.title}>{mandado?.titulo}</Text>
                  <Text style={styles.monto}>${Number(item.monto_ofertado).toFixed(2)}</Text>
                  <Text style={styles.estado}>Esperando respuesta</Text>
                </TouchableOpacity>
              );
            }}
          />
        </>
      )}

      {activas.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Activas ({activas.length})</Text>
          <FlatList
            data={activas}
            keyExtractor={(o) => o.id}
            renderItem={({ item }) => {
              const mandado = item.mandado;
              return (
                <View style={styles.card}>
                  <Text style={styles.title}>{mandado?.titulo}</Text>
                  <Text style={styles.estado}>Aceptada · En progreso</Text>
                  {mandado && (
                    <TouchableOpacity style={styles.chatBtn} onPress={() => nav.navigate('Chat', { mandadoId: mandado.id })}>
                      <Text style={styles.chatBtnText}>Ir al chat</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            }}
          />
        </>
      )}

      {ofertas.length === 0 && <Text style={styles.empty}>No has enviado ofertas</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8, marginTop: 8, color: '#333' },
  empty: { textAlign: 'center', marginTop: 40, color: '#666', fontSize: 16 },
  card: { padding: 12, backgroundColor: '#f9f9f9', borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#eee' },
  title: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  monto: { fontSize: 16, fontWeight: '700', color: '#007AFF', marginBottom: 2 },
  estado: { fontSize: 12, color: '#666' },
  chatBtn: { backgroundColor: '#007AFF', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6, marginTop: 8, alignSelf: 'flex-start' },
  chatBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
