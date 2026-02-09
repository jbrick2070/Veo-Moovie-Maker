
import React, { useState } from 'react';
import { Character } from '../types';
import { UserPlus, Trash2, Edit2, Check, X, ChevronDown, ChevronUp, Sparkles, Loader2, Fingerprint } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

interface CharacterManagerProps {
  characters: Character[];
  setCharacters: (chars: Character[]) => void;
  onApiError?: (error: any) => void;
}

const COLORS = ['bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-emerald-500', 'bg-rose-500'];

export const CharacterManager: React.FC<CharacterManagerProps> = ({ characters, setCharacters, onApiError }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAIGenerate = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Design a unique character visual DNA for a cinematic series. 
      Focus on immutable traits: exact bone structure, hair behavior, specific clothing materials, and how they interact with light.
      Return JSON: { "name": "Name", "description": "Highly specific visual description" }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ['name', 'description']
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      if (data.name && data.description) {
        setName(data.name);
        setDesc(data.description);
      }
    } catch (err) {
      if (onApiError) onApiError(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!name || !desc) return;
    if (editingId) {
      setCharacters(characters.map(c => c.id === editingId ? { ...c, name, description: desc } : c));
    } else {
      setCharacters([...characters, { 
        id: crypto.randomUUID(), 
        name, 
        description: desc, 
        color: COLORS[characters.length % COLORS.length] 
      }]);
    }
    setName(''); setDesc(''); setEditingId(null); setIsFormOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b border-[#3E2F28] pb-6">
        <div>
          <h2 className="text-3xl font-black text-[#FDF0C9] italic uppercase tracking-tighter flex items-center gap-3">
            <Fingerprint className="text-[#C6934B]" size={32} /> Cast DNA Bank
          </h2>
          <p className="text-[#8C7A70] text-xs font-bold uppercase tracking-widest mt-2">Define immutable traits for series continuity.</p>
        </div>
        {!isFormOpen && (
          <button onClick={() => setIsFormOpen(true)} className="bg-[#C6934B] text-[#15100E] px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#FDF0C9] transition-all flex items-center gap-2">
            <UserPlus size={18} /> New Prototype
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="bg-[#100C0A] border-2 border-[#C6934B]/30 p-8 rounded-[3rem] shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-[#FDF0C9] uppercase italic">{editingId ? 'Refining DNA' : 'Initializing Subject'}</h3>
            <button onClick={handleAIGenerate} disabled={isGenerating} className="text-[#C6934B] flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-white disabled:opacity-30">
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} Auto-Design DNA
            </button>
          </div>
          <div className="space-y-6">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Identity / Alias" className="w-full bg-[#15100E] border border-[#3E2F28] text-white p-6 rounded-2xl text-2xl font-black italic outline-none focus:ring-2 focus:ring-[#C6934B]" />
            <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Visual DNA: Describe skin, hair, clothing materials, and lighting behavior..." className="w-full h-40 bg-[#15100E] border border-[#3E2F28] text-white p-6 rounded-2xl outline-none focus:ring-2 focus:ring-[#C6934B] resize-none" />
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <button onClick={() => setIsFormOpen(false)} className="px-6 py-3 text-[#5D4E45] font-black uppercase text-xs tracking-widest">Cancel</button>
            <button onClick={handleSave} className="bg-[#C6934B] text-[#15100E] px-10 py-4 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-[#FDF0C9] transition-all flex items-center gap-2">
              <Check size={20} /> Lock DNA
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {characters.map(char => (
          <div key={char.id} className="bg-[#100C0A]/60 border border-[#3E2F28] rounded-[2.5rem] p-8 hover:border-[#C6934B]/40 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl ${char.color} flex items-center justify-center text-[#15100E] font-black text-2xl`}>{char.name[0]}</div>
                <div>
                  <h3 className="font-black text-[#FDF0C9] text-xl uppercase italic">{char.name}</h3>
                  <span className="text-[8px] font-black text-[#5D4E45] uppercase tracking-widest">Locked Integrity</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setName(char.name); setDesc(char.description); setEditingId(char.id); setIsFormOpen(true); }} className="text-[#5D4E45] hover:text-[#C6934B]"><Edit2 size={18} /></button>
                <button onClick={() => setCharacters(characters.filter(c => c.id !== char.id))} className="text-[#5D4E45] hover:text-red-500"><Trash2 size={18} /></button>
              </div>
            </div>
            <p className="text-sm text-[#8C7A70] leading-relaxed line-clamp-4">{char.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
