import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

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
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
        </Text>
      )}
      
      <TextInput
        style={[
          styles.input,
          error ? styles.inputError : styles.inputDefault,
          style
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        {...props}
      />
      
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
  input: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: '#f9fafb', // gray-50
  },
  inputDefault: {
    borderColor: '#d1d5db', // gray-300
  },
  inputError: {
    borderColor: '#ef4444', // red-500
  },
  errorText: {
    color: '#ef4444', // red-500
    fontSize: 12,
    marginTop: 4,
  },
}); 