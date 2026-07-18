import JSZip from 'jszip';
import { FileItem } from '../types/fileSystem';

export interface ExtractedFile {
  path: string;
  name: string;
  content: string;
  isBinary: boolean;
}

const getMimeFromName = (name: string): string => {
  const ext = name.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', ico: 'image/x-icon',
    pdf: 'application/pdf', mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', flac: 'audio/flac',
    mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime', avi: 'video/x-msvideo',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', xls: 'application/vnd.ms-excel', xlsm: 'application/vnd.ms-excel.sheet.macroEnabled.12',
  };
  return map[ext || ''] || 'application/octet-stream';
};

const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
};

export const extractZipFile = async (file: File): Promise<ExtractedFile[]> => {
  const zip = await JSZip.loadAsync(file);
  const extractedFiles: ExtractedFile[] = [];

  const promises: Promise<void>[] = [];

  zip.forEach((relativePath, zipEntry) => {
    if (zipEntry.dir) return;

    const promise = zipEntry.async('uint8array').then((content) => {
      const name = relativePath.split('/').pop() || relativePath;
      // Try to decode as text first
      const decoder = new TextDecoder('utf-8', { fatal: true });
      let textContent: string;
      let isBinary = false;

      try {
        textContent = decoder.decode(content);
        // Check if content contains null bytes (indicates binary)
        if (textContent.includes('\0')) {
          isBinary = true;
          textContent = `[Binary File - ${content.length} bytes]`;
        }
      } catch {
        // Binary file that can't be decoded as UTF-8
        isBinary = true;
        textContent = `data:${getMimeFromName(name)};base64,${bytesToBase64(content)}`;
      }

      if (isBinary && !textContent.startsWith('data:')) {
        textContent = `data:${getMimeFromName(name)};base64,${bytesToBase64(content)}`;
      }

      extractedFiles.push({
        path: relativePath,
        name,
        content: textContent,
        isBinary,
      });
    });

    promises.push(promise);
  });

  await Promise.all(promises);

  // Sort by path for consistent ordering
  extractedFiles.sort((a, b) => a.path.localeCompare(b.path));

  return extractedFiles;
};

export const createFileItemsFromZip = (
  extractedFiles: ExtractedFile[],
  parentId: string | null = null
): { files: FileItem[]; rootFolders: string[] } => {
  const fileItems: FileItem[] = [];
  const folderMap = new Map<string, string>(); // path -> id
  const rootFolders: string[] = [];

  // First pass: create all folders
  extractedFiles.forEach((file) => {
    const pathParts = file.path.split('/');
    pathParts.pop(); // Remove filename

    let currentPath = '';
    let currentParentId = parentId;

    pathParts.forEach((part) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (!folderMap.has(currentPath)) {
        const folderId = `folder_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        folderMap.set(currentPath, folderId);

        if (!currentParentId && !rootFolders.includes(folderId)) {
          rootFolders.push(folderId);
        }

        fileItems.push({
          id: folderId,
          name: part,
          path: currentPath,
          type: 'folder',
          parentId: currentParentId,
          isExpanded: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        currentParentId = folderId;
      } else {
        currentParentId = folderMap.get(currentPath)!;
      }
    });
  });

  // Second pass: create files
  extractedFiles.forEach((file) => {
    const pathParts = file.path.split('/');
    const fileName = pathParts.pop() || file.name;
    const parentPath = pathParts.join('/');
    const parentId = parentPath ? folderMap.get(parentPath) || null : null;

    const extension = fileName.split('.').pop() || '';

    fileItems.push({
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: fileName,
      path: file.path,
      type: 'file',
      parentId,
      extension,
      content: file.content,
      isModified: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  });

  return { files: fileItems, rootFolders };
};
