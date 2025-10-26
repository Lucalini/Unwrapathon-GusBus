# 🤖 Pattern Detection Feature

## Overview

The widget now automatically detects when users might need help based on their browsing behavior and proactively opens the chat to offer assistance.

## How It Works

### Detection Logic

The widget tracks URL visits and detects:
- **Repeated visits to the same page** (3+ times in 10 minutes)

When a pattern is detected, the chat automatically opens with a contextual greeting:

> 👋 Hi! I noticed you've been browsing this page a few times.
> 
> Can I help you find something or answer any questions?

### Smart Cooldown System

To avoid being intrusive:
- ✅ **5-minute cooldown** between auto-prompts
- ✅ **30-minute session cooldown** if user dismisses the chat
- ✅ Only triggers **once per pattern** per session
- ✅ Respects manual open/close actions

## Configuration

All settings are in `src/utils/patternDetector.ts`:

```typescript
const CONFIG = {
  REPEATED_VISIT_THRESHOLD: 3,      // Number of visits to trigger
  TIME_WINDOW_MS: 10 * 60 * 1000,   // 10 minutes
  COOLDOWN_MS: 5 * 60 * 1000,       // 5 minute cooldown
  SESSION_COOLDOWN_MS: 30 * 60 * 1000, // 30 minute session cooldown
  MAX_STORED_VISITS: 50             // Limit storage
};
```

## Testing

### Test Pattern Detection:

1. Visit the same page 3 times within 10 minutes
2. Widget should auto-open with contextual greeting
3. Close the widget - it won't open again for 30 minutes

### Console Logs:

```javascript
🔄 URL changed, tracking visit
🔔 Pattern detected: User visited https://example.com 3 times in last 10 minutes
🤖 Auto-opening chat due to pattern detection
```

### Manual Testing Commands (in browser console):

```javascript
// Clear all pattern data (reset testing)
window.localStorage.removeItem('tampermonkey_url_visits');
window.localStorage.removeItem('tampermonkey_last_auto_prompt');
window.localStorage.removeItem('tampermonkey_dismissed_patterns');

// Check current visits
JSON.parse(localStorage.getItem('tampermonkey_url_visits'));

// Check cooldown status
localStorage.getItem('tampermonkey_last_auto_prompt');
```

## Privacy

- All data stored **locally only** (localStorage)
- No tracking sent to servers
- Data auto-expires after time windows
- Limited to last 50 visits

## Future Enhancements

Potential additions:
- **Rapid clicking detection** - User clicking same button multiple times
- **Back button thrashing** - Rapid back/forward navigation
- **Scroll frustration** - Rapid scroll up/down patterns
- **Time on page** - Extended time without interaction
- **Element-specific patterns** - Track specific button/link clicks

## Architecture

```
src/utils/
├── patternDetector.ts    # Core pattern detection logic
├── webHistoryTracker.ts  # URL/page tracking
└── ...

src/components/
└── ChatWidget.tsx        # Integrates pattern detection
                          # Auto-opens on pattern match
```

## API

### `PatternDetector` Class

```typescript
// Track a URL visit
patternDetector.trackVisit(url: string): void

// Check if help should be shown
patternDetector.shouldShowHelp(): {
  show: boolean;
  reason?: string;
  url?: string;
}

// Mark that prompt was shown (starts cooldown)
patternDetector.markPromptShown(): void

// Mark that user dismissed the prompt (longer cooldown)
patternDetector.markDismissed(): void

// Clear all data (testing/debugging)
patternDetector.clearData(): void
```

## Example Flow

```
User visits: /surf-report/pismo-beach
  → Tracked

User clicks around, comes back to: /surf-report/pismo-beach
  → Tracked (2nd visit)

User leaves, returns again: /surf-report/pismo-beach
  → Tracked (3rd visit)
  → 🔔 Pattern detected!
  → 🤖 Chat auto-opens with contextual message

User closes chat
  → Marked as dismissed
  → 30-minute cooldown starts
```

## Notes

- Works with **Single Page Apps (SPAs)** - monitors URL changes every second
- Won't trigger in **iframes** - pattern detection only runs in main window
- **localStorage required** - gracefully degrades if unavailable

