// services/base-crud.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, resource, signal, Signal } from '@angular/core';
import { Observable } from 'rxjs';
import { lastValueFrom } from 'rxjs';

export interface PaginationParams {
  offset: number;
  limit: number;
  [key: string]: any; // Para filtros adicionales
}

@Injectable()
export abstract class BaseCrudService<T = any> {
  protected http = inject(HttpClient);
  protected abstract readonly endpoint: string;


  /**
   * Resource para obtener todos los registros
   */
  getAllResource = () => resource({
    loader: async (): Promise<T[]> => {
      const response = await lastValueFrom(
        this.http.get<{ data: T[] }>(`${this.endpoint}`)
      );
      return response.data;
    }
  });

  /**
   * Resource para paginación con filtros reactivos
   */
  createPaginatorResource = (initialParams: Partial<PaginationParams> = {}) => {
    const params = signal<PaginationParams>({
      offset: 0,
      limit: 10,
      ...initialParams
    });

    return {
      params,
      resource: resource({
        params: () => params(),
        loader: async ({ params }): Promise<T> => {
          let httpParams = new HttpParams();
          
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              httpParams = httpParams.set(key, value.toString());
            }
          });

          return lastValueFrom(
            this.http.get<any>(`${this.endpoint}`, { params: httpParams })
          );
        }
      })
    };
  };

  /**
   * Resource para obtener un registro por ID
   */
  createGetByIdResource = () => {
    const idSignal = signal<string | null>(null);

    return {
      id: idSignal,
      resource: resource({
        params: () => idSignal(),
        loader: async ({ params }): Promise<T | null> => {
          if (!params) return null;
          
          const response = await lastValueFrom(
            this.http.get<{ data: T }>(`${this.endpoint}/${params}`)
          );
          return response.data;
        }
      })
    };
  };

  /**
   * Resource genérico para endpoints personalizados
   */
  createCustomResource = <R = any>(path: string, initialParams?: Record<string, any>) => {
    const params = signal(initialParams || {});

    return {
      params,
      resource: resource({
        params: () => params(),
        loader: async ({ params }): Promise<R> => {
          let httpParams = new HttpParams();
          
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              httpParams = httpParams.set(key, value.toString());
            }
          });

          return lastValueFrom(
            this.http.get<R>(`${this.endpoint}/${path}`, { params: httpParams })
          );
        }
      })
    };
  };

  /**
   * Resource con parámetros reactivos externos
   * Acepta un signal externo que el resource observará
   */
  createCustomResourceWithExternalParams = <R = any>(
    path: string,
    externalParams: Signal<Record<string, any>>
  ) => {
    return {
      resource: resource({
        params: () => externalParams(),
        loader: async ({ params }): Promise<R> => {
          let httpParams = new HttpParams();
          
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              httpParams = httpParams.set(key, value.toString());
            }
          });

          return lastValueFrom(
            this.http.get<R>(`${this.endpoint}/${path}`, { params: httpParams })
          );
        }
      })
    };
  };

  create(data: T): Observable<{ data: T }> {
    return this.http.post<{ data: T }>(this.endpoint, data);
  }

  update(id: string, data: Partial<T>): Observable<{ data: T }> {
    return this.http.patch<{ data: T }>(`${this.endpoint}/${id}`, data);
  }

  delete(id: string): Observable<{ data: T }> {
    return this.http.delete<{ data: T }>(`${this.endpoint}/${id}`);
  }
}