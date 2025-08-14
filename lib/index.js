'use strict'

const Client = require('./client')

const { getService } = require('./get-service')

/**
 * Module dependencies
 */

module.exports = {
  provider: 'genai',
  name: 'GenAI',

  init(providerOptions = {}) {

    const { apiKey, model = 'gpt-4o-mini', host } = providerOptions;
    const client = new Client(apiKey, host);

    return {
      /**
       * @param {{
       *  text:string|string[]|any[],
       *  sourceLocale: string,
       *  targetLocale: string,
       *  priority: number,
       *  format?: 'plain'|'markdown'|'html'
       * }} options all translate options
       * @returns {string[]} the input text(s) translated
       */
      async translate({ text, priority, sourceLocale, targetLocale, format }) {
        if (!text) {
          return []
        }
        if (!sourceLocale || !targetLocale) {
          throw new Error('source and target locale must be defined')
        }

        const chunksService = getService('chunks')
        const formatService = getService('format')

        let input = text
        if (format === 'jsonb') {
          input = await formatService.blockToHtml(input)
        } else if (format === 'markdown') {
          input = formatService.markdownToHtml(input)
        }

        let textArray = Array.isArray(input) ? input : [input]

        const { chunks, reduceFunction } = chunksService.split(textArray, {
          maxLength: 50,
          maxByteSize: 130000,
        })

        const result = reduceFunction(
          await Promise.all(
            chunks.map(async (texts) => {
              const result = await client.translateBatch(model, texts, {
                sourceLocale: sourceLocale,
                targetLocale: targetLocale,
              })
              return result
            })
          )
        )
        
        if (format === 'jsonb') {
          return formatService.htmlToBlock(result)
        }
        if (format === 'markdown') {
          return formatService.htmlToMarkdown(result)
        }

        return result
      },
    }
  },
}