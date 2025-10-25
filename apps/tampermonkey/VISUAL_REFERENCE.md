# Visual Reference - AI Agent Chat Widget

## Widget States

### 1. Collapsed State (Initial)

```
┌─────────────────────────────────────────┐
│                                         │
│         Host Website Content            │
│                                         │
│                                         │
│                                    ┌────┐
│                                    │ 💬 │
│                                    └────┘
│                                 (purple button)
└─────────────────────────────────────────┘
```

**Features:**
- Floating button in bottom right corner
- Purple gradient (667eea → 764ba2)
- Chat icon in white
- 60x60px circle
- Shadow for depth
- Hover effect (scale 1.05)

---

### 2. Expanded State (Chat Open)

```
┌─────────────────────────────────────────┐
│                                         │
│         Host Website Content            │
│                                         │
│                   ┌─────────────────────┐
│                   │ AI Assistant      × │ ← Header (purple gradient)
│                   ├─────────────────────┤
│                   │ 👋 Hello! How can  │
│                   │ I help you today?   │
│                   │                     │
│                   │ ┌─────────────────┐ │
│                   │ │ User            │ │ ← User message
│                   │ │ I need help     │ │   (purple gradient)
│                   │ │ 2:30 PM         │ │
│                   │ └─────────────────┘ │
│                   │                     │
│                   │ ┌─────────────────┐ │
│                   │ │ Chatbot         │ │ ← Bot message
│                   │ │ How can I help? │ │   (white bg)
│                   │ │ 2:30 PM         │ │
│                   │ └─────────────────┘ │
│                   ├─────────────────────┤
│                   │ [Type message...] ▶ │ ← Input area
│                   ├─────────────────────┤
│                   │ [End & Submit]      │ ← Footer (red)
│                   └─────────────────────┘
│                        380x600px
└─────────────────────────────────────────┘
```

**Sections:**

1. **Header** (purple gradient)
   - Title: "AI Assistant"
   - Close button (×)

2. **Messages Area** (light gray bg)
   - Welcome message (centered)
   - User messages (right, purple)
   - Bot messages (left, white)
   - Auto-scroll to bottom

3. **Input Area** (white bg)
   - Text input (rounded)
   - Send button (purple circle, ▶)

4. **Footer** (white bg)
   - "End Conversation & Submit" (red button)
   - Only shows when messages exist

---

## Color Palette

```
Primary Gradient:
┌──────┬──────┐
│ #667 │ #764 │  Purple gradient
│  eea │  ba2 │  (button, header, user messages)
└──────┴──────┘

Text Colors:
■ #ffffff   White (text on gradient)
■ #212529   Dark gray (text on white)
■ #6c757d   Medium gray (timestamps)

Background Colors:
■ #ffffff   White (messages, inputs)
■ #f8f9fa   Light gray (messages container)

Borders:
■ #dee2e6   Light border
■ #e9ecef   Very light border

Buttons:
■ #dc3545   Red (end conversation)
■ #c82333   Dark red (hover)
```

---

## Typography

```
Font Family:
-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen'

Sizes:
- Header title: 18px (600 weight)
- Messages: 14px (400 weight)
- Sender label: 12px (600 weight)
- Timestamps: 11px (400 weight)
- Welcome: 16px (400 weight)
- Input: 14px (400 weight)
- Button: 14px (600 weight)
```

---

## Dimensions

```
Floating Button:
- Size: 60x60px
- Border radius: 50% (circle)
- Position: fixed, bottom 20px, right 20px

Chat Window:
- Width: 380px
- Height: 600px
- Border radius: 12px
- Position: fixed, bottom 20px, right 20px

Mobile (< 480px):
- Width: calc(100vw - 32px)
- Height: calc(100vh - 100px)

Message Bubbles:
- Max width: 75%
- Padding: 12px 16px
- Border radius: 12px

Input Field:
- Padding: 12px 16px
- Border radius: 24px
- Height: 44px

Send Button:
- Size: 44x44px
- Border radius: 50% (circle)
```

---

## Animations

### Slide In (Chat Window)
```
@keyframes slideIn {
  from {
    opacity: 0
    transform: translateY(20px)
  }
  to {
    opacity: 1
    transform: translateY(0)
  }
}
Duration: 0.3s ease-out
```

### Fade In (Messages)
```
@keyframes fadeIn {
  from {
    opacity: 0
    transform: translateY(10px)
  }
  to {
    opacity: 1
    transform: translateY(0)
  }
}
Duration: 0.3s ease-out
```

