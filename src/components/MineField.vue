<template>
  <div id="minefield">
    <div v-for="row in rows" :key="row">
      <FieldCell
        v-for="col in cols"
        :key="row + '-' + col + '-' + cells[row - 1][col - 1].hidden + '-' + cells[row - 1][col - 1].flagged"
        :field="cells[row - 1][col - 1]"
        :handleReveal="handleReveal"
        :handleToggleFlag="handleToggleFlag"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';

import FieldCell from './FieldCell.vue';
import Cell from '../definitions/Cell';
import MousePosition from '../others/MousePosition';

@Component({
  components: {
    FieldCell,
  },
})
export default class MineField extends Vue {
  @Prop() public rows!: number;
  @Prop() public cols!: number;
  @Prop() public mines!: number;

  public activeMineField: boolean = true;

  public cells: Cell[][] = [];

  public flaggedMines: number = 0;

  public minesGenerated: boolean = false;

  public handleReveal(cell: Cell) {
    if (!this.activeMineField) {
      return;
    }
    this.revealCells(cell.row, cell.col);

    this.$forceUpdate();
  }

  public handleToggleFlag(cell: Cell) {
    if (!this.activeMineField) {
      return;
    }

    this.cells[cell.row][cell.col].flagged = !cell.flagged;

    if (this.cells[cell.row][cell.col].flagged) {
      this.flaggedMines++;
    } else {
      this.flaggedMines--;
    }
    this.$emit('handle-flagged-mines', this.flaggedMines);

    this.$forceUpdate();
  }

  public handleSpace(e: any) {
    if (!this.activeMineField) {
      return;
    }

    const el: Element | null = document.elementFromPoint(
      MousePosition.x,
      MousePosition.y,
    );

    if (el) {
      const parent: Element | null = el.closest('.cell-wrapper');

      if (!parent) {
        return;
      }

      const rowString: string | undefined = (parent as HTMLElement).dataset.row;
      const colString: string | undefined = (parent as HTMLElement).dataset.col;

      if (rowString && colString) {
        const row: number = Number(rowString);
        const col: number = Number(colString);
        if (this.validBoundaries(row, col)) {
          const cell = this.cells[row][col];
          if (cell.hidden) {
            this.handleToggleFlag(cell);
          } else if (
            !cell.hidden &&
            cell.adjacentCells === this.calculateAdjacentFlaggedCells(row, col)
          ) {
            this.revealAdjacentUnflaggedCells(row, col);
            this.$forceUpdate();
          }
        }
      }
    }
  }

  private created() {
    if (this.mines - 9 > this.rows * this.cols) {
      this.mines = this.rows * this.cols - 9;
    }

    for (let row: number = 0; row < this.rows; row++) {
      this.cells[row] = [];
      for (let col: number = 0; col < this.cols; col++) {
        this.cells[row][col] = {
          row,
          col,
          mine: false,
          exploded: false,
          hidden: true,
          flagged: false,
          adjacentCells: 0,
        };
      }
    }

    const minefield = this;
    window.addEventListener('keypress', event => {
      if (event.keyCode === 32) {
        minefield.handleSpace(event);
      }
    });
  }

  private updated() {
    if (!this.activeMineField) {
      return;
    }

    this.$emit('handle-ingame');

    if (this.checkLoseConditions()) {
      this.$emit('handle-lose');
      this.activeMineField = false;

      this.revealAllCells();
      this.$forceUpdate();
    } else if (this.checkWinConditions()) {
      this.$emit('handle-win');
      this.activeMineField = false;

      this.revealAllCells();
      this.$forceUpdate();
    }
  }

  private getRandomInt(from: number, to: number): number {
    return Math.floor(Math.random() * to) + from;
  }

  private generateMines(initRow: number, initCol: number): void {
    let minesToPlant: number = this.mines;

    while (minesToPlant > 0) {
      const row: number = this.getRandomInt(0, this.rows);
      const col: number = this.getRandomInt(0, this.cols);

      if (
        !this.cells[row][col].mine &&
        (Math.abs(initRow - row) > 1 || Math.abs(initCol - col) > 1)
      ) {
        this.cells[row][col].mine = true;
        minesToPlant--;
      }
    }

    this.minesGenerated = true;
    this.setAdjacentCells();
  }

  private setAdjacentCells(): void {
    for (let row: number = 0; row < this.rows; row++) {
      for (let col: number = 0; col < this.cols; col++) {
        this.cells[row][col].adjacentCells = this.calculateAdjacentCells(
          row,
          col,
        );
      }
    }
  }

  private validBoundaries(row: number, col: number) {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
  }

  private calculateAdjacentCells(row: number, col: number): number {
    let adjacentCells = 0;
    for (const rowShift of [-1, 0, 1]) {
      for (const colShift of [-1, 0, 1]) {
        if (
          this.validBoundaries(row + rowShift, col + colShift) &&
          this.cells[row + rowShift][col + colShift].mine
        ) {
          adjacentCells += 1;
        }
      }
    }

    return adjacentCells;
  }

  private calculateAdjacentFlaggedCells(row: number, col: number): number {
    let adjacentCells = 0;
    for (const rowShift of [-1, 0, 1]) {
      for (const colShift of [-1, 0, 1]) {
        if (
          this.validBoundaries(row + rowShift, col + colShift) &&
          this.cells[row + rowShift][col + colShift].flagged
        ) {
          adjacentCells += 1;
        }
      }
    }

    return adjacentCells;
  }

  private revealAllCells() {
    for (let row: number = 0; row < this.rows; row++) {
      for (let col: number = 0; col < this.cols; col++) {
        this.cells[row][col].hidden = false;
      }
    }
  }

  private revealCells(row: number, col: number): void {
    if (!this.minesGenerated) {
      this.generateMines(row, col);
    }

    if (!this.cells[row][col].hidden || this.cells[row][col].flagged) {
      return;
    }

    this.cells[row][col].hidden = false;

    if (this.cells[row][col].mine) {
      this.cells[row][col].exploded = true;
    }

    if (this.cells[row][col].adjacentCells > 0) {
      return;
    }

    for (const rowShift of [-1, 0, 1]) {
      for (const colShift of [-1, 0, 1]) {
        if (this.validBoundaries(row + rowShift, col + colShift)) {
          this.revealCells(row + rowShift, col + colShift);
        }
      }
    }
  }

  private revealAdjacentUnflaggedCells(row: number, col: number): void {
    if (this.cells[row][col].flagged) {
      return;
    }

    for (const rowShift of [-1, 0, 1]) {
      for (const colShift of [-1, 0, 1]) {
        if (
          this.validBoundaries(row + rowShift, col + colShift) &&
          !this.cells[row + rowShift][col + colShift].flagged
        ) {
          this.revealCells(row + rowShift, col + colShift);
        }
      }
    }
  }

  private checkWinConditions(): boolean {
    for (let row: number = 0; row < this.rows; row++) {
      for (let col: number = 0; col < this.cols; col++) {
        if (this.cells[row][col].hidden && !this.cells[row][col].mine) {
          return false;
        }
      }
    }

    return true;
  }
  private checkLoseConditions(): boolean {
    for (let row: number = 0; row < this.rows; row++) {
      for (let col: number = 0; col < this.cols; col++) {
        if (!this.cells[row][col].hidden && this.cells[row][col].mine) {
          return true;
        }
      }
    }

    return false;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
#minefield {
  letter-spacing: 0px;
  font-size: 0px;
}
</style>
