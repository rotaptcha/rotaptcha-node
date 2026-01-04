// drawShapes.ts
import { createCanvas } from 'canvas';

// Shape type definitions
type ShapeType = 'square' | 'triangle' | 'circle' | 'rectangle' | 'rhombus' | 'trapezoid';

export async function drawShapes(canvasWidth: number, canvasHeight: number, strokeWidth: number, availableColors: string[], canvasBg: string, noiseDensity: number, rotationDegrees: number, wobbleIntensity: number = 0, noise: boolean = false): Promise<string> {
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');
    
    const quadWidth = canvasWidth / 2;
    const quadHeight = canvasHeight / 2;
    
    // Create fixed seed for consistent shapes between draws
    const shapeSeed = Math.floor(Math.random() * 1000);
    
    // Simple deterministic random function with seed
    const seededRandom = (seed: number, index: number) => {
        const combinedSeed = seed + (index * 37);
        return ((combinedSeed * 9301 + 49297) * 233) % 1000 / 1000;
    };
    
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Set background color
    ctx.fillStyle = canvasBg;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Select 4 random shapes without repetition
    const availableShapes: ShapeType[] = ['square', 'triangle', 'circle', 'rectangle', 'rhombus', 'trapezoid'];
    const selectedShapes = selectRandomShapes(availableShapes, shapeSeed);
    
    // Select 4 random colors for each shape (one per quadrant)
    const selectedColors = [0, 1, 2, 3].map(index => {
        const colorIndex = Math.floor(seededRandom(shapeSeed, index * 7 + 13) * availableColors.length);
        return availableColors[colorIndex];
    });
    
    const drawAllShapes = () => {
        ctx.lineWidth = strokeWidth;
        
        // Quadrant center positions
        const positions = [
            { x: quadWidth / 2, y: quadHeight / 2 },           // Top-left
            { x: quadWidth + quadWidth / 2, y: quadHeight / 2 }, // Top-right
            { x: quadWidth / 2, y: quadHeight + quadHeight / 2 }, // Bottom-left
            { x: quadWidth + quadWidth / 2, y: quadHeight + quadHeight / 2 } // Bottom-right
        ];
        
        // Draw each selected shape in its quadrant with its assigned color
        positions.forEach((pos, index) => {
            ctx.strokeStyle = selectedColors[index];
            drawShape(selectedShapes[index], pos.x, pos.y, quadWidth, quadHeight, ctx, shapeSeed, index, wobbleIntensity);
        });
    };
    
    // First draw shapes normally
    drawAllShapes();
    
    // Then draw rotated shapes in central circle (overwriting the original shapes)
    ctx.save();
    ctx.beginPath();
    ctx.arc(canvasWidth / 2, canvasHeight / 2, canvasWidth / 3, 0, 2 * Math.PI);
    ctx.clip();
    
    // Clear the central area with background color
    ctx.fillStyle = canvasBg;
    ctx.fillRect(canvasWidth/2 - canvasWidth/3, canvasHeight/2 - canvasWidth/3, 
                 canvasWidth/3 * 2, canvasWidth/3 * 2);
    
    // Apply rotation transformation
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.rotate((rotationDegrees * Math.PI) / 180);
    ctx.translate(-canvasWidth / 2, -canvasHeight / 2);
    
    // Draw the shapes again (with the same seed so they match)
    drawAllShapes();
    ctx.restore();
    
    // Add noise over the entire canvas AFTER all shapes and rotation are completed
    if (noise) {
        addNoise(ctx, canvasWidth, canvasHeight, strokeWidth, availableColors, noiseDensity, shapeSeed, seededRandom);
    }
    
    // Use createPNGStream to avoid file system issues in read-only environments
    return new Promise((resolve, reject) => {
        try {
            const chunks: Buffer[] = [];
            const stream = canvas.createPNGStream();
            
            stream.on('data', (chunk: Buffer) => {
                chunks.push(chunk);
            });
            
            stream.on('end', () => {
                const buffer = Buffer.concat(chunks);
                resolve("data:image/png;base64," + buffer.toString('base64'));
            });
            
            stream.on('error', (err) => {
                reject(err);
            });
        } catch (error) {
            reject(new Error(`Failed to generate captcha image: ${error instanceof Error ? error.message : String(error)}`));
        }
    });
}

