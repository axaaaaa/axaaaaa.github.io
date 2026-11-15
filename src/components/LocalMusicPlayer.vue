<template>
  <aside class="local-music" aria-label="音乐播放器">
    <button ref="musicTrigger" type="button" class="header-music-button" :class="{ 'is-playing': playing || onlinePlaying }"
      :aria-expanded="expanded" aria-controls="local-music-panel" :aria-label="expanded ? '收起音乐播放器' : '打开音乐播放器'"
      :title="currentTrack ? (playing ? '正在播放：' : '本机音乐：') + currentTrack.name : onlineCurrent && onlinePlaying ? '在线音乐：' + onlineCurrent.title : '音乐'"
      @click="expanded = !expanded"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V5l12-2v13M9 9l12-2"/><ellipse cx="6" cy="18" rx="3" ry="3"/><ellipse cx="18" cy="16" rx="3" ry="3"/></svg><span v-if="playing || onlinePlaying" class="playing-indicator" aria-hidden="true"></span></button>
    <section v-show="expanded" id="local-music-panel" class="music-panel" aria-label="音乐列表">
      <header class="music-heading"><div><img class="pixel-web-badge" src="../assets/pixel-badges/music.png" width="88" height="31" alt=""> <strong>音乐</strong><p>本机文件，或免费试听 Audius 在线音乐</p></div><button type="button" aria-label="关闭音乐面板" @click="closePanel">关闭</button></header>
      <nav class="music-tabs" aria-label="音乐来源"><button type="button" :aria-pressed="tab === 'local'" @click="switchTab('local')">本机音乐</button><button type="button" :aria-pressed="tab === 'online'" @click="switchTab('online')">在线音乐</button></nav>
      <div v-show="tab === 'local'" class="music-local">
        <div class="music-import"><button type="button" :disabled="restoring || saving" @click="$refs.files.click()">＋ 选择音乐</button><button type="button" :disabled="restoring || saving || !tracks.length" @click="clearTracks">清空</button></div>
        <input ref="files" class="music-file-input" type="file" accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac,.opus" multiple aria-label="选择本机音乐文件" @change="addFiles" />
        <p class="music-current" :title="currentTrack?.name">{{ currentTrack?.name || '选择你喜欢的音乐' }}</p>
        <audio ref="audio" controls preload="metadata" :loop="mode === 'single'" @ended="onEnded" @play="onLocalPlay" @pause="playing = false; saveProgress(true)" @error="onError" @volumechange="saveVolume" @loadedmetadata="restorePosition" @timeupdate="saveProgress()" @seeked="saveProgress(true)"></audio>
        <div class="music-transport"><button type="button" :disabled="!tracks.length" aria-label="上一首" @click="step(-1)">上一首</button><button type="button" :disabled="!tracks.length" @click="togglePlay">{{ playing ? '暂停' : '播放' }}</button><button type="button" :disabled="!tracks.length" aria-label="下一首" @click="step(1)">下一首</button><label>模式<select v-model="mode" aria-label="播放模式" @change="saveMode"><option value="list">列表循环</option><option value="single">单曲循环</option><option value="random">随机播放</option></select></label></div>
        <p v-if="message" class="music-message" role="status">{{ message }}</p>
        <ol v-if="tracks.length" class="music-list" aria-label="本机歌单">
          <li v-for="(track, index) in tracks" :key="track.id" :class="{ active: index === currentIndex }"><button type="button" class="track-name" :aria-current="index === currentIndex ? 'true' : undefined" :title="track.name" @click="selectTrack(index, true)">{{ index === currentIndex && playing ? '♫ ' : '' }}{{ track.name }}</button><button type="button" :disabled="saving || restoring" :aria-label="'移除 ' + track.name" @click="removeTrack(index)">×</button></li>
        </ol>
        <p v-else class="music-empty">支持多选音频文件<br />具体格式以浏览器解码能力为准</p>
        <footer>{{ restoring ? '正在恢复本地歌单…' : saving ? '正在保存到浏览器…' : storageNotice }}<br />清空会删除本地音乐 · 音乐与交互音效独立控制</footer>
      </div>
      <div v-show="tab === 'online'" class="music-online">
        <form class="music-online-search" @submit.prevent="searchOnline">
          <input v-model.trim="onlineQuery" type="search" placeholder="搜索曲名 / 歌手 / 风格" aria-label="搜索在线音乐" />
          <button type="submit" :disabled="onlineLoading">{{ onlineLoading ? '加载中…' : '搜索' }}</button>
        </form>
        <p class="music-message" role="status">{{ onlineMessage }}</p>
        <p class="music-current" :title="onlineCurrent?.title">{{ onlineCurrent ? onlineCurrent.title + ' · ' + onlineCurrent.artist : '选择一首在线音乐' }}</p>
        <audio ref="onlineAudio" controls preload="none" @play="onOnlinePlay" @pause="onlinePlaying = false" @ended="onlinePlaying = false" @error="onOnlineError"></audio>
        <ol v-if="onlineTracks.length" class="music-list music-online-list" aria-label="在线音乐列表">
          <li v-for="track in onlineTracks" :key="track.id" :class="{ active: onlineCurrent?.id === track.id }"><button type="button" class="track-name" :title="track.title" @click="playOnline(track)">{{ onlineCurrent?.id === track.id && onlinePlaying ? '♫ ' : '' }}{{ track.title }} · {{ track.artist }}</button></li>
        </ol>
        <p v-else-if="!onlineLoading" class="music-empty">在线曲库来自 Audius，可免费试听独立音乐人作品</p>
        <footer>在线音乐由 Audius 提供 · 需要联网 · 本机与在线播放会互相暂停<br />曲目版权与授权以 Audius 平台说明为准</footer>
      </div>
    </section>
  </aside>
