import { Router, Request, Response } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { verificationService } from '../services/verification.service';
import { prisma } from '../config/database';

export const adminRoutes = Router();

adminRoutes.use(authenticate, requireAdmin);

adminRoutes.get('/verificaciones-pendientes', async (_req: Request, res: Response) => {
  try {
    const pendientes = await prisma.usuario.findMany({
      where: { estado_verificacion: 'pendiente_manual' },
      select: {
        id: true,
        nombre_completo: true,
        correo_electronico: true,
        telefono: true,
        foto_ine_url: true,
        foto_vivo_url: true,
        creado_en: true,
      },
      orderBy: { creado_en: 'asc' },
    });

    res.json({ verificaciones: pendientes, total: pendientes.length });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: 'ERROR_INTERNO', message: err.message });
  }
});

adminRoutes.get('/denuncias-pendientes', async (_req: Request, res: Response) => {
  try {
    interface DenunciaRow {
      id: string;
      id_denunciante: string;
      id_denunciado: string;
      id_mandado: string;
      motivo: string;
      descripcion: string;
      estado: string;
      creado_en: Date;
      denunciante_nombre: string;
      denunciante_telefono: string;
      denunciado_nombre: string;
      denunciado_telefono: string;
      mandado_titulo: string;
      mandado_estado: string;
    }
    const rows: DenunciaRow[] = await prisma.$queryRawUnsafe(
      `SELECT d.id, d.id_denunciante, d.id_denunciado, d.id_mandado, d.motivo, d.descripcion, d.estado, d.creado_en,
              denunciante.nombre_completo AS denunciante_nombre, denunciante.telefono AS denunciante_telefono,
              denunciado.nombre_completo AS denunciado_nombre, denunciado.telefono AS denunciado_telefono,
              m.titulo AS mandado_titulo, m.estado AS mandado_estado
       FROM denuncias d
       JOIN usuarios denunciante ON denunciante.id = d.id_denunciante
       JOIN usuarios denunciado ON denunciado.id = d.id_denunciado
       JOIN mandados m ON m.id = d.id_mandado
       WHERE d.estado = 'pendiente'
       ORDER BY d.creado_en ASC`,
    );

    const denuncias = rows.map((r) => ({
      id: r.id,
      motivo: r.motivo,
      descripcion: r.descripcion,
      creado_en: r.creado_en,
      denunciante: { id: r.id_denunciante, nombre_completo: r.denunciante_nombre, telefono: r.denunciante_telefono },
      denunciado: { id: r.id_denunciado, nombre_completo: r.denunciado_nombre, telefono: r.denunciado_telefono },
      mandado: { id: r.id_mandado, titulo: r.mandado_titulo, estado: r.mandado_estado },
    }));

    res.json({ denuncias, total: denuncias.length });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: 'ERROR_INTERNO', message: err.message });
  }
});

adminRoutes.post('/denuncias/:id/resolver', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { accion } = req.body;

    if (!accion || !['rechazar_usuario', 'desestimar'].includes(accion)) {
      res.status(400).json({ error: 'ACCION_INVALIDA', message: 'La acción debe ser "rechazar_usuario" o "desestimar"' });
      return;
    }

    const denuncias: Array<{ id: string; id_denunciado: string; estado: string }> = await prisma.$queryRawUnsafe(
      'SELECT id, id_denunciado, estado FROM denuncias WHERE id = $1',
      id,
    );

    if (denuncias.length === 0) {
      res.status(404).json({ error: 'DENUNCIA_NO_ENCONTRADA', message: 'Denuncia no encontrada' });
      return;
    }

    const denuncia = denuncias[0];

    if (denuncia.estado !== 'pendiente') {
      res.status(400).json({
        error: 'ESTADO_INVALIDO',
        message: `La denuncia está en estado "${denuncia.estado}"`,
      });
      return;
    }

    if (accion === 'rechazar_usuario') {
      await verificationService.revisarVerificacion(
        denuncia.id_denunciado,
        'rechazado',
        'Cuenta suspendida por reporte de incidente',
      );
    }

    await prisma.$executeRawUnsafe(
      'UPDATE denuncias SET estado = $1 WHERE id = $2',
      accion === 'rechazar_usuario' ? 'aceptada' : 'rechazada',
      id,
    );

    res.json({ mensaje: accion === 'rechazar_usuario' ? 'Usuario sancionado' : 'Denuncia desestimada' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: 'ERROR_INTERNO', message: err.message });
  }
});

adminRoutes.post('/verificaciones/:id/revisar', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { accion, motivo } = req.body;

    if (!accion || !['aprobar', 'rechazar'].includes(accion)) {
      res.status(400).json({ error: 'ACCION_INVALIDA', message: 'La acción debe ser "aprobar" o "rechazar"' });
      return;
    }

    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      res.status(404).json({ error: 'USUARIO_NO_ENCONTRADO', message: 'Usuario no encontrado' });
      return;
    }

    if (usuario.estado_verificacion !== 'pendiente_manual') {
      res.status(400).json({
        error: 'ESTADO_INVALIDO',
        message: `El usuario está en estado "${usuario.estado_verificacion}", no pendiente_manual`,
      });
      return;
    }

    const nuevoEstado = accion === 'aprobar' ? 'aprobado' : 'rechazado';
    const resultado = await verificationService.revisarVerificacion(id, nuevoEstado, motivo);

    res.json(resultado);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: 'ERROR_INTERNO', message: err.message });
  }
});
