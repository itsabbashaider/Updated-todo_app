function AchievementPopup({
  achievement,
}) {
  if (!achievement) {
    return null;
  }

  return (
    <div className="achievement-popup">
      <div className="achievement-popup-icon">
        {achievement.icon}
      </div>

      <div className="achievement-popup-content">
        <span className="achievement-popup-label">
          Achievement Unlocked
        </span>

        <h3>{achievement.title}</h3>

        <p>{achievement.description}</p>
      </div>
    </div>
  );
}

export default AchievementPopup;