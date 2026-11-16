/* Handel, Water Music: Lentement. User-controlled, with no autoplay. */
(()=>{
 const button=document.querySelector('#music-toggle'),status=document.querySelector('#music-status');
 if(!button||!status)return;
 const track=new Audio(new URL('../../assets/handel-water-music-lentement.mp3',document.baseURI));
 track.loop=true;track.preload='none';track.volume=.32;
 async function start(){
  try{await track.play();button.setAttribute('aria-pressed','true');button.textContent='♫ Pause Handel · Water Music';status.textContent='Handel · Water Music, “Lentement” is playing.'}
  catch{status.textContent='Music could not start. Try the music button again.'}
 }
 function stop(){track.pause();track.currentTime=0;button.setAttribute('aria-pressed','false');button.textContent='♫ Play Handel · Water Music';status.textContent='Sound is off.'}
 button.addEventListener('click',()=>track.paused?start():stop());
 track.addEventListener('error',()=>{status.textContent='The Handel track could not be loaded.';button.setAttribute('aria-pressed','false')});
})();
