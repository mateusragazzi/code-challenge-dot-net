import * as signalR from '@microsoft/signalr';
import { 
  connectToSignalR, 
  disconnectSignalR, 
  ensureConnected 
} from '../../src/services/signalRService';

jest.mock('@microsoft/signalr', () => {
  const mockConnection = {
    start: jest.fn().mockResolvedValue(),
    stop: jest.fn().mockResolvedValue(),
    on: jest.fn(),
    off: jest.fn(),
    state: 'Disconnected',
    onreconnected: jest.fn(),
    onclose: jest.fn()
  };
  
  return {
    HubConnectionBuilder: jest.fn(() => ({
      withUrl: jest.fn().mockReturnThis(),
      withAutomaticReconnect: jest.fn().mockReturnThis(),
      configureLogging: jest.fn().mockReturnThis(),
      build: jest.fn().mockReturnValue(mockConnection)
    })),
    HubConnectionState: {
      Connected: 'Connected',
      Connecting: 'Connecting',
      Disconnected: 'Disconnected',
      Reconnecting: 'Reconnecting'
    },
    HttpTransportType: {
      WebSockets: 1
    },
    LogLevel: {
      Information: 1
    }
  };
});

describe('SignalR Service', () => {
  let mockConnection;

  beforeEach(() => {
    jest.clearAllMocks();
    mockConnection = new signalR.HubConnectionBuilder().build();
  });

  it('should create a new connection when connectToSignalR is called', () => {
    const communityId = '123';
    const connection = connectToSignalR(communityId);
    
    expect(signalR.HubConnectionBuilder).toHaveBeenCalled();
    expect(connection.start).toHaveBeenCalled();
  });

  it('should reuse existing connection if valid and for same community', () => {
    const communityId = '123';
    mockConnection.state = signalR.HubConnectionState.Connected;
    
    const connection1 = connectToSignalR(communityId);
    
    jest.clearAllMocks();
    
    const connection2 = connectToSignalR(communityId);
    
    expect(signalR.HubConnectionBuilder).not.toHaveBeenCalled();
  });

  it('should create a new connection if community changes', () => {
    const communityId1 = '123';
    const communityId2 = '456';
    
    connectToSignalR(communityId1);
    
    jest.clearAllMocks();
    
    connectToSignalR(communityId2);
    
    expect(signalR.HubConnectionBuilder).toHaveBeenCalled();
  });

  it('should disconnect when disconnectSignalR is called', () => {
    const communityId = '123';
    
    const connection = connectToSignalR(communityId);
    
    disconnectSignalR();
    
    expect(connection.off).toHaveBeenCalledWith("ReceiveEventUpdate");
    expect(connection.stop).toHaveBeenCalled();
  });

  it('should ensure connection is established when ensureConnected is called', () => {
    const communityId = '123';
    mockConnection.state = signalR.HubConnectionState.Disconnected;
    
    ensureConnected(communityId);
    
    expect(signalR.HubConnectionBuilder).toHaveBeenCalled();
  });

  it('should not create new connection if already connected', () => {
    const communityId = '123';
    
    connectToSignalR(communityId);
    
    mockConnection.state = signalR.HubConnectionState.Connected;
    
    jest.clearAllMocks();
    
    ensureConnected(communityId);
    
    expect(signalR.HubConnectionBuilder).not.toHaveBeenCalled();
  });
});
