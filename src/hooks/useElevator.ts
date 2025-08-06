import { useState, useEffect, useCallback } from 'react';
import type { BuildingState, Passenger, Floor, ElevatorState } from '../types/elevator';
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
      assignedCalls: [],
    });
  }

  // Создаем два лифта с уникальными ID
  const elevators: ElevatorState[] = [
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
      currentFloor: BUILDING_CONFIG.TOTAL_FLOORS, // Второй лифт начинает с верхнего этажа
      direction: 'idle',
      passengers: [],
      isMoving: false,
      assignedFloors: [],
      isEnabled: true,
    },
  ];

  return {
    floors,
    elevators,
    statistics: {
      totalPassengers: 0,
      completedTrips: 0,
      averageTravelTime: 0,
    },
  };
};

// Чистые функции для обновления состояния
export const assignCallToElevator = (
  building: BuildingState,
  floorNumber: number,
  elevatorId: string,
): BuildingState => {
  const floor = building.floors.get(floorNumber);
  if (!floor) return building;

  // Если вызов уже назначен этому лифту, ничего не делаем
  if (floor.assignedCalls.includes(elevatorId)) return building;

  const newFloor = {
    ...floor,
    assignedCalls: [...floor.assignedCalls, elevatorId],
  };

  const newFloors = new Map(building.floors);
  newFloors.set(floorNumber, newFloor);

  const newElevators = building.elevators.map((e) =>
    e.id === elevatorId ? { ...e, assignedFloors: [...e.assignedFloors, floorNumber] } : e,
  );

  return {
    ...building,
    floors: newFloors,
    elevators: newElevators,
  };
};

export const removeCallAssignment = (
  building: BuildingState,
  floorNumber: number,
  elevatorId: string,
): BuildingState => {
  const floor = building.floors.get(floorNumber);
  if (!floor) return building;

  const newFloor = {
    ...floor,
    assignedCalls: floor.assignedCalls.filter((id) => id !== elevatorId),
  };

  const newFloors = new Map(building.floors);
  newFloors.set(floorNumber, newFloor);

  const newElevators = building.elevators.map((e) =>
    e.id === elevatorId
      ? { ...e, assignedFloors: e.assignedFloors.filter((f) => f !== floorNumber) }
      : e,
  );

  return {
    ...building,
    floors: newFloors,
    elevators: newElevators,
  };
};

export const toggleElevator = (building: BuildingState, elevatorId: string): BuildingState => {
  const elevator = building.elevators.find((e) => e.id === elevatorId);
  if (!elevator) return building;

  const newElevators = building.elevators.map((e) =>
    e.id === elevatorId ? { ...e, isEnabled: !e.isEnabled } : e,
  );

  return {
    ...building,
    elevators: newElevators,
  };
};

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

export const pickupPassengers = (
  building: BuildingState,
  elevatorId: string,
  floorNumber: number,
): BuildingState => {
  const floor = building.floors.get(floorNumber);
  if (!floor) return building;

  const elevator = building.elevators.find((e) => e.id === elevatorId);
  if (!elevator) return building;

  const availableSpace = BUILDING_CONFIG.MAX_PASSENGERS_IN_ELEVATOR - elevator.passengers.length;
  if (availableSpace <= 0 || floor.waitingPassengers.length === 0) return building;

  const toPickup = floor.waitingPassengers.slice(0, availableSpace);
  const remainingWaiting = floor.waitingPassengers.slice(availableSpace);

  const newFloor = {
    ...floor,
    waitingPassengers: remainingWaiting,
    isCalling: remainingWaiting.length > 0,
    assignedCalls: floor.assignedCalls.filter((id) => id !== elevatorId), // Удаляем назначение
  };

  const newFloors = new Map(building.floors);
  newFloors.set(floorNumber, newFloor);

  const newElevators = building.elevators.map((e) =>
    e.id === elevatorId
      ? {
          ...e,
          passengers: [...e.passengers, ...toPickup],
          assignedFloors: e.assignedFloors.filter((f) => f !== floorNumber), // Удаляем из назначенных
        }
      : e,
  );

  return {
    ...building,
    floors: newFloors,
    elevators: newElevators,
  };
};

