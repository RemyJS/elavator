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
  return (
    <div className={styles.building}>
      <div className={styles.buildingTitle}>
        <h2>🏢 Лифт Симулятор</h2>
        <div className={styles.buildingStats}>
          <span>Всего пассажиров: {building.statistics.totalPassengers}</span>
          <span>
            Пассажиров в лифте: {building.elevator.passengers.length}/
            {BUILDING_CONFIG.MAX_PASSENGERS_IN_ELEVATOR}
          </span>
        </div>
      </div>

      <div className={styles.buildingContainer}>
        <Elevator elevator={building.elevator} building={building} />
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
