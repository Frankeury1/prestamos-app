import {
  Controller, Get, Post, Param,
  Body, ParseIntPipe, UseGuards
} from '@nestjs/common';
import { PagosService } from './pagos.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('pagos')
export class PagosController {
  constructor(private pagosService: PagosService) {}

  // GET /pagos/prestamo/1 → lista todos los pagos del préstamo 1
  @Get('prestamo/:prestamoId')
  findByPrestamo(@Param('prestamoId', ParseIntPipe) prestamoId: number) {
    return this.pagosService.findByPrestamo(prestamoId);
  }

  // POST /pagos → registra un nuevo pago
  @Post()
  create(@Body() body: { monto: number; prestamoId: number }) {
    return this.pagosService.create(body);
  }
}