/* Earlier approved crayon artwork; the original environment DOM remains live. */
(function () {
  'use strict';
  var assets={
    subway:'subway-color-pencil-v2',subway2:'subway-color-pencil-v2',
    night:'office-night-crayon',office:'office-day-crayon',
    split:'split-call-crayon',call:'split-call-crayon',lobby:'lobby-crayon',
    meeting:'meeting-crayon',street:'street-crayon',city:'street-crayon',platform:'platform-crayon'
  };
  window.LoveArt={html:function(kind,original) {
    var file=assets[kind];
    if(kind==='subway'||kind==='subway2') {
      original=original.replace('class="strap" style="left:16%','class="strap" style="left:22.4%')
        .replace('class="strap" style="left:38%','class="strap" style="left:36.7%')
        .replace('class="strap" style="left:62%','class="strap" style="left:59.6%')
        .replace('class="strap" style="left:86%','class="strap" style="left:75.1%');
      original=[22.2,36.5,59.4,74.9].map(x=>'<i class="strap-erase" style="left:'+x+'%"></i>').join('')+original;
    }
    return '<div class="art-world art-'+kind+(file?' has-art':'')+'"'+
      (file?' style="--scene-art:url(assets/backgrounds/'+file+'.png)"':'')+'>'+original+'</div>';
  }};
})();
