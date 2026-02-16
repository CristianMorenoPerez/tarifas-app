import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessagesService } from './core/services/messages.service';
import { ConfirmationsService } from '@core/services/confirmation.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ButtonModule, ToastModule, ConfirmDialogModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly messageService = inject(MessagesService);
  private readonly confirmationService = inject(ConfirmationsService);

  protected readonly title = signal('school-app');



  confirm() {
    this.confirmationService.confirmation({
      message: 'Are you sure that you want to proceed?',
      header: 'Confirmation',
      accept: () => {
        this.messageService.showSuccess('Confirmed', 'You have accepted');
      },
      reject: () => {
        this.messageService.showError('Rejected', 'You have rejected');
      },
    });
  }
}
