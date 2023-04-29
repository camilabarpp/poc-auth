import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: any, res: Response, next: NextFunction) {
    const token = req.cookies.token; // assume que o token foi salvo em um cookie chamado 'token'
    if (!token) {
      return res.status(401).send('Você não está autenticado');
    }
    try {
      const decodedToken = jwt.verify(token, 'secret-key'); // verifica a validade do token
      // req.user = decodedToken.user; // adiciona o usuário decodificado na requisição para uso posterior
      next();
    } catch (err) {
      return res.status(401).send('Token inválido');
    }
  }
}
