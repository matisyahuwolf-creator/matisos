import type { Modality } from './modalities'

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced'

export type CatalogEntry = {
  id: string
  name: string
  difficulty: Difficulty
  benefits: string
  modality: Modality
}
