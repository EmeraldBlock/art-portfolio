import "../vendor/matter.min.js";
const {
    Bodies,
    Body,
    Composite,
    Composites,
    Engine,
    Events,
    Mouse,
    MouseConstraint,
    Render,
    Runner,
    Vector,
} = window.Matter;

import "../vendor/confetti.browser.min.js";

const sim = document.getElementById("cloth");

let id = null;
sim.addEventListener("wheel", () => {
    sim.style.pointerEvents = "none";
    if (id != null) {
        clearTimeout(id);
    }
    id = setTimeout(() => {
        sim.style.pointerEvents = "auto";
    }, 100);
});

const { clientWidth: width, clientHeight: height } = document.documentElement;

const imageWidth = 1920;
const imageHeight = 1080;

const scale = Math.min(width * .6 / imageWidth, height * .6 / imageHeight);

const engine = Engine.create({
    gravity: {
        scale: .001 * scale / .75,
    },
});

const render = Render.create({
    element: sim,
    engine: engine,
    options: {
        wireframes: false,
        background: "transparent",
        width,
        height,
    },
});

const boxWidth = imageWidth * scale;
const boxHeight = imageHeight * scale;

const category = Body.nextCategory();
const image = Bodies.rectangle(width / 2, height / 2, boxWidth, boxHeight, {
    isStatic: true,
    collisionFilter: {
        category,
    },
    render: {
        sprite: {
            texture: `./assets/impressions.png`,
            xScale: scale,
            yScale: scale,
        },
    },
});

Composite.add(engine.world, image);

const columns = 22;
const rows = Math.ceil(columns / boxWidth * boxHeight);
const pieceWidth = boxWidth / (columns - 2);
const extrude = pieceWidth / 2;
const group = Body.nextGroup(true);

function rand(a, b) {
    return a + (b - a) * Math.random();
}

const cloth = Composites.stack(
    width / 2 - columns / 2 * pieceWidth - extrude / 2,
    height / 2 - rows / 2 * pieceWidth - extrude / 2,
    columns,
    rows,
    -extrude,
    -extrude,
    (x, y) => Bodies.rectangle(x, y, pieceWidth + extrude, pieceWidth + extrude, {
        inertia: Infinity,
        friction: .00001,
        collisionFilter: { group, mask: 1 },
        render: {
            fillStyle: `hsl(247deg,60%,${rand(20, 30)}%)`,
        },
    }),
);

Composites.mesh(cloth, columns, rows, false, { stiffness: .06, render: { visible: false }});

for (let i = 0; i < columns; ++i) {
    cloth.bodies[i].collisionFilter.mask |= category;
}
for (let i = 0; i < rows; ++i) {
    cloth.bodies[i * columns].collisionFilter.mask |= category;
    cloth.bodies[(i + 1) * columns - 1].collisionFilter.mask |= category;
}

Composite.add(engine.world, cloth);

const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: {
        angularStiffness: 0,
        render: {
            visible: false,
        },
    },
});

Composite.add(engine.world, mouseConstraint);

let win = false;
Events.on(engine, "beforeUpdate", () => {
    for (const string of cloth.constraints) {
        const length = Vector.magnitude(Vector.sub(string.bodyA.position, string.bodyB.position));
        string.stiffness = length < string.length ? 0 : .06;
    }
    if (Composite.bounds(cloth).min.y > height * 2 && !win) {
        confetti({
            spread: 70,
            origin: { y: 1 },
        });
        win = true;
    }
});

Render.run(render);

const runner = Runner.create();

Runner.run(runner, engine);
