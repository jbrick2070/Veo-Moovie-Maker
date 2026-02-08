
export interface Character {
  id: string;
  name: string;
  description: string; // The immutable visual description ("Visual DNA")
  styleAnchor?: string; 
  color: string; // UI helper
}

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '3:4' | '21:9';
export type Resolution = '1080p' | '720p' | '4k';
export type VeoModel = 'veo-3.1-generate-preview' | 'veo-3.1-fast-generate-preview';

export interface Shot {
  id: string;
  sequenceOrder: number;
  
  // The final combined prompt sent to the API
  actionPrompt: string; 
  
  // Granular prompt components for UI/Editing
  environment?: string;
  action?: string;
  camera?: string;

  negativePrompt?: string;
  charactersInvolved: string[]; 
  
  // Veo Specifics
  model: VeoModel;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  duration?: number; 
  
  // Continuity Logic
  isContinuation: boolean; 
  referenceImageNotes?: string;
}

export interface Project {
  id: string;
  title: string;
  cinematicVibe: string; // Formerly globalStyleAnchor
  shots: Shot[];
  lastModified: number;
}

// The entire app state if we were to save it all
export interface StudioState {
  characters: Character[]; // Global Cast
  projects: Project[];     // List of Series
}