### Button Hover
```
- Transform: scale(1.05)
- Duration: 0.2s
- Easing: ease
```

### Button Press
```
- Transform: scale(0.95)
- Duration: 0.2s
- Easing: ease
```

---

## Shadow Effects

```
Floating Button:
- box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)
- Hover: 0 6px 16px rgba(0, 0, 0, 0.2)

Chat Window:
- box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12)

Message Bubbles:
- box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05)
```

---

## Scrollbar Styling

```
Width: 6px

Track:
- Background: transparent

Thumb:
- Background: #cbd5e0
- Border radius: 3px
- Hover: #a0aec0
```

---

## Icon SVGs

### Chat Icon (Floating Button)
```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="white">
  <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 
           22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 
           18V4H20V16Z"/>
</svg>
```

### Send Icon (Input Area)
```svg
<svg width="20" height="20" viewBox="0 0 20 20" fill="white">
  <path d="M2 10L18 2L10 18L8 10L2 10Z"/>
</svg>
```

---

## Layout Hierarchy

```
ChatWidget
├── Floating Button (isOpen = false)
│   └── Chat Icon SVG
│
└── Chat Window (isOpen = true)
    ├── Header
    │   ├── Title Text
    │   └── Close Button
    │
    ├── Messages Container
    │   ├── Welcome Message (if no messages)
    │   └── Message List
    │       ├── User Message
    │       │   ├── Sender Label
    │       │   ├── Text Content
    │       │   └── Timestamp
    │       │
    │       └── Bot Message
    │           ├── Sender Label
    │           ├── Text Content
    │           └── Timestamp
    │
    ├── Input Container
    │   ├── Text Input
    │   └── Send Button
    │       └── Send Icon SVG
    │
    └── Footer (conditional)
        └── End Conversation Button
```

---

## Responsive Breakpoints

```
Desktop (> 480px):
- Chat window: 380x600px fixed
- Position: bottom-right

Mobile (≤ 480px):
- Chat window: almost full screen
- Width: calc(100vw - 32px)
- Height: calc(100vh - 100px)
- Still bottom-right positioned
```

---

## Z-Index Hierarchy

```
10000  - Chat widget container
9999   - Modal overlay (future)
9998   - Dropdown menus (future)
...
1      - Host page content
```

---

## User Interaction States

### Button States
```
Normal:     [Button]
Hover:      [Button] (scale 1.05, brighter shadow)
Active:     [Button] (scale 0.95)
Disabled:   [Button] (opacity 0.5, no pointer)
```

### Input States
```
Normal:     [________]  (border: #dee2e6)
Focus:      [________]  (border: #667eea)
Disabled:   [________]  (bg: #f8f9fa)
Error:      [________]  (border: #dc3545) *future
```

### Message States
```
Sending:    [Message...] (opacity 0.7) *future
Sent:       [Message] (opacity 1)
Failed:     [Message ⚠️] (red icon) *future
```

---

## Accessibility Features

```
ARIA Labels:
- aria-label="Open chat" (floating button)
- aria-label="Close chat" (close button)
- aria-label="Send message" (send button)

Keyboard Navigation:
- Tab: Navigate between elements
- Enter: Send message (in input)
- Escape: Close chat (future)

Screen Reader:
- Semantic HTML elements
- Proper heading hierarchy
- Descriptive button labels
```

---

## Future UI Enhancements

### Planned Visual Features
- [ ] Typing indicator (animated dots)
- [ ] Read receipts (checkmarks)
- [ ] Message timestamps on hover
- [ ] Avatar images
- [ ] Emoji picker
- [ ] File upload button
- [ ] Voice input button
- [ ] Minimize button (keep chat but collapse)
- [ ] Notification badge (unread count)
- [ ] Dark mode toggle
- [ ] Custom color themes
- [ ] Confetti animation on submit
- [ ] Loading skeleton screens

---

## Browser Rendering

### Works Best In
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Known Issues
- Old IE: Not supported (requires React 18)
- Safari < 14: Some CSS features may degrade

---

## Performance Considerations

### Optimization Techniques
- CSS animations (GPU accelerated)
- React memo for messages
- Virtualized scrolling (future, for long conversations)
- Lazy load images (future)
- Code splitting for large features

### Rendering Performance
- Initial render: < 100ms
- Message render: < 50ms
- Animation frame rate: 60fps
- No layout thrashing

---

**This visual reference helps designers and developers understand the exact appearance and behavior of the widget.** 🎨

