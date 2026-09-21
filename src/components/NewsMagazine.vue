<template>
  <div class="magazine-container">
    <!-- 1. 기사 상세 페이지 (모달창 없음! 페이지 내에서 직접 표시) -->
    <ArticleDetailView 
      v-if="currentSelectedArticle" 
      :article="currentSelectedArticle" 
      @back="currentSelectedArticle = null" 
    />

    <!-- 2. 매거진 메인 리스트 플로우 -->
    <div v-else class="magazine-main-flow">
      <!-- 상단 실시간 긴급 속보 띠 (Breaking News Ticker) -->
      <section class="breaking-ticker">
        <div class="ticker-badge">
          <span class="pulse-dot red"></span>
          속보
        </div>
        <div class="ticker-content">
          <span class="ticker-text">{{ topBreakingArticle?.title }}</span>
        </div>
        <div class="scheduler-pill">
          ● 24시간 실시간 취재 데스크 가동 중
        </div>
      </section>

      <!-- 매거진 메인 섹션: 톱 스토리 + 실시간 인기 랭킹 TOP 5 -->
      <section class="hero-section">
        <!-- 좌측: 메인 헤드라인 톱 기사 (실제 고화질 사진 썸네일) -->
        <article v-if="heroArticle" class="hero-card" @click="selectArticle(heroArticle)">
          <div class="hero-visual">
            <img 
              :src="heroArticle.thumbnail" 
              :alt="heroArticle.title" 
              class="hero-img" 
              loading="lazy" 
              @error="handleImageFallback($event, heroArticle.category)"
            />
            <div class="hero-img-overlay"></div>
            <span class="hero-badge">TOP HEADLINE</span>
            <span class="hero-cat-tag">{{ heroArticle.categoryName }}</span>
          </div>
          <div class="hero-content">
            <div class="article-meta">
              <span class="date-text">{{ heroArticle.date }}</span>
              <span class="views-label">👀 조회 {{ heroArticle.views.toLocaleString() }}</span>
            </div>
            <h2 class="hero-title">{{ heroArticle.title }}</h2>
            <p class="hero-summary">{{ heroArticle.summary }}</p>
            <div class="hero-footer">
              <span class="author-label">✍️ {{ heroArticle.author }}</span>
              <span class="read-btn">전문 보기 →</span>
            </div>
          </div>
        </article>

        <!-- 우측: 실시간 가장 많이 본 생활 뉴스 TOP 5 -->
        <aside class="ranking-aside">
          <div class="ranking-header">
            <h3 class="ranking-title">🔥 실시간 인기 뉴스 TOP 5</h3>
            <span class="ranking-time">실시간 집계</span>
          </div>
          <ol class="ranking-list">
            <li 
              v-for="(item, idx) in topRankedArticles" 
              :key="item.id" 
              class="ranking-item"
              @click="selectArticle(item)"
            >
              <span class="rank-num" :class="{ top: idx < 3 }">{{ idx + 1 }}</span>
              <div class="rank-thumb-wrap">
                <img 
                  :src="item.thumbnail" 
                  :alt="item.title" 
                  class="rank-thumb" 
                  loading="lazy" 
                  @error="handleImageFallback($event, item.category)"
                />
              </div>
              <div class="rank-info">
                <span class="rank-cat">{{ item.categoryName }}</span>
                <h4 class="rank-title">{{ item.title }}</h4>
              </div>
            </li>
          </ol>
        </aside>
      </section>

      <!-- 카테고리 필터 탭 (8대 분야) -->
      <section class="filter-section">
        <div class="filter-tabs">
          <button 
            v-for="cat in categories" 
            :key="cat.id"
            :class="['filter-btn', { active: selectedCategory === cat.id }]"
            @click="selectedCategory = cat.id"
          >
            {{ cat.name }}
            <span class="cat-count">{{ getCategoryCount(cat.id) }}</span>
          </button>
        </div>
      </section>

      <!-- 매거진 카드 그리드 레이아웃 (실제 고화질 사진 썸네일 카드) -->
      <section class="grid-section">
        <div class="articles-grid">
          <article 
            v-for="item in filteredArticles" 
            :key="item.id" 
            class="magazine-card"
            @click="selectArticle(item)"
          >
            <!-- 카드 실제 사진 썸네일 -->
            <div class="card-visual">
              <img 
                :src="item.thumbnail" 
                :alt="item.title" 
                class="card-img" 
                loading="lazy" 
                @error="handleImageFallback($event, item.category)"
              />
              <span class="card-cat-badge">{{ item.categoryName }}</span>
            </div>
            <div class="card-body">
              <div class="card-meta">
                <span class="card-date">{{ item.date }}</span>
                <span class="card-views">조회 {{ item.views.toLocaleString() }}</span>
              </div>
              <h3 class="card-title">{{ item.title }}</h3>
              <p class="card-summary">{{ item.summary }}</p>
              <div class="card-footer">
                <span class="card-author">{{ item.author }}</span>
                <span class="read-more">기사 읽기 →</span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { articles, CATEGORIES, handleImageFallback } from '../services/newsService'
import ArticleDetailView from './ArticleDetailView.vue'

const props = defineProps({
  initialCategory: {
    type: String,
    default: 'all'
  }
})

const categories = CATEGORIES
const selectedCategory = ref(props.initialCategory)
const currentSelectedArticle = ref(null)

watch(() => props.initialCategory, (newCat) => {
  selectedCategory.value = newCat
  currentSelectedArticle.value = null // 카테고리 변경 시 목록으로 복귀
})

// 톱 헤드라인 기사
const heroArticle = computed(() => {
  return articles.value.find(a => a.isTop) || articles.value[0]
})

