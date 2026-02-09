export interface Character {
  id: string;
  name: string;
  description: string;
  styleAnchor?: string; 
  color: string;
}

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '3:4' | '21:9';
export type Resolution = '1080p' | '720p' | '4k';
export type VeoModel = 'veo-3.1-generate-preview' | 'veo-3.1-fast-generate-preview';

export interface Shot {
  id: string;
  sequenceOrder: number;
  actionPrompt: string; 
  environment?: string;
  action?: string;
  camera?: string;
  negativePrompt?: string;
  charactersInvolved: string[]; 
  model: VeoModel;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  duration?: number; 
  isContinuation: boolean; 
  referenceImageNotes?: string;
}

export interface Project {
  id: string;
  title: string;
  cinematicVibe: string;
  shots: Shot[];
  characters: Character[]; // Each project now owns its cast
  lastModified: number;
}

export interface StudioState {
  projects: Project[];
}