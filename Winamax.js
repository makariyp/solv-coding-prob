// Возвращает тру если линия (a,b)->(c,d) пересекается с (p,q)->(r,s)
function intersects(a, b, c, d, p, q, r, s) {
    if ((b == d) &&
        (b >= (q < s ? q : s)) &&
        (b <= (q < s ? s : q)) &&
        (p >= (a < c ? a : c)) &&
        (p <= (a < c ? c : a))) return true;
    else if ((q == s) &&
        (q >= (b < d ? b : d)) &&
        (q <= (b < d ? d : b)) &&
        (a >= (p < r ? p : r)) &&
        (a <= (p < r ? r : p))) return true;
    else if ((c == r) && (d == s)) return true;
    else return false;
};

// Проверяет пересекаются ли два пути
function across(path1, path2) {
    for (let p1 = 0; p1 < (path1.length - 1); p1++) {
        for (let p2 = 0; p2 < (path2.length - 1); p2++) {
            if (intersects(path1[p1][0], path1[p1][1], path1[p1 + 1][0], path1[p1 + 1][1],
                path2[p2][0], path2[p2][1], path2[p2 + 1][0], path2[p2 + 1][1])) return true;
        }
    }
    return false;
}

// Показывает все возможные шаги для мяча в данный момент
function step(x, y, height, width, turn) {
    let result = [];
    if ((x + turn) < width) result.push([x + turn, y]);
    if ((x - turn) >= 0) result.push([x - turn, y]);
    if ((y + turn) < height) result.push([x, y + turn]);
    if ((y - turn) >= 0) result.push([x, y - turn]);
    return result;
}

// Говорит есть ли в массиве пути без разворотов
function findturn(mass) {
    for (let i = 1; i < mass.length - 1; i++) {
        if (mass[i][0] > mass[i - 1][0] &&
            mass[i][0] > mass[i + 1][0]) return true;
        if (mass[i][0] < mass[i - 1][0] &&
            mass[i][0] < mass[i + 1][0]) return true;
        if (mass[i][1] > mass[i - 1][1] &&
            mass[i][1] > mass[i + 1][1]) return true;
        if (mass[i][1] < mass[i - 1][1] &&
            mass[i][1] < mass[i + 1][1]) return true;
    }
    return false;
}


/** 
Принимает значение х и у стартовой точки, х и у куда нужно прийти, макс кол-во шагов
Высота, ширина поля
Возвращает все возможные пути в массиве;
**/
function path(x, y, x1, y1, count, height, width, exceptions) {
    let pathes = [];
    const exc = exceptions;
    const startxy = [x, y];
    let turn = count;
    function go(x, y, x1, y1, count, height, width, exc, path = []) {
        path.push([x, y]);
        if (x == x1 && y == y1 && !findturn(path)) { // Проверяем если это конечная точка
            pathes = [...pathes, [...path]];
            return true;
        }
        // Проверяем если точка входит в исключения
        if ((exc.filter(i => i[0] == x && i[1] == y).length != 0) && (x != startxy[0] || y != startxy[1])) {
            return false;
        }
        // Если не достигли предела ходов, то идем дальше
        if (path.length <= count) {
            const ma = step(x, y, height, width, turn);
            for (let i = 0; i < ma.length; i++) {
                const xm = ma[i][0];
                const ym = ma[i][1];
                if (path.filter(i => i[0] == xm && i[1] == ym).length == 0) {
                    turn -= 1;
                    go(xm, ym, x1, y1, count, height, width, exc, path);
                    path.pop();
                    turn += 1;
                }
            }
        }
        return false;
    }
    go(x, y, x1, y1, count, height, width, exc);
    return pathes;
}

// Выдает индекс пути для каждого шарика, который не пересекает другие пути
function answer(pathes) {
    let indexes = [];
    function search(pathes, ind = [], i = 0, p = 0) {
        if (indexes.length != 0) return true;
        if (ind.length == pathes.length) {
            indexes = [...ind];
            return true;
        }
        for (let path = 0; path < pathes[i].length; path++) {
            ind.push(path);
            if (!pathes[i - 1]) {
                search(pathes, ind, i + 1);
            } else {
                let acr = false;
                for (let u = 0; u < i; u++) {
                    if (across(pathes[i][path], pathes[u][ind[u]])) {
                        acr = true;
                        break;
                    }
                }
                if (!acr) search(pathes, ind, i + 1);
            }
            ind.pop();
        }
        return false;
    }
    search(pathes);
    return indexes;
}

