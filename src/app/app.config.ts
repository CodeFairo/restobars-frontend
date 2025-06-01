import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './custom/auth.interceptor';
import { environment } from '../environments/environment';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideStorage, getStorage } from '@angular/fire/storage';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor])),
    
    // Solo este va dentro de importProvidersFrom porque es un módulo Angular clásico
    importProvidersFrom(HttpClientModule), provideFirebaseApp(() => initializeApp({"projectId":"restobarsonline","appId":"1:232399103085:web:dabbcb1215194ff79a8b64","storageBucket":"restobarsonline.firebasestorage.app","apiKey":"AIzaSyDQT8-g_vpMRjSoSTV4OyWwXiQ7z3Dqyu8","authDomain":"restobarsonline.firebaseapp.com","messagingSenderId":"232399103085","measurementId":"G-LYMZ14DWWX"})), provideStorage(() => getStorage())

  ]
};
