<script>
import JSConfetti from 'js-confetti'

const confetti = new JSConfetti()

export default {
  mounted() {
    this.showConfetti()
  },
  methods: {
    showConfetti() {
      confetti.addConfetti()
    }
  }
}
</script>

<template>
  <h1 @click="showConfetti">🎉 考试已结束，Congratulations!</h1>
</template>

<style>
h1 {
  text-align: center;
  cursor: pointer;
  margin-top: 3em;
}
</style>