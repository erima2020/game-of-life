import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, Trash2, Zap, Grid3x3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';

interface GameState {
  grid: boolean[][];
  generation: number;
  isRunning: boolean;
  speed: number;
  gridSize: number;
  cellSize: number;
  showGrid: boolean;
  aliveColor: string;
  deadColor: string;
  gridColor: string;
}

const PATTERNS: Record<string, boolean[][]> = {
  glider: [
    [false, true, false],
    [false, false, true],
    [true, true, true],
  ],
  blinker: [
    [true, true, true],
  ],
  beacon: [
    [true, true, false, false],
    [true, true, false, false],
    [false, false, true, true],
    [false, false, true, true],
  ],
  toad: [
    [false, true, true, true],
    [true, true, true, false],
  ],
  block: [
    [true, true],
    [true, true],
  ],
  tub: [
    [false, true, false],
    [true, false, true],
    [false, true, false],
  ],
};

export default function GameOfLife() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const [gameState, setGameState] = useState<GameState>({
    grid: Array.from({ length: 50 }, () => Array(50).fill(false)),
    generation: 0,
    isRunning: false,
    speed: 5,
    gridSize: 50,
    cellSize: 12,
    showGrid: true,
    aliveColor: '#10b981',
    deadColor: '#1f2937',
    gridColor: '#374151',
  });

  const [selectedPattern, setSelectedPattern] = useState<string>('glider');
  const [stats, setStats] = useState({ alive: 0, dead: 0 });

  // Initialize grid
  const initializeGrid = useCallback((size: number) => {
    return Array.from({ length: size }, () => Array(size).fill(false));
  }, []);

  // Count neighbors
  const countNeighbors = useCallback((grid: boolean[][], x: number, y: number): number => {
    let count = 0;
    const size = grid.length;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const nx = (x + dx + size) % size;
        const ny = (y + dy + size) % size;
        if (grid[ny][nx]) count++;
      }
    }
    return count;
  }, []);

  // Apply Conway's Game of Life rules
  const updateGrid = useCallback((currentGrid: boolean[][]): boolean[][] => {
    const newGrid = currentGrid.map(row => [...row]);
    const size = currentGrid.length;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const neighbors = countNeighbors(currentGrid, x, y);
        const isAlive = currentGrid[y][x];

        if (isAlive && (neighbors === 2 || neighbors === 3)) {
          newGrid[y][x] = true;
        } else if (!isAlive && neighbors === 3) {
          newGrid[y][x] = true;
        } else {
          newGrid[y][x] = false;
        }
      }
    }

    return newGrid;
  }, [countNeighbors]);

  // Draw grid on canvas
  const drawGrid = useCallback((grid: boolean[][], state: GameState) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = grid[0].length * state.cellSize;
    const height = grid.length * state.cellSize;

    ctx.fillStyle = state.deadColor;
    ctx.fillRect(0, 0, width, height);

    // Draw alive cells
    ctx.fillStyle = state.aliveColor;
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (grid[y][x]) {
          ctx.fillRect(
            x * state.cellSize,
            y * state.cellSize,
            state.cellSize,
            state.cellSize
          );
        }
      }
    }

    // Draw grid lines
    if (state.showGrid) {
      ctx.strokeStyle = state.gridColor;
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= grid.length; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * state.cellSize);
        ctx.lineTo(width, i * state.cellSize);
        ctx.stroke();
      }
      for (let i = 0; i <= grid[0].length; i++) {
        ctx.beginPath();
        ctx.moveTo(i * state.cellSize, 0);
        ctx.lineTo(i * state.cellSize, height);
        ctx.stroke();
      }
    }
  }, []);

  // Calculate statistics
  const calculateStats = useCallback((grid: boolean[][]) => {
    let alive = 0;
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (grid[y][x]) alive++;
      }
    }
    setStats({ alive, dead: grid.length * grid[0].length - alive });
  }, []);

  // Game loop
  useEffect(() => {
    const animate = (currentTime: number) => {
      if (gameState.isRunning) {
        const timeSinceLastUpdate = currentTime - lastUpdateRef.current;
        const updateInterval = 1000 / gameState.speed;

        if (timeSinceLastUpdate > updateInterval) {
          setGameState(prev => {
            const newGrid = updateGrid(prev.grid);
            drawGrid(newGrid, prev);
            calculateStats(newGrid);
            lastUpdateRef.current = currentTime;
            return { ...prev, grid: newGrid, generation: prev.generation + 1 };
          });
        }
      }
      drawGrid(gameState.grid, gameState);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, drawGrid, updateGrid, calculateStats]);

  // Canvas click handler
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / gameState.cellSize);
    const y = Math.floor((e.clientY - rect.top) / gameState.cellSize);

    if (x >= 0 && x < gameState.gridSize && y >= 0 && y < gameState.gridSize) {
      setGameState(prev => {
        const newGrid = prev.grid.map(row => [...row]);
        newGrid[y][x] = !newGrid[y][x];
        drawGrid(newGrid, prev);
        calculateStats(newGrid);
        return { ...prev, grid: newGrid };
      });
    }
  };

  // Touch handler
  const handleCanvasTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      const x = Math.floor((touch.clientX - rect.left) / gameState.cellSize);
      const y = Math.floor((touch.clientY - rect.top) / gameState.cellSize);

      if (x >= 0 && x < gameState.gridSize && y >= 0 && y < gameState.gridSize) {
        setGameState(prev => {
          const newGrid = prev.grid.map(row => [...row]);
          newGrid[y][x] = !newGrid[y][x];
          return { ...prev, grid: newGrid };
        });
      }
    }
  };

  // Place pattern
  const placePattern = (patternName: string) => {
    const pattern = PATTERNS[patternName];
    if (!pattern) return;

    setGameState(prev => {
      const newGrid = prev.grid.map(row => [...row]);
      const startX = Math.floor((prev.gridSize - pattern[0].length) / 2);
      const startY = Math.floor((prev.gridSize - pattern.length) / 2);

      for (let y = 0; y < pattern.length; y++) {
        for (let x = 0; x < pattern[y].length; x++) {
          if (startX + x >= 0 && startX + x < prev.gridSize &&
              startY + y >= 0 && startY + y < prev.gridSize) {
            newGrid[startY + y][startX + x] = pattern[y][x] as boolean;
          }
        }
      }

      drawGrid(newGrid, prev);
      calculateStats(newGrid);
      return { ...prev, grid: newGrid };
    });
  };

  // Random fill
  const randomFill = (density: number = 0.3) => {
    setGameState(prev => {
      const newGrid = prev.grid.map(row =>
        row.map(() => Math.random() < density)
      );
      drawGrid(newGrid, prev);
      calculateStats(newGrid);
      return { ...prev, grid: newGrid, generation: 0 };
    });
  };

  // Reset
  const reset = () => {
    const newGrid = initializeGrid(gameState.gridSize);
    setGameState(prev => ({
      ...prev,
      grid: newGrid,
      generation: 0,
      isRunning: false,
    }));
    calculateStats(newGrid);
  };

  // Change grid size
  const changeGridSize = (newSize: number) => {
    const newGrid = initializeGrid(newSize);
    const newCellSize = Math.max(4, Math.floor(600 / newSize));
    setGameState(prev => ({
      ...prev,
      grid: newGrid,
      gridSize: newSize,
      cellSize: newCellSize,
      generation: 0,
      isRunning: false,
    }));
    calculateStats(newGrid);
  };

  const canvasWidth = gameState.gridSize * gameState.cellSize;
  const canvasHeight = gameState.gridSize * gameState.cellSize;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-4">
      <Card className="p-6 bg-background">
        <h1 className="text-3xl font-bold mb-2">Conway's Game of Life</h1>
        <p className="text-muted-foreground">
          Click cells to toggle them, or use patterns. Press play to start the simulation.
        </p>
      </Card>

      {/* Canvas */}
      <Card className="p-4 bg-background overflow-auto">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          onClick={handleCanvasClick}
          onTouchStart={handleCanvasTouch}
          onTouchMove={handleCanvasTouch}
          className="border border-border rounded cursor-crosshair bg-slate-900"
        />
      </Card>

      {/* Statistics */}
      <Card className="p-4 bg-background grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Generation</p>
          <p className="text-2xl font-bold">{gameState.generation}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Alive Cells</p>
          <p className="text-2xl font-bold text-green-500">{stats.alive}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Dead Cells</p>
          <p className="text-2xl font-bold text-gray-500">{stats.dead}</p>
        </div>
      </Card>

      {/* Controls */}
      <Card className="p-4 bg-background space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => setGameState(prev => ({ ...prev, isRunning: !prev.isRunning }))}
            variant={gameState.isRunning ? 'default' : 'outline'}
            size="sm"
          >
            {gameState.isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {gameState.isRunning ? 'Pause' : 'Play'}
          </Button>
          <Button onClick={reset} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={() => setGameState(prev => ({ ...prev, grid: initializeGrid(prev.gridSize), generation: 0, isRunning: false }))} variant="outline" size="sm">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
          <Button onClick={() => randomFill(0.3)} variant="outline" size="sm">
            <Zap className="w-4 h-4 mr-2" />
            Random
          </Button>
        </div>

        {/* Speed Control */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Speed: {gameState.speed} generations/sec</label>
          <Slider
            defaultValue={[gameState.speed]}
            value={[gameState.speed]}
            onValueChange={(value) => setGameState(prev => ({ ...prev, speed: value[0] }))}
            min={1}
            max={20}
            step={1}
            className="w-full"
          />
        </div>

        {/* Grid Size Control */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Grid Size: {gameState.gridSize}x{gameState.gridSize}</label>
          <Slider
            defaultValue={[gameState.gridSize]}
            value={[gameState.gridSize]}
            onValueChange={(value) => changeGridSize(value[0])}
            min={10}
            max={100}
            step={10}
            className="w-full"
          />
        </div>

        {/* Grid Visibility */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showGrid"
            checked={gameState.showGrid}
            onChange={(e) => setGameState(prev => ({ ...prev, showGrid: e.target.checked }))}
            className="w-4 h-4"
          />
          <label htmlFor="showGrid" className="text-sm font-medium">Show Grid</label>
        </div>

        {/* Color Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Alive Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={gameState.aliveColor}
                onChange={(e) => setGameState(prev => ({ ...prev, aliveColor: e.target.value }))}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <span className="text-sm text-muted-foreground">{gameState.aliveColor}</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Dead Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={gameState.deadColor}
                onChange={(e) => setGameState(prev => ({ ...prev, deadColor: e.target.value }))}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <span className="text-sm text-muted-foreground">{gameState.deadColor}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Patterns */}
      <Card className="p-4 bg-background space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Grid3x3 className="w-4 h-4" />
          Pattern Presets
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {Object.keys(PATTERNS).map(pattern => (
            <Button
              key={pattern}
              onClick={() => placePattern(pattern)}
              variant={selectedPattern === pattern ? 'default' : 'outline'}
              size="sm"
              className="capitalize"
            >
              {pattern}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}
