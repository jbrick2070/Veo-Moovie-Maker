import React, { useState, useEffect } from 'react';
import { Character, Project, Shot } from './types';
import { CharacterManager } from './components/CharacterManager';
import { ShotGenerator } from './components/ShotGenerator';
import { ExportView } from './components/ExportView';
import { ProjectLibrary } from './components/ProjectLibrary';
import { CinematicBackground } from './components/CinematicBackground';
import { Layout, Users, Clapperboard, FileText, ArrowLeft, Home } from 'lucide-react';

// --- SAMPLE DATA ---

const SAMPLE_CHARACTERS: Character[] = [
  {
    id: 'char-jeffrey',
    name: 'Jeffrey',
    description: `A 52-year-old adult male, approximately 5'7" tall with a stocky, chubby build weighing around 190–195 lbs. His proportions are realistic and soft rather than athletic. He has a rounder face with gentle features and a calm, approachable appearance. He is clean-shaven with no facial hair.

His hair is short to medium length, slightly unkempt, casually styled, and showing subtle signs of age such as mild thinning or uneven texture. The style appears practical rather than groomed.

His skin shows natural aging with faint lines and texture, evenly toned and unenhanced. His eyes are expressive and relaxed, conveying warmth, curiosity, and emotional openness rather than intensity.

He wears comfortable, loosely fitted clothing with a peaceful, slightly humorous aesthetic. Colors favor pinks, soft pastels, muted reds, light blues, and warm neutrals. Outfits include relaxed shirts, soft sweaters, simple jackets, and casual pants. Fabrics are everyday materials like cotton or knit, prioritizing comfort over fashion.

Overall appearance is gentle, non-threatening, slightly disheveled, and human.
Photorealistic anatomy, neutral lighting, high-resolution detail.`,
    color: 'bg-blue-500'
  },
  {
    id: 'char-magnolia',
    name: 'MagnoliaRex',
    description: `An adult female pop icon with a slim, athletic build and confident posture. She has expressive facial features with high cheekbones, a strong jawline, and bold eyes. Her makeup is vivid and graphic, emphasizing contrast around the eyes and lips rather than realism.

Her hair is voluminous and stylized, worn asymmetrically with exaggerated texture. The hairstyle mixes teased volume and loose strands, incorporating intentional color accents in warm reds, electric oranges, deep purples, or platinum highlights. The hair appears playful and rebellious rather than polished.

She wears an eclectic pop-fashion outfit that blends vintage-inspired shapes with modern tailoring. Clothing layers include a fitted top with structured shoulders, a cropped jacket or vest, and high-waisted bottoms. Fabrics vary between matte and glossy, with visible texture such as leather, mesh, or satin-like materials. Colors are bold and contrasting, favoring saturated tones with unexpected combinations.

Accessories are expressive and mismatched, including chunky jewelry, layered bangles, and asymmetrical earrings. The overall appearance is unconventional, vibrant, and unmistakably iconic, with realistic human proportions and photorealistic detail.`,
    color: 'bg-purple-500'
  },
  {
    id: 'char-cat',
    name: 'Cat',
    description: `"Cat" An Egyptian-type domestic cat with a slender, elegant build and long, lean proportions. The body is muscular but refined, with narrow shoulders and hips. The fur is very short, fine, and close to the skin, appearing smooth and velvety. The coat color is solid gray to charcoal, with subtle tonal variation rather than pattern.

The head is wedge-shaped with high cheekbones and a narrow muzzle. The eyes are large, almond-shaped, and slightly angled, colored pale green or amber. The ears are large, wide at the base, and upright, giving the cat an alert, sculptural silhouette.

The neck is long and graceful. The legs are long and slim with small, oval paws. The tail is long, thin, and tapers evenly.

Overall anatomy is refined, symmetrical, and statuesque, with realistic proportions and a quiet, intelligent presence.
Photorealistic detail, neutral lighting, high-resolution.`,
    color: 'bg-orange-500'
  }
];

