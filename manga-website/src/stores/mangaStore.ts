import { create } from 'zustand';
import type { AIManga } from '../types';
import * as mangaMock from '../mock/manga';

interface MangaState {
  mangas: AIManga[];
  searchKeyword: string;
  filteredMangas: AIManga[];
  loadMangas: () => void;
  setSearchKeyword: (keyword: string) => void;
  addManga: (manga: Omit<AIManga, 'id' | 'createdAt'>) => AIManga;
  deleteManga: (id: string) => boolean;
  refreshMangas: () => void;
  updateMangaAuditStatus: (mangaId: string, status: 'approved' | 'rejected', rejectReason?: string) => boolean;
  appendPages: (mangaId: string, newPages: Array<{ prompt: string; imageUrl: string }>) => AIManga | null;
}

export const useMangaStore = create<MangaState>((set, get) => ({
  mangas: [],
  searchKeyword: '',
  filteredMangas: [],

  loadMangas: () => {
    const mangas = mangaMock.getAllMangas();
    // 公开列表只展示审核通过的作品
    const publicMangas = mangas.filter((m) => m.auditStatus === 'approved');
    const { searchKeyword } = get();
    const filtered = searchKeyword
      ? publicMangas.filter(
          (m) =>
            m.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            m.author.toLowerCase().includes(searchKeyword.toLowerCase())
        )
      : publicMangas;
    set({ mangas, filteredMangas: filtered });
  },

  setSearchKeyword: (keyword: string) => {
    const { mangas } = get();
    const publicMangas = mangas.filter((m) => m.auditStatus === 'approved');
    const filtered = keyword
      ? publicMangas.filter(
          (m) =>
            m.title.toLowerCase().includes(keyword.toLowerCase()) ||
            m.author.toLowerCase().includes(keyword.toLowerCase())
        )
      : publicMangas;
    set({ searchKeyword: keyword, filteredMangas: filtered });
  },

  addManga: (manga) => {
    const newManga = mangaMock.addManga(manga);
    get().loadMangas();
    return newManga;
  },

  deleteManga: (id) => {
    const result = mangaMock.deleteManga(id);
    if (result) get().loadMangas();
    return result;
  },

  refreshMangas: () => {
    get().loadMangas();
  },

  updateMangaAuditStatus: (mangaId, status, rejectReason) => {
    const result = mangaMock.updateMangaStatus(mangaId, status, rejectReason);
    if (result) get().loadMangas();
    return !!result;
  },

  appendPages: (mangaId, newPages) => {
    const result = mangaMock.appendMangaPages(mangaId, newPages);
    if (result) get().loadMangas();
    return result;
  },
}));
