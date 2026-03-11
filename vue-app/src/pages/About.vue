<template>
  <div>
    <h2>예제 해보기</h2>

    <input ref="inputRef" type="text" placeholder="입력하세요"/>
    <button @click="focusInput">포커스</button>

    <p>현재 카운트: {{ count }}</p>
    <button @click="count++">증가</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// React의 function About() { return (...) } 과 동일
const inputRef = ref<HTMLInputElement | null>(null);
const count = ref(0);

const focusInput = () => {
  inputRef.value?.focus();
};
</script>

<!-- Vue의 <template>안에서는 중괄호 {}를 이용해 속성에 자바스크립트 값을 전달하는 React 방식(onClick={...})이 동작하지 않습니다. 
Vue는 이를 자바스크립트 코드가 아닌 단순한 문자열(String) 인 "{() => setCount(count + 1)}"로 인식합니다. 
반면 TypeScript는 클릭 이벤트 핸들러가 함수 형태((payload: PointerEvent) => void)가 들어올 것으로 기대합니다. -->