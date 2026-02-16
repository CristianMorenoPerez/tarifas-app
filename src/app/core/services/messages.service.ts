import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  private messageService = inject(MessageService);

  showSuccess(summary: string, detail: string = '') {
    this.messageService.add({
      key: 'tr', // ⚠️ Importante: debe coincidir con el key del p-toast
      severity: 'success',
      summary,
      detail,
      closeIcon: 'icon-[ph--x-bold] text-[1.5rem]',
      icon: 'icon-[ph--check-circle] text-[2rem]',
    });
  }

  showError(summary: string, detail: string = '') {
    this.messageService.add({
      key: 'tr', // ⚠️ Importante: debe coincidir con el key del p-toast
      severity: 'error',
      summary,
      detail,
      closeIcon: 'icon-[ph--x-bold] text-[1.5rem]',
      icon: 'icon-[ph--x-circle] text-[2rem]',
    });
  }
}
