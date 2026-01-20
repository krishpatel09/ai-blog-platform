import axiosInstance from "@/services/api/axiosInstance";
import { API_PATH } from "@/services/api/Apipath";

export const imageKitAuthenticator = async () => {
  try {
    const response = await axiosInstance.get(API_PATH.IMAGEKIT.AUTH);

    if (!response.data) {
      throw new Error("No data received from authentication server");
    }

    const data = response.data;
    console.log("Frontend: Received Auth Data from Backend:", data);
    // CHECK: Verify these match exactly what the backend generated.

    const { signature, expire, token } = data;
    return { signature, expire, token };
  } catch (error: any) {
    throw new Error(`Authentication request failed: ${error.message || error}`);
  }
};
