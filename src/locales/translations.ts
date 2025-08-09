export interface Translations {
  // Общие элементы
  common: {
    loading: string;
    error: string;
  };

  // Статистика
  statistics: {
    log: string;
    averageTime: string;
    records: string;
    seconds: string;
  };

  // Заголовки таблицы
  table: {
    number: string;
    id: string;
    from: string;
    to: string;
    travelTime: string;
    transportStatistics: string;
  };

  // Кнопки управления
  controls: {
    pause: string;
    resume: string;
    addRandomPassenger: string;
    autoSpawn: string;
    autoSpawnOff: string;
    clearLog: string;
    enableElevator: string;
    disableElevator: string;
    speedControl: string;
    elevator1On: string;
    elevator1Off: string;
    elevator2On: string;
    elevator2Off: string;
    speedOptions: {
      fast: string;
      normal: string;
      slow: string;
      verySlow: string;
    };
  };

  // Инструкции
  instructions: {
    title: string;
    content: string;
  };

  // Заголовки
  headers: {
    buildingTitle: string;
  };

  // Статистика здания
  buildingStats: {
    totalPassengers: string;
    passengersInElevators: string;
  };

  // Эмодзи для времени в пути
  emojis: {
    fast: string;
    normal: string;
    slow: string;
  };
}

