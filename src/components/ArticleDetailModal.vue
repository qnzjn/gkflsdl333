<template>
  <div v-if="article" class="modal-backdrop" @click.self="$emit('close')">
    <div class="article-modal">
      <button class="close-btn" @click="$emit('close')">×</button>

      <!-- 기사 헤더 -->
      <div class="modal-meta-bar">
        <span class="category-badge">{{ article.categoryName }}</span>
        <span class="date-text">{{ article.date }}</span>
        <span class="views-text">조회 {{ article.views.toLocaleString() }}</span>
      </div>

      <h2 class="modal-title">{{ article.title }}</h2>

      <div class="author-row">
        <div class="author-info">
          <span class="author-avatar">{{ article.author.charAt(0) }}</span>
          <div>
            <span class="author-name">{{ article.author }}</span>
            <span class="author-desc">생활정보 전문 취재데스크</span>
          </div>
        </div>
        <button class="share-btn" @click="handleShare">
          🔗 기사 공유
        </button>
      </div>

      <!-- 기사 대표 사진 썸네일 -->
      <div v-if="article.thumbnail" class="modal-thumb-box">
        <img :src="article.thumbnail" :alt="article.title" class="modal-thumb-img" />
      </div>

      <!-- 3줄 핵심 요약 카드 -->
      <div class="summary-card">
        <div class="summary-label">⚡ 3줄 핵심 요약</div>
        <p class="summary-text">{{ article.summary }}</p>
      </div>

      <!-- 본문 내용 -->
      <div class="modal-body-content">
        <p v-for="(paragraph, pIdx) in paragraphs" :key="pIdx" class="content-p">
          {{ paragraph }}
        </p>
      </div>

      <!-- 하단 액션 -->
      <div class="modal-bottom">
        <button class="bottom-close-btn" @click="$emit('close')">
          닫기 (Esc)
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  article: Object
})

const emit = defineEmits(['close'])

const paragraphs = computed(() => {
  if (!props.article?.content) return [props.article?.summary || '']
  return props.article.content.split('\n\n')
})

function handleShare() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href)
    alert('📋 기사 링크가 클립보드에 복사되었습니다. 단톡방에 공유해 보세요!')
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s ease-out;
}

.article-modal {
  background: #ffffff;
  border-radius: 16px;
  max-width: 680px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 32px 28px;
  position: relative;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: #f1f5f9;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 22px;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.modal-meta-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.category-badge {
  background: #ecfdf5;
  color: #059669;
  font-size: 12px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 4px;
}

.date-text, .views-text {
  font-size: 13px;
  color: #94a3b8;
}

.modal-title {
  font-size: 24px;
  font-weight: 800;
  line-height: 1.4;
  color: #0f172a;
  margin-bottom: 20px;
  letter-spacing: -0.5px;
}

.author-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 18px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 20px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.author-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #0f172a;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

.author-name {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.author-desc {
  font-size: 11px;
  color: #94a3b8;
}

.share-btn {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
}

.share-btn:hover {
  background: #f1f5f9;
}

.modal-thumb-box {
  width: 100%;
  height: 280px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
  background: #0f172a;
}

.modal-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.summary-card {
  background: #f8fafc;
  border-left: 4px solid #059669;
  border-radius: 0 8px 8px 0;
  padding: 16px;
  margin-bottom: 24px;
}

.summary-label {
  font-size: 12px;
  font-weight: 800;
  color: #059669;
  margin-bottom: 6px;
}

.summary-text {
  font-size: 14px;
  line-height: 1.6;
  color: #334155;
  font-weight: 500;
}

.modal-body-content {
  font-size: 16px;
  line-height: 1.8;
  color: #1e293b;
  white-space: pre-line;
}

.content-p {
  margin-bottom: 16px;
}

.modal-bottom {
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
  text-align: center;
}

.bottom-close-btn {
  padding: 10px 24px;
  background: #0f172a;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
