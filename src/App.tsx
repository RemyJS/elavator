import { useEffect, useState, useCallback } from 'react';
import { useElevator } from './hooks/useElevator';
import Building from './components/Building';
import LogTable, { type LogEntry } from './components/LogTable';
import Controls from './components/Controls';
import Instructions from './components/Instructions';
import { BUILDING_CONFIG } from './utils/constants';
import type { Passenger } from './types/elevator';
import styles from './App.module.css';
import { generateLogId } from './utils/helpers';

function App() {
  const [passengerLog, setPassengerLog] = useState<LogEntry[]>([]);
  const [autoSpawn, setAutoSpawn] = useState(false);
  const [autoSpawnInterval, setAutoSpawnInterval] = useState(1000); // Интервал в мс
  const [totalLogEntries, setTotalLogEntries] = useState<number>(1); // Счетчик всех записей

  // Константа для максимального размера лога
  const MAX_LOG_SIZE = 200;

  const handlePassengerArrived = useCallback(
    (passenger: Passenger) => {
      setPassengerLog((prev) => {
        const newEntry = {
          id: generateLogId(), // Уникальный ID для записи лога
          passengerId: passenger.id, // ID пассажира
          from: passenger.currentFloor,
          to: passenger.targetFloor,
          travelTime: passenger.travelTime || 0,
          order: totalLogEntries,
          createdAt: passenger.createdAt, // Используем createdAt пассажира
        };

        // Создаем новый лог
        const newLog =
          prev.length >= MAX_LOG_SIZE ? [...prev.slice(1), newEntry] : [...prev, newEntry];

        return newLog;
      });

      // Увеличиваем глобальный счетчик записей
      setTotalLogEntries((prev) => prev + 1);
    },
    [totalLogEntries],
  );

  const { building, callElevator, isRunning, setIsRunning, toggleElevator } =
    useElevator(handlePassengerArrived);

  // Синхронизация CSS переменных с конфигурацией
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--total-floors', BUILDING_CONFIG.TOTAL_FLOORS.toString());
    root.style.setProperty('--floor-height', `${BUILDING_CONFIG.FLOOR_HEIGHT}px`);
  }, []);

  // Функция для создания случайного пассажира
  const spawnRandomPassenger = useCallback(() => {
    const randomFloor = Math.floor(Math.random() * BUILDING_CONFIG.TOTAL_FLOORS) + 1;
    callElevator(randomFloor);
  }, [callElevator]);

  // Автоспавн пассажиров
  useEffect(() => {
    if (!autoSpawn) return;

    const interval = setInterval(() => {
      spawnRandomPassenger();
    }, autoSpawnInterval);

    return () => clearInterval(interval);
  }, [autoSpawn, autoSpawnInterval, spawnRandomPassenger]);

  return (
    <div className={styles.appLayout}>
      <div className={styles.logTableContainer}>
        <Controls
          isRunning={isRunning}
          setIsRunning={setIsRunning}
          spawnRandomPassenger={spawnRandomPassenger}
          autoSpawn={autoSpawn}
          setAutoSpawn={setAutoSpawn}
          autoSpawnInterval={autoSpawnInterval}
          setAutoSpawnInterval={setAutoSpawnInterval}
          toggleElevator={toggleElevator}
          building={building}
          clearLog={() => {
            setPassengerLog([]);
            setTotalLogEntries(0); // Сбрасываем счетчик при очистке лога
          }}
        />
        <LogTable log={passengerLog} />
      </div>
      <Building building={building} onCallElevator={callElevator} />
      <Instructions />
    </div>
  );
}

export default App;
