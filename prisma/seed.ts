import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Sembrando datos de prueba...');

  await prisma.$executeRawUnsafe('DELETE FROM denuncias');
  await prisma.$executeRawUnsafe('DELETE FROM calificaciones');
  await prisma.$executeRawUnsafe('DELETE FROM mensajes');
  await prisma.$executeRawUnsafe('DELETE FROM ofertas');
  await prisma.$executeRawUnsafe('DELETE FROM mandados');
  await prisma.$executeRawUnsafe('DELETE FROM refresh_tokens');
  await prisma.$executeRawUnsafe('DELETE FROM otp_codes');
  await prisma.$executeRawUnsafe('DELETE FROM usuarios');

  const usuario1 = await prisma.usuario.create({
    data: {
      nombre_completo: 'Juan Pérez',
      telefono: '+524421234567',
      correo_electronico: 'juan@ejemplo.com',
      estado_verificacion: 'aprobado',
      rol: 'ambos',
      ubicacion_lat: 20.588,
      ubicacion_lng: -100.389,
    },
  });

  const usuario2 = await prisma.usuario.create({
    data: {
      nombre_completo: 'María López',
      telefono: '+524421234568',
      correo_electronico: 'maria@ejemplo.com',
      estado_verificacion: 'aprobado',
      rol: 'ambos',
      ubicacion_lat: 20.59,
      ubicacion_lng: -100.392,
    },
  });

  const mandado1 = await prisma.mandado.create({
    data: {
      id_solicitante: usuario1.id,
      titulo: 'Comprar tortillas y frijoles',
      descripcion: 'Necesito 1kg de tortillas de maíz, paquete de 500g de frijoles y 1L de leche',
      tipo: 'compra',
      ubicacion_recogida_lat: 20.588,
      ubicacion_recogida_lng: -100.389,
      direccion_recogida: 'Av. Principal 123, Centro, Querétaro',
      ubicacion_entrega_lat: 20.59,
      ubicacion_entrega_lng: -100.392,
      direccion_entrega: 'Calle Secundaria 456, Centro, Querétaro',
      fecha_hora_limite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      estado: 'publicado',
    },
  });

  await prisma.oferta.create({
    data: {
      id_mandado: mandado1.id,
      id_mandadero: usuario2.id,
      monto_ofertado: 50.0,
      estado: 'pendiente',
    },
  });

  console.log('Datos de prueba sembrados correctamente.');
  console.log(`  Usuarios: ${usuario1.nombre_completo}, ${usuario2.nombre_completo}`);
  console.log(`  Mandado: ${mandado1.titulo}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