</template>
<script>
import { loadMusicFiles, saveMusicFiles, deleteMusicFile, clearMusicFiles } from '../utils/music-storage.mjs';
export default {
  name: 'LocalMusicPlayer',
  emits: ['request-play'],
  data: () => ({ expanded: false, tab: 'local', tracks: [], currentIndex: -1, playing: false, mode: 'list', message: '', selectionRequest: 0, nextId: 0, restoring: true, saving: false, disposed: false, pendingPosition: null, lastProgressSave: 0, storageNotice: '音乐保存在当前浏览器，清除网站数据后会删除', onlineTracks: [], onlineCurrent: null, onlinePlaying: false, onlineLoading: false, onlineMessage: '', onlineQuery: '', audiusHost: '' }),
  computed: { currentTrack() { return this.tracks[this.currentIndex] || null; } },
  async mounted() {
    try {
      const volume = localStorage.getItem('navx-music-volume');
      if (volume !== null && Number.isFinite(Number(volume))) this.$refs.audio.volume = Math.max(0, Math.min(1, Number(volume)));
      const mode = localStorage.getItem('navx-music-mode');
      if (['list', 'single', 'random'].includes(mode)) this.mode = mode;
    } catch { /* Preferences are optional. */ }
    document.addEventListener('pointerdown', this.onOutsidePointer);
    document.addEventListener('keydown', this.onPanelKey);
    window.addEventListener('pagehide', this.flushProgress);
    document.addEventListener('visibilitychange', this.flushProgress);
    try {
      const saved = await loadMusicFiles();
      if (this.disposed) return;
      this.tracks = saved.map(track => ({ ...track, id: ++this.nextId, url: URL.createObjectURL(track.blob) }));
      let state = null;
      try { state = JSON.parse(localStorage.getItem('navx-music-position') || 'null'); } catch { /* Ignore corrupt preferences. */ }
      if (this.tracks.length) {
        const index = this.tracks.findIndex(track => track.key === state?.key);
        await this.selectTrack(index < 0 ? 0 : index, false, index >= 0 && Number.isFinite(state?.time) ? state.time : 0);
      }
    } catch {
      this.storageNotice = '本地存储暂不可用；新选音乐仍可在本次页面播放';
    } finally { this.restoring = false; }
  },
  beforeUnmount() {
    this.saveProgress(true);
    this.disposed = true;
    document.removeEventListener('pointerdown', this.onOutsidePointer);
    document.removeEventListener('keydown', this.onPanelKey);
    window.removeEventListener('pagehide', this.flushProgress);
    document.removeEventListener('visibilitychange', this.flushProgress);
    this.releaseTracks();
  },
  methods: {
    pauseLocal() { this.saveProgress(true); this.$refs.audio.pause(); this.playing = false; this.$refs.onlineAudio?.pause(); this.onlinePlaying = false; },
    onLocalPlay() { this.$emit('request-play'); this.playing = true; this.$refs.onlineAudio?.pause(); this.onlinePlaying = false; },
    closePanel() { this.expanded = false; this.$refs.musicTrigger?.focus(); },
    onOutsidePointer(event) { if (this.expanded && !this.$el.contains(event.target)) this.expanded = false; },
    onPanelKey(event) { if (this.expanded && event.key === 'Escape') { event.preventDefault(); this.closePanel(); } },
    switchTab(name) {
      this.tab = name;
      if (name === 'online' && !this.onlineTracks.length && !this.onlineLoading) this.loadTrending();
    },
    async getAudiusHost() {
      if (this.audiusHost) return this.audiusHost;
      try {
        const response = await fetch('https://api.audius.co', { headers: { Accept: 'application/json' } });
        if (!response.ok) throw Error(`HTTP ${response.status}`);
        const hosts = (await response.json())?.data;
        const host = Array.isArray(hosts) ? hosts.find(item => typeof item === 'string' && item.startsWith('https://')) : '';
        if (!host) throw Error('没有可用节点');
        this.audiusHost = host.replace(/\/+$/, '');
      } catch {
        this.audiusHost = 'https://discoveryprovider.audius.co';
      }
      return this.audiusHost;
    },
    async fetchAudius(path, params = {}) {
      const host = await this.getAudiusHost();
      const url = new URL(host + path);
      url.searchParams.set('app_name', 'ainavigation-site');
      for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
      const response = await fetch(url);
      if (!response.ok) throw Error(`HTTP ${response.status}`);
      return (await response.json())?.data || [];
    },
    mapAudiusTracks(list) {
      return list.filter(track => track?.id).map(track => ({ id: track.id, title: track.title || '未命名曲目', artist: track.user?.name || track.user?.handle || '未知作者' }));
    },
    async loadTrending() {
      this.onlineLoading = true;
      this.onlineMessage = '正在获取热门曲目…';
      try {
        const list = await this.fetchAudius('/v1/tracks/trending', { limit: 25 });
        this.onlineTracks = this.mapAudiusTracks(list);
        this.onlineMessage = this.onlineTracks.length ? '' : '暂时没有找到热门曲目，试试搜索';
      } catch {
        this.onlineMessage = '在线曲库加载失败，请检查网络后重试';
      } finally { this.onlineLoading = false; }
    },
    async searchOnline() {
      const query = this.onlineQuery.trim();
      if (!query) { this.onlineMessage = '请输入曲名、歌手或风格'; return; }
      this.onlineLoading = true;
      this.onlineMessage = `正在搜索“${query}”…`;
      try {
        const list = await this.fetchAudius('/v1/tracks/search', { query, limit: 25 });
        this.onlineTracks = this.mapAudiusTracks(list);
        this.onlineMessage = this.onlineTracks.length ? '' : '没有找到相关曲目，换个关键词试试';
      } catch {
        this.onlineMessage = '搜索失败，请检查网络后重试';
      } finally { this.onlineLoading = false; }
    },
    async playOnline(track) {
      const audio = this.$refs.onlineAudio;
      if (!audio) return;
      this.$refs.audio?.pause(); this.playing = false;
      this.onlineCurrent = track;
      this.onlineMessage = '';
      audio.src = `${await this.getAudiusHost()}/v1/tracks/${track.id}/stream?app_name=ainavigation-site`;
      try { await audio.play(); } catch { this.onlineMessage = '该曲目暂时无法播放，请换一首试试'; }
    },
    onOnlinePlay() { this.onlinePlaying = true; this.onlineMessage = ''; this.$emit('request-play'); },
    onOnlineError() { if (this.onlineCurrent) { this.onlinePlaying = false; this.onlineMessage = '音频加载失败，请换一首或检查网络'; } },
    async addFiles(event) {
      if (this.restoring || this.saving) return;
      this.saving = true;
      const records = [];
      let added = 0;
      for (const file of Array.from(event.target.files || [])) {
        if (!(file.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|aac|flac|opus)$/i.test(file.name))) continue;
        const key = JSON.stringify([file.name, file.size, file.lastModified]);
        if (this.tracks.some(track => track.key === key)) continue;
        const record = { key, name: file.name, blob: file, order: Math.max(Date.now(), (this.tracks.at(-1)?.order || 0) + 1) };
        records.push(record);
        this.tracks.push({ ...record, id: ++this.nextId, url: URL.createObjectURL(file) });
        added++;
      }
      event.target.value = '';
      this.message = added ? `已添加 ${added} 首音乐` : '没有新增音乐：请选择音频文件，重复文件会自动跳过';
      if (this.currentIndex < 0 && this.tracks.length) await this.selectTrack(0, false);
      try {
        if (records.length) await saveMusicFiles(records);
        if (records.length) this.storageNotice = '已保存到当前浏览器，下次打开可继续听';
      } catch {
        this.storageNotice = '本次新增音乐未保存成功，可能是存储空间不足；刷新后需重新选择';
        this.message = this.storageNotice;
      } finally { this.saving = false; }
    },
    async selectTrack(index, autoplay = false, position = 0) {
      const track = this.tracks[index];
      if (!track) return;
      const request = ++this.selectionRequest;
      const audio = this.$refs.audio;
      this.saveProgress(true);
      audio.pause(); this.playing = false;
      this.currentIndex = index; this.message = '';
      this.pendingPosition = Math.max(0, position);
      audio.src = track.url; audio.load();
      this.saveProgress(true);
      if (autoplay) {
        try { await audio.play(); } catch (error) {
          if (request === this.selectionRequest && error.name !== 'AbortError') this.message = '播放未开始，请点击播放重试或选择其他音频格式';
        }
      }
    },
    async togglePlay() {
      if (!this.currentTrack) return;
      const audio = this.$refs.audio;
      if (!audio.paused) { audio.pause(); return; }
      const request = this.selectionRequest;
      try { await audio.play(); } catch { if (request === this.selectionRequest) this.message = '播放失败，请重试或选择其他音频格式'; }
    },
    step(direction) {
      if (!this.tracks.length) return;
      let next = (this.currentIndex + direction + this.tracks.length) % this.tracks.length;
      if (this.mode === 'random' && this.tracks.length > 1) next = (this.currentIndex + 1 + Math.floor(Math.random() * (this.tracks.length - 1))) % this.tracks.length;
      this.selectTrack(next, true);
    },
    onEnded() { if (this.mode !== 'single') this.step(1); },
    onError() { if (this.currentTrack) this.message = '此音频加载或解码失败，请尝试其他文件；可点击下一首继续'; },
    async removeTrack(index) {
      if (this.saving || this.restoring) return;
      const track = this.tracks[index];
      if (!track) return;
      this.saving = true;
      try { await deleteMusicFile(track.key); }
      catch { this.message = '删除本地音乐失败，请重试'; this.saving = false; return; }
      if (this.disposed) { this.saving = false; return; }
      if (index === this.currentIndex) {
        const resume = this.playing;
        const audio = this.$refs.audio;
        ++this.selectionRequest; audio.pause(); audio.removeAttribute('src'); audio.load(); this.playing = false;
        this.tracks.splice(index, 1); this.currentIndex = -1;
        if (this.tracks.length) this.selectTrack(Math.min(index, this.tracks.length - 1), resume);
      } else { this.tracks.splice(index, 1); if (index < this.currentIndex) this.currentIndex--; }
      URL.revokeObjectURL(track.url);
      this.saving = false;
      this.saveProgress(true);
    },
    async clearTracks() {
      if (this.saving || this.restoring) return;
      this.saving = true;
      try {
        await clearMusicFiles();
        if (this.disposed) return;
        this.releaseTracks();
        try { localStorage.removeItem('navx-music-position'); } catch { /* Optional. */ }
        this.message = '已清空歌单及浏览器中保存的音乐';
        this.storageNotice = '音乐保存在当前浏览器，清除网站数据后会删除';
      } catch { this.message = '清空本地音乐失败，请重试'; }
      finally { this.saving = false; }
    },
    releaseTracks() {
      ++this.selectionRequest;
      const audio = this.$refs.audio;
      if (audio) { audio.pause(); audio.removeAttribute('src'); audio.load(); }
      this.tracks.forEach(track => URL.revokeObjectURL(track.url));
      this.tracks = []; this.currentIndex = -1; this.playing = false; this.message = '';
    },
    restorePosition() {
      const audio = this.$refs.audio;
      if (this.pendingPosition === null || !Number.isFinite(audio.duration)) return;
      audio.currentTime = Math.min(this.pendingPosition, Math.max(0, audio.duration - 0.1));
      this.pendingPosition = null;
      this.saveProgress(true);
    },
    flushProgress() { this.saveProgress(true); },
    saveProgress(force = false) {
      if (!this.currentTrack || this.disposed) return;
      const now = Date.now();
      if (!force && now - this.lastProgressSave < 1000) return;
      const time = this.pendingPosition ?? this.$refs.audio.currentTime;
      if (!Number.isFinite(time)) return;
      try {
        localStorage.setItem('navx-music-position', JSON.stringify({ key: this.currentTrack.key, time }));
        this.lastProgressSave = now;
      } catch { /* Playback remains available if preferences are full. */ }
    },
    saveVolume() { try { localStorage.setItem('navx-music-volume', String(this.$refs.audio.volume)); } catch { /* Optional. */ } },
    saveMode() { try { localStorage.setItem('navx-music-mode', this.mode); } catch { /* Optional. */ } }
  }
};
</script>
<style scoped>
.pixel-web-badge { display: inline-block; width: 88px; height: 31px; max-width: none; vertical-align: middle; image-rendering: pixelated; margin-inline-end: 6px; }


