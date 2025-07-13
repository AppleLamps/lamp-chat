# Lamp.chat Architecture Guide

This guide explains the modernized architecture of Lamp.chat and how to use the new features for better maintainability and scalability.

## Overview

The application has been enhanced with several architectural improvements:

1. **Centralized State Management** - Single source of truth for application state
2. **Component-Based Architecture** - Reusable UI components with minimal DOM manipulation
3. **Build Process** - Modern development workflow with Vite
4. **BEM CSS Methodology** - Scalable and maintainable styling system

## Centralized State Management

### Store Service

The `store.js` service provides centralized state management with reactive updates.

```javascript
import store from './services/store.js';

// Get current state
const state = store.getState();

// Get specific state value
const activeConversationId = store.getStateValue('chat.activeConversationId');

// Subscribe to state changes
const unsubscribe = store.subscribe('chat', (newState, oldState) => {
    console.log('Chat state changed:', newState.chat);
});

// Dispatch actions to update state
store.dispatch({
    type: 'CHAT_SET_ACTIVE_CONVERSATION',
    payload: 'chat_123'
});
```

### Available Actions

#### UI Actions
- `UI_SET_SIDEBAR_OPEN` - Toggle sidebar visibility
- `UI_SET_THEME` - Change theme (light/dark)
- `UI_SET_COLOR_THEME` - Change color theme
- `UI_TOGGLE_DROPDOWN` - Open/close dropdowns
- `UI_CLOSE_DROPDOWNS` - Close all dropdowns

#### Chat Actions
- `CHAT_SET_ACTIVE_CONVERSATION` - Set active conversation
- `CHAT_SET_CONVERSATIONS` - Update conversation list
- `CHAT_ADD_CONVERSATION` - Add new conversation
- `CHAT_UPDATE_CONVERSATION` - Update existing conversation
- `CHAT_DELETE_CONVERSATION` - Delete conversation
- `CHAT_SET_LOADING` - Set loading state
- `CHAT_SET_ATTACHMENTS` - Update attachments

#### API Actions
- `API_SET_ACTIVE_MODEL` - Set active AI model
- `API_SET_AVAILABLE_MODELS` - Update available models
- `API_SET_TEMPERATURE` - Set temperature parameter
- `API_SET_MAX_TOKENS` - Set max tokens parameter

#### System Actions
- `SYSTEM_SET_ACTIVE_PROMPT` - Set active system prompt
- `SYSTEM_SET_PROMPTS` - Update system prompts
- `SYSTEM_SET_MEMORY_ENABLED` - Toggle memory feature
- `SYSTEM_SET_MESSAGE_USAGE` - Update usage statistics

## Component-Based Architecture

### Base UIComponent

The `UIComponent` class provides a foundation for building reusable UI components.

```javascript
import { UIComponent } from './utils/UIComponent.js';

class MyComponent extends UIComponent {
    constructor(selector, options = {}) {
        super(selector, options);
    }

    init() {
        // Initialize component state
        this.state = {
            isVisible: true,
            data: []
        };
    }

    bindEvents() {
        // Bind event listeners
        this.addEventListener('click', this.handleClick);
    }

    subscribeToStore() {
        // Subscribe to store changes
        const unsubscribe = store.subscribe('chat', (newState) => {
            this.handleStateChange(newState);
        });
        this.storeSubscriptions.push(unsubscribe);
    }

    handleClick(e) {
        // Handle click events
        this.setState({ isVisible: !this.state.isVisible });
    }

    render() {
        // Render component
        this.toggleClass('visible', this.state.isVisible);
    }
}
```

### Pre-built Components

#### DropdownComponent

```javascript
import { DropdownComponent } from './utils/UIComponent.js';

const dropdown = new DropdownComponent('.my-dropdown', {
    items: [
        { id: 'option1', name: 'Option 1' },
        { id: 'option2', name: 'Option 2' }
    ],
    activeItem: null,
    onSelect: (item) => {
        console.log('Selected:', item);
    }
});
```

#### ButtonComponent

```javascript
import { ButtonComponent } from './utils/UIComponent.js';

const button = new ButtonComponent('.my-button', {
    text: 'Click me',
    disabled: false,
    loading: false,
    onClick: (e) => {
        console.log('Button clicked');
    }
});

// Update button state
button.setText('New text');
button.setDisabled(true);
button.setLoading(true);
```

#### FormComponent

```javascript
import { FormComponent } from './utils/UIComponent.js';

const form = new FormComponent('#my-form', {
    validators: {
        email: (value) => {
            if (!value.includes('@')) return 'Invalid email';
            return null;
        }
    },
    onSubmit: (values) => {
        console.log('Form submitted:', values);
    }
});
```

## Modern View Pattern

### Using the Modern Chat View

The `ModernChatView` demonstrates the new architecture:

```javascript
import ModernChatView from './views/modernChatView.js';

// Initialize the modern chat view
const chatView = new ModernChatView();

// The view automatically:
// - Subscribes to store changes
// - Manages child components
// - Handles user interactions
// - Updates UI reactively
```

### Key Features

1. **Reactive Updates** - UI automatically updates when store state changes
2. **Component Management** - Child components are automatically managed
3. **Event Handling** - Centralized event handling through the store
4. **Separation of Concerns** - Clear separation between UI and business logic

