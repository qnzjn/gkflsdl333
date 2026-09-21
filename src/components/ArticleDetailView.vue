<template>
  <div v-if="article" class="article-page-view">
    <!-- 상단 목록으로 돌아가기 네비게이션 -->
    <div class="reader-nav-bar">
      <button class="back-btn" @click="$emit('back')">
        ← 뉴스 목록으로 돌아가기
      </button>
      <span class="nav-cat">{{ article.categoryName }} 뉴스</span>
    </div>

    <!-- 기사 헤더 영역 -->
    <header class="article-header">
      <div class="article-meta-row">
        <span class="cat-tag">{{ article.categoryName }}</span>
        <span class="date-tag">{{ article.date }}</span>
        <span class="views-tag">조회 {{ article.views.toLocaleString() }}</span>
      </div>

      <h1 class="article-title">{{ article.title }}</h1>

      <div class="author-bar">
        <div class="author-profile">
          <div class="author-avatar">{{ article.author.charAt(0) }}</div>
          <div>
            <strong class="author-name">{{ article.author }}</strong>
            <span class="author-dept">생활정보 전문 취재데스크</span>
          </div>
        </div>
        <button class="share-action-btn" @click="handleShare">
          🔗 기사 공유
        </button>
      </div>
    </header>

    <!-- 기사 대표 고화질 보도사진 -->
    <div v-if="article.thumbnail" class="article-main-photo">
      <img 
        :src="article.thumbnail" 
        :alt="article.title" 
        class="photo-img" 
        @error="handleImageFallback($event, article.category)" 
      />
    </div>

    <!-- 3줄 핵심 요약 브리핑 카드 -->
    <div class="briefing-card">
      <div class="briefing-badge">⚡ 3줄 핵심 요약</div>
      <p class="briefing-text">{{ article.summary }}</p>
    </div>

    <!-- 기사 본문 전문 -->
    <div class="article-body">
      <p v-for="(paragraph, idx) in paragraphs" :key="idx" class="body-p">
        {{ paragraph }}
      </p>
    </div>

    <!-- 하단 목록으로 돌아가기 버튼 -->
    <div class="article-footer-nav">
      <button class="footer-back-btn" @click="$emit('back')">
        ← 다른 뉴스 보러 가기 (목록)
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { handleImageFallback } from '../services/newsService'

const props = defineProps({
  article: Object
})

const emit = defineEmits(['back'])

const paragraphs = computed(() => {
  if (!props.article?.content) return [props.article?.summary || '']
  return props.article.content.split('\n\n')
})

function handleShare() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href)
    alert('📋 기사 링크가 클립보드에 복사되었습니다!')
  }
}
</script>

<style scoped>
.article-page-view {
  max-width: 820px;
  margin: 0 auto;
  padding: 24px 20px 80px;
  animation: fadeIn 0.25s ease-out;
}

.reader-nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 14px;
  border-bottom: 1px solid #f1f5f9;
}

.back-btn {
  background: none;
  border: none;
  color: #059669;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.back-btn:hover {
  text-decoration: underline;
}

.nav-cat {
  font-size: 13px;
  color: #94a3b8;
  font-weight: 600;
}

.article-header {
  margin-bottom: 24px;
}

.article-meta-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.cat-tag {
  background: #ecfdf5;
  color: #059669;
  font-size: 12px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 4px;
}

.date-tag, .views-tag {
  font-size: 13px;
  color: #94a3b8;
}

.article-title {
  font-size: 28px;
  font-weight: 800;
  line-height: 1.4;
  color: #0f172a;
  margin-bottom: 22px;
  letter-spacing: -0.6px;
}

.author-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 18px;
  border-bottom: 1px solid #e2e8f0;
}

.author-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #0f172a;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 15px;
}

.author-name {
  display: block;
  font-size: 14px;
  color: #1e293b;
}

.author-dept {
  font-size: 12px;
  color: #94a3b8;
}

.share-action-btn {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
}

.share-action-btn:hover {
  background: #f1f5f9;
}

.article-main-photo {
  width: 100%;
  height: 420px;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 28px;
  background: #0f172a;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
}

@media (max-width: 680px) {
  .article-main-photo {
    height: 240px;
  }
}

.photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.briefing-card {
  background: #f8fafc;
  border-left: 4px solid #059669;
  border-radius: 0 12px 12px 0;
  padding: 20px;
  margin-bottom: 32px;
}

.briefing-badge {
  font-size: 13px;
  font-weight: 800;
  color: #059669;
  margin-bottom: 8px;
}

.briefing-text {
  font-size: 15px;
  line-height: 1.7;
  color: #334155;
  font-weight: 500;
}

.article-body {
  font-size: 17px;
  line-height: 1.85;
  color: #1e293b;
  margin-bottom: 48px;
}

.body-p {
  margin-bottom: 20px;
  letter-spacing: -0.2px;
  white-space: pre-line;
}

.article-footer-nav {
  text-align: center;
  padding-top: 32px;
  border-top: 1px solid #e2e8f0;
}

.footer-back-btn {
  padding: 12px 28px;
  background: #0f172a;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease;
}

.footer-back-btn:hover {
  background: #1e293b;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 600px) {
  .article-page-view {
    padding: 16px 16px 60px;
  }
  .article-title {
    font-size: 20px;
    line-height: 1.35;
  }
  .article-main-photo {
    height: 200px;
    border-radius: 12px;
    margin-bottom: 20px;
  }
  .article-body {
    font-size: 16px;
    line-height: 1.75;
    margin-bottom: 36px;
  }
  .footer-back-btn {
    width: 100%;
    padding: 14px 20px;
  }
}
</style>
