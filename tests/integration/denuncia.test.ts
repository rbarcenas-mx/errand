import { DenunciaRepository } from '../../src/repositories/denuncia.repository';

jest.mock('../../src/config/database', () => ({
  prisma: {
    denuncia: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

const { prisma } = require('../../src/config/database') as {
  prisma: { denuncia: Record<string, jest.Mock> };
};

const repo = new DenunciaRepository();

describe('DenunciaRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const data = {
      id_denunciante: 'user-1',
      id_denunciado: 'user-2',
      id_mandado: 'mandado-1',
      motivo: 'acoso',
      descripcion: 'Descripcion detallada',
    };

    it('should create a denuncia with valid data', async () => {
      prisma.denuncia.create.mockResolvedValue({ id: 'denuncia-1', ...data, estado: 'pendiente' });

      const result = await repo.create(data);

      expect(prisma.denuncia.create).toHaveBeenCalledWith({ data });
      expect(result.id).toBe('denuncia-1');
      expect(result.estado).toBe('pendiente');
    });

    it('should reject self-denuncia (id_denunciante === id_denunciado)', async () => {
      prisma.denuncia.create.mockRejectedValue(new Error('No puedes denunciarte a ti mismo'));

      await expect(repo.create({ ...data, id_denunciado: 'user-1' })).rejects.toThrow(
        'No puedes denunciarte a ti mismo',
      );
    });

    it('should throw on Prisma error', async () => {
      prisma.denuncia.create.mockRejectedValue(new Error('Database connection failed'));

      await expect(repo.create(data)).rejects.toThrow('Database connection failed');
    });
  });

  describe('findPendientes', () => {
    it('should return pending denuncias ordered by creation date', async () => {
      const mockDenuncias = [
        {
          id: 'd1',
          estado: 'pendiente',
          denunciante: { id: 'u1', nombre_completo: 'A', telefono: '+52' },
          denunciado: { id: 'u2', nombre_completo: 'B', telefono: '+52' },
          mandado: { id: 'm1', titulo: 'Test' },
        },
        {
          id: 'd2',
          estado: 'pendiente',
          denunciante: { id: 'u3', nombre_completo: 'C', telefono: '+52' },
          denunciado: { id: 'u4', nombre_completo: 'D', telefono: '+52' },
          mandado: { id: 'm2', titulo: 'Test 2' },
        },
      ];
      prisma.denuncia.findMany.mockResolvedValue(mockDenuncias);

      const result = await repo.findPendientes();

      expect(prisma.denuncia.findMany).toHaveBeenCalledWith({
        where: { estado: 'pendiente' },
        orderBy: { creado_en: 'asc' },
        skip: 0,
        take: 50,
        include: {
          denunciante: { select: { id: true, nombre_completo: true, telefono: true } },
          denunciado: { select: { id: true, nombre_completo: true, telefono: true } },
          mandado: { select: { id: true, titulo: true } },
        },
      });
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no pending denuncias', async () => {
      prisma.denuncia.findMany.mockResolvedValue([]);

      const pendientes = await repo.findPendientes();

      expect(pendientes).toEqual([]);
    });
  });

  describe('updateEstado', () => {
    it('should update estado and resolucion', async () => {
      prisma.denuncia.update.mockResolvedValue({
        id: 'd1',
        estado: 'resuelta',
        resolucion: 'rechazar_usuario',
      });

      const result = await repo.updateEstado('d1', 'resuelta', 'rechazar_usuario');

      expect(prisma.denuncia.update).toHaveBeenCalledWith({
        where: { id: 'd1' },
        data: { estado: 'resuelta', resolucion: 'rechazar_usuario' },
      });
      expect(result.estado).toBe('resuelta');
    });

    it('should update estado without resolucion', async () => {
      prisma.denuncia.update.mockResolvedValue({ id: 'd1', estado: 'desestimada' });

      await repo.updateEstado('d1', 'desestimada');

      expect(prisma.denuncia.update).toHaveBeenCalledWith({
        where: { id: 'd1' },
        data: { estado: 'desestimada' },
      });
    });

    it('should throw when denuncia not found', async () => {
      prisma.denuncia.update.mockRejectedValue(new Error('Denuncia no encontrada'));

      await expect(repo.updateEstado('nonexistent', 'resuelta')).rejects.toThrow(
        'Denuncia no encontrada',
      );
    });
  });

  describe('findById', () => {
    it('should find denuncia by id', async () => {
      prisma.denuncia.findUnique.mockResolvedValue({ id: 'd1', estado: 'pendiente' });

      const result = await repo.findById('d1');

      expect(prisma.denuncia.findUnique).toHaveBeenCalledWith({ where: { id: 'd1' } });
      expect(result?.id).toBe('d1');
    });

    it('should return null for nonexistent id', async () => {
      prisma.denuncia.findUnique.mockResolvedValue(null);

      const result = await repo.findById('nonexistent');

      expect(result).toBeNull();
    });
  });
});
