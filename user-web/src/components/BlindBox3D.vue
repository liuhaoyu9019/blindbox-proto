<template>
  <div class="blind-box-3d" :class="{ opening: isOpening, opened: isOpened }" @click="$emit('click')">
    <div class="box-scene">
      <div class="box">
        <!-- Front face -->
        <div class="box-face front">
          <div class="box-inner">
            <span class="box-icon">◐</span>
          </div>
        </div>
        <!-- Back face -->
        <div class="box-face back"></div>
        <!-- Right face -->
        <div class="box-face right"></div>
        <!-- Left face -->
        <div class="box-face left"></div>
        <!-- Top face (lid) -->
        <div class="box-face top"></div>
        <!-- Bottom face -->
        <div class="box-face bottom"></div>
      </div>

      <!-- Rarity-based glow during opening -->
      <div class="box-glow" :class="[rarity]" v-if="isOpening || isOpened">
        <div class="glow-ring"></div>
        <div class="glow-ring glow-ring-2"></div>
        <div class="glow-ring glow-ring-3"></div>
        <div class="glow-ring glow-ring-4"></div>
      </div>

      <!-- Light beam -->
      <div class="light-beam" :class="[rarity]" v-if="isOpening"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Rarity } from '@/types'

defineProps<{
  isOpening: boolean
  isOpened: boolean
  rarity?: Rarity
}>()

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.blind-box-3d {
  width: 210px;
  height: 210px;
  perspective: 800px;
  cursor: pointer;
  position: relative;
  -webkit-tap-highlight-color: transparent;
}

.box-scene {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.box {
  width: 140px;
  height: 140px;
  position: relative;
  transform-style: preserve-3d;
  transform: rotateX(-8deg) rotateY(-20deg);
  transition: transform 0.6s ease;
}

.opening .box {
  animation: boxShake 0.5s ease-in-out 2;
}

.opened .box {
  transform: rotateX(-8deg) rotateY(-20deg) translateZ(-10px);
}

/* ── Box faces ── */
.box-face {
  position: absolute;
  width: 140px;
  height: 140px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(200, 200, 205, 0.3);
  backdrop-filter: blur(2px);
}

.box-face.front {
  transform: translateZ(70px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}
.box-inner {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(245,247,250,0.9));
  border-radius: 8px;
}
.box-icon {
  font-size: 48px;
  opacity: 0.7;
  color: var(--color-primary);
}

.box-face.back {
  transform: rotateY(180deg) translateZ(70px);
  background: linear-gradient(135deg, rgba(245,247,250,0.9), rgba(240,242,245,0.85));
  border-radius: 8px;
}
.box-face.right,
.box-face.left {
  width: 140px;
  height: 140px;
  background: linear-gradient(180deg, rgba(240,242,245,0.85), rgba(235,237,240,0.8));
  border-radius: 4px;
}
.box-face.right  { transform: rotateY(90deg)  translateZ(70px); }
.box-face.left   { transform: rotateY(-90deg) translateZ(70px); }

.box-face.top {
  width: 140px;
  height: 140px;
  transform: rotateX(90deg) translateZ(70px);
  background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(245,247,250,0.9));
  border-radius: 8px;
  transform-origin: bottom center;
  transition: transform 1.0s cubic-bezier(0.4, 0, 0.2, 1);
}
.opening .box-face.top {
  animation: lidOpen 1.2s ease-in-out forwards;
}
.opened .box-face.top {
  transform: rotateX(90deg) translateZ(70px) rotateX(-160deg) translateY(-40px);
}

.box-face.bottom {
  transform: rotateX(-90deg) translateZ(70px);
  background: linear-gradient(180deg, rgba(235,237,240,0.8), rgba(230,232,235,0.75));
  border-radius: 8px;
}

/* ── Frosted texture ── */
.box-face::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.6) 0%, transparent 60%);
  border-radius: inherit;
  pointer-events: none;
}

/* ── Glow effects ── */
.box-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 220px;
  height: 220px;
  pointer-events: none;
}

.glow-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 2px solid var(--color-primary-light);
  opacity: 0;
}
.glow-ring-2 { width: 70%;  height: 70%;  animation-delay: 0.2s !important; }
.glow-ring-3 { width: 50%;  height: 50%;  animation-delay: 0.4s !important; }
.glow-ring-4 { width: 120%; height: 120%; animation-delay: 0.6s !important; }

.opening .glow-ring {
  animation: glowExpand 1.5s ease-out forwards;
}

/* ── Rarity-coloured glow ── */
.rare   .glow-ring { border-color: #9FB8D4; }
.epic   .glow-ring { border-color: #B8A8D8; }
.legendary .glow-ring { border-color: #E8C87A; box-shadow: 0 0 16px rgba(232,200,122,0.6); }
.secret .glow-ring {
  border-color: #E8C87A;
  box-shadow: 0 0 24px rgba(232,200,122,0.8), 0 0 48px rgba(232,200,122,0.4);
}
.secret .glow-ring-2 { border-color: #F0D89A; }
.secret .glow-ring-3 { border-color: #F5E6C8; }
.secret .glow-ring-4 { border-color: #FFE8A0; }

/* ── Light beam ── */
.light-beam {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 200px;
  background: linear-gradient(to top, rgba(168,197,214,0.6), transparent);
  filter: blur(10px);
  opacity: 0;
  pointer-events: none;
}
.opening .light-beam {
  animation: beamUp 1.5s ease-out forwards;
}
.light-beam.rare      { background: linear-gradient(to top, rgba(159,184,212,0.6), transparent); }
.light-beam.epic      { background: linear-gradient(to top, rgba(184,168,216,0.7), transparent); }
.light-beam.legendary { background: linear-gradient(to top, rgba(232,200,122,0.8), transparent); }
.light-beam.secret    { background: linear-gradient(to top, rgba(232,200,122,0.9), rgba(255,215,0,0.3)); }

/* ── Keyframes ── */
@keyframes boxShake {
  0%, 100% { transform: rotateX(-8deg) rotateY(-20deg); }
  25%  { transform: rotateX(-5deg) rotateY(-15deg) translateX(2px); }
  50%  { transform: rotateX(-10deg) rotateY(-25deg) translateX(-2px); }
  75%  { transform: rotateX(-6deg) rotateY(-18deg) translateX(1px); }
}

@keyframes lidOpen {
  0%   { transform: rotateX(90deg) translateZ(70px); }
  30%  { transform: rotateX(90deg) translateZ(70px) rotateX(-20deg); }
  60%  { transform: rotateX(90deg) translateZ(70px) rotateX(-120deg) translateY(-15px); }
  100% { transform: rotateX(90deg) translateZ(70px) rotateX(-160deg) translateY(-40px); }
}

@keyframes glowExpand {
  0%   { transform: translate(-50%, -50%) scale(0.6); opacity: 0; }
  25%  { opacity: 0.9; }
  100% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; }
}

@keyframes beamUp {
  0%   { opacity: 0; transform: translate(-50%, -50%) scaleY(0.3); }
  25%  { opacity: 0.7; }
  100% { opacity: 0; transform: translate(-50%, -50%) scaleY(2) translateY(-30px); }
}

/* ── Touch/hover feedback ── */
.blind-box-3d:not(.opening):not(.opened):active .box {
  transform: rotateX(-8deg) rotateY(-20deg) scale(0.95);
  transition: transform 0.15s ease;
}
</style>
