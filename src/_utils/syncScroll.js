import throttle from 'lodash/throttle'
import debounce from 'lodash/debounce'

/**
 * synchronize the scroll position among `els`
 * @param  {DOM[]} els
 * @param  {Func}  callback(offsetLeft)
 * @return {Func}  unsync
 */
export default function (els, callback) {
  let currentDriver

  function syncScroll(me, others) {

    var onScrollSync = throttle(() => {
      if (currentDriver && currentDriver !== me) return
      currentDriver = me

      let offsetLeft = me.scrollLeft;
      let offsetTop = me.scrollTop;

      for(var i = 0; i < others.length; i++){
        others[i].scrollLeft = offsetLeft;
        others[i].scrollTop = offsetTop;
      }

      callback(offsetLeft)
    });

    var onScrollStop = debounce(() => {
      currentDriver = null
    }, 150);

    me.addEventListener("scroll", onScrollSync);
    me.addEventListener("scroll", onScrollStop)

    // unlistener
    return () => {
      me.removeEventListener("scroll", onScrollSync);
      me.removeEventListener("scroll", onScrollStop);
    }
  }
  
  const unlisteners = els.map((me, idx) => {
    let others = els.slice()
    others.splice(idx, 1) // exclude me
    return syncScroll(me, others)
  })

  // unsync
  return () => {
    unlisteners.forEach(unlistener => {
      unlistener()
    })
  }
}