## Build Process

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Features

- **Hot Module Replacement** - Instant updates during development
- **Asset Optimization** - Automatic minification and compression
- **Legacy Browser Support** - Transpilation for older browsers
- **Bundle Analysis** - Detailed bundle size reporting

## BEM CSS Methodology

### Structure

```css
/* Block */
.button { }

/* Element */
.button__icon { }
.button__text { }

/* Modifier */
.button--primary { }
.button--large { }
.button--disabled { }

/* Combined */
.button--primary .button__icon { }
```

### Example Usage

```html
<!-- Button component -->
<button class="button button--primary button--large">
    <span class="button__icon">📧</span>
    <span class="button__text">Send Message</span>
</button>

<!-- Dropdown component -->
<div class="dropdown dropdown--show">
    <button class="dropdown__trigger button button--secondary">
        Select Option
    </button>
    <div class="dropdown__content">
        <button class="dropdown__item dropdown__item--active">Option 1</button>
        <button class="dropdown__item">Option 2</button>
        <div class="dropdown__divider"></div>
        <div class="dropdown__header">More Options</div>
        <button class="dropdown__item">Option 3</button>
    </div>
</div>
```

### Available Components

- **Button** - `.button` with variants and states
- **Dropdown** - `.dropdown` with items and headers
- **Form** - `.form` with validation and error handling
- **Modal** - `.modal` with header, body, and footer
- **Card** - `.card` with structured content
- **Alert** - `.alert` with success, error, and warning states
- **Badge** - `.badge` for status indicators
- **Loading** - `.loading` spinner component

## Migration Guide

### From Direct DOM Manipulation

**Old way:**
```javascript
// Old pattern
const button = document.getElementById('my-button');
button.addEventListener('click', () => {
    button.textContent = 'Loading...';
    button.disabled = true;
    // Do something...
});
```

**New way:**
```javascript
// New pattern
const button = new ButtonComponent('#my-button', {
    onClick: () => {
        button.setText('Loading...');
        button.setDisabled(true);
        // Do something...
    }
});
```

### From LocalStorage to Store

**Old way:**
```javascript
// Old pattern
const conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
conversations.push(newConversation);
localStorage.setItem('conversations', JSON.stringify(conversations));
```

**New way:**
```javascript
// New pattern
store.dispatch({
    type: 'CHAT_ADD_CONVERSATION',
    payload: newConversation
});
```

### From Event Callbacks to Reactive Updates

**Old way:**
```javascript
// Old pattern
function updateModelSelector(provider, model) {
    const button = document.querySelector('.model-selector-btn');
    button.textContent = getModelName(provider, model);
    
    // Update multiple places manually
    updateModelDropdown(provider, model);
    updateModelSettings(provider, model);
}
```

**New way:**
```javascript
// New pattern
// Dispatch once, all subscribed components update automatically
store.dispatch({
    type: 'API_SET_ACTIVE_MODEL',
    payload: { provider, model }
});
```

## Best Practices

### State Management

1. **Use actions for all state changes** - Never mutate state directly
2. **Subscribe to specific state paths** - Only listen to relevant changes
3. **Clean up subscriptions** - Always unsubscribe when components are destroyed
4. **Keep state normalized** - Avoid nested data structures when possible

### Component Development

1. **Extend UIComponent** - Use the base class for consistency
2. **Initialize in constructor** - Set up state and options early
3. **Use lifecycle methods** - Leverage init(), render(), and destroy()
4. **Manage child components** - Use addChild() and removeChild()

### CSS Organization

1. **Follow BEM naming** - Use block__element--modifier pattern
2. **Use CSS custom properties** - Leverage the existing design system
3. **Group related styles** - Keep component styles together
4. **Use utility classes** - Leverage `.u-*` classes for common patterns

### Performance

1. **Subscribe selectively** - Only listen to necessary state changes
2. **Batch updates** - Group related state changes together
3. **Use lazy loading** - Load components only when needed
4. **Optimize renders** - Minimize DOM manipulations

## Debugging

### Store Debugging

```javascript
// Get current state snapshot
console.log(store.getSnapshot());

// Monitor all state changes
store.subscribe('*', (newState, oldState) => {
    console.log('State changed:', { newState, oldState });
});
```

### Component Debugging

```javascript
// Check component state
console.log(component.state);

// List child components
console.log(component.children);

// Check event listeners
console.log(component.eventListeners);
```

## Future Enhancements

### Potential Improvements

1. **TypeScript Support** - Add type safety and better developer experience
2. **Testing Framework** - Add unit and integration tests
3. **PWA Features** - Add offline support and installability
4. **Performance Monitoring** - Add metrics and performance tracking
5. **Component Library** - Create a comprehensive component library
6. **Documentation Site** - Build an interactive documentation site

### Migration Path

1. **Gradual Migration** - Convert views one at a time
2. **Parallel Development** - Keep old and new systems running together
3. **Feature Flags** - Use feature flags to control rollout
4. **Testing** - Thoroughly test new components before deployment

This architecture provides a solid foundation for building maintainable, scalable applications while preserving the simplicity and performance of vanilla JavaScript. 