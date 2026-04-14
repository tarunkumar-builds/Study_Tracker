import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';
import Subject from '../models/Subject.js';
import Note from '../models/Note.js';
import Flashcard from '../models/Flashcard.js';
import PomodoroSession from '../models/PomodoroSession.js';
import StudyHistory from '../models/StudyHistory.js';
import Timetable from '../models/Timetable.js';

dotenv.config();

const seedUser = {
  name: 'Test User',
  email: process.env.SEED_EMAIL || 'test@example.com',
  password: process.env.SEED_PASSWORD || 'password123',
  preferences: {
    pomodoroFocusTime: 25,
    pomodoroBreakTime: 5,
    dailyGoalMinutes: 180,
    theme: 'dark'
  }
};

const subjectBlueprints = [
  {
    name: 'Operating Systems',
    color: '#10B981',
    chapters: [
      {
        title: 'Process Management',
        topics: [
          { title: 'Process vs Thread', completed: true, timeSpent: 95, notes: 'Focus on state transitions and context switching.' },
          { title: 'CPU Scheduling', completed: true, timeSpent: 140, notes: 'Practice FCFS, SJF, Priority, and Round Robin numericals.' },
          { title: 'Synchronization', completed: false, timeSpent: 70, notes: 'Revise semaphores, mutex, and critical section conditions.' }
        ]
      },
      {
        title: 'Memory Management',
        topics: [
          { title: 'Paging and Segmentation', completed: true, timeSpent: 110, notes: 'Compare internal and external fragmentation.' },
          { title: 'Page Replacement', completed: false, timeSpent: 85, notes: 'FIFO, LRU, Optimal.' }
        ]
      }
    ]
  },
  {
    name: 'DBMS',
    color: '#3B82F6',
    chapters: [
      {
        title: 'Relational Design',
        topics: [
          { title: 'Keys and Constraints', completed: true, timeSpent: 80, notes: 'Primary, foreign, candidate, super keys.' },
          { title: 'Normalization', completed: true, timeSpent: 125, notes: '1NF to BCNF with dependency examples.' },
          { title: 'ER to Relational Mapping', completed: false, timeSpent: 55, notes: 'Weak entities and participation constraints.' }
        ]
      },
      {
        title: 'Transactions',
        topics: [
          { title: 'ACID Properties', completed: true, timeSpent: 60, notes: 'Link examples to banking systems.' },
          { title: 'Concurrency Control', completed: false, timeSpent: 75, notes: 'Locks, serializability, deadlocks.' }
        ]
      }
    ]
  },
  {
    name: 'Computer Networks',
    color: '#F59E0B',
    chapters: [
      {
        title: 'Protocol Models',
        topics: [
          { title: 'OSI Model', completed: true, timeSpent: 65, notes: 'Memorize layer responsibilities and devices.' },
          { title: 'TCP/IP Model', completed: true, timeSpent: 50, notes: 'Map OSI layers to TCP/IP stack.' }
        ]
      },
      {
        title: 'Transport and Routing',
        topics: [
          { title: 'TCP vs UDP', completed: true, timeSpent: 70, notes: 'Use application examples in answers.' },
          { title: 'Routing Algorithms', completed: false, timeSpent: 45, notes: 'Distance vector vs link state.' },
          { title: 'Congestion Control', completed: false, timeSpent: 40, notes: 'Slow start and AIMD basics.' }
        ]
      }
    ]
  },
  {
    name: 'Algorithms',
    color: '#8B5CF6',
    chapters: [
      {
        title: 'Complexity Analysis',
        topics: [
          { title: 'Asymptotic Notation', completed: true, timeSpent: 75, notes: 'Big-O, Theta, Omega.' },
          { title: 'Recurrence Relations', completed: false, timeSpent: 55, notes: 'Master theorem practice.' }
        ]
      },
      {
        title: 'Design Techniques',
        topics: [
          { title: 'Divide and Conquer', completed: true, timeSpent: 90, notes: 'Merge sort and quick sort proofs.' },
          { title: 'Dynamic Programming', completed: false, timeSpent: 105, notes: 'LCS and knapsack tables.' },
          { title: 'Greedy Algorithms', completed: false, timeSpent: 60, notes: 'When greedy choice property holds.' }
        ]
      }
    ]
  }
];

