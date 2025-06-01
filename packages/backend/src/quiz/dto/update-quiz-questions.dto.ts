import { IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateQuizQuestionsDto {
  @Type(() => Question)
  @ValidateNested({ each: true })
  questions: Question[];
}

class Question {
  @IsString()
  id: string;

  @IsString()
  newCorrectAnswerId: string;
}
