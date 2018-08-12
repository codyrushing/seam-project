import Hammer from 'hammerjs';

export default {
  init: function(){
    document.addEventListener("DOMContentLoaded", this.DOMReady.bind(this));
  },
  DOMReady: function(){
    this.hammer = new Hammer(document);
    this.swipeMenu();
    this.navToggle();
  },
  navToggle: function(){
    document.querySelector('header .nav-toggle').addEventListener(
      'click',
      e => {
        e.preventDefault();
        e.stopPropagation();
        window.scrollTo(0,0);
        document.body.classList.toggle('menu-open');
      }
    );
    document.addEventListener(
      'click',
      e => {
        document.body.classList.remove('menu-open');
      }
    );
    document.querySelector('header .main-nav').addEventListener(
      'click',
      e => {
        e.stopPropagation();
      }
    )
  },
  swipeMenu: function(){
    function getStartPosition(e) {
        const delta_x = e.deltaX;
        const delta_y = e.deltaY;
        const final_x = e.srcEvent.pageX || e.srcEvent.screenX || 0;
        const final_y = e.srcEvent.pageY || e.srcEvent.screenY || 0;

        return {
            x: final_x - delta_x,
            y: final_y - delta_y
        }
    };
    this.hammer.on(
      'panleft panright',
      function(e){
        e.preventDefault();
        const { x } = getStartPosition(e);
        console.log(x);
      }
    )
  }
};
