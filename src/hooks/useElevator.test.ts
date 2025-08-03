import { describe, it, expect, beforeEach } from 'vitest';
import type { BuildingState, Passenger, Floor } from '../types/elevator';
import { BUILDING_CONFIG } from '../utils/constants';

// Импортируем чистые функции
import {
  addPassengerToFloor,
  pickupPassengers,
  dropOffPassengers,
  moveElevator,
  updateElevatorState,
} from './useElevator';

// Мок-данные для тестов
const createMockPassenger = (id: string, currentFloor: number, targetFloor: number): Passenger => ({
  id,
  currentFloor,
  targetFloor,
  createdAt: Date.now(),
  color: '#ff0000',
  arrivedAt: null,
  travelTime: null,
});

const createMockFloor = (
  number: number,
  waiting: Passenger[] = [],
  arrived: Passenger[] = [],
): Floor => ({
  number,
  waitingPassengers: waiting,
  arrivedPassengers: arrived,
  isCalling: waiting.length > 0,
});

const createMockBuilding = (): BuildingState => {
  const floors = new Map<number, Floor>();

  for (let i = BUILDING_CONFIG.TOTAL_FLOORS; i >= 1; i--) {
    floors.set(i, createMockFloor(i));
  }

  return {
    floors,
    elevator: {
      currentFloor: 1,
      direction: 'idle',
      passengers: [],
      isMoving: false,
    },
    statistics: {
      totalPassengers: 0,
      completedTrips: 0,
      averageTravelTime: 0,
    },
  };
};

