import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';
import Subject from '../models/Subject.js';
import Note from '../models/Note.js';
import Flashcard from '../models/Flashcard.js';

dotenv.config();

const starterContent = [
  {
    subject: {
      name: 'Operating Systems',
      color: '#10B981'
    },
    notes: [
      {
        title: 'CPU Scheduling Cheat Sheet',
        category: 'Exam Revision',
        tags: ['cpu scheduling', 'fcfs', 'sjf', 'round robin'],
        color: '#1E293B',
        isPinned: true,
        content: `Important scheduling algorithms:

1. FCFS
- Non-preemptive and simple to implement.
- Can suffer from convoy effect when a long job blocks shorter ones.

2. SJF
- Chooses the process with the smallest burst time.
- Minimizes average waiting time, but needs burst-time prediction.

3. Round Robin
- Uses a fixed time quantum and rotates processes fairly.
- Very good for time-sharing systems.
- If quantum is too small, context-switch overhead rises.

Exam tip:
- For numerical questions, always draw the Gantt chart first.
- Then compute completion time, turnaround time, and waiting time carefully.`
      },
      {
        title: 'Deadlock Conditions and Recovery',
        category: 'Core Concepts',
        tags: ['deadlock', 'bankers algorithm', 'resource allocation'],
        color: '#111827',
        content: `Deadlock happens when a set of processes wait forever for resources held by each other.

Necessary conditions:
- Mutual exclusion
- Hold and wait
- No preemption
- Circular wait

Handling strategies:
- Prevention: break one of the four conditions.
- Avoidance: use safe-state checks such as Banker's Algorithm.
- Detection and recovery: allow deadlocks, detect them later, then recover.

Recovery methods:
- Abort one or more processes
- Preempt resources
- Roll back to a safe checkpoint if supported`
      }
    ],
    flashcards: [
      {
        question: 'What are the four necessary conditions for deadlock?',
        answer: 'Mutual exclusion, hold and wait, no preemption, and circular wait.'
      },
      {
        question: 'Why is Round Robin preferred in time-sharing systems?',
        answer: 'Because each process gets CPU time fairly using a fixed quantum, improving responsiveness for interactive users.'
      },
      {
        question: 'What is waiting time in CPU scheduling?',
        answer: 'Waiting time is the total time a process spends in the ready queue before getting CPU execution.'
      }
    ]
  },
  {
    subject: {
      name: 'DBMS',
      color: '#3B82F6'
    },
    notes: [
      {
        title: 'Normalization Quick Revision',
        category: 'Exam Revision',
        tags: ['normalization', '1nf', '2nf', '3nf', 'bcnf'],
        color: '#0F172A',
        isPinned: true,
        content: `Normalization reduces redundancy and improves consistency.

1NF:
- Atomic values only
- No repeating groups

2NF:
- Must already be in 1NF
- Remove partial dependency on a composite key

3NF:
- Must already be in 2NF
- Remove transitive dependency

BCNF:
- Stronger than 3NF
- Every determinant must be a candidate key

Rule of thumb:
- Normalize for integrity, then denormalize only when performance clearly requires it.`
      },
      {
        title: 'ACID Properties of Transactions',
        category: 'Core Concepts',
        tags: ['acid', 'transactions', 'concurrency control'],
        color: '#1F2937',
        content: `ACID properties make database transactions reliable:

- Atomicity: all operations complete or none do.
- Consistency: database moves from one valid state to another.
- Isolation: concurrent transactions do not interfere incorrectly.
- Durability: committed changes survive failures.

Examples:
- Bank transfer is atomic because debit and credit must both happen.
- Durability is typically supported using logs and recovery mechanisms.`
      }
    ],
    flashcards: [
      {
        question: 'What is the difference between 2NF and 3NF?',
        answer: '2NF removes partial dependency, while 3NF removes transitive dependency.'
      },
      {
        question: 'What does ACID stand for?',
        answer: 'Atomicity, Consistency, Isolation, and Durability.'
      },
      {
        question: 'What is a candidate key?',
        answer: 'A minimal set of attributes that can uniquely identify a tuple in a relation.'
      }
    ]
  },
  {
    subject: {
      name: 'Computer Networks',
      color: '#F59E0B'
    },
    notes: [
      {
        title: 'OSI vs TCP/IP',
        category: 'Core Concepts',
        tags: ['osi', 'tcp/ip', 'layers', 'networking'],
        color: '#334155',
        content: `OSI model has 7 layers:
- Physical
- Data Link
- Network
- Transport
- Session
- Presentation
- Application

TCP/IP model commonly uses 4 or 5 layers:
- Network Access
- Internet
- Transport
- Application

Easy mapping:
- OSI Network -> IP
- OSI Transport -> TCP/UDP
- OSI Application/Presentation/Session -> Application layer in TCP/IP`
      },
      {
        title: 'Important Transport Layer Points',
        category: 'Exam Revision',
        tags: ['tcp', 'udp', 'transport layer'],
        color: '#1E293B',
        content: `TCP:
- Connection-oriented
- Reliable
- Uses acknowledgements, sequencing, and flow control
- Used in web, email, and file transfer

UDP:
- Connectionless
- Faster and lightweight
- No guarantee of delivery
- Used in streaming, DNS, and gaming

Exam comparison:
- TCP emphasizes reliability.
- UDP emphasizes speed and low overhead.`
      }
    ],
    flashcards: [
      {
        question: 'Which protocol is connection-oriented: TCP or UDP?',
        answer: 'TCP is connection-oriented, while UDP is connectionless.'
      },
      {
        question: 'Which layer of the OSI model is responsible for routing?',
        answer: 'The Network layer.'
      }
    ]
  },
  {
    subject: {
      name: 'OOP',
      color: '#EC4899'
    },
    notes: [
      {
        title: 'Four Pillars of OOP',
        category: 'Fundamentals',
        tags: ['oop', 'encapsulation', 'inheritance', 'polymorphism', 'abstraction'],
        color: '#111827',
        content: `The four main pillars of object-oriented programming are:

- Encapsulation: bundle data and methods together and restrict direct access.
- Abstraction: hide internal complexity and show only essential behavior.
- Inheritance: derive a new class from an existing class.
- Polymorphism: one interface, many implementations.

Common viva point:
- Encapsulation is about data protection.
- Abstraction is about reducing visible complexity.`
      },
      {
        title: 'Class vs Object',
        category: 'Fundamentals',
        tags: ['class', 'object', 'instance'],
        color: '#1F2937',
        content: `Class:
- Blueprint or template
- Defines attributes and behaviors

Object:
- Runtime instance of a class
- Has actual state in memory

Example:
- Class: Car
- Object: myCar with color = red and speed = 60`
      }
    ],
    flashcards: [
      {
        question: 'What is polymorphism in OOP?',
        answer: 'Polymorphism is the ability of the same interface or method name to behave differently for different objects.'
      },
      {
        question: 'What is the difference between a class and an object?',
        answer: 'A class is a blueprint, while an object is an instance created from that blueprint.'
      }
    ]
  }
];

