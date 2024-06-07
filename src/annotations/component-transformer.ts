import { annotationConverter } from './annotation-converter.ts'
import type { Component } from '../validation/components.ts'
import type { Context } from './context.ts'
import { LookupService } from '../services/LookupService.ts'

export enum VideoSourceType {
  // YouTube video
  Youtube = 'YOUTUBE',
  // Default video source
  Default = 'DEFAULT',
}

export async function transformer (component: Component): Promise<Component> {
  switch (component.type) {
    case 'PARAGRAPH':
    case 'BLOCK_QUOTE':
    case 'PULL_QUOTE':
    case 'BOOK_INFO':
      if ( !component.annotations.some((annotation) => annotation.type == 'internal_link')) {
        component.textHtml = annotationConverter.convertText(component.text, component.annotations)
        // component.textJson = JsonConverter.convertText(component.text, component.annotations);
      }
      break
    case 'ORDERED_LIST':
    case 'UNORDERED_LIST':
      component.items.forEach((item) => {
        if ( !item.annotations.some((annotation) => annotation.type == 'internal_link')) {
          item.textHtml = annotationConverter.convertText(item.text, item.annotations)
          // item.textJson = JsonConverter.convertText(item.text, item.annotations);
        }
      })
      break
    case 'IMAGE':
      // await ImageService.validateReferencedImage(context.dbClient, context.logger, component.sourceId);
      if (component.caption) {
        if ( !component.caption.annotations.some((annotation) => annotation.type == 'internal_link')) {
          component.caption.textHtml = annotationConverter.convertText(
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
