<template>
  <div name="Datatable" class="mh-datatable">
    <div v-if="$slots.default || HeaderSettings" class="clearfix" style="margin-bottom: 10px">
      <header-settings v-if="HeaderSettings" class="pull-right"
        :columns="columns" :support-backup="supportBackup">
      </header-settings>
      <slot />
    </div>

    <tbl v-bind="$props" />
    
    <div v-if="Pagination" class="tablePagination">
      <div class="row">
        <div class="col-sm-6">
          <pagination class="pull-left" :total="total" :query="query" />
          <page-size-select :query="query" :page-size-options="pageSizeOptions" />
        </div>

        <div class="col-sm-6" style="white-space: nowrap">

          <div  class="pull-right grid-pagination-total" >
            {{ $i18nForDatatable('Total') }} {{ total }} 
          </div>
        
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import HeaderSettings from './HeaderSettings/index.vue'
import Tbl from './Table/index.vue'
import Pagination from './Pagination.vue'
import PageSizeSelect from './PageSizeSelect.vue'
import props from './_mixins/props'
import keyGen from './_utils/keyGen'
import replaceWith from './_utils/replaceWith'
import { parseStr, stringify, saveToLS, rmFromLS, getFromLS } from './_utils/localstorage'

export default {
  name: 'Datatable',
  mixins: [props],
  components: { HeaderSettings, Tbl, Pagination, PageSizeSelect },
  created() {

    // init query (make all the properties observable by using `$set`)
    let q = null;

    if(this.supportBackup === true && this.gridName != null && this.gridName != ""){
      q = getFromLS(this.storageKey)
    }

    if (!q) {
      q = { limit: 20, offset: 0, sort: [], filters: [], ...this.query }
    } 

    Object.keys(q).forEach(key => { this.$set(this.query, key, q[key]) })

    // if(this.dataSource != null && this.dataSource.read != null){
    //     this.$http.get(this.dataSource.read).then((response) {
    //       this.data = response.data;
    //     });
    // }

  },
  updated() {
    this.isFirstInit = false;
  },
  data() {
    return {
      isFirstInit: true,
      storageKey: this.supportBackup === true ? keyGen(stringify(this.columns)) + "-" + this.gridName : ''
    }
  },
  watch: {
    query: {
      //immediate: true,
      handler (state) {
 
        if(this.supportBackup && !this.isFirstInit && this.gridName != null && this.gridName != ""){
          saveToLS(this.storageKey, this.query);
        }
      },
      deep: true
    },
    data: {
      handler (data) {
        const { supportNested } = this
        // support nested components feature with extra magic
        if (supportNested) {
          const MAGIC_FIELD = '__nested__'
          data.forEach(item => {
            if (!item[MAGIC_FIELD]) {
              this.$set(item, MAGIC_FIELD, {
                comp: undefined, // current nested component
                visible: false,
                $toggle (comp, visible) {
                  switch (arguments.length) {
                    case 0:
                      this.visible = !this.visible
                      break
                    case 1:
                      switch (typeof comp) {
                        case 'boolean':
                          this.visible = comp
                          break
                        case 'string':
                        case 'object':
                          this.comp = comp
                          this.visible = !this.visible
                          break
                      }
                      break
                    case 2:
                      this.comp = comp
                      this.visible = visible
                      break
                  }
                }
              })
              if (supportNested === 'accordion') {
                this.$watch(
                  () => item[MAGIC_FIELD],
                  nested => {
                    // only one nested component can be expanded at the same time
                    if (data.filter(item => item[MAGIC_FIELD].visible).length < 2) return

                    data.forEach(item => {
                      if (item[MAGIC_FIELD].visible && item[MAGIC_FIELD] !== nested) {
                        item[MAGIC_FIELD].visible = false
                      }
                    })
                  },
                  { deep: true }
                )
              }
              Object.defineProperty(item, MAGIC_FIELD, { enumerable: false })
            }
          })
        }
      },
      immediate: true
    }
  }
}
</script>
<style>
/* transition effect: fade */
.fade-enter-active, .fade-leave-active {
  transition: opacity .2s;
}
.fade-enter, .fade-leave-active {
  opacity: 0;
}
.tablePagination {

  color: #444;
  background-color: #fafafa;
  border-color: #e6e6e6;
  line-height: 1.286em;
  padding: 10px 15px;
  border-width: 1px 0 0;
  clear: both;
  overflow: hidden;
  position: relative;
  border-style: solid;
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
  border-left: 1px solid rgba(0, 0, 0, 0.125);
  border-right: 1px solid rgba(0, 0, 0, 0.125);
}

.tablePagination ul.pagination .page-item a {
  border-radius: 0;
}

.grid-pagination-total{
  padding-top: 9px;
}

.mh-datatable thead{
  border-color: #e6e6e6;
  color: #444;
  background-color: #fafafa;
}
.mh-datatable thead th {
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tooltip {
  display: block !important;
  z-index: 10000;
}

.tooltip .tooltip-inner {
  background: black;
  color: white;
  border-radius: 16px;
  padding: 5px 10px 4px;
}

.tooltip .tooltip-arrow {
  width: 0;
  height: 0;
  border-style: solid;
  position: absolute;
  margin: 5px;
  border-color: black;
  z-index: 1;
}

.tooltip[x-placement^="top"] {
  margin-bottom: 5px;
}

.tooltip[x-placement^="top"] .tooltip-arrow {
  border-width: 5px 5px 0 5px;
  border-left-color: transparent !important;
  border-right-color: transparent !important;
  border-bottom-color: transparent !important;
  bottom: -5px;
  left: calc(50% - 5px);
  margin-top: 0;
  margin-bottom: 0;
}

.tooltip[x-placement^="bottom"] {
  margin-top: 5px;
}

.tooltip[x-placement^="bottom"] .tooltip-arrow {
  border-width: 0 5px 5px 5px;
  border-left-color: transparent !important;
  border-right-color: transparent !important;
  border-top-color: transparent !important;
  top: -5px;
  left: calc(50% - 5px);
  margin-top: 0;
  margin-bottom: 0;
}

.tooltip[x-placement^="right"] {
  margin-left: 5px;
}

.tooltip[x-placement^="right"] .tooltip-arrow {
  border-width: 5px 5px 5px 0;
  border-left-color: transparent !important;
  border-top-color: transparent !important;
  border-bottom-color: transparent !important;
  left: -5px;
  top: calc(50% - 5px);
  margin-left: 0;
  margin-right: 0;
}

.tooltip[x-placement^="left"] {
  margin-right: 5px;
}

.tooltip[x-placement^="left"] .tooltip-arrow {
  border-width: 5px 0 5px 5px;
  border-top-color: transparent !important;
  border-right-color: transparent !important;
  border-bottom-color: transparent !important;
  right: -5px;
  top: calc(50% - 5px);
  margin-left: 0;
  margin-right: 0;
}

.tooltip.popover .popover-inner {
  background: #f9f9f9;
  color: black;
  padding: 24px;
  border-radius: 5px;
  box-shadow: 0 5px 30px rgba(black, .1);
}

.tooltip.popover .popover-arrow {
  border-color: #f9f9f9;
}

.tooltip[aria-hidden='true'] {
  visibility: hidden;
  opacity: 0;
  transition: opacity .15s, visibility .15s;
}

.tooltip[aria-hidden='false'] {
  visibility: visible;
  opacity: 1;
  transition: opacity .15s;
}

</style>
