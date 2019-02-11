<template>
  <div style="margin: 0 auto; width: 100%">
    <code>query: {{ query }}</code>
    <datatable v-bind="$data" />
  </div>
</template>
<script>
import mockData from '../_mockData'
import { setTimeout } from 'timers';

export default {
  data: () => ({
    gridName: 'fixedGrid2',
    fixHeaderAndSetBodyMaxHeight: 800,
    tblStyle: 'table-layout: fixed', // must
    tblClass: 'table-bordered',
    columns: [
      { title: 'User ID', field: 'uid', sortable: true, fixed: true },
      { title: 'Username', field: 'name' },
      { title: 'Age', field: 'age', sortable: true },
      { title: 'Email', field: 'email' },
      { title: 'Country', field: 'country'}
    ].map(col => (col.colStyle = { width: '200px' }, col)),
    data: [],
    summary: {},
    pending: true,
    total: 0,
    query: {},
    supportBackup: true,
    fullHeight: {
      enabled: true,
      heightCorrection: -350
    },
    selection: [],
  }),
  mounted(){
    setTimeout(() => {
      this.pending = false;
    }, 2000);
  },
  watch: {
    query: {
      handler (query) {
        mockData(query).then(({ rows, total, summary }) => {
          this.data = rows.slice(1, 10);
          this.total = 10
          this.summary = summary
        })
      },
      deep: true
    }
  }
}
</script>
