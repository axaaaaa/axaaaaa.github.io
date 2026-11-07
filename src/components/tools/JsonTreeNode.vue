<template><details v-if="node.children" class="json-tree-node" :open="depth < 1"><summary>{{ node.label }} <small>{{ node.value }} · {{ node.children.length }} 项</small></summary><div class="json-tree-children"><JsonTreeNode v-for="child in node.children" :key="child.id" :node="child" :depth="depth + 1" /></div></details><div v-else class="json-tree-leaf"><strong>{{ node.label }}</strong> : <code>{{ node.value }}</code></div></template>
<script>
export default { name: 'JsonTreeNode', props: { node: { type: Object, required: true }, depth: { type: Number, default: 0 } } };
</script>
<style scoped>
.json-tree-node,.json-tree-leaf { margin: 7px 0; overflow-wrap: anywhere; }.json-tree-node summary { cursor: pointer; padding: 5px; border-radius: 5px; background: var(--ui-accent-soft); }.json-tree-children { padding-left: 14px; border-left: 1px solid var(--el-border-color); margin-left: 6px; }.json-tree-leaf { padding: 3px 5px; }.json-tree-leaf code { white-space: pre-wrap; overflow-wrap: anywhere; }
</style>
