/**
 * Entidades del juego
 * @module entities
 */
export class Particle {
    constructor(x, y, color, type = 'spark') {
        this.x = x; this.y = y; this.vx = (Math.random() - 0.5) * 8; this.vy = (Math.random() - 0.5) * 8 - (type === 'heart' ? 3 : 0);
        this.color = color; this.life = 1.0; this.decay = 0.015 + Math.random() * 0.02; this.size = 2 + Math.random() * 5; this.type = type; this.history = [];
    }
    update() {
        this.history.push({ x: this.x, y: this.y }); if (this.history.length > 6) this.history.shift();
        this.x += this.vx; this.y += this.vy;
        if (this.type === 'heart') this.vy -= 0.05; else if (this.type === 'star') this.vy += 0.05; else this.vy += 0.2;
        this.life -= this.decay;
    }
    draw(ctx) {
        ctx.save(); ctx.globalAlpha = this.life;
        if (this.type === 'heart') { ctx.fillStyle = this.color; ctx.font = `${this.size * 3}px Arial`; ctx.fillText('❤️', this.x, this.y); }
        else if (this.type === 'star') { ctx.fillStyle = this.color; ctx.font = `${this.size * 2}px Arial`; ctx.fillText('⭐', this.x, this.y); }
        else {
            if (this.history.length > 1) {
                ctx.beginPath(); ctx.moveTo(this.history[0].x, this.history[0].y); for (let i = 1; i < this.history.length; i++) ctx.lineTo(this.history[i].x, this.history[i].y);
                ctx.strokeStyle = this.color; ctx.lineWidth = this.size; ctx.lineCap = 'round'; ctx.stroke();
            } else { ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); }
        }
        ctx.restore();
    }
}
export class StoneProjectile {
    constructor(startX, startY, targetX, targetY) {
        this.x = startX; this.y = startY; this.targetX = targetX; this.targetY = targetY; this.progress = 0; this.size = 8;
        this.angle = Math.random() * Math.PI * 2; this.rotSpeed = (Math.random() - 0.5) * 0.1; this.curX = startX; this.curY = startY;
    }
    update() {
        this.progress += 0.02; if (this.progress > 1) this.progress = 1;
        const t = this.progress; this.curX = (1 - t) * this.x + t * this.targetX;
        const lineY = (1 - t) * this.y + t * this.targetY; const arcHeight = 120 * Math.sin(t * Math.PI); this.curY = lineY - arcHeight;
        this.angle += this.rotSpeed;
    }
    draw(ctx) {
        ctx.save(); ctx.translate(this.curX, this.curY); ctx.rotate(this.angle);
        ctx.fillStyle = '#64748b'; ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(-this.size, 0); ctx.lineTo(-this.size / 2, -this.size); ctx.lineTo(this.size / 2, -this.size); ctx.lineTo(this.size, -this.size / 2); ctx.lineTo(this.size, this.size / 2); ctx.lineTo(0, this.size); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#94a3b8'; ctx.beginPath(); ctx.ellipse(-this.size / 3, -this.size / 3, this.size / 3, this.size / 4, 0.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
}