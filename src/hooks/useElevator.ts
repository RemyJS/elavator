import { useState, useEffect, useCallback } from 'react';
import type { BuildingState, Passenger, Floor } from '../types/elevator';
import { BUILDING_CONFIG } from '../utils/constants';
import { getFloorColor, getRandomTargetFloor } from '../utils/helpers';

// Простой счетчик для ID пассажиров
let passengerIdCounter = 0;
const generatePassengerId = () => {
  passengerIdCounter += 1;
  return String(passengerIdCounter);
};

const createInitialBuilding = (): BuildingState => {
  const floors = new Map<number, Floor>();

  for (let i = BUILDING_CONFIG.TOTAL_FLOORS; i >= 1; i--) {
    floors.set(i, {
      number: i,
      waitingPassengers: [],
      arrivedPassengers: [],
      isCalling: false,
    });
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

// Чистые функции для обновления состояния
export const addPassengerToFloor = (
  building: BuildingState,
  floorNumber: number,
): BuildingState => {
  const floor = building.floors.get(floorNumber);
  if (!floor) return building;

  if (floor.waitingPassengers.length >= 10) return building;

  const newPassenger: Passenger = {
    id: generatePassengerId(),
    currentFloor: floorNumber,
    targetFloor: getRandomTargetFloor(floorNumber),
    createdAt: Date.now(),
    color: getFloorColor(floorNumber),
    arrivedAt: null,
    travelTime: null,
  };

  const newFloor = {
    ...floor,
    waitingPassengers: [...floor.waitingPassengers, newPassenger],
    isCalling: true,
  };

  const newFloors = new Map(building.floors);
  newFloors.set(floorNumber, newFloor);

  return {
    ...building,
    floors: newFloors,
    statistics: {
      ...building.statistics,
      totalPassengers: building.statistics.totalPassengers + 1,
    },
  };
};

export const pickupPassengers = (building: BuildingState, floorNumber: number): BuildingState => {
  const floor = building.floors.get(floorNumber);
  if (!floor) return building;

  const availableSpace =
    BUILDING_CONFIG.MAX_PASSENGERS_IN_ELEVATOR - building.elevator.passengers.length;
  if (availableSpace <= 0 || floor.waitingPassengers.length === 0) return building;

  const toPickup = floor.waitingPassengers.slice(0, availableSpace);
  const remainingWaiting = floor.waitingPassengers.slice(availableSpace);

  const newFloor = {
    ...floor,
    waitingPassengers: remainingWaiting,
    isCalling: remainingWaiting.length > 0,
  };

  const newFloors = new Map(building.floors);
  newFloors.set(floorNumber, newFloor);

  return {
    ...building,
    floors: newFloors,
    elevator: {
      ...building.elevator,
      passengers: [...building.elevator.passengers, ...toPickup],
    },
  };
};

export const dropOffPassengers = (building: BuildingState, floorNumber: number): BuildingState => {
  const dropOff = building.elevator.passengers.filter((p) => p.targetFloor === floorNumber);
  if (dropOff.length === 0) return building;

  const updatedPassengers = dropOff.map((p) => ({
    ...p,
    arrivedAt: Date.now(),
    travelTime: Math.round((Date.now() - p.createdAt) / 1000),
  }));

  const floor = building.floors.get(floorNumber);
  if (!floor) return building;

  const newFloor = {
    ...floor,
    arrivedPassengers: [...floor.arrivedPassengers, ...updatedPassengers],
  };

  const newFloors = new Map(building.floors);
  newFloors.set(floorNumber, newFloor);

  return {
    ...building,
    floors: newFloors,
    elevator: {
      ...building.elevator,
      passengers: building.elevator.passengers.filter((p) => p.targetFloor !== floorNumber),
    },
    statistics: {
      ...building.statistics,
      completedTrips: building.statistics.completedTrips + dropOff.length,
      averageTravelTime:
        (building.statistics.averageTravelTime * building.statistics.completedTrips +
          updatedPassengers.reduce((sum, p) => sum + (p.travelTime || 0), 0)) /
        (building.statistics.completedTrips + dropOff.length),
    },
  };
};

export const moveElevator = (building: BuildingState, targetFloor: number): BuildingState => {
  return {
    ...building,
    elevator: {
      ...building.elevator,
      currentFloor: targetFloor,
    },
  };
};

export const updateElevatorState = (
  building: BuildingState,
  updates: Partial<BuildingState['elevator']>,
): BuildingState => {
  return {
    ...building,
    elevator: {
      ...building.elevator,
      ...updates,
    },
  };
};

export const useElevator = (onPassengerArrived?: (p: Passenger) => void) => {
  const [building, setBuilding] = useState<BuildingState>(createInitialBuilding);
  const [isRunning, setIsRunning] = useState(true);

  const callElevator = useCallback((floorNumber: number) => {
    setBuilding((prev) => addPassengerToFloor(prev, floorNumber));
  }, []);

  const processElevatorTick = useCallback(() => {
    setBuilding((prev) => {
      let currentBuilding = prev;
      const { elevator, floors } = currentBuilding;
      const currentFloor = elevator.currentFloor;
      let direction = elevator.direction;
      let nextFloor = currentFloor;
      let stopped = false;

      // === Высадка ===
      const dropOff = elevator.passengers.filter((p) => p.targetFloor === currentFloor);
      if (dropOff.length > 0) {
        stopped = true;
        currentBuilding = dropOffPassengers(currentBuilding, currentFloor);

        // Вызываем callback для каждого завершённого пассажира
        if (onPassengerArrived) {
          // Получаем обновленных пассажиров из dropOffPassengers
          const updatedPassengers =
            currentBuilding.floors.get(currentFloor)?.arrivedPassengers || [];
          const justArrived = updatedPassengers.slice(-dropOff.length); // Последние добавленные

          console.log('justArrived', justArrived);
          justArrived.forEach((passenger) => {
            onPassengerArrived(passenger);
          });
        }
      }

      // === Посадка на текущем этаже ===
      const currentFloorData = floors.get(currentFloor);
      if (currentFloorData && currentFloorData.waitingPassengers.length > 0) {
        const availableSpace =
          BUILDING_CONFIG.MAX_PASSENGERS_IN_ELEVATOR - currentBuilding.elevator.passengers.length;
        if (availableSpace > 0) {
          currentBuilding = pickupPassengers(currentBuilding, currentFloor);
          stopped = true;
        }
      }

      // === Определение направления и целей ===
      const deliveryTargets = currentBuilding.elevator.passengers.map((p) => p.targetFloor);
      const callTargets = Array.from(currentBuilding.floors.values())
        .filter((f) => f.isCalling)
        .map((f) => f.number);
      const allTargets = [...new Set([...deliveryTargets, ...callTargets])];

      let isMoving = false;

      // ПРОСТАЯ ЛОГИКА: Лифт движется если есть пассажиры ИЛИ есть вызовы
      if (currentBuilding.elevator.passengers.length > 0 || callTargets.length > 0) {
        // Определяем направление движения
        if (direction === 'idle') {
          const upTargets = allTargets.filter((t) => t > currentFloor);
          const downTargets = allTargets.filter((t) => t < currentFloor);

          if (upTargets.length > 0 && downTargets.length > 0) {
            const nearestUp = Math.min(...upTargets);
            const nearestDown = Math.max(...downTargets);
            const distanceUp = nearestUp - currentFloor;
            const distanceDown = currentFloor - nearestDown;

            if (distanceUp <= distanceDown) {
              direction = 'up';
            } else {
              direction = 'down';
            }
          } else if (upTargets.length > 0) {
            direction = 'up';
          } else if (downTargets.length > 0) {
            direction = 'down';
          }
        }

        // Определяем следующий этаж
        if (direction === 'up') {
          const upTargets = allTargets.filter((t) => t > currentFloor);
          if (upTargets.length > 0) {
            nextFloor = Math.min(...upTargets);
          } else {
            const downTargets = allTargets.filter((t) => t < currentFloor);
            if (downTargets.length > 0) {
              direction = 'down';
              nextFloor = Math.max(...downTargets);
            }
          }
        } else if (direction === 'down') {
          const downTargets = allTargets.filter((t) => t < currentFloor);
          if (downTargets.length > 0) {
            nextFloor = Math.max(...downTargets);
          } else {
            const upTargets = allTargets.filter((t) => t > currentFloor);
            if (upTargets.length > 0) {
              direction = 'up';
              nextFloor = Math.min(...upTargets);
            }
          }
        }

        isMoving = true;
      } else {
        direction = 'idle';
        isMoving = false;
      }

      // Двигаем лифт если не остановлен
      if (!stopped && nextFloor !== currentFloor) {
        currentBuilding = moveElevator(currentBuilding, nextFloor);
      }

      // Обновляем состояние лифта
      currentBuilding = updateElevatorState(currentBuilding, { direction, isMoving });

      // Отладочная информация
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        const upTargets = allTargets.filter((t) => t > currentFloor);
        const downTargets = allTargets.filter((t) => t < currentFloor);
        const nearestUp = upTargets.length > 0 ? Math.min(...upTargets) : null;
        const nearestDown = downTargets.length > 0 ? Math.max(...downTargets) : null;
        const distanceUp = nearestUp ? nearestUp - currentFloor : null;
        const distanceDown = nearestDown ? currentFloor - nearestDown : null;

        console.log('Elevator state:', {
          currentFloor,
          direction,
          isMoving,
          stopped,
          nextFloor,
          passengers: currentBuilding.elevator.passengers.length,
          deliveryTargets,
          callTargets,
          allTargets,
          upTargets,
          downTargets,
          nearestUp,
          nearestDown,
          distanceUp,
          distanceDown,
          shouldMove: currentBuilding.elevator.passengers.length > 0 || callTargets.length > 0,
          willMove: !stopped && isMoving,
        });
      }

      return currentBuilding;
    });
  }, [onPassengerArrived]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      processElevatorTick();
    }, BUILDING_CONFIG.ELEVATOR_SPEED);

    return () => clearInterval(interval);
  }, [isRunning, processElevatorTick]);

  return {
    building,
    callElevator,
    isRunning,
    setIsRunning,
  };
};
