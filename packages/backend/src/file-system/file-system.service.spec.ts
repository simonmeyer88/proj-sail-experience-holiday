import { Test } from '@nestjs/testing';
import { FileSystemService } from './file-system.service';
import { StorageService } from 'src/storage/storage.service';
import { DatabaseService } from 'src/database/database.service';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

describe('FileSystemService', () => {
  let fileSystemService: FileSystemService;
  let storageService: StorageService;
  let dbService: DatabaseService;
  let configService: ConfigService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        FileSystemService,
        {
          provide: StorageService,
          useValue: {
            // Mock the methods of the StorageService that are used by FileSystemService
            putObject: jest.fn(),
            deleteObject: jest.fn(),
            deleteObjects: jest.fn(),
            generateGetSignedUrl: jest.fn(),
          },
        },
        {
          provide: DatabaseService,
          useValue: {
            $transaction: jest.fn(),
            folder: {
              findFirst: jest.fn(),
              findMany: jest.fn(),
              $transaction: jest.fn(),
              delete: jest.fn(),
            },
            file: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              deleteMany: jest.fn(),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            // Mock the methods of the ConfigService that are used by FileSystemService
            get: jest.fn(),
            getOrThrow: jest.fn(),
          },
        },
      ],
    }).compile();

    fileSystemService = moduleRef.get<FileSystemService>(FileSystemService);
    storageService = moduleRef.get<StorageService>(StorageService);
    dbService = moduleRef.get<DatabaseService>(DatabaseService);
    configService = moduleRef.get<ConfigService>(ConfigService);
  });

  describe('checkUserAccessToFolder', () => {
    it('should return true for ADMIN or TEACHER role', async () => {
      const user = { role: 'ADMIN' };
      const folderId = 'folder-id';

      const result = await fileSystemService.checkUserAccessToFolder(
        user as User,
        folderId,
      );

      expect(result).toBe(true);
    });

    it('should return true if the folder exists and the user is a STUDENT', async () => {
      const user = { role: 'STUDENT', id: 'user-id' };
      const folderId = 'folder-id';

      jest.spyOn(dbService.folder, 'findFirst').mockResolvedValueOnce({
        id: folderId,
      } as any);

      const result = await fileSystemService.checkUserAccessToFolder(
        user as User,
        folderId,
      );

      expect(result).toBe(true);
    });
    it('should return false if the folder does not exist and the user is a STUDENT', async () => {
      const user = { role: 'STUDENT', id: 'user-id' };
      const folderId = 'folder-id';

      jest.spyOn(dbService.folder, 'findFirst').mockResolvedValueOnce(null);

      const result = await fileSystemService.checkUserAccessToFolder(
        user as User,
        folderId,
      );

      expect(result).toBe(false);
    });
  });

  describe('removeFile', () => {
    it('should remove the file and delete it from the storage', async () => {
      const fileId = 'sample-file-id';
      const s3Key = 'sample-s3-key';

      const mockTransaction = jest.fn(async (callback) => {
        await callback({
          file: {
            findUniqueOrThrow: jest.fn().mockResolvedValue({ s3Key }),
            delete: jest.fn(),
          },
        });
      });

      jest.spyOn(dbService, '$transaction').mockImplementation(mockTransaction);
      jest
        .spyOn(storageService, 'deleteObject')
        .mockResolvedValue({} as unknown as never);
      jest
        .spyOn(configService, 'getOrThrow')
        .mockReturnValue('sample-bucket-name');

      await fileSystemService.removeFile(fileId);

      expect(mockTransaction).toHaveBeenCalled();

      expect(storageService.deleteObject).toHaveBeenCalledWith({
        Bucket: 'sample-bucket-name',
        Key: s3Key,
      });
    });
  });
});
