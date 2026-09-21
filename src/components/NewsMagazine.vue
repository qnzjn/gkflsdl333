<template>
  <div class="magazine-container">
    <!-- 1. 기사 상세 페이지 -->
    <ArticleDetailView 
      v-if="currentSelectedArticle" 
      :article="currentSelectedArticle" 
      @back="currentSelectedArticle = null" 
    />

    <!-- 2. 매거진 메인 리스트 플로우 -->
    <div v-else class="magazine-main-flow">
      <!-- 5분 주기 실시간 자동 갱신 알림 및 컨트롤 바 -->
      <section class="live-scheduler-bar">
        <div class="scheduler-left">
          <span class="live-feed-icon">⚡</span>
          <span class="scheduler-title">5분 주기 실시간 뉴스 자동 갱신</span>
          <span class="countdown-badge">
            다음 갱신: <strong>{{ formattedCountdown }}</strong>
          </span>
        </div>
        <div class="scheduler-right">
          <span class="total-count-tag">실시간 기사 <strong>{{ articles.length }}</strong>건</span>
          <button class="manual-refresh-btn" @click="handleManualRefresh" :class="{ spinning: isRefreshing }">
            <span class="refresh-icon">🔄</span>
            최신 뉴스 10개 즉시 발행
          </button>
        </div>
      </section>

      <!-- 상단 실시간 긴급 속보 띠 (자동 회전 + 수동 탐색) -->
      <section v-if="breakingList.length > 0" class="breaking-ticker">
        <div class="ticker-badge">
          <span class="pulse-dot red"></span>
          속보
        </div>
        
        <div class="ticker-content" @click="selectArticle(currentBreakingArticle)">
          <transition name="fade-slide" mode="out-in">
            <span :key="currentBreakingIndex" class="ticker-text">
              <strong class="breaking-cat">[{{ currentBreakingArticle?.categoryName }}]</strong>
              {{ currentBreakingArticle?.title }}
            </span>
          </transition>
        </div>

        <div class="ticker-nav">
          <button class="ticker-btn" @click.stop="prevBreaking" title="이전 속보">◀</button>
          <span class="ticker-page">{{ currentBreakingIndex + 1 }}/{{ breakingList.length }}</span>
          <button class="ticker-btn" @click.stop="nextBreaking" title="다음 속보">▶</button>
        </div>
      </section>

      <!-- 매거진 메인 섹션: 톱 스토리 + 실시간 인기 랭킹 TOP 10 -->
      <section class="hero-section">
        <!-- 좌측: 메인 헤드라인 톱 기사 (고화질 실사 썸네일) -->
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
            <span v-if="heroArticle.isNew" class="new-tag">NEW</span>
          </div>
          <div class="hero-content">
            <div class="article-meta">
              <span class="date-text">{{ heroArticle.date }}</span>
              <span class="views-label">👀 조회 {{ heroArticle.views.toLocaleString() }}</span>
              <button 
                class="card-like-pill" 
                :class="{ active: heroArticle.isLiked }"
                @click.stop="handleCardLike(heroArticle)"
                title="좋아요"
              >
                <span>{{ heroArticle.isLiked ? '❤️' : '🤍' }}</span>
                <strong>{{ heroArticle.likes.toLocaleString() }}</strong>
              </button>
            </div>
            <h2 class="hero-title">{{ heroArticle.title }}</h2>
            <p class="hero-summary">{{ heroArticle.summary }}</p>
            <div class="hero-footer">
              <span class="author-label">✍️ {{ heroArticle.author }}</span>
              <span class="read-btn">전문 읽기 →</span>
            </div>
          </div>
        </article>

        <!-- 우측: 실시간 인기 뉴스 TOP 10 (조회수 + 좋아요 실시간 랭킹) -->
        <aside class="ranking-aside">
          <div class="ranking-header">
            <div class="ranking-title-wrap">
              <h3 class="ranking-title">🔥 실시간 인기 뉴스 TOP 10</h3>
              <span class="ranking-badge-live">LIVE 집계</span>
            </div>
            <span class="ranking-sub">조회수·좋아요 실시간 반영</span>
          </div>

          <ol class="ranking-list">
            <li 
              v-for="(item, idx) in topRankedArticles" 
              :key="item.id" 
              class="ranking-item"
              @click="selectArticle(item)"
            >
              <!-- 순위 배지 (1~3위 금은동) -->
              <span class="rank-num" :class="{ gold: idx === 0, silver: idx === 1, bronze: idx === 2, top: idx < 3 }">
                {{ idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : idx + 1 }}
              </span>
              
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
                <div class="rank-cat-row">
                  <span class="rank-cat">{{ item.categoryName }}</span>
                  <span class="rank-trend" v-if="idx < 3">🔥 급상승</span>
                  <span class="rank-trend new" v-else-if="item.isNew">NEW</span>
                </div>
                <h4 class="rank-title">{{ item.title }}</h4>
                <div class="rank-stats">
                  <span class="rank-view">👀 {{ item.views.toLocaleString() }}</span>
                  <span class="rank-like">❤️ {{ item.likes.toLocaleString() }}</span>
                </div>
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

      <!-- 매거진 카드 그리드 레이아웃 (전체 실사 뉴스 카드) -->
      <section class="grid-section">
        <div class="articles-grid">
          <article 
            v-for="item in filteredArticles" 
            :key="item.id" 
            class="magazine-card"
            @click="selectArticle(item)"
          >
            <!-- 카드 실사 썸네일 -->
            <div class="card-visual">
              <img 
                :src="item.thumbnail" 
                :alt="item.title" 
                class="card-img" 
                loading="lazy" 
                @error="handleImageFallback($event, item.category)"
              />
              <span class="card-cat-badge">{{ item.categoryName }}</span>
              <span v-if="item.isNew" class="card-new-badge">NEW</span>
            </div>
            
            <div class="card-body">
              <div class="card-meta">
                <span class="card-date">{{ item.date }}</span>
                <div class="card-indicators">
                  <span class="card-views">👀 {{ item.views.toLocaleString() }}</span>
                  <button 
                    class="card-like-mini" 
                    :class="{ active: item.isLiked }"
                    @click.stop="handleCardLike(item)"
                    title="좋아요"
                  >
                    <span>{{ item.isLiked ? '❤️' : '🤍' }}</span>
                    <span>{{ item.likes.toLocaleString() }}</span>
                  </button>
                </div>
              </div>

              <h3 class="card-title">{{ item.title }}</h3>
              <p class="card-summary">{{ item.summary }}</p>

              <div class="card-footer">
                <span class="card-author">✍️ {{ item.author }}</span>
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { 
  articles, 
  CATEGORIES, 
  handleImageFallback, 
  recordArticleView,
  toggleArticleLike,
  nextUpdateRemaining,
  triggerNewBatchRelease
} from '../services/newsService'
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
const isRefreshing = ref(false)

