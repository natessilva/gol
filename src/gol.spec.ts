import { toCell, step, pointsFromCenter } from "./gol";
import { describe, it, expect } from "@jest/globals";

describe("game of life", () => {
  describe("glider tests", () => {
    it("steps through all 4 states at k=2", () => {
      const grid = [
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0],
      ];
      let cell = toCell(grid);
      let points = pointsFromCenter(cell, 2, 2, 0);
      expect(points.length).toEqual(5);
      [
        { x: 1, y: 0, scale: 1 },
        { x: 2, y: 1, scale: 1 },
        { x: 0, y: 2, scale: 1 },
        { x: 1, y: 2, scale: 1 },
        { x: 2, y: 2, scale: 1 },
      ].forEach((p) => expect(points).toContainEqual(p));
      cell = step(cell, 2);
      points = pointsFromCenter(cell, 2, 2, 0);
      expect(points.length).toEqual(5);
      [
        { x: 0, y: 1, scale: 1 },
        { x: 2, y: 1, scale: 1 },
        { x: 1, y: 2, scale: 1 },
        { x: 2, y: 2, scale: 1 },
        { x: 1, y: 3, scale: 1 },
      ].forEach((p) => expect(points).toContainEqual(p));
      cell = step(cell, 2);
      points = pointsFromCenter(cell, 2, 2, 0);
      expect(points.length).toEqual(5);
      [
        { x: 2, y: 1, scale: 1 },
        { x: 0, y: 2, scale: 1 },
        { x: 1, y: 3, scale: 1 },
        { x: 2, y: 2, scale: 1 },
        { x: 2, y: 3, scale: 1 },
      ].forEach((p) => expect(points).toContainEqual(p));

      cell = step(cell, 2);
      points = pointsFromCenter(cell, 2, 2, 0);
      expect(points.length).toEqual(5);
      [
        { x: 1, y: 1, scale: 1 },
        { x: 2, y: 2, scale: 1 },
        { x: 3, y: 2, scale: 1 },
        { x: 1, y: 3, scale: 1 },
        { x: 2, y: 3, scale: 1 },
      ].forEach((p) => expect(points).toContainEqual(p));
      cell = step(cell, 2);
      points = pointsFromCenter(cell, 2, 2, 0);
      expect(points.length).toEqual(5);
      [
        { x: 2, y: 1, scale: 1 },
        { x: 1, y: 3, scale: 1 },
        { x: 3, y: 2, scale: 1 },
        { x: 2, y: 3, scale: 1 },
        { x: 3, y: 3, scale: 1 },
      ].forEach((p) => expect(points).toContainEqual(p));
    });

    it("skips every other state at k=3", () => {
      const grid = [
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0],
      ];
      let cell = toCell(grid);
      let points = pointsFromCenter(cell, 2, 2, 0);
      expect(points.length).toEqual(5);
      [
        { x: 1, y: 0, scale: 1 },
        { x: 2, y: 1, scale: 1 },
        { x: 0, y: 2, scale: 1 },
        { x: 1, y: 2, scale: 1 },
        { x: 2, y: 2, scale: 1 },
      ].forEach((p) => expect(points).toContainEqual(p));
      cell = step(cell, 3);
      points = pointsFromCenter(cell, 2, 2, 0);
      expect(points.length).toEqual(5);
      [
        { x: 2, y: 1, scale: 1 },
        { x: 0, y: 2, scale: 1 },
        { x: 1, y: 3, scale: 1 },
        { x: 2, y: 2, scale: 1 },
        { x: 2, y: 3, scale: 1 },
      ].forEach((p) => expect(points).toContainEqual(p));

      cell = step(cell, 3);
      points = pointsFromCenter(cell, 2, 2, 0);
      expect(points.length).toEqual(5);
      [
        { x: 2, y: 1, scale: 1 },
        { x: 1, y: 3, scale: 1 },
        { x: 3, y: 2, scale: 1 },
        { x: 2, y: 3, scale: 1 },
        { x: 3, y: 3, scale: 1 },
      ].forEach((p) => expect(points).toContainEqual(p));
    });

    it("same pattern shifted by 2 pixels at k=5", () => {
      const grid = [
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0],
      ];
      let cell = toCell(grid);
      let points = pointsFromCenter(cell, 2, 2, 0);
      expect(points.length).toEqual(5);
      [
        { x: 1, y: 0, scale: 1 },
        { x: 2, y: 1, scale: 1 },
        { x: 0, y: 2, scale: 1 },
        { x: 1, y: 2, scale: 1 },
        { x: 2, y: 2, scale: 1 },
      ].forEach((p) => expect(points).toContainEqual(p));

      cell = step(cell, 5);
      points = pointsFromCenter(cell, 2, 2, 0);
      expect(points.length).toEqual(5);
      [
        { x: 3, y: 2, scale: 1 },
        { x: 4, y: 3, scale: 1 },
        { x: 2, y: 4, scale: 1 },
        { x: 3, y: 4, scale: 1 },
        { x: 4, y: 4, scale: 1 },
      ].forEach((p) => expect(points).toContainEqual(p));
    });
  });

  it("renders at various k levels", () => {
    const grid = [
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
    ];
    const cell = toCell(grid);
    let points = pointsFromCenter(cell, 2, 2, 0);
    expect([
      { x: 1, y: 0, scale: 1 },
      { x: 2, y: 1, scale: 1 },
      { x: 0, y: 2, scale: 1 },
      { x: 1, y: 2, scale: 1 },
      { x: 2, y: 2, scale: 1 },
    ]).toStrictEqual(points);
    points = pointsFromCenter(cell, 2, 2, 1);
    expect(points.length).toEqual(4);
    [
      { x: 0, y: 0, scale: 1 / 4 },
      { x: 1, y: 0, scale: 1 / 4 },
      { x: 0, y: 1, scale: 2 / 4 },
      { x: 1, y: 1, scale: 1 / 4 },
    ].forEach((p) => expect(points).toContainEqual(p));
    points = pointsFromCenter(cell, 2, 2, 2);
    expect(points).toStrictEqual([{ x: 0, y: 0, scale: 5 / 16 }]);

    // the cell is k = 2 so anything larger will display as k=2
    points = pointsFromCenter(cell, 2, 2, 3);
    expect(points).toStrictEqual([{ x: 0, y: 0, scale: 5 / 16 }]);
    points = pointsFromCenter(cell, 2, 2, 10);
    expect(points).toStrictEqual([{ x: 0, y: 0, scale: 5 / 16 }]);
  });

  it("memoizes calculations", () => {
    const grid = [
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
    ];
    // same set of nodes generated twice should return
    // the same references to the same objects.
    const cell1 = toCell(grid);
    const cell2 = toCell(grid);

    expect(cell1 === cell2).toBeTruthy();

    // the same cells steps forward should return the same references
    // to the same objects

    const next1 = step(cell1, 3);
    const next2 = step(cell2, 3);

    expect(next1 === next2).toBeTruthy();
  });
});
