import { prisma } from '../config/database';
import { Prisma } from '@prisma/client';

export class MandadoRepository {
  async create(data: {
    id_solicitante: string;
    titulo: string;
    descripcion: string;
    tipo: string;
    ubicacion_recogida_lat: number;
    ubicacion_recogida_lng: number;
    direccion_recogida: string;
    ubicacion_entrega_lat: number;
    ubicacion_entrega_lng: number;
    direccion_entrega: string;
    fecha_hora_limite: Date;
  }) {
    return prisma.mandado.create({ data });
  }

  async findById(id: string) {
    return prisma.mandado.findUnique({
      where: { id },
      include: {
        solicitante: {
          select: {
            id: true,
            nombre_completo: true,
            puntuacion_promedio: true,
            telefono: true,
          },
        },
        ofertas: true,
      },
    });
  }

  async findNearby(
    lat: number,
    lng: number,
    radioKm: number,
    estado: string = 'publicado',
    tipo?: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.MandadoWhereInput = {
      estado,
      fecha_hora_limite: { gt: new Date() },
      ...(tipo && { tipo }),
    };

    const [data, total] = await Promise.all([
      prisma.$queryRawUnsafe<
        Array<{
          id: string;
          titulo: string;
          tipo: string;
          ubicacion_recogida_lat: number;
          ubicacion_recogida_lng: number;
          ubicacion_entrega_lat: number;
          ubicacion_entrega_lng: number;
          distancia_km: number;
          fecha_hora_limite: Date;
          total_ofertas: number;
          creado_en: Date;
        }>
      >(
        `SELECT
          m.id,
          m.titulo,
          m.tipo,
          m.ubicacion_recogida_lat,
          m.ubicacion_recogida_lng,
          m.ubicacion_entrega_lat,
          m.ubicacion_entrega_lng,
          ST_Distance(
            m.ubicacion_recogida_lng::geometry,
            ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
          ) / 1000.0 AS distancia_km,
          m.fecha_hora_limite,
          CAST(COUNT(o.id) AS INTEGER) AS total_ofertas,
          m.creado_en
        FROM mandados m
        LEFT JOIN ofertas o ON o.id_mandado = m.id
        WHERE m.estado = $3
          AND m.fecha_hora_limite > NOW()
          ${tipo ? "AND m.tipo = $4" : ''}
          AND ST_DWithin(
            m.ubicacion_recogida_lng::geometry,
            ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
            ${radioKm} * 1000
          )
        GROUP BY m.id
        ORDER BY distancia_km ASC
        LIMIT ${limit} OFFSET ${skip}`,
        lng,
        lat,
        estado,
        ...(tipo ? [tipo] : []),
      ),
      prisma.mandado.count({ where }),
    ]);

    const totalCount = Number(total);

    return {
      data: data.map((row) => ({
        id: row.id,
        titulo: row.titulo,
        tipo: row.tipo,
        ubicacion_recogida: {
          lat: row.ubicacion_recogida_lat,
          lng: row.ubicacion_recogida_lng,
        },
        ubicacion_entrega: {
          lat: row.ubicacion_entrega_lat,
          lng: row.ubicacion_entrega_lng,
        },
        distancia_km: Math.round(Number(row.distancia_km) * 10) / 10,
        fecha_hora_limite: row.fecha_hora_limite,
        total_ofertas: row.total_ofertas,
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
      },
    };
  }

  async updateEstado(id: string, estado: string) {
    return prisma.mandado.update({
      where: { id },
      data: { estado },
    });
  }

  async findActiveBySolicitante(idSolicitante: string) {
    return prisma.mandado.findMany({
      where: {
        id_solicitante: idSolicitante,
        estado: { in: ['publicado', 'en_progreso'] },
      },
      orderBy: { creado_en: 'desc' },
    });
  }
}

export const mandadoRepository = new MandadoRepository();
