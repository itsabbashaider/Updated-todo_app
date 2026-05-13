import { useState } from 'react';

// ─── Calendar Strip Component ─────────────────────────────────────────────────
const CalendarStrip = ({ selectedDate, setSelectedDate }) => {
  
  // ─── Initialize Week Start ────────────────────────────────────────────────
  const initialStart = new Date(selectedDate);
  initialStart.setDate(initialStart.getDate() - initialStart.getDay());

  const [weekStart, setWeekStart] = useState(initialStart);

  // ─── Generate Week ────────────────────────────────────────────────────────
  const getWeek = () => {
    const week = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      week.push(d);
    }

    return week;
  };

  // ─── Navigation ───────────────────────────────────────────────────────────
  const goPrevWeek = () => {
    const prev = new Date(weekStart);
    prev.setDate(prev.getDate() - 7);
    setWeekStart(prev);
  };

  const goNextWeek = () => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + 7);
    setWeekStart(next);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="calendar-wrapper">
      
      <button onClick={goPrevWeek}>←</button>

      <div className="calendar-strip">
        {getWeek().map((date, index) => {
          const today            = new Date();
          const isActive         = date.toDateString() === selectedDate.toDateString();
          const isToday          = date.toDateString() === today.toDateString();

          return (
            <div
              key={index}
              className={`day ${isActive ? 'active' : ''} ${isToday ? 'today' : ''}`}
              onClick={() => setSelectedDate(date)}
            >
              <span className="day-name">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>

              <span className="day-number">
                {date.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      <button onClick={goNextWeek}>→</button>

    </div>
  );
};

export default CalendarStrip;