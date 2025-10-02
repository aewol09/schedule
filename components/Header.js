// components/Header.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../styles/HeaderStyles';

const Header = ({ onSettingsPress }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>📋 오늘 할 일</Text>
      <TouchableOpacity 
        style={styles.settingsButton}
        onPress={onSettingsPress}
      >
        <Text style={styles.settingsButtonText}>매일 할 일</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Header;