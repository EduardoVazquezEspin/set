import type {CustomDialog} from '../WebComponents';

export class DialogManager{
  private CustomDialog: CustomDialog | undefined;
  onWindowLoad(){
  }

  displayError(title: string, message: string, cards: string[]){
    this.CustomDialog = document.createElement('custom-dialog');
    this.CustomDialog.setAttribute('title', title);
    this.CustomDialog.setAttribute('message', message);
    this.CustomDialog.setAttribute('cards', cards.join(','));
    document.body.appendChild(this.CustomDialog);
  }

  closeCustomDialog(){
    if(this.CustomDialog === undefined)
      return;
    document.body.removeChild(this.CustomDialog);
    this.CustomDialog = undefined;
  }
}