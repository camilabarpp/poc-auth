import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/user-create-dto';
import { UserRole } from './entities/user-enum';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { CredentialsDto } from './dto/credentials-dto';
import { UserUpdateDto } from './dto/user-update-dto';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private mailerService: MailerService,
  ) {}

  async findUsers(
    queryDto: FindUsersQueryDto,
  ): Promise<{ users: User[]; total: number }> {
    return await this.findUser(queryDto);
  }

  async findUser(
    queryDto: FindUsersQueryDto,
  ): Promise<{ users: User[]; total: number }> {
    const {
      email,
      name,
      status = true,
      role,
      page = 1,
      limit = 100,
      sort,
    } = queryDto;

    const query = this.userRepository
      .createQueryBuilder('user')
      .where('user.status = :status', { status });

    if (email) {
      query.andWhere('user.email LIKE :email', { email: `%${email}%` });
    }

    if (name) {
      query.andWhere('user.name LIKE :name', { name: `%${name}%` });
    }

    if (role) {
      query.andWhere('user.role = :role', { role });
    }

    query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy(sort ? JSON.parse(sort) : undefined)
      .select(['user.name', 'user.email', 'user.role', 'user.status']);

    const [users, total] = await query.getManyAndCount();

    return { users, total };
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['email', 'name', 'role', 'id'],
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async updateUser(updateUserDto: UserUpdateDto, id: string): Promise<User> {
    const user = await this.findUserById(id);
    const { name, email, role, status } = updateUserDto;
    user.name = name ? name : user.name;
    user.email = email ? email : user.email;
    user.role = role ? role : user.role;
    user.status = status === undefined ? user.status : status;

    try {
      return await this.userRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException('Error saving data to database');
    }
  }

  // async createUser(createUserDto: CreateUserDto): Promise<User> {
  //   if (createUserDto.password != createUserDto.passwordConfirmation) {
  //     throw new UnprocessableEntityException('Passwords do not match');
  //   } else {
  //     const user = await this.create(createUserDto, UserRole.USER);
  //     const mail = {
  //       to: user.email,
  //       from: 'noreply@application.com',
  //       subject: 'Email confirmation',
  //       template:
  //         '/home/forttiori/Documentos/NestJS/poc-auth/src/templates/email-confirmation.hbs',
  //       context: {
  //         token: user.confirmationToken,
  //       },
  //     };
  //     // await this.mailerService.sendMail(mail);
  //     await this.mailerService.sendMail({
  //       to: user.email,
  //       subject: 'Email confirmation',
  //     });
  //     return user;
  //   }
  // }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    if (createUserDto.password != createUserDto.passwordConfirmation) {
      throw new UnprocessableEntityException('Passwords do not match');
    } else {
      const user = await this.create(createUserDto, UserRole.USER);
      const mail = {
        to: user.email,
        from: 'noreply@application.com',
        subject: 'Email confirmation',
        template: 'email-confirmation',
        context: {
          token: user.confirmationToken,
        },
      };
      await this.mailerService.sendMail(mail);
      return user;
    }
  }

  async createAdmin(createUserDto: CreateUserDto): Promise<User> {
    if (createUserDto.password != createUserDto.passwordConfirmation) {
      throw new UnprocessableEntityException('Passwords do not match');
    } else {
      return this.create(createUserDto, UserRole.ADMIN);
    }
  }

  async deleteUser(id: string) {
    const result = await this.userRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`No user was found with the given ID: ${id}`);
    }
  }

  async create(createUserDto: CreateUserDto, role: UserRole): Promise<User> {
    const { email, name, password } = createUserDto;
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);

    const hash = await bcrypt.hash(password, salt);

    const newUser = new User();
    newUser.name = name;
    newUser.email = email;
    newUser.password = hash;
    newUser.role = role;
    newUser.status = true;
    newUser.confirmationToken = crypto.randomBytes(32).toString('hex');
    newUser.salt = salt;

    try {
      await this.userRepository.save(newUser);
      delete newUser.password;
      delete newUser.salt;
      return newUser;
    } catch (error) {
      const errorMessage = `Error to save on database! ${error.message}`;
      throw new InternalServerErrorException(errorMessage);
    }
  }

  private async sendConfirmationEmail(user: User): Promise<void> {
    const mail = {
      to: user.email,
      from: 'noreply@application.com',
      subject: 'Email confirmation',
      template: '/src/templates/email-confirmation.hbs',
    };
    await this.mailerService.sendMail(mail);
  }

  async checkCredentials(credentialsDto: CredentialsDto): Promise<User> {
    const { email, password } = credentialsDto;
    const user = await this.userRepository.findOne({
      where: { email, status: true },
    });

    if (user && (await user.checkPassword(password))) {
      return user;
    } else {
      return null;
    }
  }
}