// Helper function to select 4 random shapes without repetition
function selectRandomShapes(shapes: ShapeType[], seed: number): ShapeType[] {
    // Create a copy and shuffle using seeded random
    const shuffled = [...shapes];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(((seed + i * 17) * 9301 + 49297) % 233280 / 233280 * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 4);
}

// Add noise with lines and arcs
function addNoise(
    ctx: any,
    canvasWidth: number,
    canvasHeight: number,
    strokeWidth: number,
    availableColors: string[],
    noiseDensity: number,
    shapeSeed: number,
    seededRandom: (seed: number, index: number) => number
): void {
    const minSize = canvasWidth / 8; // Minimum size: 1/4th of width
    const maxSize = canvasWidth / 6; // Maximum size: half of width
    
    ctx.save();
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    
    for (let i = 0; i < noiseDensity; i++) {
        // Select random color for each noise element
        const colorIndex = Math.floor(seededRandom(shapeSeed, i * 100 + 500) * availableColors.length);
        ctx.strokeStyle = availableColors[colorIndex];
        
        // Random position
        const x = seededRandom(shapeSeed, i * 10 + 1000) * canvasWidth;
        const y = seededRandom(shapeSeed, i * 20 + 2000) * canvasHeight;
        
        // Random size between minSize and maxSize
        const size = minSize + seededRandom(shapeSeed, i * 30 + 3000) * (maxSize - minSize);
        
        // Randomly choose between line or arc
        const noiseType = Math.floor(seededRandom(shapeSeed, i * 40 + 4000) * 2); // 0 or 1
        
        ctx.beginPath();
        
        if (noiseType === 0) {
            // Draw a line
            const angle = seededRandom(shapeSeed, i * 50 + 5000) * Math.PI * 2;
            const startX = x - Math.cos(angle) * size / 2;
            const startY = y - Math.sin(angle) * size / 2;
            const endX = x + Math.cos(angle) * size / 2;
            const endY = y + Math.sin(angle) * size / 2;
            
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
        } else {
            // Draw an arc
            const radius = size / 2;
            const startAngle = seededRandom(shapeSeed, i * 60 + 6000) * Math.PI * 2;
            const endAngle = startAngle + (seededRandom(shapeSeed, i * 70 + 7000) * Math.PI); // Arc spans up to 180 degrees
            
            ctx.arc(x, y, radius, startAngle, endAngle);
        }
        
        ctx.stroke();
    }
    
    ctx.restore();
}

// Wobble helper function (kept for backwards compatibility but no longer used)
function getWobbleOffset(wobbleIntensity: number, quadWidth: number, seed: number, index: number): number {
    if (!wobbleIntensity) return 0;
    const wobbleAmount = quadWidth * 0.06;
    return (((seed + index * 13) * 9301 + 49297) % 233280 / 233280 - 0.5) * wobbleAmount;
}

// Main shape drawing function
function drawShape(
    shapeType: ShapeType,
    x: number,
    y: number,
    quadWidth: number,
    quadHeight: number,
    ctx: any,
    seed: number,
    position: number,
    wobbleIntensity: number = 0
): void {
    const sizeFactor = 0.85;
    const shapeSeed = seed + position * 100;
    
    switch (shapeType) {
        case 'circle':
            drawCircle(ctx, x, y, quadWidth * 0.4 * sizeFactor, wobbleIntensity, shapeSeed);
            break;
        case 'square':
            drawSquare(ctx, x, y, quadWidth * 0.8 * sizeFactor, wobbleIntensity, shapeSeed);
            break;
        case 'triangle':
            drawTriangle(ctx, x, y, quadWidth * 0.8 * sizeFactor, wobbleIntensity, shapeSeed);
            break;
        case 'rectangle':
            drawRectangle(ctx, x, y, quadWidth * 0.7 * sizeFactor, quadHeight * 0.5 * sizeFactor, wobbleIntensity, shapeSeed);
            break;
        case 'rhombus':
            drawRhombus(ctx, x, y, quadWidth * 0.8 * sizeFactor, wobbleIntensity, shapeSeed);
            break;
        case 'trapezoid':
            drawTrapezoid(ctx, x, y, quadWidth * 0.8 * sizeFactor, wobbleIntensity, shapeSeed);
            break;
    }
}

