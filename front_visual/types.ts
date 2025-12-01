export interface Coordinates {
  lat: number;
  lng: number;
}

export interface RouteStep {
  instruction: string;
  distance?: string;
}

export interface RouteData {
  origin: {
    name: string;
    coords: Coordinates;
  };
  destination: {
    name: string;
    coords: Coordinates;
  };
  
  // URL da imagem (
  mapImageUrl?: string; 

  // Checar caminho possível 
  possivel?: boolean;

  pathCoordinates?: [number, number][]; 
  
  steps: RouteStep[];
  totalDistance: string;
  estimatedDuration: string;
}

export enum Theme {
  DAY = 'day',
  NIGHT = 'night',
}