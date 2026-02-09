
import React, { useState, useEffect } from 'react';
import { Project, Character, Shot } from '../types';
import { Plus, Film, Trash2, ArrowRight, X, Sparkles, Loader2, Wand2, RefreshCw, CheckCircle2, Flame, AlertCircle, Users, FilmIcon, Clapperboard, Layers, ChevronRight, FileText, Zap, Search, Fingerprint, Database, Cpu } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { SAMPLE_PROJECT_ID } from '../App';

interface ProjectLibraryProps {
  projects: Project[];
  onCreateProject: (title: string) => void;
  onSelectProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onAddSample: () => void;
  onApiError: (error: any) => void;
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}

const COLORS = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500'];

const PRODUCTION_LOGS = {
  import: [
    "Analyzing Narrative Syntax...",
    "Scanning for Temporal Keywords...",
    "Locating Geographic Anchors...",
    "Extracting Character Bios...",
    "Synthesizing Series Metadata..."
  ],
  casting: [
    "Drafting Role Profiles...",
    "Consulting Casting Director...",
    "Validating Identity Continuity...",
    "Designing Character Visual DNA..."
  ],
  scripting: [
    "Initializing Production Script...",
    "Mapping Scene Continuity...",
    "Applying Veo 3 Physics Anchors...",
    "Simulating Lighting Environments...",
    "Calibrating Virtual Lenses...",
    "Optimizing Frame Coherence...",
    "Finalizing Volumetric Details...",
    "Rendering Sequential Treatment..."
  ]
};

type MagicStage = 'setup' | 'script-import' | 'loading' | 'cast-review';
type MagicMode = 'import' | 'manual';

const extractJson = (text: string) => {
  try {
    return JSON.parse(text);
  } catch (e) {
    const trimmed = text.trim();
    // More aggressive JSON extraction for speed
    const match = trimmed.match(/\[\s*\{[\s\S]*\}\s*\]/) || 
                  trimmed.match(/\{[\s\S]*\}/) || 
                  trimmed.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (innerE) {
        throw new Error("Malformed JSON from AI. Please try again.");
      }
    }
    throw new Error("The Director returned an invalid script format.");
  }
};