const noteBlueprints = [
  {
    subjectName: 'Operating Systems',
    title: 'CPU Scheduling Quick Revision',
    category: 'Exam Revision',
    tags: ['os', 'scheduling', 'round robin'],
    color: '#111827',
    isPinned: true,
    content: `Important points:

1. FCFS is simple but suffers from convoy effect.
2. SJF minimizes average waiting time if burst estimate is accurate.
3. Round Robin improves responsiveness using a time quantum.
4. Priority scheduling can cause starvation without aging.

For numericals:
- Draw Gantt chart first.
- Compute completion time, turnaround time, and waiting time separately.`
  },
  {
    subjectName: 'DBMS',
    title: 'Normalization Cheat Sheet',
    category: 'Core Concepts',
    tags: ['dbms', 'normalization', 'bcnf'],
    color: '#1F2937',
    content: `1NF removes repeating groups.
2NF removes partial dependency.
3NF removes transitive dependency.
BCNF requires every determinant to be a candidate key.

Use functional dependencies clearly before decomposing a relation.`
  },
  {
    subjectName: 'Computer Networks',
    title: 'TCP vs UDP Comparison',
    category: 'Short Notes',
    tags: ['cn', 'tcp', 'udp'],
    color: '#334155',
    content: `TCP:
- Connection-oriented
- Reliable and ordered
- Higher overhead

UDP:
- Connectionless
- Faster and lightweight
- No delivery guarantee

Examples:
- TCP for HTTP and file transfer
- UDP for DNS and streaming`
  },
  {
    subjectName: 'Algorithms',
    title: 'Dynamic Programming Checklist',
    category: 'Problem Solving',
    tags: ['algorithms', 'dp'],
    color: '#0F172A',
    content: `Before writing a DP solution:
- Identify state
- Write recurrence
- Define base cases
- Decide memoization or tabulation
- Check time and space complexity`
  },
  {
    subjectName: 'Operating Systems',
    title: 'Deadlock Prevention Snapshot',
    category: 'Concept Map',
    tags: ['os', 'deadlock', 'safety'],
    color: '#10B981',
    isPinned: true,
    content: `Prevention strategies to remember:

- Break hold and wait using one-shot resource requests.
- Allow preemption when resources can be safely reclaimed.
- Use resource ordering to eliminate circular wait.

Exam tip:
Always mention prevention, avoidance, and detection/recovery separately.`
  },
  {
    subjectName: 'Operating Systems',
    title: 'Memory Management One-Page Summary',
    category: 'Quick Review',
    tags: ['os', 'paging', 'segmentation', 'replacement'],
    color: '#1E293B',
    content: `Compare these cleanly in answers:

- Paging: fixed-size blocks, avoids external fragmentation.
- Segmentation: logical division, easier for protection/sharing.
- Page replacement: FIFO, LRU, Optimal.

Numerical focus:
page faults, hit ratio, and effective access time.`
  },
  {
    subjectName: 'DBMS',
    title: 'Transaction Control Last-Minute Notes',
    category: 'Exam Revision',
    tags: ['dbms', 'transactions', 'acid', 'serializability'],
    color: '#3B82F6',
    isPinned: true,
    content: `Fast recall checklist:

1. Define transaction and schedule.
2. Explain conflict serializability.
3. Write ACID with one practical example each.
4. Mention lock-based control and deadlock handling.

High-scoring add-on:
contrast strict 2PL with basic 2PL.`
  },
  {
    subjectName: 'DBMS',
    title: 'SQL Query Patterns',
    category: 'Practice Sheet',
    tags: ['dbms', 'sql', 'joins', 'group by'],
    color: '#1D4ED8',
    content: `Patterns worth practicing:

- INNER JOIN with aliases
- GROUP BY with HAVING
- nested subqueries for max/min cases
- EXISTS for conditional matching

Common mistakes:
forgetting grouping columns and mixing WHERE with HAVING.`
  },
  {
    subjectName: 'DBMS',
    title: 'Indexing and File Organization',
    category: 'Core Concepts',
    tags: ['dbms', 'indexing', 'b+ tree'],
    color: '#1E40AF',
    content: `Revision anchors:

- Primary index vs secondary index
- Dense vs sparse index
- B and B+ trees
- Heap, sequential, and hashed file organization

Use diagrams in descriptive questions for better presentation.`
  },
  {
    subjectName: 'Computer Networks',
    title: 'OSI Layer Memory Hooks',
    category: 'Memory Aid',
    tags: ['cn', 'osi', 'layers'],
    color: '#F59E0B',
    content: `Layer cues:

- Physical: signals and media
- Data Link: framing and MAC
- Network: routing
- Transport: reliability and flow control
- Session/Presentation/Application: user-facing services

Pair each layer with one protocol or device in answers.`
  },
  {
    subjectName: 'Computer Networks',
    title: 'Routing Algorithms Comparison',
    category: 'Short Notes',
    tags: ['cn', 'routing', 'distance vector', 'link state'],
    color: '#B45309',
    content: `Distance Vector:
- shares table with neighbors
- simpler but slower convergence

Link State:
- builds network-wide view
- faster convergence, more computation

Important term:
count-to-infinity problem in distance vector routing.`
  },
  {
    subjectName: 'Computer Networks',
    title: 'Reliable Data Transfer Cheatsheet',
    category: 'Protocol Review',
    tags: ['cn', 'sliding window', 'arq', 'flow control'],
    color: '#92400E',
    content: `Cover these in sequence:

- Stop-and-Wait ARQ
- Go-Back-N
- Selective Repeat
- sliding window and sequence numbers

Always connect reliability with ACKs, timers, and retransmission.`
  },
  {
    subjectName: 'Algorithms',
    title: 'Greedy Strategy Sanity Check',
    category: 'Problem Solving',
    tags: ['algorithms', 'greedy', 'proof'],
    color: '#8B5CF6',
    content: `Before choosing greedy:

- verify greedy-choice property
- verify optimal substructure
- test a small counterexample

Classic examples:
activity selection, Huffman coding, fractional knapsack.`
  },
  {
    subjectName: 'Algorithms',
    title: 'Recurrence Solving Framework',
    category: 'Formula Sheet',
    tags: ['algorithms', 'recurrence', 'master theorem'],
    color: '#6D28D9',
    content: `Workflow:

1. Match the recurrence with Master Theorem form.
2. Compare f(n) with n^(log_b a).
3. Identify the case and write the bound clearly.

Fallback methods:
substitution and recursion tree.`
  },
  {
    subjectName: 'Algorithms',
    title: 'Dynamic Programming Patterns',
    category: 'Interview Prep',
    tags: ['algorithms', 'dp', 'lcs', 'knapsack'],
    color: '#4C1D95',
    content: `Patterns to spot quickly:

- prefix decisions
- include/exclude choices
- grid transitions
- partitioning states

Practice set:
0/1 knapsack, LCS, matrix chain multiplication, coin change.`
  }
];

