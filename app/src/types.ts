export interface Usuario {
  id: string;
  nombre_completo: string;
  telefono: string;
  rol: string;
  estado_verificacion: string;
}

export interface Mandado {
  id: string;
  titulo: string;
  tipo: string;
  estado: string;
  fecha_hora_limite: string;
  creado_en?: string;
}

export interface MandadoDetalle extends Mandado {
  descripcion: string;
  foto_url?: string;
  ubicacion_recogida: { lat: number; lng: number; direccion: string };
  ubicacion_entrega: { lat: number; lng: number; direccion: string };
  solicitante: { id: string; nombre_completo: string; puntuacion_promedio: number } | null;
  total_ofertas: number;
}

export interface Oferta {
  id: string;
  monto_ofertado: number;
  estado: string;
  creado_en: string;
  mandadero?: { id: string; nombre_completo: string; puntuacion_promedio: number; total_calificaciones: number };
  es_favorito?: boolean;
  mandado?: Mandado;
  solicitante?: { id: string; nombre_completo: string; puntuacion_promedio: number } | null;
}

export interface Mensaje {
  id: string;
  remitente_id: string;
  texto: string;
  leido: boolean;
  creado_en: string;
}

export interface Calificacion {
  id_mandado: string;
  id_calificado: string;
  puntuacion: number;
  comentario?: string;
}
