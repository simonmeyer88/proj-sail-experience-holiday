// eslint-disable-next-line @typescript-eslint/no-var-requires
const { faker } = require('@faker-js/faker'); // Import the faker library

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path'); // Import the path module

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs'); // Import the file system module
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Update the generateRandomBirthDate function to generate random dates between 1990 and 2005
function generateRandomBirthDate() {
  const start = new Date(1990, 0, 1).getTime();
  const end = new Date(2005, 11, 31).getTime();
  const randomTimestamp = getRandomNumber(start, end);
  return new Date(randomTimestamp);
}

function generateStudents(count) {
  const students = [];
  const courses = ['course1', 'course2'];

  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email().trim().toLowerCase();
    const phoneNumber = faker.phone.number('+34653######');
    const address = faker.location.streetAddress();
    const zipCode = faker.location.zipCode();
    const city = faker.location.city();
    const idNumber = getRandomNumber(100000000, 999999999).toString();

    const student = {
      password: 'hashPassword',
      role: 'STUDENT',
      firstName,
      email,
      lastName,
      phoneNumber,
      birthDate: generateRandomBirthDate(),
      address,
      zipCode,
      city,
      idNumber,
      idIssueDate: new Date(),
      isInClub: i % 2 === 0,
      courseId: courses[i % 2],
      profilePicturePath: null,
    };

    students.push(student);
  }

  return students;
}

const generatedStudents = generateStudents(500);
const generatedDataString = JSON.stringify(generatedStudents, null, 2);

const scriptDirectory = __dirname;

try {
  const outputPath = path.join(scriptDirectory, 'students.ts');
  fs.writeFileSync(
    outputPath,
    `
    import {User} from '@prisma/client';
    export const additionalStudents = ${generatedDataString} as unknown as User[];`,
  );
  console.log(`Generated data written to "${outputPath}"`);
} catch (err) {
  console.error(err);
}
