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
    tanque_id?: string;
  };
}

export interface GeoJSONCollection {
  type: string;
  features: GeoJSONFeature[];
}
