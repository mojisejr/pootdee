import {defineField, defineType} from 'sanity'

export const phraseType = defineType({
  name: 'phrase',
  title: 'English Phrase',
  type: 'document',
  fields: [
    defineField({
      name: 'englishPhrase',
      title: 'English Phrase',
      type: 'text',
      description: 'The English phrase to be analyzed',
      validation: (Rule) => Rule.required().max(500).error('English phrase is required and must be under 500 characters')
    }),
    defineField({
      name: 'userTranslation',
      title: 'User Translation',
      type: 'text',
      description: "User's translation attempt",
      validation: (Rule) => Rule.max(500).error('User translation must be under 500 characters')
    }),
    defineField({
      name: 'analysis',
      title: 'AI Analysis Result',
      type: 'object',
      description: 'AI-generated analysis of the phrase and translation',
      fields: [
        defineField({
          name: 'correctness',
          title: 'Correctness Level',
          type: 'string',
          description: 'Overall correctness assessment of the translation',
          options: {
            list: [
              { title: 'Correct', value: 'correct' },
              { title: 'Incorrect', value: 'incorrect' },
              { title: 'Partial', value: 'partial' },
              { title: 'Context Needed', value: 'context_needed' }
            ],
            layout: 'radio'
          },
          validation: (Rule) => Rule.required()
        }),
        defineField({
          name: 'meaning',
          title: 'Correct Meaning',
          type: 'text',
          description: 'The correct meaning or translation of the phrase',
          validation: (Rule) => Rule.required()
        }),
        defineField({
          name: 'alternatives',
          title: 'Alternative Phrases',
          type: 'array',
          description: 'Alternative ways to express the same meaning',
          of: [{ type: 'string' }],
          validation: (Rule) => Rule.max(10).error('Maximum 10 alternative phrases allowed')
        }),
        defineField({
          name: 'errors',
          title: 'Error Analysis',
          type: 'text',
          description: 'Detailed analysis of errors in the user translation'
        }),
        defineField({
          name: 'grammar',
          title: 'Grammar Analysis',
          type: 'text',
          description: 'Grammar-specific feedback and corrections'
        }),
        defineField({
          name: 'cultural',
          title: 'Cultural Context',
          type: 'text',
          description: 'Cultural context and usage notes for the phrase'
        })
      ]
    }),
    defineField({
      name: 'userId',
      title: 'User ID',
      type: 'string',
      description: 'Clerk user ID for data association',
      validation: (Rule) => Rule.required().error('User ID is required for data association'),
      readOnly: true
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      description: 'When this phrase was first created',
      initialValue: () => new Date().toISOString(),
      readOnly: true
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
      description: 'When this phrase was last updated'
    })
  ],
  preview: {
    select: {
      title: 'englishPhrase',
      subtitle: 'userTranslation',
      media: 'analysis.correctness'
    },
    prepare(selection) {
      const {title, subtitle, media} = selection
      return {
        title: title || 'Untitled Phrase',
        subtitle: subtitle || 'No translation provided',
        media: getCorrectnessIcon(media)
      }
    }
  },
  orderings: [
    {
      title: 'Created Date, New',
      name: 'createdAtDesc',
      by: [
        {field: 'createdAt', direction: 'desc'}
      ]
    },
    {
      title: 'Created Date, Old',
      name: 'createdAtAsc',
      by: [
        {field: 'createdAt', direction: 'asc'}
      ]
    },
    {
      title: 'English Phrase A-Z',
      name: 'englishPhraseAsc',
      by: [
        {field: 'englishPhrase', direction: 'asc'}
      ]
    }
  ]
})

// Helper function for preview icons based on correctness
function getCorrectnessIcon(correctness: string): string {
  switch (correctness) {
    case 'correct':
      return '✅'
    case 'incorrect':
      return '❌'
    case 'partial':
      return '⚠️'
    case 'context_needed':
      return '❓'
    default:
      return '📝'
  }
}