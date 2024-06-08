import { type Annotation, AnnotationConverter } from './common/annotation-converter.ts'
import type { Component } from '../validation/components.ts'
import { LookupService } from '../services/LookupService.ts'

export enum VideoSourceType {
  // YouTube video
  Youtube = 'YOUTUBE',
  // Default video source
  Default = 'DEFAULT',
}

export async function htmlTransformer (component: Component): Promise<Component> {
  switch (component.type) {
    case 'PARAGRAPH':
    case 'BLOCK_QUOTE':
    case 'PULL_QUOTE':
    case 'BOOK_INFO':
      if ( !component.annotations.some((annotation) => annotation.type == 'internal_link')) {
        component.textHtml = htmlAnnotationConverter.convertText(component.text, component.annotations)
        // component.textJson = JsonConverter.convertText(component.text, component.annotations);
      }
      break
    case 'ORDERED_LIST':
    case 'UNORDERED_LIST':
      component.items.forEach((item) => {
        if ( !item.annotations.some((annotation) => annotation.type == 'internal_link')) {
          item.textHtml = htmlAnnotationConverter.convertText(item.text, item.annotations)
          // item.textJson = JsonConverter.convertText(item.text, item.annotations);
        }
      })
      break
    case 'IMAGE':
      // await ImageService.validateReferencedImage(context.dbClient, context.logger, component.sourceId);
      if (component.caption) {
        if ( !component.caption.annotations.some((annotation) => annotation.type == 'internal_link')) {
          component.caption.textHtml = htmlAnnotationConverter.convertText(
            component.caption.text,
            component.caption.annotations,
          )
          // component.caption.textJson = JsonConverter.convertText(component.caption.text, component.caption.annotations);
        }
      }
      break
    case 'VIDEO':
      const videoMetadata = await LookupService.getVideoMetadata(component.url)

      component.videoSource = videoMetadata.source === 'YouTube' ? VideoSourceType.Youtube : VideoSourceType.Default
      component.title = videoMetadata.title
      component.thumbnailImage = videoMetadata.thumbnailImage

      // component.id = UrlService.parseIdFromHtml(videoMetadata.html);
      component.id = 'some-youtube-id'
      break
    case 'GENERIC_EMBED':
      // await UrlService.validateURL(context.logger, component.url);
      // component.url = UrlService.transformSpotifyEmbedURL(context.logger, component.url as string);
      component.url = 'spotify-url'
      break
    case 'INFOGRAPHIC':
      // await UrlService.validateURL(context.logger, component.url);
      break
  }
  return component
}

export const htmlAnnotationMap = {
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

export const htmlAnnotationConverter = new AnnotationConverter({ converterMap: htmlAnnotationMap });
