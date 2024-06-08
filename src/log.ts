import { inspect } from 'util'

export function log(input: object): void {
  console.log(inspect(input, false, null, true /* enable colors */))
}
