export interface StorageDriver {
  save: (filePath: string) => Promise<string>
}

// Local impl would copy/move files and return a public URL
export class LocalStorageDriver implements StorageDriver {
  async save(filePath: string) {
    // Already saved by Multer; return the served path
    return filePath
  }
}

