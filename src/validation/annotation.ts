import { z } from 'zod';

export const annotationAttributesSchema = z.object({
  name: z.string(),
  value: z.string(),
});

export const annotationSchema = z.object({
  type: z.string(),
  index: z.number(),
  length: z.number(),
  attributes: z.array(annotationAttributesSchema).optional(),
});
