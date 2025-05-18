import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BookText } from 'lucide-react-native';

// App color scheme
const COLORS = {
  primary: '#4CAF50', // Green
  secondary: '#D32F2F', // Red
  accent: '#FFD700', // Gold
  text: '#1F2937',
  lightText: '#6B7280',
  background: '#FFFFFF',
};

const CurriculumCard = ({ curriculum, onPress }) => {
  return (
    <TouchableOpacity style={styles.curriculumCard} onPress={onPress}>
      <View style={styles.cardIconContainer}>
        <BookText size={24} color={COLORS.primary} />
      </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{curriculum.name}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {curriculum.description || 'Explore the learning pathway'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  curriculumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  cardIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.lightText,
  },
});

export default CurriculumCard;
