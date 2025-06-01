import fs from 'fs';
import path from 'path';
import { DatabaseService } from 'src/database/database.service';
import { QuizService } from 'src/quiz/quiz.service';

const dbService = new DatabaseService();

const quizService = new QuizService(dbService);

/**
 * This script will create quizzes from the data folder (with test quiz data)
 */
export async function createQuizzes() {
  const FOLDER_PATH = path.join(__dirname, 'data');

  // Read data folder and get all excel files
  const files = fs.readdirSync(FOLDER_PATH);

  // Parallelize quiz creation
  const promises = files.map(async (file) => {
    const fileContent = fs.readFileSync(path.join(FOLDER_PATH, file));

    await quizService.create(
      {
        name: file.replace('.xls', ''),
        courseIds: ['course1'],
      },
      {
        buffer: fileContent,
        mimetype: 'application/vnd.ms-excel',
      } as Express.Multer.File,
    );
  });

  await Promise.all(promises);
}
