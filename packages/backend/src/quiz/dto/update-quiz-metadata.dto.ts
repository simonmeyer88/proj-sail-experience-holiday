import { IsNumber, Max, Min } from 'class-validator';
import { CreateQuizDto } from './create-quiz.dto';
import {
  QUIZ_MAX_QUESTIONS_ATTEMPT,
  QUIZ_MIN_QUESTIONS_ATTEMPT,
} from '@aula-anclademia/common';

export class UpdateQuizMetadataDto extends CreateQuizDto {
  @IsNumber()
  @Min(QUIZ_MIN_QUESTIONS_ATTEMPT)
  @Max(QUIZ_MAX_QUESTIONS_ATTEMPT)
  nQuestionsPerAttempt: number;
}
