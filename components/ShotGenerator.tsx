import React, { useState, useEffect } from 'react';
import { Character, Shot, Project } from '../types';
import { Film, Plus, Wand2, Eraser, MoveDown, MoveUp, Layers, Lock, Unlock, Eye, Video, User, Aperture, ChevronRight, ChevronDown, MessageSquareQuote, MapPin, Globe, Sparkles, Link, Save, XCircle, RotateCcw } from 'lucide-react';

interface ShotGeneratorProps {
  project: Project;
  globalCharacters: Character[];
  onUpdateProject: (updatedProject: Project) => void;
}

// --- PRESETS DATA ---

const ENV_PRESETS_FICTION = [
  {
    title: "1. Digital Afterlife — Awakening",
    value: "2095. Non-physical computational environment. Sterile digital void, conductive surfaces, abstract space. Minimal geometry, soft luminous gradients, subtle digital artifacts, no horizon, no natural textures."
  },
  {
    title: "5. “Home” Interior",
    value: "2095, Unspecified virtual residence. Surreal domestic interior. Floating objects, soft lighting, non-Euclidean calm, domestic scale, timeless interior logic."
  },
  {
    title: "6. Cartoon Life Review",
    value: "2095, Inside “Home”. Interior media-viewing space. Television-dominated visual field, recursive imagery, animated representations, temporal compression."
  },
  {
    title: "10. Diamond Planet",
    value: "Deep time / Unknown Year. WASP-12b, Auriga constellation. Extraterrestrial volcanic surface. Reddish-yellow atmosphere, crystalline terrain, non-human scale, high contrast lighting."
  },
  {
    title: "11. Simulation Failure",
    value: "2095, Copper-lined cave. Industrial subterranean chamber. Metallic surfaces, low light, unstable environmental behavior, system degradation cues."
  },
  {
    title: "15. Final Dissolution",
    value: "2095, Digital afterlife space. Abstract white-out field. Near-total brightness, loss of detail, gradual disappearance of structure."
  }
];

const ENV_PRESETS_REAL = [
  {
    title: "Kentucky (Louisville / Forecastle Festival)",
    value: "2013, Louisville, Kentucky, USA. Outdoor riverfront music festival. Ohio River nearby, concrete walkways, temporary stages under highway overpasses, humid summer air, mixed daylight and overcast skies, crowds in casual summer clothing, sound equipment and barricades visible."
  },
  {
    title: "Detroit (Movement Festival / Downtown)",
    value: "2013, Detroit, Michigan, USA. Urban public plaza and downtown core. Hart Plaza amphitheater, concrete steps, riverfront wind, industrial skyline, Renaissance Center towers, gray skies, rain-soaked pavement, festival lighting rigs, large speaker stacks."
  },
  {
    title: "Seoul (Music Festival / City Exploration)",
    value: "2013, Seoul, South Korea. Dense metropolitan city and outdoor festival grounds. Neon signage, modern high-rises, festival stages with LED screens, humid summer night air, crowded streets, elevated walkways, mixed traditional and contemporary architecture."
  },
  {
    title: "New York City",
    value: "2013–2014, New York City, New York, USA. Dense urban streets and cultural interiors. Tall buildings, narrow streets, taxis, sidewalks packed with pedestrians, interior performance spaces with brick walls and low lighting, constant motion and ambient city noise."
  },
  {
    title: "Los Angeles Park",
    value: "2012–2014, Los Angeles, California, USA. Urban park and open public green space. Palm trees, dry grass patches, concrete paths, bright sunlight, long shadows, nearby traffic noise, relaxed daytime atmosphere, people sitting or walking casually."
  },
  {
    title: "Hollywood (Bars, Music Venues, Streets)",
    value: "2013, Hollywood, Los Angeles, California, USA. Nighttime entertainment district. Neon signs, crowded bars, low-ceiling music venues, red carpet backdrops, streetlights reflecting on asphalt, mixed tourists and locals, loud ambient soundscape."
  }
];

