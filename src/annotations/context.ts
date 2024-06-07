import { type Annotation, AnnotationConverter } from './annotation-converter.ts'
import { annotationMap } from './annotation-map.ts'


export type Context = {
  annotationConverter: AnnotationConverter
  websitePrefix: string
}

export function makeContext(): Context {
  return {
    annotationConverter: new AnnotationConverter({ converterMap: annotationMap }),
    websitePrefix: 'http://economist.com',
  }
}
