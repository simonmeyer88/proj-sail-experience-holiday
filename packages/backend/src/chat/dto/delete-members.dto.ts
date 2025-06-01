import { IsString } from 'class-validator';

export class DeleteMembersDto {
  @IsString({
    each: true,
  })
  memberIds: string[];
}
