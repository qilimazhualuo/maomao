<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

const open = ref(false)

// const showModal = (e) => {
//   // 判断没有其他modal打开时，按esc键打开菜单
//   if (e.key === 'Escape') {
//     let flag = false
//     const arrDom = document.getElementsByClassName('ant-modal-wrap')
//     for (let i = 0; i < arrDom.length; i++) {
//       if (arrDom[i].style.display !== 'none') {
//         flag = true
//         break
//       }
//     }
//     if (flag) {
//       return
//     }
//     !open.value && (open.value = true)
//   }
// }

const showModal = (e) => {
  // 判断没有其他modal打开时，按esc键打开菜单
  if (e.key === 'Escape' && !open.value) {
    open.value = true
  }
}

onMounted(() => {
  document.addEventListener('keydown', showModal)
})

onUnmounted(() => {
  document.removeEventListener('keydown', showModal)
})
</script>

<template>
  <a-modal title="菜单" :open="open" centered @cancel="open = false">
    <p>
      <RouterLink to="/">主页</RouterLink>
    </p>
    <p>
      <RouterLink to="/mao">开始猫猫游戏</RouterLink>
    </p>
    <p>
      <RouterLink to="/coors">坐标</RouterLink>
    </p>
    <p>
      <RouterLink to="/map3d">地图</RouterLink>
    </p>
    <p>
      <RouterLink to="/doc">文档处理</RouterLink>
    </p>
    <p>菜单1</p>
    <p>菜单2</p>
    <template #footer>
      <a-button @click.stop="open = false">关闭</a-button>
    </template>
  </a-modal>
</template>

<style lang="less"></style>