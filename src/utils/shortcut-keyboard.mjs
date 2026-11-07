export function keyboardKeyId(key){const names={Ctrl:'ControlLeft',Control:'ControlLeft',Cmd:'MetaLeft',Command:'MetaLeft',Win:'MetaLeft',Alt:'AltLeft',Option:'AltLeft',Shift:'ShiftLeft',Space:'Space',Spacebar:'Space',Esc:'Escape',Escape:'Escape',Enter:'Enter',Return:'Enter',Backspace:'Backspace',Delete:'Delete',Tab:'Tab',Left:'ArrowLeft',Right:'ArrowRight',Up:'ArrowUp',Down:'ArrowDown',Home:'Home',End:'End',PageUp:'PageUp',PageDown:'PageDown',Insert:'Insert','`':'Backquote','[':'BracketLeft',']':'BracketRight','\\':'Backslash','/':'Slash',',':'Comma','.':'Period',';':'Semicolon',"'":'Quote','-':'Minus','=':'Equal'};if(/^Numpad[0-9]$/.test(key))return key;if(/^Num[0-9]$/.test(key))return 'Numpad'+key.slice(-1);if(['PrintScreen','ScrollLock','Pause','NumLock','NumpadAdd','NumpadSubtract','NumpadMultiply','NumpadDivide','NumpadDecimal','NumpadEnter'].includes(key))return key;if(Object.hasOwn(names,key))return names[key];if(/^[a-z]$/i.test(key))return 'Key'+key.toUpperCase();if(/^\d$/.test(key))return 'Digit'+key;if(/^F(?:[1-9]|1[0-2])$/.test(key))return key;return null;}
const key=(id,label,width=1)=>({id,label,width});
export function keyboardRows(mac=false){return [
 [key('Escape','Esc'),...Array.from({length:12},(_,i)=>key('F'+(i+1),'F'+(i+1)))],
 [key('Backquote','`'),...Array.from({length:10},(_,i)=>key('Digit'+((i+1)%10),String((i+1)%10))),key('Minus','−'),key('Equal','='),key('Backspace','⌫',1.8)],
 [key('Tab','Tab',1.5),...Array.from('QWERTYUIOP',c=>key('Key'+c,c)),key('BracketLeft','['),key('BracketRight',']'),key('Backslash','\\',1.3)],
 [key('CapsLock','Caps',1.8),...Array.from('ASDFGHJKL',c=>key('Key'+c,c)),key('Semicolon',';'),key('Quote',"'"),key('Enter','Enter',2)],
 [key('ShiftLeft','Shift',2.3),...Array.from('ZXCVBNM',c=>key('Key'+c,c)),key('Comma',','),key('Period','.'),key('Slash','/'),key('ShiftRight','Shift',2.5)],
 mac?[key('ControlLeft','Ctrl',1.2),key('AltLeft','Option',1.2),key('MetaLeft','Cmd ⌘',1.5),key('Space','Space',6),key('MetaRight','Cmd ⌘',1.5),key('AltRight','Option',1.2),key('ControlRight','Ctrl',1.2)]:[key('ControlLeft','Ctrl',1.5),key('MetaLeft','Win',1.2),key('AltLeft','Alt',1.2),key('Space','Space',6),key('AltRight','Alt',1.2),key('ContextMenu','Menu',1.2),key('ControlRight','Ctrl',1.5)]
];}
export function previewStroke(entry,index=0){const stroke=entry?.strokes?.[index]||[],ids=stroke.map(keyboardKeyId).filter(Boolean);return {ids:[...new Set(ids)],unmapped:stroke.filter(k=>!keyboardKeyId(k)),text:stroke.join(' + ')};}

export function keyboardNumpad(){return [
 {id:'NumLock',label:'Num'}, {id:'NumpadDivide',label:'/'}, {id:'NumpadMultiply',label:'*'}, {id:'NumpadSubtract',label:'−'},
 {id:'Numpad7',label:'7'}, {id:'Numpad8',label:'8'}, {id:'Numpad9',label:'9'}, {id:'NumpadAdd',label:'+',tall:true},
 {id:'Numpad4',label:'4'}, {id:'Numpad5',label:'5'}, {id:'Numpad6',label:'6'},
 {id:'Numpad1',label:'1'}, {id:'Numpad2',label:'2'}, {id:'Numpad3',label:'3'}, {id:'NumpadEnter',label:'Enter',tall:true},
 {id:'Numpad0',label:'0',wide:true}, {id:'NumpadDecimal',label:'.'}
];}

export function keyboardNavigation(){return [
 {id:'PrintScreen',label:'PrtSc',row:1,column:1},{id:'ScrollLock',label:'ScrLk',row:1,column:2},{id:'Pause',label:'Pause',row:1,column:3},
 {id:'Insert',label:'Ins',row:2,column:1},{id:'Home',label:'Home',row:2,column:2},{id:'PageUp',label:'PgUp',row:2,column:3},
 {id:'Delete',label:'Del',row:3,column:1},{id:'End',label:'End',row:3,column:2},{id:'PageDown',label:'PgDn',row:3,column:3},
 {id:'ArrowUp',label:'↑',row:5,column:2},
 {id:'ArrowLeft',label:'←',row:6,column:1},{id:'ArrowDown',label:'↓',row:6,column:2},{id:'ArrowRight',label:'→',row:6,column:3}
];}
