import type {ErrorDialog} from '../WebComponents';

export class ErrorManager{
  private errorDialog: ErrorDialog | undefined;
  onWindowLoad(){
  }

  displayError(title: string, message: string, cards: string[]){
    this.errorDialog = document.createElement('error-dialog');
    this.errorDialog.setAttribute('title', title);
    this.errorDialog.setAttribute('message', message);
    this.errorDialog.setAttribute('cards', cards.join(','));
    document.body.appendChild(this.errorDialog);
  }

  closeErrorDialog(){
    if(this.errorDialog === undefined)
      return;
    document.body.removeChild(this.errorDialog);
    this.errorDialog = undefined;
  }
}