import { Injectable } from '@angular/core';
//import { getDownloadURL } from 'firebase/storage';
import { Storage , ref, uploadBytes, getDownloadURL} from '@angular/fire/storage';


@Injectable({ providedIn: 'root' })

export class FirebaseStorageService {
    
  constructor(private storage: Storage) {}

  async uploadFile(file: File, path: string): Promise<string> {
    const storageRef = ref(this.storage, path);
    await uploadBytes(storageRef, file).then(x=>{
      //console.log(x)
    });
    return await getDownloadURL(storageRef);
  }
}
