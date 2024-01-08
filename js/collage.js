const lightning = document.getElementById("lightning");
const collage = document.getElementById("collage");

let t = document.timeline.currentTime / 1000;
let multiplier = 5;
function loop(ms) {
    const pt = t;
    t = ms / 1000;
    const dt = Math.min(Math.max(t - pt, 0), 1 / 30);
    // `currentTime.value` might be Chromium-specific?
    const scroll = collage.getAnimations()[0]?.currentTime?.value ?? 50;

    const target = Math.min(Math.abs(scroll / 50 - 1) * 10 - .1, 5);
    multiplier = target + (multiplier - target) * .5 ** dt;

    if (Math.random() < dt * multiplier) {
        lightning.animate(
            [
                { opacity: .5 },
                { opacity: 0 },
            ],
            {
                duration: 2000,
                easing: "cubic-bezier(0, 0.55, 0.45, 1)",
            },
        );
    }

    window.requestAnimationFrame(loop);
}
window.requestAnimationFrame(loop);
