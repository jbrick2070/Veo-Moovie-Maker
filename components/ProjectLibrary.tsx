import React, { useState } from 'react';
import { Project } from '../types';
import { Plus, Film, Clock, Trash2, ArrowRight, X } from 'lucide-react';

interface ProjectLibraryProps {
  projects: Project[];
  onCreateProject: (title: string) => void;
  onSelectProject: (projectId: string) => void;
  onDeleteProject: (projectId: string, e: React.MouseEvent) => void;
}

export const ProjectLibrary: React.FC<ProjectLibraryProps> = ({ 
  projects, 
  onCreateProject, 
  onSelectProject,
  onDeleteProject
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const handleOpenCreateModal = () => {
    setNewTitle(`Mooovie #${projects.length + 1}`);
    setIsModalOpen(true);
  };

  const handleConfirmCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateProject(newTitle);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500 relative z-10">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-bold text-[#FDF0C9] mb-2 drop-shadow-md">Mooovie Studio</h1>
            <p className="text-[#8C7A70]">Your collection of Veo Mooovies.</p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 bg-[#C6934B] hover:bg-[#B5823A] text-[#15100E] px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-[#C6934B]/20"
          >
            <Plus size={20} />
            <span>New Mooovie</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create Card (Alternative) */}
          <button 
            onClick={handleOpenCreateModal}
            className="group flex flex-col items-center justify-center min-h-[240px] border-2 border-dashed border-[#3E2F28] bg-[#15100E]/40 backdrop-blur-sm rounded-2xl hover:border-[#C6934B]/50 hover:bg-[#2A1F1B]/60 transition-all"
          >
            <div className="w-16 h-16 rounded-full bg-[#2A1F1B] group-hover:bg-[#C6934B]/20 flex items-center justify-center mb-4 transition-colors">
              <Plus size={32} className="text-[#8C7A70] group-hover:text-[#C6934B]" />
            </div>
            <span className="text-[#8C7A70] font-medium group-hover:text-[#C6934B]">Start New Mooovie</span>
          </button>

          {projects.map((project) => (
            <div 
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className="group relative bg-[#15100E]/80 backdrop-blur-md border border-[#3E2F28] rounded-2xl overflow-hidden hover:border-[#C6934B]/50 transition-all cursor-pointer hover:shadow-2xl hover:shadow-[#C6934B]/10 hover:-translate-y-1"
            >
              {/* Visual Header Stub */}
              <div className="h-32 bg-gradient-to-br from-[#2A1F1B] to-[#15100E] p-6 relative overflow-hidden border-b border-[#3E2F28]">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-[#C6934B]/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                 <Film className="text-[#3E2F28] w-12 h-12 absolute bottom-4 right-4 group-hover:text-[#C6934B]/20 transition-colors" />
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-[#FDF0C9] mb-2 group-hover:text-[#C6934B] transition-colors truncate">
                  {project.title}
                </h3>
                
                <div className="text-xs text-[#8C7A70] mb-6 line-clamp-2 min-h-[2.5em]">
                  {project.cinematicVibe || "No vibe defined yet..."}
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2 text-[#5D4E45] text-xs">
                    <Clock size={12} />
                    <span>{new Date(project.lastModified).toLocaleDateString()}</span>
                    <span className="mx-1">•</span>
                    <span>{project.shots.length} shots</span>
                  </div>
                  
                  <button
                    onClick={(e) => onDeleteProject(project.id, e)}
                    className="p-2 text-[#5D4E45] hover:text-[#8A1C1C] hover:bg-[#8A1C1C]/10 rounded-lg transition-colors z-10"
                    title="Delete Mooovie"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              {/* Hover Arrow */}
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                 <ArrowRight className="text-[#C6934B]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-[#15100E] border border-[#C6934B] w-full max-w-md p-6 rounded-2xl shadow-2xl shadow-[#C6934B]/20 animate-in zoom-in-95 duration-200 relative">
             <button 
               onClick={() => setIsModalOpen(false)}
               className="absolute top-4 right-4 text-[#5D4E45] hover:text-[#FDF0C9] transition-colors"
             >
               <X size={20} />
             </button>
             
             <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 bg-[#C6934B] rounded-lg flex items-center justify-center text-[#15100E]">
                 <Film size={20} />
               </div>
               <h2 className="text-2xl font-bold text-[#FDF0C9]">Name Production</h2>
             </div>

             <form onSubmit={handleConfirmCreate}>
               <label className="text-xs uppercase font-bold text-[#8C7A70] mb-2 block">Mooovie Title</label>
               <input 
                 autoFocus
                 type="text" 
                 value={newTitle}
                 onChange={(e) => setNewTitle(e.target.value)}
                 className="w-full bg-[#2A1F1B] border border-[#3E2F28] text-[#FDF0C9] text-lg px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#C6934B] outline-none mb-6 placeholder-[#5D4E45]"
                 placeholder="e.g. The Neon Detective"
               />
               <div className="flex gap-3 justify-end">
                 <button 
                   type="button"
                   onClick={() => setIsModalOpen(false)}
                   className="px-4 py-2 text-[#8C7A70] hover:text-[#FDF0C9] font-medium"
                 >
                   Cancel
                 </button>
                 <button 
                   type="submit"
                   disabled={!newTitle.trim()}
                   className="bg-[#C6934B] hover:bg-[#B5823A] disabled:opacity-50 text-[#15100E] px-6 py-2 rounded-lg font-bold transition-all"
                 >
                   Action!
                 </button>
               </div>
             </form>
           </div>
        </div>
      )}
    </>
  );
};