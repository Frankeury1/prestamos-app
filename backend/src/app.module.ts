// Módulo raíz de la aplicación
// Aquí registramos todos los módulos del sistema
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule],
})
export class AppModule {}