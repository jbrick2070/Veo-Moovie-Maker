import React, { useState } from 'react';
import { Character } from '../types';
import { UserPlus, Trash2, Edit2, Check, X, ChevronDown, ChevronUp } from 'lucide-react';

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
  
  // Track expanded states for individual cards if user wants to peek
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
  
  const handleSave = () => {
    if (!name.trim() || !desc.trim()) return;
    
    if (editingId) {
      // Update existing character
      setCharacters(prev => prev.map(c => 
        c.id === editingId ? { ...c, name, description: desc } : c
      ));
    } else {
      // Add new character
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
      <div className="flex justify-between items-center border-b border-[#3E2F28] pb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#FDF0C9]">Cast</h2>
          <p className="text-[#8C7A70] text-sm mt-1">
            Define your cast. These descriptions become the immutable "Visual DNA" for every shot.
          </p>
        </div>
        {!isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 bg-[#C6934B] hover:bg-[#B5823A] text-[#15100E] px-4 py-2 rounded-lg transition-colors font-medium shadow-lg shadow-[#C6934B]/10"
          >
            <UserPlus size={18} />
            <span>Add Character</span>
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="bg-[#15100E]/80 backdrop-blur-md border border-[#3E2F28] p-6 rounded-xl animate-in fade-in slide-in-from-top-4 duration-300 shadow-2xl">
          <h3 className="text-lg font-semibold text-[#FDF0C9] mb-4">
            {editingId ? 'Edit Character Profile' : 'New Character Profile'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-[#8C7A70] font-bold">Name / Role</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Detective K, The Cyborg"
                className="w-full bg-[#2A1F1B] border border-[#3E2F28] text-[#FDF0C9] px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#C6934B] outline-none"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs uppercase tracking-wider text-[#8C7A70] font-bold">Visual DNA (Immutable Description)</label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Describe visuals only: 'A tall man in a tattered trench coat, neon scars on left cheek, cybernetic right eye, wet hair...'"
                className="w-full bg-[#2A1F1B] border border-[#3E2F28] text-[#FDF0C9] px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#C6934B] outline-none h-24 resize-none"
              />
              <p className="text-xs text-[#C6934B]">* This text will be injected into every shot prompt exactly as written.</p>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={resetForm}
              className="px-4 py-2 text-[#8C7A70] hover:text-[#FDF0C9] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!name || !desc}
              className="flex items-center gap-2 bg-[#C6934B] hover:bg-[#B5823A] disabled:opacity-50 disabled:cursor-not-allowed text-[#15100E] px-6 py-2 rounded-lg font-medium transition-colors"
            >
              <Check size={18} />
              {editingId ? 'Update Character' : 'Save Character'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {characters.length === 0 && !isFormOpen && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-[#3E2F28] rounded-xl text-[#5D4E45]">
            <UserPlus className="mx-auto mb-2 opacity-50" size={48} />
            <p>No characters defined yet. Create your cast to begin.</p>
          </div>
        )}
        
        {characters.map((char) => {
          const isExpanded = expandedIds.has(char.id);
          
          return (
            <div key={char.id} className="group bg-[#15100E]/80 border border-[#3E2F28] hover:border-[#C6934B]/50 rounded-xl p-4 transition-all relative backdrop-blur-sm shadow-lg hover:shadow-[#C6934B]/5">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`w-10 h-10 rounded-full ${char.color} flex-shrink-0 flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                    {char.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-[#FDF0C9] text-lg truncate pr-2">{char.name}</h3>
                    <span className="text-[10px] uppercase bg-[#2A1F1B] text-[#8C7A70] px-1.5 py-0.5 rounded border border-[#3E2F28]">Visual DNA</span>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button 
                    onClick={() => handleEdit(char)}
                    className="text-[#5D4E45] hover:text-[#C6934B] transition-colors p-1.5 hover:bg-[#2A1F1B] rounded-lg"
                    title="Edit Character"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(char.id)}
                    className="text-[#5D4E45] hover:text-[#8A1C1C] transition-colors p-1.5 hover:bg-[#2A1F1B] rounded-lg"
                    title="Delete Character"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div 
                className="bg-[#0A0806]/50 p-3 rounded-lg border border-[#3E2F28] cursor-pointer hover:bg-[#0A0806] transition-colors"
                onClick={() => toggleExpand(char.id)}
              >
                <p className={`text-sm text-[#E2D5C5] leading-relaxed italic ${!isExpanded ? 'line-clamp-2' : ''}`}>
                  "{char.description}"
                </p>
                {/* Visual cue if text is potentially long, or just always show the toggle for interactivity consistency */}
                <div className="flex justify-center mt-1">
                   {isExpanded ? <ChevronUp size={12} className="text-[#5D4E45]" /> : <ChevronDown size={12} className="text-[#5D4E45]" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};