const SAMPLE_PROJECT: Project = {
  id: 'proj-sample-1',
  title: 'Mime Lung Music Festival (Moovie Sample)',
  cinematicVibe: 'Surreal music festival atmosphere, golden hour lighting, handheld camera movement, soft bokeh, vibrant colors',
  lastModified: Date.now(),
  shots: [
    {
      id: 'shot-sample-1',
      sequenceOrder: 1,
      environment: 'A dusty, sun-drenched festival ground with floating geometric balloons',
      action: '[MagnoliaRex] sings passionately into a vintage microphone while [Jeffrey] dances awkwardly in the background holding a corndog. [Cat] watches judgmentally from a speaker stack.',
      camera: 'Medium long shot, rack focus from the cat to Magnolia',
      // We pre-calculate the prompt here so it looks correct in export immediately
      actionPrompt: `A dusty, sun-drenched festival ground with floating geometric balloons, (SUBJECT: MagnoliaRex -- An adult female pop icon with a slim, athletic build and confident posture. She has expressive facial features with high cheekbones, a strong jawline, and bold eyes. Her makeup is vivid and graphic, emphasizing contrast around the eyes and lips rather than realism.

Her hair is voluminous and stylized, worn asymmetrically with exaggerated texture. The hairstyle mixes teased volume and loose strands, incorporating intentional color accents in warm reds, electric oranges, deep purples, or platinum highlights. The hair appears playful and rebellious rather than polished.

She wears an eclectic pop-fashion outfit that blends vintage-inspired shapes with modern tailoring. Clothing layers include a fitted top with structured shoulders, a cropped jacket or vest, and high-waisted bottoms. Fabrics vary between matte and glossy, with visible texture such as leather, mesh, or satin-like materials. Colors are bold and contrasting, favoring saturated tones with unexpected combinations.

Accessories are expressive and mismatched, including chunky jewelry, layered bangles, and asymmetrical earrings. The overall appearance is unconventional, vibrant, and unmistakably iconic, with realistic human proportions and photorealistic detail.) sings passionately into a vintage microphone while (SUBJECT: Jeffrey -- A 52-year-old adult male, approximately 5'7" tall with a stocky, chubby build weighing around 190–195 lbs. His proportions are realistic and soft rather than athletic. He has a rounder face with gentle features and a calm, approachable appearance. He is clean-shaven with no facial hair.

His hair is short to medium length, slightly unkempt, casually styled, and showing subtle signs of age such as mild thinning or uneven texture. The style appears practical rather than groomed.

His skin shows natural aging with faint lines and texture, evenly toned and unenhanced. His eyes are expressive and relaxed, conveying warmth, curiosity, and emotional openness rather than intensity.

He wears comfortable, loosely fitted clothing with a peaceful, slightly humorous aesthetic. Colors favor pinks, soft pastels, muted reds, light blues, and warm neutrals. Outfits include relaxed shirts, soft sweaters, simple jackets, and casual pants. Fabrics are everyday materials like cotton or knit, prioritizing comfort over fashion.

Overall appearance is gentle, non-threatening, slightly disheveled, and human.
Photorealistic anatomy, neutral lighting, high-resolution detail.) dances awkwardly in the background holding a corndog. (SUBJECT: Cat -- "Cat" An Egyptian-type domestic cat with a slender, elegant build and long, lean proportions. The body is muscular but refined, with narrow shoulders and hips. The fur is very short, fine, and close to the skin, appearing smooth and velvety. The coat color is solid gray to charcoal, with subtle tonal variation rather than pattern.

The head is wedge-shaped with high cheekbones and a narrow muzzle. The eyes are large, almond-shaped, and slightly angled, colored pale green or amber. The ears are large, wide at the base, and upright, giving the cat an alert, sculptural silhouette.

The neck is long and graceful. The legs are long and slim with small, oval paws. The tail is long, thin, and tapers evenly.

Overall anatomy is refined, symmetrical, and statuesque, with realistic proportions and a quiet, intelligent presence.
Photorealistic detail, neutral lighting, high-resolution.) watches judgmentally from a speaker stack., Medium long shot, rack focus from the cat to Magnolia`,
      model: 'veo-3.1-generate-preview',
      aspectRatio: '16:9',
      resolution: '1080p',
      isContinuation: false,
      charactersInvolved: ['char-magnolia', 'char-jeffrey', 'char-cat']
    }
  ]
};

// --- APP COMPONENT ---

