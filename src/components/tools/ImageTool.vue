<template><section aria-label="图片小工具"><p class="tool-note">支持 PNG / JPEG / WebP / BMP / AVIF 静态图。按浏览器能力解码、压缩、缩放和居中裁剪；点击预览可取色。导出不保留原文件元数据。</p><label class="tool-label">选择图片<input type="file" accept="image/png,image/jpeg,image/webp,image/bmp,image/avif" aria-label="选择处理图片" @change="loadImage" /></label><p v-if="originalName">{{ originalName }} · {{ originalWidth }} × {{ originalHeight }} · {{ originalSize }}</p><div v-if="bitmap" class="tool-actions image-settings"><label>宽度<input v-model.number="width" type="number" min="1" max="8192" aria-label="图片宽度" @input="syncHeight" /></label><label>高度<input v-model.number="height" type="number" min="1" max="8192" aria-label="图片高度" @input="syncWidth" /></label><label><input v-model="locked" type="checkbox" />保持比例</label><label>居中裁剪<select v-model="crop" aria-label="裁剪比例" @change="updateCrop"><option value="original">原图比例</option><option value="1">1:1 方形</option><option value="1.3333333333333333">4:3</option><option value="1.7777777777777777">16:9</option></select></label><label>导出格式<select v-model="format" aria-label="图片导出格式"><option value="image/webp">WebP</option><option value="image/jpeg">JPEG</option><option value="image/png">PNG</option></select></label><label>质量 {{ quality }}%<input v-model.number="quality" type="range" min="10" max="100" aria-label="图片质量" /></label><button type="button" :disabled="processing" @click="render">生成预览</button></div><p v-if="format === 'image/jpeg' && bitmap" class="tool-note">JPEG 透明区域以白色填充；PNG 的质量滑块不影响无损编码。</p><div v-show="hasPreview" class="image-preview"><canvas ref="canvas" aria-label="图片处理预览，点击取色" @click="pickColor"></canvas></div><div v-if="outputBlob" class="tool-actions"><span>结果 {{ outputSize }} · {{ outputWidth }} × {{ outputHeight }} · {{ actualFormat }}</span><button type="button" @click="download">下载图片</button></div><div v-if="color" class="tool-actions"><span class="color-sample" :style="{ backgroundColor: color }"></span><code>{{ color }}</code><button type="button" @click="copyColor">复制颜色</button></div><p role="status">{{ message }}</p></section></template>
<script>
import { formatBytes, downloadBlob } from '../../utils/utility-tools.mjs';
export default {
  name: 'ImageTool', data: () => ({ bitmap: null, originalName: '', originalWidth: 0, originalHeight: 0, originalBytes: 0, width: 1, height: 1, locked: true, crop: 'original', format: 'image/webp', quality: 80, processing: false, request: 0, hasPreview: false, outputBlob: null, outputWidth: 0, outputHeight: 0, color: '', message: '' }),
  computed: { originalSize() { return formatBytes(this.originalBytes); }, outputSize() { return this.outputBlob ? formatBytes(this.outputBlob.size) : ''; }, ratio() { return this.crop === 'original' ? this.originalWidth / this.originalHeight : Number(this.crop); }, actualFormat() { return this.outputBlob?.type.split('/')[1].toUpperCase() || ''; } },
  beforeUnmount() { ++this.request; this.bitmap?.close(); },
  methods: {
    async loadImage(event) {
      const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
      const request = ++this.request; this.message = ''; this.processing = true;
      try {
        if (!['image/png','image/jpeg','image/webp','image/bmp','image/avif'].includes(file.type)) throw Error('请选择受支持的静态图片格式');
        if (file.size > 25 * 1024 * 1024) throw Error('请选择小于 25 MiB 的图片');
        const bitmap = await createImageBitmap(file);
        if (request !== this.request) { bitmap.close(); return; }
        if (bitmap.width * bitmap.height > 40000000) { bitmap.close(); throw Error('原图超过 4000 万像素，请先缩小图片'); }
        this.bitmap?.close(); this.bitmap = bitmap; this.originalName = file.name; this.originalBytes = file.size; this.originalWidth = bitmap.width; this.originalHeight = bitmap.height; this.crop = 'original'; this.width = Math.min(bitmap.width, 4096); this.height = Math.max(1, Math.round(this.width / this.ratio)); if (this.height > 4096) { this.height = 4096; this.width = Math.max(1, Math.round(this.height * this.ratio)); } this.locked = true; this.color = ''; this.outputBlob = null;
        await this.render();
      } catch (error) { if (request === this.request) this.message = '图片处理失败：' + error.message; }
      finally { if (request === this.request) this.processing = false; }
    },
    syncHeight() { if (this.locked && Number(this.width) > 0) this.height = Math.max(1, Math.round(this.width / this.ratio)); },
    syncWidth() { if (this.locked && Number(this.height) > 0) this.width = Math.max(1, Math.round(this.height * this.ratio)); },
    updateCrop() { this.locked = true; this.syncHeight(); },
    async render() {
      if (!this.bitmap) return;
      const request = ++this.request; this.processing = true; this.message = ''; this.outputBlob = null;
      try {
        if (![this.width, this.height].every(n => Number.isInteger(n) && n >= 1 && n <= 8192) || this.width * this.height > 24000000) throw Error('尺寸应为 1–8192 的整数，输出总像素不超过 2400 万');
        const canvas = this.$refs.canvas; canvas.width = this.width; canvas.height = this.height; const ctx = canvas.getContext('2d'); if (!ctx) throw Error('浏览器未提供画布');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (this.format === 'image/jpeg') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,canvas.width,canvas.height); }
        let sw = this.bitmap.width, sh = this.bitmap.height;
        if (this.crop !== 'original') { if (sw / sh > this.ratio) sw = sh * this.ratio; else sh = sw / this.ratio; }
        ctx.drawImage(this.bitmap, (this.bitmap.width-sw)/2, (this.bitmap.height-sh)/2, sw, sh, 0, 0, canvas.width, canvas.height);
        this.hasPreview = true; this.color = '';
        const blob = await new Promise(resolve => canvas.toBlob(resolve, this.format, this.quality / 100));
        if (request !== this.request) return;
        if (!blob) throw Error('图片编码失败'); this.outputBlob = blob; this.outputWidth = canvas.width; this.outputHeight = canvas.height; this.message = blob.type === this.format ? '预览已生成；点击图片可取色' : '浏览器不支持所选格式，已使用 ' + blob.type;
      } catch (error) { if (request === this.request) this.message = error.message; }
      finally { if (request === this.request) this.processing = false; }
    },
    pickColor(event) { const canvas = this.$refs.canvas, r = canvas.getBoundingClientRect(); const x = Math.min(canvas.width-1, Math.max(0, Math.floor((event.clientX-r.left)*canvas.width/r.width))), y = Math.min(canvas.height-1, Math.max(0, Math.floor((event.clientY-r.top)*canvas.height/r.height))); const d=canvas.getContext('2d').getImageData(x,y,1,1).data; this.color = '#' + Array.from(d).map(v=>v.toString(16).padStart(2,'0')).join(''); },
    download() { if (!this.outputBlob) return; const extension = { 'image/jpeg':'jpg','image/png':'png','image/webp':'webp' }[this.outputBlob.type] || 'png'; downloadBlob(this.outputBlob, (this.originalName.replace(/\.[^.]+$/, '') || '01-image') + '-edited.' + extension); },
    async copyColor() { try { await navigator.clipboard.writeText(this.color); this.message = '已复制颜色（HEX 含透明度）'; } catch { this.message = '复制未完成，请选择颜色文本手动复制'; } }
  }
};
</script>
