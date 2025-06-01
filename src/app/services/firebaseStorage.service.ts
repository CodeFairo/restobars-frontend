import { Injectable } from '@angular/core';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { Storage } from '@angular/fire/storage';


@Injectable({ providedIn: 'root' })

export class FirebaseStorageService {
    
  constructor(private storage: Storage) {}

  async uploadFile(file: File, path: string): Promise<string> {
    const storageRef = ref(this.storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }
}
