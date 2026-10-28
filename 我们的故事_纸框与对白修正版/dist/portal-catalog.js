(function(root){
  const catalog={game:{id:'love-surprise',title:'惊喜',
    summary:'清晨的一份午饭，一整天的擦肩与回应。走进两个人的视角，替他们做出选择。',
    cover:'train',coverImage:'assets/backgrounds/platform-crayon.png',href:'play.html',playable:true}};
  if(typeof module!=='undefined'&&module.exports)module.exports=catalog;
  else root.StoryCatalog=catalog;
})(typeof globalThis!=='undefined'?globalThis:this);
