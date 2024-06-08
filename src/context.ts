export type Context = {
  // annotationConverter: AnnotationConverter
  websitePrefix: string
}

export function makeContext(): Context {
  return {
    // annotationConverter: new AnnotationConverter({ converterMap: htmlAnnotationMap }),
    websitePrefix: 'http://economist.com',
  }
}
