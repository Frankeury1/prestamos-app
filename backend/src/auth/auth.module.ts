// Módulo principal de autenticación
// Aquí conectamos todos los servicios que necesita el sistema de login
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UsuariosModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'clave_secreta_temporal',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  // IMPORTANTE: exportamos JwtStrategy y PassportModule para que
  // otros módulos como ClientesModule puedan usar el guard
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}