watch(() => props.initialCategory, (newCat) => {
  selectedCategory.value = newCat
  currentSelectedArticle.value = null
})

// 5분 카운트다운 포맷 (MM:SS)
const formattedCountdown = computed(() => {
  const m = Math.floor(nextUpdateRemaining.value / 60)
  const s = nextUpdateRemaining.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

// 속보 목록
const breakingList = computed(() => {
  return articles.value.filter(a => a.isBreaking)
})

const currentBreakingIndex = ref(0)
const currentBreakingArticle = computed(() => {
  if (breakingList.value.length === 0) return null
  return breakingList.value[currentBreakingIndex.value % breakingList.value.length]
})

function nextBreaking() {
  if (breakingList.value.length > 0) {
    currentBreakingIndex.value = (currentBreakingIndex.value + 1) % breakingList.value.length
  }
}

function prevBreaking() {
  if (breakingList.value.length > 0) {
    currentBreakingIndex.value = (currentBreakingIndex.value - 1 + breakingList.value.length) % breakingList.value.length
  }
}

// 4.5초마다 속보 자동 롤링
let breakingTimer = null
onMounted(() => {
  breakingTimer = setInterval(() => {
    nextBreaking()
  }, 4500)
})

onUnmounted(() => {
  if (breakingTimer) clearInterval(breakingTimer)
})

// 톱 헤드라인 기사
const heroArticle = computed(() => {
  return articles.value.find(a => a.isTop) || articles.value[0]
})

// 실시간 인기 뉴스 TOP 10 (조회수 + 좋아요 점수 알고리즘)
const topRankedArticles = computed(() => {
  const scored = [...articles.value].map(item => ({
    ...item,
    popularityScore: (item.views * 1.5) + (item.likes * 5) + (item.isBreaking ? 300 : 0)
  }))
  return scored.sort((a, b) => b.popularityScore - a.popularityScore).slice(0, 10)
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
  if (!article) return
  recordArticleView(article.id)
  currentSelectedArticle.value = article
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleCardLike(article) {
  const result = toggleArticleLike(article.id)
  article.isLiked = result.liked
  article.likes = result.likes
}

function handleManualRefresh() {
  isRefreshing.value = true
  triggerNewBatchRelease()
  setTimeout(() => {
    isRefreshing.value = false
  }, 600)
}
</script>

<style scoped>
.magazine-container {
  max-width: 1120px;
  margin: 0 auto;
  padding: 16px 18px 60px;
}

/* 0. 5분 자동 스케줄러 컨트롤 바 */
.live-scheduler-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  background: linear-gradient(135deg, #064e3b, #047857);
  color: white;
  padding: 12px 18px;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(6, 78, 59, 0.15);
}

.scheduler-left {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13.5px;
}

.live-feed-icon {
  font-size: 16px;
  animation: pulse 1.5s infinite;
}

.scheduler-title {
  font-weight: 700;
  letter-spacing: -0.3px;
}

.countdown-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 3px 9px;
  border-radius: 14px;
  font-size: 12px;
}

.scheduler-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.total-count-tag {
  font-size: 12px;
  background: rgba(0, 0, 0, 0.2);
  padding: 4px 10px;
  border-radius: 12px;
}

.manual-refresh-btn {
  background: #ffffff;
  color: #064e3b;
  border: none;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12.5px;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.manual-refresh-btn:hover {
  background: #ecfdf5;
  transform: translateY(-1px);
}

.refresh-icon {
  display: inline-block;
  transition: transform 0.4s;
}

.manual-refresh-btn.spinning .refresh-icon {
  transform: rotate(360deg);
}

/* 1. 속보 롤링 티커 */
.breaking-ticker {
  background: #fff;
  border: 1.5px solid #fee2e2;
  border-radius: 12px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 22px;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.06);
}

.ticker-badge {
  background: #ef4444;
  color: white;
  font-size: 11px;
  font-weight: 800;
  padding: 4px 9px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  letter-spacing: 0.5px;
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
  cursor: pointer;
}

.ticker-text {
  font-size: 13.5px;
  font-weight: 600;
  color: #1e293b;
  display: inline-block;
}

.ticker-text:hover {
  color: #dc2626;
  text-decoration: underline;
}

.breaking-cat {
  color: #dc2626;
  margin-right: 4px;
}

.ticker-nav {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.ticker-btn {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #64748b;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}

.ticker-btn:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.ticker-page {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 600;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* 2. 메인 히어로 섹션 (톱 기사 + 실시간 인기 랭킹 TOP 10) */
.hero-section {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.hero-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.hero-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 24px -6px rgba(0, 0, 0, 0.08);
}

.hero-visual {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9.5;
  background: #0f172a;
  overflow: hidden;
}

.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.hero-card:hover .hero-img {
  transform: scale(1.03);
}

.hero-img-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%);
}

.hero-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  background: #dc2626;
  color: white;
  font-size: 11px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

.hero-cat-tag {
  position: absolute;
  top: 14px;
  right: 14px;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(4px);
  color: #34d399;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
}

.new-tag {
  position: absolute;
  bottom: 14px;
  left: 14px;
  background: #2563eb;
  color: white;
  font-size: 11px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 4px;
}

.hero-content {
  padding: 22px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.date-text {
  font-size: 13px;
  color: #64748b;
}

.views-label {
  font-size: 12.5px;
  color: #059669;
  font-weight: 600;
  background: #ecfdf5;
  padding: 2px 8px;
  border-radius: 10px;
}

.card-like-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #fff1f2;
  border: 1px solid #fecdd3;
  color: #e11d48;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.card-like-pill:hover,
.card-like-pill.active {
  background: #f43f5e;
  border-color: #f43f5e;
  color: white;
}

.hero-title {
  font-size: 21px;
  font-weight: 800;
  line-height: 1.45;
  color: #0f172a;
  margin: 0 0 12px;
  letter-spacing: -0.4px;
}

.hero-summary {
  font-size: 14.5px;
  line-height: 1.6;
  color: #475569;
  margin: 0 0 18px;
  flex: 1;
}

.hero-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 14px;
  border-top: 1px solid #f1f5f9;
}

.author-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
}

.read-btn {
  font-size: 13px;
  font-weight: 700;
  color: #059669;
}

/* 3. 우측 실시간 인기 뉴스 TOP 10 */
.ranking-aside {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.ranking-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1.5px solid #f1f5f9;
}

.ranking-title-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ranking-title {
  font-size: 17px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.3px;
}

.ranking-badge-live {
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 10px;
  animation: pulse 1.5s infinite;
}

.ranking-sub {
  font-size: 12px;
  color: #64748b;
}

.ranking-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 580px;
  overflow-y: auto;
  padding-right: 4px;
}

.ranking-list::-webkit-scrollbar {
  width: 5px;
}

.ranking-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s;
}

.ranking-item:hover {
  background: #f8fafc;
}

.rank-num {
  font-size: 14px;
  font-weight: 800;
  color: #64748b;
  min-width: 42px;
  text-align: center;
  padding: 3px 0;
  border-radius: 6px;
  background: #f1f5f9;
}

.rank-num.gold {
  background: #fef08a;
  color: #854d0e;
}

.rank-num.silver {
  background: #e2e8f0;
  color: #334155;
}

.rank-num.bronze {
  background: #fed7aa;
  color: #9a3412;
}

.rank-thumb-wrap {
  width: 54px;
  height: 54px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: #0f172a;
}

.rank-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.rank-info {
  flex: 1;
  overflow: hidden;
}

.rank-cat-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.rank-cat {
  font-size: 11px;
  font-weight: 700;
  color: #059669;
}

.rank-trend {
  font-size: 10px;
  font-weight: 700;
  color: #dc2626;
  background: #fee2e2;
  padding: 1px 5px;
  border-radius: 4px;
}

.rank-trend.new {
  color: #2563eb;
  background: #dbeafe;
}

.rank-title {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ranking-item:hover .rank-title {
  color: #059669;
}

.rank-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #64748b;
}

.rank-like {
  color: #e11d48;
}

/* 4. 카테고리 필터 탭 */
.filter-section {
  margin-bottom: 22px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 6px;
}

.filter-tabs::-webkit-scrollbar {
  display: none;
}

.filter-btn {
  background: white;
  border: 1px solid #e2e8f0;
  color: #475569;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 24px;
  cursor: pointer;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.filter-btn.active {
  background: #059669;
  border-color: #059669;
  color: white;
}

.cat-count {
  font-size: 11px;
  background: rgba(0, 0, 0, 0.08);
  padding: 2px 7px;
  border-radius: 12px;
}

.filter-btn.active .cat-count {
  background: rgba(255, 255, 255, 0.25);
  color: white;
}

/* 5. 매거진 카드 그리드 */
.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 22px;
}

.magazine-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.magazine-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px -4px rgba(0, 0, 0, 0.08);
}