export const translations: Record<string, Translations> = {
  ru: {
    common: {
      loading: 'Загрузка...',
      error: 'Ошибка',
    },
    statistics: {
      log: '📊 Лог',
      averageTime: '⏱️ Среднее время',
      records: 'записей',
      seconds: 'с',
    },
    table: {
      number: '#',
      id: 'ID',
      from: 'Откуда',
      to: 'Куда',
      travelTime: 'Время в пути, c',
      transportStatistics: 'Статистика перевозок',
    },
    controls: {
      pause: '⏸️ Пауза',
      resume: '▶️ Продолжить',
      addRandomPassenger: '👤 Случайный пассажир',
      autoSpawn: '🔄 Автоспавн ВКЛ',
      autoSpawnOff: '🔄 Автоспавн ВЫКЛ',
      clearLog: '🗑️ Очистить лог',
      enableElevator: '✅ Включить лифт',
      disableElevator: '❌ Отключить лифт',
      speedControl: '⚡ Скорость',
      elevator1On: '⚡ Лифт 1 ВКЛ',
      elevator1Off: '🚫 Лифт 1 ВЫКЛ',
      elevator2On: '⚡ Лифт 2 ВКЛ',
      elevator2Off: '🚫 Лифт 2 ВЫКЛ',
      speedOptions: {
        fast: '⚡ Быстро (0.5с)',
        normal: '🚶 Обычно (1с)',
        slow: '🐌 Медленно (2с)',
        verySlow: '🦥 Очень медленно (3с)',
      },
    },
    instructions: {
      title: 'Инструкция',
      content: `🚀 Управление симуляцией:

• <strong>➕ Добавить пассажира:</strong> Нажмите на кнопку вызова лифта на любом этаже
• <strong>⚡ Авто-режим:</strong> Включите для автоматического создания пассажиров
• <strong>🎛️ Скорость:</strong> Выберите интервал спавна (0.5с - 3с)
• <strong>🔧 Управление лифтами:</strong> Включите/выключите лифты по необходимости

🏗️ Система двух лифтов:

• <strong>Умное распределение:</strong> Алгоритм выбирает ближайший лифт для вызова
• <strong>Нагрузка:</strong> Учитывается направление движения и загруженность лифта
• <strong>Отключение:</strong> Лифт завершает текущих пассажиров и возвращается на 1 этаж
• <strong>Производительность:</strong> В 2-3 раза быстрее развозка пассажиров

📊 Статистика и логи:

• <strong>Время в пути:</strong> Отслеживается для каждого пассажира
• <strong>Эмодзи-реакции:</strong> 😃 (до 30с), 😐 (до 60с), 😠 (более 60с)
• <strong>Автоскролл:</strong> Лог автоматически показывает последние записи
• <strong>Ограничения:</strong> Максимум 10 пассажиров на этаже, 5 в лифте

🎯 Алгоритм работы лифта:

• <strong>Направление:</strong> Лифт движется в направлении большинства пассажиров
• <strong>Попутчики:</strong> Подбирает пассажиров, идущих в том же направлении
• <strong>Оптимизация:</strong> Выбирает ближайшие цели для минимизации времени ожидания
• <strong>Статистика:</strong> Обновляется каждые 20 записей для оптимизации`,
    },
    headers: {
      buildingTitle: '🏢 Симулятор лифта',
    },
    buildingStats: {
      totalPassengers: 'Всего пассажиров',
      passengersInElevators: 'Пассажиров в лифтах',
    },
    emojis: {
      fast: '😃',
      normal: '😐',
      slow: '😠',
    },
  },
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
    },
    statistics: {
      log: '📊 Log',
      averageTime: '⏱️ Average time',
      records: 'records',
      seconds: 's',
    },
    table: {
      number: '#',
      id: 'ID',
      from: 'From',
      to: 'To',
      travelTime: 'Travel time, s',
      transportStatistics: 'Transport Statistics',
    },
    controls: {
      pause: '⏸️ Pause',
      resume: '▶️ Resume',
      addRandomPassenger: '👤 Random Passenger',
      autoSpawn: '🔄 Auto-spawn ON',
      autoSpawnOff: '🔄 Auto-spawn OFF',
      clearLog: '🗑️ Clear Log',
      enableElevator: '✅ Enable Elevator',
      disableElevator: '❌ Disable Elevator',
      speedControl: '⚡ Speed',
      elevator1On: '⚡ Elevator 1 ON',
      elevator1Off: '🚫 Elevator 1 OFF',
      elevator2On: '⚡ Elevator 2 ON',
      elevator2Off: '🚫 Elevator 2 OFF',
      speedOptions: {
        fast: '⚡ Fast (0.5s)',
        normal: '🚶 Normal (1s)',
        slow: '🐌 Slow (2s)',
        verySlow: '🦥 Very Slow (3s)',
      },
    },
    instructions: {
      title: 'Usage Instructions',
      content: `🚀 Simulation Controls:

• <strong>➕ Add Passenger:</strong> Click the elevator call button on any floor
• <strong>⚡ Auto Mode:</strong> Enable for automatic passenger generation
• <strong>🎛️ Speed:</strong> Choose spawn interval (0.5s - 3s)
• <strong>🔧 Elevator Control:</strong> Enable/disable elevators as needed

🏗️ Dual Elevator System:

• <strong>Smart Distribution:</strong> Algorithm selects the nearest elevator for calls
• <strong>Load Balancing:</strong> Considers movement direction and elevator capacity
• <strong>Shutdown:</strong> Elevator completes current passengers and returns to floor 1
• <strong>Performance:</strong> 2-3 times faster passenger delivery

📊 Statistics and Logs:

• <strong>Travel Time:</strong> Tracked for each passenger
• <strong>Emoji Reactions:</strong> 😃 (up to 30s), 😐 (up to 60s), 😠 (over 60s)
• <strong>Auto-scroll:</strong> Log automatically shows latest entries
• <strong>Limits:</strong> Maximum 10 passengers per floor, 5 per elevator

🎯 Elevator Algorithm:

• <strong>Direction:</strong> Elevator moves in the direction of most passengers
• <strong>Pickup:</strong> Collects passengers going in the same direction
• <strong>Optimization:</strong> Selects nearest targets to minimize wait time
• <strong>Statistics:</strong> Updates every 20 records for performance optimization`,
    },
    headers: {
      buildingTitle: '🏢 Elevator Simulator',
    },
    buildingStats: {
      totalPassengers: 'Total passengers',
      passengersInElevators: 'Passengers in elevators',
    },
    emojis: {
      fast: '😃',
      normal: '😐',
      slow: '��',
    },
  },
};
