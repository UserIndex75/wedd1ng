/* Runs synchronously in <head> (no defer) so the "from-envelope" class is set
   before first paint and the entry transition never flashes. */
(function(){
  try{
    if(sessionStorage.getItem('wedding:from-envelope') === '1'){
      document.documentElement.classList.add('from-envelope');
    }
  }catch(e){}
})();