const CAMERA_PRESETS = [
  {
    id: '1940s',
    label: "1940s Silver Noir",
    desc: "Soft focus, glamour glow, high-contrast monochrome.",
    value: "1940s cinematography, Academy ratio 1.37:1, soft focus glamour, deep depth of field, black and white film stock, nitrate film texture, harsh key light, soft fill"
  },
  {
    id: '1950s',
    label: "1950s VistaScope",
    desc: "Anamorphic distortion, oval bokeh, vibrant Technicolor.",
    value: "1950s Technicolor, CinemaScope, 2.35:1 aspect ratio, anamorphic lens distortion, oval bokeh, vibrant primary colors, wide angle epic"
  },
  {
    id: '1960s',
    label: "1960s Spaghetti Zoom",
    desc: "Imperfections, snap zooms, warmer palette, grain.",
    value: "1960s spaghetti western style, Techniscope 2-perf, warm Kodak film stock, film grain, rapid zoom, organic handheld camera, dusty atmosphere"
  },
  {
    id: '1970s',
    label: "1970s New Hollywood",
    desc: "Naturalistic, milky shadows, flaring, pushed film.",
    value: "1970s thriller aesthetic, Panavision C-series, natural lighting, pushed film stock, visible grain, desaturated greens, moody atmosphere"
  },
  {
    id: '1980s',
    label: "1980s Neon Blockbuster",
    desc: "Sharp, blue flares, high contrast, metallic.",
    value: "1980s action movie, Panavision E-series anamorphic, horizontal blue lens flare, high contrast, neon lighting, wet streets, sharp focus"
  },
  {
    id: '1990s',
    label: "1990s Super Saturation",
    desc: "Glossy, punchy colors, ultra-sharp spherical.",
    value: "1990s music video aesthetic, Super 35mm film, Zeiss Super Speed lenses, high saturation, fish-eye distortion, gloss lighting, dynamic range"
  },
  {
    id: '2000s',
    label: "2000s Digi-Intermediate",
    desc: "Hyper-real sharpness, crushed blacks, Teal & Orange.",
    value: "2000s blockbuster, digital intermediate color grade, teal and orange contrast, crushed blacks, hyper-sharp, Sony CineAlta texture"
  },
  {
    id: '2010s',
    label: "2010s Large Format",
    desc: "Creamy bokeh, shallow depth, soft skin tones.",
    value: "2010s Arri Alexa look, large format cinematography, extremely shallow depth of field, creamy bokeh, Canon K35 vintage lens, soft natural light"
  },
  {
    id: '2020s',
    label: "2020s Virtual Volume",
    desc: "Edge-to-edge perfection, zero distortion, hyper-clean.",
    value: "2020s unreal engine style, virtual production volume, Arri Signature Prime, 8K resolution, ray-traced lighting, perfect sharpness, zero distortion"
  },
  // --- EXPERIMENTAL PRESETS ---
  {
    id: 'exp-tactile',
    label: "Exp. Tactile Canvas",
    desc: "Chaotic scratches, painting, chemical burns.",
    value: "direct animation on 16mm film, hand-painted celluloid, emulsion scratches, chemical burns, chaotic texture, rapid strobe montage, abstract light leaks, organic collage overlay, non-narrative, visual noise"
  },
  {
    id: 'exp-unblinking',
    label: "Exp. The Unblinking Eye",
    desc: "Raw minimalism, static framing, high-contrast B&W.",
    value: "1960s structural film, high contrast black and white 16mm, static framing, long take, no camera movement, raw studio lighting, visible film grain, minimalist portrait, uncomfortable stare, silence"
  },
  {
    id: 'exp-signal',
    label: "Exp. Signal Decay",
    desc: "Analog video feedback, CRT scanlines, magnetic distortion.",
    value: "vintage video synthesizer, analog video feedback loop, CRT monitor scanlines, magnetic distortion, VHS tracking error, saturated RGB noise, cathode ray tube aesthetic, phosphor glow, electromagnetic interference"
  },
  {
    id: 'exp-constructed',
    label: "Exp. Constructed Identity",
    desc: "Staged surrealism, rear projection, uncanny artifice.",
    value: "conceptual staged photography, mid-century film still aesthetic, rear projection background, dramatic noir lighting, B-movie melodrama, heavy makeup, uncanny valley, psychological surrealism, deliberate artifice, dutch angle"
  }
];

