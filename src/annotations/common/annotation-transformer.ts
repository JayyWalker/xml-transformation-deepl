import type { Annotation } from './annotation-converter.ts'
import type { Context } from '../../context.ts'
import { ArticleService } from '../../services/ArticleService.ts'

const allowedAnnotations = [
  'linebreak',
  'bold',
  'underlined',
  'italic',
  'drop_caps',
  'scaps',
  'subscript',
  'superscript',
  'external_link',
  'internal_link',
  'ufinish',
]

export async function transformAndPruneAnnotations (annotations: Annotation[], context: Context): Promise<Annotation[]> {
  // check each annotation to see if we want to keep it
  const transformedAnnotations = await Promise.all(annotations.map(transformInternalLinks(context)))
  const prunedAnnotations = transformedAnnotations
    .filter((annotation): annotation is Annotation => annotation != undefined)
    .filter((annotation) => allowedAnnotations.includes(annotation.type))
    .filter((annotation) => annotation.index >= 0)

  return prunedAnnotations
}

async function findCanonicalUrl () {
  return 'http://some-econmist-url'
}

// Convert internal links to public URLs. Return `undefined` for anything which isn't published
const transformInternalLinks =
  (context: Context) =>
    async (annotation: Annotation): Promise<Annotation | undefined> => {
      if (annotation.type == 'internal_link') {
        if ( !annotation.attributes) {
          console.trace('No attributes found on internal_link')
          return undefined
        }

        const linkIndex = annotation.attributes.findIndex((attribute) => attribute.name === 'href')
        if (linkIndex == -1) {
          console.trace('No href found on internal_link')
          return undefined
        }

        const internalLink = annotation.attributes[linkIndex].value
        const internalLinkId = internalLink.split('/').reverse()[0]
        let canonicalUrl

        try {
          console.trace({ internal_link_id: internalLink }, 'Started Find Canonical Url')
          canonicalUrl = await findCanonicalUrl()
          console.trace({ internal_link_id: internalLink }, 'Finished Find Canonical Url')
        } catch (error) {
          console.error({ error, internalLinkId }, 'Error finding canonical URL}')
          return undefined
        }

        if ( !canonicalUrl) {
          console.warn({ internalLinkId }, 'Unable to find canonical URL')
          return undefined
        }

        // annotation.attributes[linkIndex].value = UrlService.relativeToAbsoluteUrl(canonicalUrl, context.websitePrefix)
        annotation.attributes[linkIndex].value = 'https://economist.com/2024/03/24/some-fake-path'

        console.info({ annotation }, 'annotation transformer')

        const linkedArticle = await ArticleService.load()

        // const linkedArticle = await ArticleService.load(context.logger, context.dbClient, {
        //   sourceId: internalLinkId,
        //   sourceType: SourceType.CUE,
        //   state: PageState.PUBLISHED,
        // });

        if (linkedArticle && linkedArticle.url) {
          annotation.attributes.push(
            {
              name: 'id',
              value: linkedArticle.id,
            },
            {
              name: 'type',
              // value: ContentType.Article,
              value: 'Article',
            },
          )
        } else {
          console.warn(`linkedArticle or its URL is not found by resolver for internalLink - ${internalLink}`)
          return undefined
        }
      }

      return annotation
    }
