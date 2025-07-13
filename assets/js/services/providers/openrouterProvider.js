/**
 * OpenRouter Provider for T3 Chat
 * Provides access to AI models via OpenRouter API
 * Uses OpenAI-compatible format but with OpenRouter endpoints
 * 
 * NOTE: Users must store their OpenRouter API key in localStorage under the key
 *       "openrouter_api_key" via the Settings page for requests to succeed.
 */

class OpenRouterProvider {
    constructor() {
        this.name = 'openrouter';
        this.models = [
            {
                id: 'moonshotai/kimi-k2',
                name: 'Kimi K2',
                description: 'Advanced AI model with strong reasoning capabilities and multilingual support',
                maxTokens: 200000,
                category: 'premium'
            },
            // Web search enabled models
            {
                id: 'openai/gpt-4o:online',
                name: 'GPT-4o (Web Search)',
                description: 'OpenAI GPT-4o with real-time web search capabilities',
                maxTokens: 128000,
                category: 'premium',
                webSearchEnabled: true
            },
            {
                id: 'openai/gpt-4o-mini:online',
                name: 'GPT-4o Mini (Web Search)',
                description: 'OpenAI GPT-4o Mini with real-time web search capabilities',
                maxTokens: 128000,
                category: 'standard',
                webSearchEnabled: true
            },
            {
                id: 'anthropic/claude-3.5-sonnet:online',
                name: 'Claude 3.5 Sonnet (Web Search)',
                description: 'Anthropic Claude 3.5 Sonnet with real-time web search capabilities',
                maxTokens: 200000,
                category: 'premium',
                webSearchEnabled: true
            },
            {
                id: 'anthropic/claude-3.5-haiku:online',
                name: 'Claude 3.5 Haiku (Web Search)',
                description: 'Anthropic Claude 3.5 Haiku with real-time web search capabilities',
                maxTokens: 200000,
                category: 'standard',
                webSearchEnabled: true
            },
            {
                id: 'google/gemini-pro-1.5:online',
                name: 'Gemini Pro 1.5 (Web Search)',
                description: 'Google Gemini Pro 1.5 with real-time web search capabilities',
                maxTokens: 1000000,
                category: 'premium',
                webSearchEnabled: true
            },
            // Non-web search models for plugin approach
            {
                id: 'openai/gpt-4o',
                name: 'GPT-4o',
                description: 'OpenAI GPT-4o without web search',
                maxTokens: 128000,
                category: 'premium',
                supportsWebSearchPlugin: true
            },
            {
                id: 'openai/gpt-4o-mini',
                name: 'GPT-4o Mini',
                description: 'OpenAI GPT-4o Mini without web search',
                maxTokens: 128000,
                category: 'standard',
                supportsWebSearchPlugin: true
            },
            {
                id: 'anthropic/claude-3.5-sonnet',
                name: 'Claude 3.5 Sonnet',
                description: 'Anthropic Claude 3.5 Sonnet without web search',
                maxTokens: 200000,
                category: 'premium',
                supportsWebSearchPlugin: true
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
     * Check if a model has web search enabled
     * @param {string} modelId - The model ID to check
     * @returns {boolean} - Whether the model has web search enabled
     */
    hasWebSearchEnabled(modelId) {
        const model = this.models.find(m => m.id === modelId);
        return model && model.webSearchEnabled;
    }

    /**
     * Check if a model supports web search plugin
     * @param {string} modelId - The model ID to check
     * @returns {boolean} - Whether the model supports web search plugin
     */
    supportsWebSearchPlugin(modelId) {
        const model = this.models.find(m => m.id === modelId);
        return model && model.supportsWebSearchPlugin;
    }

    /**
     * Generate a completion using OpenRouter API
     * @param {string} modelId - Model identifier (e.g. "moonshotai/kimi-k2")
     * @param {string} message - Current user message
     * @param {array} conversation - Previous conversation messages
     * @param {object} options - Additional options (temperature, systemMessage, max_tokens, webSearch)
     * @param {function} onStreamUpdate - Callback for streaming updates
     */
    async generateCompletion(modelId, message, conversation = [], options = {}, onStreamUpdate) {
        const apiKey = localStorage.getItem('openrouter_api_key');
        if (!apiKey) {
            throw new Error('OpenRouter API key not found in settings.');
        }

        // Build message array in OpenAI compatible format
        const messages = [];
        if (options.systemMessage) {
            messages.push({ role: 'system', content: options.systemMessage });
        }

        if (Array.isArray(conversation) && conversation.length > 0) {
            for (const msg of conversation) {
                // Extract text content from message
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
            stream: true,
            temperature: typeof options.temperature === 'number' ? options.temperature : 0.7,
            max_tokens: typeof options.max_tokens === 'number' ? options.max_tokens : 4000
        };

        // Add web search plugin if enabled or if the model supports it
        const webSearchEnabled = this.hasWebSearchEnabled(modelId);
        const supportsWebSearchPlugin = this.supportsWebSearchPlugin(modelId);
        
        if (webSearchEnabled || (supportsWebSearchPlugin && options.webSearch)) {
            requestBody.plugins = [
                {
                    id: 'web',
                    max_results: options.webSearchMaxResults || 5,
                    ...(options.webSearchPrompt && { search_prompt: options.webSearchPrompt }),
                    ...(options.webSearchOptions && { web_search_options: options.webSearchOptions })
                }
            ];
        }

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'T3 Chat'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
            }

            // Performance optimization: Streaming state management
            let fullContent = '';
            let pendingChunks = '';
            let lastUpdateTime = 0;
            let updateTimer = null;
            const DEBOUNCE_DELAY = 30; // 30ms debounce
            const MIN_CHUNK_SIZE = 5; // Coalesce small chunks

            // Debounced update function
            const debouncedUpdate = () => {
                if (updateTimer) {
                    clearTimeout(updateTimer);
                }
                
                updateTimer = setTimeout(() => {
                    if (pendingChunks && onStreamUpdate) {
                        // Send only the new chunk, not the full content
                        onStreamUpdate({ 
                            type: 'chunk', 
                            content: pendingChunks,
                            fullContent: fullContent
                        });
                        pendingChunks = '';
                    }
                    updateTimer = null;
                }, DEBOUNCE_DELAY);
            };

            // Handle streaming response
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;

                const lines = buffer.split('\n');
                buffer = lines.pop();

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.substring(6);
                        if (data === '[DONE]') {
                            // Send final update immediately
                            if (updateTimer) {
                                clearTimeout(updateTimer);
                                updateTimer = null;
                            }
                            if (pendingChunks && onStreamUpdate) {
                                onStreamUpdate({ 
                                    type: 'chunk', 
                                    content: pendingChunks,
                                    fullContent: fullContent
                                });
                            }
                            // Send completion signal
                            if (onStreamUpdate) {
                                onStreamUpdate({ 
                                    type: 'complete',
                                    fullContent: fullContent
                                });
                            }
                            reader.cancel();
                            return { message: fullContent, provider: this.name, model: modelId, usage: null };
                        }
                        try {
                            const json = JSON.parse(data);
                            const content = json.choices[0]?.delta?.content || '';
                            if (content) {
                                fullContent += content;
                                pendingChunks += content;
                                
                                // Send immediate update for larger chunks or if enough time has passed
                                const now = Date.now();
                                const shouldUpdateImmediately = 
                                    pendingChunks.length >= MIN_CHUNK_SIZE || 
                                    (now - lastUpdateTime) >= DEBOUNCE_DELAY * 2;
                                
                                if (shouldUpdateImmediately) {
                                    if (updateTimer) {
                                        clearTimeout(updateTimer);
                                        updateTimer = null;
                                    }
                                    
                                    if (onStreamUpdate) {
                                        onStreamUpdate({ 
                                            type: 'chunk', 
                                            content: pendingChunks,
                                            fullContent: fullContent
                                        });
                                    }
                                    pendingChunks = '';
                                    lastUpdateTime = now;
                                } else {
                                    // Use debounced update for smaller chunks
                                    debouncedUpdate();
                                }
                            }
                        } catch (e) {
                            console.error('Error parsing OpenRouter stream chunk:', e, 'Chunk:', data);
                        }
                    }
                }
            }

            // Cleanup and fallback
            if (updateTimer) {
                clearTimeout(updateTimer);
            }
            if (pendingChunks && onStreamUpdate) {
                onStreamUpdate({ 
                    type: 'chunk', 
                    content: pendingChunks,
                    fullContent: fullContent
                });
            }
            if (onStreamUpdate) {
                onStreamUpdate({ 
                    type: 'complete',
                    fullContent: fullContent
                });
            }

            return { message: fullContent, provider: this.name, model: modelId, usage: null };

        } catch (error) {
            console.error('OpenRouter API Error:', error);
            throw error;
        }
    }
}

export default OpenRouterProvider; 