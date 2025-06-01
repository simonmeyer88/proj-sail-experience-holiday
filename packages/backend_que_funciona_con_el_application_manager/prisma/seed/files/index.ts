import { FileSystemService } from 'src/file-system/file-system.service';
import { DatabaseService } from 'src/database/database.service';
import { StorageService } from 'src/storage/storage.service';
import { join } from 'path';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';

const prisma = new DatabaseService();
const configService = new ConfigService();
const storageService = new StorageService(configService);
const filesService = new FileSystemService(
  storageService,
  prisma,
  configService,
);

export async function createFiles() {
  const FOLDER_PATH = join(__dirname, 'data');
  const COURSE1_ID = 'course1';
  const COURSE2_ID = 'course2';

  const [file1, file2, file3] = await Promise.all([
    readFileAsync(join(FOLDER_PATH, 'blank.pdf')),
    readFileAsync(join(FOLDER_PATH, 'blank.xlsx')),
    readFileAsync(join(FOLDER_PATH, 'blank.txt')),
  ]);

  const [root1] = await Promise.all([
    prisma.folder.findFirst({
      where: {
        courseId: COURSE1_ID,
        isRoot: true,
      },
    }),
    prisma.folder.findFirst({
      where: {
        courseId: COURSE2_ID,
        isRoot: true,
      },
    }),
  ]);

  const [folder1, folder2, folder3, folder4] = await Promise.all([
    createFolder(prisma, COURSE1_ID, root1.id, 'folder1'),
    createFolder(prisma, COURSE1_ID, root1.id, 'folder2'),
    createFolder(prisma, COURSE1_ID, root1.id, 'folder3'),
    createFolder(prisma, COURSE1_ID, root1.id, 'folder4'),
  ]);

  enum MimeType {
    PDF = 'application/pdf',
    XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    TXT = 'text/plain',
  }

  const filePromises = [
    createFile(filesService, folder1.id, 'file1_1', file1, MimeType.PDF),
    createFile(filesService, folder1.id, 'file1_2', file2, MimeType.XLSX),
    createFile(filesService, folder1.id, 'file1_3', file3, MimeType.TXT),
    createFile(filesService, folder2.id, 'file2_1', file1, MimeType.PDF),
    createFile(filesService, folder2.id, 'file2_2', file2, MimeType.XLSX),
    createFile(filesService, folder2.id, 'file2_3', file3, MimeType.TXT),
    createFile(filesService, folder3.id, 'file3_1', file1, MimeType.PDF),
    createFile(filesService, folder3.id, 'file3_2', file2, MimeType.XLSX),
    createFile(filesService, folder3.id, 'file3_3', file3, MimeType.TXT),
    createFile(filesService, folder4.id, 'file4_1', file1, MimeType.PDF),
    createFile(filesService, folder4.id, 'file4_2', file2, MimeType.XLSX),
  ];

  const subFoldersPromises = [
    createFolder(prisma, COURSE1_ID, folder1.id, 'subfolder1'),
    createFolder(prisma, COURSE1_ID, folder1.id, 'subfolder2'),
    createFolder(prisma, COURSE1_ID, folder1.id, 'subfolder3'),
    createFolder(prisma, COURSE1_ID, folder2.id, 'subfolder1'),
    createFolder(prisma, COURSE1_ID, folder2.id, 'subfolder2'),
    createFolder(prisma, COURSE1_ID, folder2.id, 'subfolder3'),
    createFolder(prisma, COURSE1_ID, folder3.id, 'subfolder1'),
    createFolder(prisma, COURSE1_ID, folder3.id, 'subfolder2'),
    createFolder(prisma, COURSE1_ID, folder3.id, 'subfolder3'),
    createFolder(prisma, COURSE1_ID, folder4.id, 'subfolder1'),
  ];

  const [subFolders1, subFolders2, subFolders3, subFolders4] =
    await Promise.all(subFoldersPromises);

  await Promise.all(filePromises);

  const subFilesPromises = [
    createFile(filesService, subFolders1.id, 'subfile1_1', file1, MimeType.PDF),
    createFile(
      filesService,
      subFolders1.id,
      'subfile1_2',
      file2,
      MimeType.XLSX,
    ),
    createFile(filesService, subFolders1.id, 'subfile1_3', file3, MimeType.TXT),
    createFile(filesService, subFolders2.id, 'subfile2_1', file1, MimeType.PDF),
    createFile(
      filesService,
      subFolders2.id,
      'subfile2_2',
      file2,
      MimeType.XLSX,
    ),
    createFile(filesService, subFolders2.id, 'subfile2_3', file3, MimeType.TXT),
    createFile(filesService, subFolders3.id, 'subfile3_1', file1, MimeType.PDF),
    createFile(
      filesService,
      subFolders3.id,
      'subfile3_2',
      file2,
      MimeType.XLSX,
    ),
    createFile(filesService, subFolders3.id, 'subfile3_3', file3, MimeType.TXT),
    createFile(filesService, subFolders4.id, 'subfile4_1', file1, MimeType.PDF),
    createFile(
      filesService,
      subFolders4.id,
      'subfile4_2',
      file2,
      MimeType.XLSX,
    ),
  ];

  await Promise.all(subFilesPromises);
}

async function readFileAsync(filePath: fs.PathOrFileDescriptor) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

async function createFolder(
  prisma: DatabaseService,
  courseId: string,
  parentId: string,
  name: string,
) {
  return prisma.folder.create({
    data: {
      name,
      parent: {
        connect: {
          id: parentId,
        },
      },
      course: {
        connect: {
          id: courseId,
        },
      },
    },
  });
}

async function createFile(
  filesService: FileSystemService,
  folderId: any,
  name: string,
  buffer: unknown,
  mimetype: string,
) {
  return filesService.createFile(
    {
      name,
    },
    folderId,
    {
      buffer,
      mimetype,
    } as Express.Multer.File,
  );
}
