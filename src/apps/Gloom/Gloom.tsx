'use client';

import { useEffect, useRef, useState } from 'react';

interface DoomAppProps {
  onClose: () => void;
}

export default function DoomApp({ onClose: _onClose }: DoomAppProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simple maze map (1 = wall, 0 = empty)
    const map = [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 0, 1, 0, 1],
      [1, 0, 1, 0, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ];

    let playerX = 3.5;
    let playerY = 3.5;
    let playerAngle = 0;
    const moveSpeed = 0.05;
    const rotSpeed = 0.05;

    // Enemies
    interface Enemy {
      x: number;
      y: number;
      health: number;
      angle: number;
      exploding: boolean;
      explosionFrame: number;
      shootCooldown: number;
    }

    interface Projectile {
      x: number;
      y: number;
      angle: number;
      speed: number;
    }

    const enemies: Enemy[] = [
      { x: 1.5, y: 1.5, health: 3, angle: 0, exploding: false, explosionFrame: 0, shootCooldown: 0 },
      { x: 6.5, y: 1.5, health: 3, angle: Math.PI, exploding: false, explosionFrame: 0, shootCooldown: 0 },
      { x: 1.5, y: 6.5, health: 3, angle: Math.PI / 2, exploding: false, explosionFrame: 0, shootCooldown: 0 },
    ];

    const projectiles: Projectile[] = [];

    // Gun state
    let gunRecoil = 0;
    let muzzleFlash = 0;
    let score = 0;
    let gameOver = false;
    let playerHealth = 100;
    let screenFlash = 0;
    let gameStarted = false;

    const keys: { [key: string]: boolean } = {};
    let spacePressed = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keys[key] = true;

      // Start game or restart on space
      if ((key === ' ' || key === 'space') && !spacePressed) {
        spacePressed = true;
        e.preventDefault(); // Prevent page scroll
        
        if (!gameStarted) {
          gameStarted = true;
        } else if (gameOver) {
          resetGame();
          gameStarted = true;
        } else {
          shoot();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keys[key] = false;
      if (key === ' ' || key === 'space') {
        spacePressed = false;
      }
    };

    const shoot = () => {
      gunRecoil = 10;
      muzzleFlash = 5;

      // Check if we hit an enemy
      for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (enemy.exploding) continue;

        const dx = enemy.x - playerX;
        const dy = enemy.y - playerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angleToEnemy = Math.atan2(dy, dx);
        let angleDiff = angleToEnemy - playerAngle;

        // Normalize angle
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

        // Hit if enemy is in crosshair (within 0.15 radians and close enough)
        if (Math.abs(angleDiff) < 0.15 && distance < 8) {
          enemy.health--;
          if (enemy.health <= 0) {
            enemy.exploding = true;
            enemy.explosionFrame = 0;
            score += 100;
          }
        }
      }
    };

    const checkLineOfSight = (x1: number, y1: number, x2: number, y2: number): boolean => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.floor(distance * 10);

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const checkX = Math.floor(x1 + dx * t);
        const checkY = Math.floor(y1 + dy * t);

        if (
          checkX < 0 ||
          checkX >= map[0].length ||
          checkY < 0 ||
          checkY >= map.length ||
          map[checkY][checkX] === 1
        ) {
          return false;
        }
      }
      return true;
    };

    const updateEnemies = () => {
      for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];

        if (enemy.exploding) {
          enemy.explosionFrame++;
          if (enemy.explosionFrame > 20) {
            enemies.splice(i, 1);
          }
          continue;
        }

        // Calculate distance to player
        const dx = playerX - enemy.x;
        const dy = playerY - enemy.y;
        const distanceToPlayer = Math.sqrt(dx * dx + dy * dy);
        const angleToPlayer = Math.atan2(dy, dx);

        // Decrease shoot cooldown
        if (enemy.shootCooldown > 0) {
          enemy.shootCooldown--;
        }

        // Enemy AI: DOOM-style - stationary shooting, random wandering
        const hasLineOfSight = checkLineOfSight(enemy.x, enemy.y, playerX, playerY);

        // Shoot if player is visible and in range
        if (distanceToPlayer < 6 && hasLineOfSight && enemy.shootCooldown === 0 && Math.random() < 0.03) {
          // Add random inaccuracy to shot
          const inaccuracy = (Math.random() - 0.5) * 0.4; // ±0.2 radians
          projectiles.push({
            x: enemy.x,
            y: enemy.y,
            angle: angleToPlayer + inaccuracy,
            speed: 0.04, // Slower projectile speed
          });
          enemy.shootCooldown = 300; // 5 seconds at 60fps
        }

        // Random wandering movement (not chasing)
        if (Math.random() < 0.02) {
          enemy.angle += (Math.random() - 0.5) * 1.0;
        }

        // Move forward
        const moveSpeed = 0.02;
        const newX = enemy.x + Math.cos(enemy.angle) * moveSpeed;
        const newY = enemy.y + Math.sin(enemy.angle) * moveSpeed;

        // Check collision with walls
        if (
          newX > 0 &&
          newX < map[0].length &&
          newY > 0 &&
          newY < map.length &&
          map[Math.floor(newY)][Math.floor(newX)] === 0
        ) {
          enemy.x = newX;
          enemy.y = newY;
        } else {
          // Hit a wall, turn around
          enemy.angle += Math.PI / 2 + (Math.random() - 0.5);
        }
      }

      // Update projectiles
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const proj = projectiles[i];

        // Move projectile
        proj.x += Math.cos(proj.angle) * proj.speed;
        proj.y += Math.sin(proj.angle) * proj.speed;

        // Check wall collision
        if (
          proj.x < 0 ||
          proj.x >= map[0].length ||
          proj.y < 0 ||
          proj.y >= map.length ||
          map[Math.floor(proj.y)][Math.floor(proj.x)] === 1
        ) {
          projectiles.splice(i, 1);
          continue;
        }

        // Check player collision
        const dx = proj.x - playerX;
        const dy = proj.y - playerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 0.3) {
          playerHealth -= 10;
          screenFlash = 10;
          projectiles.splice(i, 1);
          if (playerHealth <= 0) {
            playerHealth = 0;
            gameOver = true;
            spacePressed = false; // Reset space so restart works
          }
        }
      }

      // Check win condition
      if (enemies.length === 0 && !gameOver) {
        gameOver = true;
        spacePressed = false; // Reset space so restart works
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Clear screen
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      // Draw ceiling and floor
      ctx.fillStyle = '#333';
      ctx.fillRect(0, 0, width, height / 2);
      ctx.fillStyle = '#555';
      ctx.fillRect(0, height / 2, width, height / 2);

      // Raycasting
      const numRays = width;
      const fov = Math.PI / 3;

      for (let i = 0; i < numRays; i++) {
        const rayAngle = playerAngle - fov / 2 + (fov * i) / numRays;
        const rayDirX = Math.cos(rayAngle);
        const rayDirY = Math.sin(rayAngle);

        let distance = 0;
        let hit = false;

        while (!hit && distance < 20) {
          distance += 0.1;
          const testX = Math.floor(playerX + rayDirX * distance);
          const testY = Math.floor(playerY + rayDirY * distance);

          if (
            testX < 0 ||
            testX >= map[0].length ||
            testY < 0 ||
            testY >= map.length ||
            map[testY][testX] === 1
          ) {
            hit = true;
          }
        }

        // Fix fisheye effect
        distance *= Math.cos(rayAngle - playerAngle);

        const wallHeight = (height / distance) * 0.5;
        const wallTop = height / 2 - wallHeight / 2;

        // Color based on distance
        const brightness = Math.max(0, 255 - distance * 30);
        ctx.fillStyle = `rgb(${brightness}, ${brightness * 0.5}, ${brightness * 0.5})`;
        ctx.fillRect(i, wallTop, 1, wallHeight);
      }

      // Draw minimap
      const miniSize = 100;
      const cellSize = miniSize / map.length;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(10, 10, miniSize, miniSize);

      for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
          if (map[y][x] === 1) {
            ctx.fillStyle = '#fff';
            ctx.fillRect(10 + x * cellSize, 10 + y * cellSize, cellSize, cellSize);
          }
        }
      }

      // Draw player on minimap
      ctx.fillStyle = '#0f0';
      ctx.fillRect(
        10 + playerX * cellSize - 2,
        10 + playerY * cellSize - 2,
        4,
        4
      );

      // Draw enemies on minimap
      ctx.fillStyle = '#f00';
      enemies.forEach((enemy) => {
        if (!enemy.exploding) {
          ctx.fillRect(
            10 + enemy.x * cellSize - 2,
            10 + enemy.y * cellSize - 2,
            4,
            4
          );
        }
      });

      // Draw projectiles on minimap
      ctx.fillStyle = '#ff0';
      projectiles.forEach((proj) => {
        ctx.fillRect(
          10 + proj.x * cellSize - 1,
          10 + proj.y * cellSize - 1,
          2,
          2
        );
      });

      // Draw enemies in 3D (only if visible - not behind walls)
      enemies.forEach((enemy) => {
        const dx = enemy.x - playerX;
        const dy = enemy.y - playerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angleToEnemy = Math.atan2(dy, dx);
        let angleDiff = angleToEnemy - playerAngle;

        // Normalize angle
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

        // Check line of sight
        const hasLineOfSight = checkLineOfSight(playerX, playerY, enemy.x, enemy.y);

        // Only draw if in FOV and visible
        if (Math.abs(angleDiff) < fov / 2 && distance < 10 && hasLineOfSight) {
          const enemySize = (height / distance) * 0.3;
          const enemyX =
            width / 2 + (angleDiff / (fov / 2)) * (width / 2) - enemySize / 2;
          const enemyY = height / 2 - enemySize / 2;

          if (enemy.exploding) {
            // Explosion animation
            const frame = enemy.explosionFrame;
            const explosionSize = enemySize * (1 + frame / 10);
            const explosionX = enemyX - (explosionSize - enemySize) / 2;
            const explosionY = enemyY - (explosionSize - enemySize) / 2;

            // Draw explosion
            ctx.fillStyle = frame < 5 ? '#fff' : frame < 10 ? '#ff0' : '#f80';
            ctx.beginPath();
            ctx.arc(
              explosionX + explosionSize / 2,
              explosionY + explosionSize / 2,
              explosionSize / 2,
              0,
              Math.PI * 2
            );
            ctx.fill();

            // Particles
            for (let p = 0; p < 8; p++) {
              const angle = (Math.PI * 2 * p) / 8;
              const dist = frame * 3;
              ctx.fillStyle = '#f00';
              ctx.fillRect(
                explosionX + explosionSize / 2 + Math.cos(angle) * dist,
                explosionY + explosionSize / 2 + Math.sin(angle) * dist,
                4,
                4
              );
            }
          } else {
            // Draw enemy sprite (simple red demon)
            ctx.fillStyle = '#f00';
            ctx.fillRect(enemyX, enemyY, enemySize, enemySize);
            ctx.fillStyle = '#ff0';
            ctx.fillRect(
              enemyX + enemySize * 0.2,
              enemyY + enemySize * 0.2,
              enemySize * 0.2,
              enemySize * 0.2
            );
            ctx.fillRect(
              enemyX + enemySize * 0.6,
              enemyY + enemySize * 0.2,
              enemySize * 0.2,
              enemySize * 0.2
            );
          }
        }
      });

      // Draw projectiles in 3D
      projectiles.forEach((proj) => {
        const dx = proj.x - playerX;
        const dy = proj.y - playerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angleToProj = Math.atan2(dy, dx);
        let angleDiff = angleToProj - playerAngle;

        // Normalize angle
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

        // Only draw if in FOV
        if (Math.abs(angleDiff) < fov / 2 && distance < 10) {
          const projSize = (height / distance) * 0.1;
          const projX =
            width / 2 + (angleDiff / (fov / 2)) * (width / 2) - projSize / 2;
          const projY = height / 2 - projSize / 2;

          // Draw projectile (glowing red ball)
          ctx.fillStyle = '#ff0';
          ctx.beginPath();
          ctx.arc(projX + projSize / 2, projY + projSize / 2, projSize / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#f00';
          ctx.beginPath();
          ctx.arc(projX + projSize / 2, projY + projSize / 2, projSize / 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw gun
      const gunWidth = 120;
      const gunHeight = 150;
      const gunX = width / 2 - gunWidth / 2;
      const gunY = height - gunHeight + gunRecoil;

      // Gun body
      ctx.fillStyle = '#444';
      ctx.fillRect(gunX + 40, gunY + 50, 40, 100);

      // Gun barrel
      ctx.fillStyle = '#222';
      ctx.fillRect(gunX + 50, gunY, 20, 60);

      // Muzzle flash
      if (muzzleFlash > 0) {
        ctx.fillStyle = '#ff0';
        ctx.fillRect(gunX + 45, gunY - 20, 30, 20);
        ctx.fillStyle = '#f80';
        ctx.fillRect(gunX + 50, gunY - 15, 20, 15);
      }

      // Crosshair
      ctx.strokeStyle = '#0f0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 10, height / 2);
      ctx.lineTo(width / 2 + 10, height / 2);
      ctx.moveTo(width / 2, height / 2 - 10);
      ctx.lineTo(width / 2, height / 2 + 10);
      ctx.stroke();

      // HUD
      ctx.fillStyle = '#0f0';
      ctx.font = '16px monospace';
      ctx.fillText(`Score: ${score}`, 10, height - 10);
      ctx.fillText(`Enemies: ${enemies.length}`, width - 120, height - 10);

      // Health bar
      const healthBarWidth = 200;
      const healthBarHeight = 20;
      const healthBarX = 10;
      const healthBarY = height - 40;

      ctx.fillStyle = '#000';
      ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
      ctx.strokeStyle = '#0f0';
      ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

      const healthColor =
        playerHealth > 50 ? '#0f0' : playerHealth > 25 ? '#ff0' : '#f00';
      ctx.fillStyle = healthColor;
      ctx.fillRect(
        healthBarX + 2,
        healthBarY + 2,
        (healthBarWidth - 4) * (playerHealth / 100),
        healthBarHeight - 4
      );

      ctx.fillStyle = '#fff';
      ctx.font = '12px monospace';
      ctx.fillText(`HP: ${playerHealth}`, healthBarX + 5, healthBarY + 14);

      // Screen flash when hit
      if (screenFlash > 0) {
        ctx.fillStyle = `rgba(255, 0, 0, ${screenFlash / 30})`;
        ctx.fillRect(0, 0, width, height);
        screenFlash--;
      }

      // Decay effects
      if (gunRecoil > 0) gunRecoil -= 1;
      if (muzzleFlash > 0) muzzleFlash -= 1;

      // Start screen
      if (!gameStarted) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, width, height);
        ctx.font = 'bold 64px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#f00';
        ctx.fillText('DOOM', width / 2, height / 2 - 120);

        ctx.font = '20px monospace';
        ctx.fillStyle = '#0f0';
        ctx.fillText('MISSION:', width / 2, height / 2 - 40);
        ctx.font = '16px monospace';
        ctx.fillStyle = '#fff';
        ctx.fillText('Eliminate all demons before they kill you!', width / 2, height / 2 - 10);

        ctx.font = '18px monospace';
        ctx.fillStyle = '#0f0';
        ctx.fillText('CONTROLS:', width / 2, height / 2 + 30);
        ctx.font = '14px monospace';
        ctx.fillStyle = '#fff';
        ctx.fillText('W/↑ - Move Forward', width / 2, height / 2 + 55);
        ctx.fillText('S/↓ - Move Backward', width / 2, height / 2 + 75);
        ctx.fillText('A/← - Turn Left', width / 2, height / 2 + 95);
        ctx.fillText('D/→ - Turn Right', width / 2, height / 2 + 115);
        ctx.fillText('SPACE - Shoot', width / 2, height / 2 + 135);

        ctx.font = 'bold 24px monospace';
        ctx.fillStyle = '#ff0';
        ctx.fillText('Press SPACE to Start', width / 2, height / 2 + 180);
        ctx.textAlign = 'left';
      }

      // Game over screen
      if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, width, height);
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'center';

        if (playerHealth <= 0) {
          ctx.fillStyle = '#f00';
          ctx.fillText('YOU DIED', width / 2, height / 2 - 40);
          ctx.font = '24px monospace';
          ctx.fillText(`Final Score: ${score}`, width / 2, height / 2 + 20);
          ctx.fillText('The demons have won...', width / 2, height / 2 + 60);
        } else {
          ctx.fillStyle = '#0f0';
          ctx.fillText('VICTORY!', width / 2, height / 2 - 40);
          ctx.font = '24px monospace';
          ctx.fillText(`Final Score: ${score}`, width / 2, height / 2 + 20);
          ctx.fillText('All demons eliminated!', width / 2, height / 2 + 60);
        }

        ctx.font = '20px monospace';
        ctx.fillStyle = '#ff0';
        ctx.fillText('Press SPACE to Restart', width / 2, height / 2 + 110);
        ctx.textAlign = 'left';
      }
    };

    const resetGame = () => {
      playerX = 3.5;
      playerY = 3.5;
      playerAngle = 0;
      playerHealth = 100;
      score = 0;
      gameOver = false;
      screenFlash = 0;
      gunRecoil = 0;
      muzzleFlash = 0;
      lastCollisionTime = 0;

      enemies.length = 0;
      enemies.push(
        { x: 1.5, y: 1.5, health: 3, angle: 0, exploding: false, explosionFrame: 0, shootCooldown: 0 },
        { x: 6.5, y: 1.5, health: 3, angle: Math.PI, exploding: false, explosionFrame: 0, shootCooldown: 0 },
        { x: 1.5, y: 6.5, health: 3, angle: Math.PI / 2, exploding: false, explosionFrame: 0, shootCooldown: 0 }
      );
      projectiles.length = 0;
    };

    const gameLoop = () => {
      if (gameStarted && !gameOver) {
        // Handle movement
        if (keys['w'] || keys['arrowup']) {
          const newX = playerX + Math.cos(playerAngle) * moveSpeed;
          const newY = playerY + Math.sin(playerAngle) * moveSpeed;
          if (map[Math.floor(newY)][Math.floor(newX)] === 0) {
            playerX = newX;
            playerY = newY;
          }
        }
        if (keys['s'] || keys['arrowdown']) {
          const newX = playerX - Math.cos(playerAngle) * moveSpeed;
          const newY = playerY - Math.sin(playerAngle) * moveSpeed;
          if (map[Math.floor(newY)][Math.floor(newX)] === 0) {
            playerX = newX;
            playerY = newY;
          }
        }
        if (keys['a'] || keys['arrowleft']) {
          playerAngle -= rotSpeed;
        }
        if (keys['d'] || keys['arrowright']) {
          playerAngle += rotSpeed;
        }

        updateEnemies();
        checkEnemyCollision();
      }

      render();
      requestAnimationFrame(gameLoop);
    };

    let lastCollisionTime = 0;

    const checkEnemyCollision = () => {
      const currentTime = Date.now();
      
      enemies.forEach((enemy) => {
        if (enemy.exploding) return;

        const dx = enemy.x - playerX;
        const dy = enemy.y - playerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // If player touches enemy (only damage once per second)
        if (distance < 0.4 && currentTime - lastCollisionTime > 1000) {
          playerHealth -= 10;
          screenFlash = 10;
          lastCollisionTime = currentTime;
          
          // Push player back, but check for walls
          const pushAngle = Math.atan2(-dy, -dx);
          const newX = playerX + Math.cos(pushAngle) * 0.3;
          const newY = playerY + Math.sin(pushAngle) * 0.3;
          
          // Only push if not into a wall
          if (
            newX > 0 &&
            newX < map[0].length &&
            newY > 0 &&
            newY < map.length &&
            map[Math.floor(newY)][Math.floor(newX)] === 0
          ) {
            playerX = newX;
            playerY = newY;
          }

          if (playerHealth <= 0) {
            playerHealth = 0;
            gameOver = true;
            spacePressed = false; // Reset space so restart works
          }
        }
      });
    };

    setLoading(false);
    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {loading && (
        <div style={{ color: '#0f0', fontFamily: 'monospace', marginBottom: 20 }}>
          Loading DOOM-style Engine...
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        style={{
          imageRendering: 'pixelated',
          maxWidth: '100%',
          maxHeight: '100%',
        }}
      />
      <div
        style={{
          color: '#0f0',
          fontFamily: 'monospace',
          fontSize: 12,
          marginTop: 10,
          textAlign: 'center',
        }}
      >
        WASD or Arrow Keys to move | A/D to rotate | SPACE to shoot
      </div>
    </div>
  );
}
