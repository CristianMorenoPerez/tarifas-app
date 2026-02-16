import { Component, computed, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TarifasService } from '@pages/dashboard/services/tarifas.service';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-filter',
  imports: [SelectModule, FormsModule],
  templateUrl: './filter.html'
})
export class Filter {


  onComercializadora = output<string>();  
  onAnio = output<string>();  
  onNivel = output<string>();  
  onPeriodo = output<string>();

  tarifasService = inject(TarifasService);
  tarifasOptions = this.tarifasService.optionsResource();

  selectedComercializadora: string | null = null;
  selectedAnio: string | null = null;
  selectedNivel: string | null = null;
  selectedPeriodo: string | null = null;

  comercializadoras = computed(() => {
    return this.tarifasOptions.resource.value()?.comercializadoras || [];
  });
  anios = computed(() => {
    return this.tarifasOptions.resource.value()?.anios || [];
  });
  niveles = computed(() => {
    return this.tarifasOptions.resource.value()?.niveles || [];
  })
  periodos = computed(() => {
     return this.tarifasOptions.resource.value()?.periodos || [];
  });

  onChangeComercializadora(event: any) {
    this.onComercializadora.emit(event.value);
  }
  onChangeAnio(event: any) {
    this.onAnio.emit(event.value);
  }
  onChangeNivel(event: any) {
    this.onNivel.emit(event.value);
  }
  onChangePeriodo(event: any) {
    this.onPeriodo.emit(event.value);
  }

}

