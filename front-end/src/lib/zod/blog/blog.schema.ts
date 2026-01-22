import { z } from "zod";

export const blogSchema = z.object({
  coverImage: z.string().nullable().optional(),
  title: z.string().min(1, "Title is required"),
  tags: z.array(z.string()).min(1, "Tags are required"),
  content: z.any().superRefine((val, ctx) => {
    if (!val) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Blog content cannot be empty",
      });
      return;
    }
    let length = 0;
    if (typeof val === "string") {
      length = val.trim().length;
    } else if (
      typeof val === "object" &&
      val !== null &&
      "type" in val &&
      val.type === "doc"
    ) {
      const getTextLength = (node: any): number => {
        let count = 0;
        if (node.text) count += node.text.trim().length;
        if (Array.isArray(node.content)) {
          count += node.content.reduce(
            (acc: number, child: any) => acc + getTextLength(child),
            0,
          );
        }
        return count;
      };
      length = getTextLength(val);
    } else {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid content format",
      });
      return;
    }

    if (length < 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Blog content must be at least 100 characters",
      });
    }
    if (length > 20000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Blog content cannot exceed 20,000 characters",
      });
    }
  }),
});

export type BlogSchema = z.infer<typeof blogSchema>;
