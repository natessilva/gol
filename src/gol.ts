export function toCell(grid: number[][]): Cell {
  const width = Math.max(...grid.map((line) => line.length));
  let currentResult: BaseCell[][] = grid.map((line) =>
    new Array(width).fill(0).map((_, i) => (line[i] ? Alive : Dead))
  );
  let nextResult: CellKn[][] = [];
  for (let n = 1; true; n++) {
    nextResult = [];
    const z = getZero(n);
    for (let i = 0; i < currentResult.length; i += 2) {
      nextResult.push([]);
      for (let j = 0; j < currentResult[i].length; j += 2) {
        nextResult[nextResult.length - 1].push(
          join(
            (currentResult[i] && currentResult[i][j]) || z,
            (currentResult[i] && currentResult[i][j + 1]) || z,
            (currentResult[i + 1] && currentResult[i + 1][j]) || z,
            (currentResult[i + 1] && currentResult[i + 1][j + 1]) || z
          ) as CellKn
        );
      }
    }
    currentResult = nextResult;
    if (currentResult.length == 1 && currentResult[0].length == 1 && n >= 2) {
      break;
    }
  }
  return nextResult[0][0];
}

export function step(cell: Cell, j: number): Cell {
  let cellKn = cell as CellKn;
  while (
    cellKn.k < 3 ||
    cellKn.k < j ||
    cellKn.a.n != (cellKn.a as CellKn).d.d.n ||
    cellKn.b.n != (cellKn.b as CellKn).c.c.n ||
    cellKn.c.n != (cellKn.c as CellKn).b.b.n ||
    cellKn.d.n != (cellKn.d as CellKn).a.a.n
  ) {
    cellKn = expand(cellKn);
  }
  return lifeNxN(cellKn, j);
}

export function pointsFromCenter(cell: Cell, x: number, y: number, k: number) {
  const center = 1 << (cell.k - 1);
  return cellToPoint({ x: x - center, y: y - center, cell }, k);
}

function expand({ a, b, c, d }: CellKn | CellK1): CellKn {
  const z = getZero(a.k);
  return join(
    join(z, z, z, a),
    join(z, z, b, z),
    join(z, c, z, z),
    join(d, z, z, z)
  ) as CellKn;
}

function life3x3(grid: BaseCell[]): BaseCell {
  const living = grid.reduce((acc, cell) => acc + (cell == Alive ? 1 : 0), 0);
  return living == 3 || (living == 4 && grid[4]) == Alive ? Alive : Dead;
}

function life4x4(cell: Cell): CellK1 {
  if (cell.k != 2) {
    return getZero(1) as CellK1;
  }
  const { a, b, c, d } = cell as CellKn;
  return join(
    life3x3([a.a, a.b, b.a, a.c, a.d, b.c, c.a, c.b, d.a]),
    life3x3([a.b, b.a, b.b, a.d, b.c, b.d, c.b, d.a, d.b]),
    life3x3([a.c, a.d, b.c, c.a, c.b, d.a, c.c, c.d, d.c]),
    life3x3([a.d, b.c, b.d, c.b, d.a, d.b, c.d, d.c, d.d])
  ) as CellK1;
}

