import axiosInstance from "./api/axiosInstance";
import { API_PATH } from "./api/Apipath";

export interface BookmarkList {
  id: string;
  name: string;
  userId: string;
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
}

export default new BookmarkService();
