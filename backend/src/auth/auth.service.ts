import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
  ) {}

  async registro(email: string, password: string, nombre: string) {
    const usuario = await this.usuariosService.create(email, password, nombre);
    const payload = { sub: usuario.id, email: usuario.email, rol: usuario.rol };
    return { token: this.jwtService.sign(payload) };
  }

  async login(email: string, password: string) {
    const usuario = await this.usuariosService.findByEmail(email);
    if (!usuario) throw new UnauthorizedException('Credenciales incorrectas');

    const valido = await bcrypt.compare(password, usuario.password);
    if (!valido) throw new UnauthorizedException('Credenciales incorrectas');

    const payload = { sub: usuario.id, email: usuario.email, rol: usuario.rol };
    return { token: this.jwtService.sign(payload) };
  }
}