// Individual shape drawing functions
function drawCircle(ctx: any, x: number, y: number, radius: number, wobbleIntensity: number = 0, seed: number = 0): void {
    ctx.beginPath();
    if (wobbleIntensity > 0) {
        const segments = 24;
        const wobbleAmount = radius * 0.03 * wobbleIntensity;
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const wobbleOffset = (Math.sin(seed + i * 0.5) * 0.5 + 0.5) * wobbleAmount;
            const r = radius + wobbleOffset;
            const px = x + Math.cos(angle) * r;
            const py = y + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
    } else {
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
    }
    ctx.stroke();
}

function drawSquare(ctx: any, x: number, y: number, size: number, wobbleIntensity: number = 0, seed: number = 0): void {
    ctx.beginPath();
    const halfSize = size / 2;
    if (wobbleIntensity > 0) {
        const wobbleAmount = size * 0.02 * wobbleIntensity;
        const points = [
            [x - halfSize, y - halfSize],
            [x + halfSize, y - halfSize],
            [x + halfSize, y + halfSize],
            [x - halfSize, y + halfSize]
        ];
        
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 0; i < 4; i++) {
            const current = points[i];
            const next = points[(i + 1) % 4];
            const segments = 8;
            
            for (let j = 1; j <= segments; j++) {
                const t = j / segments;
                const px = current[0] + (next[0] - current[0]) * t;
                const py = current[1] + (next[1] - current[1]) * t;
                const wobble = (Math.sin(seed + i * 10 + j * 0.5) * 0.5 + 0.5) * wobbleAmount;
                ctx.lineTo(px + wobble, py + wobble);
            }
        }
        ctx.closePath();
    } else {
        ctx.rect(x - halfSize, y - halfSize, size, size);
    }
    ctx.stroke();
}

function drawTriangle(ctx: any, x: number, y: number, size: number, wobbleIntensity: number = 0, seed: number = 0): void {
    ctx.beginPath();
    if (wobbleIntensity > 0) {
        const wobbleAmount = size * 0.02 * wobbleIntensity;
        const points = [
            [x, y - size / 2],
            [x - size / 2, y + size / 2],
            [x + size / 2, y + size / 2]
        ];
        
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 0; i < 3; i++) {
            const current = points[i];
            const next = points[(i + 1) % 3];
            const segments = 8;
            
            for (let j = 1; j <= segments; j++) {
                const t = j / segments;
                const px = current[0] + (next[0] - current[0]) * t;
                const py = current[1] + (next[1] - current[1]) * t;
                const wobble = (Math.sin(seed + i * 10 + j * 0.5) * 0.5 + 0.5) * wobbleAmount;
                ctx.lineTo(px + wobble, py + wobble);
            }
        }
        ctx.closePath();
    } else {
        ctx.moveTo(x, y - size / 2);
        ctx.lineTo(x - size / 2, y + size / 2);
        ctx.lineTo(x + size / 2, y + size / 2);
        ctx.closePath();
    }
    ctx.stroke();
}

