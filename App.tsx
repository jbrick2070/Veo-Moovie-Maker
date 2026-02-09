
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Character, Project, Shot, Language, translations } from './types';
import { CharacterManager } from './components/CharacterManager';
import { ShotGenerator } from './components/ShotGenerator';
import { ExportView } from './components/ExportView';
import { ProjectLibrary } from './components/ProjectLibrary';
import { CinematicBackground } from './components/CinematicBackground';
import { ErrorModal } from './components/ErrorModal';
import { ArrowLeft, Users, Clapperboard, Film, LayoutGrid, Key, ChevronRight, Loader2, Cpu, Github, Languages } from 'lucide-react';

export const SAMPLE_PROJECT_ID = 'proj-sample-mimelung-final-v3';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

const jeffreyDesc = "[Jeffrey] is 52 years old, 5'7\", about 192 pounds, with a chubby, stocky build. He is clean-shaven with short to medium-length hair that is slightly unkempt. His face is round with gentle features. He wears comfortable, loose-fitting casual clothing and favors pinks, soft pastels, muted reds, and light blues. His overall appearance is approachable, peaceful, and slightly disheveled.";
const magnoliaRexDesc = "[MagnoliaRex] is an ageless adult woman with a tall, slim, elegant build. She has symmetrical facial features with high cheekbones and a defined jawline. Her hair is long, dark, and voluminous with subtle asymmetry and faint star-like speckling. She wears eclectic, pop-inspired clothing with layered textures and bold colors such as violet, black, metallic gold, and electric accents. Her appearance is confident, iconic, and composed.";
const catDesc = "[Cat] is an Egyptian-type adult with a slender, long-limbed build. Its fur is very short, smooth, and dark gray to charcoal. It has a wedge-shaped head, large almond-shaped eyes, and large upright ears. Its tail is long and tapered. The cat’s appearance is elegant, alert, and intelligent.";

const commonVibe = "1970s thriller aesthetic, Panavision C-series, natural lighting, pushed film stock, visible grain, desaturated greens, moody atmosphere, anamorphic lens flares";

const createSampleShot = (id: string, order: number, env: string, action: string, camera: string, chars: string[]): Shot => ({
  id,
  sequenceOrder: order,
  environment: env,
  action: action,
  camera: camera,
  actionPrompt: `${camera}. ${env}. ${action}`,
  model: 'veo-3.1-generate-preview',
  aspectRatio: '16:9',
  resolution: '1080p',
  isContinuation: order > 1,
  charactersInvolved: chars
});

