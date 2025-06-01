import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class GetAllUsersQueryDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }: { value: string[] | string }) => {
    if (Array.isArray(value)) {
      return value.map((v) => v.toUpperCase());
    } else {
      return [value.toUpperCase()];
    }
  })
  roles?: string[];

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  pendingTaskId?: string;

  @IsOptional()
  @IsString()
  courseId?: string;

  @IsOptional()
  @IsString()
  createdAt?: 'asc' | 'desc';
}
