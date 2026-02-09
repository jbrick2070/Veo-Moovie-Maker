
import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Project, Character, Shot } from '../types';
import { Copy, FileText, List, Sparkles, ToggleLeft, ToggleRight, Loader2, ShieldCheck, ShieldAlert, VenetianMask, Zap, Download, Check, RefreshCw, Star } from 'lucide-react';
import { SAMPLE_PROJECT_ID } from '../App';

const extractJson = (text: string) => {
  try { return JSON.parse(text); } catch (e) {
    const match = text.match(/```json\s?([\s\S]*?)\s?```/) || text.match(/\[\s*\{[\s\S]*\}\s*\]/) || text.match(/\[[\s\S]*\]/);
    if (match) { try { return JSON.parse(match[1] || match[0]); } catch (innerE) { throw new Error("Malformed JSON."); } }
    throw new Error("No JSON found.");
  }
};

const SAMPLE_OPTIMIZED_PROMPTS = [
  "Low-angle wide shot, Kodak Vision3 5219 film stock, anamorphic lens flares, a massive organic stage shaped like a giant translucent ribcage pulsing with rhythmic light and holographic lungs inflating, deep bioluminescent forest setting at night, low-frequency bass hum and distant cheers audio, subsurface scattering on stage materials, high volumetric density fog.",
  "Close-up handheld shot, 24fps motion blur, rich shadows, a mime performer in translucent synth-skin conducting invisible sound waves that ripple the air, center stage surrounded by geometric laser beams, sharp synth stabs and rhythmic breathing audio, subsurface scattering on synthetic skin, volumetric light rays.",
  "Over-the-shoulder tracking shot, Kodak Vision3 5219, hyper-detailed environment, a crowd in bioluminescent attire swaying to a rhythmic tempo under a canopy of glowing vines, immersive electronic melody audio, volumetric density of dust and smoke catching the light, deep shadows and anamorphic artifacts.",
  "Extreme wide bird's-eye view, anamorphic flares, the entire festival site in a dark mountain valley, a massive burst of light and pressurized air erupting from the central 'Lung' stage, explosive melodic crescendo audio, high volumetric density in stage beams, hyper-realistic cinematic detail."
];