export const dropOffPassengers = (
  building: BuildingState,
  elevatorId: string,
  floorNumber: number,
): BuildingState => {
  const elevator = building.elevators.find((e) => e.id === elevatorId);
  if (!elevator) return building;

  const dropOff = elevator.passengers.filter((p) => p.targetFloor === floorNumber);
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

  const newElevators = building.elevators.map((e) =>
    e.id === elevatorId
      ? { ...e, passengers: e.passengers.filter((p) => p.targetFloor !== floorNumber) }
      : e,
  );

  return {
    ...building,
    floors: newFloors,
    elevators: newElevators,
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

export const moveElevator = (
  building: BuildingState,
  elevatorId: string,
  targetFloor: number,
): BuildingState => {
  const newElevators = building.elevators.map((e) =>
    e.id === elevatorId ? { ...e, currentFloor: targetFloor } : e,
  );

  return {
    ...building,
    elevators: newElevators,
  };
};

export const updateElevatorState = (
  building: BuildingState,
  elevatorId: string,
  updates: Partial<ElevatorState>,
): BuildingState => {
  const newElevators = building.elevators.map((e) =>
    e.id === elevatorId ? { ...e, ...updates } : e,
  );

  return {
    ...building,
    elevators: newElevators,
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
      const { elevators, floors } = currentBuilding;

      // === Умное назначение вызовов ===
      const unassignedCalls = Array.from(floors.values())
        .filter((f) => f.isCalling && f.assignedCalls.length === 0)
        .map((f) => f.number);

      unassignedCalls.forEach((floorNumber) => {
        // Находим лучший лифт для этого вызова
        let bestElevator: ElevatorState | null = null;
        let bestScore = Infinity;

        for (const elevator of elevators) {
          // Если лифт полный или отключен, пропускаем
          if (
            elevator.passengers.length >= BUILDING_CONFIG.MAX_PASSENGERS_IN_ELEVATOR ||
            !elevator.isEnabled
          )
            continue;

          // Вычисляем расстояние до вызова
          const distance = Math.abs(elevator.currentFloor - floorNumber);

          // Бонус если лифт уже движется в нужном направлении
          let directionBonus = 0;
          if (elevator.direction === 'up' && floorNumber > elevator.currentFloor) {
            directionBonus = -2; // Бонус за движение вверх к вызову выше
          } else if (elevator.direction === 'down' && floorNumber < elevator.currentFloor) {
            directionBonus = -2; // Бонус за движение вниз к вызову ниже
          }

          // Штраф за количество назначенных вызовов
          const assignmentPenalty = elevator.assignedFloors.length * 3;

          const score = distance + directionBonus + assignmentPenalty;

          if (score < bestScore) {
            bestScore = score;
            bestElevator = elevator;
          }
        }

        if (bestElevator) {
          currentBuilding = assignCallToElevator(currentBuilding, floorNumber, bestElevator.id);
        }
      });

      // Обрабатываем каждый лифт отдельно
      elevators.forEach((elevator) => {
        const currentFloor = elevator.currentFloor;
        let direction = elevator.direction;
        let nextFloor = currentFloor;
        let stopped = false;
        let isMoving = false;

        // === Высадка ===
        const dropOff = elevator.passengers.filter((p) => p.targetFloor === currentFloor);
        if (dropOff.length > 0) {
          stopped = true;
          currentBuilding = dropOffPassengers(currentBuilding, elevator.id, currentFloor);

          // Вызываем callback для каждого завершённого пассажира
          if (onPassengerArrived) {
            const updatedPassengers =
              currentBuilding.floors.get(currentFloor)?.arrivedPassengers || [];
            const justArrived = updatedPassengers.slice(-dropOff.length);

            justArrived.forEach((passenger) => {
              onPassengerArrived(passenger);
            });
          }
        }

        // === Посадка на текущем этаже (только для включенных лифтов) ===
        if (elevator.isEnabled) {
          const currentFloorData = floors.get(currentFloor);
          if (currentFloorData && currentFloorData.waitingPassengers.length > 0) {
            const availableSpace =
              BUILDING_CONFIG.MAX_PASSENGERS_IN_ELEVATOR - elevator.passengers.length;
            if (availableSpace > 0) {
              currentBuilding = pickupPassengers(currentBuilding, elevator.id, currentFloor);
              stopped = true;
            }
          }
        }

        // === Определение направления и целей ===
        const deliveryTargets = elevator.passengers.map((p) => p.targetFloor);

        if (elevator.isEnabled) {
          // Для включенных лифтов - назначенные вызовы
          const assignedCallTargets = elevator.assignedFloors;
          const allTargets = [...new Set([...deliveryTargets, ...assignedCallTargets])];

          // ПРОСТАЯ ЛОГИКА: Лифт движется если есть пассажиры ИЛИ есть назначенные вызовы
          if (elevator.passengers.length > 0 || assignedCallTargets.length > 0) {
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
            currentBuilding = moveElevator(currentBuilding, elevator.id, nextFloor);
          }

          // Обновляем состояние лифта
          currentBuilding = updateElevatorState(currentBuilding, elevator.id, {
            direction,
            isMoving,
          });
        } else {
          // Для отключенных лифтов - только развозим пассажиров, потом едем на первый этаж
          if (elevator.passengers.length > 0) {
            // Есть пассажиры - развозим их
            const allTargets = deliveryTargets;

            if (direction === 'idle') {
              const upTargets = allTargets.filter((t) => t > currentFloor);
              const downTargets = allTargets.filter((t) => t < currentFloor);

              if (upTargets.length > 0) {
                direction = 'up';
              } else if (downTargets.length > 0) {
                direction = 'down';
              }
            }

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
            // Нет пассажиров - едем на первый этаж
            if (currentFloor > 1) {
              direction = 'down';
              nextFloor = 1;
              isMoving = true;
            } else {
              direction = 'idle';
              isMoving = false;
            }
          }

          // Двигаем лифт если не остановлен
          if (!stopped && nextFloor !== currentFloor) {
            currentBuilding = moveElevator(currentBuilding, elevator.id, nextFloor);
          }

          // Обновляем состояние лифта
          currentBuilding = updateElevatorState(currentBuilding, elevator.id, {
            direction,
            isMoving,
          });
        }
      });

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
    toggleElevator: (elevatorId: string) => {
      setBuilding((prev) => toggleElevator(prev, elevatorId));
    },
  };
};
