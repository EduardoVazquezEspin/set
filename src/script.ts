import fs from 'fs';
import {Readable} from 'stream';
import {finished} from 'stream/promises';
import type {ReadableStream} from 'stream/web';

function toBase3(num: number){
  let result = '';
  result += num % 3;
  num = Math.floor(num / 3);
  result += num % 3;
  num = Math.floor(num / 3);
  result += num % 3;
  num = Math.floor(num / 3);
  result += num % 3;
  num = Math.floor(num / 3);
  return result;
}

async function fetchSetImages(){
  for(let index = 1; index <= 81; index++){
    try{
      const id = toBase3(index - 1);
      const res = await fetch(`http://www.setgame.com/sites/all/modules/setgame_set/assets/images/new/${index}.png`);
      const path = `./img/${id}.png`;
      if(fs.existsSync(path)) fs.rmSync(path);
      const fileStream = fs.createWriteStream(path, {flags: 'wx'});
      await finished(Readable.fromWeb(res.body as ReadableStream<any>).pipe(fileStream));
      console.log(`Finished ${index} ${id}`);
    }
    catch(e){
      console.error(e);
    }
  }

}

void fetchSetImages();