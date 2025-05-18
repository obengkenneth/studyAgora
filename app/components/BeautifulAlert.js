import React, { useRef, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react-native';

const { width } = Dimensions.get('window');

// App color scheme: green, red, gold accent
const COLORS = {
  primary: '#4CAF50', // Green as primary
  success: '#4CAF50', // Green for success
  warning: '#FFD700', // Gold for warning
  error: '#F44336',  // Red for error
  info: '#4CAF50',   // Green for info
  background: '#FFFFFF',
  text: '#333333',
  lightText: '#666666',
  borderColor: '#EEEEEE'
};

// Global reference to access alert functionality
let alertRef = null;

// Function to show alert that can be called from anywhere
export const showAlert = (type = 'info', title = '', message = '', buttons = [], autoClose = true) => {
  if (alertRef) {
    alertRef.show(type, title, message, buttons, autoClose);
  }
};

export class BeautifulAlert extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      type: 'info',
      title: '',
      message: '',
      buttons: [],
      autoClose: true
    };
    
    // Animation values
    this.opacity = new Animated.Value(0);
    this.scale = new Animated.Value(0.9);
    
    // Timer for auto-close
    this.timer = null;
  }
  
  componentDidMount() {
    // Register global reference
    alertRef = this;
  }
  
  componentWillUnmount() {
    // Clear reference and timer
    alertRef = null;
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
  
  // Public method to show alert
  show = (type, title, message, buttons = [], autoClose = true) => {
    // Clear any existing timer
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    
    // Update state with new alert data
    this.setState({
      visible: true,
      type,
      title,
      message,
      buttons,
      autoClose
    }, this.animateIn);
    
    // Set auto-close timer if needed
    if (autoClose) {
      this.timer = setTimeout(this.hide, 3000);
    }
  }
  
  // Animate alert in
  animateIn = () => {
    // Reset animation values
    this.opacity.setValue(0);
    this.scale.setValue(0.9);
    
    // Start animations
    Animated.parallel([
      Animated.timing(this.opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.spring(this.scale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true
      })
    ]).start();
  }
  
  // Animate alert out
  animateOut = (callback) => {
    Animated.parallel([
      Animated.timing(this.opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(this.scale, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true
      })
    ]).start(callback);
  }
  
  // Hide the alert with animation
  hide = () => {
    // Clear any auto-close timer
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    
    // Animate out then update state
    this.animateOut(() => {
      this.setState({ visible: false });
    });
  }
  
  // Get the appropriate icon based on alert type
  getIcon = () => {
    const { type } = this.state;
    const size = 24;
    
    switch (type) {
      case 'success':
        return <CheckCircle2 size={size} color={COLORS.success} />;
      case 'warning':
        return <AlertTriangle size={size} color={COLORS.warning} />;
      case 'error':
        return <AlertTriangle size={size} color={COLORS.error} />;
      case 'info':
      default:
        return <Info size={size} color={COLORS.info} />;
    }
  }
  
  render() {
    const { visible, title, message, buttons } = this.state;
    
    return (
      <Modal
        transparent
        visible={visible}
        animationType="none"
        onRequestClose={this.hide}
      >
        <View style={styles.backdrop}>
          <Animated.View 
            style={[
              styles.alertContainer, 
              { 
                opacity: this.opacity, 
                transform: [{ scale: this.scale }] 
              }
            ]}
          >
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                {this.getIcon()}
              </View>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{title}</Text>
              </View>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={this.hide}
              >
                <X size={20} color={COLORS.lightText} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.contentContainer}>
              <Text style={styles.message}>{message}</Text>
            </View>
            
            {buttons && buttons.length > 0 ? (
              <View style={styles.buttonsContainer}>
                {buttons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      button.primary && styles.primaryButton,
                      button.style
                    ]}
                    onPress={() => {
                      if (button.onPress) button.onPress();
                      this.hide();
                    }}
                  >
                    <Text style={[
                      styles.buttonText,
                      button.primary && styles.primaryButtonText,
                      button.textStyle
                    ]}>
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton, styles.okButton]} 
                onPress={this.hide}
              >
                <Text style={[styles.buttonText, styles.primaryButtonText]}>OK</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>
      </Modal>
    );
  }
}

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
    backgroundColor: COLORS.background,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
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
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 16
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8
  },
  okButton: {
    marginHorizontal: 20,
    marginBottom: 16,
    alignSelf: 'flex-end'
  },
  primaryButton: {
    backgroundColor: COLORS.primary
  },
  buttonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500'
  },
  primaryButtonText: {
    color: '#FFFFFF'
  }
});