const flashcardBlueprints = [
  {
    subjectName: 'Operating Systems',
    question: 'What are the four necessary conditions for deadlock?',
    answer: 'Mutual exclusion, hold and wait, no preemption, and circular wait.',
    repetitions: 2,
    interval: 6,
    easeFactor: 2.6,
    totalReviews: 3,
    correctReviews: 3,
    incorrectReviews: 0,
    daysUntilReview: -1
  },
  {
    subjectName: 'Operating Systems',
    question: 'Why is Round Robin suitable for time-sharing systems?',
    answer: 'It gives each process a fair CPU slice using a fixed quantum, improving responsiveness.',
    repetitions: 1,
    interval: 3,
    easeFactor: 2.4,
    totalReviews: 2,
    correctReviews: 2,
    incorrectReviews: 0,
    daysUntilReview: 0
  },
  {
    subjectName: 'DBMS',
    question: 'What does ACID stand for?',
    answer: 'Atomicity, Consistency, Isolation, and Durability.',
    repetitions: 3,
    interval: 8,
    easeFactor: 2.5,
    totalReviews: 4,
    correctReviews: 4,
    incorrectReviews: 0,
    daysUntilReview: 2
  },
  {
    subjectName: 'Computer Networks',
    question: 'Which OSI layer is responsible for routing?',
    answer: 'The Network layer.',
    repetitions: 0,
    interval: 1,
    easeFactor: 2.5,
    totalReviews: 1,
    correctReviews: 0,
    incorrectReviews: 1,
    daysUntilReview: -2
  },
  {
    subjectName: 'Algorithms',
    question: 'What is the time complexity of merge sort?',
    answer: 'O(n log n) in the best, average, and worst case.',
    repetitions: 1,
    interval: 2,
    easeFactor: 2.3,
    totalReviews: 2,
    correctReviews: 1,
    incorrectReviews: 1,
    daysUntilReview: 1
  },
  {
    subjectName: 'Operating Systems',
    question: 'What is the difference between a process and a thread?',
    answer: 'A process has its own address space and resources, while threads share a process address space and execute concurrently within it.',
    repetitions: 2,
    interval: 5,
    easeFactor: 2.5,
    totalReviews: 3,
    correctReviews: 3,
    incorrectReviews: 0,
    daysUntilReview: 0
  },
  {
    subjectName: 'Operating Systems',
    question: 'What does paging help eliminate?',
    answer: 'Paging eliminates external fragmentation by dividing memory into fixed-size frames and pages.',
    repetitions: 1,
    interval: 4,
    easeFactor: 2.4,
    totalReviews: 2,
    correctReviews: 2,
    incorrectReviews: 0,
    daysUntilReview: 2
  },
  {
    subjectName: 'DBMS',
    question: 'What is a functional dependency?',
    answer: 'It is a relationship where one attribute or set of attributes uniquely determines another attribute.',
    repetitions: 2,
    interval: 6,
    easeFactor: 2.6,
    totalReviews: 3,
    correctReviews: 3,
    incorrectReviews: 0,
    daysUntilReview: -1
  },
  {
    subjectName: 'DBMS',
    question: 'Why is BCNF stronger than 3NF?',
    answer: 'BCNF requires every determinant to be a candidate key, removing some anomalies that can still remain in 3NF.',
    repetitions: 1,
    interval: 3,
    easeFactor: 2.35,
    totalReviews: 2,
    correctReviews: 1,
    incorrectReviews: 1,
    daysUntilReview: 1
  },
  {
    subjectName: 'DBMS',
    question: 'What is a deadlock in transaction processing?',
    answer: 'A deadlock occurs when two or more transactions wait indefinitely for each other to release locks.',
    repetitions: 0,
    interval: 1,
    easeFactor: 2.3,
    totalReviews: 1,
    correctReviews: 0,
    incorrectReviews: 1,
    daysUntilReview: -2
  },
  {
    subjectName: 'Computer Networks',
    question: 'What is the main purpose of the transport layer?',
    answer: 'It provides end-to-end communication, reliability, flow control, and segmentation between processes.',
    repetitions: 2,
    interval: 5,
    easeFactor: 2.5,
    totalReviews: 3,
    correctReviews: 2,
    incorrectReviews: 1,
    daysUntilReview: 0
  },
  {
    subjectName: 'Computer Networks',
    question: 'What is the difference between TCP and UDP?',
    answer: 'TCP is connection-oriented and reliable, while UDP is connectionless, lightweight, and does not guarantee delivery.',
    repetitions: 3,
    interval: 9,
    easeFactor: 2.6,
    totalReviews: 4,
    correctReviews: 4,
    incorrectReviews: 0,
    daysUntilReview: 3
  },
  {
    subjectName: 'Computer Networks',
    question: 'What problem does congestion control solve?',
    answer: 'It prevents the network from being overloaded by regulating the sending rate when traffic becomes excessive.',
    repetitions: 1,
    interval: 2,
    easeFactor: 2.4,
    totalReviews: 2,
    correctReviews: 1,
    incorrectReviews: 1,
    daysUntilReview: -1
  },
  {
    subjectName: 'Algorithms',
    question: 'When does dynamic programming apply?',
    answer: 'When a problem has overlapping subproblems and optimal substructure.',
    repetitions: 2,
    interval: 4,
    easeFactor: 2.5,
    totalReviews: 3,
    correctReviews: 3,
    incorrectReviews: 0,
    daysUntilReview: 0
  },
  {
    subjectName: 'Algorithms',
    question: 'What is the greedy-choice property?',
    answer: 'It means a globally optimal solution can be reached by making locally optimal choices at each step.',
    repetitions: 1,
    interval: 3,
    easeFactor: 2.45,
    totalReviews: 2,
    correctReviews: 2,
    incorrectReviews: 0,
    daysUntilReview: 2
  },
  {
    subjectName: 'Algorithms',
    question: 'What does the Master Theorem help solve?',
    answer: 'It helps solve divide-and-conquer recurrences of the form T(n) = aT(n/b) + f(n).',
    repetitions: 0,
    interval: 1,
    easeFactor: 2.5,
    totalReviews: 1,
    correctReviews: 1,
    incorrectReviews: 0,
    daysUntilReview: -1
  }
];

