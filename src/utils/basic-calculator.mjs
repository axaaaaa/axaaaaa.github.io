export function basicCalculatorState() { return { display: '0', stored: null, operator: null, waiting: false, resolved: false, lastOperator: null, lastOperand: null, memory: 0, memorySet: false, error: '', history: [] }; }
export function compactNumber(value) { if (!Number.isFinite(value)) throw Error('计算结果超出有限数值范围'); return Object.is(value,-0)?'0':Number(value.toPrecision(15)).toString(); }
function operate(left,right,operator) { if(operator==='/'&&right===0)throw Error('除数不能为 0');return Number(compactNumber(operator==='+'?left+right:operator==='-'?left-right:operator==='*'?left*right:left/right)); }
export function basicCalculatorStep(previous, input) {
  const state={...previous,history:[...previous.history]},token=({'×':'*','÷':'/','−':'-','Enter':'=','Escape':'AC','Delete':'CE'})[input]||input;
  if(token==='AC')return {...basicCalculatorState(),memory:state.memory,memorySet:state.memorySet,history:state.history};
  if(token==='MC')return {...state,memory:0,memorySet:false};
  if(token==='CE')return {...state,display:'0',waiting:false,resolved:false,error:'',lastOperator:null,lastOperand:null};
  if(state.error&&!/^\d$/.test(token)&&token!=='.'&&token!=='MR')return state;
  if(state.error)Object.assign(state,basicCalculatorState(),{memory:state.memory,memorySet:state.memorySet,history:state.history});
  try {
    if(/^\d$/.test(token)) {
      if(state.waiting||state.resolved||state.display.includes('e')){state.display=token;state.waiting=false;state.resolved=false;state.lastOperator=null;state.lastOperand=null;}
      else if(state.display==='0')state.display=token;
      else if(state.display==='-0')state.display=token==='0'?'-0':'-'+token;
      else if(state.display.replace(/\D/g,'').length<16)state.display+=token;
      return state;
    }
    if(token==='.') { if(state.waiting||state.resolved||state.display.includes('e')){state.display='0.';state.waiting=false;state.resolved=false;state.lastOperator=null;state.lastOperand=null;}else if(!state.display.includes('.'))state.display+='.';return state; }
    if(token==='Backspace'){if(state.waiting&&!state.resolved)return state;state.display=state.display.slice(0,-1);if(!state.display||state.display==='-'||!Number.isFinite(Number(state.display)))state.display='0';state.waiting=false;state.resolved=false;state.lastOperator=null;state.lastOperand=null;return state;}
    if(token==='±'){state.lastOperator=null;state.lastOperand=null;if(state.waiting&&!state.resolved){state.display='-0';state.waiting=false;}else state.display=state.display.startsWith('-')?state.display.slice(1):'-'+state.display;state.resolved=false;return state;}
    if(token==='MR'){state.display=compactNumber(state.memory);state.waiting=false;state.resolved=false;state.lastOperator=null;state.lastOperand=null;return state;}
    if(token==='M+'||token==='M-'){state.memory=Number(compactNumber(state.memory+(token==='M+'?1:-1)*Number(state.display)));state.memorySet=true;return state;}
    if(token==='%'){state.lastOperator=null;state.lastOperand=null;state.resolved=false;const value=Number(state.display);state.display=compactNumber(state.operator&&['+','-'].includes(state.operator)&&state.stored!==null?state.stored*value/100:value/100);state.waiting=false;return state;}
    if(['+','-','*','/'].includes(token)){const current=Number(state.display);if(state.operator&&!state.waiting){state.stored=operate(state.stored,current,state.operator);state.display=compactNumber(state.stored);}else if(state.stored===null)state.stored=current;state.operator=token;state.waiting=true;state.resolved=false;state.lastOperator=null;state.lastOperand=null;return state;}
    if(token==='='){
      let operator=state.operator,right=state.waiting?state.stored:Number(state.display),left=state.stored;
      if(!operator&&state.lastOperator){operator=state.lastOperator;left=Number(state.display);right=state.lastOperand;}
      if(operator){const value=operate(left,right,operator);state.display=compactNumber(value);state.history.unshift(`${compactNumber(left)} ${operator} ${compactNumber(right)} = ${state.display}`);state.history=state.history.slice(0,20);state.lastOperator=operator;state.lastOperand=right;}
      state.stored=null;state.operator=null;state.waiting=true;state.resolved=true;return state;
    }
    return state;
  }catch(error){return {...state,display:'0',stored:null,operator:null,waiting:true,resolved:false,lastOperator:null,lastOperand:null,error:error.message};}
}
