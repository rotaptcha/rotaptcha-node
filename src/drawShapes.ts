// drawShapes.ts
import { createCanvas } from 'canvas';


export async function drawShapes(canvasWidth: number, canvasHeight: number, strokeWidth: number, rotationDegrees: number, wobble: boolean = false, noise: boolean = false): Promise<string> {
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');
    
    const quadWidth = (canvasWidth / 2);
    const quadHeight = (canvasHeight / 2);
    
    // Create fixed seed for consistent shapes between draws
    const shapeSeed = Math.floor(Math.random() * 1000);
    
    // Simple deterministic random function with seed
    const seededRandom = (seed: number, index: number) => {
        const combinedSeed = seed + (index * 37);
        return ((combinedSeed * 9301 + 49297) * 233) % 1000 / 1000;
    };
    
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    const drawAllShapes = (index: number) => {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = strokeWidth;
        
        // Fixed positions for the quadrants
        const topLeftX = quadWidth / 2;
        const topLeftY = quadHeight / 2;
        const topRightX = quadWidth + quadWidth / 2;
        const topRightY = quadHeight / 2;
        const bottomLeftX = quadWidth / 2;
        const bottomLeftY = quadHeight + quadHeight / 2;
        const bottomRightX = quadWidth + quadWidth / 2;
        const bottomRightY = quadHeight + quadHeight / 2;
        
        // Available shapes: circle, square, triangle, pentagon, hexagon
        const drawShape = (position: number, x: number, y: number) => {
            // Use seeded random to get consistent shapes, but use the position parameter
            // to ensure different shapes in different positions
            const shapeType = Math.floor(seededRandom(shapeSeed, position) * 5); // 0 to 4
            
            // Size reduction factor (15%)
            const sizeFactor = 0.85;
            
            // Apply wobble if enabled - get wobble parameters with consistent randomness
            const getWobbleOffset = () => {
                if (!wobble) return 0;
                // Wobble up to 15% of shape size
                const wobbleAmount = quadWidth * 0.06;
                return (seededRandom(shapeSeed, Math.random() * 1000) - 0.5) * wobbleAmount;
            };

            switch (shapeType) {
                case 0: // Circle
                    ctx.beginPath();
                    if (wobble) {
                        // Draw a wobbly circle by using multiple arc segments
                        const segments = 12;
                        const radius = quadWidth * 0.4 * sizeFactor;
                        let lastX = x + radius;
                        let lastY = y;
                        
                        ctx.moveTo(lastX, lastY);
                        for (let i = 1; i <= segments; i++) {
                            const angle = (i / segments) * Math.PI * 2;
                            const wobbleX = getWobbleOffset();
                            const wobbleY = getWobbleOffset();
                            const nextX = x + Math.cos(angle) * (radius + wobbleX);
                            const nextY = y + Math.sin(angle) * (radius + wobbleY);
                            
                            // Control points for the curve
                            const cp1x = lastX + (nextX - lastX) * 0.5 - (nextY - lastY) * 0.2;
                            const cp1y = lastY + (nextY - lastY) * 0.5 + (nextX - lastX) * 0.2;
                            
                            ctx.quadraticCurveTo(cp1x, cp1y, nextX, nextY);
                            lastX = nextX;
                            lastY = nextY;
                        }
                    } else {
                        // Draw regular circle
                        ctx.arc(x, y, quadWidth * 0.4 * sizeFactor, 0, 2 * Math.PI);
                    }
                    ctx.stroke();
                    break;
                case 1: // Square
                    ctx.beginPath();
                    if (wobble) {
                        // Draw a wobbly rectangle with curvy edges
                        const size = quadWidth * 0.8 * sizeFactor;
                        const halfSize = size / 2;
                        const points = [
                            [x - halfSize + getWobbleOffset(), y - halfSize + getWobbleOffset()],
                            [x + halfSize + getWobbleOffset(), y - halfSize + getWobbleOffset()],
                            [x + halfSize + getWobbleOffset(), y + halfSize + getWobbleOffset()],
                            [x - halfSize + getWobbleOffset(), y + halfSize + getWobbleOffset()]
                        ];
                        
                        ctx.moveTo(points[0][0], points[0][1]);
                        for (let i = 0; i < 4; i++) {
                            const next = (i + 1) % 4;
                            const cpX = (points[i][0] + points[next][0]) / 2 + getWobbleOffset();
                            const cpY = (points[i][1] + points[next][1]) / 2 + getWobbleOffset();
                            ctx.quadraticCurveTo(cpX, cpY, points[next][0], points[next][1]);
                        }
                    } else {
                        // Regular square
                        ctx.rect(
                            x - quadWidth * 0.4 * sizeFactor,
                            y - quadHeight * 0.4 * sizeFactor,
                            quadWidth * 0.8 * sizeFactor,
                            quadHeight * 0.8 * sizeFactor
                        );
                    }
                    ctx.stroke();
                    break;
                case 2: // Triangle
                    ctx.beginPath();
                    const triSize = quadWidth * 0.8 * sizeFactor;
                    if (wobble) {
                        // Draw a wobbly triangle with curvy edges
                        const points = [
                            [x + getWobbleOffset(), y - triSize / 2 + getWobbleOffset()],
                            [x - triSize / 2 + getWobbleOffset(), y + triSize / 2 + getWobbleOffset()],
                            [x + triSize / 2 + getWobbleOffset(), y + triSize / 2 + getWobbleOffset()]
                        ];
                        
                        ctx.moveTo(points[0][0], points[0][1]);
                        for (let i = 0; i < 3; i++) {
                            const next = (i + 1) % 3;
                            const cpX = (points[i][0] + points[next][0]) / 2 + getWobbleOffset();
                            const cpY = (points[i][1] + points[next][1]) / 2 + getWobbleOffset();
                            ctx.quadraticCurveTo(cpX, cpY, points[next][0], points[next][1]);
                        }
                    } else {
                        // Regular triangle
                        ctx.moveTo(x, y - triSize / 2);
                        ctx.lineTo(x - triSize / 2, y + triSize / 2);
                        ctx.lineTo(x + triSize / 2, y + triSize / 2);
                    }
                    ctx.closePath();
                    ctx.stroke();
                    break;
                case 3: // Pentagon
                    ctx.beginPath();
                    const pentRadius = quadWidth * 0.4 * sizeFactor;
                    if (wobble) {
                        // Draw a wobbly pentagon
                        let lastX = 1, lastY = 1;
                        for (let i = 0; i <= 5; i++) {
                            const angle = (i % 5) * 2 * Math.PI / 5 - Math.PI / 2;
                            const radius = pentRadius + getWobbleOffset();
                            const pointX = x + radius * Math.cos(angle);
                            const pointY = y + radius * Math.sin(angle);
                            
                            if (i === 0) {
                                ctx.moveTo(pointX, pointY);
                                lastX = pointX;
                                lastY = pointY;
                            } else {
                                const cpX = (lastX + pointX) / 2 + getWobbleOffset();
                                const cpY = (lastY + pointY) / 2 + getWobbleOffset();
                                ctx.quadraticCurveTo(cpX, cpY, pointX, pointY);
                                lastX = pointX;
                                lastY = pointY;
                            }
                        }
                    } else {
                        // Regular pentagon
                        for (let i = 0; i < 5; i++) {
                            const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                            const pointX = x + pentRadius * Math.cos(angle);
                            const pointY = y + pentRadius * Math.sin(angle);
                            if (i === 0) {
                                ctx.moveTo(pointX, pointY);
                            } else {
                                ctx.lineTo(pointX, pointY);
                            }
                        }
                    }
                    ctx.closePath();
                    ctx.stroke();
                    break;
                case 4: // Hexagon
                    ctx.beginPath();
                    const hexRadius = quadWidth * 0.4 * sizeFactor;
                    if (wobble) {
                        // Draw a wobbly hexagon
                        let lastX = 1, lastY = 1;
                        for (let i = 0; i <= 6; i++) {
                            const angle = (i % 6) * 2 * Math.PI / 6;
                            const radius = hexRadius + getWobbleOffset();
                            const pointX = x + radius * Math.cos(angle);
                            const pointY = y + radius * Math.sin(angle);
                            
                            if (i === 0) {
                                ctx.moveTo(pointX, pointY);
                                lastX = pointX;
                                lastY = pointY;
                            } else {
                                const cpX = (lastX + pointX) / 2 + getWobbleOffset();
                                const cpY = (lastY + pointY) / 2 + getWobbleOffset();
                                ctx.quadraticCurveTo(cpX, cpY, pointX, pointY);
                                lastX = pointX;
                                lastY = pointY;
                            }
                        }
                    } else {
                        // Regular hexagon
                        for (let i = 0; i < 6; i++) {
                            const angle = (i * 2 * Math.PI) / 6;
                            const pointX = x + hexRadius * Math.cos(angle);
                            const pointY = y + hexRadius * Math.sin(angle);
                            if (i === 0) {
                                ctx.moveTo(pointX, pointY);
                            } else {
                                ctx.lineTo(pointX, pointY);
                            }
                        }
                    }
                    ctx.closePath();
                    ctx.stroke();
                    break;
            }
            
            // Remove per-shape noise as we'll add it globally after all drawing is done
        };
        
        // Draw a random shape in each quadrant
        drawShape(0, topLeftX, topLeftY);         // Top-left
        drawShape(1, topRightX, topRightY);       // Top-right
        drawShape(2, bottomLeftX, bottomLeftY);   // Bottom-left
        drawShape(3, bottomRightX, bottomRightY); // Bottom-right
    };
    
    // First draw shapes normally
    drawAllShapes(0);
    
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
    drawAllShapes(0);
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
                resolve(buffer.toString('base64'));
            });
            
            stream.on('error', (err) => {
                reject(err);
            });
        } catch (error) {
            reject(new Error(`Failed to generate captcha image: ${error instanceof Error ? error.message : String(error)}`));
        }
    });
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
