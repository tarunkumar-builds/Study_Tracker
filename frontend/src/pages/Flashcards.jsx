import { useEffect, useMemo, useState } from 'react';
import { Plus, RotateCcw, Trash2, Pencil, Clock3, Layers3 } from 'lucide-react';
import toast from 'react-hot-toast';
import ProgressRing from '../components/ProgressRing';
import { flashcardService } from '../services';
import { useStudy } from '../context/StudyContext';

const defaultForm = {
  subjectId: '',
  question: '',
  answer: ''
};

const reviewActions = [
  {
    rating: 'again',
    label: 'Again',
    caption: 'Repeat soon',
    className: 'bg-red-600/20 text-red-300 border border-red-500/30 hover:bg-red-600/30'
  },
  {
    rating: 'good',
    label: 'Good',
    caption: 'Schedule normally',
    className: 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30'
  },
  {
    rating: 'easy',
    label: 'Easy',
    caption: 'Push farther out',
    className: 'bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30'
  }
];

const formatRelativeReview = (value) => {
  if (!value) return 'Not scheduled yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not scheduled yet';

  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes <= 0) return 'Due now';
  if (diffMinutes < 60) return `In ${diffMinutes}m`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `In ${diffHours}h`;

  const diffDays = Math.round(diffHours / 24);
  return `In ${diffDays}d`;
};

