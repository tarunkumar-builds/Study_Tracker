import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Folder, StickyNote, Pin, PinOff, Trash2, Edit2, Tag } from 'lucide-react';
import { noteService } from '../services';
import subjectService from '../services/subjectService';
import toast from 'react-hot-toast';

const defaultNoteForm = {
  title: '',
  content: '',
  subjectId: '',
  category: 'General',
  tags: '',
  color: '#1F2937'
};

const defaultFolderForm = {
  name: '',
  color: '#3B82F6'
};

const noteColors = ['#1F2937', '#111827', '#0F172A', '#1E293B', '#334155', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
const folderColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#14B8A6', '#F97316', '#6366F1'];

const Notes = () => {
  const [subjects, setSubjects] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');
  const [search, setSearch] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [noteForm, setNoteForm] = useState(defaultNoteForm);
  const [folderForm, setFolderForm] = useState(defaultFolderForm);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [savingNote, setSavingNote] = useState(false);
  const [savingFolder, setSavingFolder] = useState(false);

  useEffect(() => {
    const loadInitial = async () => {
      try {
        const subjectsRes = await subjectService.getAll();
        setSubjects(subjectsRes.data || []);
      } catch (error) {
        toast.error('Failed to load folders');
      }
    };

    loadInitial();
  }, []);

  useEffect(() => {
    const loadNotes = async () => {
      setLoading(true);
      try {
        const subjectId = selectedSubjectId === 'all' ? null : selectedSubjectId;
        const searchQuery = search.trim() ? search.trim() : null;
        const notesRes = await noteService.getAll(subjectId, searchQuery);
        setNotes(notesRes.data || []);
      } catch (error) {
        toast.error('Failed to load notes');
      } finally {
        setLoading(false);
      }
    };

    loadNotes();
  }, [selectedSubjectId, search]);

  const notesBySubject = useMemo(() => {
    return notes.reduce((acc, note) => {
      const subjectKey = note.subjectId?._id || note.subjectId || 'unknown';
      acc[subjectKey] = (acc[subjectKey] || 0) + 1;
      return acc;
    }, {});
  }, [notes]);

  const totalNotes = notes.length;

  const handleOpenNewNote = () => {
    if (subjects.length === 0) {
      toast.error('Create a folder before adding notes');
      setShowFolderModal(true);
      return;
    }

    const firstSubjectId = selectedSubjectId === 'all' ? (subjects[0]?._id || '') : selectedSubjectId;
    setNoteForm({ ...defaultNoteForm, subjectId: firstSubjectId });
    setEditingNoteId(null);
    setShowNoteModal(true);
  };

  const handleEditNote = (note) => {
    setEditingNoteId(note._id);
    setNoteForm({
      title: note.title || '',
      content: note.content || '',
      subjectId: note.subjectId?._id || note.subjectId || '',
      category: note.category || 'General',
      tags: (note.tags || []).join(', '),
      color: note.color || '#1F2937'
    });
    setShowNoteModal(true);
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!noteForm.title.trim() || !noteForm.content.trim() || !noteForm.subjectId) {
      toast.error('Title, content, and folder are required');
      return;
    }

    setSavingNote(true);
    try {
      const payload = {
        title: noteForm.title.trim(),
        content: noteForm.content.trim(),
        subjectId: noteForm.subjectId,
        category: noteForm.category?.trim() || 'General',
        tags: noteForm.tags
          ? noteForm.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
          : [],
        color: noteForm.color
      };

      if (editingNoteId) {
        await noteService.update(editingNoteId, payload);
        toast.success('Note updated');
      } else {
        await noteService.create(payload);
        toast.success('Note created');
      }

      setShowNoteModal(false);
      setNoteForm(defaultNoteForm);
      setEditingNoteId(null);

      const subjectId = selectedSubjectId === 'all' ? null : selectedSubjectId;
      const notesRes = await noteService.getAll(subjectId, search.trim() || null);
      setNotes(notesRes.data || []);
    } catch (error) {
      toast.error('Failed to save note');
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Delete this note?')) return;

    try {
      await noteService.delete(noteId);
      toast.success('Note deleted');
      setNotes((prev) => prev.filter((note) => note._id !== noteId));
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const handleTogglePin = async (noteId) => {
    try {
      await noteService.togglePin(noteId);
      const subjectId = selectedSubjectId === 'all' ? null : selectedSubjectId;
      const notesRes = await noteService.getAll(subjectId, search.trim() || null);
      setNotes(notesRes.data || []);
    } catch (error) {
      toast.error('Failed to update pin');
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!folderForm.name.trim()) {
      toast.error('Folder name is required');
      return;
    }

    setSavingFolder(true);
    try {
      await subjectService.create({
        name: folderForm.name.trim(),
        color: folderForm.color
      });
      toast.success('Folder created');
      setFolderForm(defaultFolderForm);
      setShowFolderModal(false);
      const subjectsRes = await subjectService.getAll();
      setSubjects(subjectsRes.data || []);
    } catch (error) {
      toast.error('Failed to create folder');
    } finally {
      setSavingFolder(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-display font-bold text-white mb-2">Notes</h1>
          <p className="text-gray-400">Organize your study notes into folders and keep ideas handy.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => setShowFolderModal(true)} className="btn-secondary flex items-center gap-2">
            <Folder size={18} />
            New Folder
          </button>
          <button
            onClick={handleOpenNewNote}
            className="btn-primary flex items-center gap-2"
            disabled={subjects.length === 0}
          >
            <Plus size={18} />
            New Note
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Folders</h2>
              <span className="text-xs text-gray-500">{subjects.length} total</span>
            </div>
            <div className="space-y-2 max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
              <button
                onClick={() => setSelectedSubjectId('all')}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-all ${
                  selectedSubjectId === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-400 hover:bg-dark-hover hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <StickyNote size={16} />
                  All Notes
                </span>
                <span className="text-xs">{totalNotes}</span>
              </button>

              {subjects.map((subject) => (
                <button
                  key={subject._id}
                  onClick={() => setSelectedSubjectId(subject._id)}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-all ${
                    selectedSubjectId === subject._id
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-400 hover:bg-dark-hover hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: subject.color }}
                    />
                    <span className="truncate">{subject.name}</span>
                  </span>
                  <span className="text-xs">{notesBySubject[subject._id] || 0}</span>
                </button>
              ))}

              {subjects.length === 0 && (
                <div className="text-center text-gray-500 text-sm py-6">
                  Create your first folder to start.
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="text-sm font-semibold text-white mb-2">Quick Tips</h3>
            <ul className="text-xs text-gray-400 space-y-2">
              <li>Use folders to separate subjects or courses.</li>
              <li>Pin important notes for faster access.</li>
              <li>Add tags to group related ideas.</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-2.5 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes by title or content"
                className="input w-full pl-10"
              />
            </div>
            <div className="text-xs text-gray-500">
              {loading ? 'Loading...' : `${notes.length} notes`}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="card space-y-3">
                  <div className="skeleton h-5 w-2/3" />
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-4 w-5/6" />
                </div>
              ))}
            </div>
          ) : notes.length === 0 ? (
            <div className="card text-center py-12">
              <StickyNote className="mx-auto text-gray-600 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-white mb-2">No notes yet</h3>
              <p className="text-gray-400 mb-6">
                {subjects.length === 0
                  ? 'Create a folder first, then add your notes.'
                  : 'Start by creating your first note.'}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button onClick={() => setShowFolderModal(true)} className="btn-secondary">
                  New Folder
                </button>
                <button onClick={handleOpenNewNote} className="btn-primary" disabled={subjects.length === 0}>
                  New Note
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notes.map((note) => (
                <div key={note._id} className="card-hover flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-white truncate">{note.title}</h3>
                      <p className="text-xs text-gray-500">
                        {note.subjectId?.name || 'Folder'} • {formatDate(note.updatedAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleTogglePin(note._id)}
                      className="text-gray-400 hover:text-white"
                      title={note.isPinned ? 'Unpin' : 'Pin'}
                    >
                      {note.isPinned ? <Pin size={18} /> : <PinOff size={18} />}
                    </button>
                  </div>

                  <p className="text-sm text-gray-300 line-clamp-3">{note.content}</p>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                    {note.category && (
                      <span className="px-2 py-1 rounded-full bg-dark-hover text-gray-300">
                        {note.category}
                      </span>
                    )}
                    {note.tags?.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Tag size={12} />
                        {note.tags.slice(0, 3).join(', ')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-dark-border">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: note.color }} />
                      {note.subjectId?.name || 'Folder'}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEditNote(note)}
                        className="text-gray-400 hover:text-white"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note._id)}
                        className="text-gray-400 hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card rounded-xl max-w-2xl w-full p-6 animate-slide-up">
            <h2 className="text-2xl font-display font-bold text-white mb-6">
              {editingNoteId ? 'Edit Note' : 'Create Note'}
            </h2>
            <form onSubmit={handleSaveNote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  className="input w-full"
                  placeholder="Note title"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Folder</label>
                  <select
                    value={noteForm.subjectId}
                    onChange={(e) => setNoteForm({ ...noteForm, subjectId: e.target.value })}
                    className="input w-full"
                  >
                    <option value="" disabled>Select a folder</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <input
                    type="text"
                    value={noteForm.category}
                    onChange={(e) => setNoteForm({ ...noteForm, category: e.target.value })}
                    className="input w-full"
                    placeholder="General"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                <input
                  type="text"
                  value={noteForm.tags}
                  onChange={(e) => setNoteForm({ ...noteForm, tags: e.target.value })}
                  className="input w-full"
                  placeholder="comma, separated, tags"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
                <textarea
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  className="input w-full min-h-[160px]"
                  placeholder="Write your note..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Card Color</label>
                <div className="flex flex-wrap gap-2">
                  {noteColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNoteForm({ ...noteForm, color })}
                      className={`w-9 h-9 rounded-lg transition-all ${
                        noteForm.color === color
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-card scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowNoteModal(false);
                    setNoteForm(defaultNoteForm);
                    setEditingNoteId(null);
                  }}
                  className="btn-secondary flex-1"
                  disabled={savingNote}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1" disabled={savingNote}>
                  {savingNote ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFolderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card rounded-xl max-w-md w-full p-6 animate-slide-up">
            <h2 className="text-2xl font-display font-bold text-white mb-6">Create Folder</h2>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Folder Name</label>
                <input
                  type="text"
                  value={folderForm.name}
                  onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })}
                  className="input w-full"
                  placeholder="e.g., Operating Systems"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {folderColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFolderForm({ ...folderForm, color })}
                      className={`w-9 h-9 rounded-lg transition-all ${
                        folderForm.color === color
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-card scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowFolderModal(false);
                    setFolderForm(defaultFolderForm);
                  }}
                  className="btn-secondary flex-1"
                  disabled={savingFolder}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1" disabled={savingFolder}>
                  {savingFolder ? 'Creating...' : 'Create Folder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
