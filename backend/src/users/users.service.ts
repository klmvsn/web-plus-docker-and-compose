import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Wish } from 'src/wishes/entities/wish.entity';
import { FindUserDto } from './dto/find-user.dto';
import { HashService } from 'src/hash/hash.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private hashServise: HashService,
    @InjectRepository(Wish)
    private wishesRepository: Repository<Wish>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, username } = createUserDto;
    const existUser = await this.usersRepository.find({
      where: [{ email: email }, { username: username }],
    });
    if (existUser.length !== 0) {
      throw new ConflictException(
        'Пользователь с таким email или username уже существует',
      );
    }
    const hash = await this.hashServise.getHash(createUserDto.password);
    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hash,
    });
    const user = await this.usersRepository.save(newUser);
    delete user.password;
    return user;
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    delete user.password;
    return user;
  }

  async findByUsername(username: string) {
    const user = await this.usersRepository.findOne({
      where: {
        username: username,
      },
    });
    return user;
  }

  async findMany({ query }: FindUserDto) {
    const users = await this.usersRepository.find({
      where: [{ email: query }, { username: query }],
    });
    users.forEach((user) => delete user.password);
    return users;
  }

  async getUserWishes(id: number) {
    const wishes = await this.wishesRepository.find({
      where: { owner: { id } },
      relations: ['owner'],
    });
    wishes.forEach((wish) => delete wish.owner.password);
    return wishes;
  }

  async updateOne(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await this.hashServise.getHash(
        updateUserDto.password,
      );
    }
    await this.usersRepository.update({ id }, updateUserDto);
    const updatedUser = await this.findOne(id);
    delete updatedUser.password;
    return updatedUser;
  }

  async remove(id: number) {
    return await this.usersRepository.delete({ id });
  }
}
