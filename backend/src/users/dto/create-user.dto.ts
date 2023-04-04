import { IsEmail, IsUrl, Length } from 'class-validator';
import { CommonEntity } from 'src/utils/CommonEntity';

export class CreateUserDto extends CommonEntity {
  @Length(2, 30)
  username: string;

  @Length(2, 200)
  about: string;

  @IsUrl()
  avatar: string;

  @IsEmail()
  email: string;

  @Length(3, 10)
  password: string;
}