//высота и ширина игрового поля
var inputs = readline().split(' ');
const width = parseInt(inputs[0]);
const height = parseInt(inputs[1]);

// Массив игрового поля (матрица)
var mass = [];
for (let i = 0; i < height; i++) {
    const row = readline();
    mass.push([...row]);
    console.error(row);
}

// Находим координаты всех мячей [Кол-во ударов,x,y]
var ball = [];
for (let i = 0; i < height; i++) {
    for (let u = 0; u < width; u++) {
        if (/[0-9]/.test(mass[i][u])) ball.push({ shot: Number(mass[i][u]), x: u, y: i });
    }
}

// Координаты всех лунок [x,y]
var hole = [];
for (let i = 0; i < height; i++) {
    for (let u = 0; u < width; u++) {
        if (mass[i][u] == 'H') hole.push([u, i]);
    }
}

// Координаты воды [x,y]
var water = [];
for (let i = 0; i < height; i++) {
    for (let u = 0; u < width; u++) {
        if (mass[i][u] == 'X') water.push([u, i]);
    }
}

// Исключения: вода, лунки, мячи
var exceptions = [...hole, ...water];
for (let i = 0; i < ball.length; i++) {
    exceptions.push([ball[i].x, ball[i].y])
}

// Создаем массив из всех возможжных путей от каждого мяча в каждую лунку [0] это для первого мяча [1] для второго итд
var pathes = [];
for (let nball = 0; nball < ball.length; nball++) {
    pathes[nball] = [];
    for (let nhole = 0; nhole < hole.length; nhole++) {
        const arr = path(ball[nball].x, ball[nball].y, hole[nhole][0], hole[nhole][1], ball[nball].shot, height, width, exceptions);
        pathes[nball].push(...arr);
    }
}

// Находим индексы путей, которые не пересекаются для каждого мячика
let pathindex = answer(pathes);

// Создаем массив, куда запишем ответ
let ans = [];
for (let i = 0; i < height; i++) {
    ans[i] = [];
    for (let u = 0; u < width; u++) {
        ans[i][u] = '.';
    }
}


for (let i = 0; i < pathindex.length; i++) {
    for (let u = 0; u < (pathes[i][pathindex[i]].length - 1); u++) {
        if (pathes[i][pathindex[i]][u][0] < pathes[i][pathindex[i]][u + 1][0]) { // если х меньше след х
            for (let r = 0; r < (pathes[i][pathindex[i]][u + 1][0] - pathes[i][pathindex[i]][u][0]); r++) {
                ans[pathes[i][pathindex[i]][u][1]][pathes[i][pathindex[i]][u][0] + r] = '>';
            }
        }
        else if (pathes[i][pathindex[i]][u][0] > pathes[i][pathindex[i]][u + 1][0]) { // если х > след х
            for (let r = 0; r < (pathes[i][pathindex[i]][u][0] - pathes[i][pathindex[i]][u + 1][0]); r++) {
                ans[pathes[i][pathindex[i]][u][1]][pathes[i][pathindex[i]][u][0] - r] = '<';
            }
        }
        else if (pathes[i][pathindex[i]][u][1] > pathes[i][pathindex[i]][u + 1][1]) { // если у > след у
            for (let r = 0; r < (pathes[i][pathindex[i]][u][1] - pathes[i][pathindex[i]][u + 1][1]); r++) {
                ans[pathes[i][pathindex[i]][u][1] - r][pathes[i][pathindex[i]][u][0]] = '^';
            }
        } else {
            for (let r = 0; r < (pathes[i][pathindex[i]][u + 1][1] - pathes[i][pathindex[i]][u][1]); r++) {
                ans[pathes[i][pathindex[i]][u][1] + r][pathes[i][pathindex[i]][u][0]] = 'v';
            }
        }
    }
}

console.error('Ответ:');
for (let i = 0; i < height; i++) {
    console.log(ans[i].join(''));
}
