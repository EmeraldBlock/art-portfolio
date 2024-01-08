import "../vendor/matter.min.js";
const {
    Bodies,
    Body,
    Bounds,
    Composite,
    Engine,
    Events,
    Mouse,
    MouseConstraint,
    Render,
    Runner,
    Vector,
} = window.Matter;

const sim = document.getElementById("sim");

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

const boxWidth = Math.min(width / 5, height / 3);
console.log(boxWidth);

const engine = Engine.create({
    gravity: {
        scale: .001 * boxWidth / 400,
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

function rand(a, b) {
    return a + (b - a) * Math.random();
}

const patternWidth = 504;
const boxs = new Array(8).fill().map((_, i) => Bodies.rectangle(
    width / 2 * rand(.9, 1.1),
    height / 2 * rand(.9, 1.1),
    boxWidth,
    boxWidth,
    {
        render: {
            sprite: {
                texture: `./assets/pattern/${i + 1}.png`,
                xScale: boxWidth / patternWidth,
                yScale: boxWidth / patternWidth,
            },
        },
    },
));

Composite.add(engine.world, boxs);

const border = Composite.create();

const borderWidth = 50;
const off = borderWidth / 2;

const options = {
    isStatic: true,
    render: { visible: false, },
};

Composite.add(border, [
    Bodies.rectangle(width / 2, -off, width, borderWidth, options),
    Bodies.rectangle(width / 2, height + off, width, borderWidth, options),
    Bodies.rectangle(width + off, height / 2, borderWidth, height, options),
    Bodies.rectangle(-off, height / 2, borderWidth, height, options),
]);

Composite.add(engine.world, border);

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

Events.on(engine, "beforeUpdate", () => {
    for (const box of boxs) {
        // `currentTime.value` might be Chromium-specific?
        const scroll = sim.getAnimations()[0]?.currentTime?.value ?? 50;
        box.restitution = Math.min(Math.abs(scroll / 50 - 1) * 4, 2);
        if (box.speed > 25) {
            Body.setSpeed(box, 25);
        }
        if (box.angularSpeed > .25) {
            Body.setAngularSpeed(box, .25);
        }
        if (!Bounds.overlaps(box.bounds, Composite.bounds(border))) {
            Body.setPosition(box, Vector.create(width / 2, height / 2));
            Body.setVelocity(box, Vector.create(0, 0));
            Body.setAngle(box, 0);
            Body.setAngularVelocity(box, 0);
        }
    }
});

Render.run(render);

const runner = Runner.create();

Runner.run(runner, engine);
