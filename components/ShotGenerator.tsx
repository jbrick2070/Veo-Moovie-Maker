
import React, { useState } from 'react';
import { Character, Shot, Project } from '../types';
import { GoogleGenAI } from "@google/genai";
import { Film, Wand2, Trash2, MoveDown, MoveUp, Lock, Unlock, Aperture, MapPin, Sparkles, Link, Loader2, CheckCircle2, Edit2 } from 'lucide-react';

interface ShotGeneratorProps {
  project: Project;
  globalCharacters: Character[];
  onUpdateProject: (updatedProject: Project) => void;
  onNavigateToExport: () => void;
  onApiError?: (error: any) => void;
}

export const ShotGenerator: React.FC<ShotGeneratorProps> = ({ project, globalCharacters, onUpdateProject, onNavigateToExport, onApiError }) => {
  const [envInput, setEnvInput] = useState('');
  const [actionInput, setActionInput] = useState('');
  const [cameraInput, setCameraInput] = useState('');
  const [lockEnv, setLockEnv] = useState(false);
  const [lockCamera, setLockCamera] = useState(false);
  const [isAIRewriting, setIsAIRewriting] = useState(false);
  const [editingShotId, setEditingShotId] = useState<string | null>(null);

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

  const handleAIRewrite = async () => {
    if (!actionInput) return;
    setIsAIRewriting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Convert this raw scene action into a professional Veo 3 video prompt. 
      Maintain characters in [Name] brackets. Use cinematic lighting, specific camera motion, and sensory textures.
      ACTION: "${actionInput}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      if (response.text) setActionInput(response.text.trim());
    } catch (err) {
      if (onApiError) onApiError(err);
    } finally {
      setIsAIRewriting(false);
    }
  };

  const handleSaveShot = () => {
    if (!actionInput) return;
    const finalPrompt = [envInput, resolveActionPrompt(actionInput), cameraInput].filter(Boolean).join(', ');
    const usedCharIds = globalCharacters.filter(c => actionInput.includes(`[${c.name}]`)).map(c => c.id);

    if (editingShotId) {
      const updatedShots = project.shots.map(s => s.id === editingShotId ? {
        ...s, environment: envInput, action: actionInput, camera: cameraInput, actionPrompt: finalPrompt, charactersInvolved: usedCharIds
      } : s);
      onUpdateProject({ ...project, shots: updatedShots, lastModified: Date.now() });
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
      onUpdateProject({ ...project, shots: [...project.shots, newShot], lastModified: Date.now() });
    }
    setActionInput('');
    if (!lockEnv) setEnvInput('');
    if (!lockCamera) setCameraInput('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <div className="lg:col-span-7 space-y-8">
        <div className="bg-[#100C0A]/80 border-2 border-[#3E2F28] p-10 rounded-[3rem] shadow-2xl space-y-8 relative overflow-hidden">
          <div className="flex items-center gap-4 text-[#C6934B] border-b border-[#3E2F28] pb-6">
            <Wand2 size={28} />
            <h2 className="text-2xl font-black text-[#FDF0C9] italic uppercase tracking-tighter">Shot Architect</h2>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center"><label className="text-[10px] font-black uppercase text-[#8C7A70] tracking-widest">I. Atmosphere</label>
              <button onClick={() => setLockEnv(!lockEnv)} className={`p-2 rounded-xl border ${lockEnv ? 'border-[#C6934B] text-[#C6934B]' : 'border-[#3E2F28] text-[#5D4E45]'}`}>{lockEnv ? <Lock size={14} /> : <Unlock size={14} />}</button>
            </div>
            <textarea value={envInput} onChange={e => setEnvInput(e.target.value)} placeholder="Lighting, set, and global mood..." className="w-full h-24 bg-[#15100E] border border-[#3E2F28] p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-[#C6934B] resize-none" />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center"><label className="text-[10px] font-black uppercase text-[#8C7A70] tracking-widest">II. Action & Cast</label>
              <button onClick={handleAIRewrite} disabled={isAIRewriting} className="text-[#C6934B] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">{isAIRewriting ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} AI Direct</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {globalCharacters.map(c => (
                <button key={c.id} onClick={() => setActionInput(p => p + ` [${c.name}] `)} className="px-3 py-1.5 rounded-lg border border-[#3E2F28] text-[9px] font-black uppercase text-[#8C7A70] hover:border-[#C6934B] transition-all">[{c.name}]</button>
              ))}
            </div>
            <textarea value={actionInput} onChange={e => setActionInput(e.target.value)} placeholder="What happens? Use [Name] for consistency..." className="w-full h-36 bg-[#15100E] border border-[#3E2F28] p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-[#C6934B] resize-none" />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center"><label className="text-[10px] font-black uppercase text-[#8C7A70] tracking-widest">III. Optics</label>
              <button onClick={() => setLockCamera(!lockCamera)} className={`p-2 rounded-xl border ${lockCamera ? 'border-[#C6934B] text-[#C6934B]' : 'border-[#3E2F28] text-[#5D4E45]'}`}>{lockCamera ? <Lock size={14} /> : <Unlock size={14} />}</button>
            </div>
            <input value={cameraInput} onChange={e => setCameraInput(e.target.value)} placeholder="Lenses, motion, film stock..." className="w-full bg-[#15100E] border border-[#3E2F28] p-6 rounded-2xl text-white outline-none focus:ring-2 focus:ring-[#C6934B]" />
          </div>

          <button onClick={handleSaveShot} className="w-full bg-[#C6934B] text-[#15100E] py-5 rounded-[2rem] font-black uppercase text-sm tracking-widest hover:bg-[#FDF0C9] transition-all flex items-center justify-center gap-3">
            <CheckCircle2 size={24} /> Lock Shot into Sequence
          </button>
        </div>
      </div>

      <div className="lg:col-span-5 space-y-6">
        <h3 className="text-xl font-black text-[#FDF0C9] italic uppercase tracking-tighter flex items-center gap-3"><Film className="text-[#C6934B]" /> Sequence Preview</h3>
        <div className="space-y-4 overflow-y-auto max-h-[80vh] pr-2 custom-scrollbar">
          {project.shots.map((shot, idx) => (
            <div key={shot.id} className="bg-[#100C0A]/60 border border-[#3E2F28] p-6 rounded-[2rem] relative group hover:border-[#C6934B]/40 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="w-8 h-8 rounded-full bg-[#15100E] flex items-center justify-center text-[10px] font-black text-[#C6934B] border border-[#3E2F28]">{shot.sequenceOrder}</div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEnvInput(shot.environment || ''); setActionInput(shot.action || ''); setCameraInput(shot.camera || ''); setEditingShotId(shot.id); }} className="text-[#5D4E45] hover:text-[#C6934B]"><Edit2 size={14} /></button>
                  <button onClick={() => onUpdateProject({...project, shots: project.shots.filter(s => s.id !== shot.id).map((s, i) => ({...s, sequenceOrder: i+1}))})} className="text-[#5D4E45] hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
              <p className="text-xs text-[#E2D5C5] leading-relaxed italic line-clamp-3">"{shot.action}"</p>
              {shot.isContinuation && <div className="mt-4 flex items-center gap-2 text-[8px] font-black uppercase text-[#C6934B] tracking-widest"><Link size={10} /> Continuity Bridge Active</div>}
            </div>
          ))}
          {project.shots.length > 0 && (
            <button onClick={onNavigateToExport} className="w-full py-8 border-2 border-dashed border-[#3E2F28] rounded-[2rem] text-[#5D4E45] font-black uppercase text-[10px] tracking-[0.4em] hover:bg-white/5 transition-all hover:text-[#C6934B]">Finalize Production</button>
          )}
        </div>
      </div>
    </div>
  );
};
