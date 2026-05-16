import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class PagosService {

  // Obtiene todos los pagos de un préstamo específico
  async findByPrestamo(prestamoId: number) {
    return prisma.pago.findMany({
      where: { prestamoId },
      orderBy: { fecha: 'desc' },
    });
  }

  // Registra un nuevo pago a un préstamo
  // IMPORTANTE: verifica que el préstamo existe y está ACTIVO
  async create(data: { monto: number; prestamoId: number }) {
    // Verifica que el préstamo existe
    const prestamo = await prisma.prestamo.findUnique({
      where: { id: data.prestamoId },
      include: { pagos: true },
    });

    if (!prestamo) throw new NotFoundException('Préstamo no encontrado');

    // No se puede pagar un préstamo ya pagado o vencido
    if (prestamo.estado !== 'ACTIVO') {
      throw new BadRequestException(`El préstamo está ${prestamo.estado}`);
    }

    // Calcula cuánto falta por pagar
    const monto = Number(prestamo.monto);
    const interes = Number(prestamo.interes);
    const totalAPagar = monto + (monto * interes / 100);
    const totalPagado = prestamo.pagos.reduce(
      (sum, pago) => sum + Number(pago.monto), 0
    );
    const saldoPendiente = totalAPagar - totalPagado;

    // No permite pagar más de lo que se debe
    if (data.monto > saldoPendiente) {
      throw new BadRequestException(
        `El monto excede el saldo pendiente de ${saldoPendiente}`
      );
    }

    // Registra el pago
    const pago = await prisma.pago.create({
      data: {
        monto: data.monto,
        prestamoId: data.prestamoId,
      },
    });

    // Si el saldo queda en 0, marca el préstamo como PAGADO automáticamente
    if (saldoPendiente - data.monto === 0) {
      await prisma.prestamo.update({
        where: { id: data.prestamoId },
        data: { estado: 'PAGADO' },
      });
    }

    return pago;
  }
}