function App() {
  // --- Studio State ---
  // Initialize with Sample Data
  const [globalCharacters, setGlobalCharacters] = useState<Character[]>(SAMPLE_CHARACTERS);
  const [projects, setProjects] = useState<Project[]>([SAMPLE_PROJECT]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  
  // --- Navigation State ---
  const [activeTab, setActiveTab] = useState<'characters' | 'shots' | 'export'>('shots');

  // Helper to get active project
  const activeProject = projects.find(p => p.id === activeProjectId);

  // --- Handlers ---
  
  const handleCreateProject = (title: string) => {
    const finalTitle = title.trim() || ("Untitled Mooovie " + (projects.length + 1));

    const newProject: Project = {
      id: crypto.randomUUID(),
      title: finalTitle,
      cinematicVibe: "",
      shots: [],
      lastModified: Date.now()
    };
    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newProject.id);
    setActiveTab('characters'); // Jump to Cast tab first as requested
  };

  const handleUpdateActiveProject = (updated: Project) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this Mooovie?")) {
      setProjects(prev => prev.filter(p => p.id !== id));
      if (activeProjectId === id) setActiveProjectId(null);
    }
  };

  // --- Navigation Logic ---
  
  const handleGoHome = () => {
    setActiveProjectId(null);
  };

  // Render logic based on whether a project is open or not
  const isProjectOpen = !!activeProjectId && !!activeProject;

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-[#FDF0C9] relative overflow-hidden">
      
      {/* 3D Background Layer */}
      <CinematicBackground />

      {/* Sidebar Navigation */}
      <nav className="w-full md:w-20 lg:w-64 bg-[#15100E]/80 backdrop-blur-md border-r border-[#3E2F28] flex flex-col justify-between shrink-0 z-20">
        <div>
          <div className="h-16 flex items-center px-4 border-b border-[#3E2F28] cursor-pointer" onClick={handleGoHome}>
             <div className="w-8 h-8 bg-[#C6934B] rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-[#C6934B]/20">
               <Clapperboard className="text-[#15100E] fill-current" size={18} />
             </div>
             <span className="font-bold text-lg tracking-tight hidden lg:block text-[#C6934B]">Veo Mooovie Maker</span>
          </div>

          <div className="p-4 space-y-2">
            
            <button
              onClick={handleGoHome}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                !isProjectOpen 
                  ? 'bg-[#C6934B] text-[#15100E] shadow-lg shadow-[#C6934B]/20 font-bold' 
                  : 'text-[#8C7A70] hover:bg-[#3E2F28]/50 hover:text-[#FDF0C9]'
              }`}
            >
              <div className={`${!isProjectOpen ? 'text-[#15100E]' : 'text-[#8C7A70] group-hover:text-[#FDF0C9]'}`}>
                <Home size={20} />
              </div>
              <span className="font-medium hidden lg:block">Mooovie Studio</span>
            </button>

            <div className="my-4 border-t border-[#3E2F28]/50"></div>

            {/* Global Tool: Cast */}
            <NavButton 
              active={activeTab === 'characters' && isProjectOpen} 
              onClick={() => {
                if (!isProjectOpen) {
                  setActiveTab('characters');
                } else {
                  setActiveTab('characters');
                }
              }}
              icon={<Users size={20} />}
              label="Studio Cast"
              count={globalCharacters.length}
              isActiveView={activeTab === 'characters'} 
            />

            {/* Project Specific Tools (Only visible if project open) */}
            {isProjectOpen && (
              <>
                <div className="px-4 py-2 text-xs font-bold text-[#8C7A70] uppercase tracking-wider mt-4 hidden lg:block">
                  Active Mooovie
                </div>
                <NavButton 
                  active={activeTab === 'shots'} 
                  onClick={() => setActiveTab('shots')}
                  icon={<Layout size={20} />}
                  label="Scene Builder"
                  count={activeProject.shots.length}
                  isActiveView={activeTab === 'shots'}
                />
                 <NavButton 
                  active={activeTab === 'export'} 
                  onClick={() => setActiveTab('export')}
                  icon={<FileText size={20} />}
                  label="Prompt Script"
                  isActiveView={activeTab === 'export'}
                />
              </>
            )}
          </div>
        </div>

        {/* Footer Area: Vibe & Version */}
        <div className="p-4 border-t border-[#3E2F28] bg-[#15100E]/30">
          {/* Cinematic Vibe Input (Only show if project active) */}
          {isProjectOpen && (
            <div className="mb-4 hidden lg:block animate-in slide-in-from-bottom-5">
              <label className="text-xs uppercase font-bold text-[#8C7A70] mb-2 block">Cinematic Vibe</label>
              <textarea 
                value={activeProject.cinematicVibe}
                onChange={(e) => handleUpdateActiveProject({...activeProject, cinematicVibe: e.target.value})}
                className="w-full bg-[#0A0806]/50 border border-[#3E2F28] rounded-lg p-2 text-xs text-[#FDF0C9] h-24 resize-none focus:border-[#C6934B] outline-none placeholder-[#5D4E45]"
                placeholder="e.g. Dark moody atmosphere, neon rim lighting..."
              />
            </div>
          )}
          
          <div className="text-xs text-[#8C7A70] text-center lg:text-left font-mono opacity-60">
            Veo Mooovie Maker v1
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow h-screen overflow-hidden flex flex-col bg-transparent relative z-10">
        {/* Top Header */}
        <header className="h-16 border-b border-[#3E2F28] flex items-center justify-between px-8 bg-[#15100E]/80 backdrop-blur-sm">
          <div className="flex items-center gap-4 w-full">
            {isProjectOpen && (
              <button onClick={handleGoHome} className="text-[#8C7A70] hover:text-[#C6934B] transition-colors">
                <ArrowLeft size={20} />
              </button>
            )}
            
            {isProjectOpen ? (
               <input 
                value={activeProject.title}
                onChange={(e) => handleUpdateActiveProject({...activeProject, title: e.target.value})}
                className="bg-transparent text-[#FDF0C9] font-bold text-xl outline-none placeholder-[#5D4E45] w-full md:w-96 focus:border-b border-[#C6934B]"
                placeholder="Mooovie Title..."
              />
            ) : (
              <span className="text-[#FDF0C9] font-bold text-xl drop-shadow-lg">
                 {activeTab === 'characters' && !isProjectOpen ? 'Studio Casting' : 'My Mooovies'}
              </span>
            )}
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto p-0 md:p-0 custom-scrollbar relative">
          
          <div className="h-full">
            
            {/* VIEW: DASHBOARD */}
            {!isProjectOpen && activeTab !== 'characters' && (
              <ProjectLibrary 
                projects={projects}
                onCreateProject={handleCreateProject}
                onSelectProject={(id) => {
                  setActiveProjectId(id);
                  setActiveTab('shots');
                }}
                onDeleteProject={handleDeleteProject}
              />
            )}

            {/* VIEW: CHARACTERS (Global) */}
            {activeTab === 'characters' && (
              <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CharacterManager 
                  characters={globalCharacters} 
                  setCharacters={setGlobalCharacters} 
                />
              </div>
            )}
            
            {/* VIEW: SHOTS (Project Specific) */}
            {activeTab === 'shots' && isProjectOpen && (
              <div className="p-4 md:p-8 max-w-7xl mx-auto h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ShotGenerator 
                  project={activeProject} 
                  globalCharacters={globalCharacters}
                  onUpdateProject={handleUpdateActiveProject} 
                />
              </div>
            )}

            {/* VIEW: EXPORT (Project Specific) */}
            {activeTab === 'export' && isProjectOpen && (
              <div className="p-4 md:p-8 max-w-7xl mx-auto h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ExportView project={activeProject} globalCharacters={globalCharacters} />
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

// Nav Button Component
const NavButton = ({ onClick, icon, label, count, isActiveView }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
      isActiveView 
        ? 'bg-[#3E2F28] text-[#C6934B] border border-[#C6934B]/30' 
        : 'text-[#8C7A70] hover:bg-[#3E2F28]/50 hover:text-[#FDF0C9]'
    }`}
  >
    <div className={`${isActiveView ? 'text-[#C6934B]' : 'text-[#5D4E45] group-hover:text-[#FDF0C9]'}`}>
      {icon}
    </div>
    <span className="font-medium hidden lg:block">{label}</span>
    {count !== undefined && (
      <span className={`ml-auto text-xs py-0.5 px-2 rounded-full hidden lg:block ${isActiveView ? 'bg-[#C6934B]/20 text-[#C6934B]' : 'bg-[#2A1F1B] text-[#5D4E45]'}`}>
        {count}
      </span>
    )}
  </button>
);

export default App;