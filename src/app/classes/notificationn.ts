export class Notificationn {
    id!: number;
   message!:string;
  timestamp!:Date;
    postId?:number;
  userIdReceiver!:number;
  userIdSender!:number;
    read!:boolean;
    type!: 'COMMENT' | 'MESSAGE';  

  }
  