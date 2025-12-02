export interface Lugar {
  nome: string;
  id: number;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface RouteStep {
  instruction: string;
  distance?: string;
}

export enum Theme {
  DAY = 'day',
  NIGHT = 'night',
}