import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert } from 'react-native';
import { Mic, MicOff, Camera, CameraOff, MessageSquare, Hand, Users, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// App color scheme
const COLORS = {
  primary: '#4CAF50', // Green
  secondary: '#D32F2F', // Red
  accent: '#FFD700', // Gold
  text: '#1F2937',
  lightText: '#6B7280',
  background: '#FFFFFF',
};

export default function LiveSessionScreen({ route, navigation }) {
  const { sessionId } = route.params;
  
  // Session state
  const [micEnabled, setMicEnabled] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [participantsVisible, setParticipantsVisible] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  
  // In a real app, these would be fetched from an API
  const [sessionDetails] = useState({
    id: sessionId,
    title: sessionId === 'algebra-session' ? 'Advanced Algebra' : 'IELTS Speaking Practice',
    instructor: sessionId === 'algebra-session' ? 'Dr. Smith' : 'Ms. Johnson',
  });
  
  // Sample participant data
  const [participants] = useState([
    { id: '1', name: 'Dr. Smith', isInstructor: true },
    { id: '2', name: 'John Doe', isInstructor: false },
    { id: '3', name: 'Emma Wilson', isInstructor: false },
    { id: '4', name: 'Michael Brown', isInstructor: false },
    { id: '5', name: 'Sophia Lee', isInstructor: false },
  ]);
  
  // Sample chat messages
  const [chatMessages, setChatMessages] = useState([
    { id: '1', sender: 'Dr. Smith', message: 'Welcome to today\'s session! We\'ll be covering advanced algebraic equations.', time: '2:02 PM' },
    { id: '2', sender: 'Emma Wilson', message: 'I have a question about yesterday\'s homework.', time: '2:03 PM' },
    { id: '3', sender: 'Dr. Smith', message: 'We\'ll discuss that after the current topic, Emma.', time: '2:03 PM' },
  ]);
  
  const toggleMic = () => {
    // In a real app, this would enable/disable the microphone
    setMicEnabled(!micEnabled);
  };
  
  const toggleCamera = () => {
    // In a real app, this would enable/disable the camera
    setCameraEnabled(!cameraEnabled);
  };
  
  const toggleHand = () => {
    // In a real app, this would send a hand raise notification to the instructor
    setHandRaised(!handRaised);
  };
  
  const toggleChat = () => {
    setChatVisible(!chatVisible);
    if (chatVisible) {
      setParticipantsVisible(false);
    }
  };
  
  const toggleParticipants = () => {
    setParticipantsVisible(!participantsVisible);
    if (participantsVisible) {
      setChatVisible(false);
    }
  };
  
  const sendMessage = () => {
    if (chatMessage.trim() === '') return;
    
    // In a real app, this would send the message to a real-time messaging service
    const newMessage = {
      id: (chatMessages.length + 1).toString(),
      sender: 'You',
      message: chatMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setChatMessages([...chatMessages, newMessage]);
    setChatMessage('');
  };
  
  const leaveSession = () => {
    Alert.alert(
      'Leave Session',
      'Are you sure you want to leave this session?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };
  
  // Render a chat message
  const renderChatMessage = ({ item }) => (
    <View style={styles.chatMessage}>
      <Text style={styles.messageSender}>{item.sender}:</Text>
      <Text style={styles.messageText}>{item.message}</Text>
      <Text style={styles.messageTime}>{item.time}</Text>
    </View>
  );
  
  // Render a participant
  const renderParticipant = ({ item }) => (
    <View style={styles.participantItem}>
      <View style={styles.participantAvatar}>
        <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
      </View>
      <Text style={styles.participantName}>{item.name}</Text>
      {item.isInstructor && (
        <View style={styles.instructorBadge}>
          <Text style={styles.instructorBadgeText}>Instructor</Text>
        </View>
      )}
    </View>
  );
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Session header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.sessionTitle}>{sessionDetails.title}</Text>
            <Text style={styles.instructorName}>with {sessionDetails.instructor}</Text>
          </View>
          <TouchableOpacity 
            style={styles.leaveButton}
            onPress={leaveSession}
          >
            <X size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.mainContent}>
          {/* Stream container - in a real app, this would be the video stream */}
          <View style={styles.streamContainer}>
            {!cameraEnabled ? (
              <View style={styles.placeholderStream}>
                <Text style={styles.placeholderText}>
                  {sessionDetails.instructor}'s stream
                </Text>
              </View>
            ) : (
              <View style={styles.placeholderStream}>
                <Text style={styles.placeholderText}>Your camera is on</Text>
              </View>
            )}
          </View>
          
          {/* Chat/Participants panel */}
          {(chatVisible || participantsVisible) && (
            <View style={styles.sidePanel}>
              {chatVisible && (
                <>
                  <View style={styles.panelHeader}>
                    <Text style={styles.panelTitle}>Chat</Text>
                  </View>
                  <FlatList
                    data={chatMessages}
                    renderItem={renderChatMessage}
                    keyExtractor={item => item.id}
                    style={styles.chatList}
                  />
                  <View style={styles.chatInputContainer}>
                    <TextInput
                      style={styles.chatInput}
                      value={chatMessage}
                      onChangeText={setChatMessage}
                      placeholder="Type a message..."
                      placeholderTextColor={COLORS.lightText}
                    />
                    <TouchableOpacity 
                      style={styles.sendButton}
                      onPress={sendMessage}
                    >
                      <Text style={styles.sendButtonText}>Send</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
              
              {participantsVisible && (
                <>
                  <View style={styles.panelHeader}>
                    <Text style={styles.panelTitle}>Participants ({participants.length})</Text>
                  </View>
                  <FlatList
                    data={participants}
                    renderItem={renderParticipant}
                    keyExtractor={item => item.id}
                    style={styles.participantsList}
                  />
                </>
              )}
            </View>
          )}
        </View>
        
        {/* Control bar */}
        <View style={styles.controlBar}>
          <TouchableOpacity 
            style={[
              styles.controlButton, 
              micEnabled ? styles.activeControl : {}
            ]}
            onPress={toggleMic}
          >
            {micEnabled ? (
              <Mic size={24} color={micEnabled ? "#fff" : COLORS.text} />
            ) : (
              <MicOff size={24} color={COLORS.text} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.controlButton, 
              cameraEnabled ? styles.activeControl : {}
            ]}
            onPress={toggleCamera}
          >
            {cameraEnabled ? (
              <Camera size={24} color="#fff" />
            ) : (
              <CameraOff size={24} color={COLORS.text} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.controlButton, 
              chatVisible ? styles.activeControl : {}
            ]}
            onPress={toggleChat}
          >
            <MessageSquare size={24} color={chatVisible ? "#fff" : COLORS.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.controlButton, 
              handRaised ? styles.activeControl : {}
            ]}
            onPress={toggleHand}
          >
            <Hand size={24} color={handRaised ? "#fff" : COLORS.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.controlButton, 
              participantsVisible ? styles.activeControl : {}
            ]}
            onPress={toggleParticipants}
          >
            <Users size={24} color={participantsVisible ? "#fff" : COLORS.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.controlButton, styles.leaveControlButton]}
            onPress={leaveSession}
          >
            <Text style={styles.leaveText}>Leave</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: 16,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  instructorName: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  leaveButton: {
    backgroundColor: COLORS.secondary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  streamContainer: {
    flex: 1,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidePanel: {
    width: '40%',
    backgroundColor: '#f5f5f5',
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
  },
  placeholderStream: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 16,
  },
  controlBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeControl: {
    backgroundColor: COLORS.primary,
  },
  leaveControlButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
  leaveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  panelHeader: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  chatList: {
    flex: 1,
  },
  chatMessage: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  messageSender: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  messageText: {
    color: COLORS.text,
    marginTop: 4,
  },
  messageTime: {
    fontSize: 12,
    color: COLORS.lightText,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  chatInputContainer: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  chatInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  participantsList: {
    flex: 1,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  participantName: {
    flex: 1,
    color: COLORS.text,
  },
  instructorBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  instructorBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.text,
  },
}); 