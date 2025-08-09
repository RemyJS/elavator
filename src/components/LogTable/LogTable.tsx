import React, { useRef, useEffect, useMemo, useState } from 'react';
import { getTravelTimeEmoji } from '../../utils/helpers';
import styles from './LogTable.module.css';
import { useLanguage } from '../../contexts/LanguageContext';

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
  const { t } = useLanguage();
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
        <span>
          {t.statistics.log}: {log.length} {t.statistics.records}
        </span>
        {averageTravelTime > 0 && (
          <span>
            {t.statistics.averageTime}: {averageTravelTime}
            {t.statistics.seconds}
          </span>
        )}
      </div>
      <h3>{t.table.transportStatistics}</h3>
      <div className={styles.logTable}>
        <div className={styles.tableHeader}>
          <div className={styles.headerCell}>{t.table.number}</div>
          <div className={styles.headerCell}>{t.table.id}</div>
          <div className={styles.headerCell}>{t.table.from}</div>
          <div className={styles.headerCell}>{t.table.to}</div>
          <div className={styles.headerCell}>{t.table.travelTime}</div>
        </div>
        <div className={styles.tableBody} ref={tbodyRef}>
          {log.map((entry, index) => {
            const emoji = getTravelTimeEmoji(entry.travelTime, t.emojis);
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
                  {entry.travelTime}
                  {t.statistics.seconds} {emoji}
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
