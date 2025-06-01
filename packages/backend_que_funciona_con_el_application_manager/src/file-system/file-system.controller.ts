import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  UploadedFiles,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { FileSystemService } from './file-system.service';
import { CreateFileDto } from './dto/create-file.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadedFile } from '@nestjs/common';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import {
  MAX_FILESYSTEM_FILE_SIZE,
  VALID_FILESYSTEM_MIMETYPES,
} from '@aula-anclademia/common';
import { Auth } from 'src/auth/auth.decorator';
import { User } from 'src/auth/user.decorator';
import { User as IUser } from '@prisma/client';
import { GetFolderContentResponse } from './response/get-folder-content.response';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller('/file-system')
export class FileSystemController {
  constructor(private readonly fileSystemService: FileSystemService) {}

  @Cron(
    process.env.NODE_ENV === 'production'
      ? CronExpression.EVERY_DAY_AT_4AM
      : CronExpression.EVERY_5_SECONDS,
  )
  async cleanUpOrphanedFiles() {
    const deleted = await this.fileSystemService.deleteOrphanedFiles();
    Logger.log(`Deleted ${deleted} orphaned files from S3`);
  }

  @Auth('ADMIN', 'TEACHER')
  @Post('folders/:folderId/files')
  @UseInterceptors(FileInterceptor('file'))
  public async createFile(
    @Param('folderId') folderId: string,
    @Body() createFileDto: CreateFileDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILESYSTEM_FILE_SIZE }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<void> {
    this.fileSystemService.validateMimeType(VALID_FILESYSTEM_MIMETYPES, file);
    await this.fileSystemService.createFile(createFileDto, folderId, file);
  }

  @Auth('ADMIN', 'TEACHER')
  @Post('folders/:folderId/files/multiple')
  @UseInterceptors(FilesInterceptor('files', 20))
  public async createMultipleFiles(
    @Param('folderId') folderId: string,
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILESYSTEM_FILE_SIZE }),
        ],
      }),
    )
    files: Express.Multer.File[],
  ): Promise<void> {
    files.forEach((file) => {
      this.fileSystemService.validateMimeType(VALID_FILESYSTEM_MIMETYPES, file);
    });
    await this.fileSystemService.createMultipleFiles(folderId, files);
  }

  @Auth('ADMIN', 'TEACHER')
  @Patch('folders/:folderId')
  public async updateFolder(
    @Param('folderId') folderId: string,
    @Body() updateFolderDto: UpdateFolderDto,
  ): Promise<void> {
    await this.fileSystemService.updateFolder(folderId, updateFolderDto);
  }

  @Auth('ADMIN', 'TEACHER')
  @Post('folders/:folderId/folders')
  public async createFolder(
    @Body() createFolderDto: CreateFolderDto,
    @Param('folderId') folderId: string,
  ): Promise<void> {
    await this.fileSystemService.createFolder(createFolderDto, folderId);
  }

  @Auth('ADMIN', 'TEACHER', 'STUDENT')
  @Get('folders/:folderId')
  public async getFolderContent(
    @Param('folderId') folderId: string,
    @User() user: IUser,
  ): Promise<GetFolderContentResponse> {
    const canAccess = await this.fileSystemService.checkUserAccessToFolder(
      user,
      folderId,
    );
    if (!canAccess) throw new ForbiddenException();
    return await this.fileSystemService.getFolderContent(folderId);
  }

  @Auth('ADMIN', 'TEACHER')
  @Delete('folders/:id')
  public async removeFolder(@Param('id') id: string): Promise<void> {
    await this.fileSystemService.removeFolder(id);
  }

  @Auth('ADMIN', 'TEACHER')
  @Patch('files/:id')
  public async updateFile(
    @Param('id') id: string,
    @Body() updateFileDto: UpdateFileDto,
  ): Promise<void> {
    await this.fileSystemService.updateFile(id, updateFileDto);
  }

  @Auth('ADMIN', 'TEACHER')
  @Delete('files/:id')
  public async remove(@Param('id') id: string): Promise<void> {
    await this.fileSystemService.removeFile(id);
  }

  @Auth('ADMIN', 'TEACHER', 'STUDENT')
  @Get('files/:id/download')
  public async generateSignedUrl(@Param('id') id: string): Promise<string> {
    return await this.fileSystemService.generateDownloadUrl(id);
  }
}
