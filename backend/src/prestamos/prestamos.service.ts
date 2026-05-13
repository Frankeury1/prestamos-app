import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class PrestamosService {

  // Obtiene todos los préstamos con datos del cliente
  async findAll() {
    return prisma.prestamo.findMany({
      include: {
        cliente: true, // Incluye los datos del cliente en la respuesta
        pagos: true,   // Incluye los pagos realizados
      },
      orderBy: { fechaInicio: 'desc' },
    });
  }

  // Busca un préstamo por ID con todos sus detalles
  async findOne(id: number) {
    const prestamo = await prisma.prestamo.findUnique({
      where: { id },
      include: { cliente: true, pagos: true },
    });
    if (!prestamo) throw new NotFoundException('Préstamo no encontrado');
    return prestamo;
  }

  // Busca todos los préstamos de un cliente específico
  async findByCliente(clienteId: number) {
    return prisma.prestamo.findMany({
      where: { clienteId },
      include: { pagos: true },
      orderBy: { fechaInicio: 'desc' },
    });
  }

  // Crea un nuevo préstamo
  // IMPORTANTE: el interés se guarda como porcentaje (ej: 10 = 10%)
  async create(data: {
    monto: number;
    interes: number;
    cuotas: number;
    clienteId: number;
    usuarioId: number;
  }) {
    return prisma.prestamo.create({
      data: {
        monto: data.monto,
        interes: data.interes,
        cuotas: data.cuotas,
        clienteId: data.clienteId,
        usuarioId: data.usuarioId,
      },
      include: { cliente: true },
    });
  }

  // Cambia el estado de un préstamo (ACTIVO, PAGADO, VENCIDO)
  async cambiarEstado(id: number, estado: 'ACTIVO' | 'PAGADO' | 'VENCIDO') {
    await this.findOne(id);
    return prisma.prestamo.update({
      where: { id },
      data: { estado },
    });
  }

  // Calcula el resumen financiero de un préstamo
  // Devuelve cuánto debe pagar en total y cuánto ha pagado
  async calcularResumen(id: number) {
    const prestamo = await this.findOne(id);
    const monto = Number(prestamo.monto);
    const interes = Number(prestamo.interes);

    // Total a pagar = monto + (monto * interes / 100)
    const totalAPagar = monto + (monto * interes / 100);

    // Total pagado = suma de todos los pagos realizados
    const totalPagado = prestamo.pagos.reduce(
      (sum, pago) => sum + Number(pago.monto), 0
    );

    const saldoPendiente = totalAPagar - totalPagado;
    const cuotaMensual = totalAPagar / prestamo.cuotas;

    return {
      monto,
      interes: `${interes}%`,
      totalAPagar,
      totalPagado,
      saldoPendiente,
      cuotaMensual: Math.round(cuotaMensual * 100) / 100,
      cuotas: prestamo.cuotas,
      estado: prestamo.estado,
    };
  }
}