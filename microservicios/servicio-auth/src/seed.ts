import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const correo = process.env.DIRECTOR_EMAIL || 'director@escuela5estrellas.com';
  const contrasena = process.env.DIRECTOR_PASSWORD || 'admin123';
  const nombre_usuario = process.env.DIRECTOR_NAME || 'Director Principal';

  const existe = await prisma.usuario.findUnique({
    where: { correo }
  });

  if (existe) {
    console.log(`El usuario director (${correo}) ya existe.`);
    return;
  }

  const contrasenaHasheada = await bcrypt.hash(contrasena, 10);

  const director = await prisma.usuario.create({
    data: {
      nombre_usuario,
      correo,
      contrasena: contrasenaHasheada,
      rol: 'Director'
    }
  });

  console.log('Director inicial creado exitosamente:');
  console.log(`- Nombre: ${director.nombre_usuario}`);
  console.log(`- Correo: ${director.correo}`);
  console.log(`- Contrasena: ${contrasena}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
