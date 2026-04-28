import { create } from 'zustand';
import type { Comment } from '../types';
import * as interactionsMock from '../mock/interactions';

interface InteractionState {
  // 刷新触发
  refreshKey: number;
  triggerRefresh: () => void;

  // 点赞
  toggleLike: (mangaId: string, username: string) => { liked: boolean; count: number };
  getLikeCount: (mangaId: string) => number;
  hasLiked: (mangaId: string, username: string) => boolean;

  // 催更
  addUrge: (mangaId: string, username: string) => { count: number; already: boolean };
  getUrgeCount: (mangaId: string) => number;
  hasUrged: (mangaId: string, username: string) => boolean;

  // 评论
  addComment: (mangaId: string, username: string, content: string) => Comment;
  getComments: (mangaId: string) => Comment[];
  deleteComment: (mangaId: string, commentId: string) => boolean;
}

export const useInteractionStore = create<InteractionState>((set, get) => ({
  refreshKey: 0,

  triggerRefresh: () => set((s) => ({ refreshKey: s.refreshKey + 1 })),

  toggleLike: (mangaId, username) => {
    const result = interactionsMock.toggleLike(mangaId, username);
    get().triggerRefresh();
    return result;
  },

  getLikeCount: (mangaId) => interactionsMock.getLikeCount(mangaId),

  hasLiked: (mangaId, username) => interactionsMock.hasLiked(mangaId, username),

  addUrge: (mangaId, username) => {
    const result = interactionsMock.addUrge(mangaId, username);
    get().triggerRefresh();
    return result;
  },

  getUrgeCount: (mangaId) => interactionsMock.getUrgeCount(mangaId),

  hasUrged: (mangaId, username) => interactionsMock.hasUrged(mangaId, username),

  addComment: (mangaId, username, content) => {
    const comment = interactionsMock.addComment(mangaId, username, content);
    get().triggerRefresh();
    return comment;
  },

  getComments: (mangaId) => interactionsMock.getComments(mangaId),

  deleteComment: (mangaId, commentId) => {
    const result = interactionsMock.deleteComment(mangaId, commentId);
    if (result) get().triggerRefresh();
    return result;
  },
}));
