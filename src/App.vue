<template>
  <div id="app">
    <DifficultyForm
      @handle-submitted="handleNew"
      :defaultRows="rows"
      :defaultCols="cols"
      :defaultMines="mines"
    />
    <div id="info">
      <Timer :active="isIngame" ref="timer" :key="'timer-' + timerKey" />
      <div>
        Minas restantes:
        <strong>{{ minesLeft }}</strong>
      </div>
    </div>
    <MineField
      :rows="rows"
      :cols="cols"
      :mines="mines"
      :key="'minefield-' + gameID"
      @handle-win="handleWin"
      @handle-lose="handleLose"
      @handle-ingame="handleIngame"
      @handle-flagged-mines="handleFlaggedMines"
    />
    <h2 v-if="result">{{result}}</h2>
    <div id="protip">Dica: use a barra de espaço com o mouse sobre a célula para marcadores.</div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import MineField from './components/MineField.vue';
import DifficultyForm from './components/DifficultyForm.vue';
import Timer from './components/Timer.vue';

enum State {
  New,
  Ingame,
  Win,
  Lose,
}

@Component({
  components: {
    DifficultyForm,
    Timer,
    MineField,
  },
})
export default class App extends Vue {
  public rows: number = 16;
  public cols: number = 16;
  public mines: number = 50;

  public state: State = State.New;
  public result: string = '';

  public gameID: number = 1;
  private flaggedMines: number = 0;

  public handleNew(rows: number, cols: number, mines: number) {
    this.rows = rows;
    this.cols = cols;
    this.mines = mines;

    this.state = State.New;
    this.result = '';

    this.flaggedMines = 0;
    this.gameID += 1;
  }

  public handleIngame() {
    this.state = State.Ingame;
  }

  public handleWin() {
    this.state = State.Win;
    this.result = 'Win!';
    this.stopTimer();
  }

  public handleLose() {
    this.state = State.Lose;
    this.result = 'Game over!';
    this.stopTimer();
  }

  public handleFlaggedMines(flaggedMines: number) {
    this.flaggedMines = flaggedMines;
  }

  private stopTimer() {
    // @ts-ignore
    this.$refs.timer.stop();
  }

  get isIngame() {
    return this.state === State.Ingame;
  }

  get isLoss() {
    return this.state === State.Lose;
  }

  get timerKey() {
    return this.state !== State.New;
  }

  get minesLeft() {
    return this.mines - this.flaggedMines;
  }
}
</script>

<style lang="less">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin-top: 60px;
}

#info {
  margin-bottom: 15px;
}

#protip {
  margin-top: 15px;
  color: #666;
}
</style>
