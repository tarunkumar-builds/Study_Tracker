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
          'Systems of linear equations (Gaussian elimination)',
          'Eigenvalues and Eigenvectors',
          'Rank of matrix',
          'LU decomposition',
          'Vector spaces and linear independence'
        ]
      },
      {
        title: 'Calculus',
        topics: [
          'Limits and continuity',
          'Differentiation and applications',
          'Maxima and minima',
          'Partial derivatives',
          'Multiple integrals'
        ]
      },
      {
        title: 'Probability',
        topics: [
          'Conditional probability',
          'Bayes theorem',
          'Random variables',
          'Probability distributions',
          'Expectation and variance'
        ]
      },
      {
        title: 'Discrete Mathematics',
        topics: [
          'Propositional logic',
          'Set theory',
          'Relations and functions',
          'Graph theory basics',
          'Recurrence relations'
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
          'Boolean laws and identities',
          'De Morgan’s theorem',
          'Canonical forms (SOP/POS)',
          'Logic simplification',
          'Boolean functions'
        ]
      },
      {
        title: 'Combinational Circuits',
        topics: [
          'Adders and subtractors',
          'Multiplexers and demultiplexers',
          'Encoders and decoders',
          'Code converters',
          'Comparators'
        ]
      },
      {
        title: 'Sequential Circuits',
        topics: [
          'Flip flops (SR, JK, D, T)',
          'Registers',
          'Counters',
          'State machines',
          'Timing diagrams'
        ]
      },
      {
        title: 'Number Systems',
        topics: [
          'Binary arithmetic',
          'Signed number representation',
          'Floating point representation',
          'Gray code',
          'BCD code'
        ]
      }
    ]
  },
  {
    name: 'Computer Organization and Architecture (COA)',
    color: '#60A5FA',
    chapters: [
      {
        title: 'Instruction Set Architecture',
        topics: [
          'Instruction formats',
          'Addressing modes',
          'Instruction cycle',
          'RISC vs CISC',
          'Instruction pipelining basics'
        ]
      },
      {
        title: 'CPU Organization',
        topics: [
          'ALU design',
          'Control unit (hardwired vs microprogrammed)',
          'Register organization',
          'Data path design',
          'Microoperations'
        ]
      },
      {
        title: 'Memory Organization',
        topics: [
          'Cache memory',
          'Virtual memory',
          'Memory hierarchy',
          'Associative memory',
          'Paging and segmentation'
        ]
      },
      {
        title: 'I/O Organization',
        topics: [
          'Interrupts',
          'DMA',
          'Programmed I/O',
          'I/O addressing',
          'Bus architecture'
        ]
      }
    ]
  },
  {
    name: 'Algorithms',
    color: '#8B5CF6',
    chapters: [
      {
        title: 'Algorithm Analysis',
        topics: [
          'Time complexity',
          'Space complexity',
          'Big-O, Big-Theta, Big-Omega',
          'Recurrence relations',
          'Master theorem'
        ]
      },
      {
        title: 'Divide and Conquer',
        topics: [
          'Merge sort',
          'Quick sort',
          'Binary search',
          'Strassen matrix multiplication',
          'Closest pair problem'
        ]
      },
      {
        title: 'Greedy Algorithms',
        topics: [
          'Activity selection',
          'Huffman coding',
          'Kruskal algorithm',
          'Prim algorithm',
          'Job sequencing'
        ]
      },
      {
        title: 'Dynamic Programming',
        topics: [
          'Knapsack problem',
          'Longest common subsequence',
          'Matrix chain multiplication',
          'Optimal BST',
          'Coin change'
        ]
      },
      {
        title: 'Graph Algorithms',
        topics: [
          'BFS and DFS',
          'Shortest path (Dijkstra)',
          'Bellman Ford',
          'Topological sorting',
          'Floyd Warshall'
        ]
      }
    ]
  },
  {
    name: 'Theory of Computation',
    color: '#EC4899',
    chapters: [
      {
        title: 'Regular Languages',
        topics: [
          'Finite automata',
          'NFA vs DFA',
          'Regular expressions',
          'Conversion (RE → NFA → DFA)',
          'Pumping lemma'
        ]
      },
      {
        title: 'Context Free Languages',
        topics: [
          'Context free grammars',
          'Pushdown automata',
          'Parse trees',
          'Ambiguous grammars',
          'CNF and GNF'
        ]
      },
      {
        title: 'Turing Machines',
        topics: [
          'Basic TM model',
          'Multi-tape Turing machine',
          'Universal TM',
          'TM as language recognizer',
          'Church Turing thesis'
        ]
      },
      {
        title: 'Computability',
        topics: [
          'Decidable problems',
          'Undecidable problems',
          'Halting problem',
          'Reducibility',
          'Recursive vs recursively enumerable languages'
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
          'Tokens and lexemes',
          'Finite automata in lexical analysis',
          'Regular expressions',
          'Symbol table',
          'Lex tools'
        ]
      },
      {
        title: 'Syntax Analysis',
        topics: [
          'Context free grammar',
          'LL parsing',
          'LR parsing',
          'Parse trees',
          'Ambiguity'
        ]
      },
      {
        title: 'Semantic Analysis',
        topics: [
          'Syntax directed translation',
          'Type checking',
          'Attribute grammars',
          'Intermediate code generation',
          'Error handling'
        ]
      },
      {
        title: 'Code Optimization',
        topics: [
          'Peephole optimization',
          'Loop optimization',
          'Dead code elimination',
          'Constant folding',
          'Register allocation'
        ]
      }
    ]
  },
  {
    name: 'Operating Systems',
    color: '#34D399',
    chapters: [
      {
        title: 'Process Management',
        topics: [
          'Process vs thread',
          'Process scheduling',
          'Context switching',
          'Scheduling algorithms',
          'Interprocess communication'
        ]
      },
      {
        title: 'Deadlocks',
        topics: [
          'Deadlock conditions',
          'Deadlock prevention',
          'Deadlock avoidance',
          'Banker’s algorithm',
          'Deadlock detection'
        ]
      },
      {
        title: 'Memory Management',
        topics: [
          'Paging',
          'Segmentation',
          'Page replacement algorithms',
          'Thrashing',
          'Virtual memory'
        ]
      },
      {
        title: 'File Systems',
        topics: [
          'File allocation methods',
          'Directory structures',
          'Disk scheduling',
          'File protection',
          'Journaling'
        ]
      }
    ]
  },
  {
    name: 'Databases',
    color: '#3B82F6',
    chapters: [
      {
        title: 'Relational Model',
        topics: [
          'Keys',
          'Relational algebra',
          'Relational calculus',
          'Integrity constraints',
          'Schema design'
        ]
      },
      {
        title: 'SQL',
        topics: [
          'Joins',
          'Nested queries',
          'Aggregation',
          'Views',
          'Transactions'
        ]
      },
      {
        title: 'Normalization',
        topics: [
          'Functional dependencies',
          '1NF, 2NF, 3NF',
          'BCNF',
          'Lossless decomposition',
          'Dependency preservation'
        ]
      },
      {
        title: 'Transactions',
        topics: [
          'ACID properties',
          'Concurrency control',
          'Serializability',
          'Locking protocols',
          'Deadlocks'
        ]
      }
    ]
  },
  {
    name: 'Computer Networks',
    color: '#06B6D4',
    chapters: [
      {
        title: 'Network Layers',
        topics: [
          'OSI model',
          'TCP/IP model',
          'Encapsulation',
          'Protocol layering',
          'Services'
        ]
      },
      {
        title: 'Data Link Layer',
        topics: [
          'Error detection (CRC)',
          'Flow control',
          'ARQ protocols',
          'Framing',
          'MAC protocols'
        ]
      },
      {
        title: 'Network Layer',
        topics: [
          'IP addressing',
          'Subnetting',
          'Routing algorithms',
          'Distance vector routing',
          'Link state routing'
        ]
      },
      {
        title: 'Transport Layer',
        topics: [
          'TCP vs UDP',
          'Congestion control',
          'Flow control',
          'Sliding window protocol',
          'Reliable data transfer'
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
          'Percentages',
          'Profit and loss',
          'Time and work',
          'Time speed distance',
          'Ratio and proportion'
        ]
      },
      {
        title: 'Logical Reasoning',
        topics: [
          'Puzzles',
          'Coding decoding',
          'Blood relations',
          'Series completion',
          'Syllogisms'
        ]
      },
      {
        title: 'Verbal Ability',
        topics: [
          'Reading comprehension',
          'Vocabulary',
          'Sentence correction',
          'Para jumbles',
          'Grammar'
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

    console.log('✅ Syllabus subjects, chapters, and topics inserted for', email);
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedSyllabus();
