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
        <span class="views-tag">👀 조회 {{ viewsCount.toLocaleString() }}</span>
        <span class="likes-tag">❤️ 좋아요 {{ likesCount.toLocaleString() }}</span>
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

    <!-- 기사 좋아요 및 소셜 액션 섹션 -->
    <section class="engagement-section">
      <div class="like-box">
        <button 
          class="like-btn" 
          :class="{ active: isLiked, animate: isAnimatingLike }"
          @click="onLikeClick"
          title="이 기사 추천하기"
        >
          <span class="heart-icon">{{ isLiked ? '❤️' : '🤍' }}</span>
          <span class="like-label">좋아요</span>
          <strong class="like-number">{{ likesCount.toLocaleString() }}</strong>
        </button>
        <span class="like-toast-text" v-if="likeFeedback">
          {{ likeFeedback }}
        </span>
        <span class="like-guide-text" v-else>
          {{ isLiked ? '회원님이 이 기사를 추천하셨습니다' : '기사가 도움이 되었다면 좋아요를 눌러 실시간 인기에 반영하세요!' }}
        </span>
      </div>

      <div class="secondary-actions">
        <button class="share-btn-large" @click="handleShare">
          <span>🔗</span> 기사 링크 복사
        </button>
      </div>
    </section>

    <!-- 하단 목록으로 돌아가기 버튼 -->
    <div class="article-footer-nav">
      <button class="footer-back-btn" @click="$emit('back')">
        ← 다른 뉴스 보러 가기 (목록)
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  handleImageFallback, 
  toggleArticleLike, 
  isArticleLiked, 
  getArticleLikes,
  getArticleViews
} from '../services/newsService'

const props = defineProps({
  article: Object
})

const emit = defineEmits(['back'])

const isLiked = ref(false)
const likesCount = ref(0)
const viewsCount = ref(0)
const isAnimatingLike = ref(false)
const likeFeedback = ref('')

// 기사 변경 시 상태 동기화
watch(() => props.article, (newArticle) => {
  if (newArticle) {
    isLiked.value = isArticleLiked(newArticle.id)
    likesCount.value = newArticle.likes || getArticleLikes(newArticle.id, newArticle.baseLikes)
    viewsCount.value = newArticle.views || getArticleViews(newArticle.id, newArticle.baseViews)
    likeFeedback.value = ''
  }
}, { immediate: true })

const paragraphs = computed(() => {
  if (!props.article?.content) return [props.article?.summary || '']
  return props.article.content.split('\n\n')
})

function onLikeClick() {
  if (!props.article) return
  isAnimatingLike.value = true
  setTimeout(() => { isAnimatingLike.value = false }, 400)

  const result = toggleArticleLike(props.article.id)
  isLiked.value = result.liked
  likesCount.value = result.likes
  props.article.likes = result.likes
  props.article.isLiked = result.liked

  if (result.liked) {
    likeFeedback.value = '🎉 좋아요를 눌렀습니다! 실시간 인기 순위에 반영됩니다.'
  } else {
    likeFeedback.value = '좋아요가 취소되었습니다.'
  }
  setTimeout(() => { likeFeedback.value = '' }, 3000)
}

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
  padding: 6px 0;
  transition: color 0.2s;
}

.back-btn:hover {
  color: #047857;
  text-decoration: underline;
}

.nav-cat {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  background: #f8fafc;
  padding: 4px 10px;
  border-radius: 6px;
}

.article-header {
  margin-bottom: 24px;
}

.article-meta-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
}

.cat-tag {
  background: #ecfdf5;
  color: #059669;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 9px;
  border-radius: 6px;
}

.date-tag {
  font-size: 13px;
  color: #64748b;
}

.views-tag {
  font-size: 13px;
  color: #475569;
  background: #f1f5f9;
  padding: 3px 8px;
  border-radius: 12px;
  font-weight: 600;
}

.likes-tag {
  font-size: 13px;
  color: #e11d48;
  background: #ffe4e6;
  padding: 3px 8px;
  border-radius: 12px;
  font-weight: 600;
}

.article-title {
  font-size: 26px;
  font-weight: 800;
  line-height: 1.45;
  color: #0f172a;
  letter-spacing: -0.5px;
  margin: 0 0 20px;
}

.author-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.author-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #059669;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 15px;
}

.author-name {
  display: block;
  font-size: 14px;
  color: #1e293b;
}

.author-dept {
  font-size: 12px;
  color: #64748b;
}

.share-action-btn {
  background: white;
  border: 1px solid #cbd5e1;
  color: #334155;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.share-action-btn:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
}

.article-main-photo {
  margin: 24px 0;
  border-radius: 14px;
  overflow: hidden;
  background: #0f172a;
  border: 1px solid #e2e8f0;
}

.photo-img {
  width: 100%;
  max-height: 480px;
  object-fit: cover;
  display: block;
}

.briefing-card {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  border-left: 5px solid #059669;
  border-radius: 10px;
  padding: 18px 20px;
  margin-bottom: 28px;
}

.briefing-badge {
  font-size: 12px;
  font-weight: 800;
  color: #047857;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.briefing-text {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.6;
  color: #064e3b;
  margin: 0;
}

.article-body {
  font-size: 16px;
  line-height: 1.85;
  color: #334155;
  letter-spacing: -0.2px;
  margin-bottom: 40px;
}

.body-p {
  margin: 0 0 18px;
  white-space: pre-line;
}

/* 기사 반응 (좋아요 + 공유) 영역 */
.engagement-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 20px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  margin-bottom: 40px;
  gap: 16px;
  text-align: center;
}

.like-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.like-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 28px;
  border-radius: 30px;
  border: 2px solid #cbd5e1;
  background: white;
  color: #334155;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.like-btn:hover {
  border-color: #f43f5e;
  color: #e11d48;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(225, 29, 72, 0.12);
}

.like-btn.active {
  background: #ffe4e6;
  border-color: #f43f5e;
  color: #e11d48;
}

.like-btn.animate {
  animation: heartPop 0.35s ease-out;
}

@keyframes heartPop {
  0% { transform: scale(1); }
  50% { transform: scale(1.18); }
  100% { transform: scale(1); }
}

.heart-icon {
  font-size: 20px;
}

.like-number {
  color: #e11d48;
  font-size: 17px;
}

.like-guide-text {
  font-size: 13px;
  color: #64748b;
}

.like-toast-text {
  font-size: 13px;
  font-weight: 700;
  color: #059669;
  background: #ecfdf5;
  padding: 4px 12px;
  border-radius: 20px;
  animation: fadeIn 0.2s;
}

.secondary-actions {
  display: flex;
  gap: 12px;
}

.share-btn-large {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.share-btn-large:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
}

.article-footer-nav {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
}

.footer-back-btn {
  background: #0f172a;
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.footer-back-btn:hover {
  background: #1e293b;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 600px) {
  .article-title {
    font-size: 22px;
  }
  .article-body {
    font-size: 15px;
  }
}
</style>