const SAMPLE_SCENE_ACTION = `Dreamlike realism. [Jeffrey] walks near ancient pyramids as the city fills with Egyptian-type cats. One cat—larger and more familiar—faces him directly and speaks.

[Cat] says:
“I miss [MagnoliaRex].”

[Jeffrey] responds quietly:
“I miss her too.”

[Cat] looks at him and continues:
“I don’t care much for them birdies, but the penguins may have an answer.”

[MagnoliaRex] is absent but emotionally present. Warm tones, still composition, quiet mystery.`;

export const ShotGenerator: React.FC<ShotGeneratorProps> = ({ project, globalCharacters, onUpdateProject }) => {
  // Granular State
  const [envInput, setEnvInput] = useState('');
  const [actionInput, setActionInput] = useState('');
  const [cameraInput, setCameraInput] = useState('');
  
  // Locking State (Persist fields between shots)
  const [lockEnv, setLockEnv] = useState(false);
  const [lockCamera, setLockCamera] = useState(false);

  // UI State
  const [isLensKitOpen, setIsLensKitOpen] = useState(false);
  const [isEnvPresetsOpen, setIsEnvPresetsOpen] = useState(false);
  const [envCategory, setEnvCategory] = useState<'real' | 'fiction'>('real');
  const [isContinuation, setIsContinuation] = useState(false);

  // Edit Mode State
  const [editingShotId, setEditingShotId] = useState<string | null>(null);

  // --- Logic for Character Tags ---

  const insertCharacter = (char: Character) => {
    const tag = `[${char.name}]`;
    setActionInput(prev => {
        const prefix = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
        return prev + prefix + tag + ' ';
    });
  };

  const resolveActionPrompt = (rawAction: string) => {
    let processed = rawAction;
    const sortedChars = [...globalCharacters].sort((a, b) => b.name.length - a.name.length);
    sortedChars.forEach(char => {
      const tag = `[${char.name}]`;
      if (processed.includes(tag)) {
         processed = processed.split(tag).join(`(SUBJECT: ${char.name} -- ${char.description})`);
      }
    });
    return processed;
  };

  const loadSampleScene = () => {
    // Safety check: Disable if text exists
    if (actionInput.length > 0) return; 
    setActionInput(SAMPLE_SCENE_ACTION);
  };

  // --- Continuity Logic ---

  // When Continuity is toggled ON, try to auto-fill from the last shot
  useEffect(() => {
    if (isContinuation && !editingShotId && project.shots.length > 0) {
      const lastShot = project.shots[project.shots.length - 1];
      if (!envInput && lastShot.environment) setEnvInput(lastShot.environment);
      if (!cameraInput && lastShot.camera) setCameraInput(lastShot.camera);
    }
  }, [isContinuation]);

  // --- Computed Values ---

  const expandedAction = resolveActionPrompt(actionInput);
  const combinedPrompt = [envInput, expandedAction, cameraInput].filter(Boolean).join(', ');

  // --- Shot Management ---

  const handleSaveShot = () => {
    if (!combinedPrompt.trim()) return;

    // Detect used characters
    const usedCharIds = globalCharacters
      .filter(c => actionInput.includes(`[${c.name}]`))
      .map(c => c.id);

    if (editingShotId) {
      // UPDATE EXISTING SHOT
      const updatedShots = project.shots.map(shot => {
        if (shot.id === editingShotId) {
          return {
            ...shot,
            environment: envInput,
            action: actionInput,
            camera: cameraInput,
            actionPrompt: combinedPrompt,
            charactersInvolved: usedCharIds,
            isContinuation: isContinuation
          };
        }
        return shot;
      });

      onUpdateProject({
        ...project,
        shots: updatedShots,
        lastModified: Date.now()
      });

      // Exit Edit Mode
      handleCancelEdit();

    } else {
      // ADD NEW SHOT
      const newShot: Shot = {
        id: crypto.randomUUID(),
        sequenceOrder: project.shots.length + 1,
        environment: envInput,
        action: actionInput,
        camera: cameraInput,
        actionPrompt: combinedPrompt,
        charactersInvolved: usedCharIds, 
        model: 'veo-3.1-generate-preview',
        aspectRatio: '16:9',
        resolution: '1080p',
        isContinuation: isContinuation,
      };

      onUpdateProject({
        ...project,
        shots: [...project.shots, newShot],
        lastModified: Date.now()
      });

      // Reset / Setup for next shot
      if (!lockEnv) setEnvInput('');
      setActionInput(''); 
      if (!lockCamera) setCameraInput('');
      setIsContinuation(true); // Default next shot to continuity
    }
  };

  const handleDeleteShot = (id: string) => {
    onUpdateProject({
      ...project,
      shots: project.shots.filter(s => s.id !== id),
      lastModified: Date.now()
    });
    if (editingShotId === id) handleCancelEdit();
  };

  const handleEditShot = (shot: Shot) => {
    setEditingShotId(shot.id);
    setEnvInput(shot.environment || '');
    setActionInput(shot.action || ''); 
    setCameraInput(shot.camera || '');
    setIsContinuation(shot.isContinuation);
  };

  const handleCancelEdit = () => {
    setEditingShotId(null);
    setEnvInput('');
    setActionInput('');
    setCameraInput('');
    setIsContinuation(project.shots.length > 0);
  };

  const moveShot = (index: number, direction: 'up' | 'down') => {
    const newShots = [...project.shots];
    if (direction === 'up' && index > 0) {
      [newShots[index], newShots[index - 1]] = [newShots[index - 1], newShots[index]];
    } else if (direction === 'down' && index < newShots.length - 1) {
      [newShots[index], newShots[index + 1]] = [newShots[index + 1], newShots[index]];
    }
    // Re-assign sequence orders
    const reordered = newShots.map((s, i) => ({ ...s, sequenceOrder: i + 1 }));
    
    onUpdateProject({
      ...project,
      shots: reordered,
      lastModified: Date.now()
    });
  };

  const currentEnvPresets = envCategory === 'real' ? ENV_PRESETS_REAL : ENV_PRESETS_FICTION;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      {/* Left: Input Area */}
      <div className="lg:col-span-7 space-y-6">
        <div className={`backdrop-blur-md border rounded-xl p-6 shadow-xl space-y-6 transition-colors ${editingShotId ? 'bg-[#2A1F1B]/90 border-[#C6934B]' : 'bg-[#15100E]/80 border-[#3E2F28]'}`}>
          <div className="flex items-center justify-between border-b border-[#3E2F28] pb-4">
             <div className="flex items-center gap-3 text-[#C6934B]">
              <Wand2 size={24} />
              <h2 className="text-xl font-bold text-[#FDF0C9]">
                {editingShotId ? 'Edit Shot' : 'Prompt Constructor'}
              </h2>
             </div>
             {editingShotId && (
               <span className="text-xs bg-[#C6934B] text-[#15100E] px-2 py-1 rounded font-bold uppercase animate-pulse">
                 Editing Mode
               </span>
             )}
          </div>

          {/* 1. ENVIRONMENT FIELD */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs uppercase tracking-wider text-[#8C7A70] font-bold">1. Environment, Location & Year</label>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEnvPresetsOpen(!isEnvPresetsOpen)}
                  className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded transition-colors ${isEnvPresetsOpen ? 'bg-[#C6934B] text-[#15100E]' : 'bg-[#2A1F1B] text-[#C6934B] border border-[#3E2F28]'}`}
                >
                  <MapPin size={12} />
                  Presets
                  {isEnvPresetsOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </button>

                {!editingShotId && (
                  <button 
                    onClick={() => setLockEnv(!lockEnv)}
                    className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded transition-colors ${lockEnv ? 'bg-[#C6934B]/20 text-[#C6934B]' : 'text-[#5D4E45] hover:text-[#8C7A70]'}`}
                    title="Lock to reuse for next shot"
                  >
                    {lockEnv ? <Lock size={12} /> : <Unlock size={12} />}
                    {lockEnv ? 'LOCKED' : 'Reuse'}
                  </button>
                )}
              </div>
            </div>

            {/* ENVIRONMENT PRESETS PANEL */}
            {isEnvPresetsOpen && (
              <div className="bg-[#15100E] border border-[#3E2F28] rounded-xl mb-2 animate-in slide-in-from-top-2 overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-[#3E2F28]">
                  <button 
                    onClick={() => setEnvCategory('real')}
                    className={`flex-1 py-2 text-xs font-bold flex items-center justify-center gap-2 transition-colors ${envCategory === 'real' ? 'bg-[#2A1F1B] text-[#C6934B]' : 'text-[#5D4E45] hover:text-[#8C7A70]'}`}
                  >
                    <Globe size={12} />
                    Non-Fiction / Real
                  </button>
                  <div className="w-px bg-[#3E2F28]"></div>
                  <button 
                    onClick={() => setEnvCategory('fiction')}
                    className={`flex-1 py-2 text-xs font-bold flex items-center justify-center gap-2 transition-colors ${envCategory === 'fiction' ? 'bg-[#2A1F1B] text-[#C6934B]' : 'text-[#5D4E45] hover:text-[#8C7A70]'}`}
                  >
                    <Sparkles size={12} />
                    Fictional / Story
                  </button>
                </div>

                <div className="p-3 max-h-64 overflow-y-auto custom-scrollbar">
                   {currentEnvPresets.map((preset, idx) => (
                     <button
                       key={idx}
                       onClick={() => {
                          setEnvInput(preset.value);
                       }}
                       className="w-full text-left p-2 rounded-lg border border-[#3E2F28] bg-[#0A0806]/50 hover:bg-[#2A1F1B] hover:border-[#C6934B]/50 transition-all mb-1 last:mb-0 group"
                     >
                       <div className="text-xs font-bold text-[#FDF0C9] group-hover:text-[#C6934B]">{preset.title}</div>
                       <div className="text-[10px] text-[#8C7A70] leading-tight mt-1 line-clamp-1">{preset.value}</div>
                     </button>
                   ))}
                </div>
              </div>
            )}

            <textarea
              value={envInput}
              onChange={(e) => setEnvInput(e.target.value)}
              placeholder="e.g. 2095, Hart Plaza, Detroit. Wide concrete plaza, distant skyline, river nearby..."
              className={`w-full h-24 bg-[#0A0806]/60 border ${lockEnv ? 'border-[#C6934B]/50' : 'border-[#3E2F28]'} text-[#FDF0C9] px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#C6934B] outline-none leading-relaxed resize-none transition-colors`}
            />
          </div>

          {/* 2. ACTION FIELD */}
          <div className="space-y-2">
             <div className="flex justify-between items-center">
               <label className="text-xs uppercase tracking-wider text-[#8C7A70] font-bold">2. Action, Subjects & Dialogue</label>
               <button 
                  onClick={loadSampleScene}
                  disabled={actionInput.length > 0}
                  className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded transition-colors border border-transparent 
                    ${actionInput.length > 0 
                      ? 'text-[#5D4E45] cursor-not-allowed opacity-50' 
                      : 'text-[#C6934B] hover:bg-[#2A1F1B] hover:border-[#3E2F28] cursor-pointer'}`
                  }
                  title={actionInput.length > 0 ? "Clear action field to load sample" : "Load a complex sample scene with dialogue"}
                >
                  <MessageSquareQuote size={12} />
                  Load Sample Scene
                </button>
             </div>
             
             {/* Character Palette */}
             <div className="flex flex-wrap gap-2 mb-2 p-3 bg-[#15100E]/50 border border-[#3E2F28] rounded-lg">
                <span className="text-xs font-bold text-[#5D4E45] uppercase flex items-center mr-2">
                  <Plus size={12} className="mr-1"/> Add Cast:
                </span>
                {globalCharacters.length === 0 && <span className="text-xs text-[#5D4E45] italic">No characters created. Go to Studio Cast to add them.</span>}
                {globalCharacters.map(char => (
                   <button
                     key={char.id}
                     onClick={() => insertCharacter(char)}
                     className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#3E2F28] hover:border-[#C6934B] bg-[#2A1F1B] hover:bg-[#3E2F28] transition-all group active:scale-95`}
                   >
                     <div className={`w-2 h-2 rounded-full ${char.color}`}></div>
                     <span className="text-xs font-bold text-[#8C7A70] group-hover:text-[#FDF0C9]">{char.name}</span>
                   </button>
                 ))}
             </div>

            <textarea
              value={actionInput}
              onChange={(e) => setActionInput(e.target.value)}
              placeholder='e.g. [Detective K] walks slowly towards the camera. He says "Wait!", looking over his shoulder...'
              className="w-full h-32 bg-[#0A0806]/60 border border-[#3E2F28] text-[#FDF0C9] px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#C6934B] outline-none leading-relaxed resize-none"
            />
          </div>

          {/* 3. CAMERA FIELD */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs uppercase tracking-wider text-[#8C7A70] font-bold">3. Camera & Lens</label>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsLensKitOpen(!isLensKitOpen)}
                  className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded transition-colors ${isLensKitOpen ? 'bg-[#C6934B] text-[#15100E]' : 'bg-[#2A1F1B] text-[#C6934B] border border-[#3E2F28]'}`}
                >
                  <Aperture size={12} />
                  Lens Kit
                  {isLensKitOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </button>

                {!editingShotId && (
                  <button 
                    onClick={() => setLockCamera(!lockCamera)}
                    className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded transition-colors ${lockCamera ? 'bg-[#C6934B]/20 text-[#C6934B]' : 'text-[#5D4E45] hover:text-[#8C7A70]'}`}
                    title="Lock to reuse for next shot"
                  >
                    {lockCamera ? <Lock size={12} /> : <Unlock size={12} />}
                    {lockCamera ? 'LOCKED' : 'Reuse'}
                  </button>
                )}
              </div>
            </div>

            {/* LENS KIT PANEL */}
            {isLensKitOpen && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-3 bg-[#15100E] border border-[#3E2F28] rounded-xl mb-2 animate-in slide-in-from-top-2 max-h-96 overflow-y-auto custom-scrollbar">
                 {CAMERA_PRESETS.map(preset => {
                   const isExp = preset.id.startsWith('exp');
                   return (
                   <button
                     key={preset.id}
                     onClick={() => {
                        setCameraInput(preset.value);
                     }}
                     className={`text-left p-2 rounded-lg border transition-all group ${
                        isExp 
                          ? 'bg-[#2A1F1B]/80 border-[#C6934B]/30 hover:bg-[#3E2F28] hover:border-[#C6934B]' 
                          : 'bg-[#0A0806]/50 border-[#3E2F28] hover:bg-[#2A1F1B] hover:border-[#C6934B]/50'
                     }`}
                   >
                     <div className={`text-xs font-bold ${isExp ? 'text-[#C6934B]' : 'text-[#FDF0C9]'} group-hover:text-[#C6934B]`}>{preset.label}</div>
                     <div className="text-[10px] text-[#8C7A70] leading-tight mt-1">{preset.desc}</div>
                   </button>
                   );
                 })}
              </div>
            )}

            <input
              type="text"
              value={cameraInput}
              onChange={(e) => setCameraInput(e.target.value)}
              placeholder="e.g. Low angle, 35mm lens, dolly zoom, shallow depth of field"
              className={`w-full bg-[#0A0806]/60 border ${lockCamera ? 'border-[#C6934B]/50' : 'border-[#3E2F28]'} text-[#FDF0C9] px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#C6934B] outline-none`}
            />
          </div>

          {/* LIVE PREVIEW */}
          <div className="bg-[#0A0806] rounded-lg p-4 border border-[#3E2F28]/50">
             <div className="flex items-center gap-2 mb-2 text-[#5D4E45]">
               <Eye size={14} />
               <span className="text-xs font-bold uppercase">Prompt Preview (Expanded)</span>
             </div>
             <p className="text-sm text-[#8C7A70] italic leading-relaxed max-h-32 overflow-y-auto custom-scrollbar">
               {project.cinematicVibe ? <span className="text-[#C6934B] opacity-70">[{project.cinematicVibe}]</span> : null}
               {' '}
               {combinedPrompt || "Complete the fields above to see the final prompt..."}
             </p>
          </div>

          {/* ACTION BAR */}
          <div className="flex flex-col gap-2 pt-2">
             <div className="flex items-center gap-2 mb-2">
               <label className={`flex items-center gap-3 cursor-pointer group px-3 py-2 rounded-lg border transition-colors w-full ${isContinuation ? 'bg-[#2A1F1B] border-[#C6934B]' : 'bg-[#15100E] border-[#3E2F28] hover:border-[#5D4E45]'}`}>
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isContinuation ? 'bg-[#C6934B] border-[#C6934B]' : 'border-[#5D4E45] bg-[#15100E]'}`}>
                  {isContinuation && <CheckIcon />}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={isContinuation}
                  onChange={() => setIsContinuation(!isContinuation)}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="block text-sm font-bold text-[#FDF0C9]">Continuity Mode</span>
                    {isContinuation && <Link size={14} className="text-[#C6934B]"/>}
                  </div>
                  <span className="text-xs text-[#8C7A70]">
                    {isContinuation ? "Auto-fills Env & Cam from previous shot." : "New shot with unique environment."}
                  </span>
                </div>
              </label>
            </div>

            <div className="flex gap-2">
              {editingShotId && (
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 bg-[#2A1F1B] hover:bg-[#3E2F28] text-[#8C7A70] py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-[#3E2F28]"
                >
                  <XCircle size={20} />
                  Cancel
                </button>
              )}
              
              <button
                onClick={handleSaveShot}
                disabled={!combinedPrompt}
                className={`flex-[2] py-3 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed ${editingShotId ? 'bg-[#8C7A70] text-[#15100E] hover:bg-[#FDF0C9]' : 'bg-[#C6934B] hover:bg-[#B5823A] text-[#15100E] shadow-[#C6934B]/20'}`}
              >
                {editingShotId ? <Save size={24} /> : <Plus size={24} />}
                {editingShotId ? 'Update Shot' : 'Add Shot'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Sequence List */}
      <div className="lg:col-span-5 flex flex-col h-full min-h-[500px]">
        <div className="bg-[#15100E]/80 backdrop-blur-md border border-[#3E2F28] rounded-xl p-6 flex-grow flex flex-col shadow-xl">
           <div className="flex items-center justify-between mb-4 border-b border-[#3E2F28] pb-4">
            <div className="flex items-center gap-3 text-[#C6934B]">
              <Film size={24} />
              <h2 className="text-xl font-bold text-[#FDF0C9]">Shot Sequence ({project.shots.length})</h2>
            </div>
            <button 
              onClick={() => onUpdateProject({...project, shots: [], lastModified: Date.now()})}
              className="text-xs text-[#8A1C1C] hover:text-[#B91C1C]"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-4 overflow-y-auto pr-2 flex-grow custom-scrollbar max-h-[700px]">
            {project.shots.length === 0 && (
              <div className="text-center py-10 text-[#5D4E45]">
                <Layers className="mx-auto mb-2 opacity-50" size={32} />
                <p>No shots generated yet.</p>
              </div>
            )}

            {project.shots.map((shot, idx) => (
              <div key={shot.id} className="relative pl-6 pb-6 border-l-2 border-[#3E2F28] last:border-0 last:pb-0">
                {/* Timeline Node */}
                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 z-10 ${shot.isContinuation ? 'bg-[#C6934B] border-[#C6934B]' : 'bg-[#2A1F1B] border-[#5D4E45]'}`}></div>
                
                {/* Continuity Link Visual */}
                {shot.isContinuation && (
                  <div className="absolute -left-[24px] top-[-20px] h-[30px] w-[30px] flex items-center justify-center">
                    <Link size={14} className="text-[#C6934B] bg-[#15100E]" />
                  </div>
                )}

                <div 
                  className={`bg-[#0A0806]/80 p-4 rounded-lg border transition-all group cursor-pointer relative ${
                    editingShotId === shot.id 
                      ? 'border-[#C6934B] ring-1 ring-[#C6934B] bg-[#2A1F1B]/50' 
                      : 'border-[#3E2F28] hover:border-[#C6934B]/50'
                  }`}
                  onClick={() => handleEditShot(shot)}
                  title="Click to Edit"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-[#8C7A70] uppercase tracking-widest flex items-center gap-2">
                      Shot {idx + 1} {shot.isContinuation && <span className="bg-[#C6934B] text-[#15100E] px-1 rounded text-[10px] font-bold flex items-center gap-1"><Link size={8}/> CONT</span>}
                    </span>
                    
                    <div className="flex gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity bg-[#15100E]/80 rounded p-1">
                      {/* Reordering Controls */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); moveShot(idx, 'up'); }}
                        disabled={idx === 0}
                        className="p-1 text-[#8C7A70] hover:text-[#FDF0C9] disabled:opacity-20 hover:bg-[#2A1F1B] rounded"
                      >
                        <MoveUp size={14} />
                      </button>
                      <button 
                         onClick={(e) => { e.stopPropagation(); moveShot(idx, 'down'); }}
                         disabled={idx === project.shots.length - 1}
                         className="p-1 text-[#8C7A70] hover:text-[#FDF0C9] disabled:opacity-20 hover:bg-[#2A1F1B] rounded"
                      >
                        <MoveDown size={14} />
                      </button>
                      <div className="w-px bg-[#3E2F28] mx-1"></div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteShot(shot.id); }}
                        className="p-1 text-[#8A1C1C] hover:bg-[#8A1C1C]/20 rounded"
                      >
                        <Eraser size={14} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Granular Display */}
                  <div className="space-y-2 text-sm">
                    {shot.environment && (
                       <div className="flex gap-2">
                         <span className="text-[#5D4E45] text-xs font-bold uppercase min-w-[30px]">Env</span>
                         <span className="text-[#E2D5C5] opacity-80 line-clamp-1">{shot.environment}</span>
                       </div>
                    )}
                    <div className="flex gap-2">
                       <span className={`text-xs font-bold uppercase min-w-[30px] ${!shot.action ? 'text-[#8A1C1C]' : 'text-[#C6934B]'}`}>Act</span>
                       <span className="text-[#E2D5C5] line-clamp-2">{shot.action || <span className="italic opacity-50">No action defined</span>}</span>
                    </div>
                     {shot.camera && (
                       <div className="flex gap-2">
                         <span className="text-[#5D4E45] text-xs font-bold uppercase min-w-[30px]">Cam</span>
                         <span className="text-[#E2D5C5] opacity-80 line-clamp-1">{shot.camera}</span>
                       </div>
                    )}
                  </div>

                  {editingShotId === shot.id && (
                    <div className="absolute inset-0 bg-[#C6934B]/10 rounded-lg pointer-events-none animate-pulse border border-[#C6934B]/30"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#15100E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);