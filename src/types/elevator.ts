export interface Passenger {
  id: string;
  currentFloor: number;
  targetFloor: number;
  createdAt: number;
  color: string;
  arrivedAt: number | null;
  travelTime: number | null; // Время в пути в секундах
}

export interface Floor {
  number: number;
  waitingPassengers: Passenger[]; // FIFO очередь ожидания
  arrivedPassengers: Passenger[]; // Прибывшие пассажиры
  isCalling: boolean;
}

export interface ElevatorState {
  currentFloor: number;
  direction: 'up' | 'down' | 'idle';
  passengers: Passenger[];
  isMoving: boolean;
}

export interface ElevatorStatistics {
  totalPassengers: number;
  completedTrips: number;
  averageTravelTime: number;
}

export interface BuildingState {
  floors: Map<number, Floor>;
  elevator: ElevatorState;
  statistics: ElevatorStatistics;
}

// Типы для reducer паттерна
export type ElevatorAction =
  | { type: 'CALL_ELEVATOR'; floorNumber: number }
  | { type: 'MOVE_ELEVATOR'; targetFloor: number }
  | { type: 'PICKUP_PASSENGERS'; floorNumber: number; passengers: Passenger[] }
  | { type: 'DROP_OFF_PASSENGERS'; floorNumber: number; passengers: Passenger[] }
  | { type: 'UPDATE_STATISTICS'; passenger: Passenger }
  | { type: 'SET_ELEVATOR_STATE'; state: Partial<ElevatorState> };
