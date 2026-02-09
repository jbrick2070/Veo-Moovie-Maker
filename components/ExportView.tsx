
import React, { useState, useMemo } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Project, Character, Shot } from '../types';
import { FileText, Sparkles, Loader2, Download, Star, ExternalLink, Layout, Link as LinkIcon, Target, PenTool, FileArchive } from 'lucide-react';
import JSZip from 'jszip';

interface ExportViewProps {
  project: Project;
  globalCharacters: Character[];
  onApiError: (error: any) => void;
}

type OptimizationProfile = 'faithful' | 'cinematic' | 'redraft';

export const ExportView: React.FC<ExportViewProps> = ({ project, globalCharacters, onApiError }) => {
  const [copied, setCopied] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);
  const [optimizedPrompts, setOptimizedPrompts] = useState<string[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBatchDownloading, setIsBatchDownloading] = useState(false);
  const [profile, setProfile] = useState<OptimizationProfile>('faithful');

  const handleRunAIOptimization = async () => {
    setIsGenerating(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const profileInstructions = {
          faithful: "CRITICAL: YOU MUST KEEP ALL DIALOGUE AND ACTIONS VERBATIM. DO NOT REWRITE. Only add minimal technical formatting for the generator. Preserve exactly [Character]: 'Dialogue' sequences.",
          cinematic: "Enhance visual descriptions (lighting, camera, atmosphere) while KEEPING ALL DIALOGUE INTACT. The dialogue must remain 100% faithful to the source text.",
          redraft: "Creative Script Revision: Act as a master screenwriter. You may rewrite dialogue and actions for maximum impact while keeping the original narrative core."
        };

        const systemMsg = `You are a Veo 3 Production Specialist. 
        TASK: Convert these raw shots into a final production script.
        PROFILE: ${profileInstructions[profile]}
        
        MANDATORY: Return a JSON array of strings (one per shot).
        
        INPUT DATA:
        ${project.shots.map((s, i) => `SHOT ${i+1}:
        [DIALOGUE/ACTION]: ${s.action}
        [ENVIRONMENT]: ${s.environment}
        [CAMERA]: ${s.camera}`).join('\n\n')}`;
        
        const result = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: systemMsg,
            config: { 
              responseMimeType: "application/json", 
              responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } } 
            }
        });
        
        const data = JSON.parse(result.text);
        if (Array.isArray(data)) {
          setOptimizedPrompts(data);
          setIsOptimized(true);
        }
    } catch (err) { 
      onApiError(err); 
    } finally { 
      setIsGenerating(false); 
    }
  };

  const getPromptSnippet = (shot: Shot) => {
    const prompt = shot.action || shot.actionPrompt || "PROMPT";
    return prompt
      .trim()
      .replace(/\[|\]/g, '')
      .replace(/[^a-z0-9]/gi, '_')
      .toUpperCase()
      .substring(0, 10);
  };

  const getPrompt = (shot: Shot, index: number) => {
    if (isOptimized && optimizedPrompts && optimizedPrompts[index]) {
      const cleanPrompt = optimizedPrompts[index].replace(/^\d+\.\s*/, '');
      return `${index + 1}. ${cleanPrompt}`;
    }
    return `${index + 1}. ${shot.actionPrompt}`;
  };

  const content = useMemo(() => {
    return project.shots.map((s, i) => getPrompt(s, i)).join('\n\n');
  }, [project.shots, isOptimized, optimizedPrompts]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const base64ToBlob = (base64: string) => {
    const parts = base64.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
  };

  const handleBatchDownload = async () => {
    if (isBatchDownloading) return;
    setIsBatchDownloading(true);
    
    try {
      const zip = new JSZip();
      const folderName = `${project.title.replace(/\s+/g, '_')}_Asset_Pack`;
      const folder = zip.folder(folderName);
      
      let hasFiles = false;
      project.shots.forEach((shot, idx) => {
        const num = idx + 1;
        const snippet = getPromptSnippet(shot);
        if (shot.startingFrame) {
          const blob = base64ToBlob(shot.startingFrame);
          folder?.file(`${num}.a STARTING SHOT ${num}_${snippet}.png`, blob);
          hasFiles = true;
        }
        if (shot.endingFrame) {
          const blob = base64ToBlob(shot.endingFrame);
          folder?.file(`${num}.b ENDING SHOT ${num}_${snippet}.png`, blob);
          hasFiles = true;
        }
      });

      if (!hasFiles) {
        alert("No images found in production to export.");
        setIsBatchDownloading(false);
        return;
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `${folderName}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      onApiError(err);
    } finally {
      setIsBatchDownloading(false);
    }
  };

  const handleDownloadFrame = (base64: string, filename: string) => {
    const blob = base64ToBlob(base64);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadScript = () => {
    const blob = new Blob([content], {type: 'text/plain'});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${project.title.replace(/\s+/g, '_')}_PRODUCTION_SCRIPT.txt`;
    link.click();
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-[#3E2F28]/30 pb-6">
        <div>
          <h2 className="text-4xl font-black text-[#FDF0C9] italic uppercase leading-none tracking-tighter">Export Studio</h2>
          <p className="text-[10px] text-[#C6934B] font-black uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
            <Layout size={12} /> Production Assembly
          </p>
        </div>
        
        {/* Profile Picker UI */}
        <div className="flex bg-[#100C0A] border border-[#3E2F28] p-1.5 rounded-2xl shadow-lg">
          <button 
            onClick={() => setProfile('faithful')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${profile === 'faithful' ? 'bg-[#C6934B] text-[#15100E]' : 'text-[#5D4E45] hover:text-[#8C7A70]'}`}
          >
            <Target size={14} /> Faithful
          </button>
          <button 
            onClick={() => setProfile('cinematic')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${profile === 'cinematic' ? 'bg-[#C6934B] text-[#15100E]' : 'text-[#5D4E45] hover:text-[#8C7A70]'}`}
          >
            <Sparkles size={14} /> Cinematic
          </button>
          <button 
            onClick={() => setProfile('redraft')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${profile === 'redraft' ? 'bg-[#8A1C1C] text-white' : 'text-[#5D4E45] hover:text-[#8C7A70]'}`}
          >
            <PenTool size={14} /> Redraft
          </button>
        </div>
      </div>

      {/* COMPACT EXPORT ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ACTION 1: IMAGE PACK */}
        <button 
          onClick={handleBatchDownload}
          disabled={isBatchDownloading || !project.shots.some(s => s.startingFrame || s.endingFrame)}
          className="group relative flex flex-row items-center justify-start gap-5 p-6 bg-emerald-500 text-white rounded-[2rem] overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.98] shadow-xl shadow-emerald-500/10 disabled:opacity-30 disabled:grayscale"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
          <div className="p-3 bg-white/20 rounded-2xl">
            {isBatchDownloading ? <Loader2 className="animate-spin" size={24} /> : <FileArchive size={24} />}
          </div>
          <div className="text-left">
            <span className="block text-sm font-black uppercase tracking-[0.2em] italic">1. Export Image Pack</span>
            <span className="block text-[9px] font-bold uppercase tracking-[0.1em] mt-0.5 opacity-80 italic">Continuity ZIP Assembly</span>
          </div>
        </button>

        {/* ACTION 2: SCRIPT EXPORT */}
        <button 
          onClick={handleRunAIOptimization}
          disabled={isGenerating}
          className="group relative flex flex-row items-center justify-start gap-5 p-6 bg-[#C6934B] text-[#15100E] rounded-[2rem] overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.98] shadow-xl shadow-[#C6934B]/10 disabled:opacity-30"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
          <div className="p-3 bg-white/30 rounded-2xl">
            {isGenerating ? <Loader2 className="animate-spin" size={24} /> : <Star size={24} />}
          </div>
          <div className="text-left">
            <span className="block text-sm font-black uppercase tracking-[0.2em] italic">2. Assemble Master Script</span>
            <span className="block text-[9px] font-bold uppercase tracking-[0.1em] mt-0.5 opacity-80 italic">Veo 3 Motion Instruction Pack</span>
          </div>
        </button>
      </div>

      {/* SECONDARY VIEW & AUTOMATION */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-grow min-h-0">
        <div className="flex flex-col gap-6">
          <div className="bg-[#100C0A] border border-[#3E2F28] rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl flex-grow min-h-[400px]">
            <div className="bg-[#15100E]/90 p-5 px-6 border-b border-[#3E2F28] flex flex-col sm:flex-row justify-between items-center gap-3">
              <span className="text-[10px] font-black uppercase text-[#C6934B] tracking-[0.3em] flex items-center gap-2">
                <FileText size={14} /> Production Text
              </span>

              <div className="flex items-center gap-2 flex-wrap justify-center">
                <a 
                  href="https://chromewebstore.google.com/detail/auto-flow-auto-veo-nano-b/lhcmnhdbddgagibbbgppakocflbnknoa" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#C6934B]/10 border border-[#C6934B]/40 rounded-xl font-black text-[9px] uppercase tracking-[0.1em] text-[#C6934B] hover:bg-[#C6934B] hover:text-[#15100E] transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(198,147,75,0.1)] group"
                >
                  <LinkIcon size={12} /> Auto-Flow <ExternalLink size={10} />
                </a>
                
                <button 
                  onClick={handleCopy} 
                  className={`px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-[0.1em] transition-all border ${copied ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' : 'bg-[#2A1F1B] border-[#3E2F28] text-[#FDF0C9] hover:border-[#C6934B] hover:text-[#C6934B]'}`}
                >
                  {copied ? 'COPIED' : 'COPY'}
                </button>
                <button 
                  onClick={handleDownloadScript} 
                  className="px-4 py-2 bg-[#2A1F1B] border border-[#3E2F28] rounded-xl font-black text-[9px] uppercase tracking-[0.1em] text-[#FDF0C9] hover:border-[#C6934B] hover:text-[#C6934B] transition-all"
                >
                  TXT
                </button>
              </div>
            </div>
            <pre className="p-8 text-xs font-mono text-[#8C7A70] leading-relaxed overflow-y-auto custom-scrollbar whitespace-pre-wrap flex-grow bg-black/10">
              {content}
            </pre>
          </div>
        </div>

        {/* Visual Continuity Package Preview */}
        <div className="bg-[#100C0A] border border-[#3E2F28] rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl">
           <div className="bg-[#15100E]/90 p-5 px-6 border-b border-[#3E2F28] flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-[#C6934B] tracking-[0.3em] flex items-center gap-2">
                  <Layout size={14} /> Asset Map
                </span>
              </div>
              <span className="text-[8px] font-bold text-[#5D4E45] uppercase tracking-widest italic">Format: [idx].[a/b] [START/END] SHOT [idx]_[Prompt]</span>
           </div>
           
           <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-grow bg-black/10">
              {project.shots.map((shot, idx) => {
                const num = idx + 1;
                const snippet = getPromptSnippet(shot);
                return (
                  <div key={shot.id} className="space-y-3">
                    <div className="flex justify-between items-center px-4 border-l-2 border-[#C6934B]/20 py-1">
                       <span className="text-[10px] font-black uppercase text-[#C6934B] tracking-[0.4em]">Shot {num}</span>
                       <span className="text-[7px] font-mono text-[#5D4E45] uppercase">ID: {snippet}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative aspect-video rounded-xl bg-black/40 border border-[#3E2F28] overflow-hidden flex items-center justify-center group/img shadow-md">
                        {shot.startingFrame ? (
                          <>
                            <img src={shot.startingFrame} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700" alt={`Start ${num}`} />
                            <div className="absolute top-2 left-2 bg-black/80 px-1.5 py-0.5 rounded-[4px] text-[7px] font-black text-[#C6934B] border border-[#C6934B]/20">{num}.a START</div>
                            <button 
                              onClick={() => handleDownloadFrame(shot.startingFrame!, `${num}.a STARTING SHOT ${num}_${snippet}.png`)}
                              className="absolute bottom-2 right-2 p-1.5 bg-[#C6934B] text-[#15100E] rounded-lg opacity-0 group-hover/img:opacity-100 transition-all hover:scale-110"
                            >
                              <Download size={12} />
                            </button>
                          </>
                        ) : (
                          <span className="text-[7px] font-black uppercase text-[#3E2F28] italic">No Start</span>
                        )}
                      </div>

                      <div className="relative aspect-video rounded-xl bg-black/40 border border-[#3E2F28] overflow-hidden flex items-center justify-center group/img shadow-md">
                        {shot.endingFrame ? (
                          <>
                            <img src={shot.endingFrame} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700" alt={`End ${num}`} />
                            <div className="absolute top-2 left-2 bg-black/80 px-1.5 py-0.5 rounded-[4px] text-[7px] font-black text-emerald-500 border border-emerald-500/20">{num}.b END</div>
                            <button 
                              onClick={() => handleDownloadFrame(shot.endingFrame!, `${num}.b ENDING SHOT ${num}_${snippet}.png`)}
                              className="absolute bottom-2 right-2 p-1.5 bg-emerald-500 text-white rounded-lg opacity-0 group-hover/img:opacity-100 transition-all hover:scale-110"
                            >
                              <Download size={12} />
                            </button>
                          </>
                        ) : (
                          <span className="text-[7px] font-black uppercase text-[#3E2F28] italic">No End</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
           </div>
        </div>
      </div>
    </div>
  );
};
