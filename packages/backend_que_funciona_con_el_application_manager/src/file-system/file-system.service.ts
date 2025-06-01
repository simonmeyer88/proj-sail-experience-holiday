import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { v4 as uuid } from 'uuid';
import { DatabaseService } from 'src/database/database.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { StorageService } from 'src/storage/storage.service';
import { UpdateFileDto } from './dto/update-file.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { User as IUser } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { DeleteObjectsCommandInput } from '@aws-sdk/client-s3';
import { STR_MAX_LENGTH } from '@aula-anclademia/common';

@Injectable()
export class FileSystemService {
  constructor(
    private readonly storageService: StorageService,
    private readonly dbService: DatabaseService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Deletes all entities in S3 that are not referenced in the database
   * @returns The number of deleted files
   */
  public async deleteOrphanedFiles() {
    const files = await this.dbService.file.findMany({
      select: { s3Key: true },
    });

    // First, get all S3 keys in the bucket
    const allS3Keys = await this.storageService
      .listObjects({
        Bucket: this.configService.getOrThrow('S3_PRIVATE_BUCKET_NAME'),
      })
      .then((res) => res.Contents?.map((obj) => obj.Key));

    if (!allS3Keys || allS3Keys.length === 0) {
      return 0;
    }

    // Then, filter out all keys that are referenced in the database
    const s3KeysToDelete = allS3Keys.filter(
      (s3Key) => !files.some((file) => file.s3Key === s3Key),
    );

    // Return if it is 0 (S3 will throw an error if we try to delete 0 objects)
    if (s3KeysToDelete.length === 0) {
      return 0;
    }

    // Finally, delete all keys that are not referenced in the database
    await this.storageService.deleteObjects({
      Bucket: this.configService.getOrThrow('S3_PRIVATE_BUCKET_NAME'),
      Delete: {
        Objects: s3KeysToDelete.map((s3Key) => ({ Key: s3Key })),
      },
    });

    return s3KeysToDelete.length;
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
      const uploadParams = {
        Bucket: this.configService.getOrThrow('S3_PRIVATE_BUCKET_NAME'),
        Key: uuid(),
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      const folder = await tx.folder.findUniqueOrThrow({
        where: { id: folderId },
        select: { courseId: true },
      });

      await tx.file.create({
        data: {
          courseId: folder.courseId,
          s3Key: uploadParams.Key,
          folderId,
          name: createFileDto.name,
          contentType: file.mimetype,
        },
      });

      await this.storageService.putObject(uploadParams);
    });
  }

  public async createMultipleFiles(
    folderId: string,
    files: Express.Multer.File[],
  ) {
    await this.dbService.$transaction(async (tx) => {
      const promises = files.map(async (file) => {
        const uploadParams = {
          Bucket: this.configService.getOrThrow('S3_PRIVATE_BUCKET_NAME'),
          Key: uuid(),
          Body: file.buffer,
          ContentType: file.mimetype,
        };

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

        await tx.file.create({
          data: {
            courseId: folder.courseId,
            s3Key: uploadParams.Key,
            folderId,
            name: name,
            contentType: file.mimetype,
          },
        });

        await this.storageService.putObject(uploadParams);
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

        const params = {
          Bucket: this.configService.getOrThrow('S3_PRIVATE_BUCKET_NAME'),
          Key: file.s3Key,
        };

        await this.storageService.deleteObject(params);

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
      select: { s3Key: true },
    });

    return await this.storageService.generateGetSignedUrl({
      s3Key: file.s3Key,
      expires: 60 * 5,
    });
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

        const params: DeleteObjectsCommandInput = {
          Bucket: this.configService.getOrThrow('S3_PRIVATE_BUCKET_NAME'),
          Delete: {
            Objects: files.map((file) => ({ Key: file.s3Key })),
          },
        };

        if (params.Delete.Objects.length > 0)
          await this.storageService.deleteObjects(params);

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
