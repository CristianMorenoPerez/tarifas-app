export interface EtlRunResponse {
  success: boolean;
  mensaje: string;
  totalRegistros: number;
  duracionMs: number;
  timestamp: string;
}

export interface LastUpdateResponse {
  id: string;
  createdAt: string;
  status?: string;
  totalRegistros?: number;
}