import {
  Controller, Get, Post, Put, Delete,
  Param, Body, ParseIntPipe, UseGuards
} from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { AuthGuard } from '@nestjs/passport';

// IMPORTANTE: @UseGuards(AuthGuard('jwt')) protege todas las rutas
// Solo usuarios con token válido pueden acceder
@UseGuards(AuthGuard('jwt'))
@Controller('clientes')
export class ClientesController {
  constructor(private clientesService: ClientesService) {}

  // GET /clientes → lista todos los clientes
  @Get()
  findAll() {
    return this.clientesService.findAll();
  }

  // GET /clientes/1 → busca el cliente con id 1
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.findOne(id);
  }

  // POST /clientes → crea un nuevo cliente
  @Post()
  create(@Body() body: {
    nombre: string;
    cedula: string;
    telefono: string;
    direccion: string;
  }) {
    return this.clientesService.create(body);
  }

  // PUT /clientes/1 → actualiza el cliente con id 1
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: {
      nombre?: string;
      cedula?: string;
      telefono?: string;
      direccion?: string;
    },
  ) {
    return this.clientesService.update(id, body);
  }

  // DELETE /clientes/1 → elimina el cliente con id 1
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.remove(id);
  }
}