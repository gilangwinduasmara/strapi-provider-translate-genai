class Client {
  constructor(apiKey, host, options = {}) {
    this.apiKey = apiKey
    this.host = host
    this.maxRetries = options.maxRetries || 3
    this.retryDelay = options.retryDelay || 1000
  }

  async translate(model, text, { sourceLocale, targetLocale }) {
    const res = await fetch(`${this.host}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: `Translate from ${sourceLocale} to ${targetLocale}. Return only the translation, no explanations.`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`API request failed: ${res.status} ${res.statusText}`)
    }

    const data = await res.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid API response format')
    }

    return data.choices[0].message.content.trim();
  }

  async translateBatch(model, texts, { sourceLocale, targetLocale }) {
    return this._withRetry(async () => {
      const textsJson = JSON.stringify(texts);

      const res = await fetch(`${this.host}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: `You are a professional translator. Translate ALL texts in the provided JSON array from ${sourceLocale} to ${targetLocale}. Rules:
- Return ONLY a valid JSON array with the translated texts in the SAME ORDER
- Preserve formatting and structure of each text
- Keep proper nouns, technical terms, and brand names unchanged when appropriate
- If a text cannot be translated, return it as-is
- Do not add any explanations, just return the JSON array`,
            },
            {
              role: 'user',
              content: `Translate this JSON array: ${textsJson}`,
            },
          ],
        }),
      });

      if (!res.ok) {
        throw new Error(`API request failed: ${res.status} ${res.statusText}`)
      }

      const data = await res.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid API response format')
      }

      const translatedJson = data.choices[0].message.content.trim();
      const translatedTexts = JSON.parse(translatedJson);

      if (!Array.isArray(translatedTexts) || translatedTexts.length !== texts.length) {
        throw new Error('Invalid translation response format or length mismatch');
      }

      return translatedTexts;
    }).catch(async (error) => {
      console.warn('Batch translation failed after retries, falling back to individual translations:', error.message);
      return await this.fallbackTranslateBatch(model, texts, { sourceLocale, targetLocale });
    });
  }

  async fallbackTranslateBatch(model, texts, { sourceLocale, targetLocale }) {
    try {
      const result = await Promise.all(texts.map(text => 
        this._translateCore(model, text, { sourceLocale, targetLocale })
      ));
      return result;
    } catch (error) {
      console.error('Fallback translation also failed:', error.message);
      return texts;
    }
  }

  async _withRetry(fn) {
    let lastError
    for (let i = 0; i < this.maxRetries; i++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error
        if (i < this.maxRetries - 1) {
          console.warn(`Attempt ${i + 1} failed, retrying in ${this.retryDelay * (i + 1)}ms...`)
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * (i + 1)))
        }
      }
    }
    throw lastError
  }
}

module.exports = Client;