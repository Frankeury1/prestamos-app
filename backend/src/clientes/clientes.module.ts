import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';

@Module({
  imports: [
    // Necesario para que el AuthGuard('jwt') funcione en este módulo
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [ClientesController],
  providers: [ClientesService],
})
export class ClientesModule {}