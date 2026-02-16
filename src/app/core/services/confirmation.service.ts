import { inject, Injectable } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { Confirmation } from '@core/interfaces';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationsService {
  private confirmationService = inject(ConfirmationService);

  confirmation(confirmation: Confirmation) {
    const { header, message, acceptIcon, rejectIcon, accept, reject } = confirmation;

    this.confirmationService.confirm({
      header,
      message,
      acceptIcon,
      rejectIcon,
      accept: () => {
        const result = accept();
        return result;
      },
      reject: () => {
        if (reject) {
          const result = reject();
          return result;
        }
      },
    });
  }
}
