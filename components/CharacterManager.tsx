import React, { useState } from 'react';
import { Character } from '../types';
import { UserPlus, Trash2, Edit2, Check, X, ChevronDown, ChevronUp, Sparkles, Sparkle, Wand2, Loader2 } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

interface CharacterManagerProps {
  characters: Character[];
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
}

const COLORS = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 
  'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 
  'bg-cyan-500', 'bg-blue-500', 'bg-indigo-500', 
  'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
];

export const CharacterManager: React.FC<CharacterManagerProps> = ({ characters, setCharacters }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Track expanded states for individual cards
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedIds(newSet);
  };

  const handleAIGenerate = async (style: 'realistic' | 'fantastical') => {
    if (!process.env.API_KEY) {
      alert("API Key is missing.");
      return;
    }

    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `Act as a world-class Character Designer and Concept Artist. 
      Generate a unique character profile designed for high-end video generation models (like Veo 3).
      
      ### STYLE: ${style.toUpperCase()}
      
      ### INSTRUCTIONS:
      1. **Name**: Provide a creative name or role title.
      2. **Visual DNA**: Write a 2-3 paragraph immutable visual description. 
      3. **Inclusivity**: Avoid explicit gender labels (man/woman) unless it's naturally tied to a specific historical or trope-based role; prefer descriptive terms like 'individual', 'figure', 'being', or 'person'.
      4. **Detail**: Focus on physical build, skin/surface texture, specific clothing materials (leather, silk, oxidized copper), unique accessories, and how they interact with light.
      5. **Consistency**: The description must be "dense" enough that an AI model will recreate the same looking character every time.
      
      Return as a JSON object with 'name' and 'description' properties.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
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
      console.error("AI Character Generation failed", err);
      alert("Failed to generate character. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSave = () => {
    if (!name.trim() || !desc.trim()) return;
    
    if (editingId) {
      setCharacters(prev => prev.map(c => 
        c.id === editingId ? { ...c, name, description: desc } : c
      ));
    } else {
      const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      const newChar: Character = {
        id: crypto.randomUUID(),
        name,
        description: desc,
        color: randomColor
      };
      setCharacters(prev => [...prev, newChar]);
    }
    
    resetForm();
  };

  const handleEdit = (char: Character) => {
    setName(char.name);
    setDesc(char.description);
    setEditingId(char.id);
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setName('');
    setDesc('');
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    setCharacters(prev => prev.filter(c => c.id !== id));
    if (editingId === id) {
      resetForm();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#3E2F28] pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#FDF0C9]">Cast</h2>
          <p className="text-[#8C7A70] text-sm mt-1">
            Define your cast. These descriptions become the immutable "Visual DNA" for every shot.
          </p>
        </div>
        {!isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 bg-[#C6934B] hover:bg-[#B5823A] text-[#15100E] px-4 py-2 rounded-lg transition-colors font-bold shadow-lg shadow-[#C6934B]/10"
          >
            <UserPlus size={18} />
            <span>Add Character</span>
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="bg-[#15100E]/80 backdrop-blur-md border border-[#C6934B]/30 p-6 rounded-xl animate-in fade-in slide-in-from-top-4 duration-300 shadow-2xl relative overflow-hidden">
          
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
            <h3 className="text-lg font-bold text-[#FDF0C9] flex items-center gap-2">
              {editingId ? 'Edit Character Profile' : 'Create New Profile'}
              {isGenerating && <Loader2 size={16} className="animate-spin text-[#C6934B]" />}
            </h3>

            {/* AI Generation Preset Buttons */}
            {!editingId && (
              <div className="flex items-center gap-2 bg-[#0A0806] p-1 rounded-xl border border-[#3E2F28]">
                <span className="text-[10px] font-bold text-[#5D4E45] uppercase px-2">AI Creator:</span>
                <button 
                  onClick={() => handleAIGenerate('realistic')}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2A1F1B] hover:bg-[#3E2F28] text-[#C6934B] text-xs font-bold transition-all border border-transparent hover:border-[#C6934B]/30 disabled:opacity-50"
                >
                  <Sparkles size={14} />
                  Realistic
                </button>
                <button 
                  onClick={() => handleAIGenerate('fantastical')}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2A1F1B] hover:bg-[#3E2F28] text-[#C6934B] text-xs font-bold transition-all border border-transparent hover:border-[#C6934B]/30 disabled:opacity-50"
                >
                  <Sparkle size={14} />
                  Fantastical
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-[#8C7A70] font-bold">Name / Role</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Detective K, The Alchemist"
                className="w-full bg-[#0A0806]/60 border border-[#3E2F28] text-[#FDF0C9] px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#C6934B] outline-none"
              />
            </div>
            <div className="space-y-2 md:col-span-2 relative">
              <label className="text-xs uppercase tracking-wider text-[#8C7A70] font-bold">Visual DNA (Immutable Description)</label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Describe visuals: 'Tall figure in a rusted metal mask, heavy canvas cloak, steam emitting from vents...'"
                className={`w-full bg-[#0A0806]/60 border border-[#3E2F28] text-[#FDF0C9] px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#C6934B] outline-none h-32 resize-none leading-relaxed transition-opacity ${isGenerating ? 'opacity-40' : 'opacity-100'}`}
              />
              {isGenerating && (
                <div className="absolute inset-0 flex items-center justify-center pt-6">
                  <div className="flex items-center gap-3 bg-[#15100E] border border-[#C6934B] px-6 py-2 rounded-full shadow-2xl">
                    <Loader2 size={16} className="animate-spin text-[#C6934B]" />
                    <span className="text-xs font-bold text-[#C6934B] uppercase tracking-widest">Designing Identity...</span>
                  </div>
                </div>
              )}
              <p className="text-[10px] text-[#C6934B] font-medium">* This exact text is injected into every shot prompt involving this character.</p>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={resetForm}
              className="px-4 py-2 text-[#8C7A70] hover:text-[#FDF0C9] transition-colors font-bold text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!name || !desc || isGenerating}
              className="flex items-center gap-2 bg-[#C6934B] hover:bg-[#B5823A] disabled:opacity-50 disabled:cursor-not-allowed text-[#15100E] px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95"
            >
              <Check size={20} />
              {editingId ? 'Update Identity' : 'Save Character'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {characters.length === 0 && !isFormOpen && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-[#3E2F28] rounded-2xl text-[#5D4E45] bg-[#15100E]/20">
            <UserPlus className="mx-auto mb-4 opacity-30" size={48} />
            <h3 className="text-[#8C7A70] font-bold">The set is empty.</h3>
            <p className="text-sm">Create your first character or use the AI Creator to cast your Mooovie.</p>
          </div>
        )}
        
        {characters.map((char) => {
          const isExpanded = expandedIds.has(char.id);
          
          return (
            <div key={char.id} className="group bg-[#15100E]/80 border border-[#3E2F28] hover:border-[#C6934B]/50 rounded-2xl p-5 transition-all relative backdrop-blur-sm shadow-xl hover:shadow-[#C6934B]/5 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className={`w-12 h-12 rounded-2xl ${char.color} flex-shrink-0 flex items-center justify-center text-[#15100E] font-black text-xl shadow-xl rotate-3 group-hover:rotate-0 transition-transform`}>
                    {char.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-[#FDF0C9] text-lg truncate pr-2 group-hover:text-[#C6934B] transition-colors">{char.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                       <span className="text-[9px] uppercase font-black bg-[#2A1F1B] text-[#C6934B] px-1.5 py-0.5 rounded border border-[#C6934B]/20">Visual DNA</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0 bg-[#0A0806]/50 rounded-lg p-1">
                  <button 
                    onClick={() => handleEdit(char)}
                    className="text-[#5D4E45] hover:text-[#C6934B] transition-colors p-2 hover:bg-[#2A1F1B] rounded-lg"
                    title="Edit Identity"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(char.id)}
                    className="text-[#5D4E45] hover:text-[#8A1C1C] transition-colors p-2 hover:bg-[#2A1F1B] rounded-lg"
                    title="Delete Identity"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div 
                className="bg-[#0A0806]/40 p-4 rounded-xl border border-[#3E2F28] cursor-pointer hover:bg-[#0A0806]/80 transition-all flex-grow group/desc"
                onClick={() => toggleExpand(char.id)}
              >
                <p className={`text-sm text-[#E2D5C5] leading-relaxed italic opacity-80 group-hover/desc:opacity-100 transition-opacity ${!isExpanded ? 'line-clamp-3' : ''}`}>
                  "{char.description}"
                </p>
                <div className="flex justify-center mt-3 pt-2 border-t border-[#3E2F28]/50">
                   {isExpanded ? <ChevronUp size={14} className="text-[#5D4E45]" /> : <ChevronDown size={14} className="text-[#5D4E45]" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};