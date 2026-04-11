function getTimeOfDayProfile() {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 11) {
    return { name: "morning", speed: 0.7, activity: 0.6 };
  }
  if (hour >= 11 && hour < 17) {
    return { name: "afternoon", speed: 1.0, activity: 1.0 };
  }
  if (hour >= 17 && hour < 22) {
    return { name: "evening", speed: 1.2, activity: 1.3 };
  }
  return { name: "night", speed: 0.5, activity: 0.3 };
}