function drawRectangle(ctx: any, x: number, y: number, width: number, height: number, wobbleIntensity: number = 0, seed: number = 0): void {
    ctx.beginPath();
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    if (wobbleIntensity > 0) {
        const wobbleAmount = Math.min(width, height) * 0.02 * wobbleIntensity;
        const points = [
            [x - halfWidth, y - halfHeight],
            [x + halfWidth, y - halfHeight],
            [x + halfWidth, y + halfHeight],
            [x - halfWidth, y + halfHeight]
        ];
        
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 0; i < 4; i++) {
            const current = points[i];
            const next = points[(i + 1) % 4];
            const segments = 8;
            
            for (let j = 1; j <= segments; j++) {
                const t = j / segments;
                const px = current[0] + (next[0] - current[0]) * t;
                const py = current[1] + (next[1] - current[1]) * t;
                const wobble = (Math.sin(seed + i * 10 + j * 0.5) * 0.5 + 0.5) * wobbleAmount;
                ctx.lineTo(px + wobble, py + wobble);
            }
        }
        ctx.closePath();
    } else {
        ctx.rect(x - halfWidth, y - halfHeight, width, height);
    }
    ctx.stroke();
}

function drawRhombus(ctx: any, x: number, y: number, size: number, wobbleIntensity: number = 0, seed: number = 0): void {
    ctx.beginPath();
    const halfSize = size / 2;
    if (wobbleIntensity > 0) {
        const wobbleAmount = size * 0.02 * wobbleIntensity;
        const points = [
            [x, y - halfSize],
            [x + halfSize, y],
            [x, y + halfSize],
            [x - halfSize, y]
        ];
        
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 0; i < 4; i++) {
            const current = points[i];
            const next = points[(i + 1) % 4];
            const segments = 8;
            
            for (let j = 1; j <= segments; j++) {
                const t = j / segments;
                const px = current[0] + (next[0] - current[0]) * t;
                const py = current[1] + (next[1] - current[1]) * t;
                const wobble = (Math.sin(seed + i * 10 + j * 0.5) * 0.5 + 0.5) * wobbleAmount;
                ctx.lineTo(px + wobble, py + wobble);
            }
        }
        ctx.closePath();
    } else {
        ctx.moveTo(x, y - halfSize);
        ctx.lineTo(x + halfSize, y);
        ctx.lineTo(x, y + halfSize);
        ctx.lineTo(x - halfSize, y);
        ctx.closePath();
    }
    ctx.stroke();
}

function drawTrapezoid(ctx: any, x: number, y: number, size: number, wobbleIntensity: number = 0, seed: number = 0): void {
    ctx.beginPath();
    const halfSize = size / 2;
    const topWidth = size * 0.6;
    const halfTopWidth = topWidth / 2;
    if (wobbleIntensity > 0) {
        const wobbleAmount = size * 0.02 * wobbleIntensity;
        const points = [
            [x - halfTopWidth, y - halfSize],
            [x + halfTopWidth, y - halfSize],
            [x + halfSize, y + halfSize],
            [x - halfSize, y + halfSize]
        ];
        
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 0; i < 4; i++) {
            const current = points[i];
            const next = points[(i + 1) % 4];
            const segments = 8;
            
            for (let j = 1; j <= segments; j++) {
                const t = j / segments;
                const px = current[0] + (next[0] - current[0]) * t;
                const py = current[1] + (next[1] - current[1]) * t;
                const wobble = (Math.sin(seed + i * 10 + j * 0.5) * 0.5 + 0.5) * wobbleAmount;
                ctx.lineTo(px + wobble, py + wobble);
            }
        }
        ctx.closePath();
    } else {
        ctx.moveTo(x - halfTopWidth, y - halfSize);
        ctx.lineTo(x + halfTopWidth, y - halfSize);
        ctx.lineTo(x + halfSize, y + halfSize);
        ctx.lineTo(x - halfSize, y + halfSize);
        ctx.closePath();
    }
    ctx.stroke();
}

// Helper function to "unrotate" the shapes
// export async function unrotateShapes(canvasWidth: number, canvasHeight: number, strokeWidth: number, strokeColor: string, rotationDegrees: number): Promise<string> {
//     // This just calls drawShapes with the negative rotation angle
//     return drawShapes(canvasWidth, canvasHeight, strokeWidth, strokeColor, -rotationDegrees);
// }

