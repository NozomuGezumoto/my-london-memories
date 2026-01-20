// ============================================
// My Kyoto - Global State Management
// Using Zustand with AsyncStorage persistence
// ============================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import {
  MemoryPin,
  Category,
  PinCategory,
  ContextMeta,
  MemoryPinWithDetails,
  CategoryWithCount,
} from '../types';

interface StoreState {
  // Data
  pins: MemoryPin[];
  categories: Category[];
  pinCategories: PinCategory[];
  contextMetas: ContextMeta[];
  
  // UI State
  selectedCategoryId: string | null;
  displayMode: 'original' | 'photo' | 'text';  // original = pinTypeに従う
  
  // Actions - Pins
  addPin: (pin: Omit<MemoryPin, 'id' | 'createdAt'>) => string;
  updatePin: (id: string, updates: Partial<MemoryPin>) => void;
  deletePin: (id: string) => void;
  getPinById: (id: string) => MemoryPin | undefined;
  getPinWithDetails: (id: string) => MemoryPinWithDetails | undefined;
  
  // Actions - Categories
  addCategory: (name: string) => string;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
  getCategoriesWithCounts: () => CategoryWithCount[];
  
  // Actions - Pin-Category Relations
  setPinCategories: (pinId: string, categoryIds: string[]) => void;
  getCategoriesForPin: (pinId: string) => Category[];
  getPinsForCategory: (categoryId: string) => MemoryPin[];
  
  // Actions - Context Meta
  setContextMeta: (pinId: string, meta: Omit<ContextMeta, 'pinId'>) => void;
  getContextMeta: (pinId: string) => ContextMeta | undefined;
  
  // Actions - UI
  setSelectedCategory: (categoryId: string | null) => void;
  setDisplayMode: (mode: 'original' | 'photo' | 'text') => void;
  
  // Computed
  getFilteredPins: () => MemoryPin[];
  getAllPinsWithDetails: () => MemoryPinWithDetails[];
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      pins: [],
      categories: [],
      pinCategories: [],
      contextMetas: [],
      selectedCategoryId: null,
      displayMode: 'photo',
      
      // ============================================
      // Pin Actions
      // ============================================
      
