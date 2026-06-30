import { Usuario, Mandado, MandadoDetalle, Oferta, Mensaje } from './types';

// ponytail: hardcoded base URL — env var if multi-env needed
const BASE_URL = 'http://10.0.2.2:3000/api/v1';

let _token: string | null = null;

export function setToken(token: string | null) {
  _token = token;
}

export function getToken(): string | null {
  return _token;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (_token) headers['Authorization'] = `Bearer ${_token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const body = await res.json();
  if (!res.ok) throw { status: res.status, error: body.error || 'Error desconocido' };
  return body;
}

export const api = {
  auth: {
    register: (data: { nombre_completo: string; telefono: string; correo_electronico?: string }) =>
      request<{ id: string; mensaje: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    verifyOtp: (data: { telefono: string; codigo: string }) =>
      request<{ token: string; refresh_token: string; usuario: Usuario }>('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    resendOtp: (data: { telefono: string }) =>
      request<{ mensaje: string }>('/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    refresh: (refreshToken: string) =>
      request<{ token: string; refresh_token: string }>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      }),
    logout: (refreshToken: string) =>
      request<{ mensaje: string }>('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      }),
    verifyIdentity: (formData: FormData) =>
      request<{ estado: string; mensaje: string }>('/auth/verify-identity', {
        method: 'POST',
        body: formData,
        headers: {}, // let fetch set Content-Type for FormData
      }),
    verificationStatus: () =>
      request<{ estado: string; documento_recibido: boolean; foto_vivo_recibida: boolean; mensaje: string }>(
        '/auth/verification-status',
      ),
    deleteAccount: () =>
      request<{ mensaje: string }>('/auth/cuenta', { method: 'DELETE' }),
  },
  mandados: {
    list: (params: { lat: number; lng: number; radio_km?: number; tipo?: string; estado?: string; page?: number; limit?: number }) => {
      const q = new URLSearchParams();
      q.set('lat', String(params.lat));
      q.set('lng', String(params.lng));
      if (params.radio_km) q.set('radio_km', String(params.radio_km));
      if (params.tipo) q.set('tipo', params.tipo);
      if (params.estado) q.set('estado', params.estado);
      if (params.page) q.set('page', String(params.page));
      if (params.limit) q.set('limit', String(params.limit));
      return request<{ data: Mandado[]; pagination: { page: number; limit: number; total: number } }>(
        `/mandados?${q}`,
      );
    },
    getById: (id: string) =>
      request<MandadoDetalle>(`/mandados/${id}`),
    create: (data: {
      titulo: string;
      descripcion: string;
      tipo: string;
      ubicacion_recogida: { lat: number; lng: number; direccion: string };
      ubicacion_entrega: { lat: number; lng: number; direccion: string };
      fecha_hora_limite: string;
    }) =>
      request<{ id: string; estado: string; creado_en: string }>('/mandados', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateEstado: (id: string, estado: string) =>
      request<{ id: string; estado: string; actualizado_en: string }>(`/mandados/${id}/estado`, {
        method: 'PATCH',
        body: JSON.stringify({ estado }),
      }),
    misMandados: () =>
      request<{ data: Mandado[] }>('/mandados/mis-mandados'),
  },
  ofertas: {
    create: (mandadoId: string, monto_ofertado: number) =>
      request<{ id: string; estado: string; creado_en: string }>(`/mandados/${mandadoId}/ofertas`, {
        method: 'POST',
        body: JSON.stringify({ monto_ofertado }),
      }),
    listByMandado: (mandadoId: string) =>
      request<{ data: Oferta[] }>(`/mandados/${mandadoId}/ofertas`),
    patch: (id: string, accion: string) =>
      request<{ mensaje: string; contacto_mandadero?: { nombre_completo: string; telefono: string } }>(
        `/ofertas/${id}`,
        { method: 'PATCH', body: JSON.stringify({ accion }) },
      ),
    misOfertas: () =>
      request<{ data: Oferta[] }>('/ofertas/mis-ofertas'),
  },
  favoritos: {
    create: (id_mandadero: string) =>
      request<{ id: string; id_mandadero: string; creado_en: string }>('/favoritos', {
        method: 'POST',
        body: JSON.stringify({ id_mandadero }),
      }),
    delete: (id_mandadero: string) =>
      request<{ mensaje: string }>(`/favoritos/${id_mandadero}`, { method: 'DELETE' }),
  },
  mensajes: {
    list: (mandadoId: string) =>
      request<{ mensajes: Mensaje[]; can_escribir: boolean }>(`/mandados/${mandadoId}/mensajes`),
    send: (mandadoId: string, texto: string) =>
      request<{ id: string; creado_en: string }>(`/mandados/${mandadoId}/mensajes`, {
        method: 'POST',
        body: JSON.stringify({ texto }),
      }),
  },
  calificaciones: {
    create: (data: { id_mandado: string; id_calificado: string; puntuacion: number; comentario?: string }) =>
      request<{ id: string; creado_en: string }>('/calificaciones', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
};
