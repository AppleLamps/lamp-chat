/**
 * Migration Example: From Old to New Architecture
 * 
 * This file demonstrates how to migrate from the old manual DOM manipulation
 * and localStorage-based approach to the new centralized store and 
 * component-based architecture.
 */

// =============================================================================
// OLD ARCHITECTURE EXAMPLE
// =============================================================================

// Old way - Direct DOM manipulation and localStorage
class OldChatView {
    constructor() {
        this.chatForm = document.getElementById('chat-form');
        this.chatInput = document.getElementById('chat-input');
        this.chatLog = document.getElementById('chat-log');
        this.modelSelector = document.querySelector('.model-selector-btn');
        this.modelDropdown = document.querySelector('.model-dropdown');
        this.conversations = [];
        this.activeConversationId = null;
        
        this.init();
    }

    init() {
        // Load data from localStorage
        this.loadConversations();
        this.loadActiveConversation();
        this.loadActiveModel();
        
        // Bind events manually
        this.bindEvents();
        
        // Initial render
        this.renderConversations();
        this.renderActiveConversation();
        this.updateModelSelector();
    }

    bindEvents() {
        // Chat form submission
        this.chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleChatSubmit();
        });

        // Model selector
        this.modelSelector.addEventListener('click', () => {
            this.toggleModelDropdown();
        });

        // Model selection
        this.modelDropdown.addEventListener('click', (e) => {
            if (e.target.classList.contains('model-select-btn')) {
                this.handleModelSelect(e.target);
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.modelSelector.contains(e.target) && !this.modelDropdown.contains(e.target)) {
                this.closeModelDropdown();
            }
        });
    }

    loadConversations() {
        const stored = localStorage.getItem('conversations');
        this.conversations = stored ? JSON.parse(stored) : [];
    }

    loadActiveConversation() {
        this.activeConversationId = localStorage.getItem('activeConversationId');
    }

    loadActiveModel() {
        this.activeProvider = localStorage.getItem('activeProvider');
        this.activeModel = localStorage.getItem('activeModel');
    }

    saveConversations() {
        localStorage.setItem('conversations', JSON.stringify(this.conversations));
    }

    saveActiveConversation() {
        localStorage.setItem('activeConversationId', this.activeConversationId);
    }

    saveActiveModel() {
        localStorage.setItem('activeProvider', this.activeProvider);
        localStorage.setItem('activeModel', this.activeModel);
    }

    handleChatSubmit() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        // Add message to conversation
        this.addMessageToConversation(message, 'user');
        
        // Clear input
        this.chatInput.value = '';
        
        // Update UI
        this.renderActiveConversation();
        this.renderConversations();
        
        // Save to localStorage
        this.saveConversations();
        
        // Send to API (simplified)
        this.sendToAPI(message);
    }

    addMessageToConversation(content, role) {
        if (!this.activeConversationId) {
            this.createNewConversation();
        }

        const conversation = this.conversations.find(c => c.id === this.activeConversationId);
        if (conversation) {
            conversation.messages.push({
                id: Date.now(),
                content,
                role,
                timestamp: new Date().toISOString()
            });
        }
    }

    createNewConversation() {
        const newConversation = {
            id: 'chat_' + Date.now(),
            title: 'New Chat',
            messages: [],
            createdAt: new Date().toISOString()
        };
        
        this.conversations.push(newConversation);
        this.activeConversationId = newConversation.id;
        this.saveActiveConversation();
    }

    renderConversations() {
        const sidebar = document.querySelector('.sidebar-nav');
        sidebar.innerHTML = '';

        this.conversations.forEach(conv => {
            const item = document.createElement('div');
            item.className = 'chat-item';
            item.textContent = conv.title;
            item.addEventListener('click', () => {
                this.selectConversation(conv.id);
            });
            sidebar.appendChild(item);
        });
    }

    renderActiveConversation() {
        const conversation = this.conversations.find(c => c.id === this.activeConversationId);
        this.chatLog.innerHTML = '';

        if (conversation) {
            conversation.messages.forEach(msg => {
                const msgElement = document.createElement('div');
                msgElement.className = `message ${msg.role}`;
                msgElement.textContent = msg.content;
                this.chatLog.appendChild(msgElement);
            });
        }
    }

    selectConversation(conversationId) {
        this.activeConversationId = conversationId;
        this.saveActiveConversation();
        this.renderActiveConversation();
    }

    toggleModelDropdown() {
        this.modelDropdown.classList.toggle('show');
    }

    closeModelDropdown() {
        this.modelDropdown.classList.remove('show');
    }

    handleModelSelect(button) {
        const provider = button.dataset.provider;
        const model = button.dataset.model;
        
        this.activeProvider = provider;
        this.activeModel = model;
        this.saveActiveModel();
        
        this.updateModelSelector();
        this.closeModelDropdown();
    }

    updateModelSelector() {
        if (this.activeProvider && this.activeModel) {
            this.modelSelector.textContent = `${this.activeProvider} - ${this.activeModel}`;
        }
    }

    sendToAPI(message) {
        // Simulate API call
        console.log('Sending to API:', message);
        
        // Show loading
        const loadingMsg = document.createElement('div');
        loadingMsg.className = 'message bot loading';
        loadingMsg.textContent = 'Thinking...';
        this.chatLog.appendChild(loadingMsg);
        
        // Simulate response
        setTimeout(() => {
            this.chatLog.removeChild(loadingMsg);
            this.addMessageToConversation('This is a simulated response', 'assistant');
            this.renderActiveConversation();
            this.saveConversations();
        }, 1000);
    }
}

