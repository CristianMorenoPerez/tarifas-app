import { Injectable, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
    triggerEtl = signal<boolean>(false);
    
    setTriggerEtl(value: boolean) {
        this.triggerEtl.set(value);
    }

    getTriggerEtl() {
        return this.triggerEtl();
    }
}
