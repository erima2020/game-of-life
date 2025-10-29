# Conway's Game of Life - HTML5 Canvas Implementation

An interactive, feature-rich implementation of Conway's Game of Life using HTML5 Canvas, React, and TypeScript. Explore cellular automata with an intuitive interface supporting mouse and touch input.

## Features

### Core Simulation
- **Conway's Rules**: Accurate implementation of the classic cellular automaton rules
  - Any live cell with 2-3 neighbors survives
  - Any dead cell with exactly 3 neighbors becomes alive
  - All other cells die or stay dead

### Interactive Controls
- **Play/Pause**: Start and stop the simulation at any time
- **Reset**: Return to the initial state
- **Clear**: Empty the entire grid
- **Random Fill**: Populate the grid with random cells at adjustable density

### Customization
- **Speed Control**: Adjust simulation speed from 1-20 generations per second
- **Grid Size**: Change grid dimensions from 10x10 to 100x100 cells
- **Color Customization**: Set custom colors for alive and dead cells
- **Grid Visibility**: Toggle grid lines on/off for cleaner visuals

### Pattern Presets
Quick-place classic patterns in the center of the grid:
- **Glider**: A moving pattern that travels diagonally
- **Blinker**: A simple oscillating pattern
- **Beacon**: A period-2 oscillator
- **Toad**: Another period-2 oscillator
- **Block**: A stable still life pattern
- **Tub**: A stable still life pattern

### Input Methods
- **Mouse**: Click cells to toggle their state
- **Touch**: Tap cells on mobile devices to toggle their state
- Both methods work while the simulation is running or paused

### Statistics
Real-time display of:
- Generation count
- Number of alive cells
- Number of dead cells

### Responsive Design
- Works seamlessly on desktop and mobile devices
- Adaptive canvas sizing based on grid configuration
- Touch-friendly controls and buttons

## Technology Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **Canvas**: HTML5 Canvas API for rendering
- **Icons**: Lucide React
- **Build Tool**: Vite

## Getting Started

### Prerequisites
- Node.js 18+ or pnpm 9+
- Modern web browser with HTML5 Canvas support

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd game-of-life

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
pnpm build
pnpm preview
```

## How to Play

1. **Set Up**: Click cells to create an initial pattern, or use the "Random" button
2. **Place Patterns**: Use pattern preset buttons to quickly add classic shapes
3. **Adjust Settings**: 
   - Change speed with the speed slider
   - Adjust grid size with the grid size slider
   - Toggle grid visibility with the checkbox
   - Customize colors with the color pickers
4. **Run Simulation**: Click "Play" to start the simulation
5. **Observe**: Watch as the cellular automaton evolves according to Conway's rules
6. **Experiment**: Pause, modify cells, and resume to test new configurations

## Project Structure

```
game-of-life/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── GameOfLife.tsx    # Main game component
│   │   │   └── ui/               # shadcn/ui components
│   │   ├── pages/
│   │   │   └── Home.tsx          # Home page
│   │   ├── App.tsx               # App router
│   │   ├── main.tsx              # React entry point
│   │   └── index.css             # Global styles
│   └── public/                   # Static assets
├── README.md
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Key Implementation Details

### Game Loop
- Uses `requestAnimationFrame` for smooth 60 FPS rendering
- Configurable update interval based on speed setting
- Efficient grid updates using memoization

### Neighbor Counting
- Wrapping edges (toroidal topology)
- Optimized neighbor detection algorithm
- O(n²) complexity per generation

### Canvas Rendering
- Double-buffering for smooth animation
- Efficient cell drawing with batch operations
- Grid line rendering with configurable visibility

### State Management
- React hooks for game state
- Memoized callbacks to prevent unnecessary re-renders
- Efficient grid updates with immutable patterns

## Performance Considerations

- Grid sizes up to 100x100 run smoothly on modern devices
- Optimized for mobile with touch event handling
- Canvas rendering scales efficiently with grid size
- Automatic cell size adjustment maintains visual clarity

## Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

- Zoom and pan controls for large grids
- Save/load patterns to local storage
- Pattern library with more presets
- Undo/redo functionality
- Statistics graphs and analysis
- Dark/light theme toggle
- Keyboard shortcuts

## License

MIT License - feel free to use this project for educational and personal purposes.

## References

- [Conway's Game of Life - Wikipedia](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life)
- [The Game of Life - Official](https://www.conwaylife.com/)
- [Cellular Automata - Wolfram MathWorld](https://mathworld.wolfram.com/CellularAutomaton.html)

## Contributing

Contributions are welcome! Feel free to fork the repository and submit pull requests for improvements, bug fixes, or new features.

---

**Created with ❤️ using React, TypeScript, and Canvas API**
