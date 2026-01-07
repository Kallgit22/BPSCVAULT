import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, query, onSnapshot, addDoc, doc, updateDoc, deleteDoc 
} from 'firebase/firestore';
import { 
  getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged 
} from 'firebase/auth';
import { 
  Search, FileText, ChevronRight, GraduationCap, X, 
  TrendingUp, Book, Database, CheckCircle2, Plus, Settings, 
  Trash2, Layers, Layout, BookOpen, UserCircle, Eye, Edit3, Save, ExternalLink, Lock
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'bpsc-vault-v3';

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
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('mains-gs1');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [topics, setTopics] = useState([]);
  
  // Interaction State
  const [selectedTrend, setSelectedTrend] = useState(null);
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editData, setEditData] = useState({ title: '', section: 'mains-gs1', trend: '', studyLink: '', questions: [] });

  // 1. Auth Logic (Rule 3)
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth failed:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 2. Data Logic (Rule 1 & Rule 2)
  useEffect(() => {
    if (!user) return;
    // Rule 1: Use specific artifacts path structure
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'topics'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTopics(data);
    }, (err) => {
      console.error("Firestore read error:", err);
    });
    
    return () => unsubscribe();
  }, [user]);

  // Rule 2: Filter in memory
  const filteredTopics = useMemo(() => {
    return topics.filter(t => t.section === activeTab && 
      (t.title || "").toLowerCase().includes(searchTerm.toLowerCase()));
  }, [topics, activeTab, searchTerm]);

  // 3. Admin Actions
  const handleSaveTopic = async () => {
    if (!user) return;
    try {
      const topicToSave = { ...editData };
      delete topicToSave.id; // Don't include ID in the document body
      
      if (editData.id) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'topics', editData.id), topicToSave);
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'topics'), topicToSave);
      }
      setIsEditorOpen(false);
    } catch (e) { 
      console.error("Save error:", e);
    }
  };

  const handleDelete = async (id) => {
    if (!user) return;
    if (window.confirm("Delete this entire topic card?")) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'topics', id));
      } catch (e) {
        console.error("Delete error:", e);
      }
    }
  };

  return (
    <div className={`flex h-screen ${isAdminMode ? 'bg-slate-50' : 'bg-white'} font-sans text-slate-900 transition-colors duration-500`}>
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col z-20 shadow-xl shadow-slate-200/50">
        <div className="p-8 flex items-center gap-3">
          <div className={`p-2 rounded-xl text-white ${isAdminMode ? 'bg-rose-500' : 'bg-indigo-600 shadow-lg shadow-indigo-200'}`}>
            <GraduationCap size={24} />
          </div>
          <h1 className="text-xl font-black tracking-tighter">BPSC<span className="text-indigo-600">VAULT</span></h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Curriculum Sections</p>
          {NAV_SECTIONS.map((sec) => {
            const Icon = sec.icon;
            return (
              <button 
                key={sec.id}
                onClick={() => setActiveTab(sec.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all duration-200 ${activeTab === sec.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <Icon size={18} /> {sec.label}
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-100">
          <button 
            onClick={() => setIsAdminMode(!isAdminMode)}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${isAdminMode ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            {isAdminMode ? <><Eye size={14}/> STUDENT VIEW</> : <><Lock size={14}/> ADMIN ACCESS</>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* HEADER */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{NAV_SECTIONS.find(s => s.id === activeTab)?.label}</h2>
              {isAdminMode && <span className="bg-rose-100 text-rose-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Admin Console</span>}
            </div>
            <p className="text-xs text-slate-500 font-medium">Browse high-yield topics and patterns</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-100 px-4 py-2.5 rounded-2xl w-64 md:w-80 border border-transparent focus-within:border-indigo-300 focus-within:bg-white transition-all">
              <Search className="text-slate-400" size={16} />
              <input 
                type="text" placeholder="Search topics..." 
                className="bg-transparent outline-none text-sm w-full"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {isAdminMode && (
              <button 
                onClick={() => {setEditData({ title: '', section: activeTab, trend: '', studyLink: '', questions: [] }); setIsEditorOpen(true)}}
                className="bg-indigo-600 text-white p-2.5 rounded-2xl shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95 transition-all"
              >
                <Plus size={20} />
              </button>
            )}
          </div>
        </header>

        {/* TOPICS GRID */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {filteredTopics.map((topic) => (
              <div 
                key={topic.id} 
                className={`group relative bg-white rounded-[2.5rem] border border-slate-200 shadow-sm transition-all duration-300 ${isAdminMode ? 'hover:border-indigo-400 ring-4 ring-transparent hover:ring-indigo-50' : 'hover:shadow-2xl hover:-translate-y-1'}`}
              >
                {isAdminMode && (
                  <div className="absolute top-6 right-6 flex gap-2 z-10">
                    <button onClick={() => {setEditData(topic); setIsEditorOpen(true)}} className="p-2.5 bg-white shadow-md rounded-xl text-blue-600 hover:bg-blue-50 transition-colors border border-slate-100"><Edit3 size={16}/></button>
                    <button onClick={() => handleDelete(topic.id)} className="p-2.5 bg-white shadow-md rounded-xl text-rose-600 hover:bg-rose-50 transition-colors border border-slate-100"><Trash2 size={16}/></button>
                  </div>
                )}

                <div className="p-8 pb-4">
                  <div className="mb-4">
                    <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border border-indigo-100">
                      {NAV_SECTIONS.find(s => s.id === topic.section)?.label || topic.section}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-850 leading-tight mb-6">{topic.title}</h3>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setSelectedTrend(topic)}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-900 text-white rounded-2xl text-xs font-black tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200"
                    >
                      <TrendingUp size={14} /> TREND
                    </button>
                    <a 
                      href={topic.studyLink} target="_blank" rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-indigo-50 text-indigo-700 rounded-2xl text-xs font-black tracking-widest hover:bg-indigo-100 transition-all"
                    >
                      <Book size={14} /> STUDY
                    </a>
                  </div>
                </div>

                <div className="p-8 bg-slate-50/50 rounded-b-[2.5rem] space-y-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Database size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Question Bank</span>
                    </div>
                  </div>

                  {topic.questions?.map((q, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all group/q">
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <p className="text-[13px] font-bold text-slate-700 leading-relaxed">{q.q}</p>
                        <span className="shrink-0 bg-slate-100 text-slate-500 text-[9px] font-black px-2 py-1 rounded-lg">{q.year}</span>
                      </div>
                      <button 
                        onClick={() => setSelectedSolution({ ...q, title: topic.title })}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black text-indigo-600 border border-indigo-100 bg-white hover:bg-indigo-600 hover:text-white transition-all duration-300 uppercase tracking-widest"
                      >
                        View Solution <ChevronRight size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* EDITOR MODAL */}
        {isEditorOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
            <div className="bg-white w-full max-w-4xl my-8 rounded-[3rem] shadow-2xl flex flex-col">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                <h3 className="text-xl font-black text-slate-900">Configure Topic</h3>
                <button onClick={() => setIsEditorOpen(false)} className="p-3 bg-slate-100 rounded-full hover:bg-rose-50 hover:text-rose-600"><X size={20} /></button>
              </div>
              
              <div className="p-8 space-y-8 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input 
                    placeholder="Card Title" className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold"
                    value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})}
                  />
                  <select 
                    className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold"
                    value={editData.section} onChange={e => setEditData({...editData, section: e.target.value})}
                  >
                    {NAV_SECTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>

                <textarea 
                  placeholder="Trend Analysis" rows="3" className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-sm"
                  value={editData.trend} onChange={e => setEditData({...editData, trend: e.target.value})}
                />

                <input 
                  placeholder="Study Link" className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-sm"
                  value={editData.studyLink} onChange={e => setEditData({...editData, studyLink: e.target.value})}
                />

                <div className="space-y-4">
                  <button 
                    onClick={() => setEditData({...editData, questions: [...(editData.questions || []), { q: '', year: '', solution: '' }]})}
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black"
                  >
                    + ADD QUESTION
                  </button>
                  {editData.questions?.map((q, idx) => (
                    <div key={idx} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-200 relative">
                      <button 
                        onClick={() => {
                          const qs = editData.questions.filter((_, i) => i !== idx);
                          setEditData({...editData, questions: qs});
                        }}
                        className="absolute top-4 right-4 text-slate-300 hover:text-rose-500"
                      ><Trash2 size={16}/></button>
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <input placeholder="Year" className="p-3 rounded-xl text-xs font-bold" value={q.year} onChange={e => {
                          const qs = [...editData.questions]; qs[idx].year = e.target.value; setEditData({...editData, questions: qs});
                        }} />
                        <input placeholder="Question" className="col-span-3 p-3 rounded-xl text-xs font-medium" value={q.q} onChange={e => {
                          const qs = [...editData.questions]; qs[idx].q = e.target.value; setEditData({...editData, questions: qs});
                        }} />
                      </div>
                      <textarea placeholder="Solution" rows="3" className="w-full p-3 rounded-xl text-xs" value={q.solution} onChange={e => {
                        const qs = [...editData.questions]; qs[idx].solution = e.target.value; setEditData({...editData, questions: qs});
                      }} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 bg-slate-50 rounded-b-[3rem] border-t flex gap-4">
                <button onClick={() => setIsEditorOpen(false)} className="flex-1 font-bold text-slate-400">DISCARD</button>
                <button onClick={handleSaveTopic} className="flex-[3] py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl">
                  <Save size={18} className="inline mr-2"/> SYNC CHANGES
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TREND MODAL */}
        {selectedTrend && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl animate-in slide-in-from-bottom">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black">Trend Analysis</h3>
                <button onClick={() => setSelectedTrend(null)} className="p-2 bg-slate-100 rounded-full"><X size={20}/></button>
              </div>
              <div className="bg-slate-50 p-6 rounded-[2rem] text-slate-700 text-sm leading-loose whitespace-pre-wrap">
                {selectedTrend.trend || "No data available."}
              </div>
            </div>
          </div>
        )}

        {/* SOLUTION MODAL */}
        {selectedSolution && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md">
            <div className="bg-white w-full max-w-3xl h-[85vh] rounded-[3.5rem] overflow-hidden shadow-2xl flex flex-col">
              <div className="p-10 border-b flex justify-between items-center">
                <h3 className="text-xl font-black">Expert Solution</h3>
                <button onClick={() => setSelectedSolution(null)} className="p-3 bg-slate-100 rounded-full"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-10 space-y-8">
                <div className="p-8 bg-indigo-50/50 rounded-[2.5rem] italic font-bold text-slate-700 text-sm">
                  "{selectedSolution.q}"
                </div>
                <div className="text-slate-700 leading-loose text-base px-2">
                  {selectedSolution.solution || "Drafting model answer..."}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
