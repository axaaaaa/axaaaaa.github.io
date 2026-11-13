import argparse,json,math,urllib.request
from pathlib import Path
from datetime import datetime,timezone,date

def normalize(data):
    if data.get('base')!='USD' or data.get('amount')!=1:raise ValueError('Unexpected base')
    date.fromisoformat(data['date'])
    rates={k:v for k,v in data['rates'].items() if len(k)==3 and k.isalpha() and isinstance(v,(int,float)) and not isinstance(v,bool) and math.isfinite(v) and v>0}
    if 'CNY' not in rates or 'EUR' not in rates:raise ValueError('Incomplete rates')
    rates['USD']=1
    return {'base':'USD','date':data['date'],'rates':rates,'fetchedAt':datetime.now(timezone.utc).isoformat(),'source':'Frankfurter / ECB'}
def main():
    p=argparse.ArgumentParser();p.add_argument('--output',default='public/exchange-rates.json');out=Path(p.parse_args().output)
    try:
        with urllib.request.urlopen('https://api.frankfurter.dev/v1/latest?base=USD',timeout=20) as r:data=normalize(json.loads(r.read(1000000)))
        out.parent.mkdir(parents=True,exist_ok=True);temp=out.with_suffix('.tmp');temp.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');temp.replace(out);print('FX_OK date='+data['date']+' currencies='+str(len(data['rates'])))
    except Exception as error:
        if out.exists():
            try:
                data=json.loads(out.read_text(encoding='utf-8-sig'))
                if data.get('rates',{}).get('USD')==1 and data.get('date'):print(f'FX_PRESERVED {error}');return
            except (ValueError,OSError):pass
        raise SystemExit(f'FX_FAILED {error}')
if __name__=='__main__':main()