// =============================================================================
// NEW ARCHITECTURE EXAMPLE
// =============================================================================

// New way - Centralized store and component-based
import store from './assets/js/services/store.js';
import { UIComponent, DropdownComponent, ButtonComponent, FormComponent } from './assets/js/utils/UIComponent.js';

class NewChatView extends UIComponent {
    constructor() {
        super('#chat-area', {
            autoMount: true,
            reactive: true
        });
        
        this.initializeComponents();
    }

    init() {
        // Initialize state
        this.state = {
            isInitialized: false
        };
        
        // Load initial data into store
        this.loadInitialData();
    }

    subscribeToStore() {
        // Subscribe to chat state changes
        const chatUnsubscribe = store.subscribe('chat', (newState, oldState) => {
            this.handleChatStateChange(newState.chat, oldState.chat);
        });
        this.storeSubscriptions.push(chatUnsubscribe);

        // Subscribe to API state changes
        const apiUnsubscribe = store.subscribe('api', (newState, oldState) => {
            this.handleApiStateChange(newState.api, oldState.api);
        });
        this.storeSubscriptions.push(apiUnsubscribe);
    }

    initializeComponents() {
        // Model selector dropdown
        this.modelSelector = new DropdownComponent('.model-selector-btn', {
            items: [],
            onSelect: (item) => this.handleModelSelect(item)
        });
        this.addChild('modelSelector', this.modelSelector);

        // Chat form
        this.chatForm = new FormComponent('#chat-form', {
            validators: {
                'chat-input': (value) => value.trim() ? null : 'Message cannot be empty'
            },
            onSubmit: (values) => this.handleChatSubmit(values)
        });
        this.addChild('chatForm', this.chatForm);

        // Send button
        this.sendBtn = new ButtonComponent('.send-btn', {
            onClick: () => this.handleSendClick()
        });
        this.addChild('sendBtn', this.sendBtn);

        // New chat button
        this.newChatBtn = new ButtonComponent('.new-chat-btn', {
            onClick: () => this.handleNewChat()
        });
        this.addChild('newChatBtn', this.newChatBtn);
    }

    loadInitialData() {
        // Load conversations from localStorage and update store
        const conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
        const activeConversationId = localStorage.getItem('activeConversationId');
        const activeProvider = localStorage.getItem('activeProvider');
        const activeModel = localStorage.getItem('activeModel');

        // Update store with loaded data
        store.dispatch({
            type: 'CHAT_SET_CONVERSATIONS',
            payload: conversations
        });

        if (activeConversationId) {
            store.dispatch({
                type: 'CHAT_SET_ACTIVE_CONVERSATION',
                payload: activeConversationId
            });
        }

        if (activeProvider && activeModel) {
            store.dispatch({
                type: 'API_SET_ACTIVE_MODEL',
                payload: { provider: activeProvider, model: activeModel }
            });
        }
    }

    handleChatStateChange(newChatState, oldChatState) {
        // Automatically respond to state changes
        if (newChatState.activeConversationId !== oldChatState.activeConversationId) {
            this.renderActiveConversation();
        }

        if (newChatState.conversations !== oldChatState.conversations) {
            this.renderConversationList();
        }

        if (newChatState.isLoading !== oldChatState.isLoading) {
            this.updateLoadingState(newChatState.isLoading);
        }
    }

    handleApiStateChange(newApiState, oldApiState) {
        // Automatically respond to API state changes
        if (newApiState.activeProvider !== oldApiState.activeProvider || 
            newApiState.activeModel !== oldApiState.activeModel) {
            this.updateModelSelector();
        }
    }

    handleChatSubmit(values) {
        const message = values['chat-input'];
        if (!message.trim()) return;

        // Dispatch actions to update state
        store.dispatch({
            type: 'CHAT_SET_LOADING',
            payload: true
        });

        // Add message to conversation
        this.addMessage(message, 'user');
        
        // Clear input
        this.chatForm.setFieldValue('chat-input', '');
        
        // Send to API
        this.sendToAPI(message);
    }

    handleModelSelect(model) {
        // Update store - all subscribers will be notified automatically
        store.dispatch({
            type: 'API_SET_ACTIVE_MODEL',
            payload: {
                provider: model.provider,
                model: model.id
            }
        });
    }

