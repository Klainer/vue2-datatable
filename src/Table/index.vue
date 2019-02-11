<template>
  <!-- complex mode -->
  <div v-if="useComplexMode" name="ComplexTable" class="-complex-table" ref="table" v-resize:debounce="handleResize"> 
    <template v-for="(x, index) in ['Header', 'Body']">
      <div
        :key="index"
        v-if="(x !== 'Footer' || x === 'Footer') && (pending == false || x == 'Header' )"
        ref="wrappers"
        :name="`Table${x}Wrapper`"
        :class="`-table-${x.toLowerCase()}`"
        :style="[
          x === 'Body' && { height: `${calcTableHeight}px` }
        ]"
      >
        <div
          :ref="`NormalTable${x}`"
          :name="`NormalTable${x}`"
          :style="[ { 
                      width: `${mainTableWidth - verticalScrollWidthCorrection}px`, 
                      marginLeft:  `${fixedLeftTableWidth}px` , 
                      overflow: 'hidden'
                    }, 
                    x === 'Body' &&  
                    {  
                      width: `${mainTableWidth}px`, 
                      marginLeft:  `${fixedLeftTableWidth}px` , 
                      height: `${calcTableHeight}px`, 
                      overflow: 'auto' 
                    }]"
        >
          <table-frame v-bind="propsToNormalTable">
            <component :is="`Table${x}`" v-bind="propsToNormalTable"/>
          </table-frame>
        </div>

        <div
          v-if="leftFixedColumns.length"
          :name="`LeftFixedTable${x}`"
          class="-left-fixed -fixed-table"
          :style="[ x === 'Body' &&  { height: `${fixedTableHeight}px`, overflow: 'hidden' }]"
        >
          <table-frame v-bind="propsToLeftFixedTable" left-fixed>
            <component :is="`Table${x}`" v-bind="propsToLeftFixedTable" left-fixed/>
          </table-frame>
        </div>

        <div
          v-if="rightFixedColumns.length && !pending"
          :name="`RightFixedTable${x}`"
          class="-right-fixed -fixed-table"
        >
          <table-frame v-bind="propsToRightFixedTable" right-fixed>
            <component :is="`Table${x}`" v-bind="propsToRightFixedTable" right-fixed/>
          </table-frame>
        </div>
      </div>
      <div v-else-if="x == 'Body'" :key="index">
        <div class="spinner">
          <div class="rect1"></div>
          <div class="rect2"></div>
          <div class="rect3"></div>
          <div class="rect4"></div>
          <div class="rect5"></div>
        </div>
      </div>
    </template>
  </div>
  <!-- simple mode -->
  <div v-else name="SimpleTable" ref="table">
    <table-frame v-bind="propsToNormalTable" is-simple-table>
      <table-header v-bind="propsToNormalTable" is-simple-table/>
      <table-body v-bind="propsToNormalTable" is-simple-table/>
      <table-footer v-if="summary" v-bind="propsToNormalTable" is-simple-table/>
    </table-frame>
  </div>
</template>
<script>
import debounce from "lodash/debounce";
import TableFrame from "./TableFrame.vue";
import TableHeader from "./TableHeader.vue";
import TableBody from "./TableBody.vue";
import TableFooter from "./TableFooter.vue";
import props from "../_mixins/props";
import getScrollWidth from "../_utils/getScrollWidth";
import isColVisible from "../_utils/isColVisible";
import syncScroll from "../_utils/syncScroll";
import resize from 'vue-resize-directive'

