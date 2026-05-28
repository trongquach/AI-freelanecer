import { useEffect, useRef, useState } from 'react';
import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuthStore } from '@/store/authStore';

const WS_URL = 'http://localhost:8080/ws';

export function useWebSocket() {
  const { accessToken } = useAuthStore();
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!accessToken) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      debug: (str) => {
        // console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setIsConnected(true);
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [accessToken]);

  const subscribe = (topic: string, callback: (message: any) => void): StompSubscription | null => {
    if (!clientRef.current || !clientRef.current.connected) return null;
    return clientRef.current.subscribe(topic, (message) => {
      callback(JSON.parse(message.body));
    });
  };

  const publish = (destination: string, body: any) => {
    if (!clientRef.current || !clientRef.current.connected) return;
    clientRef.current.publish({
      destination,
      body: JSON.stringify(body),
    });
  };

  return { isConnected, subscribe, publish };
}
