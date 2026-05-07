const CalendarStrip = ({
  selectedDate,
  setSelectedDate,
}) => {
  const getWeek = () => {
    const start = new Date(selectedDate);

    start.setDate(
      start.getDate() - start.getDay()
    );

    const week = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(start);

      d.setDate(
        start.getDate() + i
      );

      week.push(d);
    }

    return week;
  };

  return (
    <div className="calendar-strip">
      {getWeek().map((date, index) => {
        const today = new Date();

        const isActive =
          date.toDateString() ===
          selectedDate.toDateString();

        const isToday =
          date.toDateString() ===
          today.toDateString();

        return (
          <div
            key={index}
            className={`
              day
              ${isActive ? "active" : ""}
              ${isToday ? "today" : ""}
            `}
            onClick={() =>
              setSelectedDate(date)
            }
          >
            <span className="day-name">
              {date.toLocaleDateString(
                "en-US",
                {
                  weekday: "short",
                }
              )}
            </span>

            <span className="day-number">
              {date.getDate()}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default CalendarStrip;