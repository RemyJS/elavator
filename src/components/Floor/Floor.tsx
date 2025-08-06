import React from 'react';
import type { Floor as FloorType } from '../../types/elevator';
import { BUILDING_CONFIG } from '../../utils/constants';
import { getFloorBackgroundColor } from '../../utils/helpers';
import Passenger from '../Passenger';
import styles from './Floor.module.css';

interface FloorProps {
  floor: FloorType;
  onCallElevator: (floorNumber: number) => void;
}
const maxVisiblePassengers = 5;

const Floor: React.FC<FloorProps> = ({ floor, onCallElevator }) => {
  const waitingPassengers = floor.waitingPassengers;
  const arrivedPassengers = floor.arrivedPassengers;
  const canAddMore = waitingPassengers.length < 10;
  const floorBackgroundColor = getFloorBackgroundColor(floor.number);

  return (
    <div
      className={styles.floor}
      style={{
        height: BUILDING_CONFIG.FLOOR_HEIGHT,
        backgroundColor: floorBackgroundColor,
      }}
    >
      <div className={styles.floorContent}>
        {/* левая часть: номер этажа и кнопка вызова */}
        <div className={styles.floorNumberContainer}>
          <div className={styles.floorNumber}>{floor.number}</div>
          <div className={styles.callButtonContainer}>
            <button
              className={`${styles.callButton} ${floor.isCalling ? styles.calling : ''} ${!canAddMore ? styles.disabled : ''}`}
              onClick={() => onCallElevator(floor.number)}
              disabled={!canAddMore}
              title={!canAddMore ? 'Максимум пассажиров на этаже' : 'Добавить пассажира'}
            >
              {floor.isCalling ? '⏳' : '➕'}
            </button>
            {waitingPassengers.length > 0 && (
              <div className={styles.waitingCount}>{waitingPassengers.length}</div>
            )}
          </div>
        </div>

        {/* Середина: шахта, очередь */}
        <div className={styles.floorShaft}>
          <div className={styles.queueArea}>
            {waitingPassengers.slice(0, maxVisiblePassengers).map((passenger) => (
              <Passenger key={passenger.id} passenger={passenger} variant="waiting" />
            ))}
            {waitingPassengers.length > maxVisiblePassengers && (
              <div className={styles.morePassengers}>
                +{waitingPassengers.length - maxVisiblePassengers}
              </div>
            )}
          </div>
        </div>

        {/* Правая часть: прибывшие пассажиры */}
        <div className={styles.arrivedArea}>
          {arrivedPassengers.slice(-maxVisiblePassengers).map((passenger) => (
            <Passenger key={passenger.id} passenger={passenger} variant="arrived" />
          ))}
          {arrivedPassengers.length > maxVisiblePassengers && (
            <div className={styles.moreArrived}>
              +{arrivedPassengers.length - maxVisiblePassengers}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Floor;
