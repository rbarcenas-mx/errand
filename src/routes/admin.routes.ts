import { Router, Request, Response } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { verificationService } from '../services/verification.service';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

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
    logger.error({ error }, 'Error al listar verificaciones pendientes');
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

adminRoutes.get('/denuncias-pendientes', async (_req: Request, res: Response) => {
  try {
    const denuncias = await prisma.denuncia.findMany({
      where: { estado: 'pendiente' },
      orderBy: { creado_en: 'asc' },
      include: {
        denunciante: { select: { id: true, nombre_completo: true, telefono: true } },
        denunciado: { select: { id: true, nombre_completo: true, telefono: true } },
        mandado: { select: { id: true, titulo: true, estado: true } },
      },
    });

    res.json({ denuncias, total: denuncias.length });
  } catch (error) {
    logger.error({ error }, 'Error al listar denuncias pendientes');
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

adminRoutes.post('/denuncias/:id/resolver', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { accion } = req.body;

    if (!accion || !['rechazar_usuario', 'desestimar'].includes(accion)) {
      res.status(400).json({
        error: 'ACCION_INVALIDA',
        message: 'La acción debe ser "rechazar_usuario" o "desestimar"',
      });
      return;
    }

    const denuncia = await prisma.denuncia.findUnique({
      where: { id },
      select: { id: true, id_denunciado: true, estado: true },
    });

    if (!denuncia) {
      res.status(404).json({ error: 'DENUNCIA_NO_ENCONTRADA', message: 'Denuncia no encontrada' });
      return;
    }

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

    await prisma.denuncia.update({
      where: { id },
      data: { estado: accion === 'rechazar_usuario' ? 'aceptada' : 'rechazada' },
    });

    res.json({
      mensaje: accion === 'rechazar_usuario' ? 'Usuario sancionado' : 'Denuncia desestimada',
    });
  } catch (error) {
    logger.error({ error }, 'Error al resolver denuncia');
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

adminRoutes.post('/verificaciones/:id/revisar', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { accion, motivo } = req.body;

    if (!accion || !['aprobar', 'rechazar'].includes(accion)) {
      res
        .status(400)
        .json({ error: 'ACCION_INVALIDA', message: 'La acción debe ser "aprobar" o "rechazar"' });
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
    logger.error({ error }, 'Error al revisar verificacion');
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
