
import React, { useState, useMemo } from 'react';
import { Character, Shot, Project, Language, translations } from '../types';
import { GoogleGenAI } from "@google/genai";
import { Film, Wand2, Trash2, MoveDown, MoveUp, Aperture, MapPin, Sparkles, Loader2, CheckCircle2, Camera, RefreshCw, Clapperboard, Zap, Globe, BookOpen, Edit2, MessageSquare, History, FlaskConical, ChevronRight, AlertCircle } from 'lucide-react';

interface ShotGeneratorProps {
  language: Language;
  project: Project;
  globalCharacters: Character[];
  isStudioBusy: boolean;
  setIsStudioBusy: (busy: boolean) => void;
  onUpdateProject: (updater: Project | ((prev: Project) => Project)) => void;
  onNavigateToExport: () => void;
  onApiError?: (error: any, context?: string) => void;
}

const LENS_PACKS = {
  regular: [
    { label: '1940s Silver Noir', desc: 'Academy 1.37:1, soft glamour.', dna: '1940s cinematography, Academy ratio 1.37:1, soft focus glamour, deep depth of field, black and white film stock, nitrate film texture, harsh key light, soft fill.' },
    { label: '1950s VistaScope', desc: 'CinemaScope, blue flares.', dna: '1950s Technicolor, CinemaScope, 2.35:1 aspect ratio, anamorphic lens distortion, oval bokeh, vibrant primary colors, wide angle epic, detailed matte painting background.' },
    { label: '1960s Spaghetti', desc: 'Snap zooms, warm palette.', dna: '1960s spaghetti western style, Techniscope 2-perf, warm Kodak film stock, film grain, rapid zoom, organic handheld camera, dusty atmosphere, high noon lighting.' },
    { label: '1970s Panavision', desc: 'Pushed film, moody greens.', dna: '1970s thriller aesthetic, Panavision C-series, natural lighting, pushed film stock, visible grain, desaturated greens, moody atmosphere, street photography style.' },
    { label: '1980s Neon Action', desc: 'Slick E-Series flares.', dna: '1980s action movie, Panavision E-series anamorphic, horizontal blue lens flare, high contrast, neon lighting, wet streets, sharp focus, metallic color grading.' },
    { label: '1990s Super 35', desc: 'Glossy music video style.', dna: '1990s music video aesthetic, Super 35mm film, Zeiss Super Speed lenses, high saturation, fish-eye distortion, gloss lighting, dynamic range, crisp texture.' },
    { label: '2000s Digital Grade', desc: 'Teal & Orange, sharp.', dna: '2000s blockbuster, digital intermediate color grade, teal and orange contrast, crushed blacks, hyper-sharp, Sony CineAlta texture, high shutter speed action.' },
    { label: '2010s Alexa Large', desc: 'Creamy bokeh, vintage glass.', dna: '2010s Arri Alexa look, large format cinematography, extremely shallow depth of field, creamy bokeh, Canon K35 vintage lens, soft natural light, pristine resolution.' },
    { label: '2020s Virtual Vol.', desc: 'Immersive, 8K resolution.', dna: '2020s unreal engine style, virtual production volume, Arri Signature Prime, 8K resolution, ray-traced lighting, perfect sharpness, zero distortion, hyper-detailed textures.' }
  ],
  experimental: [
    { label: 'Celluloid Canvas', desc: 'Hand-painted animation.', dna: 'hand-painted 16mm film, direct animation, celluloid scratches, emulsion decay, mothlight texture, rapid strobe montage, abstract light leaks, organic texture overlay, non-narrative chaos.' },
    { label: 'Static Factory', desc: 'Minimalist voyeurism.', dna: '16mm Bolex camera, high contrast black and white, static framing, no camera movement, raw studio lighting, film grain, minimalist portrait, voyeuristic stare, Andy Warhol style.' },
    { label: 'Signal Interference', desc: 'Analog glitched CRT.', dna: 'analog video feedback, Nam June Paik style, CRT monitor scanlines, magnetic distortion, VHS tracking error, saturated RGB noise, video synthesizer aesthetic, glitch art.' },
    { label: 'The Uncanny Stage', desc: 'Surreal rear projection.', dna: 'staged photography, rear projection background, Cindy Sherman aesthetic, dramatic noir lighting, B-movie melodrama, uncanny valley, psychological surrealism, deliberate artifice, dutch angle.' }
  ]
};

