import * as signalR from '@microsoft/signalr';

let connection = null;
let currentCommunityId = null;
let reconnectAttempt = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

const isConnectionValid = () => {
  return connection && 
    (connection.state === signalR.HubConnectionState.Connected || 
     connection.state === signalR.HubConnectionState.Connecting || 
     connection.state === signalR.HubConnectionState.Reconnecting);
};

const getBackoffDelay = (attempt) => {
  return Math.min(1000 * Math.pow(2, attempt), 30000);
};

export const connectToSignalR = (selectedCommunityId) => {
  if (isConnectionValid() && currentCommunityId === selectedCommunityId) {
    console.log('Using socket existing connection')
    return connection;
  }
  
  if (connection) {
    try {
      connection.off("ReceiveEventUpdate");
      connection.stop();
    } catch (err) {
    }
    connection = null;
  }
  
  reconnectAttempt = 0;
  currentCommunityId = selectedCommunityId;
  
  connection = new signalR.HubConnectionBuilder()
    .withUrl('http://localhost:5203/eventHub', {
      skipNegotiation: true,
      transport: signalR.HttpTransportType.WebSockets,
      logger: signalR.LogLevel.Information
    })
    .withAutomaticReconnect({
      nextRetryDelayInMilliseconds: (retryContext) => {
        if (retryContext.previousRetryCount > MAX_RECONNECT_ATTEMPTS) {
          return null;
        }
        
        const delay = getBackoffDelay(retryContext.previousRetryCount);
        return delay;
      }
    })
    .configureLogging(signalR.LogLevel.Information)
    .build();
  
  connection.onreconnected(() => {
    reconnectAttempt = 0;
  });
  
  connection.onclose(() => {
    if (reconnectAttempt < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempt++;
      const delay = getBackoffDelay(reconnectAttempt);
      
      setTimeout(() => {
        if (currentCommunityId) {
          return connectToSignalR(currentCommunityId);
        }
      }, delay);
    }
  });
  
  connection.start()
    .then(() => {
      reconnectAttempt = 0;
    })
    .catch(err => {
      if (reconnectAttempt < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempt++;
        const delay = getBackoffDelay(reconnectAttempt);
        
        setTimeout(() => {
          if (currentCommunityId) {
            return connectToSignalR(currentCommunityId);
          }
        }, delay);
      }
    });
  
  return connection;
};

export const disconnectSignalR = () => {
  if (connection) {
    try {
      connection.off("ReceiveEventUpdate");
      connection.stop()
        .then(() => {
          connection = null;
          currentCommunityId = null;
        })
        .catch(() => {
          connection = null;
          currentCommunityId = null;
        });
    } catch (err) {
      connection = null;
      currentCommunityId = null;
    }
  }
};

export const ensureConnected = (communityId) => {
  if (!isConnectionValid() && communityId) {
    return connectToSignalR(communityId);
  }
  return connection;
};