// Note: This is a suggested implementation - you'll need to adapt it to your existing shapes.ts file

// export function drawShapesSVG(width: number, height: number, count: number, angle: number, wobble: boolean = false, noise: boolean = false): string {
//   // Initialize SVG
//   let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
  
//   const centerX = width / 2;
//   const centerY = height / 2;
//   const radius = Math.min(width, height) / 3;
  
//   // Draw each shape
//   for (let i = 0; i < count; i++) {
//     const rotationAngle = i * (360 / count);
//     const shapeElement = createShape(centerX, centerY, radius, rotationAngle + angle, wobble, noise);
//     svg += shapeElement;
//   }
  
//   svg += '</svg>';
//   return svg;
// }

// function createShape(centerX: number, centerY: number, radius: number, angle: number, wobble: boolean, noise: boolean): string {
//   // Apply rotation transformation
//   const radians = (angle * Math.PI) / 180;
//   const x = centerX + radius * Math.cos(radians);
//   const y = centerY + radius * Math.sin(radians);
  
//   // Create shape (for example, a rectangle)
//   const shapeSize = radius * 0.3;
//   let shape = '';
  
//   // Apply wobble effect if enabled
//   if (wobble) {
//     // Create a wobbly rectangle by adding random variations to each corner
//     const wobbleAmount = shapeSize * 0.15;
    
//     // Calculate the four corners with wobble
//     const points = [
//       [x - shapeSize/2 + (Math.random() - 0.5) * wobbleAmount, y - shapeSize/2 + (Math.random() - 0.5) * wobbleAmount],
//       [x + shapeSize/2 + (Math.random() - 0.5) * wobbleAmount, y - shapeSize/2 + (Math.random() - 0.5) * wobbleAmount],
//       [x + shapeSize/2 + (Math.random() - 0.5) * wobbleAmount, y + shapeSize/2 + (Math.random() - 0.5) * wobbleAmount],
//       [x - shapeSize/2 + (Math.random() - 0.5) * wobbleAmount, y + shapeSize/2 + (Math.random() - 0.5) * wobbleAmount]
//     ];
    
//     // Create a polygon with the wobbly points
//     shape = `<polygon points="${points.map(p => p.join(',')).join(' ')}" fill="blue" />`;
//   } else {
//     // Create a regular rectangle
//     shape = `<rect x="${x - shapeSize/2}" y="${y - shapeSize/2}" width="${shapeSize}" height="${shapeSize}" fill="blue" />`;
//   }
  
//   // Add noise if enabled
//   if (noise) {
//     for (let i = 0; i < 3; i++) {
//       // Create random lines near the shape
//       const lineStartX = x + (Math.random() - 0.5) * shapeSize * 2;
//       const lineStartY = y + (Math.random() - 0.5) * shapeSize * 2;
//       let lineEndX = lineStartX + (Math.random() - 0.5) * shapeSize;
//       let lineEndY = lineStartY + (Math.random() - 0.5) * shapeSize;
      
//       // If wobble is also enabled, make the noise lines wobbly too
//       if (wobble) {
//         // Add a control point for a quadratic curve to create wobbly lines
//         const controlX = (lineStartX + lineEndX) / 2 + (Math.random() - 0.5) * shapeSize * 0.5;
//         const controlY = (lineStartY + lineEndY) / 2 + (Math.random() - 0.5) * shapeSize * 0.5;
//         shape += `<path d="M${lineStartX},${lineStartY} Q${controlX},${controlY} ${lineEndX},${lineEndY}" stroke="red" stroke-width="1" fill="none" />`;
//       } else {
//         // Straight line for regular noise
//         shape += `<line x1="${lineStartX}" y1="${lineStartY}" x2="${lineEndX}" y2="${lineEndY}" stroke="red" stroke-width="1" />`;
//       }
//     }
//   }
  
//   return shape;
// }