const weeklySessionBlueprint = [
  {
    daysAgo: 6,
    sessions: [
      { subjectName: 'Operating Systems', hour: 6, minute: 45, duration: 50 },
      { subjectName: 'DBMS', hour: 10, minute: 0, duration: 45 },
      { subjectName: 'Algorithms', hour: 16, minute: 30, duration: 40 },
      { subjectName: 'Operating Systems', hour: 20, minute: 15, duration: 35 }
    ]
  },
  {
    daysAgo: 5,
    sessions: [
      { subjectName: 'Computer Networks', hour: 7, minute: 30, duration: 45 },
      { subjectName: 'DBMS', hour: 11, minute: 0, duration: 50 },
      { subjectName: 'Algorithms', hour: 15, minute: 45, duration: 35 },
      { subjectName: 'DBMS', hour: 21, minute: 0, duration: 30 }
    ]
  },
  {
    daysAgo: 4,
    sessions: [
      { subjectName: 'Operating Systems', hour: 6, minute: 30, duration: 55 },
      { subjectName: 'Computer Networks', hour: 9, minute: 45, duration: 40 },
      { subjectName: 'Algorithms', hour: 14, minute: 30, duration: 45 },
      { subjectName: 'DBMS', hour: 19, minute: 30, duration: 35 }
    ]
  },
  {
    daysAgo: 3,
    sessions: [
      { subjectName: 'DBMS', hour: 7, minute: 0, duration: 60 },
      { subjectName: 'Algorithms', hour: 12, minute: 0, duration: 45 },
      { subjectName: 'Operating Systems', hour: 17, minute: 15, duration: 30 },
      { subjectName: 'Computer Networks', hour: 21, minute: 0, duration: 25 }
    ]
  },
  {
    daysAgo: 2,
    sessions: [
      { subjectName: 'Operating Systems', hour: 6, minute: 50, duration: 50 },
      { subjectName: 'DBMS', hour: 10, minute: 30, duration: 40 },
      { subjectName: 'Computer Networks', hour: 15, minute: 15, duration: 35 },
      { subjectName: 'Algorithms', hour: 19, minute: 45, duration: 50 }
    ]
  },
  {
    daysAgo: 1,
    sessions: [
      { subjectName: 'Algorithms', hour: 7, minute: 15, duration: 55 },
      { subjectName: 'DBMS', hour: 11, minute: 45, duration: 35 },
      { subjectName: 'Computer Networks', hour: 16, minute: 0, duration: 30 },
      { subjectName: 'Operating Systems', hour: 20, minute: 30, duration: 40 }
    ]
  },
  {
    daysAgo: 0,
    sessions: [
      { subjectName: 'Operating Systems', hour: 6, minute: 40, duration: 45 },
      { subjectName: 'Algorithms', hour: 9, minute: 30, duration: 50 },
      { subjectName: 'DBMS', hour: 14, minute: 0, duration: 40 },
      { subjectName: 'Computer Networks', hour: 18, minute: 0, duration: 30 },
      { subjectName: 'Operating Systems', hour: 21, minute: 15, duration: 25 }
    ]
  }
];

