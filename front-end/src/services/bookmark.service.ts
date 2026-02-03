import axiosInstance from "./api/axiosInstance";
import { API_PATH } from "./api/Apipath";

export interface BookmarkList {
  id: string;
  name: string;
  userId: string;
  isPrivate: boolean;
  createdAt?: string;
  items: BookmarkItem[];
  _count?: {
    items: number;
  };
}

export interface BookmarkItem {
  listId: string;
  postId: string;
  post?: any;
}

class BookmarkService {
  async createList(name: string): Promise<BookmarkList> {
    const response = await axiosInstance.post(API_PATH.BOOKMARK.CREATE_LIST, {
      name,
    });
    return response.data;
  }

  async getLists(): Promise<BookmarkList[]> {
    const response = await axiosInstance.get(API_PATH.BOOKMARK.GET_LISTS);
    return response.data;
  }

  async getUserLists(username: string): Promise<BookmarkList[]> {
    const response = await axiosInstance.get(
      `${API_PATH.BOOKMARK.GET_USER_LISTS}${username}`,
    );
    return response.data;
  }

  async getListDetails(id: string): Promise<BookmarkList> {
    const response = await axiosInstance.get(
      `${API_PATH.BOOKMARK.GET_LIST_DETAILS}/${id}`,
    );
    return response.data;
  }

  async addItem(listId: string, postId: string) {
    const response = await axiosInstance.post(
      `${API_PATH.BOOKMARK.ADD_ITEM}/${listId}`,
      { postId },
    );
    return response.data;
  }

  async removeItem(listId: string, postId: string) {
    const response = await axiosInstance.delete(
      `${API_PATH.BOOKMARK.REMOVE_ITEM}/${listId}/${postId}`,
    );
    return response.data;
  }

  async updateList(
    listId: string,
    data: { name?: string; isPrivate?: boolean },
  ) {
    const response = await axiosInstance.post(
      `${API_PATH.BOOKMARK.UPDATE_LIST}/${listId}`,
      data,
    );
    return response.data;
  }

  async deleteList(listId: string) {
    const response = await axiosInstance.delete(
      `${API_PATH.BOOKMARK.DELETE_LIST}/${listId}`,
    );
    return response.data;
  }

  async reorderItems(listId: string, postIds: string[]) {
    const response = await axiosInstance.post(
      `${API_PATH.BOOKMARK.REORDER_ITEMS}/${listId}`,
      { postIds },
    );
    return response.data;
  }
}

export default new BookmarkService();
