import React from 'react';
import type { BuildingState } from '../../types/elevator';
import { BUILDING_CONFIG } from '../../utils/constants';
import Floor from '../Floor';
import Elevator from '../Elevator';
import styles from './Building.module.css';

interface BuildingProps {
  building: BuildingState;
  onCallElevator: (floorNumber: number) => void;
}

const Building: React.FC<BuildingProps> = ({ building, onCallElevator }) => {
  // Подсчитываем общее количество пассажиров во всех лифтах
  const totalPassengersInElevators = building.elevators.reduce(
    (total, elevator) => total + elevator.passengers.length,
    0,
  );

  return (
    <div className={styles.building}>
      <div className={styles.buildingTitle}>
        <div className={styles.buildingStats}>
          <span>Всего пассажиров: {building.statistics.totalPassengers}</span>
          <h2>🏢 Симулятор лифта</h2>
          <span>
            Пассажиров в лифтах: {totalPassengersInElevators}/
            {BUILDING_CONFIG.MAX_PASSENGERS_IN_ELEVATOR * building.elevators.length}
          </span>
        </div>
      </div>

      <div className={styles.buildingContainer}>
        <div className={styles.elevatorsContainer}>
          {building.elevators.map((elevator) => (
            <div key={elevator.id} className={styles.elevatorShaft}>
              <Elevator elevator={elevator} building={building} />
            </div>
          ))}
        </div>
        <div className={styles.floorsContainer}>
          {Array.from(building.floors.values()).map((floor) => (
            <Floor key={floor.number} floor={floor} onCallElevator={onCallElevator} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Building;
