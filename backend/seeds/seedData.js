import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/database.js';
import User from '../models/User.js';
import Subject from '../models/Subject.js';
import Note from '../models/Note.js';
import Flashcard from '../models/Flashcard.js';
import PomodoroSession from '../models/PomodoroSession.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany();
    await Subject.deleteMany();
    await Note.deleteMany();
    await Flashcard.deleteMany();
    await PomodoroSession.deleteMany();

    // Create test user
    console.log('Creating test user...');
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });

    console.log('Test user created:', user.email);

    // Create subjects with chapters and topics
    console.log('Creating subjects...');
    
    const mathematics = await Subject.create({
      userId: user._id,
      name: 'Mathematics',
      color: '#10B981',
      chapters: [
        {
          name: 'Chapter 1: Number Systems',
          topics: [
            { name: 'Decimal', completed: true, durationSpent: 120 },
            { name: 'Real Number', completed: false, durationSpent: 60 }
          ]
        },
        {
          name: 'Chapter 2: Polynomials',
          topics: [
            { name: 'Introduction to Polynomials', completed: true, durationSpent: 90 },
            { name: 'Polynomial Operations', completed: false, durationSpent: 0 }
          ]
        }
      ]
    });

    const science = await Subject.create({
      userId: user._id,
      name: 'Science',
      color: '#3B82F6',
      chapters: [
        {
          name: 'Physics',
          topics: [
            { name: 'Motion', completed: false, durationSpent: 45 },
            { name: 'Force', completed: false, durationSpent: 30 }
          ]
        }
      ]
    });

    const english = await Subject.create({
      userId: user._id,
      name: 'English',
      color: '#EC4899',
      chapters: [
        {
          name: 'Grammar',
          topics: [
            { name: 'Tenses', completed: true, durationSpent: 100 },
            { name: 'Parts of Speech', completed: true, durationSpent: 80 }
          ]
        }
      ]
    });

    console.log('Subjects created:', mathematics.name, science.name, english.name);

    // Create notes
    console.log('Creating notes...');
    
    await Note.create([
      {
        userId: user._id,
        subjectId: mathematics._id,
        title: 'Polynomial Basics',
        content: 'A polynomial is an expression consisting of variables and coefficients. Key concepts:\n\n1. Degree of polynomial\n2. Types: Monomial, Binomial, Trinomial\n3. Operations: Addition, Subtraction, Multiplication',
        category: 'Study Notes'
      },
      {
        userId: user._id,
        subjectId: science._id,
        title: 'Newton\'s Laws',
        content: '1st Law: Object remains at rest or in motion unless acted upon by force\n2nd Law: F = ma\n3rd Law: Every action has equal and opposite reaction',
        category: 'Important',
        isPinned: true
      }
    ]);

    console.log('Notes created');

    // Create flashcards
    console.log('Creating flashcards...');
    
    await Flashcard.create([
      {
        userId: user._id,
        subjectId: mathematics._id,
        question: 'What is the quadratic formula?',
        answer: 'x = (-b ± √(b²-4ac)) / 2a'
      },
      {
        userId: user._id,
        subjectId: science._id,
        question: 'What is the speed of light?',
        answer: '299,792,458 meters per second (approximately 3 × 10^8 m/s)'
      },
      {
        userId: user._id,
        subjectId: english._id,
        question: 'What are the 8 parts of speech?',
        answer: 'Noun, Pronoun, Verb, Adjective, Adverb, Preposition, Conjunction, Interjection'
      }
    ]);

    console.log('Flashcards created');

    // Create pomodoro sessions
    console.log('Creating pomodoro sessions...');
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    await PomodoroSession.create([
      {
        userId: user._id,
        subjectId: mathematics._id,
        duration: 25,
        type: 'focus',
        completed: true,
        date: today,
        startTime: new Date(today.getTime() - 30 * 60000),
        endTime: new Date(today.getTime() - 5 * 60000)
      },
      {
        userId: user._id,
        subjectId: science._id,
        duration: 25,
        type: 'focus',
        completed: true,
        date: yesterday,
        startTime: new Date(yesterday.getTime() - 30 * 60000),
        endTime: new Date(yesterday.getTime() - 5 * 60000)
      }
    ]);

    console.log('Pomodoro sessions created');

    console.log('\n✅ Seed data created successfully!');
    console.log('\nTest User Credentials:');
    console.log('Email: test@example.com');
    console.log('Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
