import type { BuildingState } from '../../types/elevator';
import styles from './Controls.module.css';
import { useLanguage } from '../../hooks/useLanguage';

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
  const { t } = useLanguage();
  return (
    <div className={styles.controls}>
      <button
        onClick={() => toggleElevator('elevator-1')}
        className={`${styles.controlButton} ${!building.elevators[0].isEnabled ? styles.disabled : ''}`}
        title={
          building.elevators[0].isEnabled ? t.controls.disableElevator : t.controls.enableElevator
        }
      >
        {building.elevators[0].isEnabled ? t.controls.elevator1On : t.controls.elevator1Off}
      </button>
      <button
        onClick={() => toggleElevator('elevator-2')}
        className={`${styles.controlButton} ${!building.elevators[1].isEnabled ? styles.disabled : ''}`}
        title={
          building.elevators[1].isEnabled ? t.controls.disableElevator : t.controls.enableElevator
        }
      >
        {building.elevators[1].isEnabled ? t.controls.elevator2On : t.controls.elevator2Off}
      </button>
      <button onClick={spawnRandomPassenger} className={styles.controlButton}>
        {t.controls.addRandomPassenger}
      </button>
      <button onClick={clearLog} className={styles.controlButton}>
        {t.controls.clearLog}
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
        {isRunning ? t.controls.pause : t.controls.resume}
      </button>
      <button
        onClick={() => setAutoSpawn(!autoSpawn)}
        className={`${styles.controlButton} ${autoSpawn ? styles.active : ''}`}
      >
        {autoSpawn ? t.controls.autoSpawn : t.controls.autoSpawnOff}
      </button>
      <select
        value={autoSpawnInterval}
        onChange={(e) => setAutoSpawnInterval(Number(e.target.value))}
        className={styles.selectControl}
        disabled={!autoSpawn}
      >
        <option value={500}>{t.controls.speedOptions.fast}</option>
        <option value={1000}>{t.controls.speedOptions.normal}</option>
        <option value={2000}>{t.controls.speedOptions.slow}</option>
        <option value={3000}>{t.controls.speedOptions.verySlow}</option>
      </select>
    </div>
  );
};

export default Controls;
