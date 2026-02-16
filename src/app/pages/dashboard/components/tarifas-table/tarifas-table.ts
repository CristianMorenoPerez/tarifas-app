// components/tarifas-table/tarifas-table.component.ts
import { 
  ChangeDetectionStrategy, 
  Component, 
  computed, 
  inject,
  input,
  output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';

import { PaginatorParams } from '@core/interfaces';
import { TarifasService } from '@pages/dashboard/services/tarifas.service';

@Component({
  selector: 'app-tarifas-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    PaginatorModule,
    InputTextModule,
    ButtonModule,
    SkeletonModule,
    TooltipModule
  ],
  templateUrl: './tarifas-table.html',
  styleUrls: ['./tarifas-table.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TarifasTable {
  private readonly tarifasService = inject(TarifasService);
  readonly Math = Math;

  // ✅ Recibe params del padre (incluye filtros + paginación)
  readonly paginatorParams = input.required<PaginatorParams>();

  // ✅ Emite cambios de params al padre (solo paginación)
  readonly paramsChange = output<PaginatorParams>();

  
  readonly tarifasResource = this.tarifasService.tarifasResourceWithParams(
    this.paginatorParams
  );

  readonly optionsResource = this.tarifasService.optionsResource();


  
  readonly tarifas = computed(() => 
    this.tarifasResource.resource.value()?.pages ?? []
  );

  readonly meta = computed(() => 
    this.tarifasResource.resource.value()?.meta
  );

  readonly isLoading = computed(() => 
    this.tarifasResource.resource.isLoading()
  );

  readonly error = computed(() => 
    this.tarifasResource.resource.error()
  );

  readonly options = computed(() => 
    this.optionsResource.resource.value()
  );

  readonly totalRecords = computed(() => 
    this.meta()?.total ?? 0
  );

  readonly currentPage = computed(() => {
    const params = this.paginatorParams();
    return Math.floor(params.offset / params.limit);
  });

  readonly recordsRange = computed(() => {
    const metadata = this.meta();
    if (!metadata) return null;

    const start = (metadata.page - 1) * metadata.limit + 1;
    const end = Math.min(metadata.page * metadata.limit, metadata.total);
    
    return { start, end, total: metadata.total };
  });

  readonly hasActiveFilters = computed(() => {
    const params = this.paginatorParams();
    return !!(params.anio || params.periodo || params.comercializadora || params.nivel);
  });

  
  /**
   * Manejador del evento de paginación de PrimeNG
   */
  onPageChange(event: any) {
    console.log('📄 Tabla - Page change:', event);
    
    const newParams: PaginatorParams = {
      ...this.paginatorParams(),
      offset: event.first,
      limit: event.rows
    };
    
    this.paramsChange.emit(newParams);
  }

  /**
   * Ir a la primera página
   */
  goToFirstPage() {
    const newParams: PaginatorParams = {
      ...this.paginatorParams(),
      offset: 0
    };
    
    this.paramsChange.emit(newParams);
  }

  /**
   * Ir a la última página
   */
  goToLastPage() {
    const meta = this.meta();
    if (!meta) return;
    
    const lastPageOffset = (meta.totalPages - 1) * meta.limit;
    const newParams: PaginatorParams = {
      ...this.paginatorParams(),
      offset: lastPageOffset
    };
    
    this.paramsChange.emit(newParams);
  }

  /**
   * Recarga los datos sin cambiar parámetros
   */
  reload() {
    console.log('🔄 Recargando datos de la tabla');
    this.tarifasResource.resource.reload();
  }

  
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}