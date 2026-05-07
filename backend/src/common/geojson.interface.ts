export interface GeoJSONFeature {
  type: string;
  id: string;
  geometry: {
    type: string;
    coordinates: any;
  };
  properties: {
    id: string;
    nombre?: string;
    estado?: string;
    reservorio_id?: string;
    radio_cobertura?: number;
  };
}

export interface GeoJSONCollection {
  type: string;
  features: GeoJSONFeature[];
}