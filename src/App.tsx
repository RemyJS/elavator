import { useEffect, useState, useCallback } from 'react';
import { useElevator } from './hooks/useElevator';
import Building from './components/Building';
import LogTable, { type LogEntry, type SortConfig } from './components/LogTable';
import { BUILDING_CONFIG } from './utils/constants';
import type { Passenger } from './types/elevator';
import styles from './App.module.css';
import { generateLogId } from './utils/helpers';

function App() {
  const [passengerLog, setPassengerLog] = useState<LogEntry[]>([]);
  const [sort, setSort] = useState<SortConfig>({ field: 'order', direction: 'asc' });
  const [autoSpawn, setAutoSpawn] = useState(false);
  const [averageTravelTime, setAverageTravelTime] = useState<number>(0);

  // Константа для максимального размера лога
  const MAX_LOG_SIZE = 100;

  const handlePassengerArrived = useCallback((passenger: Passenger) => {
    setPassengerLog((prev) => {
      const newEntry = {
        id: generateLogId(), // Уникальный ID для записи лога
        passengerId: passenger.id, // ID пассажира
        from: passenger.currentFloor,
        to: passenger.targetFloor,
        travelTime: passenger.travelTime || 0,
        order: prev.length,
        createdAt: passenger.createdAt, // Используем createdAt пассажира
      };

      // Создаем новый лог
      const newLog =
        prev.length >= MAX_LOG_SIZE ? [...prev.slice(1), newEntry] : [...prev, newEntry];

      console.log('handlePassengerArrived', newLog, newEntry);
      // Вычисляем среднее время если лог заполнен
      if (newLog.length === MAX_LOG_SIZE) {
        const avgTime = Math.round(
          newLog.reduce((sum, entry) => sum + entry.travelTime, 0) / newLog.length,
        );
        setAverageTravelTime(avgTime);
      }

      return newLog;
    });
  }, []);

  const { building, callElevator, isRunning, setIsRunning } = useElevator(handlePassengerArrived);

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
    const AUTO_SPAWN_INTERVAL = 2000;
    if (!autoSpawn) return;

    const interval = setInterval(() => {
      spawnRandomPassenger();
    }, AUTO_SPAWN_INTERVAL);

    return () => clearInterval(interval);
  }, [autoSpawn, spawnRandomPassenger]);

  return (
    <div className={styles.appLayout}>
      <div className={styles.logTableContainer}>
        <div className={styles.instructions}>
          <div className={styles.controls}>
            <button
              onClick={() => {
                setIsRunning(!isRunning);
                if (!isRunning) {
                  setAutoSpawn(false);
                }
              }}
              className={styles.controlButton}
            >
              {isRunning ? '⏸️ Пауза' : '▶️ Продолжить'}
            </button>
            <button onClick={spawnRandomPassenger} className={styles.controlButton}>
              🎲 Добавить пассажира
            </button>
            <button
              onClick={() => setAutoSpawn(!autoSpawn)}
              className={`${styles.controlButton} ${autoSpawn ? styles.active : ''}`}
            >
              {autoSpawn ? '🔄 Авто ВКЛ' : '⏹️ Авто ВЫКЛ'}
            </button>
            <button
              onClick={() => {
                setPassengerLog([]);
                setAverageTravelTime(0);
              }}
              className={styles.controlButton}
              title="Очистить лог"
            >
              🗑️ Очистить лог
            </button>
          </div>
          <h3>Управление:</h3>
          <p>• Нажмите ➕ на этаже для добавления пассажира</p>
          <p>• Лифт автоматически подбирает и развозит пассажиров</p>
          <p>• Максимум 10 пассажиров на этаже, 5 в лифте</p>
          <p>• Лог хранит последние 100 записей для производительности</p>
          <p>• Используйте кнопки для автоматической работы</p>

          <h4>Алгоритм лифта:</h4>
          <p>
            • <strong>Направление:</strong> Лифт выбирает ближайшую цель в текущем направлении
          </p>
          <p>
            • <strong>Попутчики:</strong> Подбирает пассажиров, идущих в том же направлении
          </p>
          <p>
            • <strong>Очереди:</strong> Сначала развозит пассажиров, потом отвечает на вызовы
          </p>
          <p>
            • <strong>Смена направления:</strong> Когда цели в одном направлении закончились
          </p>
        </div>
        <div className={styles.logStats}>
          <span>📊 Лог: {passengerLog.length} записей</span>
          {averageTravelTime > 0 && <span>⏱️ Среднее время: {averageTravelTime}с</span>}
        </div>
        <LogTable log={passengerLog} sort={sort} setSort={setSort} />
      </div>
      <Building building={building} onCallElevator={callElevator} />
    </div>
  );
}

export default App;
