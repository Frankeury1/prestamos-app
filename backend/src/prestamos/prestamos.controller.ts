import {
  Controller, Get, Post, Patch, Param,
  Body, ParseIntPipe, UseGuards
} from '@nestjs/common';
import { PrestamosService } from './prestamos.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('prestamos')
export class PrestamosController {
  constructor(private prestamosService: PrestamosService) {}

  // GET /prestamos → lista todos los préstamos
  @Get()
  findAll() {
    return this.prestamosService.findAll();
  }

  // GET /prestamos/1 → detalle del préstamo 1
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.prestamosService.findOne(id);
  }

  // GET /prestamos/cliente/1 → préstamos del cliente 1
  @Get('cliente/:clienteId')
  findByCliente(@Param('clienteId', ParseIntPipe) clienteId: number) {
    return this.prestamosService.findByCliente(clienteId);
  }

  // GET /prestamos/1/resumen → resumen financiero del préstamo 1
  @Get(':id/resumen')
  calcularResumen(@Param('id', ParseIntPipe) id: number) {
    return this.prestamosService.calcularResumen(id);
  }

  // POST /prestamos → crea un nuevo préstamo
  @Post()
  create(@Body() body: {
    monto: number;
    interes: number;
    cuotas: number;
    clienteId: number;
    usuarioId: number;
  }) {
    return this.prestamosService.create(body);
  }

  // PATCH /prestamos/1/estado → cambia el estado del préstamo
  @Patch(':id/estado')
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { estado: 'ACTIVO' | 'PAGADO' | 'VENCIDO' },
  ) {
    return this.prestamosService.cambiarEstado(id, body.estado);
  }
}