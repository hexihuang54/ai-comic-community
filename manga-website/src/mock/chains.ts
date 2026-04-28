import type { MangaChain, AIPage } from '../types';

const STORAGE_KEY = 'manga_chains';

function getAll(): MangaChain[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveAll(chains: MangaChain[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chains));
}

export function addChain(originalMangaId: string, originalTitle: string, chainTitle: string, author: string, pages: AIPage[]): MangaChain {
  const chains = getAll();
  const chain: MangaChain = {
    id: 'chain-' + Date.now(),
    originalMangaId,
    originalTitle,
    chainTitle,
    author,
    pages,
    createdAt: new Date().toISOString(),
    likes: 0,
  };
  chains.push(chain);
  saveAll(chains);
  return chain;
}

export function getChainsByManga(mangaId: string): MangaChain[] {
  return getAll().filter((c) => c.originalMangaId === mangaId);
}

export function getChainById(chainId: string): MangaChain | undefined {
  return getAll().find((c) => c.id === chainId);
}

export function likeChain(chainId: string): boolean {
  const chains = getAll();
  const chain = chains.find((c) => c.id === chainId);
  if (!chain) return false;
  chain.likes += 1;
  saveAll(chains);
  return true;
}
