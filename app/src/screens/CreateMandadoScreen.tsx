import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../api';

export default function CreateMandadoScreen() {
  const nav = useNavigation();
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState<'compra' | 'tramite'>('compra');
  const [dirRecogida, setDirRecogida] = useState('');
  const [dirEntrega, setDirEntrega] = useState('');
  const [fechaLimite, setFechaLimite] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!titulo.trim() || !descripcion.trim() || !dirRecogida.trim() || !dirEntrega.trim() || !fechaLimite.trim()) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }
    setLoading(true);
    try {
      await api.mandados.create({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        tipo,
        ubicacion_recogida: { lat: 20.588, lng: -100.389, direccion: dirRecogida.trim() }, // ponytail: hardcoded coords — add Nominatim geocoding when needed
        ubicacion_entrega: { lat: 20.590, lng: -100.392, direccion: dirEntrega.trim() },
        fecha_hora_limite: new Date(fechaLimite.trim()).toISOString(),
      });
      Alert.alert('Creado', 'Mandado publicado exitosamente');
      nav.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.error || 'No se pudo crear el mandado');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container}>
        <TextInput style={styles.input} placeholder="Título" value={titulo} onChangeText={setTitulo} />
        <TextInput style={[styles.input, styles.textArea]} placeholder="Descripción" value={descripcion} onChangeText={setDescripcion} multiline />

        <View style={styles.tipoRow}>
          <TouchableOpacity style={[styles.tipoBtn, tipo === 'compra' && styles.tipoActive]} onPress={() => setTipo('compra')}>
            <Text style={[styles.tipoText, tipo === 'compra' && styles.tipoTextActive]}>Compra</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tipoBtn, tipo === 'tramite' && styles.tipoActive]} onPress={() => setTipo('tramite')}>
            <Text style={[styles.tipoText, tipo === 'tramite' && styles.tipoTextActive]}>Trámite</Text>
          </TouchableOpacity>
        </View>

        <TextInput style={styles.input} placeholder="Dirección de recogida" value={dirRecogida} onChangeText={setDirRecogida} />
        <TextInput style={styles.input} placeholder="Dirección de entrega" value={dirEntrega} onChangeText={setDirEntrega} />
        <TextInput style={styles.input} placeholder="Fecha límite (YYYY-MM-DD HH:MM)" value={fechaLimite} onChangeText={setFechaLimite} />

        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleCreate} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Publicando...' : 'Publicar mandado'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 12, backgroundColor: '#f9f9f9' },
  textArea: { height: 80, textAlignVertical: 'top' },
  tipoRow: { flexDirection: 'row', marginBottom: 12, gap: 8 },
  tipoBtn: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  tipoActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  tipoText: { fontSize: 14, color: '#666' },
  tipoTextActive: { color: '#fff', fontWeight: '600' },
  button: { backgroundColor: '#007AFF', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8, marginBottom: 40 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
