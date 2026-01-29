import { z } from "zod";

export const scheduleSchema = z
  .object({
    scheduledDate: z.string().optional(),
    scheduledTime: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.scheduledDate && !data.scheduledTime) {
        return false;
      }
      return true;
    },
    {
      message: "time select this",
      path: ["scheduledTime"],
    },
  );