function lifeNxN(cell: CellKn, j: number): CellK1 | CellKn {
  if (cell.next == null) {
    cell.next = new Map();
  }
  j = Math.min(j, cell.k);
  if (!cell.next.has(j)) {
    cell.next.set(
      j,
      (() => {
        if (cell.n <= 0 || cell.k <= 1) {
          return cell.a;
        }
        if (cell.k == 2) {
          return life4x4(cell);
        }
        const i1 = lifeNxN(cell.a as CellKn, j) as CellKn;
        const i2 = lifeNxN(
          join(cell.a.b, cell.b.a, cell.a.d, cell.b.c) as CellKn,
          j
        ) as CellKn;
        const i3 = lifeNxN(cell.b as CellKn, j) as CellKn;
        const i4 = lifeNxN(
          join(cell.a.c, cell.a.d, cell.c.a, cell.c.b) as CellKn,
          j
        ) as CellKn;
        const i5 = lifeNxN(
          join(cell.a.d, cell.b.c, cell.c.b, cell.d.a) as CellKn,
          j
        ) as CellKn;
        const i6 = lifeNxN(
          join(cell.b.c, cell.b.d, cell.d.a, cell.d.b) as CellKn,
          j
        ) as CellKn;
        const i7 = lifeNxN(cell.c as CellKn, j) as CellKn;
        const i8 = lifeNxN(
          join(cell.c.b, cell.d.a, cell.c.d, cell.d.c) as CellKn,
          j
        ) as CellKn;
        const i9 = lifeNxN(cell.d as CellKn, j) as CellKn;
        if (j < cell.k) {
          return join(
            join(i1.d, i2.c, i4.b, i5.a),
            join(i2.d, i3.c, i5.b, i6.a),
            join(i4.d, i5.c, i7.b, i8.a),
            join(i5.d, i6.c, i8.b, i9.a)
          );
        }

        return join(
          lifeNxN(join(i1, i2, i4, i5) as CellKn, j),
          lifeNxN(join(i2, i3, i5, i6) as CellKn, j),
          lifeNxN(join(i4, i5, i7, i8) as CellKn, j),
          lifeNxN(join(i5, i6, i8, i9) as CellKn, j)
        );
      })()
    );
  }
  return cell.next.get(j)!;
}

let nodeCache = new Map<number, (CellK1 | CellKn)[]>();
const zeroCache: Cell[] = [];

function hash(a: number, b: number, c: number, d: number, k: number) {
  return (((((a * 23) ^ b) * 23) ^ c) * 23) ^ d;
}

export function join(a: Cell, b: Cell, c: Cell, d: Cell): CellK1 | CellKn {
  const h = hash(a.hash, b.hash, c.hash, d.hash, a.k);
  if (!nodeCache.has(h)) {
    nodeCache.set(h, []);
  }
  const arr = nodeCache.get(h);
  let found = arr?.find(
    (cell) => cell.a === a && cell.b === b && cell.c === c && cell.d === d
  );
  if (found == null) {
    found = {
      a,
      b,
      c,
      d,
      hash: h,
      n: a.n + b.n + c.n + d.n,
      k: a.k + 1,
    };
    arr?.push(found);
    if (nodeCache.size > 1 << 16) {
    }
  }
  return found;
}

export function getZero(k: number): Cell {
  if (k <= 0) {
    return Dead;
  }
  if (zeroCache[k] == null) {
    const z = getZero(k - 1);
    zeroCache[k] = join(z, z, z, z);
  }
  return zeroCache[k];
}

function cellToPoint({ x, y, cell }: PointCell, k: number): ScaledPoint[] {
  if (cell.k <= k) {
    if (cell.n == 0) {
      return [];
    }
    return [
      {
        x: x / (1 << cell.k),
        y: y / (1 << cell.k),
        scale: cell.n / (1 << (2 * cell.k)),
      },
    ];
  }
  const size = 1 << (cell.k - 1);
  return [
    ...cellToPoint({ x, y, cell: (cell as CellKn).a }, k),
    ...cellToPoint({ x: x + size, y, cell: (cell as CellKn).b }, k),
    ...cellToPoint({ x, y: y + size, cell: (cell as CellKn).c }, k),
    ...cellToPoint({ x: x + size, y: y + size, cell: (cell as CellKn).d }, k),
  ];
}

type BaseCell = {
  hash: number;
  n: number;
  k: number;
};

type CellK1 = BaseCell & {
  a: BaseCell;
  b: BaseCell;
  c: BaseCell;
  d: BaseCell;
};

type CellKn = BaseCell &
  (
    | {
        a: CellK1;
        b: CellK1;
        c: CellK1;
        d: CellK1;
      }
    | {
        a: CellKn;
        b: CellKn;
        c: CellKn;
        d: CellKn;
      }
  ) & {
    next?: Map<number, CellK1 | CellKn>;
  };

export type Cell = BaseCell | CellK1 | CellKn;

const Alive = {
  hash: 1,
  n: 1,
  k: 0,
};

const Dead = {
  hash: 0,
  n: 0,
  k: 0,
};

type Point = {
  x: number;
  y: number;
};

type PointCell = Point & {
  cell: Cell;
};

type ScaledPoint = Point & {
  scale: number;
};
