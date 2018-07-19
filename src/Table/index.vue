<template>
  <!-- complex mode -->
  <div v-if="useComplexMode" name="ComplexTable" class="-complex-table" ref="table">
    <template v-for="(x, index) in ['Header', 'Body']">
      <div :key="index" v-if="x !== 'Footer' || x === 'Footer' && summary"
        ref="wrappers" :name="`Table${x}Wrapper`" :class="`-table-${x.toLowerCase()}`"
        :style="[
         
          x === 'Body' && { height: `${calcTableHeight}px` }
        ]">
        <div :name="`NormalTable${x}`" 
             :style="[ { width: `${mainTableWidth - 17}px`, marginLeft:  `${fixedLeftTableWidth}px` , overflow: 'hidden'} , 
             x === 'Body' &&  {  width: `${mainTableWidth}px`, marginLeft:  `${fixedLeftTableWidth}px` , height: `${calcTableHeight}px`, overflow: 'scroll' }
             ]">
          <table-frame v-bind="propsToNormalTable">
            <component :is="`Table${x}`" v-bind="propsToNormalTable" />
          </table-frame>
        </div>
        <div v-if="leftFixedColumns.length"
          :name="`LeftFixedTable${x}`"
          class="-left-fixed -fixed-table"
          :style="[ x === 'Body' &&  { height: `${calcTableHeight - 17}px`, overflow: 'hidden' }]"
         >
          <table-frame v-bind="propsToLeftFixedTable" left-fixed>
            <component :is="`Table${x}`" v-bind="propsToLeftFixedTable" left-fixed />
          </table-frame>
        </div>
        <div v-if="rightFixedColumns.length"
          :name="`RightFixedTable${x}`"
          class="-right-fixed -fixed-table"
          >
          <table-frame v-bind="propsToRightFixedTable" right-fixed>
            <component :is="`Table${x}`" v-bind="propsToRightFixedTable" right-fixed />
          </table-frame>
        </div>
      </div>
    </template>
  </div>
  <!-- simple mode -->
  <div v-else name="SimpleTable" ref="table">
    <table-frame v-bind="propsToNormalTable" is-simple-table>
      <table-header v-bind="propsToNormalTable" is-simple-table />
      <table-body v-bind="propsToNormalTable" is-simple-table />
      <table-footer v-if="summary" v-bind="propsToNormalTable" is-simple-table />
    </table-frame>
  </div>
</template>
<script>

import debounce from 'lodash/debounce'
import TableFrame from './TableFrame.vue'
import TableHeader from './TableHeader.vue'
import TableBody from './TableBody.vue'
import TableFooter from './TableFooter.vue'
import props from '../_mixins/props'
import getScrollWidth from '../_utils/getScrollWidth'
import isColVisible from '../_utils/isColVisible'
import syncScroll from '../_utils/syncScroll'

export default {
  name: 'Tbl',
  mixins: [props],
  components: { TableFrame, TableHeader, TableBody, TableFooter },
  data: () => ({
    offsetLeft: 0,
    offsetTop: 0,
    scrollWidth: getScrollWidth(),
    tableWidth: 0,
    fixedLeftTableWidth: 0,
    fixedRightTableWidth: 0,
    tableHeight: this.fixHeaderAndSetBodyMaxHeight,
    isRedered: false,
  }),
  methods: {
    handleResize(e){
      // Set Table WIDTH
      if(this.$refs.table != null){
        this.tableWidth = this.$refs.table.offsetWidth;
      }

      // Set Table HEIGHT
      if(this.fullHeight != null && e != undefined){
        let heightCorrection = 0;
        if(this.fullHeight != null && this.fullHeight.heightCorrection != null){
          heightCorrection = this.fullHeight.heightCorrection;
        }
        this.tableHeight = e.currentTarget.innerHeight + heightCorrection;
      }

      // Set fixed Table width
      if(this.$refs.wrappers != null && this.$refs.wrappers.length > 0){
        this.fixedLeftTableWidth = this.$refs.wrappers[0].querySelector("div.-left-fixed").offsetWidth || 0;

        if(this.$refs.wrappers.length == 3){
          this.fixedRightTableWidth = this.$refs.wrappers[2].querySelector("div.-right-fixed").offsetWidth || 0;
        }
      }
    }
  },
  created() {

  },
  destroyed() {
    document.removeEventListener("resize", this.handleResize);
  },
  mounted () {
    // this allows you to fix columns or `fixHeaderAndSetBodyMaxHeight` dynamically
    let unsync;
    let unsyncH;
    this.$watch('useComplexMode', v => {
      if (v) {

        this.$nextTick(() => {
          window.addEventListener('resize', debounce(this.handleResize, 150));
          this.handleResize()
        })
        // synchronize vertical horizontal scrolling
        unsyncH = syncScroll([...this.$refs.wrappers[1].querySelectorAll("div")], () => {})
        unsync  = syncScroll([
          this.$refs.wrappers[0].querySelector("div"), 
          this.$refs.wrappers[1].querySelector("div")], () => {})
      } else {
        unsync && unsync()
        unsyncH && unsyncH()
      }

    }, { immediate: true })

  },
  updated(){
    if(this.isRedered == false){
      window.dispatchEvent(new Event("resize"));
      this.isRedered = true;
    } 
  },
  computed: {
    visibleColumns () {
      return this.columns.filter(isColVisible)
    },
    leftFixedColumns () {
      return this.visibleColumns.filter(col => col.fixed && col.fixed !== 'right')
    },
    rightFixedColumns () {
      return this.visibleColumns.filter(col => col.fixed === 'right')
    },
    hasFixedColumns () {
      return !!(this.leftFixedColumns.length + this.rightFixedColumns.length)
    },
    useComplexMode () {
      return !!(this.fixHeaderAndSetBodyMaxHeight || this.hasFixedColumns)
    },
    propsToNormalTable () {
      return { ...this.$props, columns: this.visibleColumns }
    },
    propsToLeftFixedTable () {
      return { ...this.$props, columns: this.leftFixedColumns }
    },
    propsToRightFixedTable () {
      return { ...this.$props, columns: this.rightFixedColumns }
    },
    mainTableWidth() {
      return this.tableWidth - this.fixedLeftTableWidth - this.fixedRightTableWidth;
    },
    calcTableHeight(){
      return this.fullHeight != null ? this.tableHeight : this.fixHeaderAndSetBodyMaxHeight;
    }
  }
}
</script>
<style>
.-complex-table {
  position: relative;
  border: 1px solid #dddddd;
}

.-complex-table .table-bordered {
  border: none; 
}

.-complex-table table {
  background: #fff;
}

.-table-header, .-table-body, .-table-footer {
    position: relative;
    overflow-y: hidden;
    overflow-x: hidden;
}

.-table-header .table-bordered {
        border: none;
}
.-fixed-table {
  position: absolute;
  top: 0;
}
.-fixed-table table {
  width: auto;
}
.-left-fixed {
  box-shadow: 1px 0 5px #ddd;
  border-bottom: 2px solid #dddddd;
  border-right: 1px solid #dddddd;
}
.-right-fixed {
  box-shadow: 1px 0 5px #ddd;
}

.tablePagination{
  border-top: none;
}


</style>
