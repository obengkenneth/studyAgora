import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';

// App color scheme
const COLORS = {
  primary: '#4CAF50', // Green
  primaryLight: '#81C784', // Light Green
  secondary: '#D32F2F', // Red
  secondaryLight: '#EF5350', // Light Red
  accent: '#FFD700', // Gold
  accentLight: '#FFEB3B', // Light Gold
  text: '#1F2937',
  lightText: '#6B7280',
  background: '#FFFFFF',
};

export default function Button({ 
  title, 
  onPress, 
  loading = false, 
  disabled = false,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'danger'
  size = 'medium', // 'small', 'medium', 'large'
  fullWidth = false,
  style = {},
  textStyle = {},
}) {
  // Determine button style based on variant
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return disabled || loading ? styles.primaryButtonDisabled : styles.primaryButton;
      case 'secondary':
        return disabled || loading ? styles.secondaryButtonDisabled : styles.secondaryButton;
      case 'outline':
        return disabled || loading ? styles.outlineButtonDisabled : styles.outlineButton;
      case 'danger':
        return disabled || loading ? styles.dangerButtonDisabled : styles.dangerButton;
      default:
        return styles.primaryButton;
    }
  };

  // Determine text style based on variant
  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryButtonText;
      case 'secondary':
        return disabled || loading ? styles.secondaryButtonTextDisabled : styles.secondaryButtonText;
      case 'outline':
        return disabled || loading ? styles.outlineButtonTextDisabled : styles.outlineButtonText;
      case 'danger':
        return styles.dangerButtonText;
      default:
        return styles.primaryButtonText;
    }
  };

  // Determine padding based on size
  const getPaddingStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallButton;
      case 'medium':
        return styles.mediumButton;
      case 'large':
        return styles.largeButton;
      default:
        return styles.mediumButton;
    }
  };

  // Determine text size based on button size
  const getTextSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallText;
      case 'medium':
        return styles.mediumText;
      case 'large':
        return styles.largeText;
      default:
        return styles.mediumText;
    }
  };

  const buttonStyles = [
    styles.button,
    getButtonStyle(),
    getPaddingStyle(),
    fullWidth && styles.fullWidth,
    style,
  ];

  const textStyles = [
    styles.text,
    getTextStyle(),
    getTextSizeStyle(),
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' ? COLORS.primary : 'white'} 
          size="small" 
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Size styles
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  // Variant styles - Primary
  primaryButton: {
    backgroundColor: COLORS.primary, // Green
  },
  primaryButtonDisabled: {
    backgroundColor: COLORS.primaryLight, // Light Green
  },
  // Variant styles - Secondary
  secondaryButton: {
    backgroundColor: '#e5e7eb', // gray-200
  },
  secondaryButtonDisabled: {
    backgroundColor: '#f3f4f6', // gray-100
  },
  // Variant styles - Outline
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary, // Green
  },
  outlineButtonDisabled: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primaryLight, // Light Green
  },
  // Variant styles - Danger
  dangerButton: {
    backgroundColor: COLORS.secondary, // Red
  },
  dangerButtonDisabled: {
    backgroundColor: COLORS.secondaryLight, // Light Red
  },
  // Text base styles
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // Text size styles
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  // Text variant styles
  primaryButtonText: {
    color: 'white',
  },
  secondaryButtonText: {
    color: '#1f2937', // gray-800
  },
  secondaryButtonTextDisabled: {
    color: '#6b7280', // gray-500
  },
  outlineButtonText: {
    color: COLORS.primary, // Green
  },
  outlineButtonTextDisabled: {
    color: COLORS.primaryLight, // Light Green
  },
  dangerButtonText: {
    color: 'white',
  },
  // Width styles
  fullWidth: {
    width: '100%',
  },
}); 