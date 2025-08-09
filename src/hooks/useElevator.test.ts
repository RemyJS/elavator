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
  cleanupEmptyAssignments,
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
  assignedCalls: [],
});

const createMockBuilding = (): BuildingState => {
  const floors = new Map<number, Floor>();

  for (let i = BUILDING_CONFIG.TOTAL_FLOORS; i >= 1; i--) {
    floors.set(i, createMockFloor(i));
  }

  return {
    floors,
    elevators: [
      {
        id: 'elevator-1',
        currentFloor: 1,
        direction: 'idle',
        passengers: [],
        isMoving: false,
        assignedFloors: [],
        isEnabled: true,
      },
      {
        id: 'elevator-2',
        currentFloor: BUILDING_CONFIG.TOTAL_FLOORS,
        direction: 'idle',
        passengers: [],
        isMoving: false,
        assignedFloors: [],
        isEnabled: true,
      },
    ],
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
    it('should pickup passengers from floor', () => {
      const floorNumber = 3;
      const passengers = [
        createMockPassenger('passenger-1', floorNumber, 5),
        createMockPassenger('passenger-2', floorNumber, 7),
      ];

      const floorWithPassengers = createMockFloor(floorNumber, passengers);
      building.floors.set(floorNumber, floorWithPassengers);

      const result = pickupPassengers(building, 'elevator-1', floorNumber);
      const updatedFloor = result.floors.get(floorNumber)!;
      const updatedElevator = result.elevators[0];

      expect(updatedFloor.waitingPassengers.length).toBe(0);
      expect(updatedElevator.passengers.length).toBe(2);
      expect(updatedFloor.isCalling).toBe(false);
    });

    it('should not pickup when elevator is full', () => {
      const floorNumber = 3;
      const passengers = [createMockPassenger('passenger-1', floorNumber, 5)];
      const floorWithPassengers = createMockFloor(floorNumber, passengers);

      building.floors.set(floorNumber, floorWithPassengers);
      building.elevators[0].passengers = Array(BUILDING_CONFIG.MAX_PASSENGERS_IN_ELEVATOR)
        .fill(null)
        .map((_, i) => createMockPassenger(`elevator-passenger-${i}`, 1, 5));

      const result = pickupPassengers(building, 'elevator-1', floorNumber);
      const updatedFloor = result.floors.get(floorNumber)!;
      const updatedElevator = result.elevators[0];

      expect(updatedFloor.waitingPassengers.length).toBe(1); // Не изменилось
      expect(updatedElevator.passengers.length).toBe(BUILDING_CONFIG.MAX_PASSENGERS_IN_ELEVATOR);
    });

    it('should not pickup from empty floor', () => {
      const floorNumber = 3;

      const result = pickupPassengers(building, 'elevator-1', floorNumber);
      const updatedFloor = result.floors.get(floorNumber)!;
      const updatedElevator = result.elevators[0];

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

      building.elevators[0].passengers = passengers;

      const result = dropOffPassengers(building, 'elevator-1', floorNumber);
      const updatedFloor = result.floors.get(floorNumber)!;
      const updatedElevator = result.elevators[0];

      expect(updatedFloor.arrivedPassengers.length).toBe(2);
      expect(updatedElevator.passengers.length).toBe(0);
      expect(result.statistics.completedTrips).toBe(2);
    });

    it('should not drop off when no passengers for this floor', () => {
      const floorNumber = 5;
      const passengers = [
        createMockPassenger('passenger-1', 3, 7), // Цель не floorNumber
      ];

      building.elevators[0].passengers = passengers;

      const result = dropOffPassengers(building, 'elevator-1', floorNumber);
      const updatedFloor = result.floors.get(floorNumber)!;
      const updatedElevator = result.elevators[0];

      expect(updatedFloor.arrivedPassengers.length).toBe(0);
      expect(updatedElevator.passengers.length).toBe(1);
    });

    it('should calculate travel time correctly', () => {
      const floorNumber = 5;
      const passenger = createMockPassenger('passenger-1', 3, floorNumber);
      passenger.createdAt = Date.now() - 5000; // 5 секунд назад

      building.elevators[0].passengers = [passenger];

      const result = dropOffPassengers(building, 'elevator-1', floorNumber);
      const updatedFloor = result.floors.get(floorNumber)!;
      const arrivedPassenger = updatedFloor.arrivedPassengers[0];

      expect(arrivedPassenger.travelTime).toBe(5);
      expect(arrivedPassenger.arrivedAt).toBeGreaterThan(0);
    });
  });

  describe('moveElevator', () => {
    it('should move elevator to target floor', () => {
      const targetFloor = 5;
      const initialFloor = building.elevators[0].currentFloor;

      const result = moveElevator(building, 'elevator-1', targetFloor);
      const updatedElevator = result.elevators[0];

      expect(updatedElevator.currentFloor).toBe(targetFloor);
      expect(initialFloor).not.toBe(targetFloor);
    });
  });

  describe('updateElevatorState', () => {
    it('should update elevator state', () => {
      const updates = {
        direction: 'up' as const,
        isMoving: true,
      };

      const result = updateElevatorState(building, 'elevator-1', updates);
      const updatedElevator = result.elevators[0];

      expect(updatedElevator.direction).toBe('up');
      expect(updatedElevator.isMoving).toBe(true);
      expect(updatedElevator.currentFloor).toBe(1); // Не изменилось
    });
  });

  describe('cleanupEmptyAssignments', () => {
    it('should remove assignments for floors with no waiting passengers', () => {
      // Создаем здание с назначениями на пустые этажи
      const testBuilding = createMockBuilding();

      // Добавляем назначения на этажи 3 и 6
      testBuilding.elevators[0].assignedFloors = [3, 6];
      testBuilding.elevators[1].assignedFloors = [4, 7];

      // Устанавливаем assignedCalls на этажах
      testBuilding.floors.get(3)!.assignedCalls = ['elevator-1'];
      testBuilding.floors.get(4)!.assignedCalls = ['elevator-2'];
      testBuilding.floors.get(6)!.assignedCalls = ['elevator-1'];
      testBuilding.floors.get(7)!.assignedCalls = ['elevator-2'];

      const result = cleanupEmptyAssignments(testBuilding);

      // Проверяем, что назначения удалены
      expect(result.elevators[0].assignedFloors).toEqual([]);
      expect(result.elevators[1].assignedFloors).toEqual([]);
      expect(result.floors.get(3)!.assignedCalls).toEqual([]);
      expect(result.floors.get(4)!.assignedCalls).toEqual([]);
      expect(result.floors.get(6)!.assignedCalls).toEqual([]);
      expect(result.floors.get(7)!.assignedCalls).toEqual([]);
    });

    it('should keep assignments for floors with waiting passengers', () => {
      // Создаем здание с пассажирами на этаже 3
      const testBuilding = createMockBuilding();
      const passenger = createMockPassenger('passenger-1', 3, 7);

      // Добавляем пассажира на этаж 3
      testBuilding.floors.get(3)!.waitingPassengers = [passenger];
      testBuilding.floors.get(3)!.isCalling = true;

      // Добавляем назначения
      testBuilding.elevators[0].assignedFloors = [3, 6];
      testBuilding.floors.get(3)!.assignedCalls = ['elevator-1'];
      testBuilding.floors.get(6)!.assignedCalls = ['elevator-1'];

      const result = cleanupEmptyAssignments(testBuilding);

      // Проверяем, что назначение на этаж 3 сохранено, а на этаж 6 удалено
      expect(result.elevators[0].assignedFloors).toEqual([3]);
      expect(result.floors.get(3)!.assignedCalls).toEqual(['elevator-1']);
      expect(result.floors.get(6)!.assignedCalls).toEqual([]);
    });

    it('should handle multiple elevators with mixed assignments', () => {
      const testBuilding = createMockBuilding();
      const passenger1 = createMockPassenger('passenger-1', 3, 7);
      const passenger2 = createMockPassenger('passenger-2', 5, 9);

      // Добавляем пассажиров на разные этажи
      testBuilding.floors.get(3)!.waitingPassengers = [passenger1];
      testBuilding.floors.get(3)!.isCalling = true;
      testBuilding.floors.get(5)!.waitingPassengers = [passenger2];
      testBuilding.floors.get(5)!.isCalling = true;

      // Назначаем лифты
      testBuilding.elevators[0].assignedFloors = [3, 6]; // 3 с пассажирами, 6 пустой
      testBuilding.elevators[1].assignedFloors = [4, 5]; // 4 пустой, 5 с пассажирами

      testBuilding.floors.get(3)!.assignedCalls = ['elevator-1'];
      testBuilding.floors.get(4)!.assignedCalls = ['elevator-2'];
      testBuilding.floors.get(5)!.assignedCalls = ['elevator-2'];
      testBuilding.floors.get(6)!.assignedCalls = ['elevator-1'];

      const result = cleanupEmptyAssignments(testBuilding);

      // Проверяем результаты
      expect(result.elevators[0].assignedFloors).toEqual([3]); // Только этаж с пассажирами
      expect(result.elevators[1].assignedFloors).toEqual([5]); // Только этаж с пассажирами

      expect(result.floors.get(3)!.assignedCalls).toEqual(['elevator-1']);
      expect(result.floors.get(4)!.assignedCalls).toEqual([]);
      expect(result.floors.get(5)!.assignedCalls).toEqual(['elevator-2']);
      expect(result.floors.get(6)!.assignedCalls).toEqual([]);
    });

    it('should return unchanged building when no empty assignments', () => {
      const testBuilding = createMockBuilding();
      const passenger = createMockPassenger('passenger-1', 3, 7);

      // Добавляем пассажира и назначение
      testBuilding.floors.get(3)!.waitingPassengers = [passenger];
      testBuilding.floors.get(3)!.isCalling = true;
      testBuilding.elevators[0].assignedFloors = [3];
      testBuilding.floors.get(3)!.assignedCalls = ['elevator-1'];

      const result = cleanupEmptyAssignments(testBuilding);

      // Проверяем, что ничего не изменилось
      expect(result.elevators[0].assignedFloors).toEqual([3]);
      expect(result.floors.get(3)!.assignedCalls).toEqual(['elevator-1']);
    });
  });
});
