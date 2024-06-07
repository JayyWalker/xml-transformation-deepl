import { splitStringAtPoints, interleaveArrays } from './utilities.ts';
import { cloneDeep } from 'lodash';
import { createSpanTree, type SpanTree, flatten } from './span-tree.ts';
import { annotationMap } from './annotation-map.ts'
import { z } from 'zod'
import type { annotationSchema } from '../validation/annotation.ts'

export interface Tag {
  tag: string;
  position: number;
}

// Attributes to apply to an annotation e.g. URL and new window attributes for a hyperlink
export type AnnotationAttribute = {
  // The attribute name e.g. 'href'
  name: string
  // The attribute value e.g. 'https://www.economist.com'
  value: string
}

// An annotation to apply to text e.g. bold or italics
// export type Annotation = {
//   // The type of annotation e.g. 'bold'
//   type: string
//   //  Where in the text string the annotation begins e.g. 0 would be at the start of the text
//   index: number
//   // How long the annotation is e.g. 5 would be 5 characters long
//   length: number
//   // Optional additional attributes to apply to the annotation
//   attributes: AnnotationAttribute[]
// }

export type Annotation = z.infer<typeof annotationSchema>

export interface AnnotationTagInstructions {
  onAnnotationStart: (annotation: Annotation) => string;
  onAnnotationEnd: (annotation: Annotation) => string;
}

interface AnnotationConverterProps {
  converterMap: Record<string, AnnotationTagInstructions>;
}

export function convertTreeToTags(
  tree: SpanTree<Annotation>,
  converterMap: Record<string, AnnotationTagInstructions>,
): Tag[] {
  return flatten(tree, (item) => {
    item.length = item.length < 0 ? 0 : item.length;
    const converter = converterMap[item.type];
    if (!converter) {
      return undefined;
    }
    return [
      { tag: converter.onAnnotationStart(item), position: item.index },
      { tag: converter.onAnnotationEnd(item), position: item.index + item.length },
    ];
  });
}

export class AnnotationConverter {
  constructor(private props: AnnotationConverterProps) {}

  convertText(text: string, annotations: Annotation[]): string {
    const annotationsCopy = cloneDeep(annotations);
    // Call to create annotation tree
    const tree = createSpanTree(annotationsCopy);
    const tags = convertTreeToTags(tree, this.props.converterMap);

    // Remove empty tags when internal links is not rendered
    const filterEmptyTags = tags.filter((tag: Tag) => {
      return tag.tag !== '';
    });

    // Get all the tag indexes
    const splitPoints = filterEmptyTags.map((tag: Tag) => tag.position);

    // Split the string into parts based on the position of the tags
    const splitValues = splitStringAtPoints(text, splitPoints);

    // Get all the tags
    const tagValues = filterEmptyTags.map((tag: Tag) => tag.tag);

    // interleave the split values with the tags
    return interleaveArrays(splitValues, tagValues).join('');
  }
}

export const annotationConverter = new AnnotationConverter({ converterMap: annotationMap });
