import modi from './../articles/a-shock-election-result-in-india-humbles-narendra-modi/article-body.json'
import { z } from 'zod'
import { allComponents, type Component } from './validation/components.ts'
import { transformer } from './annotations/component-transformer.ts'
import {inspect} from 'util'

function log(input: object): void {
  console.log(inspect(input, false, null, true /* enable colors */))
}

function getJson() {
  const slimJson = modi.map(component => {

    const result = {
      text: component.text,
      type: component.type,
      annotations: component.annotations,
    }

    if (component?.components) {
      // @ts-ignore
      result.components = component?.components
    }

    return result
  })

  // console.log(slimJson)

  return slimJson
}

async function main () {
  let body: Component[] | undefined = undefined;

  const input = getJson()

  const parsedBody = z.array(allComponents).safeParse(input)

  // console.log(parsedBody.data)

  if (parsedBody.success && parsedBody.data) {
    body = await Promise.all(parsedBody.data.map(component => transformer(component)))
  } else {
    console.error('UNDEFINED DATA AFTER PARSE')
    console.error(parsedBody.error)
    return
  }

  log(body)
}

main()