export const ExportView: React.FC<ExportViewProps> = ({ project, globalCharacters, onApiError }) => {
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'batch' | 'script'>('batch');
  const [isOptimized, setIsOptimized] = useState(project.id === SAMPLE_PROJECT_ID);
  const [optimizedPrompts, setOptimizedPrompts] = useState<string[] | null>(() => {
    if (project.id === SAMPLE_PROJECT_ID) {
      return SAMPLE_OPTIMIZED_PROMPTS;
    }
    return null;
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // Simple hash or timestamp to check if the project has changed since last optimization
  const projectVersion = useMemo(() => {
    return project.shots.map(s => s.id + s.action).join('');
  }, [project.shots]);

  const handleRunAIOptimization = async () => {
    if (!process.env.API_KEY) return;
    
    setIsGenerating(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Construct a prompt that feeds the AI the actual current shots
        const shotData = project.shots.map((s, i) => `SHOT ${i+1}: ${s.actionPrompt}`).join('\n');
        
        const systemMsg = `You are a world-class Cinematic Script Doctor for Google Veo 3. 
        Your goal is to "harden" raw user prompts into professional-grade AI video generation scripts.
        
        STRICT FORMULA: [Cinematography], [Subject Detail], [Dynamic Action], [Environment/Lighting], [Audio/Texture].
        
        PHYSICS KEYWORDS TO INJECT: Subsurface scattering, Volumetric density, Anamorphic flaring, 24fps motion blur, Kodak Vision3 5219 grain, Ray-traced reflections.
        
        CONTEXT:
        TITLE: ${project.title}
        VIBE: ${project.cinematicVibe}
        
        RAW SEQUENCE:
        ${shotData}
        
        OUTPUT: Return a JSON array of strings, one for each shot. NO PROSE.`;

        const result = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: systemMsg,
            config: { 
              maxOutputTokens: 8192, 
              responseMimeType: "application/json", 
              responseSchema: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              } 
            }
        });
        
        const cleaned = extractJson(result.text);
        setOptimizedPrompts(cleaned);
        setIsOptimized(true);
    } catch (err) { 
      onApiError(err); 
    } finally { 
      setIsGenerating(false); 
    }
  };

  const getPrompt = (shot: Shot, index: number) => {
    if (isOptimized && optimizedPrompts && optimizedPrompts[index]) {
      return optimizedPrompts[index];
    }
    return (project.cinematicVibe + ', ' + shot.actionPrompt);
  };

  const content = mode === 'script' 
    ? `PRODUCTION: ${project.title}\n\n` + project.shots.map((s, i) => `### SHOT ${i + 1}\n${getPrompt(s, i)}`).join('\n\n')
    : project.shots.map((s, i) => getPrompt(s, i)).join('\n\n');

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${project.title.replace(/\s+/g, '_')}_production_prompts.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-[#FDF0C9] italic tracking-tighter uppercase leading-none">Export Studio</h2>
          <p className="text-[10px] text-[#8C7A70] font-black uppercase tracking-[0.3em] mt-2 opacity-60">Finalize production prompts for Veo 3</p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          {/* REGEN BUTTON - STELLAR FORMATTING */}
          <button 
            onClick={handleRunAIOptimization}
            disabled={isGenerating}
            className={`flex items-center gap-3 px-8 py-3 rounded-2xl border transition-all font-black text-xs uppercase tracking-[0.2em] active:scale-95 disabled:opacity-50
              ${isGenerating ? 'bg-[#2A1F1B] border-[#3E2F28] text-[#5D4E45]' : 'bg-gradient-to-r from-[#C6934B] via-[#FDF0C9] to-[#C6934B] border-[#C6934B]/40 text-[#15100E] shadow-[0_10px_35px_rgba(198,147,75,0.3)] hover:shadow-[0_15px_50px_rgba(198,147,75,0.5)] hover:scale-105 active:brightness-125'}
            `}
          >
            {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Star size={20} className="fill-current drop-shadow-[0_0_8px_rgba(0,0,0,0.3)]" />}
            {isGenerating ? 'Processing Sequence...' : 'Regen Script from shots'}
          </button>

          <div className="flex items-center gap-4 bg-[#100C0A] border border-[#3E2F28] p-1.5 rounded-2xl">
            {/* Optimization Toggle - REFINED AS REQUESTED */}
            <button 
              onClick={() => setIsOptimized(!isOptimized)} 
              className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all border ${isOptimized ? 'bg-[#C6934B]/20 text-[#C6934B] border-[#C6934B]/30' : 'bg-transparent text-[#5D4E45] border-transparent hover:text-[#8C7A70]'}`}
            >
              <Sparkles size={16} />
              <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] font-black uppercase tracking-widest">{isOptimized ? 'AI OPTIMIZED' : 'STANDARD MODE'}</span>
                <span className="text-[7px] font-bold uppercase tracking-widest mt-0.5 text-[#C6934B]/80">(STRONGLY SUGGESTED)</span>
              </div>
            </button>

            {/* Batch/Script Mode Toggle */}
            <div className="flex items-center gap-1 bg-[#15100E] rounded-xl p-1 border border-[#3E2F28]">
              <button onClick={() => setMode('batch')} className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${mode === 'batch' ? 'bg-[#2A1F1B] text-[#FDF0C9] shadow-sm' : 'text-[#5D4E45] hover:text-[#8C7A70]'}`}>Batch</button>
              <button onClick={() => setMode('script')} className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${mode === 'script' ? 'bg-[#2A1F1B] text-[#FDF0C9] shadow-sm' : 'text-[#5D4E45] hover:text-[#8C7A70]'}`}>Script</button>
            </div>
          </div>
        </div>
      </div>

      <div className={`flex-grow bg-[#100C0A]/90 border rounded-[3rem] p-1 relative flex flex-col shadow-2xl transition-all duration-500 overflow-hidden ${isOptimized ? 'border-[#C6934B]/40 ring-1 ring-[#C6934B]/10 shadow-[0_0_80px_rgba(198,147,75,0.05)]' : 'border-[#3E2F28]'}`}>
        <div className="flex flex-col md:flex-row justify-between items-center px-10 py-6 border-b border-[#3E2F28]/50 gap-4 bg-[#0A0806]/40">
           <div className="flex items-center gap-3">
             <div className={`p-2 rounded-lg ${isOptimized ? 'bg-[#C6934B]/10 text-[#C6934B]' : 'bg-[#15100E] text-[#5D4E45]'}`}>
               {isOptimized ? <ShieldCheck size={20} /> : <FileText size={20} />}
             </div>
             <div>
               <span className={`text-[10px] font-black uppercase tracking-[0.3em] block ${isOptimized ? 'text-[#C6934B]' : 'text-[#5D4E45]'}`}>
                 {isOptimized ? 'Physics-Aware Master Script' : 'Standard Sequential Draft'}
               </span>
               <span className="text-[8px] text-[#5D4E45] font-black uppercase tracking-widest mt-1 block">Production ID: {project.id.split('-')[0].toUpperCase()}</span>
             </div>
           </div>
           
           <div className="flex gap-3">
              <button 
                onClick={handleDownload} 
                className="group flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-[#FDF0C9] hover:bg-white/10 transition-all font-black text-[10px] uppercase tracking-widest"
              >
                <Download size={16} className="group-hover:animate-bounce" /> Save .txt
              </button>
              <button 
                onClick={() => { navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 2000); }} 
                className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-3 ${copied ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-[#C6934B] text-[#15100E] hover:bg-[#FDF0C9] shadow-lg shadow-[#C6934B]/10'}`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Captured' : 'Copy All'}
              </button>
           </div>
        </div>
        
        <div className="relative flex-grow min-h-[500px] bg-[#0A0806]/20">
          {isOptimized && !optimizedPrompts && !isGenerating && (
            <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-2xl flex flex-col items-center justify-center text-center p-12 animate-in fade-in zoom-in-95 duration-500">
               <div className="relative mb-8">
                 <div className="absolute inset-0 bg-[#C6934B]/20 blur-3xl rounded-full animate-pulse"></div>
                 <Zap size={64} className="text-[#C6934B] relative z-10 drop-shadow-[0_0_20px_rgba(198,147,75,0.5)]" />
               </div>
               <h3 className="text-3xl font-black text-[#FDF0C9] italic uppercase tracking-tighter mb-4">Master Script Pending</h3>
               <button 
                onClick={handleRunAIOptimization} 
                className="bg-gradient-to-r from-[#C6934B] to-[#FDF0C9] text-[#15100E] px-12 py-5 rounded-2xl font-black text-xl active:scale-95 shadow-2xl shadow-[#C6934B]/30 uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-4"
               >
                 <Sparkles size={24} /> Assemble Master Script
               </button>
               <p className="text-[10px] text-[#C6934B] font-black uppercase tracking-[0.4em] mt-8 max-w-sm leading-loose opacity-60 italic">
                 Calculates cinematic weight, volumetric fog, and lens behavior across the entire sequence.
               </p>
            </div>
          )}
          
          {isGenerating && (
            <div className="absolute inset-0 z-20 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center text-center p-12">
               <div className="relative mb-10">
                 <div className="absolute inset-0 border-4 border-[#C6934B]/20 rounded-full w-32 h-32 animate-ping"></div>
                 <div className="relative z-10 p-8 rounded-full border-2 border-[#C6934B]/30 bg-[#100C0A]">
                   <Loader2 size={48} className="text-[#C6934B] animate-spin" />
                 </div>
               </div>
               <div className="space-y-4">
                 <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter animate-pulse">Director is Synchronizing...</h3>
                 <div className="flex items-center justify-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#C6934B] animate-bounce" style={{animationDelay: '0s'}}></div>
                   <div className="w-1.5 h-1.5 rounded-full bg-[#C6934B] animate-bounce" style={{animationDelay: '0.2s'}}></div>
                   <div className="w-1.5 h-1.5 rounded-full bg-[#C6934B] animate-bounce" style={{animationDelay: '0.4s'}}></div>
                   <p className="text-[10px] text-[#C6934B] font-black uppercase tracking-[0.5em] ml-2">Mapping Sequential Coherence</p>
                 </div>
               </div>
            </div>
          )}
          
          <textarea 
            readOnly 
            value={content} 
            className="w-full h-full bg-transparent text-[#E2D5C5] font-mono text-base p-10 md:p-14 outline-none custom-scrollbar leading-relaxed resize-none selection:bg-[#C6934B]/30" 
            placeholder="No script content generated. Return to the studio to add cinematic shots."
          />
        </div>
      </div>
    </div>
  );
};

interface ExportViewProps {
  project: Project;
  globalCharacters: Character[];
  onApiError: (error: any) => void;
}
