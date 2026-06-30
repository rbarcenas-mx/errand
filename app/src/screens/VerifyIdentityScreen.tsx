import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../api';

export default function VerifyIdentityScreen() {
  const [ine, setIne] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function pickImage(type: 'ine' | 'selfie') {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      if (type === 'ine') setIne(result.assets[0].uri);
      else setSelfie(result.assets[0].uri);
    }
  }

  async function handleSubmit() {
    if (!ine || !selfie) {
      Alert.alert('Error', 'Selecciona ambas fotos');
      return;
    }
    setLoading(true);
    try {
      const form = new FormData();
      form.append('foto_ine', { uri: ine, type: 'image/jpeg', name: 'ine.jpg' } as any);
      form.append('foto_vivo', { uri: selfie, type: 'image/jpeg', name: 'selfie.jpg' } as any);
      await api.auth.verifyIdentity(form);
      Alert.alert('Enviado', 'Tus documentos están en revisión');
    } catch (err: any) {
      Alert.alert('Error', err.error || 'No se pudieron enviar los documentos');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verificar identidad</Text>
      <Text style={styles.subtitle}>Sube tu INE (foto frontal) y una selfie</Text>

      <TouchableOpacity style={styles.photoButton} onPress={() => pickImage('ine')}>
        {ine ? (
          <Image source={{ uri: ine }} style={styles.photo} />
        ) : (
          <Text style={styles.photoText}>INE frontal</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.photoButton} onPress={() => pickImage('selfie')}>
        {selfie ? (
          <Image source={{ uri: selfie }} style={styles.photo} />
        ) : (
          <Text style={styles.photoText}>Selfie</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading || !ine || !selfie}
      >
        <Text style={styles.buttonText}>{loading ? 'Enviando...' : 'Enviar documentos'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 24, textAlign: 'center' },
  photoButton: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12,
    marginBottom: 12, alignItems: 'center', backgroundColor: '#f9f9f9', height: 120, justifyContent: 'center',
  },
  photo: { width: '100%', height: 100, borderRadius: 8 },
  photoText: { color: '#007AFF', fontSize: 16 },
  button: { backgroundColor: '#007AFF', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
