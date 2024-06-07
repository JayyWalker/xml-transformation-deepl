import { z } from 'zod';
import { annotationSchema } from './annotation.ts';

export const paragraphComponentSchema = z.object({
  type: z.literal('PARAGRAPH'),
  text: z.string(),
  annotations: z.array(annotationSchema),
  textHtml: z.string().optional(),
  textJson: z.any().optional(),
});

export const unknownComponentSchema = z.object({
  type: z.literal('UNKNOWN'),
  metadata: z.any(),
});

export const annotatedTextSchema = z.object({
  text: z.string(),
  annotations: z.array(annotationSchema),
  textHtml: z.string().optional(),
  textJson: z.any().optional(),
});

export const orderedListComponentSchema = z.object({
  type: z.literal('ORDERED_LIST'),
  items: z.array(annotatedTextSchema),
})

export const unorderedListComponentSchema = z.object({
  type: z.literal('UNORDERED_LIST'),
  items: z.array(annotatedTextSchema),
});

export const pullQuoteComponentSchema = z.object({
  type: z.literal('PULL_QUOTE'),
  text: z.string(),
  annotations: z.array(annotationSchema),
  textHtml: z.string().optional(),
  textJson: z.any().optional(),
});

export const blockQuoteComponentSchema = z.object({
  type: z.literal('BLOCK_QUOTE'),
  text: z.string(),
  annotations: z.array(annotationSchema),
  textHtml: z.string().optional(),
  textJson: z.any().optional(),
});

export const dividerComponentSchema = z.object({
  type: z.literal('DIVIDER'),
});

export const crossHeadComponentSchema = z.object({
  type: z.literal('CROSSHEAD'),
  text: z.string(),
  annotations: z.array(annotationSchema).optional(),
});

export const bookInfoComponentSchema = z.object({
  type: z.literal('BOOK_INFO'),
  text: z.string(),
  annotations: z.array(annotationSchema),
  textHtml: z.string().optional(),
  textJson: z.any().optional(),
});

export const imageComponentSchema = z.object({
  type: z.literal('IMAGE'),
  cueId: z.string().optional(),
  sourceId: z.string().optional(),
  sourceType: z.enum(['CUE', 'DRUPAL']).default('CUE').optional(),
  mode: z.enum(['NORMAL', 'SLIM']),
  altText: z.string(),
  imageType: z
    .enum([
      'PHOTOGRAPH',
      'ILLUSTRATION',
      'CHART',
      'MAP',
      'COVER',
      'SQUARE_COVER',
      'UNKNOWN',
      'FALLBACK',
      'TABLE',
      'TEASER',
    ])
    .default('UNKNOWN'),
  caption: annotatedTextSchema.optional(),
  source: z.string().optional(),
  credit: z.string().optional(),
  dateModified: z.string().optional(),
});

export const dbImageComponentSchema = z.object({
  type: z.literal('IMAGE'),
  cue_id: z.string().optional(),
  source_id: z.string().optional(),
  source_type: z.enum(['CUE', 'DRUPAL']).default('CUE').optional(),
  mode: z.enum(['NORMAL', 'SLIM']),
  alt_text: z.string(),
  image_type: z
    .enum([
      'PHOTOGRAPH',
      'ILLUSTRATION',
      'CHART',
      'MAP',
      'COVER',
      'SQUARE_COVER',
      'UNKNOWN',
      'FALLBACK',
      'TABLE',
      'TEASER',
    ])
    .default('UNKNOWN'),
  caption: annotatedTextSchema.optional(),
  source: z.string().optional(),
  credit: z.string().optional(),
  date_modified: z.string().optional(),
});

export const infographicComponentSchema = z.object({
  type: z.literal('INFOGRAPHIC'),
  url: z.string().url(),
  title: z.string(),
  layout: z.enum(['STANDARD', 'WIDE']).default('STANDARD'),
  height: z.number().optional(),
  width: z.number().optional(),
  altText: z.string().optional(),
  fallback: imageComponentSchema.optional(),
});

export const videoComponentSchema = z.object({
  type: z.literal('VIDEO'),
  id: z.string().optional(),
  videoSource: z.enum(['YOUTUBE', 'DEFAULT']).optional(),
  url: z.string().optional(),
  thumbnailImage: z.string().optional(),
  title: z.string().optional(),
});

export const genericEmbedComponentSchema = z.object({
  type: z.literal('GENERIC_EMBED'),
  url: z.string().optional(),
});

export const component = z.union([
  paragraphComponentSchema,
  imageComponentSchema,
  orderedListComponentSchema,
  unorderedListComponentSchema,
  pullQuoteComponentSchema,
  blockQuoteComponentSchema,
  dividerComponentSchema,
  crossHeadComponentSchema,
  unknownComponentSchema,
  bookInfoComponentSchema,
  videoComponentSchema,
  infographicComponentSchema,
  genericEmbedComponentSchema,
]);

export const dbComponent = z.union([
  paragraphComponentSchema,
  dbImageComponentSchema,
  orderedListComponentSchema,
  unorderedListComponentSchema,
  pullQuoteComponentSchema,
  blockQuoteComponentSchema,
  dividerComponentSchema,
  crossHeadComponentSchema,
  bookInfoComponentSchema,
  videoComponentSchema,
  infographicComponentSchema,
  genericEmbedComponentSchema,
]);

export const dbInfoboxComponentSchema = z.object({
  type: z.literal('INFOBOX'),
  components: z.array(dbComponent),
});

export const infoboxComponentSchema = z.object({
  type: z.literal('INFOBOX'),
  components: z.array(component),
});

export const allComponents = component.or(infoboxComponentSchema);

export const allDbComponents = dbComponent.or(dbInfoboxComponentSchema);

export type Component = z.TypeOf<typeof allComponents>;
export type DbComponent = z.TypeOf<typeof allDbComponents>;
export type VideoComponent = z.TypeOf<typeof videoComponentSchema>;

export function componentFromSnakeCase(snakeCaseComponent?: DbComponent): Component | undefined {
  if (!snakeCaseComponent) {
    return undefined;
  }

  switch (snakeCaseComponent.type) {
    case 'IMAGE':
      return {
        type: 'IMAGE',
        sourceId: snakeCaseComponent.source_id ?? snakeCaseComponent.cue_id,
        sourceType: snakeCaseComponent.source_type,
        imageType: snakeCaseComponent.image_type,
        altText: snakeCaseComponent.alt_text,
        mode: snakeCaseComponent.mode,
        caption: snakeCaseComponent.caption,
        source: snakeCaseComponent.source,
        credit: snakeCaseComponent.credit,
        dateModified: snakeCaseComponent.date_modified,
      };
    default:
      return snakeCaseComponent as Component;
  }
}

export function componentToSnakeCase(camelCaseComponent?: Component): DbComponent | undefined {
  if (!camelCaseComponent) {
    return undefined;
  }

  switch (camelCaseComponent.type) {
    case 'IMAGE':
      return {
        type: 'IMAGE',
        source_id: camelCaseComponent.sourceId ?? camelCaseComponent.cueId,
        source_type: camelCaseComponent.sourceType ?? 'CUE',
        image_type: camelCaseComponent.imageType,
        alt_text: camelCaseComponent.altText,
        mode: camelCaseComponent.mode,
        caption: camelCaseComponent.caption,
        source: camelCaseComponent.source,
        credit: camelCaseComponent.credit,
        date_modified: camelCaseComponent.dateModified,
      };
    default:
      return camelCaseComponent as DbComponent;
  }
}
