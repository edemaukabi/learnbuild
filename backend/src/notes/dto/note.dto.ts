import { IsString, IsNotEmpty, IsOptional, IsInt, Min, MaxLength } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  timestamp?: number;
}

export class UpdateNoteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;
}
