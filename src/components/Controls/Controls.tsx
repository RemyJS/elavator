import type { BuildingState } from '../../types/elevator';
import styles from './Controls.module.css';

interface ControlsProps {
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  spawnRandomPassenger: () => void;
  autoSpawn: boolean;
  setAutoSpawn: (spawn: boolean) => void;
  autoSpawnInterval: number;
  setAutoSpawnInterval: (interval: number) => void;
  toggleElevator: (elevatorId: string) => void;
  building: BuildingState;
  clearLog: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  isRunning,
  setIsRunning,
  spawnRandomPassenger,
  autoSpawn,
  setAutoSpawn,
  autoSpawnInterval,
  setAutoSpawnInterval,
  toggleElevator,
  building,
  clearLog,
}) => {
  return (
    <div className={styles.controls}>
      <button
        onClick={() => toggleElevator('elevator-1')}
        className={`${styles.controlButton} ${!building.elevators[0].isEnabled ? styles.disabled : ''}`}
        title="Переключить лифт 1"
      >
        {building.elevators[0].isEnabled ? '⚡ Лифт 1 ВКЛ' : '🚫 Лифт 1 ВЫКЛ'}
      </button>
      <button
        onClick={() => toggleElevator('elevator-2')}
        className={`${styles.controlButton} ${!building.elevators[1].isEnabled ? styles.disabled : ''}`}
        title="Переключить лифт 2"
      >
        {building.elevators[1].isEnabled ? '⚡ Лифт 2 ВКЛ' : '🚫 Лифт 2 ВЫКЛ'}
      </button>
      <button onClick={spawnRandomPassenger} className={styles.controlButton}>
        🎲 Вызвать лифт
      </button>
      <button onClick={clearLog} className={styles.controlButton}>
        🗑️ Очистить лог
      </button>
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
      <button
        onClick={() => setAutoSpawn(!autoSpawn)}
        className={`${styles.controlButton} ${autoSpawn ? styles.active : ''}`}
      >
        {autoSpawn ? '🔄 Авто ВКЛ' : '⏹️ Авто ВЫКЛ'}
      </button>
      <select
        value={autoSpawnInterval}
        onChange={(e) => setAutoSpawnInterval(Number(e.target.value))}
        className={styles.selectControl}
        disabled={!autoSpawn}
      >
        <option value={500}>⚡ Быстро (0.5с)</option>
        <option value={1000}>🚶 Обычно (1с)</option>
        <option value={2000}>🐌 Медленно (2с)</option>
        <option value={3000}>🦥 Очень медленно (3с)</option>
      </select>
    </div>
  );
};

export default Controls;
