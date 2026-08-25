const gifShowcase = document.querySelector(".gif-showcase");

let isDragging = false;
let startX = 0;
let startScrollLeft = 0;


gifShowcase.addEventListener(
    "wheel",
    (event) => {
        if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
            event.preventDefault();
            gifShowcase.scrollLeft += event.deltaY*4;
        }
    },
    { passive: false }
);



gifShowcase.addEventListener("mousedown", (event) => {
    if (event.button !== 0) return;

    isDragging = true;

    gifShowcase.classList.add("dragging");

    startX = event.pageX;
    startScrollLeft = gifShowcase.scrollLeft;
});

window.addEventListener("mousemove", (event) => {
    if (!isDragging) return;

    event.preventDefault();

    const distance = event.pageX - startX;

    gifShowcase.scrollLeft = startScrollLeft - distance;
});

window.addEventListener("mouseup", () => {
    if (!isDragging) return;

    isDragging = false;
    gifShowcase.classList.remove("dragging");
});

gifShowcase.addEventListener("dragstart", (event) => {
    event.preventDefault();
});