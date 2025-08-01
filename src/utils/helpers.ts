export const generateLogId = (): string => {
  return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Цвет пассажира зависит от этажа создания
export const getFloorColor = (floorNumber: number): string => {
  // Градиентная радужная палитра: от земли к небу
  // 1-3: Земные тона (зеленый, коричневый, песочный)
  // 4-6: Средние тона (оранжевый, розовый, пурпурный)
  // 7-9: Небесные тона (голубой, синий, фиолетовый)
  const floorColors = [
    '#2E8B57', // 1 этаж - морская зелень (земля)
    '#8B4513', // 2 этаж - коричневый (почва)
    '#F4A460', // 3 этаж - песочный (песок)
    '#FF8C00', // 4 этаж - темно-оранжевый (закат)
    '#FF69B4', // 5 этаж - горячий розовый (розовый)
    '#9370DB', // 6 этаж - средний пурпурный (сумерки)
    '#00CED1', // 7 этаж - темно-бирюзовый (небо)
    '#4169E1', // 8 этаж - королевский синий (высота)
    '#8A2BE2', // 9 этаж - сине-фиолетовый (космос)
  ];

  return floorColors[floorNumber - 1] || '#8A2BE2';
};

export const getRandomTargetFloor = (currentFloor: number): number => {
  const floors = Array.from({ length: 9 }, (_, i) => i + 1).filter(
    (floor) => floor !== currentFloor,
  );
  return floors[Math.floor(Math.random() * floors.length)];
};

export const formatTime = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const calculatePassengerTime = (createdAt: number): number => {
  return Date.now() - createdAt;
};

// Определяем ближайший целевой этаж для лифта
export const getNextTargetFloor = (
  currentFloor: number,
  direction: 'up' | 'down' | 'idle',
  deliveryTargets: number[],
  callTargets: number[],
): number | null => {
  const allTargets = [...new Set([...deliveryTargets, ...callTargets])];

  if (allTargets.length === 0) return null;

  if (direction === 'up') {
    const upTargets = allTargets.filter((t) => t > currentFloor);
    return upTargets.length > 0 ? Math.min(...upTargets) : null;
  } else if (direction === 'down') {
    const downTargets = allTargets.filter((t) => t < currentFloor);
    return downTargets.length > 0 ? Math.max(...downTargets) : null;
  } else {
    // Если лифт стоит, выбираем ближайшую цель
    const sortedTargets = allTargets.sort(
      (a, b) => Math.abs(a - currentFloor) - Math.abs(b - currentFloor),
    );
    return sortedTargets[0] || null;
  }
};
