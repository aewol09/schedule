// components/FloatingButton.js
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import styles from '../styles/FloatingButtonStyles';

const FloatingButton = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress}>
      <Text style={styles.fabText}>+</Text>
    </TouchableOpacity>
  );
};

export default FloatingButton;