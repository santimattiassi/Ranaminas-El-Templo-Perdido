# 🐸 RanaMinas: El Templo Perdido 💣

![Version](https://img.shields.io/badge/Versión-1.0-emerald)
![Plataforma](https://img.shields.io/badge/Plataforma-Windows%20%7C%20Linux-blue)
![Tecnología](https://img.shields.io/badge/Tecnología-HTML5%20%7C%20Electron-yellow)

**RanaMinas** no es el clásico Buscaminas de tu sistema operativo. Es una fusión táctica que toma la lógica deductiva del *Minesweeper* y la inyecta con exploración RPG, gestión de inventario y combates dinámicos contra Jefes en tiempo real. 

Diseñado con tecnologías web puras, empaquetado para escritorio y renderizado a 60 FPS, todo sin depender de motores externos.

---

## ⚔️ Mecánicas de Juego

* **🗺️ Fusión Buscaminas + RPG:** Controlá a tu rana aventurera, limpia tableros plagados de trampas y recolectá oro en ruinas olvidadas.
* **🛡️ Generación Diferida Segura:** Adiós a perder en el primer clic. El motor calcula un "radio de seguridad" en tu movimiento inicial para garantizar un arranque justo.
* **🌊 Revelado en Cascada (Flood Fill):** Algoritmo clásico hiper-optimizado que despeja zonas seguras adyacentes al instante.
* **🏔️ 6 Biomas Temáticos:** Explorá el Pantano, Bosque, Desierto, Ciudad, Nieve y Montaña. Cada bioma cuenta con 5 niveles de dificultad progresiva y su propio ecosistema visual.
* **🔥 Combates contra Jefes en Tiempo Real:** El nivel 5 de cada bioma transforma el juego. Esquivá proyectiles matemáticamente teledirigidos por el Boss mientras intentás resolver el tablero para sobrevivir.
* **🎒 Tienda y HUD Dinámico:** Gastá tu oro en Vidas Extra, Escudos de Faraday y Escáneres de Pulso para afrontar las expediciones más duras.

---

## 🎸 La Joya Técnica: Motor de Sonido Procedural

Este juego **no carga ni un solo archivo `.mp3` o `.wav`**. Todo el entorno sonoro se sintetiza en tiempo real mediante código usando la **Web Audio API** nativa:

- **Síntesis Retro:** Melodías de 8-bits mediante ondas cuadradas/triangulares y síntesis FM para efectos metálicos.
- **Percusión Dinámica:** Simulación física de instrumentos acústicos y ruido blanco filtrado para las explosiones.
- **Lookahead Scheduler:** Un secuenciador de audio personalizado, completamente inmune al lag del motor de JavaScript, que sincroniza las notas usando el reloj interno del hardware de audio.
- **Música Reactiva:** El *tempo* y la escala cromática cambian dinámicamente según la tensión del juego (ej. al entrar en la cámara del Jefe).

---

## 💻 Arquitectura y Stack Tecnológico

Desarrollado con la filosofía de **cero dependencias de ejecución pesadas**:

* **Motor Gráfico:** HTML5 Canvas 2D + JavaScript Vanilla. Físicas de partículas, *screen shake* y *scroll Parallax* renderizados a puro código.
* **UI / UX:** HUD flotante construido con **Tailwind CSS** (vía CDN), aplicando efectos modernos de *glassmorphism* (desenfoque de fondo) que contrastan con la estética retro.
* **Desktop Wrapper:** Empaquetado multiplataforma nativo utilizando **Electron**, sin barras de menús invasivas para una experiencia 100% inmersiva.

---

## 🕹️ Cómo Jugar

1. **Explorar:** Hacé clic en cualquier casilla oculta para que la rana avance. El primer paso siempre es seguro.
2. **Deducir:** Los números revelados te indican cuántas minas hay en las 8 casillas adyacentes.
3. **Marcar:** Usá `Clic Derecho` (o la tecla `Espacio` para alternar herramientas) y colocá una 🚩 donde estés seguro de que hay peligro.
4. **Comprar:** Usá el panel lateral para comprar mejoras tácticas con el oro recolectado.
5. **Sobrevivir al Jefe:** En el nivel 5, no te quedes quieto. Revelá el tablero mientras esquivás el fuego enemigo.

---

## 🛠️ Instalación y Compilación

El proyecto está listo para clonar, jugar o compilar en tu propia máquina. Asegurate de tener [Node.js](https://nodejs.org/) instalado.

### 1. Instalar dependencias e iniciar en desarrollo
```bash
# Instalar dependencias
npm install

# Iniciar el juego en modo desarrollo
npm start
```

### 2. Compilar ejecutables para producción
```bash
# Compilar para Linux (.deb y .AppImage portable)
npm run build:linux

# Compilar para Windows (.exe instalador y portable)
npm run build
```
