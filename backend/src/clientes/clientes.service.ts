import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class ClientesService {

  // Obtiene todos los clientes de la base de datos
  async findAll() {
    return prisma.cliente.findMany({
      orderBy: { creadoEn: 'desc' },
    });
  }

  // Busca un cliente por su ID
  // Si no existe lanza un error 404
  async findOne(id: number) {
    const cliente = await prisma.cliente.findUnique({ where: { id } });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');
    return cliente;
  }

  // Crea un nuevo cliente
  async create(data: {
    nombre: string;
    cedula: string;
    telefono: string;
    direccion: string;
  }) {
    return prisma.cliente.create({ data });
  }

  // Actualiza los datos de un cliente existente
  async update(id: number, data: {
    nombre?: string;
    cedula?: string;
    telefono?: string;
    direccion?: string;
  }) {
    await this.findOne(id); // Verifica que existe antes de actualizar
    return prisma.cliente.update({ where: { id }, data });
  }

  // Elimina un cliente por su ID
  async remove(id: number) {
    await this.findOne(id); // Verifica que existe antes de eliminar
    return prisma.cliente.delete({ where: { id } });
  }
}