.card-visual {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9.5;
  background: #0f172a;
  overflow: hidden;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.magazine-card:hover .card-img {
  transform: scale(1.04);
}

.card-cat-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(4px);
  color: #34d399;
  font-size: 11.5px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 6px;
}

.card-new-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #2563eb;
  color: white;
  font-size: 10.5px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 4px;
}

.card-body {
  padding: 18px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 12px;
}

.card-date {
  color: #64748b;
}

.card-indicators {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-views {
  color: #059669;
  font-weight: 600;
}

.card-like-mini {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: #fff1f2;
  border: 1px solid #fecdd3;
  color: #e11d48;
  font-size: 11.5px;
  padding: 2px 7px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.card-like-mini:hover,
.card-like-mini.active {
  background: #f43f5e;
  border-color: #f43f5e;
  color: white;
}

.card-title {
  font-size: 16.5px;
  font-weight: 800;
  line-height: 1.45;
  color: #0f172a;
  margin: 0 0 8px;
  letter-spacing: -0.3px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.magazine-card:hover .card-title {
  color: #059669;
}

.card-summary {
  font-size: 13.5px;
  line-height: 1.55;
  color: #475569;
  margin: 0 0 16px;
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
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
  font-size: 12.5px;
}

.card-author {
  color: #64748b;
}

.read-more {
  color: #059669;
  font-weight: 700;
}

@media (max-width: 900px) {
  .hero-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .articles-grid {
    grid-template-columns: 1fr;
  }
  .live-scheduler-bar {
    flex-direction: column;
    align-items: flex-start;
  }
  .scheduler-right {
    width: 100%;
    justify-content: space-between;
  }
  .hero-title {
    font-size: 18px;
  }
}
</style>
