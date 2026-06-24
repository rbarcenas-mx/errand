import { prisma } from '../config/database';

export class CalificacionRepository {
  async create(data: {
    id_mandado: string;
    id_calificador: string;
    id_calificado: string;
    puntuacion: number;
    comentario?: string;
  }) {
    return prisma.calificacion.create({ data });
  }

  async findDuplicada(mandadoId: string, calificadorId: string) {
    return prisma.calificacion.findUnique({
      where: {
        id_mandado_id_calificador: {
          id_mandado: mandadoId,
          id_calificador: calificadorId,
        },
      },
    });
  }
}

export const calificacionRepository = new CalificacionRepository();
