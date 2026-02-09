
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Character, Project, Shot } from './types';
import { CharacterManager } from './components/CharacterManager';
import { ShotGenerator } from './components/ShotGenerator';
import { ExportView } from './components/ExportView';
import { ProjectLibrary } from './components/ProjectLibrary';
import { CinematicBackground } from './components/CinematicBackground';
import { ErrorModal } from './components/ErrorModal';
import { ArrowLeft, Users, Clapperboard, Film, LayoutGrid, Key, ChevronRight } from 'lucide-react';

export const SAMPLE_PROJECT_ID = 'proj-sample-mimelung-final-v3';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    // Fixed: Making this optional to avoid "identical modifiers" clashing with potential pre-existing global declarations.
    aistudio?: AIStudio;
  }
}

const jeffreyDesc = "Jeffrey is 52 years old, 5'7\", about 192 pounds, with a chubby, stocky build. He is clean-shaven with short to medium-length hair that is slightly unkempt. His face is round with gentle features. He wears comfortable, loose-fitting casual clothing and favors pinks, soft pastels, muted reds, and light blues. His overall appearance is approachable, peaceful, and slightly disheveled.";
const magnoliaRexDesc = "MagnoliaRex is an ageless adult woman with a tall, slim, elegant build. She has symmetrical facial features with high cheekbones and a defined jawline. Her hair is long, dark, and voluminous with subtle asymmetry and faint star-like speckling. She wears eclectic, pop-inspired clothing with layered textures and bold colors such as violet, black, metallic gold, and electric accents. Her appearance is confident, iconic, and composed.";

const SAMPLE_PROJECT: Project = {
  id: SAMPLE_PROJECT_ID,
  title: 'MIME LUNG MUSIC FESTIVAL',
  cinematicVibe: '1970s thriller aesthetic, Panavision C-series, natural lighting, pushed film stock, visible grain, desaturated greens, moody atmosphere, anamorphic lens flares',
  lastModified: Date.now(),
  characters: [
    { id: 'char-jeffrey', name: 'Jeffrey', description: jeffreyDesc, color: 'bg-blue-400' },
    { id: 'char-magnoliarex', name: 'MagnoliaRex', description: magnoliaRexDesc, color: 'bg-purple-600' }
  ],
  shots: [
    {
      id: 'shot-1',
      sequenceOrder: 1,
      environment: 'Empty London street at night, wet pavement reflecting streetlights.',
      action: '[Jeffrey] walks beside [MagnoliaRex]. She smiles and points toward the glowing lung stage.',
      camera: 'Medium two-shot, 1970s thriller aesthetic, natural street lighting.',
      actionPrompt: `Medium two-shot, Panavision C-Series anamorphic. (SUBJECT: Jeffrey -- ${jeffreyDesc}) walks beside (SUBJECT: MagnoliaRex -- ${magnoliaRexDesc})...`,
      model: 'veo-3.1-generate-preview',
      aspectRatio: '16:9',
      resolution: '1080p',
      isContinuation: false,
      charactersInvolved: ['char-jeffrey', 'char-magnoliarex']
    }
  ]
};

const ArtisticLogo = () => (
  <div className="flex flex-col items-center lg:items-start group transition-all">
    <div className="flex items-center">
      <span className="font-black text-2xl tracking-tighter text-[#FDF0C9] group-hover:text-[#C6934B] transition-colors">M</span>
      <div className="flex -space-x-1.5 ml-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="relative w-6 h-6 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>
              <path d="M50 15C30.67 15 15 30.67 15 50C15 69.33 30.67 85 50 85C69.33 85 85 69.33 85 50C85 30.67 69.33 15 50 15" stroke="#C6934B" strokeWidth="12" strokeLinecap="round" fill="none" />
            </svg>
            <span className="relative z-10 text-[10px] font-black text-[#15100E]">O</span>
          </div>
        ))}
      </div>
      <span className="font-black text-2xl tracking-tighter text-[#FDF0C9] ml-1 group-hover:text-[#C6934B] transition-colors">VIE</span>
    </div>
    <span className="text-[10px] font-black tracking-[0.4em] text-[#C6934B] uppercase mt-[-4px]">Maker</span>
  </div>
);

