const canvas = document.getElementById('drawing-canvas');
const ctx = canvas.getContext('2d');
const clearButton = document.getElementById('clear-canvas');

let isDrawing = false;
let lastX = 0;
let lastY = 0;

function draw(event) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const currentX = event.clientX - rect.left;
    const currentY = event.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();
    
    [lastX, lastY] = [currentX, currentY];
}

function stopDrawing() {
    isDrawing = false;
    window.removeEventListener('mousemove', draw);
    window.removeEventListener('mouseup', stopDrawing);
}

canvas.addEventListener('mousedown', (event) => {
    isDrawing = true;
    
    const rect = canvas.getBoundingClientRect();
    [lastX, lastY] = [event.clientX - rect.left, event.clientY - rect.top];

    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'blue';

    window.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', stopDrawing);
});

clearButton.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});