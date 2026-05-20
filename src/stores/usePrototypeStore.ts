import { create } from 'zustand'
import type {
  AppTabId,
  HomeStateId,
  InventoryViewId,
  LensStepId,
  RecipeViewId,
} from '../domain/prototype'

type PrototypeState = {
  activeHomeState: HomeStateId
  activeInventoryView: InventoryViewId
  activeLensStep: LensStepId
  activeRecipeView: RecipeViewId
  activeTab: AppTabId
  setActiveHomeState: (state: HomeStateId) => void
  setActiveInventoryView: (view: InventoryViewId) => void
  setActiveLensStep: (step: LensStepId) => void
  setActiveRecipeView: (view: RecipeViewId) => void
  setActiveTab: (tab: AppTabId) => void
}

export const usePrototypeStore = create<PrototypeState>((set) => ({
  activeHomeState: 'default',
  activeInventoryView: 'list',
  activeLensStep: 'camera',
  activeRecipeView: 'main',
  activeTab: 'home',
  setActiveHomeState: (activeHomeState) => set({ activeHomeState }),
  setActiveInventoryView: (activeInventoryView) => set({ activeInventoryView }),
  setActiveLensStep: (activeLensStep) => set({ activeLensStep }),
  setActiveRecipeView: (activeRecipeView) => set({ activeRecipeView }),
  setActiveTab: (activeTab) => set({ activeTab }),
}))
