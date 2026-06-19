import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function listMensajes(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const usuarioId = (req as any).usuario?.id;
    const antesDe = req.query.antes_de as string | undefined;

    const mandado = await prisma.mandado.findUnique({
      where: { id },
      include: {
        ofertas: {
          where: { estado: 'aceptada' },
          take: 1,
        },
      },
    });

    if (!mandado) {
      return res.status(404).json({ error: 'MANDADO_NO_ENCONTRADO', message: 'Mandado no encontrado' });
    }

    const ofertaAceptada = mandado.ofertas[0];
    const esSolicitante = mandado.id_solicitante === usuarioId;
    const esMandadero = ofertaAceptada?.id_mandadero === usuarioId;

    if (!esSolicitante && !esMandadero) {
      return res.status(403).json({ error: 'NO_PARTICIPANTE', message: 'No eres participante de este mandado' });
    }

    const where: any = { id_mandado: id };
    if (antesDe) {
      where.creado_en = { lt: new Date(antesDe) };
    }

    const mensajes = await prisma.mensaje.findMany({
      where,
      orderBy: { creado_en: 'desc' },
      take: 50,
      select: {
        id: true,
        id_remitente: true,
        texto: true,
        leido: true,
        creado_en: true,
      },
    });

    const puedeEscribir = mandado.estado !== 'completado' && mandado.estado !== 'cancelado';

    await prisma.mensaje.updateMany({
      where: {
        id_mandado: id,
        id_remitente: { not: usuarioId },
        leido: false,
      },
      data: { leido: true },
    });

    res.json({ mensajes: mensajes.reverse(), can_escribir: puedeEscribir });
  } catch (error) {
    next(error);
  }
}

export async function createMensaje(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const usuarioId = (req as any).usuario?.id;
    const { texto } = req.body;

    if (!texto || texto.trim().length === 0) {
      return res.status(400).json({ error: 'MENSAJE_VACIO', message: 'El mensaje no puede estar vacío' });
    }
    if (texto.length > 1000) {
      return res.status(422).json({ error: 'TEXTO_EXCEDE_LIMITE', message: 'El texto excede 1000 caracteres' });
    }

    const mandado = await prisma.mandado.findUnique({
      where: { id },
      include: {
        ofertas: {
          where: { estado: 'aceptada' },
          take: 1,
        },
      },
    });

    if (!mandado) {
      return res.status(404).json({ error: 'MANDADO_NO_ENCONTRADO', message: 'Mandado no encontrado' });
    }

    if (mandado.estado === 'completado' || mandado.estado === 'cancelado') {
      return res.status(403).json({ error: 'CANAL_CERRADO', message: 'El canal de mensajería está cerrado' });
    }

    const ofertaAceptada = mandado.ofertas[0];
    if (!ofertaAceptada) {
      return res.status(403).json({ error: 'SIN_OFERTA_ACEPTADA', message: 'No hay una oferta aceptada para este mandado' });
    }

    const esSolicitante = mandado.id_solicitante === usuarioId;
    const esMandadero = ofertaAceptada.id_mandadero === usuarioId;
    if (!esSolicitante && !esMandadero) {
      return res.status(403).json({ error: 'NO_PARTICIPANTE', message: 'No eres participante de este mandado' });
    }

    const mensaje = await prisma.mensaje.create({
      data: {
        id_mandado: id,
        id_remitente: usuarioId,
        texto: texto.trim(),
      },
      select: { id: true, creado_en: true },
    });

    res.status(201).json(mensaje);
  } catch (error) {
    next(error);
  }
}
