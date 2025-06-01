/*(method) FileSystemService.getFolderContent(folderId: string): Promise<{
    folders: {
        numberOfChildren: number;
        _count: {
            files: number;
            folders: number;
        };
        id: string;
        courseId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        parentId: string;
        isRoot: boolean;
    }[];
    parentId: string;
    files: (GetResult<...> & {})[];
    name: string;
    id: string;
}>*/

export class GetFolderContentResponse {
  folders: GetFolderContentResponseFolder[];
  parentId: string;
  files: GetFolderContentResponseFile[];
  name: string;
  id: string;
}

export class GetFolderContentResponseFolder {
  numberOfChildren: number;
  _count: {
    files: number;
    folders: number;
  };
  id: string;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  parentId: string;
  isRoot: boolean;
}

export class GetFolderContentResponseFile {
  id: string;
  name: string;
  contentType: string;
  createdAt: Date;
  updatedAt: Date;
  folderId: string;
}
