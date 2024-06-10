import { X2jOptions, XMLParser } from 'fast-xml-parser'

type XmlDocument = {
  document: {

  }
}

export function parseString(input: string) {
  const options: X2jOptions = {
    // attributesGroupName: '#attributes',
    attributesGroupName: false,
    preserveOrder: true,
    allowBooleanAttributes: true,
    attributeNamePrefix: '#',
    ignoreAttributes: false,
    trimValues: false,
    ignoreDeclaration: true,
    ignorePiTags: true,
    parseAttributeValue: true,
    numberParseOptions: {
      eNotation: false,
      hex: false,
      leadingZeros: false,
    },
    processEntities: false,
  };
  try {
    const parser = new XMLParser(options);

    return parser.parse(input);

  } catch (err) {
    console.log('Failed to parse')

    throw err;
  }
}
