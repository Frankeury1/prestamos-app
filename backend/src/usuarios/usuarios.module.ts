// Módulo de usuarios
// Exportamos UsuariosService para que AuthModule pueda usarlo
import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';

@Module({
  providers: [UsuariosService],
  exports: [UsuariosService], // IMPORTANTE: sin esto AuthModule no puede usar el servicio
})
export class UsuariosModule {}