import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import RegisterScreen from '../screens/RegisterScreen';
import VerifyOtpScreen from '../screens/VerifyOtpScreen';
import VerifyIdentityScreen from '../screens/VerifyIdentityScreen';
import HomeScreen from '../screens/HomeScreen';
import CreateMandadoScreen from '../screens/CreateMandadoScreen';
import MandadoDetailScreen from '../screens/MandadoDetailScreen';
import MisMandadosScreen from '../screens/MisMandadosScreen';
import MisOfertasScreen from '../screens/MisOfertasScreen';
import ChatScreen from '../screens/ChatScreen';
import RateScreen from '../screens/RateScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type AuthStackParamList = {
  Register: { telefono?: string } | undefined;
  VerifyOtp: { telefono: string };
  VerifyIdentity: undefined;
};

export type MainStackParamList = {
  Home: undefined;
  CreateMandado: undefined;
  MandadoDetail: { mandadoId: string };
  MisMandados: undefined;
  MisOfertas: undefined;
  Chat: { mandadoId: string };
  Rate: { mandadoId: string; idCalificado: string; nombreCalificado: string };
  Profile: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
      <AuthStack.Screen name="VerifyIdentity" component={VerifyIdentityScreen} />
    </AuthStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <MainStack.Navigator>
      <MainStack.Screen name="Home" component={HomeScreen} options={{ title: 'Mandados cerca' }} />
      <MainStack.Screen name="CreateMandado" component={CreateMandadoScreen} options={{ title: 'Nuevo mandado' }} />
      <MainStack.Screen name="MandadoDetail" component={MandadoDetailScreen} options={{ title: 'Detalle' }} />
      <MainStack.Screen name="MisMandados" component={MisMandadosScreen} options={{ title: 'Mis mandados' }} />
      <MainStack.Screen name="MisOfertas" component={MisOfertasScreen} options={{ title: 'Mis ofertas' }} />
      <MainStack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />
      <MainStack.Screen name="Rate" component={RateScreen} options={{ title: 'Calificar' }} />
      <MainStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </MainStack.Navigator>
  );
}

export default function AppNavigator() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {token ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