// 실시간 속보 기사
const topBreakingArticle = computed(() => {
  return articles.value.find(a => a.isBreaking) || articles.value[0]
})

// 인기 TOP 5
const topRankedArticles = computed(() => {
  return [...articles.value].sort((a, b) => b.views - a.views).slice(0, 5)
})

// 선택된 카테고리별 필터링
const filteredArticles = computed(() => {
  if (selectedCategory.value === 'all') {
    return articles.value
  }
  return articles.value.filter(a => a.category === selectedCategory.value)
})

function getCategoryCount(catId) {
  if (catId === 'all') return articles.value.length
  return articles.value.filter(a => a.category === catId).length
}

function selectArticle(article) {
  currentSelectedArticle.value = article
}
</script>

<style scoped>
.magazine-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px 20px 60px;
}

/* 1. 속보 티커 */
.breaking-ticker {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.ticker-badge {
  background: #ef4444;
  color: white;
  font-size: 11px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
}

.pulse-dot.red {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: white;
  animation: blink 1.2s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.2; }
}

.ticker-content {
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ticker-text {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
}

.scheduler-pill {
  font-size: 11px;
  color: #059669;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  padding: 3px 10px;
  border-radius: 20px;
  font-weight: 700;
  white-space: nowrap;
}

/* 2. 히어로 섹션 */
.hero-section {
  display: grid;
  grid-template-columns: 1.8fr 1.2fr;
  gap: 20px;
  margin-bottom: 32px;
}

@media (max-width: 860px) {
  .hero-section {
    grid-template-columns: 1fr;
  }
}

.hero-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
}

.hero-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(0,0,0,0.1);
}

.hero-card:hover .hero-img {
  transform: scale(1.03);
}

.hero-visual {
  height: 240px;
  position: relative;
  overflow: hidden;
  background-color: #0f172a;
}

.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.hero-img-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(15, 23, 42, 0.6) 0%, transparent 60%);
}

.hero-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 20px;
  letter-spacing: 0.5px;
}

.hero-cat-tag {
  position: absolute;
  bottom: 14px;
  left: 14px;
  background: rgba(255, 255, 255, 0.95);
  color: #059669;
  font-size: 12px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 6px;
}

.hero-content {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.date-text {
  font-size: 12px;
  color: #94a3b8;
}

.views-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
}

.hero-title {
  font-size: 21px;
  font-weight: 800;
  line-height: 1.4;
  color: #0f172a;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}

.hero-summary {
  font-size: 14px;
  line-height: 1.6;
  color: #475569;
  margin-bottom: 18px;
  flex: 1;
}

.hero-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #64748b;
  padding-top: 14px;
  border-top: 1px solid #f1f5f9;
}

.author-label {
  font-weight: 600;
}

.read-btn {
  color: #059669;
  font-weight: 700;
}

/* 랭킹 사이드바 */
.ranking-aside {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.04);
}

.ranking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.ranking-title {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
}

.ranking-time {
  font-size: 11px;
  color: #059669;
  font-weight: 600;
}

.ranking-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: background 0.15s ease, transform 0.15s ease;
}

.ranking-item:hover {
  background: #f8fafc;
  transform: translateX(3px);
}

.rank-num {
  font-size: 16px;
  font-weight: 800;
  color: #94a3b8;
  width: 18px;
  text-align: center;
}

.rank-num.top {
  color: #059669;
}

.rank-thumb-wrap {
  width: 54px;
  height: 42px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: #e2e8f0;
}

.rank-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.rank-info {
  flex: 1;
}

.rank-cat {
  font-size: 10px;
  color: #059669;
  font-weight: 700;
  display: block;
  margin-bottom: 2px;
}

.rank-title {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 3. 카테고리 필터 바 */
.filter-section {
  margin-bottom: 24px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 6px;
  -webkit-overflow-scrolling: touch;
}

.filter-btn {
  padding: 8px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s ease;
}

.filter-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.filter-btn.active {
  background: #059669;
  border-color: #059669;
  color: #ffffff;
}

.cat-count {
  font-size: 11px;
  background: rgba(0,0,0,0.06);
  padding: 1px 6px;
  border-radius: 10px;
}

.filter-btn.active .cat-count {
  background: rgba(255,255,255,0.25);
  color: #ffffff;
}

/* 4. 카드 그리드 */
.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
  gap: 24px;
}

.magazine-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
}

.magazine-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.08);
}

.magazine-card:hover .card-img {
  transform: scale(1.05);
}

.card-visual {
  height: 180px;
  position: relative;
  overflow: hidden;
  background: #0f172a;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.card-cat-badge {
  position: absolute;
  bottom: 10px;
  left: 12px;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(4px);
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 4px;
}

.card-body {
  padding: 18px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 8px;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.45;
  color: #0f172a;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-summary {
  font-size: 13px;
  line-height: 1.6;
  color: #64748b;
  margin-bottom: 16px;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.card-author {
  color: #64748b;
}

.read-more {
  color: #059669;
  font-weight: 700;
}

@media (max-width: 600px) {
  .magazine-container {
    padding: 12px 14px 40px;
  }
  .breaking-ticker {
    padding: 8px 12px;
    margin-bottom: 16px;
    gap: 8px;
  }
  .scheduler-pill {
    display: none;
  }
  .hero-visual {
    height: 190px;
  }
  .hero-content {
    padding: 16px;
  }
  .hero-title {
    font-size: 18px;
    line-height: 1.35;
  }
  .hero-summary {
    font-size: 13px;
    margin-bottom: 14px;
    -webkit-line-clamp: 2;
  }
  .articles-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .ranking-aside {
    padding: 16px;
  }
}
</style>
