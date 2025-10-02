// components/modals/AddTaskModal.js
import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import styles from '../../styles/ModalStyles';

const AddTaskModal = ({ visible, onClose, onAdd, onAddDaily }) => {
  const [title, setTitle] = useState('');
  const [isDaily, setIsDaily] = useState(false);
  const [hasNotification, setHasNotification] = useState(false);
  const [notificationTime, setNotificationTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleAdd = async () => {
    if (!title.trim()) {
      Alert.alert('오류', '일정 제목을 입력해주세요.');
      return;
    }

    const newTask = {
      id: Date.now().toString(),
      title: title.trim(),
      isDaily,
      completed: false,
      createdAt: new Date().toISOString(),
      notificationTime: hasNotification ? notificationTime.toISOString() : null,
    };

    // 매일 반복 일정인 경우 매일 할 일로 추가
    if (isDaily) {
      onAddDaily(newTask);
    } else {
      onAdd(newTask);
    }
    
    setTitle('');
    setIsDaily(false);
    setHasNotification(false);
    setNotificationTime(new Date());
    onClose();
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setNotificationTime(selectedTime);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>새 일정 추가</Text>
          
          <TextInput
            style={styles.input}
            placeholder="일정 제목을 입력하세요"
            value={title}
            onChangeText={setTitle}
            multiline
          />

          <TouchableOpacity
            style={[styles.option, isDaily && styles.optionSelected]}
            onPress={() => setIsDaily(!isDaily)}
          >
            <Text style={[styles.optionText, isDaily && styles.optionTextSelected]}>
              📅 매일 반복
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.option, hasNotification && styles.optionSelected]}
            onPress={() => setHasNotification(!hasNotification)}
          >
            <Text style={[styles.optionText, hasNotification && styles.optionTextSelected]}>
              🔔 알림 설정
            </Text>
          </TouchableOpacity>

          {hasNotification && (
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.timeButtonText}>
                ⏰ 알림 시간: {notificationTime.toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </TouchableOpacity>
          )}

          {showTimePicker && (
            <DateTimePicker
              value={notificationTime}
              mode="time"
              is24Hour={false}
              display="default"
              onChange={onTimeChange}
            />
          )}

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
              <Text style={styles.addButtonText}>추가</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddTaskModal;