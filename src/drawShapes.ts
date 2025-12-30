// drawShapes.ts
import { createCanvas } from 'canvas';

// Shape type definitions
type ShapeType = 'square' | 'triangle' | 'circle' | 'rectangle' | 'rhombus' | 'trapezoid';

export async function drawShapes(canvasWidth: number, canvasHeight: number, strokeWidth: number, rotationDegrees: number, wobble: boolean = false, noise: boolean = false): Promise<string> {
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
    
    // Select 4 random shapes without repetition
    const availableShapes: ShapeType[] = ['square', 'triangle', 'circle', 'rectangle', 'rhombus', 'trapezoid'];
    const selectedShapes = selectRandomShapes(availableShapes, shapeSeed);
    
    const drawAllShapes = () => {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = strokeWidth;
        
        // Quadrant center positions
        const positions = [
            { x: quadWidth / 2, y: quadHeight / 2 },           // Top-left
            { x: quadWidth + quadWidth / 2, y: quadHeight / 2 }, // Top-right
            { x: quadWidth / 2, y: quadHeight + quadHeight / 2 }, // Bottom-left
            { x: quadWidth + quadWidth / 2, y: quadHeight + quadHeight / 2 } // Bottom-right
        ];
        
        // Draw each selected shape in its quadrant
        positions.forEach((pos, index) => {
            drawShape(selectedShapes[index], pos.x, pos.y, quadWidth, quadHeight, ctx, wobble, shapeSeed, index);
        });
    };
    
    // First draw shapes normally
    drawAllShapes();
    
    // Then draw rotated shapes in central circle (overwriting the original shapes)
    ctx.save();
    ctx.beginPath();
    ctx.arc(canvasWidth / 2, canvasHeight / 2, canvasWidth / 3, 0, 2 * Math.PI);
    ctx.clip();
    
    // Clear the central area
    ctx.clearRect(canvasWidth/2 - canvasWidth/3, canvasHeight/2 - canvasWidth/3, 
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
        const noiseCount = 50; // More noise points for the entire canvas
        const noiseSize = strokeWidth * 0.6; // Noise size relative to stroke width
        
        ctx.save();
        // Use black with opacity, matching the shape color but with transparency
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)'; // More consistent with black shapes
        ctx.lineWidth = strokeWidth * 0.4;
        
        for (let i = 0; i < noiseCount; i++) {
            // Use seeded random to ensure consistent noise across the entire canvas
            const noiseX = seededRandom(shapeSeed, i * 10) * canvasWidth;
            const noiseY = seededRandom(shapeSeed, i * 20) * canvasHeight;
            
            // Randomly choose between dots, short lines, and tiny crosses
            const noiseType = Math.floor(seededRandom(shapeSeed, i * 30) * 3); // 0, 1, or 2
            
            if (noiseType === 0) {
                // Draw a dot
                ctx.beginPath();
                ctx.arc(noiseX, noiseY, noiseSize, 0, 2 * Math.PI);
                ctx.stroke();
            } else if (noiseType === 1) {
                // Draw a short line
                const lineAngle = seededRandom(shapeSeed, i * 40) * Math.PI * 2;
                const lineLength = noiseSize * 3;
                
                ctx.beginPath();
                ctx.moveTo(
                    noiseX + Math.cos(lineAngle) * lineLength,
                    noiseY + Math.sin(lineAngle) * lineLength
                );
                ctx.lineTo(
                    noiseX - Math.cos(lineAngle) * lineLength,
                    noiseY - Math.sin(lineAngle) * lineLength
                );
                ctx.stroke();
            } else {
                // Draw a tiny cross
                const crossSize = noiseSize * 1.5;
                
                ctx.beginPath();
                ctx.moveTo(noiseX - crossSize, noiseY);
                ctx.lineTo(noiseX + crossSize, noiseY);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(noiseX, noiseY - crossSize);
                ctx.lineTo(noiseX, noiseY + crossSize);
                ctx.stroke();
            }
        }
        
        // Add a few scattered speckles
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'; // Match the shape color with transparency
        for (let i = 0; i < noiseCount * 2; i++) {
            const speckleX = seededRandom(shapeSeed, i * 50) * canvasWidth;
            const speckleY = seededRandom(shapeSeed, i * 60) * canvasHeight;
            const speckleSize = noiseSize * 0.4 * seededRandom(shapeSeed, i * 70);
            
            ctx.beginPath();
            ctx.arc(speckleX, speckleY, speckleSize, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        ctx.restore();
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

// Wobble helper function
function getWobbleOffset(wobble: boolean, quadWidth: number, seed: number, index: number): number {
    if (!wobble) return 0;
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
    wobble: boolean,
    seed: number,
    position: number
): void {
    const sizeFactor = 0.85;
    
    switch (shapeType) {
        case 'circle':
            drawCircle(ctx, x, y, quadWidth * 0.4 * sizeFactor, wobble, quadWidth, seed, position);
            break;
        case 'square':
            drawSquare(ctx, x, y, quadWidth * 0.8 * sizeFactor, wobble, quadWidth, seed, position);
            break;
        case 'triangle':
            drawTriangle(ctx, x, y, quadWidth * 0.8 * sizeFactor, wobble, quadWidth, seed, position);
            break;
        case 'rectangle':
            drawRectangle(ctx, x, y, quadWidth * 0.7 * sizeFactor, quadHeight * 0.5 * sizeFactor, wobble, quadWidth, seed, position);
            break;
        case 'rhombus':
            drawRhombus(ctx, x, y, quadWidth * 0.8 * sizeFactor, wobble, quadWidth, seed, position);
            break;
        case 'trapezoid':
            drawTrapezoid(ctx, x, y, quadWidth * 0.8 * sizeFactor, wobble, quadWidth, seed, position);
            break;
    }
}

// Individual shape drawing functions
function drawCircle(ctx: any, x: number, y: number, radius: number, wobble: boolean, quadWidth: number, seed: number, position: number): void {
    ctx.beginPath();
    if (wobble) {
        const segments = 12;
        let lastX = x + radius;
        let lastY = y;
        ctx.moveTo(lastX, lastY);
        
        for (let i = 1; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const wobbleX = getWobbleOffset(wobble, quadWidth, seed, position * 100 + i);
            const wobbleY = getWobbleOffset(wobble, quadWidth, seed, position * 100 + i + 50);
            const nextX = x + Math.cos(angle) * (radius + wobbleX);
            const nextY = y + Math.sin(angle) * (radius + wobbleY);
            
            const cp1x = lastX + (nextX - lastX) * 0.5 - (nextY - lastY) * 0.2;
            const cp1y = lastY + (nextY - lastY) * 0.5 + (nextX - lastX) * 0.2;
            
            ctx.quadraticCurveTo(cp1x, cp1y, nextX, nextY);
            lastX = nextX;
            lastY = nextY;
        }
    } else {
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
    }
    ctx.stroke();
}

function drawSquare(ctx: any, x: number, y: number, size: number, wobble: boolean, quadWidth: number, seed: number, position: number): void {
    ctx.beginPath();
    const halfSize = size / 2;
    
    if (wobble) {
        const points = [
            [x - halfSize + getWobbleOffset(wobble, quadWidth, seed, position * 100), 
             y - halfSize + getWobbleOffset(wobble, quadWidth, seed, position * 100 + 1)],
            [x + halfSize + getWobbleOffset(wobble, quadWidth, seed, position * 100 + 2), 
             y - halfSize + getWobbleOffset(wobble, quadWidth, seed, position * 100 + 3)],
            [x + halfSize + getWobbleOffset(wobble, quadWidth, seed, position * 100 + 4), 
             y + halfSize + getWobbleOffset(wobble, quadWidth, seed, position * 100 + 5)],
            [x - halfSize + getWobbleOffset(wobble, quadWidth, seed, position * 100 + 6), 
             y + halfSize + getWobbleOffset(wobble, quadWidth, seed, position * 100 + 7)]
        ];
        
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 0; i < 4; i++) {
            const next = (i + 1) % 4;
            const cpX = (points[i][0] + points[next][0]) / 2 + getWobbleOffset(wobble, quadWidth, seed, position * 100 + i + 10);
            const cpY = (points[i][1] + points[next][1]) / 2 + getWobbleOffset(wobble, quadWidth, seed, position * 100 + i + 15);
            ctx.quadraticCurveTo(cpX, cpY, points[next][0], points[next][1]);
        }
    } else {
        ctx.rect(x - halfSize, y - halfSize, size, size);
    }
    ctx.stroke();
}

function drawTriangle(ctx: any, x: number, y: number, size: number, wobble: boolean, quadWidth: number, seed: number, position: number): void {
    ctx.beginPath();
    
    if (wobble) {
        const points = [
            [x + getWobbleOffset(wobble, quadWidth, seed, position * 100), 
             y - size / 2 + getWobbleOffset(wobble, quadWidth, seed, position * 100 + 1)],
            [x - size / 2 + getWobbleOffset(wobble, quadWidth, seed, position * 100 + 2), 
             y + size / 2 + getWobbleOffset(wobble, quadWidth, seed, position * 100 + 3)],
            [x + size / 2 + getWobbleOffset(wobble, quadWidth, seed, position * 100 + 4), 
             y + size / 2 + getWobbleOffset(wobble, quadWidth, seed, position * 100 + 5)]
        ];
        
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 0; i < 3; i++) {
            const next = (i + 1) % 3;
            const cpX = (points[i][0] + points[next][0]) / 2 + getWobbleOffset(wobble, quadWidth, seed, position * 100 + i + 10);
            const cpY = (points[i][1] + points[next][1]) / 2 + getWobbleOffset(wobble, quadWidth, seed, position * 100 + i + 15);
            ctx.quadraticCurveTo(cpX, cpY, points[next][0], points[next][1]);
        }
    } else {
        ctx.moveTo(x, y - size / 2);
        ctx.lineTo(x - size / 2, y + size / 2);
        ctx.lineTo(x + size / 2, y + size / 2);
    }
    ctx.closePath();
    ctx.stroke();
}

function drawRectangle(ctx: any, x: number, y: number, width: number, height: number, wobble: boolean, quadWidth: number, seed: number, position: number): void {
    ctx.beginPath();
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    
    if (wobble) {
        const points = [
            [x - halfWidth + getWobbleOffset(wobble, quadWidth, seed, position * 100), 
             y - halfHeight + getWobbleOffset(wobble, quadWidth, seed, position * 100 + 1)],
            [x + halfWidth + getWobbleOffset(wobble, quadWidth, seed, position * 100 + 2), 
             y - halfHeight + getWobbleOffset(wobble, quadWidth, seed, position * 100 + 3)],
            [x + halfWidth + getWobbleOffset(wobble, quadWidth, seed, position * 100 + 4), 
             y + halfHeight + getWobbleOffset(wobble, quadWidth, seed, position * 100 + 5)],
            [x - halfWidth + getWobbleOffset(wobble, quadWidth, seed, position * 100 + 6), 
             y + halfHeight + getWobbleOffset(wobble, quadWidth, seed, position * 100 + 7)]
        ];
        
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 0; i < 4; i++) {
            const next = (i + 1) % 4;
            const cpX = (points[i][0] + points[next][0]) / 2 + getWobbleOffset(wobble, quadWidth, seed, position * 100 + i + 10);
            const cpY = (points[i][1] + points[next][1]) / 2 + getWobbleOffset(wobble, quadWidth, seed, position * 100 + i + 15);
            ctx.quadraticCurveTo(cpX, cpY, points[next][0], points[next][1]);
        }
    } else {
        ctx.rect(x - halfWidth, y - halfHeight, width, height);
    }
    ctx.stroke();
}

function drawRhombus(ctx: any, x: number, y: number, size: number, wobble: boolean, quadWidth: number, seed: number, position: number): void {
    ctx.beginPath();
    const halfSize = size / 2;
    
    if (wobble) {
        const points = [
            [x + getWobbleOffset(wobble, quadWidth, seed, position * 100), 
             y - halfSize + getWobbleOffset(wobble, quadWidth, seed, position * 100 + 1)],
            [x + halfSize + getWobbleOffset(wobble, quadWidth, seed, position * 100 + 2), 
             y + getWobbleOffset(wobble, quadWidth, seed, position * 100 + 3)],
            [x + getWobbleOffset(wobble, quadWidth, seed, position * 100 + 4), 
             y + halfSize + getWobbleOffset(wobble, quadWidth, seed, position * 100 + 5)],
            [x - halfSize + getWobbleOffset(wobble, quadWidth, seed, position * 100 + 6), 
             y + getWobbleOffset(wobble, quadWidth, seed, position * 100 + 7)]
        ];
        
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 0; i < 4; i++) {
            const next = (i + 1) % 4;
            const cpX = (points[i][0] + points[next][0]) / 2 + getWobbleOffset(wobble, quadWidth, seed, position * 100 + i + 10);
            const cpY = (points[i][1] + points[next][1]) / 2 + getWobbleOffset(wobble, quadWidth, seed, position * 100 + i + 15);
            ctx.quadraticCurveTo(cpX, cpY, points[next][0], points[next][1]);
        }
    } else {
        ctx.moveTo(x, y - halfSize);           // Top
        ctx.lineTo(x + halfSize, y);           // Right
        ctx.lineTo(x, y + halfSize);           // Bottom
        ctx.lineTo(x - halfSize, y);           // Left
    }
    ctx.closePath();
    ctx.stroke();
}

function drawTrapezoid(ctx: any, x: number, y: number, size: number, wobble: boolean, quadWidth: number, seed: number, position: number): void {
    ctx.beginPath();
    const halfSize = size / 2;
    const topWidth = size * 0.6;
    const halfTopWidth = topWidth / 2;
    
    if (wobble) {
        const points = [
            [x - halfTopWidth + getWobbleOffset(wobble, quadWidth, seed, position * 100), 
             y - halfSize + getWobbleOffset(wobble, quadWidth, seed, position * 100 + 1)],
            [x + halfTopWidth + getWobbleOffset(wobble, quadWidth, seed, position * 100 + 2), 
             y - halfSize + getWobbleOffset(wobble, quadWidth, seed, position * 100 + 3)],
            [x + halfSize + getWobbleOffset(wobble, quadWidth, seed, position * 100 + 4), 
             y + halfSize + getWobbleOffset(wobble, quadWidth, seed, position * 100 + 5)],
            [x - halfSize + getWobbleOffset(wobble, quadWidth, seed, position * 100 + 6), 
             y + halfSize + getWobbleOffset(wobble, quadWidth, seed, position * 100 + 7)]
        ];
        
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 0; i < 4; i++) {
            const next = (i + 1) % 4;
            const cpX = (points[i][0] + points[next][0]) / 2 + getWobbleOffset(wobble, quadWidth, seed, position * 100 + i + 10);
            const cpY = (points[i][1] + points[next][1]) / 2 + getWobbleOffset(wobble, quadWidth, seed, position * 100 + i + 15);
            ctx.quadraticCurveTo(cpX, cpY, points[next][0], points[next][1]);
        }
    } else {
        ctx.moveTo(x - halfTopWidth, y - halfSize);  // Top-left
        ctx.lineTo(x + halfTopWidth, y - halfSize);  // Top-right
        ctx.lineTo(x + halfSize, y + halfSize);      // Bottom-right
        ctx.lineTo(x - halfSize, y + halfSize);      // Bottom-left
    }
    ctx.closePath();
    ctx.stroke();
}

