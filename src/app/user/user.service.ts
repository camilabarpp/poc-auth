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
import { CredentialsDto } from '../../auth/dto/credentials-dto';
import { UserUpdateDto } from './dto/user-update-dto';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { MailerService } from '@nestjs-modules/mailer';
import * as jwt from 'jsonwebtoken';

const jwtSecret = 'super-secret';

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
      query.andWhere('user.email LIKE :email', { email: `${email}%` });
    }

    if (name) {
      query.andWhere('user.name LIKE :name', { name: `${name}%` });
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

    if (!user)
      throw new NotFoundException('No user was found with the given ID: ' + id);
    return user;
  }

  async updateUser(updateUserDto: UserUpdateDto, id: string): Promise<User> {
    await this.userRepository.update(id, updateUserDto);
    try {
      return await this.findUserById(id);
    } catch (error) {
      throw new InternalServerErrorException('Error saving data to database');
    }
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    if (createUserDto.password != createUserDto.passwordConfirmation) {
      throw new UnprocessableEntityException('Passwords do not match');
    } else {
      const user = await this.createAndEncryptPassword(
        createUserDto,
        UserRole.USER,
      );

      await this.sendConfirmationEmail(user.email, user.name);

      return user;
    }
  }

  async createAdmin(createUserDto: CreateUserDto): Promise<User> {
    if (createUserDto.password != createUserDto.passwordConfirmation) {
      throw new UnprocessableEntityException('Passwords do not match');
    } else {
      const admin = await this.createAndEncryptPassword(
        createUserDto,
        UserRole.ADMIN,
      );

      await this.sendConfirmationEmail(admin.email, admin.name);

      return admin;
    }
  }

  private async sendConfirmationEmail(
    email: string,
    name: string,
  ): Promise<void> {
    const mail = {
      to: email,
      from: 'noreply@application.com',
      subject: 'Bem vindo(a) ao NQ',
      template: 'welcome-email',
      context: {
        name,
      },
    };

    await this.mailerService.sendMail(mail);
  }

  async deleteUser(id: string) {
    await this.findUserById(id);
    await this.userRepository.delete(id);
  }

  async changePassword(id: string, password: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    user.salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(password, user.salt);
    user.recoverToken = null;
    await this.userRepository.save(user);
  }

  private async generateHash(
    password: string,
  ): Promise<{ salt: string; hash: string }> {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password, salt);
    return { salt, hash };
  }

  async createAndEncryptPassword(
    createUserDto: CreateUserDto,
    role: UserRole,
  ): Promise<User> {
    const { email, name, password } = createUserDto;

    const { salt, hash } = await this.generateHash(password);

    const newUser = this.userRepository.create({
      name,
      email,
      password: hash,
      role,
      status: true,
      salt,
    });

    try {
      await this.userRepository.save(newUser);
      delete newUser.password;
      delete newUser.salt;

      newUser.confirmationToken = jwt.sign(
        { userId: newUser.id, salt: newUser.salt },
        jwtSecret,
        { expiresIn: '2 days' },
      );

      await this.userRepository.save(newUser);
      return newUser;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error to save on database! ${error.message}`,
      );
    }
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
