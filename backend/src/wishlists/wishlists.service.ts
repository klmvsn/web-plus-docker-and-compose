import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions } from 'typeorm';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { Wishlist } from './entities/wishlist.entity';
import { User } from 'src/users/entities/user.entity';
import { WishesService } from 'src/wishes/wishes.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistsRepository: Repository<Wishlist>,
    private wishesService: WishesService,
  ) {}

  async create(owner: User, createWishListDto: CreateWishlistDto) {
    delete owner.password;
    delete owner.email;
    const wishes = await this.wishesService.findMany({});
    const items = createWishListDto.itemsId.map((item) => {
      return wishes.find((wish) => wish.id === item);
    });
    const newWishList = this.wishlistsRepository.create({
      ...createWishListDto,
      owner: owner,
      items: items,
    });
    return this.wishlistsRepository.save(newWishList);
  }

  async findOne(query: FindOneOptions<Wishlist>): Promise<Wishlist> {
    const wishlist = await this.wishlistsRepository.findOne(query);
    if (wishlist.owner) {
      delete wishlist.owner.email;
      delete wishlist.owner.password;
    }
    return wishlist;
  }

  async findAll() {
    const wishlists = await this.wishlistsRepository.find({
      relations: {
        owner: true,
        items: true,
      },
    });
    wishlists.forEach((wishlist) => {
      delete wishlist.owner.password;
      delete wishlist.owner.email;
    });
    return wishlists;
  }

  async findWishlistsById(id: number) {
    const wishlist = await this.wishlistsRepository.findOne({
      where: { id },
      relations: ['owner', 'items'],
    });
    delete wishlist.owner.email;
    delete wishlist.owner.password;
    return wishlist;
  }

  async updateOne(
    userId: number,
    id: number,
    updateWishlistDto: UpdateWishlistDto,
  ) {
    const wishList = await this.findOne({
      where: { id },
      relations: { owner: true },
    });
    if (!wishList) {
      return new NotFoundException('Вишлист не найден');
    }
    if (userId !== wishList.owner.id) {
      return new ForbiddenException('Нельзя редактировать чужой вишлист');
    }
    const { itemsId, ...rest } = updateWishlistDto;
    const items = itemsId.map((id) => ({ id } as Wishlist));
    await this.wishlistsRepository.save({ id, items, ...rest });
    return this.findOne({ where: { id } }) || {};
  }

  async remove(wishlistId: number, userId: number) {
    const wishlist = await this.findOne({
      where: { id: wishlistId },
      relations: {
        owner: true,
        items: true,
      },
    });
    if (!wishlist) {
      throw new NotFoundException('Вишлист не найден');
    }

    if (userId !== wishlist.owner.id) {
      throw new ForbiddenException('Нельзя редактировать чужиой список');
    }
    await this.wishlistsRepository.delete(wishlistId);
    return wishlist;
  }
}
