import modi from './../articles/a-shock-election-result-in-india-humbles-narendra-modi/article-body.json'
import { z } from 'zod'
import { allComponents, type Component } from './validation/components.ts'
import {inspect} from 'util'
import { htmlTransformer } from './annotations/html-annotations.ts'
import { log } from './log.ts'
import { xmlBody, xmlTransform } from './annotations/xml-body.ts'
import xmlFormat from 'xml-formatter'
import { resolve } from 'path'
import { parseString } from './xml'


function getJson() {
  const slimJson = modi.map(component => {

    const result = {
      text: component.text,
      type: component.type,
      annotations: component.annotations,
    }

    // @ts-ignore
    if (component?.components) {
      // @ts-ignore
      result.components = component?.components
    }

    return result
  })

  // console.log(slimJson)

  return slimJson
}

async function generateXml() {
  // let body: Component[] | undefined = undefined;
  let body: any

  const input = getJson()

  const parsedBody = z.array(allComponents).safeParse(input)

  // console.log(parsedBody.data)

  if (parsedBody.success && parsedBody.data) {
    // body = await Promise.all(parsedBody.data.map(component => htmlTransformer(component)))
    body = await xmlBody(parsedBody.data)
  } else {
    console.error('UNDEFINED DATA AFTER PARSE')
    console.error(parsedBody.error)
    return
  }

  const result = xmlFormat(body)

  console.log(result)
  // log(body)
}

async function generateAnnotations() {
  const filePath = resolve('articles/a-shock-election-result-in-india-humbles-narendra-modi/text-strings-example-modi.xml')

  const file = Bun.file(filePath)

  const rawXml = await file.text()

  const parsedXml = parseString(rawXml)

  // console.log(parsedXml.document.entries())gt
  log(parsedXml)
}

async function main () {
  await generateAnnotations()

  // await generateXml()
}

main()
