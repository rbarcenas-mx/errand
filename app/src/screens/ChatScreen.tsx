import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { Mensaje } from '../types';
import { MainStackParamList } from '../navigation/AppNavigator';

type Route = RouteProp<MainStackParamList, 'Chat'>;

// ponytail: polling instead of WebSocket — upgrade when real-time matters
const POLL_INTERVAL = 5000;

export default function ChatScreen() {
  const route = useRoute<Route>();
  const { usuario } = useAuth();
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState('');
  const [canEscribir, setCanEscribir] = useState(true);
  const flatRef = useRef<FlatList>(null);

  async function load() {
    try {
      const res = await api.mensajes.list(route.params.mandadoId);
      setMensajes(res.mensajes);
      setCanEscribir(res.can_escribir);
    } catch {}
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  async function send() {
    if (!texto.trim()) return;
    try {
      await api.mensajes.send(route.params.mandadoId, texto.trim());
      setTexto('');
      load();
    } catch (err: any) {
      Alert.alert('Error', err.error || 'No se pudo enviar');
    }
  }

  const userId = usuario?.id;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={100}>
      <FlatList
        ref={flatRef}
        data={mensajes}
        keyExtractor={(m) => m.id}
        style={styles.list}
        onContentSizeChange={() => flatRef.current?.scrollToEnd()}
        renderItem={({ item }) => {
          const isMine = item.remitente_id === userId;
          const isSystem = item.remitente_id !== userId && item.remitente_id !== '';
          return (
            <View style={[styles.bubble, isMine ? styles.myBubble : styles.otherBubble]}>
              <Text style={[styles.msgText, isMine ? styles.myMsgText : styles.otherMsgText]}>{item.texto}</Text>
              <Text style={[styles.msgTime, isMine ? styles.myMsgTime : styles.otherMsgTime]}>{new Date(item.creado_en).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          );
        }}
      />
      {canEscribir && (
        <View style={styles.inputRow}>
          <TextInput style={styles.input} value={texto} onChangeText={setTexto} placeholder="Escribe un mensaje..." />
          <TouchableOpacity style={styles.sendBtn} onPress={send}>
            <Text style={styles.sendText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, padding: 12 },
  bubble: { padding: 10, borderRadius: 8, marginBottom: 6, maxWidth: '80%' },
  myBubble: { backgroundColor: '#007AFF', alignSelf: 'flex-end' },
  otherBubble: { backgroundColor: '#e5e5ea', alignSelf: 'flex-start' },
  msgText: { fontSize: 15 },
  myMsgText: { color: '#fff' },
  otherMsgText: { color: '#000' },
  msgTime: { fontSize: 11, marginTop: 4 },
  myMsgTime: { color: 'rgba(255,255,255,0.7)', textAlign: 'right' },
  otherMsgTime: { color: '#999', textAlign: 'right' },
  inputRow: { flexDirection: 'row', padding: 8, borderTopWidth: 1, borderColor: '#ddd', backgroundColor: '#fff' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 15, marginRight: 8 },
  sendBtn: { backgroundColor: '#007AFF', borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center' },
  sendText: { color: '#fff', fontWeight: '600' },
});
