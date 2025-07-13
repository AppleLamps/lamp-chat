/**
 * xAI Provider for T3 Chat
 * Provides access to Grok models via the xAI REST API (OpenAI-compatible)
 * Currently supports the Grok-4 model.
 *
 * NOTE: Users must store their xAI API key in localStorage under the key
 *       "xai_api_key" via the Settings page for requests to succeed.
 */

class XAIProvider {
    constructor() {
        this.name = 'xai';
        this.models = [
            {
                id: 'grok-4',
                name: 'Grok-4',
                description: 'Cutting-edge reasoning model from xAI with strong problem-solving skills.',
                maxTokens: 128000,
                category: 'premium'
            }
        ];
    }

    /**
     * Check if the provider supports a specific model
     * @param {string} modelId - The model ID to check
     * @returns {boolean} - Whether the model is supported
     */
    supportsModel(modelId) {
        return this.models.some(model => model.id === modelId);
    }

    /**
     * Get available models from this provider
     * @returns {array} - Array of model objects
     */
    getAvailableModels() {
        return this.models;
    }

    /**
     * Generate a completion using an xAI Grok model
     * @param {string} modelId - Model identifier (e.g. "grok-4")
     * @param {string} message - Current user message
     * @param {array} conversation - Previous conversation messages
     * @param {object} options - Additional options (temperature, systemMessage, max_tokens)
     * @param {function} onStreamUpdate - Callback for streaming updates (called once for now)
     */
    async generateCompletion(modelId, message, conversation = [], options = {}, onStreamUpdate) {
        const apiKey = localStorage.getItem('xai_api_key');
        if (!apiKey) {
            throw new Error('xAI API key not found in settings.');
        }

        // Build message array in OpenAI compatible format
        const messages = [];
        if (options.systemMessage) {
            messages.push({ role: 'system', content: options.systemMessage });
        }

        if (Array.isArray(conversation) && conversation.length > 0) {
            for (const msg of conversation) {
                // xAI API expects "content" to be a plain string. Our message content may be
                // an object when it includes attachments (e.g. { text, attachments }).
                // Extract the text part if present, otherwise stringify.
                let contentText;
                if (typeof msg.content === 'string') {
                    contentText = msg.content;
                } else if (msg.content && typeof msg.content === 'object') {
                    contentText = msg.content.text || '';
                } else {
                    contentText = String(msg.content ?? '');
                }
                messages.push({ role: msg.role, content: contentText });
            }
        }

        // Current user message might also be an object with { text, attachments }
        const currentText = typeof message === 'string' ? message : (message?.text || '');
        messages.push({ role: 'user', content: currentText });

        const requestBody = {
            model: modelId,
            messages,
            stream: false,
            temperature: typeof options.temperature === 'number' ? options.temperature : 0.7,
            max_tokens: typeof options.max_tokens === 'number' ? options.max_tokens : 2048
        };

        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`xAI API error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content || '';

        if (onStreamUpdate) {
            onStreamUpdate(text);
        }

        return { message: text, provider: this.name, model: modelId, usage: data.usage };
    }
}

export default XAIProvider;
