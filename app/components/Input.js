import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  style = {},
  containerStyle = {},
  labelStyle = {},
  errorStyle = {},
  ...props
}) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  
  // Only enable toggle for password fields
  const isPassword = secureTextEntry;
  
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
        </Text>
      )}
      
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            error ? styles.inputError : styles.inputDefault,
            isPassword ? styles.inputWithIcon : {},
            style
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={isPassword && !passwordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          {...props}
        />
        
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <Ionicons
              name={passwordVisible ? 'eye-off' : 'eye'}
              size={22}
              color="#6B7280"
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text style={[styles.errorText, errorStyle]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: '#374151', // gray-700
    marginBottom: 4,
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: '#f9fafb', // gray-50
    flex: 1,
  },
  inputWithIcon: {
    paddingRight: 45, // Additional padding for the eye icon
  },
  inputDefault: {
    borderColor: '#d1d5db', // gray-300
  },
  inputError: {
    borderColor: '#ef4444', // red-500
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
  },
  errorText: {
    color: '#ef4444', // red-500
    fontSize: 12,
    marginTop: 4,
  },
}); 