# Strapi Provider Translate GenAI

A Strapi provider for AI-powered translation services using compatible OpenAI-style APIs. This plugin enables seamless content translation across multiple locales within your Strapi CMS using advanced AI language models.

## ✨ Features

- 🤖 **AI-Powered Translation**: Using advanced language models for high-quality translations
- 🚀 **Batch Processing**: Efficient bulk translation with intelligent chunking
- 🔄 **Retry Logic**: Built-in retry mechanism with exponential backoff for reliability
- 📝 **Multiple Formats**: Supports plain text, markdown, HTML, and JSONB formats
- ⚡ **Performance Optimized**: Single API call for multiple texts instead of individual requests
- 🛡️ **Error Handling**: Comprehensive error handling with fallback mechanisms
- 🔧 **Flexible Configuration**: Configurable models, retry settings, and API endpoints

## 📋 Requirements

- Strapi v4.x
- Node.js >= 14.x
- Compatible OpenAI-style API (OpenAI, Azure OpenAI, local deployments, etc.)

## 🚀 Installation
Instal the translate plugin
```bash
# with npm
$ npm install strapi-plugin-translate
# or with yarn
$ yarn add strapi-plugin-translate
```
Instal the Provider
```bash
# with npm
npm install strapi-provider-translate-genai
# or with yarn
yarn add strapi-provider-translate-genai
```

## ⚙️ Configuration

### Environment Variables

Create or update your `.env` file with the following variables:

```env
# Required
GENAI_API_KEY=your_api_key_here
GENAI_HOST=https://api.openai.com/v1

# Optional
GENAI_MODEL=gpt-4o-mini
```

### Strapi Configuration

Add the provider configuration to your `config/plugins.js` file:

```javascript
module.exports = {
  // ... other plugin configurations
  translate: {
    enabled: true,
    config: {
      provider: 'genai',
      providerOptions: {
        apiKey: process.env.GENAI_API_KEY,
        host: process.env.GENAI_HOST,
        model: process.env.GENAI_MODEL, // Optional, defaults to 'gpt-4o-mini'
      },
    },
  },
};
```

### Advanced Configuration Options

```javascript
module.exports = {
  translate: {
    enabled: true,
    config: {
      provider: 'genai',
      providerOptions: {
        apiKey: process.env.GENAI_API_KEY,
        host: process.env.GENAI_HOST,
        model: process.env.GENAI_MODEL || 'gpt-4o-mini',
        // Advanced options
        maxRetries: 3,        // Number of retry attempts
        retryDelay: 1000,     // Base delay between retries (ms)
      },
    },
  },
};
```

## 🎯 Usage

Once configured, the provider will be automatically available in your Strapi admin panel's internationalization features.

### Programmatic Usage

You can also use the translation service programmatically in your Strapi application:

```javascript
// In a controller, service, or lifecycle method
const translateService = strapi.plugin('translate').service('translate');

const translatedContent = await translateService.translate({
  text: 'Hello, world!',
  sourceLocale: 'en',
  targetLocale: 'es',
  format: 'plain'
});

console.log(translatedContent); // ['¡Hola, mundo!']
```

### Batch Translation

The provider efficiently handles batch translations:

```javascript
const translatedContent = await translateService.translate({
  text: ['Hello', 'World', 'How are you?'],
  sourceLocale: 'en',
  targetLocale: 'es',
  format: 'plain'
});

console.log(translatedContent); // ['Hola', 'Mundo', '¿Cómo estás?']
```

## 🔧 Supported API Endpoints

This provider works with any OpenAI-compatible API, including:

- **OpenAI**: `https://api.openai.com/v1`
- **Azure OpenAI**: `https://your-resource.openai.azure.com`
- **Local deployments**: `http://localhost:8080/v1`
- **Other compatible services**: Any service that implements OpenAI's chat completions API

## 📝 Supported Content Formats

- `plain` - Plain text content
- `markdown` - Markdown formatted content
- `html` - HTML content
- `jsonb` - JSONB blocks (rich text editor content)


## 📊 Performance Features

- **Batch Processing**: Translates multiple texts in a single API call
- **Intelligent Chunking**: Automatically splits large content batches
- **Parallel Processing**: Processes chunks in parallel for maximum efficiency
- **Request Optimization**: Minimizes API calls to reduce costs and latency


## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/cabrera-evil/strapi-provider-translate-google/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about your setup and the issue you're experiencing

## 🔗 Related

- [Strapi Translate Plugin](https://market.strapi.io/plugins/strapi-plugin-translate)
- [Strapi Documentation](https://docs.strapi.io/)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
