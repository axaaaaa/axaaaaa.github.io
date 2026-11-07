<template><span><template v-for="(part, index) in parts" :key="index"><mark v-if="part.match" class="query-highlight">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template></span></template>
<script>
import { matchPinyin } from '../utils/pinyin.js';
export default {
  name: 'HighlightText',
  props: { text: { default: '' }, query: { default: '' } },
  computed: {
    parts() {
      const text = String(this.text || ''), query = String(this.query || '').trim().toLowerCase();
      if (!query) return [{text, match:false}];
      const lower = text.toLowerCase(), parts = []; let from = 0, at;
      while ((at = lower.indexOf(query, from)) !== -1) {
        if (at > from) parts.push({text:text.slice(from, at), match:false});
        parts.push({text:text.slice(at, at + query.length), match:true}); from = at + query.length;
      }
      if (!parts.length) return [{text, match:/^[a-z]+$/.test(query) && matchPinyin(text, query)}];
      if (from < text.length) parts.push({text:text.slice(from), match:false});
      return parts;
    }
  }
};
</script>
<style>
.query-highlight { background: #ffedaa; color: #754500; border-radius: 3px; padding: 0; font-weight: 600; }
.dark-theme .query-highlight, .side-navigation-dark .query-highlight, .dark-autocomplete .query-highlight { background: #635024; color: #ffe5a0; }
</style>