    handleNewChat() {
        // Create new conversation
        const newConversation = {
            id: 'chat_' + Date.now(),
            title: 'New Chat',
            messages: [],
            createdAt: new Date().toISOString()
        };

        // Update store
        store.dispatch({
            type: 'CHAT_ADD_CONVERSATION',
            payload: newConversation
        });

        store.dispatch({
            type: 'CHAT_SET_ACTIVE_CONVERSATION',
            payload: newConversation.id
        });
    }

    addMessage(content, role) {
        const state = store.getState();
        let activeConversationId = state.chat.activeConversationId;

        // Create new conversation if none exists
        if (!activeConversationId) {
            this.handleNewChat();
            activeConversationId = store.getState().chat.activeConversationId;
        }

        // Find conversation and add message
        const conversations = [...state.chat.conversations];
        const conversationIndex = conversations.findIndex(c => c.id === activeConversationId);
        
        if (conversationIndex !== -1) {
            conversations[conversationIndex].messages.push({
                id: Date.now(),
                content,
                role,
                timestamp: new Date().toISOString()
            });

            // Update store
            store.dispatch({
                type: 'CHAT_SET_CONVERSATIONS',
                payload: conversations
            });
        }
    }

    renderActiveConversation() {
        const state = store.getState();
        const activeConversationId = state.chat.activeConversationId;
        const conversation = state.chat.conversations.find(c => c.id === activeConversationId);

        const chatLog = this.find('#chat-log');
        if (!chatLog) return;

        chatLog.innerHTML = '';

        if (conversation) {
            conversation.messages.forEach(msg => {
                const msgElement = this.createElement('div', {
                    className: `message ${msg.role}`
                }, msg.content);
                chatLog.appendChild(msgElement);
            });
        }
    }

    renderConversationList() {
        const state = store.getState();
        const conversations = state.chat.conversations;
        const sidebar = document.querySelector('.sidebar-nav');

        if (!sidebar) return;

        sidebar.innerHTML = '';

        conversations.forEach(conv => {
            const item = this.createElement('div', {
                className: 'chat-item',
                'data-chat-id': conv.id
            }, conv.title);

            item.addEventListener('click', () => {
                store.dispatch({
                    type: 'CHAT_SET_ACTIVE_CONVERSATION',
                    payload: conv.id
                });
            });

            sidebar.appendChild(item);
        });
    }

    updateModelSelector() {
        const state = store.getState();
        const { activeProvider, activeModel } = state.api;
        
        if (activeProvider && activeModel) {
            this.modelSelector.element.textContent = `${activeProvider} - ${activeModel}`;
        }
    }

    updateLoadingState(isLoading) {
        this.sendBtn.setLoading(isLoading);
        this.chatForm.setSubmitting(isLoading);
    }

    sendToAPI(message) {
        // Simulate API call
        console.log('Sending to API:', message);
        
        // Show loading message
        const loadingMsg = this.createElement('div', {
            className: 'message bot loading'
        }, 'Thinking...');
        
        const chatLog = this.find('#chat-log');
        if (chatLog) {
            chatLog.appendChild(loadingMsg);
        }
        
        // Simulate response
        setTimeout(() => {
            if (chatLog && loadingMsg.parentNode) {
                chatLog.removeChild(loadingMsg);
            }
            
            this.addMessage('This is a simulated response', 'assistant');
            
            // Clear loading state
            store.dispatch({
                type: 'CHAT_SET_LOADING',
                payload: false
            });
        }, 1000);
    }

    render() {
        // This method is called automatically when state changes
        if (!this.state.isInitialized) {
            this.renderActiveConversation();
            this.renderConversationList();
            this.updateModelSelector();
            this.state.isInitialized = true;
        }
    }
}

// =============================================================================
// USAGE COMPARISON
// =============================================================================

// Old way - Manual initialization and management
// const oldChatView = new OldChatView();

// New way - Automatic reactive updates
// const newChatView = new NewChatView();

// =============================================================================
// KEY DIFFERENCES SUMMARY
// =============================================================================

/*
OLD ARCHITECTURE PROBLEMS:
1. Direct DOM manipulation throughout the code
2. Manual event binding and cleanup
3. Scattered localStorage calls
4. Manual UI updates after state changes
5. Tight coupling between components
6. Difficult to track state changes
7. No automatic cleanup of resources
8. Hard to test individual components

NEW ARCHITECTURE BENEFITS:
1. Centralized state management
2. Automatic reactive updates
3. Component-based architecture
4. Automatic event management
5. Loose coupling through store
6. Easy to track all state changes
7. Automatic cleanup of subscriptions
8. Easy to test components in isolation
9. Better separation of concerns
10. More maintainable and scalable

MIGRATION STRATEGY:
1. Start by introducing the store service
2. Gradually migrate components one by one
3. Keep both systems running in parallel
4. Use feature flags to control rollout
5. Test thoroughly before full migration
6. Update documentation and training

PERFORMANCE BENEFITS:
1. Reduced DOM queries (cached selectors)
2. Efficient event handling
3. Optimized re-renders
4. Better memory management
5. Batch state updates
*/

export { OldChatView, NewChatView }; 