# 🏢 Multi-Elevator Simulation System

[🌐 Live Demo](https://andreielevator.netlify.app/)

## 🇷🇺 Русская версия

### 📋 Описание проекта

Интерактивная симуляция системы управления лифтами с реалистичной логикой и современным веб-интерфейсом. Проект демонстрирует применение React, TypeScript и алгоритмов оптимизации в реальных сценариях.

### 🚀 Ключевые возможности

#### 🏗️ Система управления лифтами

- **Два лифта** с умным алгоритмом распределения вызовов
- **Динамическое отключение/включение** лифтов в реальном времени
- **Оптимизированная логика** выбора ближайшего лифта с учетом направления и нагрузки

#### 🎮 Интерактивное управление

- **Ручное добавление** пассажиров на любой этаж
- **Автоматический режим** с настраиваемой скоростью (0.5с - 3с)
- **Визуальная обратная связь** с эмодзи-реакциями на время ожидания
- **Реальное время** отображение статистики и логов

#### 📊 Аналитика и мониторинг

- **Отслеживание времени** в пути для каждого пассажира
- **Эмодзи-реакции**: 😃 (до 30с), 😐 (до 60с), 😠 (более 60с)
- **Автоскролл** логов с подсветкой новых записей
- **Ограничения системы**: 10 пассажиров на этаже, 5 в лифте

### 🛠️ Технический стек

- **Frontend**: React 18 + TypeScript
- **Стилизация**: CSS Modules с CSS Grid и Flexbox
- **Анимации**: CSS Transforms для плавного движения лифтов
- **Тестирование**: Vitest для unit-тестов
- **Деплой**: Netlify с автоматической сборкой

### 🧠 Архитектурные решения

#### Чистые функции и иммутабельность

- Все операции с состоянием реализованы как чистые функции
- Отсутствие мутаций данных обеспечивает предсказуемость
- Легкое тестирование и отладка

#### Оптимизация производительности

- Ограничение размера лога (100 записей)
- Мемоизация вычислений с помощью `useMemo`
- Эффективные алгоритмы поиска ближайших целей

#### Масштабируемость

- Архитектура готова для добавления новых лифтов
- Модульная структура компонентов
- Переиспользуемые хуки и утилиты

### 🎯 Алгоритм работы

1. **Распределение вызовов**: Алгоритм выбирает оптимальный лифт на основе:
   - Расстояния до вызова
   - Направления движения
   - Текущей загруженности

2. **Управление движением**: Лифт следует принципам:
   - Приоритет доставки пассажиров над новыми вызовами
   - Подбор попутчиков в том же направлении
   - Смена направления при отсутствии целей

3. **Обработка отключений**: Отключенный лифт:
   - Завершает перевозку текущих пассажиров
   - Возвращается на первый этаж
   - Не принимает новые вызовы

---

## 🇺🇸 English Version

### 📋 Project Description

Interactive elevator management system simulation with realistic logic and modern web interface. The project demonstrates the application of React, TypeScript, and optimization algorithms in real-world scenarios.

### 🚀 Key Features

#### 🏗️ Elevator Management System

- **Two elevators** with smart call distribution algorithm
- **Dynamic enable/disable** of elevators in real-time
- **Optimized logic** for selecting the nearest elevator considering direction and load

#### 🎮 Interactive Controls

- **Manual passenger addition** on any floor
- **Automatic mode** with configurable speed (0.5s - 3s)
- **Visual feedback** with emoji reactions based on wait time
- **Real-time** statistics and log display

#### 📊 Analytics and Monitoring

- **Travel time tracking** for each passenger
- **Emoji reactions**: 😃 (up to 30s), 😐 (up to 60s), 😠 (over 60s)
- **Auto-scroll** logs with new entry highlighting
- **System constraints**: 10 passengers per floor, 5 per elevator

### 🛠️ Technical Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: CSS Modules with CSS Grid and Flexbox
- **Animations**: CSS Transforms for smooth elevator movement
- **Testing**: Vitest for unit tests
- **Deployment**: Netlify with automatic builds

### 🧠 Architectural Decisions

#### Pure Functions and Immutability

- All state operations implemented as pure functions
- No data mutations ensure predictability
- Easy testing and debugging

#### Performance Optimization

- Log size limitation (100 entries)
- Computation memoization using `useMemo`
- Efficient algorithms for finding nearest targets

#### Scalability

- Architecture ready for adding new elevators
- Modular component structure
- Reusable hooks and utilities

### 🎯 Algorithm Overview

1. **Call Distribution**: Algorithm selects optimal elevator based on:
   - Distance to call
   - Movement direction
   - Current load

2. **Movement Management**: Elevator follows principles:
   - Priority of passenger delivery over new calls
   - Picking up passengers going in the same direction
   - Direction change when no targets remain

3. **Disable Handling**: Disabled elevator:
   - Completes current passenger transport
   - Returns to first floor
   - Doesn't accept new calls

### 🚀 Getting Started

```bash
# Clone repository
git clone [repository-url]

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### 📈 Performance Metrics

- **2-3x faster** passenger delivery with dual elevator system
- **Smart call assignment** prevents both elevators responding to same call
- **Real-time updates** with 60fps animations
- **Memory efficient** with log size limits

---

## 📝 License

MIT License - feel free to use this project for learning and portfolio purposes.

## 🤝 Contributing

This is a portfolio project demonstrating modern React development practices. Feel free to fork and experiment!
