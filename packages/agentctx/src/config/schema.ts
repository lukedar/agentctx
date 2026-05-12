import { z } from "zod";

export const agentCtxConfigSchema = z.object({
  contextPoints: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().optional(),
        type: z.string().optional(),
        primaryPaths: z.array(z.string().min(1)).min(1)
      })
    )
    .optional(),
  surfaces: z.array(z.enum(["agents-md", "llms-txt"])).optional()
});
