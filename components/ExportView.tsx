import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Project, Character, Shot } from '../types';
import { Copy, CheckCircle2, FileDown, FileText, List, Sparkles, ToggleLeft, ToggleRight, Loader2, AlertTriangle, RefreshCw, MessageSquare, AlertOctagon, ShieldCheck, ShieldAlert, VenetianMask } from 'lucide-react';

interface ExportViewProps {
  project: Project;
  globalCharacters: Character[];
}

export const ExportView: React.FC<ExportViewProps> = ({ project, globalCharacters }) => {
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'batch' | 'script'>('batch');
  const [isOptimized, setIsOptimized] = useState(false);
  
  // Advanced Optimization Settings
  const [optimizeDialogue, setOptimizeDialogue] = useState(false);
  const [scrubIdentity, setScrubIdentity] = useState(false); // New State for Copyright Scrubbing

  // AI State
  const [optimizedPrompts, setOptimizedPrompts] = useState<string[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Reset optimization if project structure changes significantly (basic check)
  useEffect(() => {
    if (optimizedPrompts && optimizedPrompts.length !== project.shots.length) {
      // Keep data but mark as potentially stale visually or just let user decide
    }
  }, [project.shots.length]);

  // Collapse all whitespace (newlines, tabs, multi-spaces) into single spaces
  const cleanText = (text: string) => text.replace(/\s+/g, " ").trim();

  const handleRunAIOptimization = async () => {
    if (!process.env.API_KEY) {
       alert("API Key is missing from environment variables.");
       return;
    }

    setIsGenerating(true);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Context Construction
        const castContext = globalCharacters.length > 0 
          ? globalCharacters.map(c => `CHARACTER NAME: ${c.name}\nVISUAL DNA: ${c.description}`).join('\n---\n')
          : "No specific cast definitions.";
        
        const scriptContext = project.shots.map((s, i) => {
           // We use the raw Action input if available to catch [Tags], otherwise fallback to the pre-composed prompt
           const actionContent = s.action || s.actionPrompt;
           return `SHOT_INDEX: ${i}
           CINEMATIC_VIBE: ${project.cinematicVibe}
           ENVIRONMENT: ${s.environment || "Not specified"}
           ACTION/SUBJECTS: ${actionContent}
           CAMERA: ${s.camera || "Not specified"}`;
        }).join('\n\n================\n\n');

        // Dynamic Instruction based on Dialogue Setting
        const dialogueInstruction = optimizeDialogue 
          ? `4. **Dialogue Optimization (Rewrite Mode)**:
             - Refine, shorten, or "punch up" any dialogue inside quotation marks. 
             - Make it punchier for short video clips. 
             - You have creative freedom to alter the words to better match the visual emotion.`
          : `4. **Dialogue Preservation (Strict Mode)**:
             - You MUST preserve any text inside quotation marks "" EXACTLY as it is written. 
             - Do not summarize, alter, or move dialogue. Scriptwriters will be very angry if you change a single syllable.`;
        
        // Dynamic Instruction for Copyright Scrubbing
        const copyrightInstruction = scrubIdentity
          ? `5. **Copyright & Identity Scrubbing (Safe Mode ACTIVE)**:
             - CRITICAL: You must scan the inputs for any mentions of real-world celebrities, public figures, specific trademarked brands, or copyrighted fictional characters (e.g., Marvel, DC, Disney, Star Wars).
             - **AUTOMATICALLY REPLACE** these names with generic, descriptive visual counterparts.
             - Example: Replace "Tom Cruise" with "a charismatic, dark-haired action star with an intense gaze".
             - Example: Replace "Mickey Mouse" with "a cartoon mouse with round ears and red shorts".
             - Example: Replace "Coca-Cola" with "a red soda can".
             - Do NOT output the restricted name. Describe the visual essence instead.`
          : `5. **Identity Handling (Raw Mode)**:
             - Keep names of people, brands, and characters exactly as written in the input. Do not censor or alter them.`;

        const prompt = `You are an expert prompt optimizer for Google Veo 3 (Video Generation Model). 
        Your task is to rewrite raw video script inputs into concise, high-fidelity, single-paragraph video generation prompts.

        ### CAST DATA (Visual DNA):
        ${castContext}

        ### SCRIPT DATA:
        ${scriptContext}

        ### INSTRUCTIONS:
        1. **Output Format**: Return a JSON array of strings. Each string corresponds exactly to one SHOT_INDEX in order (0, 1, 2...).
        2. **Synthesis**: Combine the Cinematic Vibe, Environment, Action, and Camera into a single, cohesive, natural language paragraph for each shot.
        3. **Character Handling**:
           - The 'ACTION/SUBJECTS' text may use tags like [Name]. 
           - For the **FIRST** time a character is mentioned in a specific shot, you MUST replace their name/tag with: "Name (Visual DNA)". Use the provided Visual DNA description.
           - For **SUBSEQUENT** mentions in the **SAME** shot, use only their Name. Do not repeat the description.
           - Integrate these descriptions naturally into the sentence flow.
        ${dialogueInstruction}
        ${copyrightInstruction}
        6. **Veo 3 Optimization**:
           - Remove redundancy and filler words.
           - Use evocative, visual language (e.g., instead of "The camera sees...", just describe the visual).
           - Be concise but descriptive.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });

        const json = JSON.parse(response.text || "[]");
        if (Array.isArray(json)) {
            setOptimizedPrompts(json);
        } else {
            throw new Error("Invalid response format from AI");
        }

    } catch (error) {
        console.error("Optimization failed", error);
        alert("AI Optimization failed. Please check the console and try again.");
    } finally {
        setIsGenerating(false);
    }
  };

  const generateContent = () => {
    // Helper to get the correct prompt source
    const getPrompt = (shot: Shot, index: number) => {
      // If optimized mode is ON and we have valid data for this index
      if (isOptimized && optimizedPrompts && optimizedPrompts[index]) {
        return cleanText(optimizedPrompts[index]);
      }
      
      // Fallback: Raw Logic
      const vibe = project.cinematicVibe ? project.cinematicVibe + ', ' : '';
      return cleanText(vibe + shot.actionPrompt);
    };

    if (mode === 'script') {
      // Human Readable Script
      let output = `MOOOVIE: ${project.title}\n`;
      output += `THE VIBE: ${project.cinematicVibe}\n`;
      output += `GENERATION MODE: ${isOptimized ? 'Veo 3 AI Optimized' : 'Raw Assembly'}\n`;
      if (isOptimized) {
          output += `DIALOGUE: ${optimizeDialogue ? 'AI Rewritten' : 'Preserved (Verbatim)'}\n`;
          output += `COPYRIGHT SCRUB: ${scrubIdentity ? 'ACTIVE (Safe Mode)' : 'OFF (Raw Names)'}\n`;
      }
      output += `\n--- PROMPT SCRIPT ---\n\n`;

      project.shots.forEach((shot, index) => {
        const fullPrompt = getPrompt(shot, index);
        
        output += `### SHOT ${index + 1} [${shot.model}]\n`;
        if (shot.isContinuation && index > 0) {
          output += `> CONTINUITY: Seamless transition from Shot ${index}\n`;
        }
        output += `PROMPT:\n${fullPrompt}\n\n`;
        output += `------------------------------------------------\n\n`;
      });
      return output;
    } else {
      // Batch Mode (Raw Prompts)
      return project.shots.map((shot, index) => getPrompt(shot, index)).join('\n\n');
    }
  };

  const content = generateContent();
  const hasStaleData = isOptimized && optimizedPrompts && optimizedPrompts.length !== project.shots.length;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${mode}${isOptimized ? '_veo3' : ''}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#FDF0C9]">Export Studio</h2>
          <p className="text-[#8C7A70] text-sm">
            Generate production-ready prompt lists.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          {/* Optimization Toggle Group */}
          <div className="flex items-center gap-2 bg-[#15100E] border border-[#3E2F28] rounded-xl p-1.5 shadow-lg">
             <button 
                onClick={() => setIsOptimized(!isOptimized)}
                className={`flex items-center gap-3 px-3 py-1.5 rounded-lg border transition-all ${isOptimized ? 'bg-[#2A1F1B] border-[#C6934B] text-[#C6934B]' : 'bg-transparent border-transparent text-[#8C7A70] hover:text-[#FDF0C9]'}`}
             >
                <div className="flex flex-col items-start text-left">
                  <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    Veo 3 AI 
                    {isOptimized && <Sparkles size={10} className="text-[#C6934B] animate-pulse"/>}
                  </span>
                </div>
                {isOptimized ? <ToggleRight size={24} className="text-[#C6934B]" /> : <ToggleLeft size={24} />}
             </button>

             {/* Advanced Settings (Only visible when Optimized is ON) */}
             {isOptimized && (
                <>
                  <div className="w-px h-8 bg-[#3E2F28]"></div>
                  
                  {/* Dialogue Toggle */}
                  <button 
                     onClick={() => setOptimizeDialogue(!optimizeDialogue)}
                     className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all border ${optimizeDialogue ? 'bg-[#8A1C1C]/10 border-[#8A1C1C] text-[#F87171]' : 'bg-transparent border-transparent text-[#5D4E45] hover:text-[#8C7A70]'}`}
                     title="Rewrite dialogue?"
                  >
                     <MessageSquare size={16} />
                     <span className="text-xs font-bold uppercase hidden md:block">{optimizeDialogue ? 'Rewriting' : 'Verbatim'}</span>
                     
                     {/* Tooltip */}
                     <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-48 p-2 bg-[#8A1C1C] text-white text-[10px] rounded shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 text-center font-bold">
                        {optimizeDialogue 
                          ? "😱 A screenwriter just screamed in the distance." 
                          : "Playwrights are happy. Dialogue is sacred."}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-[#8A1C1C]"></div>
                     </div>
                  </button>

                  <div className="w-px h-8 bg-[#3E2F28]"></div>

                  {/* Copyright Shield Toggle */}
                  <button 
                     onClick={() => setScrubIdentity(!scrubIdentity)}
                     className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all border ${scrubIdentity ? 'bg-emerald-900/20 border-emerald-500 text-emerald-400' : 'bg-transparent border-transparent text-[#5D4E45] hover:text-[#8C7A70]'}`}
                     title="Scrub Copyrighted Names?"
                  >
                     {scrubIdentity ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                     <span className="text-xs font-bold uppercase hidden md:block">{scrubIdentity ? 'Safe Mode' : 'Raw Mode'}</span>
                     
                     {/* Tooltip */}
                     <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-48 p-2 bg-[#15100E] border border-[#3E2F28] text-[#FDF0C9] text-[10px] rounded shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 text-center font-bold">
                        {scrubIdentity 
                          ? "AI will auto-replace celebrities & IP with visual descriptions." 
                          : "Names passed exactly as written. Veo may block output."}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-[#3E2F28]"></div>
                     </div>
                  </button>
                </>
             )}
          </div>

          <div className="w-px h-8 bg-[#3E2F28] hidden md:block"></div>

          <div className="flex items-center gap-2 bg-[#15100E] p-1.5 rounded-xl border border-[#3E2F28] shadow-inner">
            <button 
              onClick={() => setMode('batch')}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${mode === 'batch' ? 'bg-[#C6934B] text-[#15100E] shadow-md' : 'text-[#8C7A70] hover:text-[#FDF0C9]'}`}
            >
              <List size={16} />
              Raw Batch
            </button>
            <button 
              onClick={() => setMode('script')}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${mode === 'script' ? 'bg-[#C6934B] text-[#15100E] shadow-md' : 'text-[#8C7A70] hover:text-[#FDF0C9]'}`}
            >
              <FileText size={16} />
              Script View
            </button>
          </div>
        </div>
      </div>

      <div className={`flex-grow bg-[#15100E]/80 backdrop-blur-md border rounded-xl p-1 overflow-hidden relative group shadow-xl flex flex-col transition-colors ${isOptimized ? 'border-[#C6934B]/50' : 'border-[#3E2F28]'}`}>
        
        {/* Toolbar inside the preview area */}
        <div className="flex justify-between items-center p-3 border-b border-[#3E2F28] bg-[#0A0806]/50 shrink-0">
           <div className="flex items-center gap-2">
             {isOptimized && <Sparkles size={14} className="text-[#C6934B] animate-pulse" />}
             <span className={`text-xs font-mono uppercase tracking-wider hidden md:block ${isOptimized ? 'text-[#C6934B]' : 'text-[#8C7A70]'}`}>
               {isOptimized 
                 ? `Optimizer: Gemini 3 Flash ${scrubIdentity ? '[SAFE MODE]' : '[RAW]'}` 
                 : 'Raw Mode: Direct Assembly'}
             </span>
             {hasStaleData && (
               <span className="flex items-center gap-1 text-xs text-orange-500 font-bold bg-orange-500/10 px-2 py-0.5 rounded ml-2">
                 <AlertTriangle size={12} />
                 Shot count mismatch
               </span>
             )}
           </div>
           
           <div className="flex gap-2">
             <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#2A1F1B] hover:bg-[#3E2F28] text-[#C6934B] text-xs font-bold border border-[#3E2F28] transition-colors"
            >
              <FileDown size={14} />
              Download .txt
            </button>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${copied ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/50' : 'bg-[#C6934B] hover:bg-[#B5823A] text-[#15100E]'}`}
            >
              {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
           </div>
        </div>

        {/* Content Area */}
        <div className="relative flex-grow overflow-hidden">
          
          {/* Overlay for AI Trigger */}
          {isOptimized && (!optimizedPrompts || hasStaleData) && !isGenerating && (
            <div className="absolute inset-0 bg-[#0A0806]/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-6">
               <Sparkles size={48} className="text-[#C6934B] mb-4" />
               <h3 className="text-xl font-bold text-[#FDF0C9] mb-2">Ready to Optimize</h3>
               <p className="text-[#8C7A70] max-w-md mb-6">
                 Gemini 3 Flash will rewrite your prompts to be concise and integrate Character DNA.
               </p>
               
               {/* Status Pills */}
               <div className="flex flex-col gap-2 mb-6">
                 <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${optimizeDialogue ? 'bg-[#8A1C1C]/20 border-[#8A1C1C] text-[#F87171]' : 'bg-[#2A1F1B] border-[#3E2F28] text-[#8C7A70]'}`}>
                   <MessageSquare size={16} />
                   <span className="text-xs font-bold">{optimizeDialogue ? "Dialogue: Rewriting enabled (Screenwriters beware)" : "Dialogue: Preserved verbatim"}</span>
                 </div>
                 <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${scrubIdentity ? 'bg-emerald-900/20 border-emerald-500 text-emerald-400' : 'bg-[#2A1F1B] border-[#3E2F28] text-[#8C7A70]'}`}>
                   {scrubIdentity ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                   <span className="text-xs font-bold">{scrubIdentity ? "Copyright Shield: AUTO-SCRUBBING ACTIVE" : "Copyright Shield: OFF (Raw Names)"}</span>
                 </div>
               </div>

               <button 
                 onClick={handleRunAIOptimization}
                 className="flex items-center gap-2 bg-[#C6934B] hover:bg-[#B5823A] text-[#15100E] px-8 py-3 rounded-xl font-bold text-lg shadow-lg shadow-[#C6934B]/20 transition-all hover:scale-105"
               >
                 <Sparkles size={20} />
                 Run AI Optimizer
               </button>
            </div>
          )}

          {/* Overlay for Loading */}
          {isGenerating && (
             <div className="absolute inset-0 bg-[#0A0806]/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-6">
               <Loader2 size={48} className="text-[#C6934B] animate-spin mb-4" />
               <h3 className="text-xl font-bold text-[#FDF0C9] mb-2">Optimizing Scripts...</h3>
               
               <div className="space-y-1 text-[#8C7A70] text-sm font-mono">
                  <p className="animate-pulse">Consulting the AI Director...</p>
                  <p className="animate-pulse delay-100">Injecting Visual DNA...</p>
                  {scrubIdentity && <p className="text-emerald-500 font-bold animate-pulse delay-200 flex items-center justify-center gap-2"><VenetianMask size={14}/> Scrubbing Identities...</p>}
                  {optimizeDialogue && <p className="text-[#F87171] animate-pulse delay-300">Rewriting Dialogue...</p>}
               </div>
            </div>
          )}

          {/* Regenerate Button (Floating) */}
          {isOptimized && optimizedPrompts && !isGenerating && (
            <button 
              onClick={handleRunAIOptimization}
              className="absolute bottom-6 right-6 z-10 flex items-center gap-2 bg-[#2A1F1B] hover:bg-[#C6934B] text-[#8C7A70] hover:text-[#15100E] px-4 py-2 rounded-lg font-bold border border-[#3E2F28] shadow-lg transition-all"
            >
              <RefreshCw size={16} />
              Regenerate
            </button>
          )}

          <textarea
            readOnly
            value={content}
            className="w-full h-full bg-[#0A0806]/80 text-[#E2D5C5] font-mono text-sm p-6 resize-none outline-none custom-scrollbar whitespace-pre-wrap leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
};