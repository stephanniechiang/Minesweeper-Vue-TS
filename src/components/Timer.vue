<template>
  <div>
    Tempo:
    <strong>{{ duration }}</strong>s
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Timer extends Vue {
  @Prop({ default: false }) public active!: boolean;

  private startTime: number = 0;
  private currentTime: number = 0;
  private interval!: number;

  public created() {
    if (this.active) {
      this.startTime = this.currentTime = Date.now();
      this.interval = setInterval(this.tick, 1000);
    }
  }

  public tick() {
    this.currentTime = Date.now();
  }

  public stop() {
    clearInterval(this.interval);
  }

  get duration() {
    return Math.floor((this.currentTime - this.startTime) / 1000);
  }
}
</script>

<style scoped lang="less">
</style>
