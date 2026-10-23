const U=process.env.UPSTASH_REDIS_REST_URL||process.env.KV_REST_API_URL,
  T=process.env.UPSTASH_REDIS_REST_TOKEN||process.env.KV_REST_API_TOKEN;
async function pipe(cmds){
  const r=await fetch(U+'/pipeline',{method:'POST',headers:{Authorization:'Bearer '+T,'Content-Type':'application/json'},body:JSON.stringify(cmds)});
  if(!r.ok)throw new Error('redis '+r.status);
  return (await r.json()).map(x=>{if(x.error)throw new Error(x.error);return x.result});
}
async function snap(full){
  const [h,l]=await pipe([['HGETALL','stock'],['LRANGE','log','0',full?'-1':'199']]);
  const s={};
  for(let i=0;i<h.length;i+=2){const [id,k]=h[i].split(':');(s[id]=s[id]||{r:0,w:0,p:0,m:0})[k]=+h[i+1]}
  return {s,log:l.map(x=>JSON.parse(x))};
}
module.exports=async(req,res)=>{
  res.setHeader('Cache-Control','no-store');
  if(!U||!T)return res.status(503).json({error:'Database not connected'});
  const pin=process.env.APP_PIN;
  if(pin&&req.headers['x-pin']!==pin)return res.status(401).json({error:'Wrong PIN'});
  try{
    if(req.method==='POST'){
      const b=typeof req.body==='string'?JSON.parse(req.body):(req.body||{});
      if(/^[AG]\d{2}$/.test(b.id||'')){
        if(b.m!==undefined)await pipe([['HSET','stock',b.id+':m',String(Math.max(0,parseInt(b.m)||0))]]);
        if(b.d){
          const ks=['r','w','p'].filter(k=>Number.isInteger(b.d[k])&&b.d[k]!==0);
          if(ks.length){
            const out=await pipe(ks.map(k=>['HINCRBY','stock',b.id+':'+k,String(b.d[k])]));
            if(out.some(v=>v<0)){
              await pipe(ks.map(k=>['HINCRBY','stock',b.id+':'+k,String(-b.d[k])]));
              return res.status(409).json({error:'Not enough stock'});
            }
            await pipe([['LPUSH','log',JSON.stringify({id:b.id,d:b.d,note:b.note||'',t:Date.now()})]]);
          }
        }
      }
    }
    res.status(200).json(await snap(req.query&&req.query.full));
  }catch(e){res.status(500).json({error:String(e.message)})}
};
