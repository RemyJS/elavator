import React, { useRef, useEffect, useMemo, useState } from 'react';
import { getTravelTimeEmoji } from '../../utils/helpers';
import styles from './LogTable.module.css';

export interface LogEntry {
  id: string;
  passengerId: string;
  from: number;
  to: number;
  travelTime: number; // Время в пути в секундах
  order: number;
  createdAt: number; // Используем createdAt пассажира
}

export interface LogTableProps {
  log: LogEntry[];
}

const LogTable: React.FC<LogTableProps> = ({ log }) => {
  const tbodyRef = useRef<HTMLDivElement>(null);
  const [lastAverageTime, setLastAverageTime] = useState<number>(0);

  // Вычисляем среднее время каждые 20 записей (20, 40, 60, 80, 100...)
  const averageTravelTime = useMemo(() => {
    if (log.length >= 20 && log.length % 20 === 0) {
      const newAverage = Math.round(
        log.reduce((sum, entry) => sum + entry.travelTime, 0) / log.length,
      );
      setLastAverageTime(newAverage);
      return newAverage;
    }
    return lastAverageTime;
  }, [log, lastAverageTime]);

  // Автоскролл к последним записям при добавлении новых
  useEffect(() => {
    const timer = setTimeout(() => {
      if (tbodyRef.current) {
        tbodyRef.current.scrollTop = tbodyRef.current.scrollHeight;
      }
    }, 100); // Небольшая задержка для плавности

    return () => clearTimeout(timer);
  }, [log.length]); // Срабатывает при изменении количества записей

  return (
    <div className={styles.logTableContainer}>
      <div className={styles.logStats}>
        <span>📊 Лог: {log.length} записей</span>
        {averageTravelTime > 0 && <span>⏱️ Среднее время: {averageTravelTime}с</span>}
      </div>
      <h3>Статистика перевозок</h3>
      <div className={styles.logTable}>
        <div className={styles.tableHeader}>
          <div className={styles.headerCell}>#</div>
          <div className={styles.headerCell}>ID</div>
          <div className={styles.headerCell}>Откуда</div>
          <div className={styles.headerCell}>Куда</div>
          <div className={styles.headerCell}>Время в пути, c</div>
        </div>
        <div className={styles.tableBody} ref={tbodyRef}>
          {log.map((entry, index) => {
            const emoji = getTravelTimeEmoji(entry.travelTime);
            const isNewEntry = index === log.length - 1; // Последняя запись - новая

            return (
              <div
                key={`${entry.createdAt}-${entry.id}`}
                className={`${styles.tableRow} ${isNewEntry ? styles.newEntry : ''}`}
              >
                <div className={styles.tableCell}>{entry.order + 1}</div>
                <div className={styles.tableCell}>{entry.passengerId}</div>
                <div className={styles.tableCell}>{entry.from}</div>
                <div className={styles.tableCell}>{entry.to}</div>
                <div className={styles.tableCell}>
                  {entry.travelTime}с {emoji}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LogTable;
