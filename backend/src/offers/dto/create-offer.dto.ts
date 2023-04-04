import { IsNumber, IsBoolean, Min } from 'class-validator';
import { CommonEntity } from 'src/utils/CommonEntity';

export class CreateOfferDto extends CommonEntity {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsBoolean()
  hidden?: boolean;

  @IsNumber()
  itemId: number;
}
