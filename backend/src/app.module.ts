import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from './auth/auth.module';
import { ClientesModule } from './clientes/clientes.module';

@Module({
  imports: [
    // PassportModule global para que todos los módulos reconozcan la estrategia JWT
    PassportModule.register({ defaultStrategy: 'jwt' }),
    AuthModule,
    ClientesModule,
  ],
})
export class AppModule {}