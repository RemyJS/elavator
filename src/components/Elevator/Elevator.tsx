import React from 'react';
import type { ElevatorState, BuildingState } from '../../types/elevator';
import { BUILDING_CONFIG } from '../../utils/constants';
import { getNextTargetFloor } from '../../utils/helpers';
import Passenger from '../Passenger';
import styles from './Elevator.module.css';

interface ElevatorProps {
  elevator: ElevatorState;
  building: BuildingState;
}

const Elevator: React.FC<ElevatorProps> = ({ elevator, building }) => {
  // Позиция лифта рассчитывается через CSS transform для плавной анимации
  const elevatorStyle = {
    transform: `translateX(-50%) translateY(${(BUILDING_CONFIG.TOTAL_FLOORS - elevator.currentFloor) * BUILDING_CONFIG.FLOOR_HEIGHT}px)`,
    transition: elevator.isMoving ? 'transform 1s ease-in-out' : 'none',
  };

  // Определяем целевой этаж
  const deliveryTargets = elevator.passengers.map((p) => p.targetFloor);
  const callTargets = Array.from(building.floors.values())
    .filter((f) => f.isCalling)
    .map((f) => f.number);
  const nextTarget = getNextTargetFloor(
    elevator.currentFloor,
    elevator.direction,
    deliveryTargets,
    callTargets,
  );

  return (
    <div className={styles.elevatorContainer}>
      <div
        className={`${styles.elevator} ${elevator.isMoving ? styles.moving : ''}`}
        style={elevatorStyle}
      >
        <div className={styles.elevatorIndicator}>
          <div className={styles.currentFloor}>
            {elevator.currentFloor.toString().padStart(2, '0')}
          </div>
          {nextTarget && elevator.isMoving && (
            <div className={styles.targetFloor}>{nextTarget.toString().padStart(2, '0')}</div>
          )}
          <div className={styles.directionIndicator}>
            {elevator.direction === 'up' && '\u2b06\ufe0f'}
            {elevator.direction === 'down' && '\u2b07\ufe0f'}
            {elevator.direction === 'idle' && '\u23f8\ufe0f'}
          </div>
        </div>
        <div className={styles.elevatorPassengers}>
          {elevator.passengers.map((passenger) => (
            <Passenger key={passenger.id} passenger={passenger} variant="elevator" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Elevator;