describe('Elevator Pure Functions', () => {
  let building: BuildingState;

  beforeEach(() => {
    building = createMockBuilding();
  });

  describe('addPassengerToFloor', () => {
    it('should add passenger to floor when space available', () => {
      const floorNumber = 3;
      const initialFloor = building.floors.get(floorNumber)!;
      expect(initialFloor.waitingPassengers.length).toBe(0);

      const result = addPassengerToFloor(building, floorNumber);
      const updatedFloor = result.floors.get(floorNumber)!;

      expect(updatedFloor.waitingPassengers.length).toBe(1);
      expect(updatedFloor.isCalling).toBe(true);
      expect(result.statistics.totalPassengers).toBe(1);
    });

    it('should not add passenger when floor is full (10 passengers)', () => {
      const floorNumber = 3;
      const fullFloor = createMockFloor(
        floorNumber,
        Array(10)
          .fill(null)
          .map((_, i) => createMockPassenger(`passenger-${i}`, floorNumber, 5)),
      );

      building.floors.set(floorNumber, fullFloor);

      const result = addPassengerToFloor(building, floorNumber);
      const updatedFloor = result.floors.get(floorNumber)!;

      expect(updatedFloor.waitingPassengers.length).toBe(10); // Не изменилось
    });

    it('should not add passenger to non-existent floor', () => {
      const nonExistentFloor = 999;

      const result = addPassengerToFloor(building, nonExistentFloor);

      expect(result).toBe(building); // Возвращает исходное состояние
    });
  });

  describe('pickupPassengers', () => {
    it('should pickup passengers when elevator has space', () => {
      const floorNumber = 3;
      const passengers = [
        createMockPassenger('passenger-1', floorNumber, 5),
        createMockPassenger('passenger-2', floorNumber, 7),
      ];

      const floorWithPassengers = createMockFloor(floorNumber, passengers);
      building.floors.set(floorNumber, floorWithPassengers);

      const result = pickupPassengers(building, floorNumber);
      const updatedFloor = result.floors.get(floorNumber)!;
      const updatedElevator = result.elevator;

      expect(updatedFloor.waitingPassengers.length).toBe(0);
      expect(updatedElevator.passengers.length).toBe(2);
      expect(updatedFloor.isCalling).toBe(false);
    });

    it('should not pickup when elevator is full', () => {
      const floorNumber = 3;
      const passengers = [createMockPassenger('passenger-1', floorNumber, 5)];
      const floorWithPassengers = createMockFloor(floorNumber, passengers);

      building.floors.set(floorNumber, floorWithPassengers);
      building.elevator.passengers = Array(BUILDING_CONFIG.MAX_PASSENGERS_IN_ELEVATOR)
        .fill(null)
        .map((_, i) => createMockPassenger(`elevator-passenger-${i}`, 1, 5));

      const result = pickupPassengers(building, floorNumber);
      const updatedFloor = result.floors.get(floorNumber)!;
      const updatedElevator = result.elevator;

      expect(updatedFloor.waitingPassengers.length).toBe(1); // Не изменилось
      expect(updatedElevator.passengers.length).toBe(BUILDING_CONFIG.MAX_PASSENGERS_IN_ELEVATOR);
    });

    it('should not pickup from empty floor', () => {
      const floorNumber = 3;

      const result = pickupPassengers(building, floorNumber);
      const updatedFloor = result.floors.get(floorNumber)!;
      const updatedElevator = result.elevator;

      expect(updatedFloor.waitingPassengers.length).toBe(0);
      expect(updatedElevator.passengers.length).toBe(0);
    });
  });

  describe('dropOffPassengers', () => {
    it('should drop off passengers at their target floor', () => {
      const floorNumber = 5;
      const passengers = [
        createMockPassenger('passenger-1', 3, floorNumber),
        createMockPassenger('passenger-2', 7, floorNumber),
      ];

      building.elevator.passengers = passengers;

      const result = dropOffPassengers(building, floorNumber);
      const updatedFloor = result.floors.get(floorNumber)!;
      const updatedElevator = result.elevator;

      expect(updatedFloor.arrivedPassengers.length).toBe(2);
      expect(updatedElevator.passengers.length).toBe(0);
      expect(result.statistics.completedTrips).toBe(2);
    });

    it('should not drop off when no passengers for this floor', () => {
      const floorNumber = 5;
      const passengers = [
        createMockPassenger('passenger-1', 3, 7), // Цель не floorNumber
      ];

      building.elevator.passengers = passengers;

      const result = dropOffPassengers(building, floorNumber);
      const updatedFloor = result.floors.get(floorNumber)!;
      const updatedElevator = result.elevator;

      expect(updatedFloor.arrivedPassengers.length).toBe(0);
      expect(updatedElevator.passengers.length).toBe(1);
    });

    it('should calculate travel time correctly', () => {
      const floorNumber = 5;
      const passenger = createMockPassenger('passenger-1', 3, floorNumber);
      passenger.createdAt = Date.now() - 5000; // 5 секунд назад

      building.elevator.passengers = [passenger];

      const result = dropOffPassengers(building, floorNumber);
      const updatedFloor = result.floors.get(floorNumber)!;
      const arrivedPassenger = updatedFloor.arrivedPassengers[0];

      expect(arrivedPassenger.travelTime).toBe(5);
      expect(arrivedPassenger.arrivedAt).toBeGreaterThan(0);
    });
  });

  describe('moveElevator', () => {
    it('should move elevator to target floor', () => {
      const targetFloor = 5;
      const initialFloor = building.elevator.currentFloor;

      const result = moveElevator(building, targetFloor);
      const updatedElevator = result.elevator;

      expect(updatedElevator.currentFloor).toBe(targetFloor);
      expect(initialFloor).not.toBe(targetFloor);
    });
  });

  describe('updateElevatorState', () => {
    it('should update elevator state with partial updates', () => {
      const updates = {
        direction: 'up' as const,
        isMoving: true,
      };

      const result = updateElevatorState(building, updates);
      const updatedElevator = result.elevator;

      expect(updatedElevator.direction).toBe('up');
      expect(updatedElevator.isMoving).toBe(true);
      expect(updatedElevator.currentFloor).toBe(1); // Не изменилось
    });
  });
});
