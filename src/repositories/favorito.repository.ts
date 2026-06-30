import { prisma } from '../config/database';

export class FavoritoRepository {
  async findBySolicitanteAndMandadero(idSolicitante: string, idMandadero: string) {
    return prisma.favorito.findUnique({
      where: {
        id_solicitante_id_mandadero: {
          id_solicitante: idSolicitante,
          id_mandadero: idMandadero,
        },
      },
    });
  }

  async create(idSolicitante: string, idMandadero: string) {
    return prisma.favorito.create({
      data: { id_solicitante: idSolicitante, id_mandadero: idMandadero },
    });
  }

  async delete(id: string) {
    return prisma.favorito.delete({ where: { id } });
  }

  async mandaderoIdsBySolicitante(idSolicitante: string): Promise<Set<string>> {
    const favs = await prisma.favorito.findMany({
      where: { id_solicitante: idSolicitante },
      select: { id_mandadero: true },
    });
    return new Set(favs.map((f) => f.id_mandadero));
  }
}

export const favoritoRepository = new FavoritoRepository();
