import { IsString } from 'class-validator';

export class UpdatePostDto {
  @IsString()
  readonly title: string;

  @IsString()
  readonly description: string;

  @IsString({ each: true })
  readonly content: Array<string>;
}