export const ShotGenerator: React.FC<ShotGeneratorProps> = ({ language, project, globalCharacters, isStudioBusy, setIsStudioBusy, onUpdateProject, onNavigateToExport, onApiError }) => {
  const [envInput, setEnvInput] = useState('');
  const [actionInput, setActionInput] = useState('');
  const [cameraInput, setCameraInput] = useState('');
  
  const [activeGeneratingShotId, setActiveGeneratingShotId] = useState<string | null>(null);
  const [activeGeneratingType, setActiveGeneratingType] = useState<'start' | 'end' | null>(null);
  
  const [isBatchingType, setIsBatchingType] = useState<'start' | 'end' | null>(null);
  const [isSynthesizingText, setIsSynthesizingText] = useState<'env' | 'action' | null>(null);
  const [editingShotId, setEditingShotId] = useState<string | null>(null);
  const [activeLensPack, setActiveLensPack] = useState<'regular' | 'experimental'>('regular');

  const t = useMemo(() => translations[language], [language]);

  const handleSynthesizeText = async (field: 'env' | 'action', mode: 'realistic' | 'fictional') => {
    setIsSynthesizingText(field);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const currentVibe = project.cinematicVibe || "Cinematic series";
      
      const prompt = field === 'env' 
        ? `TASK: Write a ${mode} Environment DNA description for a cinematic scene.
           STYLE VIBE: ${currentVibe}.
           FOCUS: Spatial depth, atmospheric conditions, specific lighting temperature, and textures.
           OUTPUT: One short, evocative paragraph of description. No titles or meta-talk.`
        : `TASK: Write a ${mode} Action & Dialogue beat.
           STYLE VIBE: ${currentVibe}.
           CAST: ${globalCharacters.map(c => `[${c.name}]`).join(', ')}.
           REQUIREMENT: Use brackets for names like [Name]. Include at least one line of dialogue like [Name]: "Dialogue".
           OUTPUT: One short narrative beat.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      const result = response.text.trim();
      if (field === 'env') setEnvInput(result);
      else setActionInput(result);
    } catch (err) {
      if (onApiError) onApiError(err, "Script Synthesis Error");
    } finally {
      setIsSynthesizingText(null);
    }
  };

  const resolveActionPrompt = (rawAction: string) => {
    let processed = rawAction;
    globalCharacters.forEach(char => {
      const tag = `[${char.name}]`;
      if (processed.includes(tag)) {
        processed = processed.split(tag).join(`(SUBJECT: ${char.name} -- ${char.description})`);
      }
    });
    return processed;
  };

  const handleSingleSynthesize = async (shot: Shot, type: 'start' | 'end') => {
    if (isStudioBusy) return;
    setIsStudioBusy(true);
    setActiveGeneratingShotId(shot.id);
    setActiveGeneratingType(type);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const frameData = await generateProductionFrame(shot, type, ai);
      if (frameData) {
        onUpdateProject(prev => ({
          ...prev,
          shots: prev.shots.map(s => 
            s.id === shot.id 
              ? { ...s, [type === 'start' ? 'startingFrame' : 'endingFrame']: frameData } 
              : s
          )
        }));
      }
    } catch (err) {
      if (onApiError) onApiError(err, "Frame Synthesis Error");
    } finally {
      setIsStudioBusy(false);
      setActiveGeneratingShotId(null);
      setActiveGeneratingType(null);
    }
  };

  const generateProductionFrame = async (shot: Shot, type: 'start' | 'end', ai: any) => {
    try {
      const involvedChars = globalCharacters.filter(c => shot.charactersInvolved.includes(c.id));
      const parts: any[] = [
        { text: `TASK: Generate a high-fidelity cinematic ${type === 'start' ? 'STARTING' : 'ENDING'} frame ONLY.
        IMPORTANT: This is the ${type.toUpperCase()} frame of the shot.
        CONTEXT: Shot ${shot.sequenceOrder} of "${project.title}".
        OPTICS: ${shot.camera}
        ACTION: ${shot.action}
        ENVIRONMENT: ${shot.environment}
        VIBE: ${project.cinematicVibe}` }
      ];
      
      involvedChars.forEach(char => {
        if (char.visualAnchor) {
          parts.push({ text: `REFERENCE FOR [${char.name}]:` });
          parts.push({
            inlineData: { data: char.visualAnchor.split(',')[1], mimeType: 'image/png' }
          });
        }
      });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    } catch (err) {
      throw err;
    }
    return null;
  };

  const batchSynthesize = async (type: 'start' | 'end') => {
    if (isStudioBusy) return;
    setIsStudioBusy(true);
    setIsBatchingType(type);
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const currentShots = [...project.shots];

    for (const shot of currentShots) {
      setActiveGeneratingShotId(shot.id);
      setActiveGeneratingType(type);

      try {
        const frameData = await generateProductionFrame(shot, type, ai);
        if (frameData) {
          onUpdateProject(prev => ({
            ...prev,
            shots: prev.shots.map(s => s.id === shot.id ? { ...s, [type === 'start' ? 'startingFrame' : 'endingFrame']: frameData } : s)
          }));
        }
      } catch (err) {
        console.error("Batch error for shot:", shot.id, err);
      } finally {
        setActiveGeneratingShotId(null);
        setActiveGeneratingType(null);
      }
    }
    
    setIsStudioBusy(false);
    setIsBatchingType(null);
  };

  const handleSaveShot = () => {
    if (!actionInput) return;
    const resolvedAction = resolveActionPrompt(actionInput);
    const finalPrompt = [cameraInput, project.cinematicVibe, resolvedAction, envInput].filter(Boolean).join('. ');
    const usedCharIds = globalCharacters.filter(c => actionInput.includes(`[${c.name}]`)).map(c => c.id);

    if (editingShotId) {
      onUpdateProject(prev => ({
        ...prev,
        shots: prev.shots.map(s => s.id === editingShotId ? {
          ...s, environment: envInput, action: actionInput, camera: cameraInput, actionPrompt: finalPrompt, charactersInvolved: usedCharIds
        } : s)
      }));
      setEditingShotId(null);
    } else {
      const newShot: Shot = {
        id: crypto.randomUUID(),
        sequenceOrder: project.shots.length + 1,
        environment: envInput,
        action: actionInput,
        camera: cameraInput,
        actionPrompt: finalPrompt,
        charactersInvolved: usedCharIds,
        model: 'veo-3.1-generate-preview',
        aspectRatio: '16:9',
        resolution: '1080p',
        isContinuation: project.shots.length > 0
      };
      onUpdateProject(prev => ({
        ...prev,
        shots: [...prev.shots, newShot]
      }));
    }
    setActionInput(''); setEnvInput(''); setCameraInput('');
  };

  const moveShot = (idx: number, direction: 'up' | 'down') => {
    onUpdateProject(prev => {
      const newShots = [...prev.shots];
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= newShots.length) return prev;
      [newShots[idx], newShots[targetIdx]] = [newShots[targetIdx], newShots[idx]];
      const reordered = newShots.map((s, i) => ({ ...s, sequenceOrder: i + 1 }));
      return { ...prev, shots: reordered };
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-20 animate-in fade-in duration-1000">
      <div className="lg:col-span-6 space-y-8">
        <div className="bg-[#100C0A]/95 border-2 border-[#3E2F28] p-10 rounded-[3.5rem] shadow-2xl space-y-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
            <Clapperboard size={120} />
          </div>
          
          <div className="flex items-center justify-between border-b border-[#3E2F28] pb-6 relative z-10">
            <div className="flex items-center gap-4 text-[#C6934B]">
              <Wand2 size={32} />
              <h2 className="text-3xl font-black text-[#FDF0C9] italic uppercase tracking-tighter">{t.shot_architect}</h2>
            </div>
          </div>
          
          {/* I. ENVIRONMENT DNA */}
          <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black uppercase text-[#8C7A70] tracking-[0.4em] flex items-center gap-2">
                <MapPin size={12} className="text-[#C6934B]" /> I. Environment DNA
              </label>
              <div className="flex gap-2">
                <button onClick={() => handleSynthesizeText('env', 'realistic')} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black uppercase text-[#8C7A70] hover:text-[#C6934B] hover:border-[#C6934B]/30 flex items-center gap-1.5 transition-all">
                  <Globe size={10} /> Realistic
                </button>
                <button onClick={() => handleSynthesizeText('env', 'fictional')} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black uppercase text-[#8C7A70] hover:text-[#C6934B] hover:border-[#C6934B]/30 flex items-center gap-1.5 transition-all">
                  <BookOpen size={10} /> Fictional
                </button>
              </div>
            </div>
            <div className="relative">
              {isSynthesizingText === 'env' && <div className="absolute inset-0 bg-black/60 rounded-[2rem] flex items-center justify-center z-10 backdrop-blur-sm"><Loader2 className="animate-spin text-[#C6934B]" /></div>}
              <textarea value={envInput} onChange={e => setEnvInput(e.target.value)} placeholder="Atmospheric mood, lighting, spatial DNA..." className="w-full h-24 bg-[#15100E] border border-[#3E2F28] p-6 rounded-[2rem] text-white outline-none focus:ring-2 focus:ring-[#C6934B] resize-none transition-all placeholder:text-[#3E2F28]" />
            </div>
          </div>

          {/* II. ACTION / CAST & DIALOGUE */}
          <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black uppercase text-[#8C7A70] tracking-[0.4em] flex items-center gap-2">
                <MessageSquare size={12} className="text-[#C6934B]" /> II. Action / {t.cast} & Dialogue
              </label>
              <div className="flex gap-2">
                <button onClick={() => handleSynthesizeText('action', 'realistic')} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black uppercase text-[#8C7A70] hover:text-[#C6934B] hover:border-[#C6934B]/30 flex items-center gap-1.5 transition-all">
                  <Globe size={10} /> Realistic
                </button>
                <button onClick={() => handleSynthesizeText('action', 'fictional')} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black uppercase text-[#8C7A70] hover:text-[#C6934B] hover:border-[#C6934B]/30 flex items-center gap-1.5 transition-all">
                  <BookOpen size={10} /> Fictional
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 p-4 bg-black/40 rounded-3xl border border-white/5">
                {globalCharacters.map(c => (
                  <button key={c.id} onClick={() => setActionInput(p => p + ` [${c.name}] `)} className="px-4 py-2 rounded-xl border border-[#3E2F28] text-[10px] font-black uppercase text-[#8C7A70] hover:border-[#C6934B] hover:text-[#FDF0C9] transition-all flex items-center gap-2 group/char">
                    <div className={`w-2 h-2 rounded-full ${c.color}`} /> {c.name}
                  </button>
                ))}
            </div>
            <div className="relative">
              {isSynthesizingText === 'action' && <div className="absolute inset-0 bg-black/60 rounded-[2.5rem] flex items-center justify-center z-10 backdrop-blur-sm"><Loader2 className="animate-spin text-[#C6934B]" /></div>}
              <textarea value={actionInput} onChange={e => setActionInput(e.target.value)} placeholder="Character movement and dialogue..." className="w-full h-36 bg-[#15100E] border border-[#3E2F28] p-6 rounded-[2.5rem] text-white outline-none focus:ring-2 focus:ring-[#C6934B] resize-none transition-all placeholder:text-[#3E2F28]" />
            </div>
          </div>

          {/* III. OPTIC SIMULATION & NESTED LENS PACKS */}
          <div className="space-y-6 relative z-10">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black uppercase text-[#8C7A70] tracking-[0.4em] flex items-center gap-2">
                <Aperture size={12} className="text-[#C6934B]" /> III. Optic Simulation
              </label>
              <div className="flex bg-[#15100E] p-1 rounded-xl border border-[#3E2F28]">
                <button onClick={() => setActiveLensPack('regular')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all flex items-center gap-2 ${activeLensPack === 'regular' ? 'bg-[#C6934B] text-[#15100E]' : 'text-[#5D4E45] hover:text-[#8C7A70]'}`}>
                  <History size={12} /> Cinematic
                </button>
                <button onClick={() => setActiveLensPack('experimental')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all flex items-center gap-2 ${activeLensPack === 'experimental' ? 'bg-red-900 text-white' : 'text-[#5D4E45] hover:text-[#8C7A70]'}`}>
                  <FlaskConical size={12} /> Avant-Garde
                </button>
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
              {LENS_PACKS[activeLensPack].map((lens, i) => (
                <button key={i} onClick={() => setCameraInput(lens.dna)} className="flex-shrink-0 w-44 snap-start group flex flex-col items-start p-5 bg-[#15100E] border border-[#3E2F28] rounded-[2rem] hover:border-[#C6934B] transition-all text-left">
                  <span className="text-[10px] font-black uppercase text-[#C6934B] leading-tight mb-2 flex items-center justify-between w-full">
                    {lens.label}
                    <ChevronRight size={10} className={`opacity-40 group-hover:translate-x-1 transition-transform ${language === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                  </span>
                  <span className="text-[8px] text-[#5D4E45] font-bold leading-tight line-clamp-2 group-hover:text-[#8C7A70]">{lens.desc}</span>
                </button>
              ))}
            </div>

            <input value={cameraInput} onChange={e => setCameraInput(e.target.value)} placeholder="Lens DNA, focal length, film stock..." className="w-full bg-[#15100E] border-2 border-[#3E2F28] p-6 rounded-[2.5rem] text-white outline-none focus:border-[#C6934B] font-black" />
          </div>

          <button onClick={handleSaveShot} disabled={!actionInput} className="w-full bg-gradient-to-r from-[#C6934B] to-[#FDF0C9] text-[#15100E] py-8 rounded-[3rem] font-black uppercase text-lg tracking-[0.5em] hover:scale-[1.02] transition-all shadow-2xl active:scale-95 disabled:opacity-30">
            {editingShotId ? 'Sync Shot Edit' : 'Add to Production Timeline'}
          </button>
        </div>
      </div>

      <div className="lg:col-span-6 space-y-6">
        <div className="flex justify-between items-center px-4">
          <div>
            <h3 className="text-2xl font-black text-[#FDF0C9] italic uppercase tracking-tighter flex items-center gap-3">
              <Film className="text-[#C6934B]" /> {t.timeline}
            </h3>
            <p className="text-[9px] font-bold text-[#5D4E45] uppercase tracking-widest mt-1">Sequence management & continuity</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => batchSynthesize('start')} 
              disabled={isStudioBusy || project.shots.length === 0} 
              className="px-4 py-2 bg-[#C6934B]/10 border border-[#C6934B]/30 rounded-xl text-[9px] font-black uppercase text-[#C6934B] hover:bg-[#C6934B]/20 flex items-center gap-2 disabled:opacity-30"
            >
              {isBatchingType === 'start' ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />} Batch All Starts
            </button>
            <button 
              onClick={() => batchSynthesize('end')} 
              disabled={isStudioBusy || project.shots.length === 0} 
              className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[9px] font-black uppercase text-emerald-500 hover:bg-emerald-500/20 flex items-center gap-2 disabled:opacity-30"
            >
              {isBatchingType === 'end' ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Batch All Ends
            </button>
          </div>
        </div>
        
        {isStudioBusy && !activeGeneratingShotId && (
          <div className="mx-4 flex items-center gap-3 p-4 bg-[#C6934B]/5 border border-[#C6934B]/20 rounded-2xl text-[#C6934B]">
            <AlertCircle size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">{t.processing} Sequential Frames.</span>
          </div>
        )}
        
        <div className="space-y-6 overflow-y-auto max-h-[85vh] pr-4 custom-scrollbar pb-20">
          {project.shots.map((shot, idx) => (
            <div key={shot.id} className="bg-[#100C0A]/90 border border-[#3E2F28] rounded-[3.5rem] p-8 relative group hover:border-[#C6934B]/40 transition-all shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-black text-[#C6934B] italic tracking-tighter">{shot.sequenceOrder}.</span>
                  <span className="text-[10px] font-black uppercase text-[#5D4E45] tracking-[0.2em]">Shot Assembly Node</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingShotId(shot.id); setEnvInput(shot.environment || ''); setActionInput(shot.action || ''); setCameraInput(shot.camera || ''); }} className="p-3 bg-[#15100E] rounded-xl text-[#5D4E45] border border-[#3E2F28] hover:text-[#C6934B]"><Edit2 size={16} /></button>
                  <button onClick={() => moveShot(idx, 'up')} disabled={idx === 0} className="p-3 bg-[#15100E] rounded-xl text-[#5D4E45] border border-[#3E2F28] hover:text-[#C6934B] disabled:opacity-20"><MoveUp size={16} /></button>
                  <button onClick={() => moveShot(idx, 'down')} disabled={idx === project.shots.length - 1} className="p-3 bg-[#15100E] rounded-xl text-[#5D4E45] border border-[#3E2F28] hover:text-[#C6934B] disabled:opacity-20"><MoveDown size={16} /></button>
                  <button onClick={() => onUpdateProject(prev => ({ ...prev, shots: prev.shots.filter(s => s.id !== shot.id).map((s, i) => ({...s, sequenceOrder: i+1})) }))} className="p-3 bg-red-500/10 rounded-xl text-red-900 border border-red-500/20 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* START FRAME (INDEPENDENT) */}
                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#5D4E45] px-2">Start Frame</span>
                  <div className={`relative aspect-video rounded-2xl overflow-hidden border-2 flex items-center justify-center group/frame transition-all ${activeGeneratingShotId === shot.id && activeGeneratingType === 'start' ? 'border-[#C6934B] bg-black/60 shadow-[0_0_20px_rgba(198,147,75,0.2)]' : 'border-[#3E2F28] bg-black/40'}`}>
                    {shot.startingFrame ? (
                      <>
                        <img src={shot.startingFrame} className="w-full h-full object-cover transition-transform duration-1000 group-hover/frame:scale-105" alt="Start Preview" />
                        <button 
                          onClick={() => handleSingleSynthesize(shot, 'start')} 
                          disabled={isStudioBusy}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/frame:opacity-100 transition-all disabled:hidden"
                        >
                          <RefreshCw size={24} className="text-white" />
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => handleSingleSynthesize(shot, 'start')} 
                        disabled={isStudioBusy} 
                        className="flex flex-col items-center gap-2 text-[#3E2F28] hover:text-[#C6934B] transition-all disabled:opacity-20"
                      >
                        {activeGeneratingShotId === shot.id && activeGeneratingType === 'start' ? <Loader2 size={24} className="animate-spin text-[#C6934B]" /> : <Camera size={24} />}
                        <span className="text-[8px] font-black uppercase">Synthesize Start</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* END FRAME (INDEPENDENT) */}
                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#5D4E45] px-2">End Frame (Opt)</span>
                  <div className={`relative aspect-video rounded-2xl overflow-hidden border-2 flex items-center justify-center group/frame transition-all ${activeGeneratingShotId === shot.id && activeGeneratingType === 'end' ? 'border-emerald-500 bg-black/60 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'border-[#3E2F28] bg-black/40'}`}>
                    {shot.endingFrame ? (
                      <>
                        <img src={shot.endingFrame} className="w-full h-full object-cover transition-transform duration-1000 group-hover/frame:scale-105" alt="End Preview" />
                        <button 
                          onClick={() => handleSingleSynthesize(shot, 'end')} 
                          disabled={isStudioBusy}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/frame:opacity-100 transition-all disabled:hidden"
                        >
                          <RefreshCw size={24} className="text-white" />
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => handleSingleSynthesize(shot, 'end')} 
                        disabled={isStudioBusy} 
                        className="flex flex-col items-center gap-2 text-[#3E2F28] hover:text-[#C6934B] transition-all disabled:opacity-20"
                      >
                        {activeGeneratingShotId === shot.id && activeGeneratingType === 'end' ? <Loader2 size={24} className="animate-spin text-emerald-500" /> : <Sparkles size={24} />}
                        <span className="text-[8px] font-black uppercase">Synthesize End</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                 <p className="text-[10px] text-[#8C7A70] italic leading-relaxed font-medium line-clamp-2 px-2">"{shot.action}"</p>
                 <div className="flex flex-wrap gap-1 mt-2">
                    {shot.charactersInvolved.map(id => {
                      const c = globalCharacters.find(char => char.id === id);
                      return c ? <div key={id} className={`w-1.5 h-3 rounded-full ${c.color}`} title={c.name} /> : null;
                    })}
                 </div>
              </div>
            </div>
          ))}
          
          {project.shots.length > 0 && (
            <button onClick={onNavigateToExport} className="w-full py-10 border-2 border-dashed border-[#3E2F28] rounded-[4rem] text-[#5D4E45] font-black uppercase text-xs tracking-[0.6em] hover:bg-white/5 hover:border-[#C6934B]/40 hover:text-[#C6934B] transition-all flex items-center justify-center gap-4 shadow-xl">
              <CheckCircle2 size={24} /> {t.export} Pack
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
