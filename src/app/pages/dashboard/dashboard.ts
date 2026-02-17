// dashboard.component.ts
import { 
  ChangeDetectionStrategy, 
  Component, 
  computed, 
  inject, 
  signal,
  effect,
  untracked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';

import { Filter } from './components/filter/filter';
import { DashboardFiltersDto } from './interfaces';
import { TarifasService } from './services/tarifas.service';
import { KpiCard } from '@shared/components/kpi-card/kpi-card';
import { ReloadEtl } from './components/reload-etl/reload-etl';
import { TarifasTable } from './components/tarifas-table/tarifas-table';
import { PaginatorParams } from '@core/interfaces';
import { TarifasChart } from './components/tarifas-chart/tarifas-chart';
import { CardModule } from 'primeng/card';
import { Skeleton, SkeletonModule } from 'primeng/skeleton';
import { ClassNamesModule } from 'primeng/classnames'
import { SharedService } from '@core/services/shared.service';

interface ViewOption {
  label: string;
  value: 'table' | 'chart';
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    Filter, 
    KpiCard, 
    ReloadEtl, 
    SelectButtonModule, 
    TarifasTable,
    TarifasChart, 
    CardModule,
    SkeletonModule,
    ClassNamesModule
  ],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Dashboard {
  private readonly tarifasService = inject(TarifasService);
  private readonly sharedService = inject(SharedService);

    // ✅ Effect: Sincronizar filtros del dashboard con la tabla
  constructor() {
    effect(() => {
      const filters = this.dashboardFilters();
      
      this.tableParams.update(params => ({
        offset: 0,
        limit: params.limit,
        ...filters
      }));

      if (this.sharedService.triggerEtl()) {
        this.dashboardResource.resource.reload();
        this.tableParams.set({
          offset: 0,
          limit: 10,
          ...filters
        });
      }

   

      

    });
  }


  readonly stateOptions: ViewOption[] = [
    { label: 'Tabla', value: 'table', icon: 'pi pi-table' },
    { label: 'Gráfico', value: 'chart', icon: 'pi pi-chart-bar' },
  ];
  
  readonly selectedView = signal<'table' | 'chart'>('table');

  
  
  private readonly dashboardFilters = signal<DashboardFiltersDto>({});

  readonly dashboardResource = this.tarifasService.dashboardResourceWithParams(
    this.dashboardFilters
  );

  readonly dashboardData = computed(() => 
    this.dashboardResource.resource.value()
  );
  
  readonly isLoading = computed(() => 
    this.dashboardResource.resource.isLoading()
  );
  
  readonly error = computed(() => 
    this.dashboardResource.resource.error()
  );

  readonly currentFilters = computed(() => 
    this.dashboardFilters()
  );

  readonly hasActiveFilters = computed(() => {
    const filters = this.dashboardFilters();
    return Object.keys(filters).some(key => 
      filters[key as keyof DashboardFiltersDto] !== undefined && 
      filters[key as keyof DashboardFiltersDto] !== null &&
      filters[key as keyof DashboardFiltersDto] !== ''
    );
  });


  
  readonly tableParams = signal<PaginatorParams>({
    offset: 0,
    limit: 10
  });


  
  
  onComercializadora(value: string) {
 
    this.updateFilter('comercializadora', value);
  }

  onAnio(value: string) {

    const anio = value ? parseInt(value, 10) : undefined;
    this.updateFilter('anio', anio);
  }

  onNivel(value: string) {

    this.updateFilter('nivel', value);
  }

  onPeriodo(value: string) {

    this.updateFilter('periodo', value);
  }

  /**
   * Actualiza un filtro específico
   */
  private updateFilter<K extends keyof DashboardFiltersDto>(
    key: K, 
    value: DashboardFiltersDto[K]
  ) {
    this.dashboardFilters.update(filters => {
      // Si el valor es undefined, null o string vacío, lo removemos
      if (value === undefined || value === null || value === '') {
        const { [key]: _, ...rest } = filters;
        return rest;
      }
      
      // Sino, actualizamos el valor
      return { ...filters, [key]: value };
    });

  }

  /**
   * Limpia todos los filtros
   */
  clearFilters() {

    this.dashboardFilters.set({});
  }

  /**
   * Handler cuando la tabla cambia sus params (paginación)
   */
  onTableParamsChange(newParams: PaginatorParams) {

    this.tableParams.set(newParams);
  }

  /**
   * Cambia la vista (tabla/gráfico)
   */
  onViewChange(view: 'table' | 'chart') {
    this.selectedView.set(view);
  }
}
