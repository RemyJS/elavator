import React from 'react';
import type { Passenger as PassengerType } from '../../types/elevator';
import { getTravelTimeEmoji } from '../../utils/helpers';
import styles from './Passenger.module.css';

interface PassengerProps {
  passenger: PassengerType;
  variant: 'waiting' | 'arrived' | 'elevator';
}

const Passenger: React.FC<PassengerProps> = ({ passenger, variant }) => {
  const handleClick = () => {
    if (variant === 'arrived') {
      const travelTime = passenger.travelTime || 0;
      alert(
        `Пассажир прибыл!\nВремя в пути: ${travelTime} сек\nС этажа ${passenger.currentFloor} на этаж ${passenger.targetFloor}`,
      );
    } else {
      alert(`Пассажир едет на ${passenger.targetFloor} этаж`);
    }
  };

  const renderPassengerContent = () => {
    switch (variant) {
      case 'elevator':
        // В лифте - только целевой этаж крупно
        return (
          <div className={styles.elevatorContent}>
            <div className={styles.targetFloor}>{passenger.targetFloor}</div>
          </div>
        );

      case 'waiting':
        // Ожидает - ID сверху, целевой этаж снизу
        return (
          <div className={styles.waitingContent}>
            <div className={styles.passengerId}>#{passenger.id}</div>
            <div className={styles.targetFloor}>→{passenger.targetFloor}</div>
          </div>
        );

      case 'arrived': {
        // Прибыл - ID сверху, время в пути снизу
        const travelTime = passenger.travelTime || 0;
        const emoji = getTravelTimeEmoji(travelTime);

        return (
          <div className={styles.arrivedContent}>
            <div className={styles.passengerId}>#{passenger.id}</div>
            <div className={styles.travelTime}>
              {travelTime}с {emoji}
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  const getTitle = () => {
    if (variant === 'elevator') {
      return `Пассажир #${passenger.id} едет на ${passenger.targetFloor} этаж`;
    }
    if (variant === 'arrived') {
      const travelTime = passenger.travelTime || 0;
      const emoji = getTravelTimeEmoji(travelTime);
      return `Прибыл с ${passenger.currentFloor} этажа за ${travelTime} сек ${emoji}`;
    }
    return `Пассажир #${passenger.id} с этажа ${passenger.currentFloor} → ${passenger.targetFloor}`;
  };

  return (
    <div
      className={`${styles.passenger} ${styles[variant]}`}
      style={{ backgroundColor: passenger.color }}
      onClick={handleClick}
      title={getTitle()}
    >
      {renderPassengerContent()}
    </div>
  );
};

export default Passenger;
