import { IsString } from 'class-validator';

export class AddMembersDto {
  @IsString({
    each: true,
  })
  memberIds: string[];
}
