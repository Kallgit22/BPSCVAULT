// RULE: Firestore Rules must be open (Test Mode) for this to work
// allow read, write: if true;

import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, query, onSnapshot, addDoc, doc, updateDoc, deleteDoc 
} from 'firebase/firestore';
// Auth imports removed

import { 
  Search, FileText, ChevronRight, GraduationCap, X, 
  TrendingUp, Book, Database, Menu, Plus, Settings, 
  Trash2, Layers, Layout, BookOpen, UserCircle, Eye, Edit3, Save, Lock, Loader2,
  AlertCircle
} from 'lucide-react';

// --- FIREBASE SETUP ---
const firebaseConfig = {
  apiKey: "AIzaSyBVV7UqGoUZiwMe__0_x7-mZGxm5w0wBh0",
  authDomain: "pushtak-mart.firebaseapp.com",
  projectId: "pushtak-mart",
  storageBucket: "pushtak-mart.firebasestorage.app",
  messagingSenderId: "962723938970",
  appId: "1:962723938970:web:fe3612fd8d0f85a6c69523",
  measurementId: "G-Q7YYZ3YCX4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const auth = getAuth(app); // REMOVED
const db = getFirestore(app);
const appId = 'bpsc-vault-v3'; 

const NAV_SECTIONS = [
  { id: 'prelims-gs', label: 'Prelims GS', icon: Layers },
  { id: 'prelims-csat', label: 'Prelims CSAT', icon: Layout },
  { id: 'mains-hindi', label: 'General Hindi', icon: BookOpen },
  { id: 'mains-gs1', label: 'GS Paper 1', icon: FileText },
  { id: 'mains-gs2', label: 'GS Paper 2', icon: FileText },
  { id: 'mains-essay', label: 'Essay', icon: Book },
  { id: 'optional', label: 'Optional', icon: Settings },
  { id: 'interview', label: 'Interview', icon: UserCircle },
];

const App = () => {
  // Removed user state
  const [activeTab, setActiveTab] = useState('mains-gs1');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Interaction State
  const [selectedTrend, setSelectedTrend] = useState(null);
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editData, setEditData] = useState({ title: '', section: 'mains-gs1', trend: '', studyLink: '', questions: [] });

  // 1. Auth Logic REMOVED - Direct Data Access

  // 2. Data Logic
  useEffect(() => {
    // Removed user check
    setIsLoading(true);
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'topics'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTopics(data);
      setIsLoading(false);
    }, (err) => {
      console.error("Firestore read error:", err);
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []); // Run once on mount

  // Filter Logic
  const filteredTopics = useMemo(() => {
    return topics.filter(t => t.section === activeTab && 
      (t.title || "").toLowerCase().includes(searchTerm.toLowerCase()));
  }, [topics, activeTab, searchTerm]);

  // Database Actions
  const handleSaveTopic = async () => {
    // Removed user check
    try {
      const topicToSave = { ...editData };
      delete topicToSave.id;
      
      if (editData.id) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'topics', editData.id), topicToSave);
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'topics'), topicToSave);
      }
      setIsEditorOpen(false);
    } catch (e) { 
      console.error("Save error:", e);
      alert("Error saving. Check Firestore Rules (must be open/test mode).");
    }
  };

  const handleDelete = async (id) => {
    // Removed user check
    if (window.confirm("Delete this entire topic card?")) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'topics', id));
      } catch (e) { 
        console.error("Delete error:", e);
        alert("Error deleting. Check Firestore Rules.");
      }
    }
  };

  return (
    <div className={`flex h-screen ${isAdminMode ? 'bg-amber-50' : 'bg-slate-50'} font-sans text-slate-900 transition-colors duration-500 overflow-hidden`}>
      
      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* SIDEBAR (Responsive) */}
      <aside className={`fixed md:relative inset-y-0 left-0 w-72 bg-white border-r border-slate-200 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg text-white ${isAdminMode ? 'bg-amber-600' : 'bg-indigo-700'}`}>
              <GraduationCap size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-indigo-900">BPSC VAULT</h1>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Exam Readiness</p>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400"><X size={20}/></button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {NAV_SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeTab === sec.id;
            return (
              <button 
                key={sec.id}
                onClick={() => { setActiveTab(sec.id); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <Icon size={18} className={isActive ? 'text-indigo-600' : 'text-slate-400'} /> 
                {sec.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => setIsAdminMode(!isAdminMode)}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all border ${isAdminMode ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}
          >
            {isAdminMode ? <><Eye size={14}/> STUDENT VIEW</> : <><Lock size={14}/> ADMIN LOGIN</>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT Area */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <Menu size={20} />
            </button>
            <h2 className="text-sm md:text-base font-bold text-slate-700 hidden sm:block">
              {NAV_SECTIONS.find(s => s.id === activeTab)?.label}
            </h2>
          </div>

          <div className="flex items-center gap-3 w-full max-w-md justify-end">
            <div className="relative w-full max-w-xs group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search topics..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-2 border-transparent rounded-full text-sm focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all"
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {isAdminMode && (
              <button 
                onClick={() => {setEditData({ title: '', section: activeTab, trend: '', studyLink: '', questions: [] }); setIsEditorOpen(true)}}
                className="bg-indigo-600 text-white p-2.5 rounded-full hover:bg-indigo-700 transition-all flex-shrink-0 shadow-lg shadow-indigo-200 active:scale-95"
              >
                <Plus size={20} />
              </button>
            )}
          </div>
        </header>

        {/* CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 size={40} className="animate-spin text-indigo-600" />
              <p className="text-sm font-medium animate-pulse">Loading BPSC Data...</p>
            </div>
          ) : filteredTopics.length === 0 ? (
            <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400 gap-4">
              <div className="p-6 bg-slate-100 rounded-full text-slate-300">
                <AlertCircle size={48} />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold text-slate-600">No Data Found</h3>
                <p className="text-sm">There are no topics in this section yet.</p>
              </div>
              {isAdminMode ? (
                <button 
                  onClick={() => {setEditData({ title: '', section: activeTab, trend: '', studyLink: '', questions: [] }); setIsEditorOpen(true)}}
                  className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                >
                  Create First Topic
                </button>
              ) : (
                <button onClick={() => setSearchTerm('')} className="text-indigo-600 text-sm font-bold hover:underline">
                  Clear Search Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-7xl mx-auto">
              {filteredTopics.map((topic) => (
                <div key={topic.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group">
                  {/* Card Header */}
                  <div className="p-6 border-b border-slate-50 relative bg-gradient-to-br from-white to-slate-50">
                    {isAdminMode && (
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button onClick={() => {setEditData(topic); setIsEditorOpen(true)}} className="p-2 bg-white border border-slate-100 text-slate-600 rounded-lg hover:bg-blue-50 hover:text-blue-600 shadow-sm"><Edit3 size={14}/></button>
                        <button onClick={() => handleDelete(topic.id)} className="p-2 bg-white border border-slate-100 text-slate-600 rounded-lg hover:bg-rose-50 hover:text-rose-600 shadow-sm"><Trash2 size={14}/></button>
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-slate-800 mb-4 pr-20 leading-tight">{topic.title}</h3>
                    <div className="flex gap-2">
                      <button onClick={() => setSelectedTrend(topic)} className="flex-1 py-2.5 px-4 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 flex items-center justify-center gap-2 shadow-lg shadow-slate-200 transition-all active:scale-95">
                        <TrendingUp size={14} /> ANALYSIS
                      </button>
                      {topic.studyLink && (
                        <a href={topic.studyLink} target="_blank" rel="noreferrer" className="flex-1 py-2.5 px-4 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-100 flex items-center justify-center gap-2 border border-indigo-100 transition-all active:scale-95">
                          <BookOpen size={14} /> NOTES
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Questions List */}
                  <div className="p-6 bg-slate-50/50 flex-1 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Database size={12} className="text-indigo-400"/>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Question Bank</p>
                    </div>
                    {topic.questions?.map((q, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm group/item hover:border-indigo-300 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start gap-3 mb-3">
                           <p className="text-sm text-slate-700 font-medium leading-relaxed">{q.q}</p>
                           <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap border border-slate-200">{q.year}</span>
                        </div>
                        <button 
                          onClick={() => setSelectedSolution({ ...q, title: topic.title })}
                          className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline decoration-2 underline-offset-2"
                        >
                          Show Solution <ChevronRight size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- MODALS --- */}
        
        {/* EDITOR */}
        {isEditorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
              <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800">Edit Topic</h3>
                <button onClick={() => setIsEditorOpen(false)}><X size={20} className="text-slate-400 hover:text-slate-600"/></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                <input placeholder="Title" className="w-full p-3 border rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all" value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} />
                <select className="w-full p-3 border rounded-lg bg-slate-50 focus:bg-white outline-none" value={editData.section} onChange={e => setEditData({...editData, section: e.target.value})}>
                  {NAV_SECTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <textarea placeholder="Trend Analysis" rows="3" className="w-full p-3 border rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none" value={editData.trend} onChange={e => setEditData({...editData, trend: e.target.value})} />
                <input placeholder="Link to Notes" className="w-full p-3 border rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none" value={editData.studyLink} onChange={e => setEditData({...editData, studyLink: e.target.value})} />
                
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-sm">Questions</h4>
                    <button onClick={() => setEditData({...editData, questions: [...(editData.questions || []), { q: '', year: '', solution: '' }]})} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-100 transition-colors">+ Add Question</button>
                  </div>
                  {editData.questions?.map((q, i) => (
                    <div key={i} className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200 relative">
                       <button onClick={() => { const qs = editData.questions.filter((_, idx) => idx !== i); setEditData({...editData, questions: qs}); }} className="absolute top-2 right-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button>
                       <div className="grid grid-cols-4 gap-2 mb-2">
                         <input placeholder="Year" className="p-2 border rounded-lg text-xs" value={q.year} onChange={e => { const qs = [...editData.questions]; qs[i].year = e.target.value; setEditData({...editData, questions: qs}); }} />
                         <input placeholder="Question" className="col-span-3 p-2 border rounded-lg text-xs" value={q.q} onChange={e => { const qs = [...editData.questions]; qs[i].q = e.target.value; setEditData({...editData, questions: qs}); }} />
                       </div>
                       <textarea placeholder="Solution" className="w-full p-2 border rounded-lg text-xs" value={q.solution} onChange={e => { const qs = [...editData.questions]; qs[i].solution = e.target.value; setEditData({...editData, questions: qs}); }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
                <button onClick={() => setIsEditorOpen(false)} className="px-4 py-2 text-slate-500 font-medium hover:text-slate-700">Cancel</button>
                <button onClick={handleSaveTopic} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200">Save Changes</button>
              </div>
            </div>
          </div>
        )}

        {/* TREND & SOLUTION MODALS */}
        {(selectedTrend || selectedSolution) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-5 border-b flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800">{selectedTrend ? 'Trend Analysis' : 'Solution'}</h3>
                <button onClick={() => { setSelectedTrend(null); setSelectedSolution(null); }} className="p-1 hover:bg-slate-200 rounded-full"><X size={20}/></button>
              </div>
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {selectedTrend ? (
                   <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedTrend.trend || "No analysis available."}</p>
                ) : (
                   <div className="space-y-4">
                     <div className="bg-indigo-50 p-4 rounded-xl text-sm text-indigo-900 font-medium border border-indigo-100">"{selectedSolution.q}"</div>
                     <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedSolution.solution || "Solution coming soon..."}</p>
                   </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;
