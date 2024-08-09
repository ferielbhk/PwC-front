import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Chat } from '../classes/chat';
import { BehaviorSubject, Observable, Subject, map } from 'rxjs';
import SockJS from 'sockjs-client';
import { Client, Message, Stomp } from '@stomp/stompjs';
import { AuthService } from './auth.service';
import { Notificationn } from '../classes/notificationn';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private client: Client;
  private messageSubject = new BehaviorSubject<Chat[]>([]);
  public messages$ = this.messageSubject.asObservable();

  

  constructor(private http: HttpClient , private notificationService :NotificationService) {
    this.client = new Client();
    this.connectWebSocket()
  }

  connectWebSocket() {
    const WebSocketClass = SockJS;

    this.client.configure({
      webSocketFactory: () => new WebSocketClass('http://localhost:8089/ws'),
      reconnectDelay: 50000,
      debug: (str) => console.log(str),
    });

    this.client.onConnect = () => {
      console.log('Connected to WebSocket');
      this.client.subscribe('/topic/messages', (message) => {
        const parsedMessage: Chat = JSON.parse(message.body);
        console.log('WebSocket message received:', parsedMessage);
        this.notificationService.showNotification(`New message from ${parsedMessage.senderId}: ${parsedMessage.content}`);

        const currentMessages = this.messageSubject.getValue();
        this.messageSubject.next([...currentMessages, parsedMessage]);
      });
      

    
    };

    this.client.onStompError = (frame) => {
      console.error(`Broker reported error: ${frame.headers['message']}`);
      console.error(`Additional details: ${frame.body}`);
    };

    this.client.onWebSocketClose = () => {
      console.log('WebSocket connection closed');
      this.scheduleReconnect();
    };

    this.client.activate();
  }

  private scheduleReconnect() {
    console.log('Scheduling reconnection in 5 seconds...');
    setTimeout(() => {
      this.connectWebSocket();
    }, 50000);
  }

  disconnectWebSocket() {
    if (this.client && this.client.connected) {
      this.client.deactivate();
    }
  }

  sendMessage(message: any) {
    if (this.client && this.client.connected) {
      this.client.publish({
        destination: '/app/chat-message',
        body: JSON.stringify(message)
      });
    } else {
      console.error('STOMP client is not connected.');
    }
  }
 

  fetchMessages() {
    if (this.client && this.client.connected) {
      this.client.publish({
        destination: '/app/fetch-messages'
      });
    } else {
      console.error('STOMP client is not connected.');
    }
  }
  
  getAllMessages(): Observable<Chat[]> {
    return this.http.get<Chat[]>('http://localhost:8089/api/messages').pipe(
      map(messages => {
        this.messageSubject.next(messages);
        return messages;
      })
    );
  }


}
