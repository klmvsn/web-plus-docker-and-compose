import { IsNotEmpty, IsUrl, Length, Min } from 'class-validator';
import { CommonEntity } from 'src/utils/CommonEntity';

export class CreateWishDto extends CommonEntity {
  @Length(1, 250)
  name: string;

  @IsNotEmpty()
  @IsUrl()
  link: string;

  @IsNotEmpty()
  @IsUrl()
  image: string;

  @Min(1)
  price: number;

  @Length(1, 1024)
  description: string;
}
