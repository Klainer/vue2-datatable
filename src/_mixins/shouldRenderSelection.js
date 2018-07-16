export default {
  props: {
    leftFixed: {
      type: Boolean,
      default: false
    },
    rightFixed: {
      type: Boolean,
      default: false
    },
    isSimpleTable: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    shouldRenderSelection() {
      if (this.rightFixed == false && this.leftFixed == true && this.selection && this.isSimpleTable == false) {
        return true;
      } else if (this.rightFixed == false && this.leftFixed == false && this.selection && this.isSimpleTable == true) {
        return true;
      } else {
        return false;
      }
    }
  }
};
