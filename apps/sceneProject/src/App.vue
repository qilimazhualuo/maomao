<script setup>
import { io } from 'socket.io-client'

const socket = io();

// 初始化 Three.js 场景
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 添加一个立方体
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

// 渲染循环
function animate() {
    requestAnimationFrame(animate);

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render(scene, camera);

    // 将渲染结果发送到服务器
    const canvas = renderer.domElement;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
    socket.emit('stream', dataUrl);
}

animate();
</script>

<template>
  <video class="content">
  </video>
</template>

<style lang="less">
.content {
  width: 100vw;
  height: 100vh;
}
</style>
