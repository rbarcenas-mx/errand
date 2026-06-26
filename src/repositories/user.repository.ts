import { prisma } from '../config/database';

export class UserRepository {
  async findByTelefono(telefono: string) {
    return prisma.usuario.findUnique({ where: { telefono } });
  }

  async findById(id: string) {
    return prisma.usuario.findUnique({ where: { id } });
  }

  async create(data: { nombre_completo: string; telefono: string; correo_electronico?: string }) {
    return prisma.usuario.create({ data });
  }

  async updateVerificationStatus(
    id: string,
    estado_verificacion: string,
    foto_ine_url?: string,
    foto_vivo_url?: string,
  ) {
    return prisma.usuario.update({
      where: { id },
      data: {
        estado_verificacion,
        ...(foto_ine_url && { foto_ine_url }),
        ...(foto_vivo_url && { foto_vivo_url }),
      },
    });
  }

  async updateRating(id: string, puntuacion_promedio: number, total_calificaciones: number) {
    return prisma.usuario.update({
      where: { id },
      data: { puntuacion_promedio, total_calificaciones },
    });
  }
}

export const userRepository = new UserRepository();