export default {
  name: "Tbl",
  mixins: [props],
  components: { TableFrame, TableHeader, TableBody, TableFooter },
  directives: {
        resize,
  },
  data: () => ({
    offsetLeft: 0,
    offsetTop: 0,
    scrollWidth: getScrollWidth(),
    tableWidth: 0,
    fixedTableHeight: 0,
    fixedLeftTableWidth: 0,
    fixedRightTableWidth: 0,
    tableHeight: 0,
    isRedered: false,
    unsync: null,
    unsyncH: null,
    isVerticallScrollVisible: false,
    resizeId: null
  }),
  methods: {
    // Fix heiht when horizontal scrollbar appear
    calcFixedTableHeight() {
      if (
        this.$refs.NormalTableBody != null &&
        this.$refs.NormalTableBody.length > 0 &&
        this.$refs.NormalTableBody[0].scrollWidth >
        this.$refs.NormalTableBody[0].clientWidth
      ) {
        this.fixedTableHeight = this.calcTableHeight - 17;
      } else {
        this.fixedTableHeight = this.calcTableHeight;
      }
    },
    handleResize(e) {
      // Set Table WIDTH
      if (this.$refs.table != null) {
        this.tableWidth = this.$refs.table.offsetWidth;
      }

      // Set Table HEIGHT
      if (this.fullHeight != null && e != undefined) {
        let heightCorrection = 0;
        if (
          this.fullHeight != null &&
          this.fullHeight.heightCorrection != null
        ) {
          heightCorrection = this.fullHeight.heightCorrection;
        }
        this.tableHeight = window.innerHeight + heightCorrection;

        setTimeout(() => {
          if (this.$refs.NormalTableBody != null && this.$refs.NormalTableBody.length > 0) {
            if (
              this.$refs.NormalTableBody[0].scrollHeight >
              this.$refs.NormalTableBody[0].clientHeight
            ) {
              this.isVerticallScrollVisible = true;
            } else {
              this.isVerticallScrollVisible = false;
            }
          }
        }, 200);
      }

      // Set fixed Table width
      if (this.$refs.wrappers != null && this.$refs.wrappers.length > 0) {
        setTimeout(() => {
          this.calcFixedTableHeight();
        }, 200);

        let leftFixedColumnEl = this.$refs.wrappers[0].querySelector(
          "div.-left-fixed"
        );
        this.fixedLeftTableWidth = 0;
        if (leftFixedColumnEl) {
          this.fixedLeftTableWidth = leftFixedColumnEl.offsetWidth || 0;
        }

        if (this.$refs.wrappers.length == 3) {
          let rightFixedColumnEl = this.$refs.wrappers[2].querySelector(
            "div.-right-fixed"
          );
          this.fixedRightTableWidth = 0;
          if (rightFixedColumnEl) {
            this.fixedRightTableWidth = rightFixedColumnEl.offsetWidth || 0;
          }
        }
      }
    }
    //syncScroll() {}
  },
  created() {},
  destroyed() {
    window.removeEventListener("resize", this.handleResize);
    this.unsync && this.unsync();
    this.unsyncH && this.unsyncH();
  },
  mounted() {
    // this allows you to fix columns or `fixHeaderAndSetBodyMaxHeight` dynamically
    this.$watch(
      vm => [vm.useComplexMode, vm.pending],
      v => {
        if (v) {
          this.$nextTick(() => {
            window.removeEventListener("resize", this.handleResize);
            window.addEventListener("resize", this.handleResize);
            this.handleResize();
          });
          // synchronize vertical horizontal scrolling
          this.unsync && this.unsync();
          this.unsyncH && this.unsyncH();
          if (this.$refs.wrappers && this.$refs.wrappers[1] != null) {
            this.unsyncH = syncScroll(
              [...this.$refs.wrappers[1].querySelectorAll("div")],
              () => {}
            );
          }

          if (
            this.$refs.wrappers &&
            this.$refs.wrappers.length > 1 &&
            this.$refs.wrappers[0] != null &&
            this.$refs.wrappers[1] != null
          ) {
            this.unsync = syncScroll(
              [
                this.$refs.wrappers[0].querySelector("div"),
                this.$refs.wrappers[1].querySelector("div")
              ],
              () => {}
            );
          }
        } else {
          this.unsync && this.unsync();
          this.unsyncH && this.unsyncH();
        }
      },
      { immediate: true }
    );
  },
  updated() {
    if (this.isRedered == false) {
      let event = null;

      if (typeof Event === "function") {
        event = new Event("resize");
      } else {
        event = document.createEvent("Event");
        event.initEvent("resize", true, true);
      }

      window.dispatchEvent(event);
      event = null;

      this.isRedered = true;
    }
  },
  computed: {
    visibleColumns() {
      return this.columns.filter(isColVisible);
    },
    leftFixedColumns() {
      return this.visibleColumns.filter(
        col => col.fixed && col.fixed !== "right"
      );
    },
    rightFixedColumns() {
      return this.visibleColumns.filter(col => col.fixed === "right");
    },
    hasFixedColumns() {
      return !!(this.leftFixedColumns.length + this.rightFixedColumns.length);
    },
    useComplexMode() {
      return !!(this.fixHeaderAndSetBodyMaxHeight || this.hasFixedColumns);
    },
    propsToNormalTable() {
      return { ...this.$props, columns: this.visibleColumns };
    },
    propsToLeftFixedTable() {
      return { ...this.$props, columns: this.leftFixedColumns };
    },
    propsToRightFixedTable() {
      return { ...this.$props, columns: this.rightFixedColumns };
    },
    mainTableWidth() {
      return (
        this.tableWidth - this.fixedLeftTableWidth - this.fixedRightTableWidth
      );
    },
    verticalScrollWidthCorrection() {
      return this.isVerticallScrollVisible ? 17 : 0;
    },
    calcTableHeight() {
      return this.fullHeight != null
        ? this.tableHeight
        : this.fixHeaderAndSetBodyMaxHeight;
    }
  }
};
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


    thead tr th, tbody tr td {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

.-table-header,
.-table-body,
.-table-footer {
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
  border-right: 1px solid #dddddd;
}
.-right-fixed {
  box-shadow: 1px 0 5px #ddd;
}

.tablePagination {
  border-top: none;
}

.spinner {
  margin: 20px auto;
  width: 60px;
  height: 50px;
  text-align: center;
  font-size: 15px;
}
.spinner > div {
  height: 100%;
  width: 8px;
  margin-left: 2px;
  display: inline-block;
  -webkit-animation: sk-stretchdelay 1.2s infinite ease-in-out;
  animation: sk-stretchdelay 1.2s infinite ease-in-out;
  background-color: rgb(180, 180, 180);
}
.spinner .rect2 {
  -webkit-animation-delay: -1.1s;
  animation-delay: -1.1s;
}
.spinner .rect3 {
  -webkit-animation-delay: -1s;
  animation-delay: -1s;
}
.spinner .rect4 {
  -webkit-animation-delay: -0.9s;
  animation-delay: -0.9s;
}
.spinner .rect5 {
  -webkit-animation-delay: -0.8s;
  animation-delay: -0.8s;
}
@-webkit-keyframes sk-stretchdelay {
  0%,
  100%,
  40% {
    -webkit-transform: scaleY(0.4);
  }
  20% {
    -webkit-transform: scaleY(1);
  }
}
@keyframes sk-stretchdelay {
  0%,
  100%,
  40% {
    transform: scaleY(0.4);
    -webkit-transform: scaleY(0.4);
  }
  20% {
    transform: scaleY(1);
    -webkit-transform: scaleY(1);
  }
}
</style>



