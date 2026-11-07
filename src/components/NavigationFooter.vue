<template>
  <footer class="footer" :class="{ 'dark-theme': currentTheme === 'dark' }">
    <div class="footer-wrapper">
      
      <div class="footer-top">
        <div class="social-links">
          <a href="https://github.com" target="_blank" title="GitHub" class="social-link">
            <el-icon><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></el-icon>
          </a>
        </div>
      </div>

      <div class="footer-middle">
        <div class="stats-item">
          <span class="label">建站时间</span>
          <time class="value" :datetime="siteCreatedDate">{{ siteCreatedDate }}</time>
        </div>
        <div class="divider">/</div>
        <div class="stats-item">
          <span class="label">收录分类</span>
          <span class="value">{{ totalCategories }}</span>
        </div>
        <div class="divider">/</div>
        <div class="stats-item">
          <span class="label">收录链接</span>
          <span class="value">{{ totalLinks }}</span>
        </div>
        <div class="divider">/</div>
        <div class="stats-item">
          <span class="label">运行天数</span>
          <span class="value">{{ runningDays }}</span>
        </div>
        <div class="divider">/</div>
        <div class="stats-item">
          <span class="label" title="本站最近一次构建日期（北京时间）">最后更新</span>
          <span class="value">{{ lastUpdateTime }}</span>
        </div>
      </div>

      <div class="public-visits" role="status" aria-live="polite" title="PV 为页面访问次数，不是独立人数；第三方统计可能受网络、拦截器及服务可用性影响">
        <span>本站累计访问</span><strong>{{ visitText }}</strong>
        <span id="busuanzi_value_site_pv" hidden aria-hidden="true"></span>
        <a href="https://busuanzi.ibruce.info/" target="_blank" rel="noopener noreferrer">不蒜子统计</a>
      </div>
      <p class="visit-note">PV 访问次数，重复访问会累计；接入后开始统计。统计由第三方服务处理。</p>
      <div class="footer-bottom">
        <div class="footer-slogan">去往心之所向。</div>
        <div class="footer-copyright">
          Copyright © {{ copyrightRange }} Navigation Site. All Rights Reserved.
        </div>
      </div>

    </div>
  </footer>
</template>

<script>
import {canCountVisits,loadVisitCount} from '../utils/visit-counter.mjs';
import { navData } from "../nav-data.js"

const SITE_CREATED_DATE = '2024-11-23';

export default {
  name: 'NavigationFooter',
  props: {
    currentTheme: { type: String, required: true }
  },
  data: () => ({visitState:'loading',visitCount:'',visitDisposed:false}),
  async mounted() {
    if(!canCountVisits(window.location.hostname)){this.visitState='local';return;}
    try {const count=await loadVisitCount();if(!this.visitDisposed){this.visitCount=count;this.visitState='ready';}}
    catch {if(!this.visitDisposed)this.visitState='error';}
  },
  beforeUnmount(){this.visitDisposed=true;},
  computed: {
    siteCreatedDate() { return SITE_CREATED_DATE; },
    visitText(){return this.visitState==='ready'?`${this.visitCount} 次`:this.visitState==='local'?'上线后统计':this.visitState==='error'?'暂时不可用':'加载中…';},
    totalCategories() {
      return navData.length;
    },
    totalLinks() {
      return navData.reduce((total, category) => {
        let count = 0;
        if (category.subCategories) {
          count += category.subCategories.reduce((subTotal, sub) => {
            return subTotal + (sub.links ? sub.links.length : 0);
          }, 0);
        }
        if (category.links) {
          count += category.links.length;
        }
        return total + count;
      }, 0);
    },
    // 网站运行天数
    runningDays() {
      const startDate = new Date(SITE_CREATED_DATE); // 网站创建日期：2024年11月23日
      const today = new Date();
      const diffTime = Math.abs(today - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays + ' 天';
    },
    // 版权年份区间：建站年份 - 当前年份（同年则只显示一年）
    copyrightRange() {
      const startYear = Number(SITE_CREATED_DATE.slice(0, 4)); // 与建站日期保持一致
      const currentYear = new Date().getFullYear();
      return startYear === currentYear ? String(startYear) : `${startYear}-${currentYear}`;
    },
    lastUpdateTime() {
      // 构建时注入，访问日期和访客时区均不影响显示。
      const timestamp = process.env.VUE_APP_BUILD_TIME;
      const builtAt = timestamp ? new Date(timestamp) : null;
      if (!builtAt || Number.isNaN(builtAt.getTime())) return '暂无构建记录';
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric', month: '2-digit', day: '2-digit'
      }).formatToParts(builtAt);
      const value = type => parts.find(part => part.type === type).value;
      return [value('year'), value('month'), value('day')].join('-');
    }
  }
}
</script>

<style scoped>
.public-visits{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:8px;font-size:12px;color:var(--el-text-color-secondary,#909399)}.public-visits strong{font-variant-numeric:tabular-nums;color:var(--ui-accent,#398c5a);font-weight:600}.public-visits a{font-size:10px;color:inherit;text-decoration:none;opacity:.75}.public-visits a:hover{text-decoration:underline}.visit-note{margin:-8px 0 0;text-align:center;font-size:10px;line-height:1.7;color:var(--el-text-color-secondary,#909399)}
.footer {
  width: 100%;
  background: #fff;
  border-top: 1px solid #e4e7ed;
  margin-top: 40px;
  padding: 24px 20px;
}

.footer-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.social-links {
  display: flex;
  gap: 16px;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: #909399;
  text-decoration: none;
}

.social-link:hover {
  color: #409EFF;
}

.social-link svg { width: 18px; height: 18px; }

.footer-middle {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #909399;
}

.stats-item { display: flex; gap: 4px; align-items: baseline; }
.stats-item .value { color: #606266; font-weight: 500; }
.divider { color: #dcdfe6; }

.footer-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}


.footer-slogan {
  font-size: 14px;
  color: #909399;
  letter-spacing: 2px;
  margin-top: 8px;
}

.footer-copyright {
  font-size: 12px;
  color: #c0c4cc;
  letter-spacing: 0.5px;
}

/* 暗黑模式 - 黑客帝国绿 */
.footer.dark-theme {
  background: #0a0a0a;
  border-top-color: rgba(0, 255, 65, 0.2);
}

.dark-theme .social-link:hover,
.dark-theme .stats-item .value {
  color: var(--dark-text-link, #39ff14);
}

.dark-theme .divider { color: var(--dark-text-muted, #008822); }

.dark-theme .stats-item .label,
.dark-theme .footer-middle,
.dark-theme .footer-slogan,
.dark-theme .footer-copyright {
  color: var(--dark-text-muted, #008822);
}

@media (max-width: 768px) {
  .footer-middle { flex-wrap: wrap; justify-content: center; }
}
</style>