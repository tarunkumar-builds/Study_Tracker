// Recalculate topic/chapter/subject progress values from nested hierarchy.
// This keeps math in one place so controllers and models stay consistent.
export const recalculateSubjectProgress = (subject) => {
  if (!subject) return subject;

  let totalTopics = 0;
  let completedTopics = 0;
  let totalTimeSpent = 0;

  subject.chapters.forEach((chapter) => {
    let chapterTopics = 0;
    let chapterCompleted = 0;
    let chapterTime = 0;

    chapter.topics.forEach((topic) => {
      // Support both latest `timeSpent` and legacy `durationSpent`.
      const topicTime = Number(topic.timeSpent ?? topic.durationSpent ?? 0);
      topic.timeSpent = topicTime;
      topic.durationSpent = topicTime;

      chapterTopics += 1;
      chapterTime += topicTime;

      if (topic.completed) {
        chapterCompleted += 1;
      }
    });

    chapter.totalTimeSpent = chapterTime;
    chapter.completionPercentage = chapterTopics
      ? Math.round((chapterCompleted / chapterTopics) * 100)
      : 0;

    totalTopics += chapterTopics;
    completedTopics += chapterCompleted;
    totalTimeSpent += chapterTime;
  });

  // Total study time is topic time + timer focus minutes.
  subject.totalTimeSpent = totalTimeSpent + Number(subject.timerTimeSpent || 0);
  subject.completionPercentage = totalTopics
    ? Math.round((completedTopics / totalTopics) * 100)
    : 0;

  return subject;
};
