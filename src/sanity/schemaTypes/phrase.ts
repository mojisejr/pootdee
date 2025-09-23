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
      name: 'context',
      title: 'Context / Usage Situation',
      type: 'text',
      description: 'Context or situation where this phrase would be used (บริบท - ใช้ตอนไหน?)',
      validation: (Rule) => Rule.required().max(300).error('Context is required and must be under 300 characters')
    }),
    defineField({
      name: 'analysis',
      title: 'AI Analysis Result',
      type: 'object',
      description: 'Enhanced AI-generated analysis with structured output',
      fields: [
        defineField({
          name: 'correctness',
          title: 'Correctness Level',
          type: 'string',
          description: 'Overall correctness assessment of the translation',
          options: {
            list: [
              { title: 'Correct', value: 'correct' },
              { title: 'Partially Correct', value: 'partially_correct' },
              { title: 'Incorrect', value: 'incorrect' }
            ],
            layout: 'radio'
          },
          validation: (Rule) => Rule.required()
        }),
        defineField({
          name: 'meaning',
          title: 'Meaning Explanation',
          type: 'text',
          description: 'Clear explanation of what the sentence means and its usage',
          validation: (Rule) => Rule.required()
        }),
        defineField({
          name: 'alternatives',
          title: 'Alternative Expressions',
          type: 'array',
          description: 'Alternative ways to express the same meaning',
          of: [{ type: 'string' }],
          validation: (Rule) => Rule.max(10).error('Maximum 10 alternative phrases allowed')
        }),
        defineField({
          name: 'errors',
          title: 'Error Analysis',
          type: 'text',
          description: 'Detailed analysis of errors found in the sentence'
        }),
        defineField({
          name: 'confidence',
          title: 'Analysis Confidence',
          type: 'number',
          description: 'AI confidence score (0-1) for the analysis accuracy',
          validation: (Rule) => Rule.min(0).max(1).precision(3)
        }),
        defineField({
          name: 'suggestions',
          title: 'Improvement Suggestions',
          type: 'array',
          description: 'Specific suggestions for improvement',
          of: [{ type: 'string' }],
          validation: (Rule) => Rule.max(5).error('Maximum 5 suggestions allowed')
        }),
        // Enhanced Grammar Analysis
        defineField({
          name: 'grammarAnalysis',
          title: 'Grammar Analysis',
          type: 'object',
          description: 'Detailed grammar analysis with scoring',
          fields: [
            defineField({
              name: 'score',
              title: 'Grammar Score',
              type: 'number',
              description: 'Grammar quality score (0-100)',
              validation: (Rule) => Rule.min(0).max(100).integer()
            }),
            defineField({
              name: 'issues',
              title: 'Grammar Issues',
              type: 'array',
              description: 'Specific grammar issues found',
              of: [{
                type: 'object',
                fields: [
                  defineField({
                    name: 'type',
                    title: 'Issue Type',
                    type: 'string',
                    options: {
                      list: [
                        { title: 'Syntax', value: 'syntax' },
                        { title: 'Tense', value: 'tense' },
                        { title: 'Agreement', value: 'agreement' },
                        { title: 'Word Order', value: 'word_order' },
                        { title: 'Article', value: 'article' },
                        { title: 'Preposition', value: 'preposition' },
                        { title: 'Other', value: 'other' }
                      ]
                    }
                  }),
                  defineField({
                    name: 'description',
                    title: 'Issue Description',
                    type: 'text'
                  }),
                  defineField({
                    name: 'severity',
                    title: 'Severity Level',
                    type: 'string',
                    options: {
                      list: [
                        { title: 'Low', value: 'low' },
                        { title: 'Medium', value: 'medium' },
                        { title: 'High', value: 'high' },
                        { title: 'Critical', value: 'critical' }
                      ]
                    }
                  }),
                  defineField({
                    name: 'suggestion',
                    title: 'Correction Suggestion',
                    type: 'text'
                  }),
                  defineField({
                    name: 'position',
                    title: 'Error Position',
                    type: 'object',
                    fields: [
                      defineField({
                        name: 'start',
                        title: 'Start Position',
                        type: 'number'
                      }),
                      defineField({
                        name: 'end',
                        title: 'End Position',
                        type: 'number'
                      })
                    ]
                  })
                ]
              }]
            }),
            defineField({
              name: 'strengths',
              title: 'Grammar Strengths',
              type: 'array',
              description: 'Positive aspects of the grammar usage',
              of: [{ type: 'string' }]
            }),
            defineField({
              name: 'recommendations',
              title: 'Grammar Recommendations',
              type: 'array',
              description: 'Specific recommendations for grammar improvement',
              of: [{ type: 'string' }]
            })
          ]
        }),
        // Enhanced Vocabulary Analysis
        defineField({
          name: 'vocabularyAnalysis',
          title: 'Vocabulary Analysis',
          type: 'object',
          description: 'Detailed vocabulary analysis and suggestions',
          fields: [
            defineField({
              name: 'score',
              title: 'Vocabulary Score',
              type: 'number',
              description: 'Vocabulary appropriateness score (0-100)',
              validation: (Rule) => Rule.min(0).max(100).integer()
            }),
            defineField({
              name: 'level',
              title: 'Vocabulary Level',
              type: 'string',
              description: 'Overall vocabulary difficulty level',
              options: {
                list: [
                  { title: 'Beginner', value: 'beginner' },
                  { title: 'Intermediate', value: 'intermediate' },
                  { title: 'Advanced', value: 'advanced' },
                  { title: 'Expert', value: 'expert' }
                ]
              }
            }),
            defineField({
              name: 'appropriateWords',
              title: 'Appropriate Word Choices',
              type: 'array',
              description: 'Words that are well-chosen for the context',
              of: [{ type: 'string' }]
            }),
            defineField({
              name: 'inappropriateWords',
              title: 'Inappropriate Word Choices',
              type: 'array',
              description: 'Words that could be improved or are inappropriate',
              of: [{ type: 'string' }]
            }),
            defineField({
              name: 'suggestions',
              title: 'Vocabulary Suggestions',
              type: 'array',
              description: 'Specific word replacement suggestions',
              of: [{
                type: 'object',
                fields: [
                  defineField({
                    name: 'original',
                    title: 'Original Word',
                    type: 'string'
                  }),
                  defineField({
                    name: 'suggested',
                    title: 'Suggested Word',
                    type: 'string'
                  }),
                  defineField({
                    name: 'reason',
                    title: 'Reason for Suggestion',
                    type: 'text'
                  }),
                  defineField({
                    name: 'context',
                    title: 'Context Notes',
                    type: 'text'
                  })
                ]
              }]
            })
          ]
        }),
        // Enhanced Context Analysis
        defineField({
          name: 'contextAnalysis',
          title: 'Context Analysis',
          type: 'object',
          description: 'Analysis of contextual appropriateness and cultural fit',
          fields: [
            defineField({
              name: 'score',
              title: 'Context Score',
              type: 'number',
              description: 'Contextual appropriateness score (0-100)',
              validation: (Rule) => Rule.min(0).max(100).integer()
            }),
            defineField({
              name: 'appropriateness',
              title: 'Formality Level',
              type: 'string',
              description: 'Assessed formality level of the expression',
              options: {
                list: [
                  { title: 'Formal', value: 'formal' },
                  { title: 'Informal', value: 'informal' },
                  { title: 'Neutral', value: 'neutral' },
                  { title: 'Academic', value: 'academic' },
                  { title: 'Casual', value: 'casual' }
                ]
              }
            }),
            defineField({
              name: 'culturalNotes',
              title: 'Cultural Notes',
              type: 'array',
              description: 'Cultural context and usage considerations',
              of: [{ type: 'text' }]
            }),
            defineField({
              name: 'usageNotes',
              title: 'Usage Notes',
              type: 'array',
              description: 'Specific usage guidelines and situations',
              of: [{ type: 'text' }]
            }),
            defineField({
              name: 'situationalFit',
              title: 'Situational Fit',
              type: 'text',
              description: 'How well the expression fits the given context'
            })
          ]
        })
      ]
    }),
    // Analysis Metadata
    defineField({
      name: 'analysisMetadata',
      title: 'Analysis Metadata',
      type: 'object',
      description: 'Technical metadata about the analysis process',
      fields: [
        defineField({
          name: 'provider',
          title: 'AI Provider',
          type: 'string',
          description: 'Which AI provider was used for analysis',
          options: {
            list: [
              { title: 'Google AI', value: 'google-ai' },
              { title: 'OpenAI', value: 'openai' },
              { title: 'Anthropic', value: 'anthropic' }
            ]
          }
        }),
        defineField({
          name: 'processingTime',
          title: 'Processing Time (ms)',
          type: 'number',
          description: 'Time taken to process the analysis in milliseconds'
        }),
        defineField({
          name: 'modelVersion',
          title: 'Model Version',
          type: 'string',
          description: 'Version of the AI model used'
        }),
        defineField({
          name: 'retryCount',
          title: 'Retry Count',
          type: 'number',
          description: 'Number of retries needed for successful analysis'
        }),
        defineField({
          name: 'timestamp',
          title: 'Analysis Timestamp',
          type: 'datetime',
          description: 'When the analysis was performed'
        }),
        defineField({
          name: 'structuredOutput',
          title: 'Used Structured Output',
          type: 'boolean',
          description: 'Whether structured output was used for this analysis'
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
      media: 'analysis.correctness',
      confidence: 'analysis.confidence',
      grammarScore: 'analysis.grammarAnalysis.score'
    },
    prepare(selection) {
      const { title, subtitle, media, confidence, grammarScore } = selection;
      const icon = getCorrectnessIcon(media);
      const confidenceText = confidence ? ` (${Math.round(confidence * 100)}%)` : '';
      const grammarText = grammarScore ? ` | Grammar: ${grammarScore}/100` : '';
      
      return {
        title: title || 'Untitled Phrase',
        subtitle: `${subtitle || 'No translation'}${confidenceText}${grammarText}`,
        media: icon
      };
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
    },
    {
      title: 'Grammar Score, High to Low',
      name: 'grammarScoreDesc',
      by: [
        {field: 'analysis.grammarAnalysis.score', direction: 'desc'}
      ]
    },
    {
      title: 'Confidence Score, High to Low',
      name: 'confidenceDesc',
      by: [
        {field: 'analysis.confidence', direction: 'desc'}
      ]
    }
  ]
})

function getCorrectnessIcon(correctness: string): string {
  switch (correctness) {
    case 'correct':
      return '✅';
    case 'partially_correct':
      return '⚠️';
    case 'incorrect':
      return '❌';
    default:
      return '❓';
  }
}