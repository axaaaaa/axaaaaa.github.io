<template>
  <section aria-label="文本去重工具">
    <p class="tool-note">按行比对 A 和 B，两边都有的行从 C 中移除。保留其余行的原文和顺序，同一行只输出一次。文本仅在当前浏览器处理。</p>
    <div class="options">
      <label>输出方式
        <select v-model="mode">
          <option value="both">保留 A 和 B 各自独有的行</option>
          <option value="a-only">只保留 A 中不在 B 的行（A − B）</option>
        </select>
      </label>
      <label><input v-model="trim" type="checkbox"> 忽略首尾空白</label>
      <label><input v-model="ignoreCase" type="checkbox"> 忽略大小写</label>
      <label><input v-model="skipBlank" type="checkbox"> 跳过空白行</label>
    </div>
    <div class="editors">
      <label class="tool-label">文本 A<textarea v-model="a" spellcheck="false" placeholder="粘贴第一组文本，每行一条"></textarea></label>
      <label class="tool-label">文本 B<textarea v-model="b" spellcheck="false" placeholder="粘贴第二组文本，每行一条"></textarea></label>
    </div>
    <label class="tool-label">结果 C<textarea ref="output" :value="result.text" readonly spellcheck="false" placeholder="A、B 比对后的结果会自动显示在这里"></textarea></label>
    <p class="tool-note">A、B 共同项 {{ result.shared }} 条 · C 保留 {{ result.count }} 行</p>
    <div class="tool-actions">
      <button type="button" :disabled="!result.text" @click="copy">复制结果</button>
      <button type="button" :disabled="!a && !b" @click="a = ''; b = ''">清空 A 和 B</button>
    </div>
    <p v-if="message" role="status">{{ message }}</p>
  </section>
</template>

<script>
import { compareLines } from '../../utils/text-dedup.mjs';

export default {
  name: 'TextDedupTool',
  data: () => ({ a: '', b: '', mode: 'both', trim: false, ignoreCase: false, skipBlank: true, message: '' }),
  computed: {
    result() {
      return compareLines(this.a, this.b, { mode: this.mode, trim: this.trim, ignoreCase: this.ignoreCase, skipBlank: this.skipBlank });
    }
  },
  watch: { result() { this.message = ''; } },
  methods: {
    async copy() {
      try {
        await navigator.clipboard.writeText(this.result.text);
        this.message = '去重结果已复制';
      } catch {
        this.$refs.output.select();
        this.message = '已选中结果，请手动复制';
      }
    }
  }
};
</script>

<style scoped>
.options { display: flex; flex-wrap: wrap; gap: 10px 20px; margin: 12px 0; }
.options label { display: inline-flex; align-items: center; gap: 4px; }
.editors { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-bottom: 12px; }
textarea { min-height: 180px; width: 100%; resize: vertical; }
@media (max-width: 650px) { .editors { grid-template-columns: minmax(0, 1fr); } }
</style>
