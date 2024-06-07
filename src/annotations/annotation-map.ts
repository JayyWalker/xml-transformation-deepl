import type { Annotation } from './annotation-converter.ts'

export const annotationMap = {
  linebreak: {
    onAnnotationStart: () => '<br>',
    onAnnotationEnd: () => '',
  },
  bold: {
    onAnnotationStart: () => '<b>',
    onAnnotationEnd: () => '</b>',
  },
  underlined: {
    onAnnotationStart: () => '<span>',
    onAnnotationEnd: () => '</span>',
  },
  italic: {
    onAnnotationStart: () => '<i>',
    onAnnotationEnd: () => '</i>',
  },
  drop_caps: {
    onAnnotationStart: () => '<span data-caps="initial">',
    onAnnotationEnd: () => '</span>',
  },
  scaps: {
    onAnnotationStart: () => '<small>',
    onAnnotationEnd: () => '</small>',
  },
  subscript: {
    onAnnotationStart: () => '<sub>',
    onAnnotationEnd: () => '</sub>',
  },
  superscript: {
    onAnnotationStart: () => '<sup>',
    onAnnotationEnd: () => '</sup>',
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
      return `<a ${[href, target, relation].join(' ').trim()}>`;
    },
    onAnnotationEnd: () => '</a>',
  },
  internal_link: {
    onAnnotationStart: (annotation: Annotation) => {
      const internalLink = annotation.attributes?.find((attribute) => attribute.name == 'href')?.value;
      const href = internalLink ? `href="${internalLink}"` : 'href=""';
      const newWindow = annotation.attributes?.find((attribute) => attribute.name == 'new_window')?.value;
      const target = newWindow ? 'target="_blank"' : '';
      const noFollow = annotation.attributes?.find((attribute) => attribute.name == 'no_follow')?.value;
      const relation = noFollow ? 'rel="nofollow"' : '';

      return `<a ${[href, target, relation].join(' ').trim()}>`;
    },

    onAnnotationEnd: () => {
      return `</a>`;
    },
  },
  ufinish: {
    onAnnotationStart: () => '<span class="ufinish">',
    onAnnotationEnd: () => '</span>',
  },
};
