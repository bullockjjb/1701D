const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const STATE = {
    TITLE: 'TITLE',
    FLYING: 'FLYING',
    SEPARATED: 'SEPARATED',
    EXIT: 'EXIT'
};

let gameState = STATE.TITLE;

class Enterprise {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.speed = 2;
        this.saucer = { x: this.x, y: this.y - 30, r: 30 };
        this.drive = { x: this.x, y: this.y + 30, w: 40, h: 60 };
        this.separated = false;
    }

    reset() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.saucer.x = this.x;
        this.saucer.y = this.y - 30;
        this.drive.x = this.x;
        this.drive.y = this.y + 30;
        this.separated = false;
    }

    move(dx, dy) {
        this.x += dx;
        this.y += dy;
        this.saucer.x += dx;
        this.saucer.y += dy;
        this.drive.x += dx;
        this.drive.y += dy;
    }

    moveSaucer(dx, dy) {
        this.saucer.x += dx;
        this.saucer.y += dy;
    }

    moveDrive(dx, dy) {
        this.drive.x += dx;
        this.drive.y += dy;
    }

    draw() {
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // background stars simple
        drawStars();
        if (!this.separated) {
            ctx.beginPath();
            ctx.arc(this.saucer.x, this.saucer.y, this.saucer.r, 0, Math.PI * 2);
            ctx.rect(this.drive.x - this.drive.w / 2, this.drive.y - this.drive.h / 2, this.drive.w, this.drive.h);
            // nacelles
            ctx.rect(this.drive.x - this.drive.w / 2 - 12, this.drive.y + this.drive.h / 4, 10, this.drive.h / 2);
            ctx.rect(this.drive.x + this.drive.w / 2 + 2, this.drive.y + this.drive.h / 4, 10, this.drive.h / 2);
            ctx.stroke();
        } else {
            // draw saucer
            ctx.beginPath();
            ctx.arc(this.saucer.x, this.saucer.y, this.saucer.r, 0, Math.PI * 2);
            ctx.stroke();
            // draw drive
            ctx.beginPath();
            ctx.rect(this.drive.x - this.drive.w / 2, this.drive.y - this.drive.h / 2, this.drive.w, this.drive.h);
            ctx.rect(this.drive.x - this.drive.w / 2 - 12, this.drive.y + this.drive.h / 4, 10, this.drive.h / 2);
            ctx.rect(this.drive.x + this.drive.w / 2 + 2, this.drive.y + this.drive.h / 4, 10, this.drive.h / 2);
            ctx.stroke();
        }
    }

    canDock() {
        const dx = this.saucer.x - this.drive.x;
        const dy = this.saucer.y - (this.drive.y - this.drive.h / 2 - this.saucer.r);
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < 10;
    }
}

const enterprise = new Enterprise();

let keys = {};
window.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (gameState === STATE.TITLE && e.key === 'Enter') {
        gameState = STATE.FLYING;
    } else if (gameState === STATE.EXIT && e.key === 'Enter') {
        gameState = STATE.TITLE;
        enterprise.reset();
    } else if (gameState !== STATE.TITLE && e.key === 'Escape') {
        gameState = STATE.EXIT;
    } else if (gameState !== STATE.TITLE && gameState !== STATE.EXIT && e.key === ' ') {
        if (!enterprise.separated) {
            enterprise.separated = true;
            gameState = STATE.SEPARATED;
        } else if (enterprise.canDock()) {
            enterprise.separated = false;
            gameState = STATE.FLYING;
            // align positions to drive location
            enterprise.x = enterprise.drive.x;
            enterprise.y = enterprise.drive.y - 30;
            enterprise.saucer.x = enterprise.x;
            enterprise.saucer.y = enterprise.y - 30;
        }
    }
});
window.addEventListener('keyup', e => {
    delete keys[e.key];
});

function update() {
    if (gameState === STATE.FLYING) {
        let dx = 0, dy = 0;
        if (keys['ArrowLeft']) dx -= enterprise.speed;
        if (keys['ArrowRight']) dx += enterprise.speed;
        if (keys['ArrowUp']) dy -= enterprise.speed;
        if (keys['ArrowDown']) dy += enterprise.speed;
        enterprise.move(dx, dy);
    }
    if (gameState === STATE.SEPARATED) {
        let dxSaucer = 0, dySaucer = 0;
        if (keys['w'] || keys['W']) dySaucer -= enterprise.speed;
        if (keys['s'] || keys['S']) dySaucer += enterprise.speed;
        if (keys['a'] || keys['A']) dxSaucer -= enterprise.speed;
        if (keys['d'] || keys['D']) dxSaucer += enterprise.speed;
        enterprise.moveSaucer(dxSaucer, dySaucer);

        let dxDrive = 0, dyDrive = 0;
        if (keys['ArrowLeft']) dxDrive -= enterprise.speed;
        if (keys['ArrowRight']) dxDrive += enterprise.speed;
        if (keys['ArrowUp']) dyDrive -= enterprise.speed;
        if (keys['ArrowDown']) dyDrive += enterprise.speed;
        enterprise.moveDrive(dxDrive, dyDrive);
    }
}

function drawTitle() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BroTrek', canvas.width/2, canvas.height/2 - 20);
    ctx.font = '24px monospace';
    ctx.fillText('Press ENTER to Engage', canvas.width/2, canvas.height/2 + 20);
}

function drawExit() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('You have disengaged from BroTrek.', canvas.width/2, canvas.height/2 - 10);
    ctx.fillText('Press Enter to restart.', canvas.width/2, canvas.height/2 + 30);
}

function drawStars() {
    ctx.fillStyle = 'white';
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        ctx.fillRect(x, y, 1, 1);
    }
}

function loop() {
    if (gameState === STATE.TITLE) {
        drawTitle();
    } else if (gameState === STATE.EXIT) {
        drawExit();
    } else {
        update();
        enterprise.draw();
        if (enterprise.separated && enterprise.canDock()) {
            ctx.fillStyle = 'white';
            ctx.font = '16px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('Ready to Reattach - press SPACE', canvas.width/2, 20);
        } else if (enterprise.separated) {
            ctx.fillStyle = 'white';
            ctx.font = '16px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('Separated Mode', canvas.width/2, 20);
        } else {
            ctx.fillStyle = 'white';
            ctx.font = '16px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('Docked Mode', canvas.width/2, 20);
        }
        // tribute text bottom-left
        ctx.fillStyle = 'white';
        ctx.font = '14px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('Made for Dwayne, Boldly Go Brother', 10, canvas.height - 10);
    }
    requestAnimationFrame(loop);
}

loop();
