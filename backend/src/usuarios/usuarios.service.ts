// Importamos Injectable para que NestJS pueda inyectar este servicio en otros módulos
import { Injectable } from '@nestjs/common';
// Importamos PrismaClient para conectarnos a la base de datos
import { PrismaClient } from '@prisma/client';
// Importamos bcrypt para encriptar y comparar contraseñas
import * as bcrypt from 'bcrypt';
// Creamos una instancia de Prisma para usar en toda la clase
const prisma = new PrismaClient();

// @Injectable le dice a NestJS que este servicio puede ser inyectado en otros lugares
@Injectable()
export class UsuariosService {

     // Busca un usuario en la base de datos por su email
    // Se usa en el login para verificar si el usuario existe
    async findByEmail (email: string) {
        return prisma.usuario.findUnique({ where: { email } });
    }


    // Crea un nuevo usuario en la base de datos
    // IMPORTANTE: nunca guardamos la contraseña en texto plano
    // bcrypt.hash(password, 12) → el 12 es el "costo" del encriptado, más alto = más seguro
    async create(email: string, password: string, nombre: string) {
        const hash = await bcrypt.hash(password, 12);
        return prisma.usuario.create({
            data: {
                email,
                password: hash,
                nombre
            },
        }); 
    }
}