import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronDown, ChevronRight, Plus, CheckCircle2, Circle } from 'lucide-react';
import toast from 'react-hot-toast';
import subjectService from '../services/subjectService';
import ProgressRing from '../components/ProgressRing';

const SubjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState({});
  const [chapterTitle, setChapterTitle] = useState('');
  const [topicDrafts, setTopicDrafts] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const fetchSubject = async () => {
    setLoading(true);
    try {
      const response = await subjectService.getById(id);
      setSubject(response.data);
    } catch {
      toast.error('Failed to load subject');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubject();
  }, [id]);

  const totals = useMemo(() => {
    if (!subject) return { totalTopics: 0, completedTopics: 0 };
    const totalTopics = (subject.chapters || []).reduce((sum, chapter) => sum + (chapter.topics?.length || 0), 0);
    const completedTopics = (subject.chapters || []).reduce((sum, chapter) => {
      return sum + (chapter.topics || []).filter((topic) => topic.completed).length;
    }, 0);
    return { totalTopics, completedTopics };
  }, [subject]);

  const toggleChapter = (chapterId) => {
    setExpandedChapters((prev) => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  const handleAddChapter = async (event) => {
    event.preventDefault();
    if (!chapterTitle.trim()) return;
    try {
      const response = await subjectService.addChapter(id, { title: chapterTitle.trim() });
      setSubject(response.data);
      setChapterTitle('');
      toast.success('Chapter added');
    } catch {
      toast.error('Failed to add chapter');
    }
  };

  const handleAddTopic = async (chapterId) => {
    const title = topicDrafts[chapterId]?.trim();
    if (!title) return;
    try {
      const response = await subjectService.addTopic(id, chapterId, { title });
      setSubject(response.data);
      setTopicDrafts((prev) => ({ ...prev, [chapterId]: '' }));
      setExpandedChapters((prev) => ({ ...prev, [chapterId]: true }));
      toast.success('Topic added');
    } catch {
      toast.error('Failed to add topic');
    }
  };

  const handleToggleTopic = async (chapterId, topicId) => {
    try {
      const response = await subjectService.toggleTopic(id, chapterId, topicId);
      setSubject(response.data);
    } catch {
      toast.error('Failed to toggle topic');
    }
  };

  const handleDeleteSubject = async () => {
    if (!deletePassword.trim()) {
      toast.error('Password is required');
      return;
    }

    setDeleting(true);
    try {
      await subjectService.delete(id, deletePassword.trim());
      toast.success('Subject deleted');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete subject');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setDeletePassword('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-400">Subject not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="card flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">{subject.name}</h1>
          <p className="text-gray-400 mt-1">
            {totals.completedTopics}/{totals.totalTopics || 0} topics completed
          </p>
        </div>
        <div className="flex items-center gap-6">
          <ProgressRing
            percentage={subject.completionPercentage || 0}
            size={96}
            strokeWidth={8}
            color={subject.color || '#3B82F6'}
          />
          <div>
            <p className="text-sm text-gray-400">Study Time</p>
            <p className="text-2xl text-white font-bold">{subject.totalTimeSpent || 0}m</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleAddChapter} className="card flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={chapterTitle}
          onChange={(event) => setChapterTitle(event.target.value)}
          className="input flex-1"
          placeholder="Add a new chapter"
        />
        <button type="submit" className="btn-primary flex items-center justify-center gap-2">
          <Plus size={16} />
          Add Chapter
        </button>
      </form>

      <div className="space-y-3">
        {(subject.chapters || []).map((chapter) => {
          const chapterId = chapter._id;
          const open = !!expandedChapters[chapterId];
          const chapterTopics = chapter.topics || [];
          const chapterCompleted = chapterTopics.filter((topic) => topic.completed).length;

          return (
            <div key={chapterId} className="card">
              <button
                onClick={() => toggleChapter(chapterId)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  {open ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
                  <div>
                    <h2 className="text-white font-semibold">{chapter.title || chapter.name}</h2>
                    <p className="text-xs text-gray-500">{chapterCompleted}/{chapterTopics.length} complete</p>
                  </div>
                </div>
                <div className="w-32">
                  <progress
                    className="w-full h-2 rounded-lg overflow-hidden [&::-webkit-progress-bar]:bg-dark-hover [&::-webkit-progress-value]:bg-primary-500"
                    value={chapter.completionPercentage || 0}
                    max="100"
                  />
                </div>
              </button>

              {open && (
                <div className="mt-4 pl-8 space-y-2">
                  {chapterTopics.map((topic) => (
                    <button
                      key={topic._id}
                      onClick={() => handleToggleTopic(chapterId, topic._id)}
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-left hover:bg-dark-hover transition-colors flex items-center justify-between"
                    >
                      <span className={`text-sm ${topic.completed ? 'text-white' : 'text-gray-300'}`}>
                        {topic.title || topic.name}
                      </span>
                      {topic.completed ? (
                        <CheckCircle2 size={17} className="text-emerald-400" />
                      ) : (
                        <Circle size={17} className="text-gray-500" />
                      )}
                    </button>
                  ))}

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={topicDrafts[chapterId] || ''}
                      onChange={(event) => setTopicDrafts((prev) => ({ ...prev, [chapterId]: event.target.value }))}
                      className="input flex-1 py-1.5"
                      placeholder="Add topic"
                    />
                    <button onClick={() => handleAddTopic(chapterId)} className="btn-secondary">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {subject.chapters?.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-400">No chapters yet. Add your first chapter to begin.</p>
        </div>
      )}

      <div className="card border border-red-500/20 bg-red-500/5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">Danger Zone</h3>
            <p className="text-sm text-gray-400">Deleting a subject removes it from your dashboard.</p>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="btn-secondary text-red-300 border-red-500/40"
          >
            Delete Subject
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-dark-card border border-dark-border rounded-xl w-full max-w-md p-6">
            <h3 className="text-xl font-display font-bold text-white mb-2">Confirm Deletion</h3>
            <p className="text-sm text-gray-400 mb-4">
              Enter your password to delete <span className="text-white font-semibold">{subject.name}</span>.
            </p>
            <input
              type="password"
              value={deletePassword}
              onChange={(event) => setDeletePassword(event.target.value)}
              className="input w-full mb-4"
              placeholder="Password"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword('');
                }}
                className="btn-secondary flex-1"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubject}
                className="btn-primary flex-1"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectDetails;