const SAMPLE_PROJECT: Project = {
  id: SAMPLE_PROJECT_ID,
  title: 'VALENTINE’S DAY: MIME LUNG',
  cinematicVibe: commonVibe,
  lastModified: Date.now(),
  characters: [
    { id: 'char-jeffrey', name: 'Jeffrey', description: jeffreyDesc, color: 'bg-blue-400' },
    { id: 'char-magnoliarex', name: 'MagnoliaRex', description: magnoliaRexDesc, color: 'bg-purple-600' },
    { id: 'char-cat', name: 'Cat', description: catDesc, color: 'bg-slate-700' }
  ],
  shots: [
    createSampleShot('s1', 1, 
      "Empty London street at night, wet pavement reflecting streetlights, early February winter atmosphere.",
      "[Jeffrey] walks beside [MagnoliaRex]. She smiles.\n[MagnoliaRex]: “Jeffrey, I have a surprise for you.”\nShe pauses.\n[MagnoliaRex]: “It’s almost Valentine’s Day, and I want us to have a marvelous adventure.”\nShe fades from view.",
      "Medium two-shot, Panavision C-Series anamorphic, 40mm, 1970s thriller aesthetic, natural sodium-vapor street lighting, pushed film stock, visible grain, desaturated greens, moody atmosphere.",
      ['char-jeffrey', 'char-magnoliarex']
    ),
    createSampleShot('s2', 2,
      "Same London street, now empty and silent.",
      "[Jeffrey] stands alone, checks his watch.\n[Jeffrey]: “February 1.”\nHe looks down the street.\n[Jeffrey]: “I’ll find you.”",
      "Static wide-to-medium shot, Panavision C-Series, 50mm, locked-off frame, practical street lighting only, heavy grain, muted color palette, low contrast blacks.",
      ['char-jeffrey']
    ),
    createSampleShot('s3', 3,
      "Heathrow Airport terminal interior, sleek futuristic design, autonomous systems and travelers in motion.",
      "[Jeffrey] moves quickly through the terminal, scanning departure boards, focused and determined.",
      "Tracking shot from behind, Panavision C-Series, 35mm anamorphic, natural terminal lighting, pushed stock, visible grain, restrained handheld movement.",
      ['char-jeffrey']
    ),
    createSampleShot('s4', 4,
      "Interior of hypersonic spacecraft approaching the International Space Station, Earth visible below.",
      "[Jeffrey] floats near the window, scanning data.\n[Jeffrey]: “Somewhere from your past… my past… our past?”",
      "Wide interior shot, Panavision C-Series, 35mm, cool practical lighting from panels and Earth glow, halation on highlights, subtle camera drift.",
      ['char-jeffrey']
    ),
    createSampleShot('s5', 5,
      "Exterior view of Earth from orbit, city lights forming steady patterns.",
      "[Jeffrey] notices a concentrated glow over Paris.\n[Jeffrey]: “Paris.”",
      "Extreme wide, Panavision C-Series, 75mm, static composition, pushed film grain, desaturated blues, slow optical zoom.",
      ['char-jeffrey']
    ),
    createSampleShot('s6', 6,
      "Paris streets under constant rain, cleaning robots scrubbing buildings and monuments.",
      "[Jeffrey] sits exhausted. A robot drops a postcard.\n[Jeffrey]: “Egypt?”\nHe studies the pyramid image.\n[Jeffrey]: “Of course.”",
      "Medium shot, Panavision C-Series, 65mm, rain on lens, natural overcast lighting, grain emphasized, handheld micro-movement.",
      ['char-jeffrey']
    ),
    createSampleShot('s7', 7,
      "Cairo at dusk, pyramids in the distance, amber sky fading to violet, cats filling streets and stone paths.",
      "[Jeffrey] walks among the cats. One larger [Cat] steps forward.\n[Cat]: “You’re looking for her.”\n[Jeffrey]: “Valentine’s Day is coming. I need to find MagnoliaRex.”\n[Cat]: “She is missed here.”\nThe cat turns away, then pauses.\n[Cat]: “I don’t care much for them birdies… but the penguins may have an answer.”",
      "Wide shot, Panavision C-Series, 40mm anamorphic, golden-hour natural light, pushed stock, warm highlights, soft contrast, subtle vignetting.",
      ['char-jeffrey', 'char-cat']
    ),
    createSampleShot('s8', 8,
      "Antarctic ice fields under a pale sky, unexpectedly temperate air, distant penguin silhouettes.",
      "[Jeffrey] walks forward, breath visible.\n[Jeffrey]: “Antarctica.”",
      "Wide shot, Panavision C-Series, 50mm, flat polar lighting, bleached highlights, grain visible in whites, austere framing.",
      ['char-jeffrey']
    ),
    createSampleShot('s9', 9,
      "South Pole marker area, wind moving across snow, a lone sign reading “Trafalgar.”",
      "[Jeffrey] reads the sign.\n[Jeffrey]: “London.”\nHe exhales.\n[Jeffrey]: “Love isn’t about distance.”",
      "Static extreme wide, Panavision C-Series, 75mm, minimal movement, heavy grain, desaturated palette.",
      ['char-jeffrey']
    ),
    createSampleShot('s10', 10,
      "Trafalgar Square at night, red neon heart lights, glowing writing booth.",
      "[Jeffrey] writes intensely.\n[Jeffrey]: “Every day with you matters.”\nA gust of wind pulls the page away.\n[Jeffrey]: “I should’ve stayed.”",
      "Medium close-up, Panavision C-Series, 50mm, neon practical lighting only, strong halation, deep shadows, saturated reds bleeding into grain.",
      ['char-jeffrey']
    ),
    createSampleShot('s11', 11,
      "Zurich Sechseläutenplatz on Valentine’s Day, lasers, video screens, massive stage, crowd gathered.",
      "[MagnoliaRex] appears on stage and locks eyes with [Jeffrey].\n[MagnoliaRex]: “Happy Valentine’s Day, Jeffrey.”\nShe blows him a kiss. The crowd rematerializes and dances.",
      "Wide celebratory shot, Panavision C-Series, 40mm anamorphic, mixed practical and stage lighting, pushed film stock, pronounced grain, slow crane upward.",
      ['char-jeffrey', 'char-magnoliarex']
    )
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
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('veo_mooovie_lang') as Language;
    return (['en', 'es', 'ja', 'vi', 'ko', 'ar'].includes(saved) ? saved : 'en') as Language;
  });

  const t = useMemo(() => translations[language], [language]);

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('veo_mooovie_projects');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((p: Project) => p.id === SAMPLE_PROJECT_ID ? SAMPLE_PROJECT : p);
      }
      return [SAMPLE_PROJECT];
    } catch (e) {
      return [SAMPLE_PROJECT];
    }
  });
  
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'characters' | 'shots' | 'export'>('characters');
  const [globalError, setGlobalError] = useState<{title: string, message: string, retryKey?: boolean} | null>(null);
  const [isStudioBusy, setIsStudioBusy] = useState(false);

  useEffect(() => {
    localStorage.setItem('veo_mooovie_lang', language);
  }, [language]);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        try {
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasKey(selected);
        } catch (err) {
          setHasKey(false);
        }
      } else {
        setHasKey(false);
      }
    };
    checkKey();
  }, []);

  useEffect(() => {
    try {
      const projectsToPersist = projects.map(p => ({
        ...p,
        characters: p.characters.map(({ visualAnchor, ...c }) => c),
        shots: p.shots.map(({ startingFrame, endingFrame, ...s }) => s)
      }));
      localStorage.setItem('veo_mooovie_projects', JSON.stringify(projectsToPersist));
    } catch (e) {
      console.warn("Storage quota hit. Memory-Tiered mode active.");
    }
  }, [projects]);

  const activeProject = useMemo(() => 
    projects.find(p => p.id === activeProjectId), 
    [projects, activeProjectId]
  );
  
  const isProjectOpen = !!activeProjectId && !!activeProject;

  const handleSelectProject = useCallback((id: string) => {
    setActiveProjectId(id);
    setActiveTab('characters');
  }, []);

  const handleCreateProject = useCallback((title: string) => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      title: title || "Untitled Production",
      cinematicVibe: commonVibe,
      shots: [],
      characters: [],
      lastModified: Date.now()
    };
    setProjects(prev => [...prev, newProject]);
    handleSelectProject(newProject.id);
  }, [handleSelectProject]);

  const handleUpdateActiveProject = useCallback((updater: Project | ((prev: Project) => Project)) => {
    setProjects(prev => prev.map(p => {
      if (p.id === activeProjectId) {
        const updated = typeof updater === 'function' ? (updater as (prev: Project) => Project)(p) : updater;
        return { ...updated, lastModified: Date.now() };
      }
      return p;
    }));
  }, [activeProjectId]);

  const handleKeySelection = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        setHasKey(true);
      } catch (err) {}
    }
  };

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
    <div className={`min-h-screen flex flex-col md:flex-row text-[#FDF0C9] relative overflow-hidden font-inter select-none ${language === 'ar' ? 'font-arabic' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <CinematicBackground />
      {globalError && (
        <ErrorModal 
          title={globalError.title} 
          message={globalError.message} 
          onClose={() => setGlobalError(null)} 
          onRetryKey={globalError.retryKey ? handleKeySelection : undefined} 
        />
      )}
      
      <nav className="w-full md:w-20 lg:w-64 bg-[#100C0A]/90 backdrop-blur-xl border-r border-[#3E2F28]/30 flex flex-col z-50">
        <div className="h-24 flex items-center px-8 border-b border-[#3E2F28]/20 cursor-pointer" onClick={() => setActiveProjectId(null)}>
           <ArtisticLogo />
        </div>
        <div className="p-4 space-y-2 flex-grow">
          <button onClick={() => setActiveProjectId(null)} className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${!isProjectOpen ? 'bg-[#C6934B] text-[#15100E] font-bold' : 'text-[#8C7A70] hover:text-[#FDF0C9]'}`}>
            <LayoutGrid size={24} />
            <span className="font-black uppercase text-xs tracking-widest hidden lg:block">{t.gallery}</span>
          </button>
          {isProjectOpen && (
            <>
              <div className="h-px bg-[#3E2F28]/20 my-4" />
              <NavButton active={activeTab === 'characters'} onClick={() => setActiveTab('characters')} icon={<Users size={22} />} label={t.cast} />
              <NavButton active={activeTab === 'shots'} onClick={() => setActiveTab('shots')} icon={<Clapperboard size={22} />} label={t.studio} />
              <NavButton active={activeTab === 'export'} onClick={() => setActiveTab('export')} icon={<Film size={22} />} label={t.export} />
            </>
          )}
        </div>
        
        <div className="p-4 border-t border-[#3E2F28]/30 bg-white/5 space-y-4">
          {/* Language Switcher */}
          <div className="flex items-center gap-3 px-1 group">
            <Languages size={18} className="text-[#8C7A70] group-hover:text-[#C6934B] transition-colors" />
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent text-[10px] font-black uppercase tracking-widest text-[#8C7A70] hover:text-[#C6934B] outline-none cursor-pointer hidden lg:block"
            >
              <option value="en" className="bg-[#15100E]">English</option>
              <option value="es" className="bg-[#15100E]">Español</option>
              <option value="ja" className="bg-[#15100E]">日本語</option>
              <option value="vi" className="bg-[#15100E]">Tiếng Việt</option>
              <option value="ko" className="bg-[#15100E]">한국어</option>
              <option value="ar" className="bg-[#15100E]">العربية</option>
            </select>
          </div>

          <a 
            href="https://github.com/jbrick2070/Veo-Moovie-Maker" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-3 text-[#8C7A70] hover:text-[#C6934B] transition-colors group px-1"
          >
            <Github size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">{t.open_source}</span>
          </a>

          {isStudioBusy ? (
            <div className="flex items-center gap-3 animate-pulse">
              <Loader2 className="animate-spin text-[#C6934B]" size={16} />
              <span className="text-[9px] font-black uppercase text-[#C6934B] tracking-widest">{t.processing}</span>
            </div>
          ) : (
            <div className="flex items-center gap-3 opacity-40">
              <Cpu size={16} className="text-[#8C7A70]" />
              <span className="text-[9px] font-black uppercase text-[#8C7A70] tracking-widest">{t.memory_stable}</span>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-grow h-screen overflow-hidden flex flex-col relative z-10 bg-black/20">
        <header className="h-20 border-b border-[#3E2F28]/20 flex items-center justify-between px-10 bg-[#100C0A]/40 backdrop-blur-md">
          {isProjectOpen ? (
            <div className="flex items-center gap-4">
              <button onClick={() => setActiveProjectId(null)} className={`text-[#5D4E45] hover:text-[#C6934B] transition-colors ${language === 'ar' ? 'rotate-180' : ''}`}><ArrowLeft size={20} /></button>
              <ChevronRight size={16} className={`text-[#3E2F28] ${language === 'ar' ? 'rotate-180' : ''}`} />
              <h1 className="text-xl font-black italic text-[#FDF0C9] uppercase">{activeProject.title}</h1>
            </div>
          ) : (
            <h1 className="text-[#C6934B] font-black text-2xl uppercase italic">{t.archive}</h1>
          )}
        </header>

        <div className="flex-grow overflow-y-auto custom-scrollbar">
          {!isProjectOpen ? (
            <ProjectLibrary 
              language={language}
              projects={projects} 
              onCreateProject={handleCreateProject} 
              onSelectProject={handleSelectProject} 
              onDeleteProject={(id) => setProjects(prev => prev.filter(p => p.id !== id))} 
              onAddSample={() => setProjects(prev => [SAMPLE_PROJECT, ...prev.filter(p => p.id !== SAMPLE_PROJECT_ID)])} 
              onApiError={(err) => handleApiError(err, "Library Error")}
              setProjects={setProjects}
            />
          ) : (
            <div className="p-8 max-w-7xl mx-auto">
              {activeTab === 'characters' && (
                <CharacterManager 
                  language={language}
                  characters={activeProject.characters} 
                  isStudioBusy={isStudioBusy}
                  setIsStudioBusy={setIsStudioBusy}
                  setCharacters={(charUpdater) => {
                    handleUpdateActiveProject(prev => ({
                      ...prev,
                      characters: typeof charUpdater === 'function' ? charUpdater(prev.characters) : charUpdater
                    }));
                  }} 
                  onApiError={(err) => handleApiError(err, "Cast Error")} 
                />
              )}
              {activeTab === 'shots' && (
                <ShotGenerator 
                  language={language}
                  project={activeProject} 
                  isStudioBusy={isStudioBusy}
                  setIsStudioBusy={setIsStudioBusy}
                  globalCharacters={activeProject.characters} 
                  onUpdateProject={handleUpdateActiveProject} 
                  onNavigateToExport={() => setActiveTab('export')} 
                  onApiError={(err) => handleApiError(err, "Studio Error")} 
                />
              )}
              {activeTab === 'export' && (
                <ExportView 
                  language={language}
                  project={activeProject} 
                  globalCharacters={activeProject.characters} 
                  onApiError={(err) => handleApiError(err, "Export Error")} 
                />
              )}
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
