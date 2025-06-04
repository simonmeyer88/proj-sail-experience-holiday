import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { v4 as uuid } from 'uuid';
import { DatabaseService } from 'src/database/database.service';
import { CreateFolderDto } from './dto/create-folder.dto';
// import { StorageService } from 'src/storage/storage.service'; // No longer needed for local storage
import { UpdateFileDto } from './dto/update-file.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { User as IUser } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { DeleteObjectsCommandInput } from '@aws-sdk/client-s3';
import { STR_MAX_LENGTH } from '@aula-anclademia/common';
import { LocalStorageService } from 'src/storage/local-storage.service';
import { extension } from 'mime-types'; // Use mime-types for file extension handling
import * as fs from "fs";

@Injectable()
export class FileSystemService {
  // Remove storageService from constructor
  constructor(
    private readonly localStorageService: LocalStorageService,
    private readonly dbService: DatabaseService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Deletes all entities in local storage that are not referenced in the database
   * @returns The number of deleted files
   */
  public async deleteOrphanedFiles() {
    const files = await this.dbService.file.findMany({
      select: { s3Key: true },
    });

    // Get all files in the local materials directory
    const allLocalFiles = await this.localStorageService.listFiles();

    if (!allLocalFiles || allLocalFiles.length === 0) {
      return 0;
    }

    // Filter out all files that are referenced in the database
    const filesToDelete = allLocalFiles.filter(
      (filename) => !files.some((file) => file.s3Key == filename.split('.')[0]),
    );

    if (filesToDelete.length === 0) {
      return 0;
    }

    // Delete all files that are not referenced in the database
    await Promise.all(filesToDelete.map((filename) => this.localStorageService.deleteFile(filename)));

    return filesToDelete.length;
  }

  public async checkUserAccessToFolder(user: IUser, folderId: string) {
    if (user.role === 'ADMIN' || user.role === 'TEACHER') {
      return true;
    }
    if (user.role === 'STUDENT') {
      const folder = await this.dbService.folder.findFirst({
        where: {
          id: folderId,
          course: {
            students: {
              some: {
                id: user.id,
              },
            },
          },
        },
      });
      if (!folder) {
        return false;
      } else {
        return true;
      }
    }
    return false;
  }

  public validateMimeType(
    allowedMimeTypes: string[],
    file: Express.Multer.File,
  ) {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Must be one of ${allowedMimeTypes.join(', ')}`,
      );
    }
  }

  public async updateFile(id: string, updateFileDto: UpdateFileDto) {
    await this.dbService.file.update({
      where: { id },
      data: updateFileDto,
    });
  }

  public async updateFolder(id: string, updateFolderDto: UpdateFolderDto) {
    await this.dbService.folder.update({
      where: { id },
      data: updateFolderDto,
    });
  }

  public async createFile(
    createFileDto: CreateFileDto,
    folderId: string,
    file: Express.Multer.File,
  ) {
    await this.dbService.$transaction(async (tx) => {
      const folder = await tx.folder.findUniqueOrThrow({
        where: { id: folderId },
        select: { courseId: true },
      });

      const fileKey = uuid();
      const fileName = `${fileKey}.${file.originalname.split('.').pop()}`;
      await this.localStorageService.saveFile(fileName, file.buffer);

      await tx.file.create({
        data: {
          courseId: folder.courseId,
          s3Key: fileKey,
          folderId,
          name: createFileDto.name,
          contentType: file.mimetype,
        },
      });
    });
  }

  public async createMultipleFiles(
    folderId: string,
    files: Express.Multer.File[],
  ) {
    await this.dbService.$transaction(async (tx) => {
      const promises = files.map(async (file) => {
        const folder = await tx.folder.findUnique({
          where: { id: folderId },
          select: { courseId: true },
        });

        // use original filename
        let name = file.originalname;
        if (!name) {
          name = 'unnamed.any';
        }

        // without extension
        const extension = name.split('.').pop();
        if (extension) {
          name = name.replace(`.${extension}`, '');
        }

        // make sure it is not too long, but we do not want to throw an error
        if (name.length > STR_MAX_LENGTH) {
          name = name.slice(0, STR_MAX_LENGTH);
        }

        const fileKey = uuid();
        const fileName = `${fileKey}.${extension}`;
        await this.localStorageService.saveFile(fileName, file.buffer);
        
        await tx.file.create({
          data: {
            courseId: folder.courseId,
            s3Key: fileKey,
            folderId,
            name: name,
            contentType: file.mimetype,
          },
        });
      });
      await Promise.all(promises);
    });
  }

  public async createFolder(
    createFolderDto: CreateFolderDto,
    parentId: string,
  ) {
    const parent = await this.dbService.folder.findUniqueOrThrow({
      where: { id: parentId },
      select: { id: true, course: { select: { id: true } } },
    });

    await this.dbService.folder.create({
      data: {
        courseId: parent.course.id,
        name: createFolderDto.name,
        parentId: parent.id,
        isRoot: false,
      },
    });
  }

  public async getFolderContent(folderId: string) {
    const folder = await this.dbService.folder.findUnique({
      where: { id: folderId },
      select: {
        parentId: true,
        files: {
          orderBy: { name: 'asc' },
        },
        folders: {
          orderBy: { name: 'asc' },
          include: {
            _count: {
              select: { files: true, folders: true },
            },
          },
        },
        name: true,
        id: true,
      },
    });

    // we merge the _count to calculate the number of children
    return {
      ...folder,
      folders: folder.folders.map((folder) => ({
        ...folder,
        numberOfChildren: folder._count.folders + folder._count.files,
      })),
    };
  }

  public async removeFile(id: string) {
    await this.dbService.$transaction(
      async (tx) => {
        const file = await tx.file.findUniqueOrThrow({
          where: { id },
          select: { s3Key: true },
        });

        await this.localStorageService.deleteFile(file.s3Key);

        await tx.file.delete({ where: { id } });
      },
      {
        timeout: 10000,
      },
    );
  }

  public async generateDownloadUrl(id: string) {
    const file = await this.dbService.file.findUnique({
      where: { id },
      select: { s3Key: true, contentType: true},
    });

    // For local storage, just return a direct URL (you may want to secure this in production)
    const ext = extension(file.contentType);
    const filename = file.s3Key + (ext ? `.${ext}` : '');

    const filePath = this.localStorageService.getFilePath(filename);

    if (!fs.existsSync(filePath)) throw new BadRequestException('File not found on disk');
    
    const headers = {
      'Content-Type': file.contentType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
    }

    const stream = fs.createReadStream(filePath)
    return { headers, stream };
  }

  public async removeFolder(id: string) {
    const subfolders = await this.dbService.folder.findMany({
      where: { parentId: id },
      select: { id: true },
    });

    // recursively remove subfolders first (db has not cascade delete so we ensure correct removal)
    await Promise.all(subfolders.map((folder) => this.removeFolder(folder.id)));

    await this.dbService.$transaction(
      async (tx) => {
        const files = await tx.file.findMany({
          where: { folderId: id },
          select: { s3Key: true },
        });

        if (files.length > 0) {
          await Promise.all(files.map((file) => this.localStorageService.deleteFile(file.s3Key)));
        }

        // first delete files, then the folder
        await tx.file.deleteMany({ where: { folderId: id } });
        await tx.folder.delete({ where: { id } });
      },

      {
        timeout: 10000,
      },
    );
  }
}