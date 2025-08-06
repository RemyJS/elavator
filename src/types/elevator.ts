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
  assignedCalls: string[]; // ID лифтов, которым назначен этот вызов
}

export interface ElevatorState {
  id: string; // Уникальный ID лифта
  currentFloor: number;
  direction: 'up' | 'down' | 'idle';
  passengers: Passenger[];
  isMoving: boolean;
  assignedFloors: number[]; // Этажи, назначенные этому лифту
  isEnabled: boolean; // Включен ли лифт
}

export interface ElevatorStatistics {
  totalPassengers: number;
  completedTrips: number;
  averageTravelTime: number;
}

export interface BuildingState {
  floors: Map<number, Floor>;
  elevators: ElevatorState[]; // Массив лифтов
  statistics: ElevatorStatistics;
}
