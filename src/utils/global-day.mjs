export const globalDayMixin = {
 data:()=>({selectedDay:'latest',dayUnavailable:false}),
 created(){
  const accept=this.accept.bind(this);
  this.accept=(data)=>{
   this._globalSnapshot=data;
   const snapshot=this.selectedDay==='previous'?data?.previousDay:data;
   this.dayUnavailable=!snapshot;
   if(!snapshot){this.allItems=[];this.events=[];this.dataDate='';this.updatedAt='';return;}
   accept(snapshot);
  };
  this._dayListener=event=>{
   if(!['latest','previous'].includes(event.detail))return;
   this.selectedDay=event.detail;this.selectedEvent=null;this.selectedId='';this.showAll=false;
   if(this._globalSnapshot)this.accept(this._globalSnapshot);
  };
  window.addEventListener('x-global-day-change',this._dayListener);
 },
 beforeUnmount(){window.removeEventListener('x-global-day-change',this._dayListener);},
 methods:{changeDay(day){window.dispatchEvent(new CustomEvent('x-global-day-change',{detail:day}));}}
};
