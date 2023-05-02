import { User } from '../app/user/entities/user.entity';
import { createParamDecorator } from '@nestjs/common';

export const GetUser = createParamDecorator((data, req): User => {
  return req.args[0].user;
});
