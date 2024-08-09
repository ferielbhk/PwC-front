import { Post } from "./post";
import { Story } from "./story";

export class User {
    id!: number ;
    firstname!: string;
    lastname!:string;
    email!: string;
    image!:File;
    tel!:number;
    informations!:string;
    isActive:boolean=true;
    password!:string
    posts!: Post[];
    stories!:Story[];
}
