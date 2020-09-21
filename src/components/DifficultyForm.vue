<template>
  <div id="difficulty-form">
    <input type="text" v-model.number="rows" />
    x
    <input type="text" v-model.number="cols" />
    <br />
    <label for>Nº de minas:</label>
    <input type="text" v-model.number="mines" />
    <br />
    <button @click="handleSubmit">Novo jogo</button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class DifficultyForm extends Vue {
  @Prop() public defaultRows!: number;
  @Prop() public defaultCols!: number;
  @Prop() public defaultMines!: number;

  public rows: number = this.defaultRows;
  public cols: number = this.defaultCols;
  public mines: number = this.defaultMines;

  public handleSubmit(e: any) {
    e.target.blur();

    if (this.rows < 3 || this.cols < 3 || this.rows > 50 || this.cols > 50) {
      this.rows = this.defaultRows;
      this.cols = this.defaultCols;
    }

    if (this.mines < 1) {
      this.mines = 1;
    } else if (this.mines - 9 > this.rows * this.cols) {
      this.mines = this.rows * this.cols - 9;
    }

    this.$emit('handle-submitted', this.rows, this.cols, this.mines);
  }
}
</script>

<style scoped lang="less">
#difficulty-form {
  margin-bottom: 15px;
}

input[type='text'] {
  width: 50px;
  text-align: center;
}

label {
  margin-right: 5px;
  font-size: 12px;
}
</style>
