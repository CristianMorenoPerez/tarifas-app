import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { MessagesService } from '@core/services/messages.service';
import { TarifasService } from '@pages/dashboard/services/tarifas.service';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reload-etl',
  standalone: true,
  imports: [ButtonModule, CommonModule],
  templateUrl: './reload-etl.html',
  styleUrl: './reload-etl.css',
})
export class ReloadEtl implements OnInit {
  private readonly tarifasService = inject(TarifasService);
  private readonly messageService = inject(MessagesService);

  readonly isRunning = signal(false);
  
  // ✅ Crear el resource una sola vez
  readonly lastUpdateResource = this.tarifasService.lastUpdateResource();
  
  // ✅ Computed para acceder al valor del resource
  readonly lastUpdate = signal<any>(null);
  readonly isLoadingUpdate = signal(false);

  constructor() {
    // ✅ Effect para sincronizar el resource con el signal local
    effect(() => {
      const update = this.lastUpdateResource.resource.value();
      const loading = this.lastUpdateResource.resource.isLoading();
      
      this.isLoadingUpdate.set(loading);
      
      if (update) {
        console.log('📅 Última actualización cargada:', update);
        this.lastUpdate.set(update);
      }
    });
  }

  ngOnInit() {
    console.log('🔄 Componente ReloadEtl iniciado');
    // El resource se carga automáticamente, no necesitas hacer nada aquí
  }

  async runEtl() {
    if (this.isRunning()) return;

    this.isRunning.set(true);

    try {
      const response = await this.tarifasService.runEtl();

      if (response.success) {
        // Actualizar última actualización local
        this.lastUpdate.set({
          id: crypto.randomUUID(),
          createdAt: response.timestamp,
          status: 'success',
          totalRegistros: response.totalRegistros
        });

        // Mostrar toast de éxito
        this.messageService.showSuccess(
          'ETL completado', 
          `Se han procesado ${response.totalRegistros} registros en ${response.duracionMs} ms.`
        );

        // ✅ Recargar el resource de última actualización
        this.lastUpdateResource.resource.reload();

        // Emitir evento para recargar todo
        window.dispatchEvent(new CustomEvent('etl-completed', { 
          detail: response 
        }));
      } else {
        this.messageService.showError('Error en ETL', response.mensaje);
      }
    } catch (error: any) {
      console.error('Error al ejecutar ETL:', error);
      this.messageService.showError(
        'Error al ejecutar ETL', 
        error?.message || 'Ocurrió un error inesperado.'
      );
    } finally {
      this.isRunning.set(false);
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
}