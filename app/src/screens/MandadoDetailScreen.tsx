import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from '../api';
import { MandadoDetalle, Oferta } from '../types';
import { MainStackParamList } from '../navigation/AppNavigator';

type Route = RouteProp<MainStackParamList, 'MandadoDetail'>;
type Nav = NativeStackNavigationProp<MainStackParamList, 'MandadoDetail'>;

export default function MandadoDetailScreen() {
  const route = useRoute<Route>();
  const nav = useNavigation<Nav>();
  const [mandado, setMandado] = useState<MandadoDetalle | null>(null);
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [monto, setMonto] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [m, o] = await Promise.all([
        api.mandados.getById(route.params.mandadoId),
        api.ofertas.listByMandado(route.params.mandadoId),
      ]);
      setMandado(m);
      setOfertas(o.data);
    } catch (err: any) {
      Alert.alert('Error', err.error || 'No se pudo cargar');
    } finally {
      setLoading(false);
    }
  }

  async function handleSendOffer() {
    if (!monto.trim()) return;
    try {
      await api.ofertas.create(route.params.mandadoId, parseFloat(monto));
      Alert.alert('Oferta enviada', 'Espera la respuesta del solicitante');
      setMonto('');
      loadData();
    } catch (err: any) {
      Alert.alert('Error', err.error || 'No se pudo enviar la oferta');
    }
  }

  async function handleAccionOferta(ofertaId: string, accion: string) {
    try {
      await api.ofertas.patch(ofertaId, accion);
      loadData();
    } catch (err: any) {
      Alert.alert('Error', err.error || 'No se pudo procesar');
    }
  }

  async function toggleFavorito(mandaderoId: string, esFavorito: boolean) {
    try {
      if (esFavorito) await api.favoritos.delete(mandaderoId);
      else await api.favoritos.create(mandaderoId);
      loadData();
    } catch (err: any) {
      Alert.alert('Error', err.error || 'No se pudo actualizar favorito');
    }
  }

  if (loading || !mandado) return <Text style={{ padding: 24 }}>Cargando...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{mandado.titulo}</Text>
      <Text style={styles.desc}>{mandado.descripcion}</Text>
      <Text style={styles.info}>Tipo: {mandado.tipo}</Text>
      <Text style={styles.info}>Estado: {mandado.estado}</Text>
      <Text style={styles.info}>Límite: {new Date(mandado.fecha_hora_limite).toLocaleString()}</Text>

      {mandado.estado === 'publicado' && (
        <View style={styles.offerBox}>
          <TextInput style={styles.input} placeholder="Monto a ofertar ($)" value={monto} onChangeText={setMonto} keyboardType="decimal-pad" />
          <TouchableOpacity style={styles.button} onPress={handleSendOffer}>
            <Text style={styles.buttonText}>Enviar oferta</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.sectionTitle}>Ofertas ({ofertas.length})</Text>
      <FlatList
        data={ofertas}
        keyExtractor={(o) => o.id}
        renderItem={({ item }) => (
          <View style={styles.offerCard}>
            <View style={styles.offerHeader}>
              <Text style={styles.offerName}>{item.mandadero?.nombre_completo}</Text>
              <TouchableOpacity onPress={() => item.mandadero && toggleFavorito(item.mandadero.id, item.es_favorito || false)}>
                <Text style={styles.favIcon}>{item.es_favorito ? '★' : '☆'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.offerMonto}>${Number(item.monto_ofertado).toFixed(2)}</Text>
            <Text style={styles.offerEstado}>Estado: {item.estado}</Text>
            {item.estado === 'pendiente' && (
              <View style={styles.acciones}>
                <TouchableOpacity style={styles.btnAceptar} onPress={() => handleAccionOferta(item.id, 'aceptada')}>
                  <Text style={styles.btnText}>Aceptar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnRechazar} onPress={() => handleAccionOferta(item.id, 'rechazada')}>
                  <Text style={styles.btnText}>Rechazar</Text>
                </TouchableOpacity>
              </View>
            )}
            {item.estado === 'aceptada' && (
              <TouchableOpacity style={styles.chatBtn} onPress={() => nav.navigate('Chat', { mandadoId: mandado.id })}>
                <Text style={styles.buttonText}>Ir al chat</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      {mandado.estado === 'completado' && ofertas.find((o) => o.estado === 'aceptada') && (
        <TouchableOpacity
          style={styles.rateBtn}
          onPress={() => {
            const oferta = ofertas.find((o) => o.estado === 'aceptada');
            if (oferta && oferta.mandadero) {
              nav.navigate('Rate', {
                mandadoId: mandado.id,
                idCalificado: oferta.mandadero.id,
                nombreCalificado: oferta.mandadero.nombre_completo,
              });
            }
          }}
        >
          <Text style={styles.buttonText}>Calificar mandadero</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  desc: { fontSize: 14, color: '#333', marginBottom: 12 },
  info: { fontSize: 14, color: '#666', marginBottom: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  offerBox: { flexDirection: 'row', gap: 8, marginVertical: 12 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 16 },
  button: { backgroundColor: '#007AFF', borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  offerCard: { padding: 12, backgroundColor: '#f9f9f9', borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#eee' },
  offerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  offerName: { fontSize: 14, fontWeight: '600' },
  favIcon: { fontSize: 20, color: '#FFD700' },
  offerMonto: { fontSize: 16, fontWeight: '700', marginVertical: 4 },
  offerEstado: { fontSize: 12, color: '#666' },
  acciones: { flexDirection: 'row', gap: 8, marginTop: 8 },
  btnAceptar: { backgroundColor: '#34C759', borderRadius: 6, paddingHorizontal: 16, paddingVertical: 8 },
  btnRechazar: { backgroundColor: '#FF3B30', borderRadius: 6, paddingHorizontal: 16, paddingVertical: 8 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  rateBtn: { backgroundColor: '#34C759', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  chatBtn: { backgroundColor: '#007AFF', borderRadius: 6, paddingHorizontal: 16, paddingVertical: 8, marginTop: 8, alignSelf: 'flex-start' },
});
