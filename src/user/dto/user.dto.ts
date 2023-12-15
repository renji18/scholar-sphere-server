import { IsString } from 'class-validator';

export class UpdateUserProfileDto {
  @IsString()
  readonly email: string;

  @IsString()
  readonly name: string;

  @IsString()
  readonly userName: string;

  @IsString()
  readonly bio: string;
}
