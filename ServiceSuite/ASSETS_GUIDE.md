# Pet Animation Assets Guide

This guide explains how to prepare and add the pet animation images for the User Sentiment Pet component.

## Overview

The User Sentiment Pet uses **20 images total** - 4 animation frames for each of the 5 health stages. These images create a smooth animated visualization of your app's health.

## Image Requirements

### Specifications
- **Format**: PNG (recommended) or JPG
- **Size**: 200x200px recommended (will scale to fit)
- **Background**: Transparent PNG recommended for best appearance
- **Animation frames**: 4 frames per stage for smooth animation
- **Total images**: 20 (5 stages × 4 frames)

### Animation Timing
- Frame duration: 500ms (0.5 seconds per frame)
- Total animation cycle: 2 seconds per loop
- Automatic infinite loop

## Directory Structure

```
public/assets/pet/
├── critical_1.png    ← Stage 1 (Health 0-19): Critical
├── critical_2.png
├── critical_3.png
├── critical_4.png
├── poor_1.png        ← Stage 2 (Health 20-39): Poor
├── poor_2.png
├── poor_3.png
├── poor_4.png
├── fair_1.png        ← Stage 3 (Health 40-59): Fair
├── fair_2.png
├── fair_3.png
├── fair_4.png
├── good_1.png        ← Stage 4 (Health 60-79): Good
├── good_2.png
├── good_3.png
├── good_4.png
├── excellent_1.png   ← Stage 5 (Health 80-100): Excellent
├── excellent_2.png
├── excellent_3.png
└── excellent_4.png
```

## Health Stages

