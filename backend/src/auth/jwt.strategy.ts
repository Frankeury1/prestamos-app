import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// Esta estrategia le dice a Passport cómo validar el token JWT
// Extrae el token del header Authorization: Bearer <token>
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'clave_secreta_temporal',
    });
  }

  // Si el token es válido, este método retorna el payload
  // NestJS lo inyecta automáticamente en el request como req.user
  async validate(payload: any) {
    return { id: payload.sub, email: payload.email, rol: payload.rol };
  }
}