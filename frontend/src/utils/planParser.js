/**
 * Utility to parse the AI-generated markdown workout plan into structured JSON.
 * Expects format like:
 * ### Day 1: [Title]
 * - Exercise name [details]
 */
export const parseWorkoutPlan = (markdown) => {
  if (!markdown) return [];

  const days = [];
  const daySections = markdown.split(/### Day\s*(\d+):?/i);

  // daySections[0] is everything BEFORE the first "### Day 1"
  for (let i = 1; i < daySections.length; i += 2) {
    const dayNumber = daySections[i];
    const content = daySections[i + 1] || "";

    // Split content by lines and find lists (exercises)
    const lines = content.split('\n');
    const titleLine = lines[0].trim();
    const exercises = lines
      .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
      .map(line => line.replace(/^[-*]\s*/, '').trim());

    if (exercises.length > 0) {
      days.push({
        day: parseInt(dayNumber),
        title: titleLine || `Workout Day ${dayNumber}`,
        exercises: exercises
      });
    }
  }

  return days;
};
