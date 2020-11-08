<script lang="ts">
  import { onMount } from "svelte";
  import { getZero, join, step, toCell } from "./gol";
  import type { Cell } from "./gol";

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  let pixels = 0;
  let dvp = 1;

  let fps = 20;
  $: frameTime = 1000 / fps;
  let lastTime: number;

  let k = 17;

  fetch("/metapixel-galaxy.mc.txt")
    .then((res) => res.text())
    .then((text) => {
      debugger;
      const cells: Cell[] = [];
      const lines = text
        .trim()
        .split("\n")
        .filter((line) => !line.startsWith("[M2]") && !line.startsWith("#"));
      lines.forEach((line) => {
        if (
          line.startsWith("$") ||
          line.startsWith(".") ||
          line.startsWith("*")
        ) {
          const grid: number[][] = new Array(8)
            .fill(null)
            .map(() => new Array(8).fill(0));
          let x = 0;
          let y = 0;
          line.split("").forEach((char) => {
            switch (char) {
              case ".":
                x++;
                break;
              case "$":
                y++;
                x = 0;
                break;
              case "*":
                grid[y][x] = 1;
                x++;
                break;
              default:
                console.error("invalid char", char);
            }
          });
          const cell = toCell(grid);
          cells.push(cell);
        } else {
          const [k, a, b, c, d] = line.trim().split(/\s+/).map(Number);
          // console.log("non-leaf", k, a, b, c, d, "cells.length:", cells.length);
          const cell = join(
            a == 0 ? getZero(k - 1) : cells[a - 1],
            b == 0 ? getZero(k - 1) : cells[b - 1],
            c == 0 ? getZero(k - 1) : cells[c - 1],
            d == 0 ? getZero(k - 1) : cells[d - 1]
          );
          cells.push(cell);
        }
      });
      loadedCell = cells[cells.length - 1];
      reset();
      animate();
    });

  let loadedCell = getZero(0);
  let cell = getZero(0);
  let g = 0;

  let animationState: "play" | "pause" = "pause";

  function startStop() {
    animationState = animationState == "play" ? "pause" : "play";
    lastTime = performance.now();
  }

  function animate() {
    const now = performance.now();
    if (now - lastTime > frameTime) {
      lastTime = now;
      if (animationState == "play") {
        g += Math.pow(2, k - 2);
        cell = step(cell, k);
      }
      render();
    }
    requestAnimationFrame(animate);
  }

  function reset() {
    cell = loadedCell;
    offsetX = Math.floor(pixels / 2);
    offsetY = Math.floor(pixels / 2);
    cellSize = 1 / 64;
    g = 0;
    lastTime = performance.now();
    render();
  }

  function render() {
    if (cell == null) {
      return;
    }
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, pixels, pixels);
    const width = Math.pow(2, cell.k - 1) * cellSize;
    renderCell(width * 2, -width, -width, cell);
  }

  let offsetX = 0;
  let offsetY = 0;
  let cellSize = 1;

  function renderCell(size: number, x: number, y: number, cell: any) {
    if (
      cell.n == 0 ||
      x + offsetX > pixels ||
      x + size + offsetX < 0 ||
      y + offsetY > pixels ||
      y + size + offsetY < 0
    ) {
      return;
    }
    if (size == 1) {
      ctx.fillStyle = `black`;
      ctx.fillRect(x + offsetX, y + offsetY, 1, 1);
      return;
    }
    if (cell.k == 0) {
      ctx.fillStyle = `black`;
      ctx.fillRect(x + offsetX, y + offsetY, cellSize, cellSize);
      return;
    }
    size /= 2;
    renderCell(size, x, y, cell.a);
    renderCell(size, x + size, y, cell.b);
    renderCell(size, x, y + size, cell.c);
    renderCell(size, x + size, y + size, cell.d);
  }

  onMount(() => {
    dvp = window.devicePixelRatio;
    ctx = canvas.getContext("2d")!;
    pixels = canvas.offsetWidth * dvp;
    canvas.width = pixels;
    canvas.height = pixels;
  });

  type MoveState = "idle" | "move" | "scale";
  let touchState: MoveState = "idle";

  let down = false;
  let startX = 0;
  let startY = 0;
  let lastDistance = 0;
  let scaling = false;

  function distance(touches: TouchList) {
    if (touches.length == 2) {
      const diffX = touches.item(0)!.clientX - touches.item(1)!.clientX;
      const diffY = touches.item(0)!.clientY - touches.item(1)!.clientY;
      return Math.sqrt(diffX * diffX + diffY * diffY);
    }
    return 0;
  }

  function touchstart(e: TouchEvent) {
    if (e.touches.length == 2) {
      touchState = "scale";
      lastDistance = distance(e.touches);
    } else {
      touchState = "move";
      const touch = e.touches.item(0)!;
      startX = touch.clientX;
      startY = touch.clientY;
    }
    e.preventDefault();
    e.stopPropagation();
  }
  function touchmove(e: TouchEvent) {
    if (touchState == "scale") {
      const newDistance = distance(e.touches);
      if (lastDistance - newDistance > 50) {
        lastDistance = newDistance;
        zoomOut();
      }
      if (lastDistance - newDistance < -50) {
        lastDistance = newDistance;
        zoomIn();
      }
    }
    if (touchState == "move") {
      const touch = e.touches.item(0)!;
      const moveX = touch.clientX - startX;
      const moveY = touch.clientY - startY;
      offsetX += moveX * dvp;
      offsetY += moveY * dvp;
      startX = touch.clientX;
      startY = touch.clientY;
    }
    e.preventDefault();
    e.stopPropagation();
  }
  function touchend(e: TouchEvent) {
    touchState = "idle";
    e.preventDefault();
    e.stopPropagation();
  }

  function zoomOut() {
    offsetX -= Math.round((offsetX - pixels / 2) / 2);
    offsetY -= Math.round((offsetY - pixels / 2) / 2);

    cellSize /= 2;
  }

  function zoomIn() {
    offsetX += Math.round(offsetX - pixels / 2);
    offsetY += Math.round(offsetY - pixels / 2);

    cellSize *= 2;
  }
</script>

<style>
  .container {
    width: 100%;
    max-width: 40em;
    margin: auto;
  }
  canvas {
    display: block;
    width: 100%;
  }
</style>

<div class="container">
  <canvas
    bind:this={canvas}
    on:touchstart={touchstart}
    on:touchmove={touchmove}
    on:touchend={touchend}
    on:touchcancel={touchend} />
  <div>
    <button
      on:click={startStop}>{animationState == 'pause' ? 'start' : 'stop'}</button>
    <button on:click={reset}>reset</button>
  </div>
  <div>
    <label for="fps">{fps}
      fps
      <input id="fps" type="range" min="4" max="60" bind:value={fps} />
    </label>
  </div>
  <div>
    <label for="speed">
      speed
      <input id="speed" type="range" min="2" max="17" bind:value={k} />
    </label>
  </div>

  <button on:click={zoomIn}>+</button>
  <button on:click={zoomOut}>-</button>

  <div>Population: {cell.n}</div>
  <div>Generation: {g}</div>
</div>
