import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api';

export default function ProfileScreen() {
  const { usuario, logout } = useAuth();
  const [verificacion, setVerificacion] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      api.auth.verificationStatus().then((r) => setVerificacion(r.estado)).catch(() => {});
    }, [])
  );

  async function handleDelete() {
    Alert.alert('Eliminar cuenta', '¿Estás seguro? Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          try {
            await api.auth.deleteAccount();
            await logout();
          } catch (err: any) {
            Alert.alert('Error', err.error || 'No se pudo eliminar la cuenta');
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{usuario?.nombre_completo}</Text>
      <Text style={styles.phone}>{usuario?.telefono}</Text>
      <Text style={styles.info}>Rol: {usuario?.rol}</Text>
      <Text style={styles.info}>
        Verificación: {verificacion ?? usuario?.estado_verificacion ?? 'desconocido'}
      </Text>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Text style={styles.deleteText}>Eliminar cuenta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  name: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  phone: { fontSize: 16, color: '#666', marginBottom: 16 },
  info: { fontSize: 14, color: '#333', marginBottom: 8 },
  logoutBtn: { backgroundColor: '#f9f9f9', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 32, borderWidth: 1, borderColor: '#ddd' },
  logoutText: { fontSize: 16, color: '#007AFF', fontWeight: '600' },
  deleteBtn: { marginTop: 12, alignItems: 'center' },
  deleteText: { fontSize: 14, color: '#FF3B30' },
});
