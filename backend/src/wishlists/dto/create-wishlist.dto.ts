import { IsArray, IsNumber, IsUrl, Length } from 'class-validator';
import { CommonEntity } from 'src/utils/CommonEntity';

export class CreateWishlistDto extends CommonEntity {
  @Length(1, 250)
  name: string;

  @IsUrl()
  image: string;

  @IsArray()
  @IsNumber({}, { each: true })
  itemsId: number[];
}
