type EstadoDenuncia = 'pendiente' | 'resuelta' | 'desestimada' | 'rechazada';

import { prisma } from '../config/database';

export class DenunciaRepository {
  async create(data: {
    id_denunciante: string;
    id_denunciado: string;
    id_mandado: string;
    motivo: string;
    descripcion: string;
  }) {
    return prisma.denuncia.create({ data });
  }

  async findPendientes(skip = 0, take = 50) {
    return prisma.denuncia.findMany({
      where: { estado: 'pendiente' },
      orderBy: { creado_en: 'asc' },
      skip,
      take,
      include: {
        denunciante: { select: { id: true, nombre_completo: true, telefono: true } },
        denunciado: { select: { id: true, nombre_completo: true, telefono: true } },
        mandado: { select: { id: true, titulo: true } },
      },
    });
  }

  async updateEstado(id: string, estado: EstadoDenuncia, resolucion?: string) {
    return prisma.denuncia.update({
      where: { id },
      data: { estado, ...(resolucion ? { resolucion } : {}) },
    });
  }

  async findById(id: string) {
    return prisma.denuncia.findUnique({ where: { id } });
  }
}

export const denunciaRepository = new DenunciaRepository();
