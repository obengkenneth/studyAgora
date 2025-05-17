import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions,
  Platform
} from 'react-native';
import { Video } from 'expo-av';
import { Pause, Play, Volume2, VolumeX, Maximize, Minimize, RotateCcw } from 'lucide-react-native';

// App color scheme
const COLORS = {
  primary: '#4CAF50', // Green
  secondary: '#D32F2F', // Red
  accent: '#FFD700', // Gold
  text: '#1F2937',
  lightText: '#6B7280',
  background: '#FFFFFF',
};

const VideoPlayer = ({ videoUri, title }) => {
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef(null);
  
  const handlePlaybackStatusUpdate = (status) => {
    setStatus(status);
    if (status.isLoaded && loading) {
      setLoading(false);
    }
  };
  
  const togglePlayPause = async () => {
    if (status.isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
  };
  
  const toggleMute = async () => {
    await videoRef.current.setIsMutedAsync(!status.isMuted);
  };
  
  const toggleFullscreen = async () => {
    if (isFullscreen) {
      await videoRef.current.dismissFullscreenPlayer();
    } else {
      await videoRef.current.presentFullscreenPlayer();
    }
    setIsFullscreen(!isFullscreen);
  };
  
  const restartVideo = async () => {
    await videoRef.current.setPositionAsync(0);
    if (!status.isPlaying) {
      await videoRef.current.playAsync();
    }
  };
  
  const { width } = Dimensions.get('window');
  
  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          style={styles.video}
          source={{ uri: videoUri }}
          useNativeControls={Platform.OS === 'ios'} // Use native controls on iOS
          resizeMode="contain"
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          onFullscreenUpdate={({ fullscreenUpdate }) => {
            // Check if player was dismissed (exited fullscreen)
            // For expo-av Video, use Video.FULLSCREEN_UPDATE_PLAYER_DID_DISMISS
            if (fullscreenUpdate === Video.FULLSCREEN_UPDATE_PLAYER_DID_DISMISS) {
              setIsFullscreen(false);
            }
          }}
        />
        
        {loading && (
          <ActivityIndicator 
            style={styles.loader} 
            size="large" 
            color={COLORS.primary} 
          />
        )}
        
        {/* Custom controls for Android (iOS uses native controls) */}
        {Platform.OS === 'android' && !loading && (
          <View style={styles.controls}>
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={togglePlayPause}
            >
              {status.isPlaying ? (
                <Pause size={24} color="white" />
              ) : (
                <Play size={24} color="white" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={toggleMute}
            >
              {status.isMuted ? (
                <VolumeX size={24} color="white" />
              ) : (
                <Volume2 size={24} color="white" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={restartVideo}
            >
              <RotateCcw size={24} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={toggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize size={24} color="white" />
              ) : (
                <Maximize size={24} color="white" />
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 12,
    color: COLORS.text,
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loader: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 10,
  },
  controlButton: {
    padding: 8,
  },
});

export default VideoPlayer; 