const timetableBlueprint = [
  { hour: 6, subjectName: 'Operating Systems', label: 'Morning revision and recap' },
  { hour: 7, subjectName: 'Operating Systems', label: 'Problem practice block' },
  { hour: 10, subjectName: 'DBMS', label: 'Concept building and SQL drills' },
  { hour: 14, subjectName: 'Computer Networks', label: 'Protocol review session' },
  { hour: 17, subjectName: 'Algorithms', label: 'DSA problem-solving sprint' },
  { hour: 20, subjectName: 'DBMS', label: 'Evening spaced revision' }
];

const buildDateAtHour = (baseDate, hour, minutes = 0) => {
  const date = new Date(baseDate);
  date.setHours(hour, minutes, 0, 0);
  return date;
};

const createStudyHistoryDocs = (userId, subjectMap) => {
  return weeklySessionBlueprint.map((entry) => {
    const date = new Date();
    date.setDate(date.getDate() - entry.daysAgo);
    date.setHours(0, 0, 0, 0);

    const subjectTotals = entry.sessions.reduce((acc, session) => {
      if (!acc[session.subjectName]) {
        acc[session.subjectName] = { minutes: 0, sessions: 0 };
      }
      acc[session.subjectName].minutes += session.duration;
      acc[session.subjectName].sessions += 1;
      return acc;
    }, {});

    const subjects = Object.entries(subjectTotals).map(([subjectName, stats]) => ({
      subjectId: subjectMap.get(subjectName)._id,
      minutes: stats.minutes,
      sessions: stats.sessions
    }));

    return {
      userId,
      date,
      totalFocusMinutes: subjects.reduce((sum, item) => sum + item.minutes, 0),
      sessionCount: subjects.reduce((sum, item) => sum + item.sessions, 0),
      subjects
    };
  });
};

