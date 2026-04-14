import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';
import Subject from '../models/Subject.js';

dotenv.config();

const syllabus = [
  {
    name: 'Engineering Mathematics',
    color: '#10B981',
    chapters: [
      {
        title: 'Linear Algebra',
        topics: [
          'Matrices and Matrix Operations',
          'Determinants',
          'Rank of a Matrix',
          'Eigenvalues and Eigenvectors',
          'System of Linear Equations'
        ]
      },
      {
        title: 'Calculus',
        topics: [
          'Limits and Continuity',
          'Differentiation',
          'Applications of Derivatives',
          'Integration',
          'Multiple Integrals'
        ]
      },
      {
        title: 'Probability and Statistics',
        topics: [
          'Probability Basics',
          'Random Variables',
          'Probability Distributions',
          'Expectation and Variance',
          'Hypothesis Testing'
        ]
      },
      {
        title: 'Differential Equations',
        topics: [
          'First Order Differential Equations',
          'Higher Order Linear Differential Equations',
          'Homogeneous and Non-homogeneous Equations',
          'Method of Variation of Parameters',
          'Laplace Transform Applications'
        ]
      },
      {
        title: 'Discrete Mathematics',
        topics: [
          'Set Theory',
          'Relations and Functions',
          'Mathematical Logic',
          'Combinatorics',
          'Graph Theory'
        ]
      }
    ]
  },
  {
    name: 'Digital Logic',
    color: '#F59E0B',
    chapters: [
      {
        title: 'Boolean Algebra',
        topics: [
          'Boolean Laws and Identities',
          'Canonical Forms',
          'Boolean Function Simplification',
          'Duality Principle',
          'De Morgan\'s Theorems'
        ]
      },
      {
        title: 'Combinational Circuits',
        topics: [
          'Adders and Subtractors',
          'Multiplexers',
          'Demultiplexers',
          'Encoders and Decoders',
          'Comparators'
        ]
      },
      {
        title: 'Sequential Circuits',
        topics: [
          'SR Flip-Flop',
          'JK Flip-Flop',
          'D Flip-Flop',
          'T Flip-Flop',
          'State Diagrams'
        ]
      },
      {
        title: 'Minimization Techniques',
        topics: [
          'Karnaugh Maps',
          'Quine-McCluskey Method',
          'Prime Implicants',
          'Essential Prime Implicants',
          'Don\'t Care Conditions'
        ]
      },
      {
        title: 'Registers and Counters',
        topics: [
          'Shift Registers',
          'Ring Counters',
          'Johnson Counters',
          'Asynchronous Counters',
          'Synchronous Counters'
        ]
      }
    ]
  },
  {
    name: 'Computer Organization and Architecture',
    color: '#60A5FA',
    chapters: [
      {
        title: 'Basic Computer Organization',
        topics: [
          'Instruction Execution Cycle',
          'Bus Structures',
          'Control Unit',
          'Register Organization',
          'Instruction Formats'
        ]
      },
      {
        title: 'Arithmetic and Logic Unit',
        topics: [
          'Integer Arithmetic',
          'Floating Point Arithmetic',
          'Arithmetic Circuits',
          'Logic Operations',
          'ALU Design'
        ]
      },
      {
        title: 'Memory Organization',
        topics: [
          'Cache Memory',
          'Virtual Memory',
          'Memory Hierarchy',
          'Associative Memory',
          'Memory Mapping'
        ]
      },
      {
        title: 'Input Output Organization',
        topics: [
          'Programmed I/O',
          'Interrupt Driven I/O',
          'Direct Memory Access',
          'I/O Interfaces',
          'I/O Addressing'
        ]
      },
      {
        title: 'Pipelining and Parallelism',
        topics: [
          'Instruction Pipelining',
          'Pipeline Hazards',
          'Superscalar Architecture',
          'Vector Processing',
          'Multiprocessor Systems'
        ]
      }
    ]
  },
  {
    name: 'Theory of Computation',
    color: '#EC4899',
    chapters: [
      {
        title: 'Finite Automata',
        topics: [
          'Deterministic Finite Automata',
          'Non-deterministic Finite Automata',
          'Regular Languages',
          'Regular Expressions',
          'DFA Minimization'
        ]
      },
      {
        title: 'Context Free Grammars',
        topics: [
          'Grammar Rules',
          'Derivations and Parse Trees',
          'Ambiguous Grammars',
          'Chomsky Normal Form',
          'Greibach Normal Form'
        ]
      },
      {
        title: 'Pushdown Automata',
        topics: [
          'Definition of PDA',
          'Acceptance by Final State',
          'Acceptance by Empty Stack',
          'Design of PDA',
          'Equivalence with CFG'
        ]
      },
      {
        title: 'Turing Machines',
        topics: [
          'Basic Turing Machine Model',
          'Multi-tape Turing Machines',
          'Universal Turing Machine',
          'Turing Machine Design',
          'Church-Turing Thesis'
        ]
      },
      {
        title: 'Computability and Complexity',
        topics: [
          'Decidable Languages',
          'Undecidable Problems',
          'Reduction Techniques',
          'P vs NP',
          'NP-Complete Problems'
        ]
      }
    ]
  },
  {
    name: 'Compiler Design',
    color: '#F97316',
    chapters: [
      {
        title: 'Lexical Analysis',
        topics: [
          'Token and Lexeme',
          'Regular Expressions',
          'Finite Automata for Token Recognition',
          'Lexical Errors',
          'Symbol Table Basics'
        ]
      },
      {
        title: 'Syntax Analysis',
        topics: [
          'Context Free Grammars',
          'Parse Trees',
          'Top Down Parsing',
          'Bottom Up Parsing',
          'LR Parsing'
        ]
      },
      {
        title: 'Semantic Analysis',
        topics: [
          'Syntax Directed Translation',
          'Type Checking',
          'Scope and Binding',
          'Attribute Grammars',
          'Semantic Errors'
        ]
      },
      {
        title: 'Intermediate Code Generation',
        topics: [
          'Three Address Code',
          'Syntax Trees',
          'Directed Acyclic Graph',
          'Intermediate Representation',
          'Control Flow Graph'
        ]
      },
      {
        title: 'Code Optimization and Generation',
        topics: [
          'Loop Optimization',
          'Dead Code Elimination',
          'Register Allocation',
          'Instruction Selection',
          'Target Code Generation'
        ]
      }
    ]
  },
  {
    name: 'Operating System',
    color: '#34D399',
    chapters: [
      {
        title: 'Process Management',
        topics: [
          'Process States',
          'Process Control Block',
          'Context Switching',
          'Interprocess Communication',
          'Threads'
        ]
      },
      {
        title: 'CPU Scheduling',
        topics: [
          'First Come First Serve',
          'Shortest Job First',
          'Priority Scheduling',
          'Round Robin',
          'Multilevel Queue Scheduling'
        ]
      },
      {
        title: 'Memory Management',
        topics: [
          'Paging',
          'Segmentation',
          'Virtual Memory',
          'Page Replacement Algorithms',
          'Thrashing'
        ]
      },
      {
        title: 'Deadlocks',
        topics: [
          'Deadlock Conditions',
          'Deadlock Prevention',
          'Deadlock Avoidance',
          'Banker\'s Algorithm',
          'Deadlock Detection and Recovery'
        ]
      },
      {
        title: 'File Systems',
        topics: [
          'File Allocation Methods',
          'Directory Structures',
          'File Access Methods',
          'Disk Scheduling',
          'File Protection'
        ]
      }
    ]
  },
  {
    name: 'Databases',
    color: '#3B82F6',
    chapters: [
      {
        title: 'Database Fundamentals',
        topics: [
          'Database Architecture',
          'Data Models',
          'Three Schema Architecture',
          'Database Languages',
          'Data Independence'
        ]
      },
      {
        title: 'Relational Model',
        topics: [
          'Relations and Tuples',
          'Keys and Constraints',
          'Relational Algebra',
          'Relational Calculus',
          'Views'
        ]
      },
      {
        title: 'SQL',
        topics: [
          'DDL Commands',
          'DML Commands',
          'Joins',
          'Aggregate Functions',
          'Subqueries'
        ]
      },
      {
        title: 'Normalization',
        topics: [
          'Functional Dependencies',
          'First Normal Form',
          'Second Normal Form',
          'Third Normal Form',
          'Boyce-Codd Normal Form'
        ]
      },
      {
        title: 'Transaction Management',
        topics: [
          'ACID Properties',
          'Concurrency Control',
          'Locking Protocols',
          'Serializability',
          'Recovery Techniques'
        ]
      }
    ]
  },
  {
    name: 'Computer Networks',
    color: '#06B6D4',
    chapters: [
      {
        title: 'Network Fundamentals',
        topics: [
          'Network Types',
          'OSI Model',
          'TCP/IP Model',
          'Network Topologies',
          'Transmission Media'
        ]
      },
      {
        title: 'Data Link Layer',
        topics: [
          'Error Detection',
          'Error Correction',
          'Flow Control',
          'Sliding Window Protocol',
          'MAC Protocols'
        ]
      },
      {
        title: 'Network Layer',
        topics: [
          'IP Addressing',
          'Subnetting',
          'Routing Algorithms',
          'IPv4 and IPv6',
          'ICMP'
        ]
      },
      {
        title: 'Transport Layer',
        topics: [
          'TCP Protocol',
          'UDP Protocol',
          'Congestion Control',
          'Flow Control',
          'Connection Management'
        ]
      },
      {
        title: 'Application Layer',
        topics: [
          'HTTP',
          'FTP',
          'DNS',
          'SMTP',
          'Network Security Basics'
        ]
      }
    ]
  },
  {
    name: 'General Aptitude',
    color: '#FACC15',
    chapters: [
      {
        title: 'Quantitative Aptitude',
        topics: [
          'Percentage',
          'Ratio and Proportion',
          'Time and Work',
          'Profit and Loss',
          'Simple and Compound Interest'
        ]
      },
      {
        title: 'Logical Reasoning',
        topics: [
          'Series Completion',
          'Coding Decoding',
          'Blood Relations',
          'Direction Sense',
          'Syllogisms'
        ]
      },
      {
        title: 'Verbal Ability',
        topics: [
          'Reading Comprehension',
          'Sentence Correction',
          'Synonyms and Antonyms',
          'Para Jumbles',
          'Fill in the Blanks'
        ]
      },
      {
        title: 'Data Interpretation',
        topics: [
          'Bar Graph Analysis',
          'Pie Chart Analysis',
          'Line Graph Analysis',
          'Table Data Analysis',
          'Caselet Interpretation'
        ]
      },
      {
        title: 'Analytical Ability',
        topics: [
          'Puzzles',
          'Seating Arrangement',
          'Logical Deductions',
          'Critical Reasoning',
          'Statement and Assumptions'
        ]
      }
    ]
  }
];

const toChaptersPayload = (chapters) => {
  return chapters.map((chapter) => ({
    title: chapter.title,
    topics: chapter.topics.map((title) => ({
      title,
      completed: false,
      timeSpent: 0,
      durationSpent: 0
    }))
  }));
};

const seedSyllabus = async () => {
  try {
    await connectDB();

    const email = process.env.SEED_EMAIL || 'test@example.com';
    const user = await User.findOne({ email });
    if (!user) {
      console.error('No user found for', email);
      process.exit(1);
    }

    for (const subjectData of syllabus) {
      const existing = await Subject.findOne({
        userId: user._id,
        name: subjectData.name,
        isActive: true
      });

      if (existing) {
        existing.color = subjectData.color;
        existing.chapters = toChaptersPayload(subjectData.chapters);
        await existing.save();
      } else {
        await Subject.create({
          userId: user._id,
          name: subjectData.name,
          color: subjectData.color,
          chapters: toChaptersPayload(subjectData.chapters)
        });
      }
    }

    console.log('Syllabus subjects, chapters, and topics inserted for', email);
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedSyllabus();
