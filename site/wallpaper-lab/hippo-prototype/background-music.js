/* A quiet, original piano-like arpeggio. Audio begins only after the player opts in. */
(()=>{
 const button=document.querySelector('#music-toggle'),status=document.querySelector('#music-status');
 if(!button||!status)return;
 const AudioContextClass=window.AudioContext||window.webkitAudioContext;
 let context=null,master=null,timer=0,playing=false,step=0;
 const bars=[
  {bass:146.83,chord:[293.66,369.99,440.00],melody:[587.33,554.37,493.88,440.00]},
  {bass:123.47,chord:[246.94,293.66,369.99],melody:[493.88,440.00,369.99,440.00]},
  {bass:98.00,chord:[196.00,246.94,293.66],melody:[392.00,440.00,493.88,440.00]},
  {bass:110.00,chord:[220.00,277.18,329.63],melody:[440.00,493.88,554.37,493.88]}
 ];
 function note(frequency,when,duration,volume,wave='sine'){
  const osc=context.createOscillator(),gain=context.createGain();osc.type=wave;osc.frequency.value=frequency;gain.gain.setValueAtTime(.0001,when);gain.gain.exponentialRampToValueAtTime(volume,when+.08);gain.gain.exponentialRampToValueAtTime(.0001,when+duration);osc.connect(gain);gain.connect(master);osc.start(when);osc.stop(when+duration+.04);
 }
 function scheduleBar(){if(!playing)return;const bar=bars[step++%bars.length],start=context.currentTime+.05;
  note(bar.bass,start,3.7,.018,'triangle');
  bar.chord.forEach((f,i)=>note(f,start+i*.48,2.6,.009,'sine'));
  bar.melody.forEach((f,i)=>note(f,start+.25+i*.82,1.0,.018,'sine'));
  timer=window.setTimeout(scheduleBar,3200);
 }
 async function start(){if(!AudioContextClass){status.textContent='Audio is unavailable in this browser.';return}if(!context){context=new AudioContextClass();master=context.createGain();master.gain.value=.48;master.connect(context.destination)}if(context.state==='suspended')await context.resume();playing=true;button.setAttribute('aria-pressed','true');button.textContent='♫ Pause quiet music';status.textContent='Soft original piano motif is playing.';scheduleBar()}
 function stop(){playing=false;window.clearTimeout(timer);if(master)master.gain.setTargetAtTime(.0001,context.currentTime,.08);button.setAttribute('aria-pressed','false');button.textContent='♫ Play quiet music';status.textContent='Sound is off.';window.setTimeout(()=>{if(!playing&&master)master.gain.setTargetAtTime(.48,context.currentTime,.05)},350)}
 button.addEventListener('click',()=>playing?stop():start().catch(()=>{status.textContent='Audio could not start. Try the music button again.'}));
})();
