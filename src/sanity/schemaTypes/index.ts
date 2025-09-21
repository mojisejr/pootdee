import type {SchemaTypeDefinition} from 'sanity'
import {phraseType} from './phrase'

export const schema: {types: SchemaTypeDefinition[]} = {
  types: [phraseType],
}
