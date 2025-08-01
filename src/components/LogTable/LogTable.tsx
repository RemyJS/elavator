import React from 'react';
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

export type SortConfig = {
  field: 'order' | 'travelTime';
  direction: 'asc' | 'desc';
};

export interface LogTableProps {
  log: LogEntry[];
  sort: SortConfig;
  setSort: (sort: SortConfig | ((prev: SortConfig) => SortConfig)) => void;
}

const LogTable: React.FC<LogTableProps> = ({ log, sort, setSort }) => {
  const sortedLog = React.useMemo(() => {
    const sorted = [...log];
    sorted.sort((a, b) => {
      if (sort.field === 'order') {
        return sort.direction === 'asc' ? a.order - b.order : b.order - a.order;
      } else {
        return sort.direction === 'asc' ? a.travelTime - b.travelTime : b.travelTime - a.travelTime;
      }
    });
    return sorted;
  }, [log, sort]);

  const handleSort = (field: 'order' | 'travelTime') => {
    setSort((prev: SortConfig) => {
      if (prev.field === field) {
        const newDirection: 'asc' | 'desc' = prev.direction === 'asc' ? 'desc' : 'asc';
        return { field, direction: newDirection };
      }
      return { field, direction: 'asc' as const };
    });
  };

  return (
    <div className={styles.logTableContainer}>
      <h3>Статистика перевозок</h3>
      <table className={styles.logTable}>
        <thead>
          <tr>
            <th onClick={() => handleSort('order')} style={{ cursor: 'pointer' }}>
              #{sort.field === 'order' ? (sort.direction === 'asc' ? ' ▲' : ' ▼') : ''}
            </th>
            <th>ID</th>
            <th>Откуда</th>
            <th>Куда</th>
            <th onClick={() => handleSort('travelTime')} style={{ cursor: 'pointer' }}>
              Время в пути, c
              {sort.field === 'travelTime' ? (sort.direction === 'asc' ? ' ▲' : ' ▼') : ''}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedLog.map((entry) => (
            <tr key={`${entry.createdAt}-${entry.id}`}>
              <td>{entry.order + 1}</td>
              <td>{entry.passengerId}</td>
              <td>{entry.from}</td>
              <td>{entry.to}</td>
              <td>{entry.travelTime}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LogTable;