.local-music { position: relative; flex: 0 0 32px; margin: 0; min-width: 0; color: var(--el-text-color-primary, #273b30); font-size: 13px; }
.local-music button, .local-music select { font: inherit; color: inherit; border: 1px solid var(--el-border-color, #d7e4dc); background: var(--el-bg-color, #fff); border-radius: 8px; padding: 7px 10px; cursor: pointer; }
.local-music button:hover:not(:disabled) { background: var(--ui-accent-soft, #edf4ef); }
.local-music button:disabled { opacity: .4; cursor: default; }
.local-music .header-music-button { display: flex; align-items: center; justify-content: center; position: relative; width: 32px; height: 32px; padding: 3px; border: none; background: transparent; color: var(--ui-accent, #386a50); font-size: 23px; }
.playing-indicator { position: absolute; width: 5px; height: 5px; right: 2px; bottom: 3px; background: currentColor; border-radius: 50%; }
.music-panel { position: absolute; top: calc(100% + 15px); right: 0; z-index: 10010; box-sizing: border-box; width: 370px; max-width: calc(100vw - 32px); max-height: min(650px, calc(100dvh - 100px)); overflow-y: auto; padding: 18px; border: 1px solid var(--el-border-color, #d7e4dc); border-radius: 16px; background: var(--el-bg-color-overlay, #fff); box-shadow: 0 12px 45px #0003; }
.music-heading { display: flex; justify-content: space-between; align-items: start; gap: 8px; }
.music-heading strong { font-size: 17px; }
.music-heading p, .music-empty, footer { color: var(--el-text-color-secondary, #748579); font-size: 12px; line-height: 1.7; }
.music-heading p { margin: 5px 0 14px; }
.music-import, .music-transport { display: flex; flex-wrap: wrap; gap: 7px; }
.music-file-input { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
.music-current { white-space: nowrap; text-overflow: ellipsis; overflow: hidden; font-weight: 600; }
.music-panel audio { width: 100%; height: 40px; display: block; margin: 12px 0; }
.music-transport label { display: flex; align-items: center; gap: 5px; }
.music-list { list-style: none; margin: 14px 0; padding: 0; max-height: 190px; overflow-y: auto; }
.music-list li { display: flex; align-items: center; gap: 5px; margin: 4px 0; border-radius: 8px; }
.music-list .track-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: left; border-color: transparent; background: transparent; }
.music-list li.active { background: var(--ui-accent-soft, #edf4ef); color: var(--ui-accent, #386a50); }
.music-message { line-height: 1.6; color: var(--ui-accent); }
.music-tabs { display: flex; gap: 7px; margin: 0 0 12px; }
.music-tabs button[aria-pressed="true"] { border-color: var(--ui-accent, #386a50); background: var(--ui-accent-soft, #edf4ef); color: var(--ui-accent, #386a50); }
.music-online-search { display: flex; gap: 7px; }
.music-online-search input { flex: 1; min-width: 0; padding: 7px 9px; border: 1px solid var(--el-border-color, #d7e4dc); border-radius: 8px; font: inherit; color: inherit; background: var(--el-bg-color, #fff); }
.music-online-list { max-height: 240px; }
footer { border-top: 1px solid var(--el-border-color, #d7e4dc); padding-top: 10px; }
@media (max-width: 600px) { .music-panel { position: fixed; top: 72px; left: 12px; right: 12px; width: auto; max-width: none; max-height: calc(100dvh - 90px); } }
</style>