      addPin: (pinData) => {
        const id = uuid.v4() as string;
        const newPin: MemoryPin = {
          ...pinData,
          id,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          pins: [...state.pins, newPin],
        }));
        return id;
      },
      
      updatePin: (id, updates) => {
        set((state) => ({
          pins: state.pins.map((pin) =>
            pin.id === id ? { ...pin, ...updates } : pin
          ),
        }));
      },
      
      deletePin: (id) => {
        set((state) => {
          // Get category IDs associated with this pin
          const pinCategoryIds = state.pinCategories
            .filter((pc) => pc.pinId === id)
            .map((pc) => pc.categoryId);
          
          // Remove pin and its relations
          const newPinCategories = state.pinCategories.filter((pc) => pc.pinId !== id);
          
          // Find categories that now have 0 pins
          const categoriesToDelete = pinCategoryIds.filter((catId) => {
            const remainingPins = newPinCategories.filter((pc) => pc.categoryId === catId);
            return remainingPins.length === 0;
          });
          
          return {
            pins: state.pins.filter((pin) => pin.id !== id),
            pinCategories: newPinCategories,
            contextMetas: state.contextMetas.filter((cm) => cm.pinId !== id),
            categories: state.categories.filter((cat) => !categoriesToDelete.includes(cat.id)),
            selectedCategoryId: categoriesToDelete.includes(state.selectedCategoryId || '')
              ? null
              : state.selectedCategoryId,
          };
        });
      },
      
      getPinById: (id) => {
        return get().pins.find((pin) => pin.id === id);
      },
      
      getPinWithDetails: (id) => {
        const pin = get().getPinById(id);
        if (!pin) return undefined;
        
        return {
          ...pin,
          categories: get().getCategoriesForPin(id),
          contextMeta: get().getContextMeta(id),
        };
      },
      
      // ============================================
      // Category Actions
      // ============================================
      
      addCategory: (name) => {
        const id = uuid.v4() as string;
        const newCategory: Category = {
          id,
          name,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          categories: [...state.categories, newCategory],
        }));
        return id;
      },
      
      updateCategory: (id, name) => {
        set((state) => ({
          categories: state.categories.map((cat) =>
            cat.id === id ? { ...cat, name } : cat
          ),
        }));
      },
      
      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((cat) => cat.id !== id),
          pinCategories: state.pinCategories.filter((pc) => pc.categoryId !== id),
          selectedCategoryId:
            state.selectedCategoryId === id ? null : state.selectedCategoryId,
        }));
      },
      
      getCategoriesWithCounts: () => {
        const { categories, pinCategories } = get();
        return categories.map((cat) => ({
          ...cat,
          pinCount: pinCategories.filter((pc) => pc.categoryId === cat.id).length,
        })).sort((a, b) => b.pinCount - a.pinCount);
      },
      
      // ============================================
      // Pin-Category Relation Actions
      // ============================================
      
      setPinCategories: (pinId, categoryIds) => {
        set((state) => ({
          pinCategories: [
            ...state.pinCategories.filter((pc) => pc.pinId !== pinId),
            ...categoryIds.map((categoryId) => ({ pinId, categoryId })),
          ],
        }));
      },
      
      getCategoriesForPin: (pinId) => {
        const { categories, pinCategories } = get();
        const pinCatIds = pinCategories
          .filter((pc) => pc.pinId === pinId)
          .map((pc) => pc.categoryId);
        return categories.filter((cat) => pinCatIds.includes(cat.id));
      },
      
      getPinsForCategory: (categoryId) => {
        const { pins, pinCategories } = get();
        const pinIds = pinCategories
          .filter((pc) => pc.categoryId === categoryId)
          .map((pc) => pc.pinId);
        return pins.filter((pin) => pinIds.includes(pin.id));
      },
      
      // ============================================
      // Context Meta Actions
      // ============================================
      
      setContextMeta: (pinId, meta) => {
        set((state) => {
          const existing = state.contextMetas.find((cm) => cm.pinId === pinId);
          if (existing) {
            return {
              contextMetas: state.contextMetas.map((cm) =>
                cm.pinId === pinId ? { ...cm, ...meta } : cm
              ),
            };
          }
          return {
            contextMetas: [...state.contextMetas, { pinId, ...meta }],
          };
        });
      },
      
      getContextMeta: (pinId) => {
        return get().contextMetas.find((cm) => cm.pinId === pinId);
      },
      
      // ============================================
      // UI Actions
      // ============================================
      
      setSelectedCategory: (categoryId) => {
        set({ selectedCategoryId: categoryId });
      },

      setDisplayMode: (mode) => {
        set({ displayMode: mode });
      },
      
      // ============================================
      // Computed Values
      // ============================================
      
      getFilteredPins: () => {
        const { pins, selectedCategoryId, pinCategories } = get();
        
        if (!selectedCategoryId) {
          return pins;
        }
        
        const filteredPinIds = pinCategories
          .filter((pc) => pc.categoryId === selectedCategoryId)
          .map((pc) => pc.pinId);
        
        return pins.filter((pin) => filteredPinIds.includes(pin.id));
      },
      
      getAllPinsWithDetails: () => {
        const { pins } = get();
        return pins.map((pin) => ({
          ...pin,
          categories: get().getCategoriesForPin(pin.id),
          contextMeta: get().getContextMeta(pin.id),
        }));
      },
    }),
    {
      name: 'my-kyoto-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        pins: state.pins,
        categories: state.categories,
        pinCategories: state.pinCategories,
        contextMetas: state.contextMetas,
      }),
    }
  )
);

