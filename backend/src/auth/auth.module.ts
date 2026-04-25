// Módulo principal de autenticación
// Aquí conectamos todos los servicios que necesita el sistema de login
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [
    // Importamos el módulo de usuarios para poder buscar usuarios en el login
    UsuariosModule,

    // Configuramos JWT con una clave secreta y expiración de 15 minutos
    // IMPORTANTE: en producción esta clave debe estar en .env y ser muy larga
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'clave_secreta_temporal',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}