### 1. Critical (0-19 points)
- **Color Theme**: Red (#dc2626)
- **Mood**: Severely distressed
- **Suggestions**: Very sad/sick pet, visible distress, low energy
- **Example animations**: 
  - Frame 1: Pet lying down
  - Frame 2: Pet slightly trembling
  - Frame 3: Pet looking very weak
  - Frame 4: Pet showing clear discomfort

### 2. Poor (20-39 points)
- **Color Theme**: Orange (#ea580c)
- **Mood**: Unwell/worried
- **Suggestions**: Sad pet, concerned expression, low activity
- **Example animations**:
  - Frame 1: Pet sitting with head down
  - Frame 2: Pet looking around worriedly
  - Frame 3: Pet with droopy ears/tail
  - Frame 4: Pet showing mild stress

### 3. Fair (40-59 points)
- **Color Theme**: Yellow (#ca8a04)
- **Mood**: Neutral/okay
- **Suggestions**: Calm pet, neutral expression, moderate activity
- **Example animations**:
  - Frame 1: Pet sitting calmly
  - Frame 2: Pet looking around
  - Frame 3: Pet in resting position
  - Frame 4: Pet showing mild interest

### 4. Good (60-79 points)
- **Color Theme**: Green (#16a34a)
- **Mood**: Happy/content
- **Suggestions**: Happy pet, positive expression, active
- **Example animations**:
  - Frame 1: Pet standing alert
  - Frame 2: Pet tail wagging
  - Frame 3: Pet with happy expression
  - Frame 4: Pet showing interest

### 5. Excellent (80-100 points)
- **Color Theme**: Cyan (#0891b2)
- **Mood**: Very happy/playful
- **Suggestions**: Energetic pet, excited expression, very active
- **Example animations**:
  - Frame 1: Pet jumping
  - Frame 2: Pet in playful pose
  - Frame 3: Pet very excited
  - Frame 4: Pet celebrating

## Creating Your Images

### Option 1: Use Existing Pet Sprite Sheet
If you have a pet sprite sheet:
1. Extract individual frames
2. Rename to match the naming convention
3. Save as PNG files

### Option 2: Create New Assets

#### Tools
- **Pixel Art**: Aseprite, Piskel, GraphicsGale
- **Vector**: Adobe Illustrator, Figma, Sketch
- **3D**: Blender (render to 2D sprites)
- **Photo editing**: Photoshop, GIMP, Photopea

#### Process
1. Choose a pet character (dog, cat, robot, mascot, etc.)
2. Create 5 base poses (one per health stage)
3. Create 4 animation frames for each pose
4. Export at consistent size (200x200px recommended)
5. Save with transparent background
6. Name according to convention

### Option 3: Use Emojis/Icons (Simple)
For quick testing or minimalist design:
1. Use large emoji or icon fonts
2. Screenshot or export at 200x200px
3. Create variations for different stages
4. Add simple color overlays for animation frames

### Option 4: Commission/Purchase
- **Fiverr**: Commission custom pet sprites
- **Itch.io**: Purchase pre-made sprite packs
- **OpenGameArt**: Find free/open-source sprites
- **Unity Asset Store**: Find sprite packs

## Installation

Once you have your 20 images:

```bash
# Navigate to project root
cd /Users/lucaverweyen/Unwrapathon-GusBus

# Copy images to assets folder
cp /path/to/your/images/*.png public/assets/pet/

# Verify files
ls public/assets/pet/
```

## Testing

After adding images:

1. Start the dev server: `npm start`
2. Navigate to Dashboard view
3. The pet should animate through your images
4. Health score changes will transition between stages

### Debug Tips
- Check browser console for image loading errors
- Inspect Network tab for 404s
- Verify file names match exactly (case-sensitive)
- Ensure images are in correct directory

## Fallback Behavior

If images are missing:
- Component shows emoji placeholders (🐕, 🐶, 😐, 😟, 😰)
- Dashed border placeholder visible
- Frame counter displayed
- Full functionality maintained

This allows development without images ready.

## Animation Customization

### Change Frame Rate

In `UserSentimentPet.js`, modify:

```javascript
useEffect(() => {
  const interval = setInterval(() => {
    setCurrentFrame((prev) => (prev + 1) % 4);
  }, 500); // Change this value (milliseconds)
  
  return () => clearInterval(interval);
}, []);
```

- `250` = Fast (4 fps)
- `500` = Normal (2 fps) ← Default
- `1000` = Slow (1 fps)

### Add More Frames

To use 8 frames instead of 4:

1. Create 8 frames per stage (40 images total)
2. Update naming: `excellent_1.png` to `excellent_8.png`
3. Modify code:

```javascript
// Change from 4 to 8
setCurrentFrame((prev) => (prev + 1) % 8);

// Update image path
const getImagePath = () => {
  const stage = HEALTH_STAGES[healthStage];
  return `/assets/pet/${stage.framePrefix}_${currentFrame + 1}.png`;
};
```

## Image Optimization

### Reduce File Size

```bash
# Install imagemagick
brew install imagemagick

# Optimize all PNGs
for file in public/assets/pet/*.png; do
  convert "$file" -strip -quality 85 "$file"
done
```

### Convert to WebP (Better compression)

```bash
# Convert PNGs to WebP
for file in public/assets/pet/*.png; do
  cwebp "$file" -o "${file%.png}.webp"
done
```

Update code to use WebP:
```javascript
return `/assets/pet/${stage.framePrefix}_${currentFrame + 1}.webp`;
```

## Examples of Pet Animation Themes

### 1. Classic Pet Dog
- Critical: Sick puppy
- Poor: Sad dog
- Fair: Calm dog
- Good: Happy dog
- Excellent: Excited/jumping dog

### 2. Robot/Tech Theme
- Critical: Sparking/broken robot
- Poor: Low battery robot
- Fair: Normal operation
- Good: Optimized robot
- Excellent: Super-charged robot

### 3. Plant Growth
- Critical: Wilted plant
- Poor: Drooping plant
- Fair: Small sprout
- Good: Growing plant
- Excellent: Blooming flower

### 4. Weather System
- Critical: Storm clouds
- Poor: Overcast
- Fair: Partly cloudy
- Good: Sunny
- Excellent: Rainbow/perfect weather

### 5. Character Emotions
- Critical: 😰 Very distressed
- Poor: 😟 Worried
- Fair: 😐 Neutral
- Good: 🙂 Happy
- Excellent: 🤩 Ecstatic

## Resources

### Free Sprite Resources
- [OpenGameArt.org](https://opengameart.org/)
- [Itch.io Free Assets](https://itch.io/game-assets/free)
- [Kenney Assets](https://kenney.nl/assets)
- [Craftpix Free Assets](https://craftpix.net/freebies/)

### Pixel Art Tools (Free)
- [Piskel](https://www.piskelapp.com/) - Web-based
- [LibreSprite](https://libresprite.github.io/) - Desktop
- [Pixilart](https://www.pixilart.com/) - Web-based

### Animation Tutorials
- [Pixel art animation basics](https://blog.studiominiboss.com/pixelart)
- [Character animation principles](https://www.youtube.com/watch?v=QY6Cn-H-PfE)

## License Considerations

When using third-party assets:
- Check license requirements
- Provide attribution if required
- Ensure commercial use is allowed
- Keep license files in `/public/assets/pet/LICENSE.txt`

## Support

Need help with assets?
- Post in project discussions
- Check community resources
- Contact GusBus team

---

Remember: The app works perfectly without custom images using emoji fallbacks. Add custom assets when ready to enhance the visual experience!

