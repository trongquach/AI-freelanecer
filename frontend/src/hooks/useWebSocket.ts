import { useEffect, useRef, useState, useCallback } from 'react';
import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuthStore } from '@/store/authStore';

const WS_URL = `${window.location.protocol}//${window.location.host}/ws`;

/**
 * Singleton WebSocket hook — creates ONE connection per session.
 * Exposes subscribe() which works both before and after connection
 * by queuing subscriptions until the client is ready.
 */
export function useWebSocket() {
  const { accessToken } = useAuthStore();
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  // Pending subscriptions requested before WS connected
  const pendingRef = useRef<Array<{ topic: string; cb: (msg: any) => void }>>([]);

  useEffect(() => {
    if (!accessToken) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setIsConnected(true);
        // Flush pending subscriptions
        pendingRef.current.forEach(({ topic, cb }) => {
          client.subscribe(topic, (message) => cb(JSON.parse(message.body)));
        });
        pendingRef.current = [];
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.warn('STOMP error:', frame);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
      setIsConnected(false);
    };
  }, [accessToken]);

  const subscribe = useCallback(
    (topic: string, callback: (message: any) => void): StompSubscription | null => {
      const client = clientRef.current;
      if (!client) return null;

      if (client.connected) {
        return client.subscribe(topic, (message) => {
          try {
            callback(JSON.parse(message.body));
          } catch {
            callback(message.body);
          }
        });
      } else {
        // Queue for when connection is established
        pendingRef.current.push({ topic, cb: callback });
        return null;
      }
    },
    []
  );

  const publish = useCallback((destination: string, body: any) => {
    const client = clientRef.current;
    if (!client || !client.connected) return;
    client.publish({ destination, body: JSON.stringify(body) });
  }, []);

  return { isConnected, subscribe, publish };
}
