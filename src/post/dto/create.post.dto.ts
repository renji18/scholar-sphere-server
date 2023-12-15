import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @IsString()
  readonly description: string;

  @IsString()
  readonly content: Array<string>;
}
