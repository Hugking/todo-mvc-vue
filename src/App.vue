<template>
      <div id="app">
        <HelloWorld></HelloWorld>
         </div>
  </body>
</template>

<script>
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'app',
  components: {
    HelloWorld,
  },
  }
</script>

<style>
#app {
  width: 800px;
  height: 900px;
  margin: 0 auto;
  text-align: center;
  background-color: rgb(245, 245, 245);
  padding: 24px 0;
}
</style>
