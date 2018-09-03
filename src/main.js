import Datatable from './index.vue'

Datatable.install = function(Vue, options)  {
  const locale = options ? options.locale : {};
  
  // this might be the simplest i18n solution
  Vue.prototype.$i18nForDatatable = function (srcTxt) { return locale[srcTxt] || srcTxt; };
  Vue.component('Datatable', Datatable);
}

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(Datatable);
}

export default Datatable;
