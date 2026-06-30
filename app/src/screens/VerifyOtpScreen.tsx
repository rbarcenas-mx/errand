import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { api, setToken } from '../api';
import { useAuth } from '../context/AuthContext';
import { AuthStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'VerifyOtp'>;
type Route = RouteProp<AuthStackParamList, 'VerifyOtp'>;

export default function VerifyOtpScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { login } = useAuth();
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleVerify() {
    if (!codigo.trim()) return;
    setLoading(true);
    try {
      const res = await api.auth.verifyOtp({
        telefono: route.params.telefono,
        codigo: codigo.trim(),
      });
      await login(res.token, res.refresh_token, res.usuario);
      if (res.usuario.estado_verificacion === 'pendiente') {
        nav.navigate('VerifyIdentity');
      }
    } catch (err: any) {
      Alert.alert('Error', err.error || 'Código inválido');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    try {
      await api.auth.resendOtp({ telefono: route.params.telefono });
      Alert.alert('Reenviado', 'Nuevo código enviado vía SMS');
    } catch (err: any) {
      Alert.alert('Error', err.error || 'No se pudo reenviar');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verificar código</Text>
      <Text style={styles.subtitle}>Enviamos un código SMS a {route.params.telefono}</Text>
      <TextInput
        style={styles.input}
        placeholder="000000"
        value={codigo}
        onChangeText={setCodigo}
        keyboardType="number-pad"
        maxLength={6}
      />
      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleVerify} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Verificando...' : 'Verificar'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.linkButton} onPress={handleResend}>
        <Text style={styles.linkText}>Reenviar código</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 24, textAlign: 'center' },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 24,
    marginBottom: 12, backgroundColor: '#f9f9f9', textAlign: 'center', letterSpacing: 8,
  },
  button: { backgroundColor: '#007AFF', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  linkButton: { marginTop: 16, alignItems: 'center' },
  linkText: { color: '#007AFF', fontSize: 14 },
});
