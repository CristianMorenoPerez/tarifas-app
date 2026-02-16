// components/tarifas-charts/tarifas-charts.component.ts
import { 
  ChangeDetectionStrategy, 
  Component, 
  computed, 
  inject,
  input,
  output
} from '@angular/core';
import { CommonModule } from '@angular/common';


import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';

import { PaginatorParams } from '@core/interfaces';
import { TarifasService } from '@pages/dashboard/services/tarifas.service';

@Component({
  selector: 'app-tarifas-chart',
  standalone: true,
  imports: [
    CommonModule,
    ChartModule,
    CardModule,
    ButtonModule,
    SkeletonModule,
    TooltipModule
  ],
  templateUrl: './tarifas-chart.html',
  styleUrls: ['./tarifas-chart.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TarifasChart {
  private readonly tarifasService = inject(TarifasService);

  
  readonly chartParams = input.required<PaginatorParams>();
  readonly paramsChange = output<PaginatorParams>();

  
  // ✅ Usamos el mismo resource que la tabla, pero con más límite
  readonly tarifasResource = this.tarifasService.tarifasResourceWithParams(
    computed(() => ({
      ...this.chartParams(),
      limit: 100, // Traer más datos para gráficos
      offset: 0
    }))
  );

  
  readonly tarifas = computed(() => 
    this.tarifasResource.resource.value()?.pages ?? []
  );

  readonly isLoading = computed(() => 
    this.tarifasResource.resource.isLoading()
  );

  readonly error = computed(() => 
    this.tarifasResource.resource.error()
  );

  readonly hasActiveFilters = computed(() => {
    const params = this.chartParams();
    return !!(params.anio || params.periodo || params.comercializadora || params.nivel);
  });


  // ✅ Agrupar por comercializadora
  readonly dataByComercializadora = computed(() => {
    const tarifas = this.tarifas();
    if (tarifas.length === 0) return null;

    // Agrupar y promediar
    const grouped = tarifas.reduce((acc, tarifa) => {
      if (!acc[tarifa.comercializadora]) {
        acc[tarifa.comercializadora] = {
          sum: 0,
          count: 0
        };
      }
      acc[tarifa.comercializadora].sum += tarifa.cuTotal;
      acc[tarifa.comercializadora].count += 1;
      return acc;
    }, {} as Record<string, { sum: number; count: number }>);

    // Convertir a arrays y ordenar por promedio
    const sorted = Object.entries(grouped)
      .map(([comercializadora, data]) => ({
        comercializadora,
        promedio: data.sum / data.count
      }))
      .sort((a, b) => b.promedio - a.promedio)
      .slice(0, 10); // Top 10

    return {
      labels: sorted.map(item => item.comercializadora),
      values: sorted.map(item => item.promedio)
    };
  });

  // ✅ Agrupar por período
  readonly dataByPeriodo = computed(() => {
    const tarifas = this.tarifas();
    if (tarifas.length === 0) return null;

    const grouped = tarifas.reduce((acc, tarifa) => {
      if (!acc[tarifa.periodo]) {
        acc[tarifa.periodo] = {
          sum: 0,
          count: 0
        };
      }
      acc[tarifa.periodo].sum += tarifa.cuTotal;
      acc[tarifa.periodo].count += 1;
      return acc;
    }, {} as Record<string, { sum: number; count: number }>);

    const sorted = Object.entries(grouped)
      .map(([periodo, data]) => ({
        periodo,
        promedio: data.sum / data.count
      }))
      .sort((a, b) => a.periodo.localeCompare(b.periodo));

    return {
      labels: sorted.map(item => item.periodo),
      values: sorted.map(item => item.promedio)
    };
  });

  // ✅ Agrupar por nivel
  readonly dataByNivel = computed(() => {
    const tarifas = this.tarifas();
    if (tarifas.length === 0) return null;

    const grouped = tarifas.reduce((acc, tarifa) => {
      if (!acc[tarifa.nivel]) {
        acc[tarifa.nivel] = {
          sum: 0,
          count: 0
        };
      }
      acc[tarifa.nivel].sum += tarifa.cuTotal;
      acc[tarifa.nivel].count += 1;
      return acc;
    }, {} as Record<string, { sum: number; count: number }>);

    return {
      labels: Object.keys(grouped),
      values: Object.values(grouped).map(data => data.sum / data.count)
    };
  });

  // ✅ Métricas de comparación
  readonly comparisonData = computed(() => {
    const tarifas = this.tarifas();
    if (tarifas.length === 0) return null;

    const valores = tarifas.map(t => t.cuTotal);
    const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
    const maxima = Math.max(...valores);
    const minima = Math.min(...valores);

    return { promedio, maxima, minima };
  });

  readonly commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      }
    }
  };

  // Gráfico de Barras
  readonly barChartData = computed(() => {
    const data = this.dataByComercializadora();
    if (!data) return null;

    return {
      labels: data.labels,
      datasets: [
        {
          label: 'CU Total Promedio ($/kWh)',
          data: data.values,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
        }
      ]
    };
  });

  readonly barChartOptions = {
    ...this.commonOptions,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'CU Total ($/kWh)'
        }
      }
    },
    plugins: {
      ...this.commonOptions.plugins,
      title: {
        display: true,
        text: 'Top 10 Comercializadoras por Tarifa Promedio'
      }
    }
  };

  // Gráfico de Línea
  readonly lineChartData = computed(() => {
    const data = this.dataByPeriodo();
    if (!data) return null;

    return {
      labels: data.labels,
      datasets: [
        {
          label: 'Tarifa Promedio',
          data: data.values,
          fill: false,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
        }
      ]
    };
  });

  readonly lineChartOptions = {
    ...this.commonOptions,
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'CU Total ($/kWh)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Período'
        }
      }
    },
    plugins: {
      ...this.commonOptions.plugins,
      title: {
        display: true,
        text: 'Evolución Temporal de Tarifas'
      }
    }
  };

  // Gráfico de Torta
  readonly pieChartData = computed(() => {
    const data = this.dataByNivel();
    if (!data) return null;

    return {
      labels: data.labels,
      datasets: [
        {
          data: data.values,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 2,
        }
      ]
    };
  });

  readonly pieChartOptions = {
    ...this.commonOptions,
    plugins: {
      ...this.commonOptions.plugins,
      title: {
        display: true,
        text: 'Distribución por Nivel de Tensión'
      }
    }
  };

  // Gráfico Radar
  readonly radarChartData = computed(() => {
    const data = this.comparisonData();
    if (!data) return null;

    return {
      labels: ['Promedio', 'Máxima', 'Mínima'],
      datasets: [
        {
          label: 'Tarifas',
          data: [data.promedio, data.maxima, data.minima],
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          pointBackgroundColor: 'rgba(255, 99, 132, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
        }
      ]
    };
  });

  readonly radarChartOptions = {
    ...this.commonOptions,
    scales: {
      r: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'CU Total ($/kWh)'
        }
      }
    },
    plugins: {
      ...this.commonOptions.plugins,
      title: {
        display: true,
        text: 'Comparación de Métricas'
      }
    }
  };

  
  reload() {
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
}