// components/modals/SettingsModal.js
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, FlatList, Alert, StatusBar } from 'react-native';
import * as Haptics from 'expo-haptics';
import DailyTaskAddModal from './DailyTaskAddModal';
import styles from '../../styles/SettingsStyles';

const SettingsModal = ({ visible, onClose, dailyTasks, onSaveDailyTasks }) => {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (visible) {
      setTasks([...dailyTasks]);
    }
  }, [visible, dailyTasks]);

  const addDailyTask = () => {
    if (!newTaskTitle.trim()) return;
    
    const newTask = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      isDaily: true,
      completed: false,
      createdAt: new Date().toISOString(),
      notificationTime: null,
    };
    
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const addDailyTaskWithNotification = async (newTask) => {
    setTasks([...tasks, newTask]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const removeDailyTask = async (id) => {
    setTasks(tasks.filter(task => task.id !== id));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const resetDailyTasks = async () => {
    Alert.alert(
      '매일 할 일 초기화',
      '메인 화면의 매일 할 일을 모두 미완료 상태로 초기화하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '초기화',
          style: 'destructive',
          onPress: () => {
            // 매일 할 일들을 미완료 상태로 초기화
            const resetTasks = tasks.map(task => ({
              ...task,
              completed: false,
            }));
            setTasks(resetTasks);
            onSaveDailyTasks(resetTasks);
            
            Alert.alert('완료', '매일 할 일이 초기화되었습니다.');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const handleSave = () => {
    onSaveDailyTasks(tasks);
    onClose();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.settingsContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.settingsHeader}>
          <Text style={styles.settingsTitle}>⚙️ 매일 할 일 설정</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={resetDailyTasks}
            >
              <Text style={styles.resetButtonText}>🔄 초기화</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveButton}>저장</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.addDailyTaskContainer}>
          <TextInput
            style={styles.dailyTaskInput}
            placeholder="매일 할 일 추가 (간단히)"
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
          />
          <TouchableOpacity style={styles.addDailyButton} onPress={addDailyTask}>
            <Text style={styles.addDailyButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.addWithNotificationContainer}>
          <TouchableOpacity 
            style={styles.addWithNotificationButton} 
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.addWithNotificationText}>🔔 알림과 함께 매일 할 일 추가</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.dailyTaskItem}>
              <View style={styles.dailyTaskInfo}>
                <Text style={styles.dailyTaskTitle}>{item.title}</Text>
                {item.notificationTime && (
                  <Text style={styles.dailyTaskTime}>
                    🔔 {new Date(item.notificationTime).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.removeDailyButton}
                onPress={() => removeDailyTask(item.id)}
              >
                <Text style={styles.removeDailyButtonText}>삭제</Text>
              </TouchableOpacity>
            </View>
          )}
        />

        {/* 매일 할 일 추가 모달 */}
        <DailyTaskAddModal
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={addDailyTaskWithNotification}
        />
      </View>
    </Modal>
  );
};

export default SettingsModal;