// Helper function to "unrotate" the shapes
export async function unrotateShapes(canvasWidth: number, canvasHeight: number, strokeWidth: number, rotationDegrees: number): Promise<string> {
    // This just calls drawShapes with the negative rotation angle
    return drawShapes(canvasWidth, canvasHeight, strokeWidth, -rotationDegrees);
}

// Note: This is a suggested implementation - you'll need to adapt it to your existing shapes.ts file

export function drawShapesSVG(width: number, height: number, count: number, angle: number, wobble: boolean = false, noise: boolean = false): string {
  // Initialize SVG
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
  
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 3;
  
  // Draw each shape
  for (let i = 0; i < count; i++) {
    const rotationAngle = i * (360 / count);
    const shapeElement = createShape(centerX, centerY, radius, rotationAngle + angle, wobble, noise);
    svg += shapeElement;
  }
  
  svg += '</svg>';
  return svg;
}

function createShape(centerX: number, centerY: number, radius: number, angle: number, wobble: boolean, noise: boolean): string {
  // Apply rotation transformation
  const radians = (angle * Math.PI) / 180;
  const x = centerX + radius * Math.cos(radians);
  const y = centerY + radius * Math.sin(radians);
  
  // Create shape (for example, a rectangle)
  const shapeSize = radius * 0.3;
  let shape = '';
  
  // Apply wobble effect if enabled
  if (wobble) {
    // Create a wobbly rectangle by adding random variations to each corner
    const wobbleAmount = shapeSize * 0.15;
    
    // Calculate the four corners with wobble
    const points = [
      [x - shapeSize/2 + (Math.random() - 0.5) * wobbleAmount, y - shapeSize/2 + (Math.random() - 0.5) * wobbleAmount],
      [x + shapeSize/2 + (Math.random() - 0.5) * wobbleAmount, y - shapeSize/2 + (Math.random() - 0.5) * wobbleAmount],
      [x + shapeSize/2 + (Math.random() - 0.5) * wobbleAmount, y + shapeSize/2 + (Math.random() - 0.5) * wobbleAmount],
      [x - shapeSize/2 + (Math.random() - 0.5) * wobbleAmount, y + shapeSize/2 + (Math.random() - 0.5) * wobbleAmount]
    ];
    
    // Create a polygon with the wobbly points
    shape = `<polygon points="${points.map(p => p.join(',')).join(' ')}" fill="blue" />`;
  } else {
    // Create a regular rectangle
    shape = `<rect x="${x - shapeSize/2}" y="${y - shapeSize/2}" width="${shapeSize}" height="${shapeSize}" fill="blue" />`;
  }
  
  // Add noise if enabled
  if (noise) {
    for (let i = 0; i < 3; i++) {
      // Create random lines near the shape
      const lineStartX = x + (Math.random() - 0.5) * shapeSize * 2;
      const lineStartY = y + (Math.random() - 0.5) * shapeSize * 2;
      let lineEndX = lineStartX + (Math.random() - 0.5) * shapeSize;
      let lineEndY = lineStartY + (Math.random() - 0.5) * shapeSize;
      
      // If wobble is also enabled, make the noise lines wobbly too
      if (wobble) {
        // Add a control point for a quadratic curve to create wobbly lines
        const controlX = (lineStartX + lineEndX) / 2 + (Math.random() - 0.5) * shapeSize * 0.5;
        const controlY = (lineStartY + lineEndY) / 2 + (Math.random() - 0.5) * shapeSize * 0.5;
        shape += `<path d="M${lineStartX},${lineStartY} Q${controlX},${controlY} ${lineEndX},${lineEndY}" stroke="red" stroke-width="1" fill="none" />`;
      } else {
        // Straight line for regular noise
        shape += `<line x1="${lineStartX}" y1="${lineStartY}" x2="${lineEndX}" y2="${lineEndY}" stroke="red" stroke-width="1" />`;
      }
    }
  }
  
  return shape;
}
