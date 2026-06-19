import { Request, Response } from 'express';
import { z } from 'zod';
import { mandadoRepository } from '../repositories/mandado.repository';
import { logger } from '../utils/logger';

const createMandadoSchema = z.object({
  titulo: z.string().min(5).max(100),
  descripcion: z.string().min(10),
  tipo: z.enum(['compra', 'tramite']),
  ubicacion_recogida: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    direccion: z.string().min(5),
  }),
  ubicacion_entrega: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    direccion: z.string().min(5),
  }),
  fecha_hora_limite: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Fecha inválida',
  }),
});

const listMandadosSchema = z.object({
  lat: z.string().transform(Number).pipe(z.number().min(-90).max(90)),
  lng: z.string().transform(Number).pipe(z.number().min(-180).max(180)),
  radio_km: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 10))
    .pipe(z.number().min(0.1).max(50)),
  tipo: z.enum(['compra', 'tramite']).optional(),
  estado: z.string().optional().default('publicado'),
  page: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 1))
    .pipe(z.number().int().min(1)),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 20))
    .pipe(z.number().int().min(1).max(100)),
});

const updateEstadoSchema = z.object({
  estado: z.enum(['completado', 'cancelado']),
});

export class MandadoController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      if (!req.usuario) {
        res.status(401).json({ error: 'Autenticación requerida' });
        return;
      }

      const data = createMandadoSchema.parse(req.body);

      if (new Date(data.fecha_hora_limite) <= new Date()) {
        res.status(400).json({ error: 'La fecha límite debe ser futura' });
        return;
      }

      const mandado = await mandadoRepository.create({
        id_solicitante: req.usuario.sub,
        titulo: data.titulo,
        descripcion: data.descripcion,
        tipo: data.tipo,
        ubicacion_recogida_lat: data.ubicacion_recogida.lat,
        ubicacion_recogida_lng: data.ubicacion_recogida.lng,
        direccion_recogida: data.ubicacion_recogida.direccion,
        ubicacion_entrega_lat: data.ubicacion_entrega.lat,
        ubicacion_entrega_lng: data.ubicacion_entrega.lng,
        direccion_entrega: data.ubicacion_entrega.direccion,
        fecha_hora_limite: new Date(data.fecha_hora_limite),
      });

      res.status(201).json({
        id: mandado.id,
        estado: mandado.estado,
        creado_en: mandado.creado_en,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(422).json({ error: 'Datos inválidos', detalles: error.errors });
        return;
      }
      logger.error({ error }, 'Error al crear mandado');
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const query = listMandadosSchema.parse(req.query);

      const result = await mandadoRepository.findNearby(
        query.lat,
        query.lng,
        query.radio_km,
        query.estado,
        query.tipo,
        query.page,
        query.limit,
      );

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(422).json({ error: 'Datos inválidos', detalles: error.errors });
        return;
      }
      logger.error({ error }, 'Error al listar mandados');
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const mandado = await mandadoRepository.findById(req.params.id);

      if (!mandado) {
        res.status(404).json({ error: 'Mandado no encontrado' });
        return;
      }

      res.status(200).json({
        id: mandado.id,
        solicitante: {
          id: mandado.solicitante.id,
          nombre_completo: mandado.solicitante.nombre_completo,
          puntuacion_promedio: mandado.solicitante.puntuacion_promedio,
        },
        titulo: mandado.titulo,
        descripcion: mandado.descripcion,
        tipo: mandado.tipo,
        foto_url: mandado.foto_url,
        ubicacion_recogida: {
          lat: mandado.ubicacion_recogida_lat,
          lng: mandado.ubicacion_recogida_lng,
          direccion: mandado.direccion_recogida,
        },
        ubicacion_entrega: {
          lat: mandado.ubicacion_entrega_lat,
          lng: mandado.ubicacion_entrega_lng,
          direccion: mandado.direccion_entrega,
        },
        fecha_hora_limite: mandado.fecha_hora_limite,
        estado: mandado.estado,
        total_ofertas: mandado.ofertas.length,
        creado_en: mandado.creado_en,
      });
    } catch (error) {
      logger.error({ error }, 'Error al obtener mandado');
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async updateEstado(req: Request, res: Response): Promise<void> {
    try {
      if (!req.usuario) {
        res.status(401).json({ error: 'Autenticación requerida' });
        return;
      }

      const data = updateEstadoSchema.parse(req.body);
      const mandadoId = req.params.id;

      const mandado = await mandadoRepository.findById(mandadoId);
      if (!mandado) {
        res.status(404).json({ error: 'Mandado no encontrado' });
        return;
      }

      if (data.estado === 'completado') {
        if (mandado.estado !== 'en_progreso') {
          res.status(409).json({
            error: 'Solo mandados en progreso pueden ser completados',
          });
          return;
        }
        const ofertaAceptada = mandado.ofertas.find((o) => o.estado === 'aceptada');
        if (!ofertaAceptada || ofertaAceptada.id_mandadero !== req.usuario.sub) {
          res.status(403).json({ error: 'Solo el mandadero asignado puede completar el mandado' });
          return;
        }
      }

      if (data.estado === 'cancelado') {
        if (mandado.estado === 'completado') {
          res.status(409).json({ error: 'No se puede cancelar un mandado completado' });
          return;
        }
        if (mandado.id_solicitante !== req.usuario.sub) {
          res.status(403).json({ error: 'Solo el solicitante puede cancelar el mandado' });
          return;
        }
      }

      const updated = await mandadoRepository.updateEstado(mandadoId, data.estado);

      res.status(200).json({
        id: updated.id,
        estado: updated.estado,
        actualizado_en: updated.actualizado_en || new Date(),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(422).json({ error: 'Datos inválidos', detalles: error.errors });
        return;
      }
      logger.error({ error }, 'Error al actualizar estado de mandado');
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

export const mandadoController = new MandadoController();
