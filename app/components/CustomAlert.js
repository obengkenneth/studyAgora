import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Modal } from 'react-native';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#6C63FF',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#2196F3',
  background: '#FFFFFF',
  text: '#333333',
  lightText: '#666666',
  borderColor: '#EEEEEE'
};

// Alert context to manage alerts across the app
export const AlertContext = React.createContext({
  showAlert: () => {},
  hideAlert: () => {}
});

export const AlertProvider = ({ children }) => {
  const [alertConfig, setAlertConfig] = React.useState({
    visible: false,
    type: 'success',
    title: '',
    message: '',
    actions: [],
    autoClose: true
  });
  
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  
  // Show animation
  const animateIn = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true
      })
    ]).start();
  };
  
  // Hide animation
  const animateOut = (callback) => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true
      })
    ]).start(callback);
  };
  
  useEffect(() => {
    if (alertConfig.visible) {
      animateIn();
      
      // Auto close the alert after 3 seconds if autoClose is true
      if (alertConfig.autoClose) {
        const timer = setTimeout(() => {
          hideAlert();
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [alertConfig.visible]);
  
  const showAlert = (config) => {
    // Reset animation values
    opacity.setValue(0);
    scale.setValue(0.9);
    
    setAlertConfig({
      ...config,
      visible: true
    });
  };
  
  const hideAlert = () => {
    animateOut(() => {
      setAlertConfig(prev => ({
        ...prev,
        visible: false
      }));
    });
  };
  
  const getIconByType = (type) => {
    const size = 24;
    
    switch (type) {
      case 'success':
        return <CheckCircle size={size} color={COLORS.success} />;
      case 'warning':
        return <AlertTriangle size={size} color={COLORS.warning} />;
      case 'error':
        return <AlertTriangle size={size} color={COLORS.error} />;
      case 'info':
      default:
        return <Info size={size} color={COLORS.info} />;
    }
  };
  
  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      
      <Modal
        transparent
        visible={alertConfig.visible}
        animationType="none"
        onRequestClose={hideAlert}
      >
        <View style={styles.backdrop}>
          <Animated.View 
            style={[
              styles.alertContainer,
              { 
                opacity, 
                transform: [{ scale }],
                backgroundColor: COLORS.background
              }
            ]}
          >
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                {getIconByType(alertConfig.type)}
              </View>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{alertConfig.title}</Text>
              </View>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={hideAlert}
              >
                <X size={20} color={COLORS.lightText} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.contentContainer}>
              <Text style={styles.message}>{alertConfig.message}</Text>
            </View>
            
            {alertConfig.actions && alertConfig.actions.length > 0 && (
              <View style={styles.actionsContainer}>
                {alertConfig.actions.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.actionButton,
                      action.type === 'primary' && styles.primaryButton,
                      action.style
                    ]}
                    onPress={() => {
                      if (action.onPress) action.onPress();
                      // if this is the last action and we don't have a dismiss button, hide the alert
                      if (!action.preventAutoClose) hideAlert();
                    }}
                  >
                    <Text style={[
                      styles.actionText,
                      action.type === 'primary' && styles.primaryButtonText,
                      action.textStyle
                    ]}>
                      {action.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
};

// Hook to use the alert functionality in components
export const useAlert = () => {
  const context = React.useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  alertContainer: {
    width: width - 40,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minHeight: 120
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor
  },
  iconContainer: {
    marginRight: 12
  },
  titleContainer: {
    flex: 1
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text
  },
  closeButton: {
    padding: 4
  },
  contentContainer: {
    padding: 20
  },
  message: {
    fontSize: 16,
    color: COLORS.lightText,
    lineHeight: 22
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 16
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8
  },
  primaryButton: {
    backgroundColor: COLORS.primary
  },
  actionText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500'
  },
  primaryButtonText: {
    color: '#FFFFFF'
  }
});

// Helper function to show alerts without having to import the hook
// Usage: showAlert('success', 'Success!', 'Operation completed successfully');
export const showAlert = (type, title, message, actions = [], autoClose = true) => {
  const event = new CustomEvent('show-alert', {
    detail: { type, title, message, actions, autoClose }
  });
  document.dispatchEvent(event);
};
