import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// App color scheme
const COLORS = {
  primary: '#4CAF50', // Green
  secondary: '#D32F2F', // Red
  accent: '#FFD700', // Gold
  text: '#1F2937',
  lightText: '#6B7280',
  background: '#FFFFFF',
};

/**
 * Reusable Breadcrumbs component
 * @param {Array} items - Array of breadcrumb items with label, onPress, and isActive properties
 */
const Breadcrumbs = ({ items = [] }) => {
  if (items.length === 0) return null;
  
  return (
    <View style={styles.breadcrumbs}>
      {items.map((item, index) => (
        <React.Fragment key={`${item.label}-${index}`}>
          {/* Add separator between items */}
          {index > 0 && <Text style={styles.breadcrumbSeparator}>/</Text>}
          
          {/* Breadcrumb item */}
          <TouchableOpacity
            style={[
              styles.breadcrumbItem,
              item.isActive && styles.breadcrumbItemActive
            ]}
            onPress={item.onPress}
            disabled={!item.onPress || item.isActive}
          >
            <Text style={styles.breadcrumbText}>{item.label}</Text>
          </TouchableOpacity>
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  breadcrumbs: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexWrap: 'wrap',
  },
  breadcrumbItem: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  breadcrumbItemActive: {
    backgroundColor: '#E5E7EB',
  },
  breadcrumbText: {
    fontSize: 14,
    color: COLORS.text,
  },
  breadcrumbSeparator: {
    marginHorizontal: 8,
    color: COLORS.lightText,
  },
});

export default Breadcrumbs;
