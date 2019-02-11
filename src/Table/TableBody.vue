<template>
  <tbody>
    <template v-if="data.length">
      <template v-for="(item, indexData) in data">
        <tr :key="indexData">
          <td v-if="shouldRenderSelection">
            <multi-select :selection="selection" :row="item" />
          </td>
          <td v-for="(col, index) in tableColumns" :key="index" 
            :class="col.tdClass" 
            :title="item[col.field]"
            v-tippy="{ arrow : true, interactive : true,  duration: 0, trigger: 'manually' }"
            @mouseenter="onTippyMouseEnter"
            @mouseleave="onTippyMouseLeave"
            :style="col.tdStyle">
            <!-- <td> component (tdComp) -->
            <component
              v-if="col.tdComp"
              :is="forDynCompIs(col.tdComp)"
              :row="item"
              :field="col.field"
              :value="item[col.field]"
              :nested="item.__nested__"
              v-bind="$props">
            </component>
            <template v-else>
              {{ item[col.field] }}
            </template>
          </td>
        </tr>
        <transition name="fade" :key="indexData">
          <tr v-if="item.__nested__ && item.__nested__.visible">
            <td :colspan="colLen">
              <!-- nested component -->
              <component
                :is="forDynCompIs(item.__nested__.comp)"
                :row="item"
                :nested="item.__nested__"
                v-bind="$props">
              </component>
            </td>
          </tr>
        </transition>
      </template>
    </template>
    <tr v-else-if="!leftFixed && !rightFixed">
      <td :colspan="colLen" class="text-center text-muted">
        {{ $i18nForDatatable('No Data') }} 
      </td>
    </tr>
  </tbody>
</template>
<script>
import MultiSelect from './MultiSelect.vue'
import props from '../_mixins/props'
import shouldRenderSelection from '../_mixins/shouldRenderSelection'

export default {
  name: 'TableBody',
  components: { MultiSelect },
  mixins: [props, shouldRenderSelection],
  methods: {
    onTippyMouseEnter(e){
      if(e.target._tippy != null && (e.target.offsetWidth < e.target.scrollWidth)){
        e.target._tippy.show();
      }
    },
    onTippyMouseLeave(e, vNode){
      if(e.target._tippy != null && (e.target.offsetWidth < e.target.scrollWidth)){
        e.target._tippy.hide();
      }
    }
  },
  computed: {
    colLen () {
      return this.columns.length + !!this.selection
    },
    tableColumns() {
      if(this.leftFixed){
        return this.columns.filter(col => col.fixed === true || col.fixed === 'left' );
      } else if (this.rightFixed){
        return this.columns.filter(col => col.fixed === 'right' );
      } else {
        return this.columns.filter(col => col.fixed !== true && col.fixed !== 'left' && col.fixed !== 'right');
      }
    }
  }
}
</script>