const findOrCreateSubject = async (userId, subjectData) => {
  const existing = await Subject.findOne({
    userId,
    name: new RegExp(`^${subjectData.name}$`, 'i')
  });

  if (existing) {
    return existing;
  }

  return Subject.create({
    userId,
    name: subjectData.name,
    color: subjectData.color,
    chapters: []
  });
};

const seedForUser = async (user) => {
  let notesInserted = 0;
  let flashcardsInserted = 0;
  let subjectsCreated = 0;

  for (const item of starterContent) {
    const subjectBefore = await Subject.findOne({
      userId: user._id,
      name: new RegExp(`^${item.subject.name}$`, 'i')
    });
    const subject = await findOrCreateSubject(user._id, item.subject);

    if (!subjectBefore) {
      subjectsCreated += 1;
    }

    for (const note of item.notes) {
      const existingNote = await Note.findOne({
        userId: user._id,
        subjectId: subject._id,
        title: note.title
      });

      if (!existingNote) {
        await Note.create({
          userId: user._id,
          subjectId: subject._id,
          ...note
        });
        notesInserted += 1;
      }
    }

    for (const flashcard of item.flashcards) {
      const existingFlashcard = await Flashcard.findOne({
        userId: user._id,
        subjectId: subject._id,
        question: flashcard.question
      });

      if (!existingFlashcard) {
        await Flashcard.create({
          userId: user._id,
          subjectId: subject._id,
          ...flashcard
        });
        flashcardsInserted += 1;
      }
    }
  }

  return { subjectsCreated, notesInserted, flashcardsInserted };
};

const seedStarterContent = async () => {
  try {
    await connectDB();

    const users = await User.find().select('_id name email');

    if (users.length === 0) {
      console.log('No users found. Create an account first, then run this script again.');
      process.exit(0);
    }

    let totalSubjectsCreated = 0;
    let totalNotesInserted = 0;
    let totalFlashcardsInserted = 0;

    for (const user of users) {
      const result = await seedForUser(user);
      totalSubjectsCreated += result.subjectsCreated;
      totalNotesInserted += result.notesInserted;
      totalFlashcardsInserted += result.flashcardsInserted;

      console.log(
        `Seeded ${user.email}: +${result.subjectsCreated} subjects, +${result.notesInserted} notes, +${result.flashcardsInserted} flashcards`
      );
    }

    console.log('\nStarter content seeding complete.');
    console.log(`Subjects created: ${totalSubjectsCreated}`);
    console.log(`Notes inserted: ${totalNotesInserted}`);
    console.log(`Flashcards inserted: ${totalFlashcardsInserted}`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding starter content:', error);
    process.exit(1);
  }
};

seedStarterContent();
