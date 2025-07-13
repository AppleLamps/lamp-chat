# Getting Started with the Improved Architecture

This guide will help you implement the architectural improvements for your Lamp.chat application step by step.

## Quick Start

### 1. Set Up the Build Process

First, install the required dependencies and set up the modern build process:

```bash
# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```

Your application will now be available at `http://localhost:3000` with hot reload enabled.

### 2. Include the New CSS Components

Add the new component styles to your HTML:

```html
<!-- Add to your HTML head section -->
<link rel="stylesheet" href="assets/css/components.css">
```

### 3. Start Using the Store

Replace direct localStorage usage with the centralized store:

```javascript
// Old way
localStorage.setItem('activeConversation', conversationId);

// New way
import store from './assets/js/services/store.js';
store.dispatch({
    type: 'CHAT_SET_ACTIVE_CONVERSATION',
    payload: conversationId
});
```

### 4. Use UI Components

Replace manual DOM manipulation with UI components:

```javascript
// Old way
const button = document.getElementById('send-btn');
button.addEventListener('click', handleClick);
button.disabled = true;

// New way
import { ButtonComponent } from './assets/js/utils/UIComponent.js';
const sendBtn = new ButtonComponent('#send-btn', {
    onClick: handleClick,
    disabled: true
});
```

## Step-by-Step Implementation

### Step 1: Set Up the Store (15 minutes)

1. **Import the store** in your main.js:
```javascript
import store from './assets/js/services/store.js';
```

2. **Initialize the store** with your existing data:
```javascript
// Load existing data into store
const conversations = JSON.parse(localStorage.getItem('t3chat_conversations') || '[]');
store.dispatch({
    type: 'CHAT_SET_CONVERSATIONS',
    payload: conversations
});
```

3. **Subscribe to changes** in your view:
```javascript
const unsubscribe = store.subscribe('chat', (newState, oldState) => {
    // Update UI when chat state changes
    if (newState.chat.conversations !== oldState.chat.conversations) {
        renderConversationList();
    }
});
```

### Step 2: Create Your First Component (20 minutes)

1. **Import the UIComponent**:
```javascript
import { UIComponent } from './assets/js/utils/UIComponent.js';
```

2. **Create a simple component**:
```javascript
class ChatInput extends UIComponent {
    constructor() {
        super('#chat-input', {
            autoMount: true,
            reactive: true
        });
    }

    init() {
        this.state = {
            value: '',
            disabled: false
        };
    }

    bindEvents() {
        this.addEventListener('input', (e) => {
            this.setState({ value: e.target.value });
        });
    }

    subscribeToStore() {
        const unsubscribe = store.subscribe('chat.isLoading', (newState) => {
            this.setState({ disabled: newState.chat.isLoading });
        });
        this.storeSubscriptions.push(unsubscribe);
    }

    render() {
        if (this.element) {
            this.element.disabled = this.state.disabled;
        }
    }
}

// Initialize the component
const chatInput = new ChatInput();
```

### Step 3: Use BEM CSS Classes (10 minutes)

1. **Update your HTML** to use BEM classes:
```html
<!-- Old way -->
<button class="send-btn primary large">Send</button>

<!-- New way -->
<button class="button button--primary button--large">Send</button>
```

2. **Apply the styles**:
```css
/* Your existing styles will work, but you can now use: */
.button--primary {
    background-color: var(--color-primary);
    color: white;
}

.button--large {
    padding: var(--space-md) var(--space-lg);
}
```

### Step 4: Integrate with Existing Services (25 minutes)

1. **Update your chat service** to use the store:
```javascript
// In your existing chatService.js
import store from './store.js';

// Replace direct localStorage calls
class ChatService {
    addMessage(conversationId, message, role) {
        // ... existing logic ...
        
        // Update store instead of localStorage
        store.dispatch({
            type: 'CHAT_UPDATE_CONVERSATION',
            payload: { id: conversationId, messages: updatedMessages }
        });
    }
}
```

2. **Update your API service** to use the store:
```javascript
// In your existing apiService.js
import store from './store.js';

class ApiService {
    setActiveModel(provider, model) {
        // ... existing logic ...
        
        // Update store
        store.dispatch({
            type: 'API_SET_ACTIVE_MODEL',
            payload: { provider, model }
        });
    }
}
```

## Common Patterns

### Pattern 1: Reactive UI Updates

```javascript
// Subscribe to specific state changes
store.subscribe('chat.activeConversationId', (newState, oldState) => {
    const newActiveId = newState.chat.activeConversationId;
    const oldActiveId = oldState.chat.activeConversationId;
    
    if (newActiveId !== oldActiveId) {
        highlightActiveConversation(newActiveId);
        loadConversationMessages(newActiveId);
    }
});
```

### Pattern 2: Component Communication

```javascript
// Parent component
class ChatView extends UIComponent {
    constructor() {
        super('#chat-view');
        
        // Child components communicate through the store
        this.messageInput = new MessageInput();
        this.messageList = new MessageList();
        this.addChild('messageInput', this.messageInput);
        this.addChild('messageList', this.messageList);
    }
}
```

### Pattern 3: Form Validation

```javascript
const chatForm = new FormComponent('#chat-form', {
    validators: {
        message: (value) => {
            if (!value.trim()) return 'Message cannot be empty';
            if (value.length > 1000) return 'Message too long';
            return null;
        }
    },
    onSubmit: (values) => {
        // Handle form submission
        sendMessage(values.message);
    }
});
```

## Troubleshooting

### Common Issues

1. **Component not updating**: Make sure you're subscribing to the correct state path:
```javascript
// Wrong
store.subscribe('chat', callback);

// Right
store.subscribe('chat.conversations', callback);
```

2. **Memory leaks**: Always clean up subscriptions:
```javascript
// In your component's destroy method
this.storeSubscriptions.forEach(unsubscribe => unsubscribe());
```

3. **State not persisting**: Make sure actions are dispatched correctly:
```javascript
// Wrong
store.state.chat.activeConversationId = 'new-id';

// Right
store.dispatch({
    type: 'CHAT_SET_ACTIVE_CONVERSATION',
    payload: 'new-id'
});
```

### Debug Tips

1. **Monitor state changes**:
```javascript
store.subscribe('*', (newState, oldState) => {
    console.log('State changed:', { newState, oldState });
});
```

2. **Check component state**:
```javascript
console.log('Component state:', myComponent.state);
console.log('Store state:', store.getState());
```

3. **Use the browser devtools**: The store provides debugging methods:
```javascript
// In browser console
window.store = store; // Make store available globally
store.getSnapshot(); // Get current state
```

## Next Steps

1. **Migrate one view at a time**: Start with the simplest view and work your way up
2. **Test thoroughly**: Make sure each migrated component works correctly
3. **Update documentation**: Document your specific patterns and conventions
4. **Train your team**: Share knowledge about the new architecture

## Production Deployment

When you're ready to deploy:

```bash
# Build for production
npm run build

# The dist/ folder contains your optimized application
# Deploy the contents of dist/ to your web server
```

## Need Help?

- Check the `ARCHITECTURE.md` file for detailed documentation
- Look at `migration-example.js` for practical examples
- Review the existing components in `assets/js/utils/UIComponent.js`
- Test your changes with the development server before deploying

This architecture will make your application much more maintainable and easier to extend with new features! 