<template>
  <svg :width="size" :height="size" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="life-icon">
    <defs>
      <!-- 메인 배경 그라데이션 (에메랄드 포레스트 그린) -->
      <linearGradient :id="'bgGrad-' + uid" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#10B981" />
        <stop offset="60%" stop-color="#059669" />
        <stop offset="100%" stop-color="#047857" />
      </linearGradient>
      <!-- 지붕 은은한 펄 화이트 그라데이션 -->
      <linearGradient :id="'roofGrad-' + uid" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF" />
        <stop offset="100%" stop-color="#F0FDF4" />
      </linearGradient>
      <!-- 새싹 골드 그라데이션 -->
      <linearGradient :id="'sproutGrad-' + uid" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#FBBF24" />
        <stop offset="100%" stop-color="#F59E0B" />
      </linearGradient>
      <!-- 부드러운 그림자 효과 -->
      <filter :id="'dropShadow-' + uid" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#059669" flood-opacity="0.3" />
      </filter>
    </defs>

    <!-- 배경 스퀴클 (둥근 모서리 사각형) -->
    <rect x="10" y="10" width="100" height="100" rx="26" :fill="'url(#bgGrad-' + uid + ')'" :filter="'url(#dropShadow-' + uid + ')'" />

    <!-- 상단 반사광 하이라이트 -->
    <rect x="13" y="13" width="94" height="42" rx="22" fill="white" opacity="0.15" />

    <!-- 집 (따뜻한 생활의 터전) -->
    <path d="M60 28L32 51C31 51.9 30.5 53.3 30.8 54.7C31.1 56 32.2 57 33.6 57H38V79C38 81.2 39.8 83 42 83H78C80.2 83 82 81.2 82 79V57H86.4C87.8 57 88.9 56 89.2 54.7C89.5 53.3 89 51.9 88 51L60 28Z" 
          :fill="'url(#roofGrad-' + uid + ')'" />

    <!-- 집 내부의 생활 활력 새싹 심볼 -->
    <path d="M60 76V57" :stroke="'url(#sproutGrad-' + uid + ')'" stroke-width="4.5" stroke-linecap="round" />
    <path d="M60 64C52 64 48 57 49 50C57 50 60 56 60 64Z" :fill="'url(#sproutGrad-' + uid + ')'" />
    <path d="M60 60C68 60 72 53 71 46C63 46 60 52 60 60Z" fill="#FBBF24" />

    <!-- 반짝이는 빛 포인트 -->
    <circle cx="85" cy="33" r="2.5" fill="#FEF08A" />
    <circle cx="34" cy="36" r="1.8" fill="#A7F3D0" opacity="0.8" />
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: [Number, String],
    default: 64
  }
})

// 고유 ID 생성 (SVG 그라데이션 충돌 방지)
const uid = Math.random().toString(36).substring(2, 9)
</script>

<style scoped>
.life-icon {
  display: inline-block;
  vertical-align: middle;
  transition: transform 0.25s ease;
}
.life-icon:hover {
  transform: translateY(-2px) scale(1.03);
}
</style>