const createPomodoroSessions = (userId, subjectMap) => {
  const sessions = [];

  weeklySessionBlueprint.forEach((entry) => {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - entry.daysAgo);
    baseDate.setHours(0, 0, 0, 0);

    entry.sessions.forEach((session, index) => {
      const subject = subjectMap.get(session.subjectName);
      const focusStart = buildDateAtHour(baseDate, session.hour, session.minute);
      const focusEnd = new Date(focusStart.getTime() + session.duration * 60000);

      sessions.push({
        userId,
        subjectId: subject._id,
        duration: session.duration,
        type: 'focus',
        completed: true,
        date: focusStart,
        startTime: focusStart,
        endTime: focusEnd
      });

      const isLastSession = index === entry.sessions.length - 1;
      if (!isLastSession) {
        const breakDuration = index === 1 ? 15 : 10;
        const breakStart = new Date(focusEnd);
        sessions.push({
          userId,
          subjectId: null,
          duration: breakDuration,
          type: 'break',
          completed: true,
          date: breakStart,
          startTime: breakStart,
          endTime: new Date(breakStart.getTime() + breakDuration * 60000)
        });
      }
    });
  });

  return sessions;
};

const createTimetableSlots = (subjectMap) => {
  const timetableMap = new Map(timetableBlueprint.map((slot) => [slot.hour, slot]));
  const slots = [];
  for (let hour = 0; hour < 24; hour += 1) {
    const slotBlueprint = timetableMap.get(hour);
    const subjectName = slotBlueprint?.subjectName;
    slots.push({
      hour,
      subjectId: subjectName ? subjectMap.get(subjectName)._id : null,
      label: slotBlueprint?.label || ''
    });
  }
  return slots;
};

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing seedable collections...');
    await Promise.all([
      User.deleteMany({ email: seedUser.email }),
      Subject.deleteMany({}),
      Note.deleteMany({}),
      Flashcard.deleteMany({}),
      PomodoroSession.deleteMany({}),
      StudyHistory.deleteMany({}),
      Timetable.deleteMany({})
    ]);

    console.log('Creating test user...');
    const user = await User.create(seedUser);

    console.log('Creating subjects with chapters and topics...');
    const subjects = await Subject.create(
      subjectBlueprints.map((subject) => ({
        userId: user._id,
        name: subject.name,
        color: subject.color,
        chapters: subject.chapters.map((chapter) => ({
          title: chapter.title,
          topics: chapter.topics.map((topic) => ({
            title: topic.title,
            completed: topic.completed,
            timeSpent: topic.timeSpent,
            durationSpent: topic.timeSpent,
            lastStudied: topic.completed ? new Date() : null,
            notes: topic.notes
          }))
        }))
      }))
    );

    const subjectMap = new Map(subjects.map((subject) => [subject.name, subject]));

    console.log('Creating notes...');
    await Note.create(
      noteBlueprints.map((note) => ({
        userId: user._id,
        subjectId: subjectMap.get(note.subjectName)._id,
        title: note.title,
        content: note.content,
        category: note.category,
        tags: note.tags,
        isPinned: note.isPinned || false,
        color: note.color
      }))
    );

    console.log('Creating flashcards...');
    await Flashcard.create(
      flashcardBlueprints.map((card) => {
        const nextReviewDate = new Date();
        nextReviewDate.setDate(nextReviewDate.getDate() + card.daysUntilReview);

        const lastReviewDate = new Date(nextReviewDate);
        lastReviewDate.setDate(lastReviewDate.getDate() - Math.max(1, card.interval));

        return {
          userId: user._id,
          subjectId: subjectMap.get(card.subjectName)._id,
          question: card.question,
          answer: card.answer,
          nextReviewDate,
          interval: card.interval,
          repetitions: card.repetitions,
          easeFactor: card.easeFactor,
          lastReviewDate,
          totalReviews: card.totalReviews,
          correctReviews: card.correctReviews,
          incorrectReviews: card.incorrectReviews
        };
      })
    );

    console.log('Creating study history...');
    await StudyHistory.create(createStudyHistoryDocs(user._id, subjectMap));

    console.log('Creating pomodoro sessions...');
    await PomodoroSession.create(createPomodoroSessions(user._id, subjectMap));

    console.log('Creating timetable...');
    await Timetable.create({
      userId: user._id,
      slots: createTimetableSlots(subjectMap),
      repeatsDaily: true
    });

    console.log('\nSeed data created successfully.');
    console.log(`User: ${seedUser.email}`);
    console.log(`Password: ${seedUser.password}`);
    console.log(`Subjects: ${subjects.length}`);
    console.log(`Notes: ${noteBlueprints.length}`);
    console.log(`Flashcards: ${flashcardBlueprints.length}`);
    console.log(`History days: ${weeklySessionBlueprint.length}`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
