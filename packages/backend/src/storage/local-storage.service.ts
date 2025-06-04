import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class LocalStorageService {
  private readonly uploadDir: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadDir =
      this.configService.get<string>('LOCAL_MATERIALS_DIRECTORY') ||
      './docs';
  }

  async saveFile(filename: string, buffer: Buffer) {
    await fs.mkdir(this.uploadDir, { recursive: true });
    const filePath = path.join(this.uploadDir, filename);
    await fs.writeFile(filePath, buffer);
    console.log(`File saved to ${buffer.length} bytes at ${filePath}`);
    return filePath;
  }

  async deleteFile(filename: string) {
    const filePath = path.join(this.uploadDir, filename);
    // Only try to delete if file exists
    try {
      await fs.unlink(filePath);
    } catch (err: any) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }
  }

  getFilePath(filename: string) {
    return path.join(this.uploadDir, filename);
  }

  async listFiles(): Promise<string[]> {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      const files = await fs.readdir(this.uploadDir);
      return files;
    } catch (err) {
      return [];
    }
  }
}

