<template>
  <span
    class="cell-wrapper"
    v-on:click.right="disableContextMenu($event)"
    :data-row="field.row"
    :data-col="field.col"
  >
    <span class="cell" v-if="field.exploded">
      <img src="../assets/mine_exploded.png" />
    </span>
    <span class="cell" v-else-if="field.flagged" v-on:click.right="handleToggleFlag(field)">
      <template v-if="!field.hidden && !field.mine">
        <img src="../assets/flag_wrong.png" />
      </template>
      <template v-else>
        <img src="../assets/flag.png" />
      </template>
    </span>
    <span
      class="cell hidden"
      v-else-if="field.hidden"
      v-on:click="handleReveal(field)"
      v-on:click.right="handleToggleFlag(field)"
    ></span>
    <span class="cell" v-else-if="field.mine">
      <img src="../assets/mine.png" />
    </span>
    <span
      class="cell revealed"
      v-else
      v-bind:style="{color: '#' + colors[field.adjacentCells]}"
    >{{field.adjacentCells ? field.adjacentCells : '&nbsp;'}}</span>
  </span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import Cell from '../definitions/Cell';

@Component
export default class FieldCell extends Vue {
  @Prop() public field!: Cell;
  @Prop() public handleReveal!: () => void;
  @Prop() public handleToggleFlag!: (cell: Cell) => void;

  public readonly colors: string[] = [
    '000000',
    '0004FF',
    '007000',
    'FE0100',
    '05006C',
    '840800',
    '008284',
    '840084',
    '000000',
  ];

  public disableContextMenu(e: any) {
    e.preventDefault();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.cell {
  display: inline-block;
  width: 24px;
  height: 24px;
  user-select: none;
  font-size: 16px;
  line-height: 26px;
  font-weight: bold;
  vertical-align: top;

  img {
    display: block;
  }

  &.hidden {
    cursor: pointer;
    background-image: url('../assets/cell.png');

    &:hover {
      background-image: url('../assets/cell_hover.png');
    }

    &:active {
      background-image: url('../assets/cell_press.png');
    }
  }

  &.revealed {
    background-image: url('../assets/empty.png');
    cursor: default;
  }
}
</style>
