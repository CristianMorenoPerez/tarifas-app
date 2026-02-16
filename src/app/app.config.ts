import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';
import Aura from '@primeuix/themes/aura';
import { ConfirmationService, MessageService } from 'primeng/api';


export const appConfig: ApplicationConfig = {
  providers: [
    
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: 'light',
        },
      },
    }),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    MessageService,
    ConfirmationService,
  ],
};