const Flashcards = () => {
  const { subjects, refreshSubjects } = useStudy();
  const [cards, setCards] = useState([]);
  const [dueCards, setDueCards] = useState([]);
  const [stats, setStats] = useState({ totalCards: 0, dueCards: 0, accuracy: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const loadData = async () => {
    setLoading(true);
    try {
      await refreshSubjects();
      const subjectId = selectedSubjectId === 'all' ? null : selectedSubjectId;
      const [allRes, dueRes, statsRes] = await Promise.all([
        flashcardService.getAll(subjectId),
        flashcardService.getDue(subjectId),
        flashcardService.getStats(subjectId)
      ]);
      setCards(allRes.data || []);
      setDueCards(dueRes.data || []);
      setStats(statsRes.data || { totalCards: 0, dueCards: 0, accuracy: 0 });
      setCurrentIndex(0);
      setFlipped(false);
    } catch {
      toast.error('Failed to load flashcards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedSubjectId]);

  const studyDeck = useMemo(() => dueCards, [dueCards]);
  const currentCard = studyDeck[currentIndex] || null;
  const hasDueCards = dueCards.length > 0;
  const hasAnyCards = cards.length > 0;

  const openCreateModal = () => {
    if (!subjects.length) {
      toast.error('Create a subject first');
      return;
    }
    setEditingId(null);
    setForm({ ...defaultForm, subjectId: selectedSubjectId === 'all' ? subjects[0]._id : selectedSubjectId });
    setShowForm(true);
  };

  const openEditModal = (card) => {
    setEditingId(card._id);
    setForm({
      subjectId: card.subjectId?._id || card.subjectId || '',
      question: card.question,
      answer: card.answer
    });
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.subjectId || !form.question.trim() || !form.answer.trim()) {
      toast.error('Subject, question, and answer are required');
      return;
    }

    try {
      if (editingId) {
        await flashcardService.update(editingId, {
          question: form.question.trim(),
          answer: form.answer.trim()
        });
        toast.success('Card updated');
      } else {
        await flashcardService.create({
          subjectId: form.subjectId,
          question: form.question.trim(),
          answer: form.answer.trim()
        });
        toast.success('Card created');
      }
      setShowForm(false);
      setForm(defaultForm);
      setEditingId(null);
      loadData();
    } catch {
      toast.error('Failed to save flashcard');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this flashcard?')) return;
    try {
      await flashcardService.delete(id);
      toast.success('Flashcard deleted');
      loadData();
    } catch {
      toast.error('Failed to delete flashcard');
    }
  };

  const handleReview = async (rating) => {
    if (!currentCard) return;
    try {
      await flashcardService.review(currentCard._id, undefined, rating);
      toast.success(`Recorded: ${rating}`);
      await loadData();
    } catch {
      toast.error('Failed to record review');
    }
  };

  const handleNextCard = () => {
    if (!studyDeck.length) return;
    const next = currentIndex + 1;
    setCurrentIndex(next < studyDeck.length ? next : 0);
    setFlipped(false);
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Flashcards</h1>
          <p className="text-gray-400 mt-1">Spaced repetition with SM-2 review intervals.</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
          <Plus size={17} />
          New Card
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-400">Due Today</p>
          <p className="text-3xl text-white font-bold">{stats.dueCards || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-400">Total Cards</p>
          <p className="text-3xl text-white font-bold">{stats.totalCards || 0}</p>
        </div>
        <div className="card flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Accuracy</p>
            <p className="text-3xl text-white font-bold">{stats.accuracy || 0}%</p>
          </div>
          <ProgressRing percentage={stats.accuracy || 0} size={74} strokeWidth={7} color="#10B981" />
        </div>
      </div>

      <div className="card flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <select
          value={selectedSubjectId}
          onChange={(event) => setSelectedSubjectId(event.target.value)}
          className="input"
        >
          <option value="all">All Subjects</option>
          {subjects.map((subject) => (
            <option key={subject._id} value={subject._id}>{subject.name}</option>
          ))}
        </select>
        <p className="text-sm text-gray-400">
          {hasDueCards
            ? `Reviewing ${studyDeck.length} due ${studyDeck.length === 1 ? 'card' : 'cards'}`
            : `${cards.length} total ${cards.length === 1 ? 'card' : 'cards'} in your deck`}
        </p>
      </div>

      {loading ? (
        <div className="card text-center py-20 text-gray-400">Loading flashcards...</div>
      ) : !hasAnyCards ? (
        <div className="card text-center py-20">
          <p className="text-white text-lg font-semibold mb-2">No cards to review</p>
          <p className="text-gray-400 mb-4">Create flashcards to start spaced repetition.</p>
          <button onClick={openCreateModal} className="btn-primary">Create Flashcard</button>
        </div>
      ) : !currentCard ? (
        <div className="card text-center py-20">
          <p className="text-white text-lg font-semibold mb-2">No cards due right now</p>
          <p className="text-gray-400 mb-6">
            Your due queue is clear. Create more cards or come back when the next review is scheduled.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-300">
            <div className="rounded-xl border border-dark-border bg-dark-bg px-4 py-3 min-w-[150px]">
              <p className="text-gray-500 text-xs mb-1">Deck Size</p>
              <p className="text-xl font-semibold text-white">{cards.length}</p>
            </div>
            <div className="rounded-xl border border-dark-border bg-dark-bg px-4 py-3 min-w-[150px]">
              <p className="text-gray-500 text-xs mb-1">Due Today</p>
              <p className="text-xl font-semibold text-white">{stats.dueCards || 0}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-400">Card {currentIndex + 1}/{studyDeck.length}</p>
            <div className="flex gap-2">
              <button onClick={() => openEditModal(currentCard)} className="btn-secondary p-2">
                <Pencil size={15} />
              </button>
              <button onClick={() => handleDelete(currentCard._id)} className="btn-secondary p-2">
                <Trash2 size={15} />
              </button>
              <button onClick={() => setFlipped(false)} className="btn-secondary p-2">
                <RotateCcw size={15} />
              </button>
            </div>
          </div>

          <button
            onClick={() => setFlipped((prev) => !prev)}
            className="w-full min-h-[230px] perspective-1000"
          >
            <div className={`relative min-h-[230px] transition-transform duration-500 preserve-3d ${flipped ? 'rotate-y-180' : ''}`}>
              <div className="absolute inset-0 rounded-xl bg-dark-bg border border-dark-border p-6 backface-hidden flex flex-col justify-center">
                <p className="text-xs text-gray-500 mb-3">Question</p>
                <p className="text-xl text-white font-semibold">{currentCard.question}</p>
                <p className="text-xs text-gray-500 mt-4">Tap to flip</p>
              </div>
              <div className="absolute inset-0 rounded-xl bg-dark-bg border border-dark-border p-6 backface-hidden rotate-y-180 flex flex-col justify-center">
                <p className="text-xs text-gray-500 mb-3">Answer</p>
                <p className="text-lg text-gray-200">{currentCard.answer}</p>
                <p className="text-xs text-gray-500 mt-4">Tap to flip back</p>
              </div>
            </div>
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
            {reviewActions.map((action) => (
              <button
                key={action.rating}
                onClick={() => handleReview(action.rating)}
                className={`rounded-lg px-4 py-3 transition-colors ${action.className}`}
              >
                <span className="block font-semibold">{action.label}</span>
                <span className="block text-xs opacity-80 mt-1">{action.caption}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            <div className="rounded-xl border border-dark-border bg-dark-bg px-4 py-3">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-2">
                <Clock3 size={13} />
                Next Review
              </p>
              <p className="text-sm font-semibold text-white">{formatRelativeReview(currentCard.nextReviewDate)}</p>
            </div>
            <div className="rounded-xl border border-dark-border bg-dark-bg px-4 py-3">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-2">
                <Layers3 size={13} />
                Interval
              </p>
              <p className="text-sm font-semibold text-white">
                {currentCard.interval || 0} {(currentCard.interval || 0) === 1 ? 'day' : 'days'}
              </p>
            </div>
            <div className="rounded-xl border border-dark-border bg-dark-bg px-4 py-3">
              <p className="text-xs text-gray-500 mb-1">Repetitions</p>
              <p className="text-sm font-semibold text-white">{currentCard.repetitions || 0}</p>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button onClick={handleNextCard} className="btn-secondary text-sm">
              Skip Card
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-dark-card border border-dark-border rounded-xl p-6">
            <h3 className="text-2xl font-display font-bold text-white mb-4">
              {editingId ? 'Edit Flashcard' : 'Create Flashcard'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <select
                value={form.subjectId}
                onChange={(event) => setForm((prev) => ({ ...prev, subjectId: event.target.value }))}
                className="input w-full"
              >
                <option value="" disabled>Select subject</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>{subject.name}</option>
                ))}
              </select>
              <textarea
                value={form.question}
                onChange={(event) => setForm((prev) => ({ ...prev, question: event.target.value }))}
                className="input w-full min-h-[90px]"
                placeholder="Question"
              />
              <textarea
                value={form.answer}
                onChange={(event) => setForm((prev) => ({ ...prev, answer: event.target.value }))}
                className="input w-full min-h-[120px]"
                placeholder="Answer"
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Flashcards;