export const ProjectLibrary: React.FC<ProjectLibraryProps> = ({ 
  projects, onCreateProject, onSelectProject, onDeleteProject, onAddSample, onApiError, setProjects 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isMagicDirectorOpen, setIsMagicDirectorOpen] = useState(false);
  const [magicStage, setMagicStage] = useState<MagicStage>('setup');
  const [activeMode, setActiveMode] = useState<MagicMode | null>(null);
  
  const [magicContext, setMagicContext] = useState({ 
    year: '', 
    location: '', 
    genre: '',
    numCharacters: 3,
    numShots: 5
  });

  const [rawScript, setRawScript] = useState('');
  const [isProducing, setIsProducing] = useState(false);
  const [producingStatus, setProducingStatus] = useState('');
  const [conceptData, setConceptData] = useState<any>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  // Rapid status message cycler for perceived performance
  useEffect(() => {
    let interval: any;
    if (isProducing) {
      let idx = 0;
      const logs = (magicStage === 'loading' && activeMode === 'import') 
        ? PRODUCTION_LOGS.import 
        : (magicStage === 'loading' && conceptData ? PRODUCTION_LOGS.scripting : PRODUCTION_LOGS.casting);
      
      setProducingStatus(logs[0]);
      interval = setInterval(() => {
        idx++;
        setProducingStatus(logs[idx % logs.length]);
      }, 1200); // Even faster cycling for a "crunchy" tech feel
    }
    return () => clearInterval(interval);
  }, [isProducing, magicStage, activeMode, conceptData]);

  const handleOpenMagic = () => {
    setIsMagicDirectorOpen(true);
    setMagicStage('setup');
    setActiveMode(null);
    setConceptData(null);
    setRawScript('');
    setMagicContext({ year: '', location: '', genre: '', numCharacters: 3, numShots: 5 });
  };

  const handleImportScript = async () => {
    if (!rawScript.trim()) return;

    setIsProducing(true);
    setMagicStage('loading');
    setActiveMode('import');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Streamlined prompt for pure speed
      const prompt = `Return ONLY a raw JSON object. NO EXPLANATION. 
      Fields: title (string), year (string), location (string), genre (string), vibe (cinematic description), cast (array of {name, bio}). 
      SCRIPT: "${rawScript.substring(0, 4000)}"`;

      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              year: { type: Type.STRING },
              location: { type: Type.STRING },
              genre: { type: Type.STRING },
              vibe: { type: Type.STRING },
              cast: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT, 
                  properties: { name: { type: Type.STRING }, bio: { type: Type.STRING } } 
                } 
              }
            },
            required: ['title', 'year', 'location', 'genre', 'vibe', 'cast']
          }
        }
      });

      const parsed = extractJson(result.text);
      setConceptData(parsed);
      setMagicContext(prev => ({
        ...prev,
        year: parsed.year || 'Unknown',
        location: parsed.location || 'Unknown',
        genre: parsed.genre || 'Cinematic',
        numCharacters: Math.min(parsed.cast.length, 4)
      }));
      setMagicStage('cast-review');
    } catch (err) {
      onApiError(err);
      setMagicStage('script-import');
    } finally {
      setIsProducing(false);
    }
  };

  const generateCasting = async () => {
    if (!magicContext.year.trim() || !magicContext.location.trim() || !magicContext.genre.trim()) return;

    setIsProducing(true);
    setMagicStage('loading');
    setActiveMode('manual');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Pitch a premium series. ERA: ${magicContext.year}, PLACE: ${magicContext.location}, GENRE: ${magicContext.genre}. Provide a catchy title, a detailed visual vibe, and ${magicContext.numCharacters} diverse characters.`;
      
      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              vibe: { type: Type.STRING },
              cast: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT, 
                  properties: { name: { type: Type.STRING }, bio: { type: Type.STRING } } 
                } 
              }
            },
            required: ['title', 'vibe', 'cast']
          }
        }
      });
      
      const parsed = extractJson(result.text);
      setConceptData(parsed);
      setMagicStage('cast-review');
    } catch (err) { 
      onApiError(err); 
      setMagicStage('setup');
    } finally { 
      setIsProducing(false); 
    }
  };

  const generateStoryboard = async () => {
    setIsProducing(true);
    setMagicStage('loading');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Create ${magicContext.numShots} shots for "${conceptData.title}". VIBE: ${conceptData.vibe}. CAST: ${conceptData.cast.map((c:any) => `[${c.name}]: ${c.bio}`).join('; ')}. Output JSON.`;

      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              shots: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT, 
                  properties: { 
                    env: { type: Type.STRING }, 
                    act: { type: Type.STRING }, 
                    cam: { type: Type.STRING }, 
                    fullPrompt: { type: Type.STRING } 
                  } 
                } 
              }
            },
            required: ['shots']
          }
        }
      });
      
      const data = extractJson(result.text);
      const newChars = conceptData.cast.map((c: any) => ({ 
        id: crypto.randomUUID(), 
        name: c.name, 
        description: c.bio, 
        color: COLORS[Math.floor(Math.random() * COLORS.length)] 
      }));
      
      const newShots = data.shots.map((s: any, idx: number) => ({ 
        id: crypto.randomUUID(), 
        sequenceOrder: idx + 1, 
        environment: s.env, 
        action: s.act, 
        camera: s.cam, 
        actionPrompt: s.fullPrompt, 
        charactersInvolved: [], 
        model: 'veo-3.1-generate-preview', 
        aspectRatio: '16:9', 
        resolution: '1080p', 
        isContinuation: idx > 0 
      }));

      const newProj = { 
        id: crypto.randomUUID(), 
        title: conceptData.title, 
        cinematicVibe: conceptData.vibe, 
        shots: newShots, 
        characters: newChars, 
        lastModified: Date.now() 
      };

      setProjects(prev => [...prev, newProj]);
      onSelectProject(newProj.id);
      setIsMagicDirectorOpen(false);
    } catch (err) { 
      onApiError(err); 
      setMagicStage('cast-review');
    } finally { 
      setIsProducing(false); 
    }
  };

  const isSetupValid = magicContext.year.trim() !== '' && 
                       magicContext.location.trim() !== '' && 
                       magicContext.genre.trim() !== '';

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div>
          <h2 className="text-4xl font-black text-[#FDF0C9] tracking-tighter uppercase italic leading-none">Mooovie Gallery</h2>
          <p className="text-[#8C7A70] font-medium tracking-tight mt-2 opacity-60">Manage your production library.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={onAddSample} className="bg-white/5 text-[#8C7A70] px-6 py-4 rounded-2xl font-black border border-white/10 text-[10px] tracking-widest uppercase hover:text-white transition-all"><RefreshCw size={14} className="inline mr-2" /> Restore Sample</button>
          <button onClick={handleOpenMagic} className="bg-[#C6934B]/10 text-[#C6934B] px-6 py-4 rounded-2xl font-black border border-[#C6934B]/30 text-[10px] tracking-widest uppercase hover:bg-[#C6934B]/20 transition-all"><Sparkles size={16} className="inline mr-2" /> Magic Director</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <button onClick={() => setIsModalOpen(true)} className="h-full min-h-[420px] border-2 border-dashed border-[#3E2F28] rounded-[2.5rem] flex flex-col items-center justify-center gap-6 hover:bg-white/5 transition-all text-[#5D4E45] font-black uppercase text-xs tracking-[0.4em] hover:border-[#C6934B]/40 hover:text-[#C6934B] group bg-[#0A0806]/40">
          <div className="p-6 rounded-full border-2 border-dashed border-current group-hover:scale-110 transition-transform"><Plus size={48} /></div>
          Action! New Mooovie
        </button>

        {projects.map((project) => (
          <div key={project.id} className={`bg-[#100C0A]/80 border ${project.id === SAMPLE_PROJECT_ID ? 'border-[#C6934B]/80 shadow-[0_0_40px_rgba(198,147,75,0.15)]' : 'border-[#3E2F28]/30'} rounded-[2.5rem] flex flex-col hover:border-[#C6934B]/50 transition-all group relative overflow-hidden h-full min-h-[420px]`}>
            <div className={`h-[18rem] w-full relative overflow-hidden bg-[#15100E]`}>
              {project.id === SAMPLE_PROJECT_ID ? (
                <div className="absolute inset-0 flex items-center justify-center p-2">
                  <div className="w-full h-full bg-[#1A1A1A] border-4 border-[#2A2A2A] rounded-xl flex flex-col items-center justify-between p-3 shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-700">
                    <div className="flex items-center gap-1 opacity-60">
                       <div className="w-1.5 h-1.5 rounded-full bg-[#C6934B]" />
                       <div className="w-1.5 h-1.5 rounded-full bg-[#8A1C1C]" />
                       <div className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
                       <div className="w-1.5 h-1.5 rounded-full bg-[#1565C0]" />
                       <div className="w-1.5 h-1.5 rounded-full bg-[#AD1457]" />
                    </div>
                    <div className="flex flex-col items-center justify-center flex-grow py-0 space-y-[-1.1rem]">
                      <MimeLungWord text="MIME" colors={['#A5D6A7', '#FBC02D', '#F06292']} size="text-[5.5rem]" />
                      <MimeLungWord text="LUNG" colors={['#9FA8DA', '#4FC3F7', '#81C784']} size="text-[5.5rem]" />
                      <MimeLungWord text="MUSIC" colors={['#FFD54F', '#FF8A65', '#90A4AE']} size="text-[4.2rem]" />
                      <MimeLungWord text="FESTIVAL" colors={['#CE93D8', '#BA68C8', '#4DB6AC']} size="text-[3.2rem]" />
                    </div>
                    <div className="w-full pt-1.5 border-t border-[#3E2F28]/30 flex flex-col items-center">
                       <span className="text-[8px] font-black uppercase tracking-[0.5em] text-[#C6934B] mb-0.5 opacity-60">Produced By</span>
                       <span className="text-[12px] font-black uppercase tracking-[0.2em] text-[#FDF0C9] italic">Jeffrey A. Brick</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center opacity-10"><Film size={80} /></div>
              )}
            </div>
            <div className="p-6 flex flex-col flex-grow bg-[#100C0A] relative z-10">
              <h3 className={`font-black text-[#FDF0C9] mb-1 italic uppercase tracking-tighter leading-[0.9] group-hover:text-[#C6934B] transition-colors ${project.title.length > 15 ? 'text-2xl' : 'text-3xl'}`}>
                {project.title}
              </h3>
              <p className="text-[10px] text-[#8C7A70] font-black uppercase tracking-[0.2em] mb-4 line-clamp-2 mt-2 leading-relaxed opacity-70">
                {project.cinematicVibe || "New Project Draft"}
              </p>
              <div className="mt-auto flex gap-3">
                <button onClick={() => onSelectProject(project.id)} className="flex-grow bg-[#C6934B] text-[#15100E] py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-[#FDF0C9] transition-all active:scale-95 shadow-lg shadow-[#C6934B]/10">
                  Enter Studio <ArrowRight size={18} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); setDeletingProjectId(project.id); }} className="p-4 text-[#5D4E45] hover:text-red-500 border border-[#3E2F28] rounded-2xl transition-all"><Trash2 size={20} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isMagicDirectorOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6">
          <div className="bg-[#100C0A] border border-[#C6934B]/20 w-full max-w-2xl p-10 rounded-[3.5rem] relative shadow-2xl overflow-hidden animate-in zoom-in-95">
            <button onClick={() => setIsMagicDirectorOpen(false)} className="absolute top-8 right-8 text-[#5D4E45] hover:text-[#FDF0C9]"><X size={28} /></button>
            <div className="flex items-center gap-4 mb-8 border-b border-[#3E2F28] pb-4">
              <Sparkles className="text-[#C6934B]" size={32} /> 
              <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Magic Director</h2>
            </div>

            {magicStage === 'setup' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="p-6 bg-[#C6934B]/5 border border-[#C6934B]/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-black text-[#C6934B] uppercase tracking-widest">Story Import</h3>
                    <p className="text-[10px] text-[#8C7A70] font-bold">Have a script? Dump it and let AI do the work.</p>
                  </div>
                  <button onClick={() => setMagicStage('script-import')} className="bg-[#C6934B] text-[#15100E] px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#FDF0C9] transition-all flex items-center gap-2"><FileText size={14} /> Import Text Block</button>
                </div>
                <div className="relative flex items-center justify-center"><div className="absolute h-px w-full bg-[#3E2F28]"></div><span className="relative bg-[#100C0A] px-4 text-[10px] font-black text-[#5D4E45] uppercase tracking-widest">or manual setup</span></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2"><label className="text-[10px] font-black text-[#5D4E45] uppercase tracking-widest">Year</label><input value={magicContext.year} onChange={e => setMagicContext({...magicContext, year: e.target.value})} placeholder="e.g. 2061" className="w-full bg-[#15100E] border border-[#3E2F28] p-4 rounded-xl text-white outline-none focus:border-[#C6934B] font-bold" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-[#5D4E45] uppercase tracking-widest">Location</label><input value={magicContext.location} onChange={e => setMagicContext({...magicContext, location: e.target.value})} placeholder="e.g. Zurich" className="w-full bg-[#15100E] border border-[#3E2F28] p-4 rounded-xl text-white outline-none focus:border-[#C6934B] font-bold" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-[#5D4E45] uppercase tracking-widest">Genre</label><input value={magicContext.genre} onChange={e => setMagicContext({...magicContext, genre: e.target.value})} placeholder="e.g. Sci-Fi Longing" className="w-full bg-[#15100E] border border-[#3E2F28] p-4 rounded-xl text-white outline-none focus:border-[#C6934B] font-bold" /></div>
                </div>
                <div className="pt-4 border-t border-[#3E2F28]/30"><div className="space-y-3"><label className="flex items-center gap-2 text-[10px] font-black text-[#C6934B] uppercase tracking-[0.2em]"><Users size={14} /> Cast Size (Max 4)</label><div className="flex items-center gap-6"><input type="range" min="1" max="4" value={magicContext.numCharacters} onChange={e => setMagicContext({...magicContext, numCharacters: parseInt(e.target.value)})} className="flex-grow accent-[#C6934B]" /><span className="w-10 text-center font-black text-2xl text-[#FDF0C9]">{magicContext.numCharacters}</span></div></div></div>
                <button onClick={generateCasting} disabled={!isSetupValid || isProducing} className="w-full bg-[#C6934B] text-[#15100E] py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-4 active:scale-95 hover:bg-[#FDF0C9] shadow-2xl shadow-[#C6934B]/20 disabled:opacity-30 group"><span>Pitch & Assemble Cast</span><ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" /></button>
              </div>
            )}

            {magicStage === 'script-import' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#C6934B] uppercase tracking-widest">Paste Story Script Block</label>
                  <textarea value={rawScript} onChange={(e) => setRawScript(e.target.value)} placeholder="Jeffrey walked through the streets of London... Feb 1, 2061..." className="w-full h-80 bg-[#15100E] border border-[#3E2F28] p-6 rounded-2xl text-white text-sm outline-none focus:border-[#C6934B] font-medium leading-relaxed resize-none custom-scrollbar" />
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setMagicStage('setup')} className="flex-1 bg-white/5 text-[#8C7A70] py-5 rounded-xl font-black uppercase text-[10px] tracking-widest border border-white/5">Cancel</button>
                  <button onClick={handleImportScript} disabled={!rawScript.trim() || isProducing} className="flex-[3] bg-[#C6934B] text-[#15100E] py-5 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-[#FDF0C9] active:scale-95 disabled:opacity-30"><Zap size={18} /> Analyze Story & Build Cast</button>
                </div>
              </div>
            )}

            {magicStage === 'loading' && (
              <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500 text-center space-y-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#C6934B]/30 blur-[80px] rounded-full animate-pulse"></div>
                  <div className="relative z-10 p-8 rounded-full border-2 border-[#C6934B]/20 bg-[#100C0A]">
                    <Loader2 className="animate-spin text-[#C6934B]" size={80} />
                  </div>
                  <div className="absolute top-0 right-0 p-2 bg-[#C6934B] rounded-full text-[#100C0A] animate-bounce">
                    {activeMode === 'import' ? <Search size={16} /> : <Cpu size={16} />}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                    {activeMode === 'import' ? 'Production Scanner Active' : 'Director Drafting...'}
                  </h3>
                  <div className="flex items-center justify-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#C6934B] animate-ping" />
                    <p className="text-[#8C7A70] font-bold text-sm tracking-widest uppercase italic">{producingStatus}</p>
                  </div>
                </div>
                <div className="w-full max-w-sm h-1.5 bg-[#3E2F28] rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-gradient-to-right from-[#C6934B] to-[#FDF0C9] animate-[shimmer_1.5s_infinite]"></div>
                </div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#5D4E45] opacity-50">Estimated production time: ~10-15 seconds</p>
              </div>
            )}

            {magicStage === 'cast-review' && conceptData && (
              <div className="space-y-8 animate-in slide-in-from-right-6 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2"><label className="text-[10px] font-black text-[#C6934B] uppercase tracking-[0.4em]">Series Title</label><input value={conceptData.title} onChange={e => setConceptData({...conceptData, title: e.target.value})} className="w-full bg-[#15100E] border border-[#3E2F28] p-4 rounded-xl text-3xl font-black text-[#FDF0C9] outline-none italic focus:border-[#C6934B]" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-[#C6934B] uppercase tracking-[0.4em]">Visual DNA</label><textarea value={conceptData.vibe} onChange={e => setConceptData({...conceptData, vibe: e.target.value})} className="w-full bg-[#15100E] border border-[#3E2F28] p-4 rounded-xl text-xs font-bold text-[#8C7A70] h-[72px] resize-none outline-none leading-relaxed focus:border-[#C6934B]" /></div>
                </div>
                <div className="space-y-4"><span className="text-[10px] font-black text-[#C6934B] uppercase tracking-widest flex items-center gap-2"><Users size={16} /> Review Cast</span><div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar p-1">
                     {conceptData.cast.map((c: any, i: number) => (
                       <div key={i} className="p-4 bg-black/40 border border-[#3E2F28] rounded-2xl group hover:border-[#C6934B]/30 transition-all flex gap-3 items-start"><div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-black text-[#C6934B] text-xs shrink-0">{i + 1}</div><div className="flex-grow space-y-1"><input value={c.name} onChange={e => { const newCast = [...conceptData.cast]; newCast[i].name = e.target.value; setConceptData({...conceptData, cast: newCast}); }} className="w-full bg-transparent text-sm font-black text-[#FDF0C9] outline-none" /><textarea value={c.bio} onChange={e => { const newCast = [...conceptData.cast]; newCast[i].bio = e.target.value; setConceptData({...conceptData, cast: newCast}); }} className="w-full bg-transparent text-[10px] text-[#8C7A70] leading-relaxed h-12 resize-none outline-none" /></div></div>
                     ))}
                  </div></div>
                <div className="pt-6 border-t border-[#3E2F28]/30 space-y-6"><div className="space-y-3"><label className="flex items-center gap-2 text-[10px] font-black text-[#C6934B] uppercase tracking-[0.2em]"><Clapperboard size={14} /> Scene Continuity Count</label><div className="flex items-center gap-6"><input type="range" min="3" max="10" value={magicContext.numShots} onChange={e => setMagicContext({...magicContext, numShots: parseInt(e.target.value)})} className="flex-grow accent-[#C6934B]" /><span className="w-10 text-center font-black text-2xl text-[#FDF0C9]">{magicContext.numShots}</span></div></div><div className="flex gap-4">
                    <button onClick={() => setMagicStage(rawScript ? 'script-import' : 'setup')} className="px-8 bg-white/5 text-[#5D4E45] py-5 rounded-xl font-black uppercase text-[10px] tracking-widest border border-white/5 hover:text-[#FDF0C9]">Redraft Source</button>
                    <button onClick={generateStoryboard} className="flex-grow bg-[#C6934B] text-[#15100E] py-5 rounded-2xl font-black uppercase text-sm flex items-center justify-center gap-4 active:scale-95 hover:bg-[#FDF0C9] transition-all shadow-xl shadow-[#C6934B]/10"><CheckCircle2 size={24} /> Generate Production Script</button>
                  </div></div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {deletingProjectId && (
        <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-6"><div className="bg-[#15100E] p-10 rounded-[2.5rem] border border-red-500/30 max-w-sm text-center space-y-6 animate-in zoom-in-95"><h3 className="text-2xl font-black uppercase italic">Delete Mooovie?</h3><p className="text-[#8C7A70] text-sm font-bold">This production will be permanently scrapped from the studio library.</p><div className="flex gap-4"><button onClick={() => { onDeleteProject(deletingProjectId); setDeletingProjectId(null); }} className="flex-1 bg-red-600 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest">Delete Script</button><button onClick={() => setDeletingProjectId(null)} className="flex-1 bg-white/5 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-[#8C7A70]">Cancel</button></div></div></div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6">
           <div className="bg-[#100C0A] border border-[#C6934B]/30 w-full max-w-lg p-10 rounded-[3.5rem] relative animate-in zoom-in-95 shadow-2xl">
             <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-[#5D4E45] hover:text-[#C6934B]"><X size={28} /></button>
             <h2 className="text-4xl font-black text-[#FDF0C9] mb-8 italic uppercase tracking-tighter border-b border-[#3E2F28] pb-4">New Mooovie Draft</h2>
             <form onSubmit={(e) => { e.preventDefault(); onCreateProject(newTitle); setIsModalOpen(false); }} className="space-y-8">
               <div className="space-y-2"><label className="text-[10px] font-black text-[#5D4E45] uppercase tracking-widest ml-1">Working Title</label><input autoFocus type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Untitled Masterpiece" className="w-full bg-[#15100E] border border-[#3E2F28] text-[#FDF0C9] text-3xl font-black px-6 py-5 rounded-[2rem] outline-none focus:ring-2 focus:ring-[#C6934B] italic" /></div>
               <button type="submit" disabled={!newTitle.trim()} className="w-full bg-[#C6934B] text-[#15100E] py-5 rounded-[2rem] font-black text-xl uppercase tracking-widest active:scale-95 hover:bg-[#FDF0C9] shadow-xl shadow-[#C6934B]/10">Action!</button>
             </form>
           </div>
        </div>
      )}
    </div>
  );
};

const MimeLungWord = ({ text, colors, size = "text-6xl" }: { text: string, colors: string[], size?: string }) => (
  <div className={`relative ${size} font-black italic tracking-tight select-none leading-none w-full text-center flex justify-center`}><div className="relative inline-block"><span className="absolute inset-0 text-black translate-x-1.5 translate-y-1.5 blur-[2px] opacity-60">{text}</span><span className="absolute inset-0" style={{ WebkitTextStroke: '2.5px #111' }}>{text}</span><span className="relative z-10" style={{ backgroundImage: `linear-gradient(to right, ${colors.join(', ')})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 12px rgba(0,0,0,0.4))' }}>{text}</span></div></div>
);
