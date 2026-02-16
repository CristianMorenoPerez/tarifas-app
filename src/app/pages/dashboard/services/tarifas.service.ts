// services/tarifas.service.ts
import { Injectable, Signal } from "@angular/core";
import { BaseCrudService } from "@core/services/base-crud.service";
import { 

  PaginatorParams,
  PaginatorResponse
} from "@core/interfaces";
import { environment } from "src/environments/environment";
import { DashboardFiltersDto, DashboardResponse, EtlRunResponse, LastUpdateResponse, Tarifas, TarifasOptions } from "../interfaces";
import { Value } from "@core/interfaces/value.interdace";
import { lastValueFrom } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class TarifasService extends BaseCrudService<Tarifas> {
  protected override readonly endpoint = `${environment.apiUrl}tarifas`;


  /**
   * Resource para listado paginado con filtros reactivos
   * GET /tarifas?offset=0&limit=10&anio=2024...
   */
  tarifasResourceWithParams = (paramsSignal: Signal<PaginatorParams>) => {
    return this.createCustomResourceWithExternalParams<PaginatorResponse<Tarifas>>(
      '', // Sin path adicional, va directo a /tarifas
      paramsSignal
    );
  };

  /**
   * Resource para opciones de filtros (combos)
   * GET /tarifas/options
   */
  optionsResource = () => {
    return this.createCustomResource<TarifasOptions>('options');
  };

  /**
   * Resource para dashboard con parámetros reactivos
   * GET /tarifas/dashboard
   */
  dashboardResourceWithParams = (filtersSignal: Signal<DashboardFiltersDto>) => {
    return this.createCustomResourceWithExternalParams<Value[]>(
      'dashboard', 
      filtersSignal
    );
  };


    /**
   * Resource para obtener última actualización
   * GET /tarifas/ultima-actualizacion
   */
  lastUpdateResource = () => {
    return this.createCustomResource<LastUpdateResponse>('ultima-actualizacion');
  };

    async runEtl(): Promise<EtlRunResponse> {
    try {
      const response = await lastValueFrom(
        this.http.post<EtlRunResponse>(`${environment.apiUrl}etl/run`, {})
      );
      return response;
    } catch (error: any) {
      throw new Error(error?.error?.mensaje || 'Error al ejecutar el proceso ETL');
    }
  }

}