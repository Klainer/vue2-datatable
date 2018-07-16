<template>
  <table class="table table-striped table-hover" style="margin-bottom: 0" :class="tblClass" :style="tblStyle">
    <colgroup>
      <col v-if="shouldRenderSelection" style="width: 30px"></col>
      <col v-for="col in tableColumns" :class="col.colClass" :style="col.colStyle"></col>
    </colgroup>
    <slot />
  </table>
</template>
<script>
import props from '../_mixins/props'
import shouldRenderSelection from '../_mixins/shouldRenderSelection'

export default {
  name: 'TableFrame',
  mixins: [props, shouldRenderSelection],
  computed: {
    tableColumns() {
      if(this.leftFixed){
        return this.columns.filter(col => col.fixed === true || col.fixed === 'left' );
      } else if (this.rightFixed){
        return this.columns.filter(col => col.fixed === 'right' );
      } else {
        return this.columns.filter(col => col.fixed !== true && col.fixed !== 'left' && col.fixed !== 'right');
      }
    }
  },
  mounted: function () {
  }
}
</script>