export const App: React.FC = () => {
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('veo_mooovie_projects');
      if (saved) return JSON.parse(saved);
      return [SAMPLE_PROJECT];
    } catch (e) {
      return [SAMPLE_PROJECT];
    }
  });
  
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'characters' | 'shots' | 'export'>('shots');
  const [globalError, setGlobalError] = useState<{title: string, message: string, retryKey?: boolean} | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      // Added safety check for aistudio existence
      if (window.aistudio) {
        try {
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasKey(selected);
        } catch (err) {
          console.error("Failed to check key status:", err);
          setHasKey(false);
        }
      } else {
        setHasKey(false);
      }
    };
    checkKey();
  }, []);

  useEffect(() => {
    localStorage.setItem('veo_mooovie_projects', JSON.stringify(projects));
  }, [projects]);

  const activeProject = useMemo(() => 
    projects.find(p => p.id === activeProjectId), 
    [projects, activeProjectId]
  );
  
  const isProjectOpen = !!activeProjectId && !!activeProject;

  const handleCreateProject = useCallback((title: string) => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      title: title || "Untitled Production",
      cinematicVibe: "Cinematic realism, high-fidelity film stock",
      shots: [],
      characters: [],
      lastModified: Date.now()
    };
    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newProject.id);
    setActiveTab('characters');
  }, []);

  const handleUpdateActiveProject = (updated: Project) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleKeySelection = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        setHasKey(true);
      } catch (err) {
        console.error("Key selection failed:", err);
      }
    }
  };

  // Helper to process API errors according to guidelines
  const handleApiError = useCallback((err: any, contextTitle: string) => {
    const errorMessage = err.message || String(err);
    if (errorMessage.includes("Requested entity was not found.")) {
      setGlobalError({ 
        title: "Key/Project Not Found", 
        message: "The requested API key or project entity was not found. Please re-select a valid paid project key.", 
        retryKey: true 
      });
    } else {
      setGlobalError({ title: contextTitle, message: errorMessage });
    }
  }, []);

  if (hasKey === false) {
    return (
      <div className="min-h-screen bg-[#15100E] flex flex-col items-center justify-center p-6 text-center">
        <CinematicBackground />
        <ArtisticLogo />
        <div className="bg-[#100C0A] border border-[#C6934B]/30 p-10 rounded-[3rem] shadow-2xl max-w-md mt-10">
          <Key size={48} className="text-[#C6934B] mx-auto mb-6" />
          <h2 className="text-2xl font-black text-[#FDF0C9] italic uppercase tracking-tighter mb-4">Studio Access Required</h2>
          <p className="text-[#8C7A70] text-sm leading-relaxed mb-8">Please select an API key from a paid GCP project to begin production.</p>
          <button onClick={handleKeySelection} className="w-full bg-[#C6934B] text-[#15100E] py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#FDF0C9] transition-all">Select Studio Key</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-[#FDF0C9] relative overflow-hidden font-inter select-none">
      <CinematicBackground />
      {globalError && (
        <ErrorModal title={globalError.title} message={globalError.message} onClose={() => setGlobalError(null)} onRetryKey={globalError.retryKey ? handleKeySelection : undefined} />
      )}
      
      <nav className="w-full md:w-20 lg:w-64 bg-[#100C0A]/90 backdrop-blur-xl border-r border-[#3E2F28]/30 flex flex-col z-50">
        <div className="h-24 flex items-center px-8 border-b border-[#3E2F28]/20 cursor-pointer" onClick={() => setActiveProjectId(null)}>
           <ArtisticLogo />
        </div>
        <div className="p-4 space-y-2 flex-grow">
          <button onClick={() => setActiveProjectId(null)} className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${!isProjectOpen ? 'bg-[#C6934B] text-[#15100E] font-bold' : 'text-[#8C7A70] hover:text-[#FDF0C9]'}`}>
            <LayoutGrid size={24} />
            <span className="font-black uppercase text-xs tracking-widest hidden lg:block">Gallery</span>
          </button>
          {isProjectOpen && (
            <>
              <div className="h-px bg-[#3E2F28]/20 my-4" />
              <NavButton active={activeTab === 'characters'} onClick={() => setActiveTab('characters')} icon={<Users size={22} />} label="Cast" />
              <NavButton active={activeTab === 'shots'} onClick={() => setActiveTab('shots')} icon={<Clapperboard size={22} />} label="Studio" />
              <NavButton active={activeTab === 'export'} onClick={() => setActiveTab('export')} icon={<Film size={22} />} label="Export" />
            </>
          )}
        </div>
      </nav>

      <main className="flex-grow h-screen overflow-hidden flex flex-col relative z-10 bg-black/20">
        <header className="h-20 border-b border-[#3E2F28]/20 flex items-center justify-between px-10 bg-[#100C0A]/40 backdrop-blur-md">
          {isProjectOpen ? (
            <div className="flex items-center gap-4">
              <button onClick={() => setActiveProjectId(null)} className="text-[#5D4E45] hover:text-[#C6934B] transition-colors"><ArrowLeft size={20} /></button>
              <ChevronRight size={16} className="text-[#3E2F28]" />
              <h1 className="text-xl font-black italic text-[#FDF0C9] uppercase">{activeProject.title}</h1>
            </div>
          ) : (
            <h1 className="text-[#C6934B] font-black text-2xl uppercase italic">Studio Archive</h1>
          )}
        </header>

        <div className="flex-grow overflow-y-auto custom-scrollbar">
          {!isProjectOpen ? (
            <ProjectLibrary 
              projects={projects} 
              onCreateProject={handleCreateProject} 
              onSelectProject={setActiveProjectId} 
              onDeleteProject={(id) => setProjects(prev => prev.filter(p => p.id !== id))} 
              onAddSample={() => setProjects(prev => [SAMPLE_PROJECT, ...prev.filter(p => p.id !== SAMPLE_PROJECT_ID)])} 
              onApiError={(err) => handleApiError(err, "Project Library Error")}
              setProjects={setProjects}
            />
          ) : (
            <div className="p-8 max-w-7xl mx-auto">
              {activeTab === 'characters' && <CharacterManager characters={activeProject.characters} setCharacters={(updater) => {
                const newChars = typeof updater === 'function' ? (updater as any)(activeProject.characters) : updater;
                handleUpdateActiveProject({...activeProject, characters: newChars});
              }} onApiError={(err) => handleApiError(err, "Character Manager Error")} />}
              {activeTab === 'shots' && <ShotGenerator project={activeProject} globalCharacters={activeProject.characters} onUpdateProject={handleUpdateActiveProject} onNavigateToExport={() => setActiveTab('export')} onApiError={(err) => handleApiError(err, "Shot Generator Error")} />}
              {activeTab === 'export' && <ExportView project={activeProject} globalCharacters={activeProject.characters} onApiError={(err) => handleApiError(err, "Export Studio Error")} />}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const NavButton = ({ onClick, icon, label, active }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${active ? 'bg-[#C6934B]/10 text-[#C6934B] border border-[#C6934B]/20' : 'text-[#8C7A70] hover:text-[#FDF0C9]'}`}>
    {icon}
    <span className="font-black uppercase text-xs tracking-widest hidden lg:block">{label}</span>
  </button>
);

export default App;
