<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="支持我们"
    width="min(500px, calc(100vw - 32px))"
    append-to-body
    :destroy-on-close="true"
  >
    <div class="donate-content">
      <div class="qr-grid">
        <div class="qr-container">
          <img src="../assets/wechat-qr.png" alt="微信赞赏码" class="qr-code" />
          <h3>微信支付</h3>
        </div>
        <div class="qr-container">
          <img src="../assets/alipay-qr.png" alt="支付宝收款码" class="qr-code" />
          <h3>支付宝</h3>
        </div>
      </div>
      <p class="donate-tip">感谢您的支持！</p>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'DonateDialog',
  props: {
    modelValue: {
      type: Boolean,
      required: true
    }
  },
  emits: ['update:modelValue']
}
</script>

<style scoped>
.donate-content {
  text-align: center;
}

.qr-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin: 20px 0;
}

.qr-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qr-container h3 {
  margin-top: 12px;
  font-size: 14px;
  color: #606266;
}

.qr-code {
  width: 160px;
  height: 160px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.donate-tip {
  margin-top: 20px;
  font-size: 13px;
  color: #909399;
}
</style>

<style scoped>
@media(max-width:500px){.qr-grid{gap:12px}.qr-code{width:100%;max-width:160px;height:auto;aspect-ratio:1;object-fit:contain}.qr-container{min-width:0}.qr-container h3{font-size:13px}}
</style>
