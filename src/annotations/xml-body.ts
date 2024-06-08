import type { Component } from '../validation/components.ts'
import { type Annotation, AnnotationConverter, type AnnotationInstructions } from './common/annotation-converter.ts'

export async function xmlTransform(component: Component): Promise<string | undefined> {
  switch (component.type) {
    case 'PARAGRAPH':
    case 'BLOCK_QUOTE':
    case 'PULL_QUOTE':
    case 'BOOK_INFO':
      const annotations = xmlAnnotationConverter.convertText(component.text, component.annotations)

      return `<paragraph><text>${annotations}</text></paragraph>`
    case 'ORDERED_LIST':
    case 'UNORDERED_LIST':
      return '<list></list>'
    default:
      return undefined
  }
}

export async function xmlBody(components: Component[]): Promise<string> {
  const transformedComponents = await Promise.all(components.map(component => xmlTransform(component)))

  return `<document>${transformedComponents.join('')}</document>`
}

const xmlAnnotationMap: AnnotationInstructions = {
  linebreak: {
    onAnnotationStart: () => '<linebreak>',
    onAnnotationEnd: () => '</linebreak>',
  },
  bold: {
    onAnnotationStart: () => '<bold>',
    onAnnotationEnd: () => '</bold>',
  },
  underlined: {
    onAnnotationStart: () => '<underlined>',
    onAnnotationEnd: () => '</underlined>',
  },
  italic: {
    onAnnotationStart: () => '<italic>',
    onAnnotationEnd: () => '</italic>',
  },
  drop_caps: {
    onAnnotationStart: () => '<drop_caps>',
    onAnnotationEnd: () => '</drop_caps>',
  },
  scaps: {
    onAnnotationStart: () => '<scaps>',
    onAnnotationEnd: () => '</scaps>',
  },
  subscript: {
    onAnnotationStart: () => '<subscript>',
    onAnnotationEnd: () => '</subscript>',
  },
  superscript: {
    onAnnotationStart: () => '<superscript>',
    onAnnotationEnd: () => '</superscript>',
  },
  external_link: {
    onAnnotationStart: (annotation: Annotation) => {
      // Find href
      const externalLink = annotation.attributes?.find((attribute) => attribute.name == 'href')?.value;
      const href = externalLink ? `href="${externalLink}"` : 'href=""';
      // Find new_window
      const newWindow = annotation.attributes?.find((attribute) => attribute.name == 'new_window')?.value;
      const target = newWindow ? 'target="_blank"' : '';
      // Find no_follow
      const noFollow = annotation.attributes?.find((attribute) => attribute.name == 'no_follow')?.value;
      const relation = noFollow ? 'rel="nofollow"' : '';
      return `<external_link ${[href, target, relation].join(' ').trim()}>`;
    },
    onAnnotationEnd: () => '</external_link>',
  },
  internal_link: {
    onAnnotationStart: (annotation: Annotation) => {
      const internalLink = annotation.attributes?.find((attribute) => attribute.name == 'href')?.value;
      const href = internalLink ? `href="${internalLink}"` : 'href=""';
      const newWindow = annotation.attributes?.find((attribute) => attribute.name == 'new_window')?.value;
      const target = newWindow ? 'target="_blank"' : '';
      const noFollow = annotation.attributes?.find((attribute) => attribute.name == 'no_follow')?.value;
      const relation = noFollow ? 'rel="nofollow"' : '';

      return `<internal_link ${[href, target, relation].join(' ').trim()}>`;
    },

    onAnnotationEnd: () => {
      return `</internal_link>`;
    },
  },
  ufinish: {
    onAnnotationStart: () => '<ufinish>',
    onAnnotationEnd: () => '</ufinish>',
  },
};

const xmlAnnotationConverter = new AnnotationConverter({ converterMap: xmlAnnotationMap })
