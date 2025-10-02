// App.js
import React, { useState, useEffect } from 'react';
import { View, StatusBar, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

import Header from './components/Header';
import TaskList from './components/TaskList';
import FloatingButton from './components/FloatingButton';
import AddTaskModal from './components/modals/AddTaskModal';
import SettingsModal from './components/modals/SettingsModal';
import NotificationOverlay from './components/NotificationOverlay';
import styles from './styles/AppStyles';
import { scheduleNotification, cancelNotification } from './utils/notificationManager';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [dailyTasks, setDailyTasks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // 데이터 로드
  const loadData = async () => {
    try {
      const savedTasks = await AsyncStorage.getItem('tasks');
      const savedDailyTasks = await AsyncStorage.getItem('dailyTasks');
      
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
      
      if (savedDailyTasks) {
        const parsedDailyTasks = JSON.parse(savedDailyTasks);
        setDailyTasks(parsedDailyTasks);
        
        // 매일 자정에 일일 일정 초기화
        const today = new Date().toDateString();
        const lastReset = await AsyncStorage.getItem('lastReset');
        
        if (lastReset !== today) {
          const resetDailyTasks = parsedDailyTasks.map(task => ({
            ...task,
            completed: false,
          }));
          setDailyTasks(resetDailyTasks);
          await AsyncStorage.setItem('dailyTasks', JSON.stringify(resetDailyTasks));
          await AsyncStorage.setItem('lastReset', today);
        }
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    }
  };

  // 데이터 저장
  const saveData = async (newTasks, newDailyTasks = dailyTasks) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(newTasks));
      await AsyncStorage.setItem('dailyTasks', JSON.stringify(newDailyTasks));
    } catch (error) {
      console.error('데이터 저장 실패:', error);
    }
  };

  // 알림 표시 함수
  const showNotification = (title, message, type = 'info') => {
    const notification = {
      id: Date.now().toString(),
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // 5초 후 자동 제거
    setTimeout(() => {
      removeNotification(notification.id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  useEffect(() => {
    loadData();
    
    // 알림 시간 체크 (1분마다)
    const checkNotifications = () => {
      const now = new Date();
      const currentTime = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      // 매일 할 일 알림 체크
      dailyTasks.forEach(task => {
        if (task.notificationTime && !task.completed) {
          const taskTime = new Date(task.notificationTime);
          const taskTimeString = `${taskTime.getHours()}:${taskTime.getMinutes().toString().padStart(2, '0')}`;
          
          if (currentTime === taskTimeString) {
            showNotification('매일 할 일 알림 📋', task.title, 'reminder');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }
        }
      });
      
      // 오늘 할 일 알림 체크
      tasks.forEach(task => {
        if (task.notificationTime) {
          const taskTime = new Date(task.notificationTime);
          const taskTimeString = `${taskTime.getHours()}:${taskTime.getMinutes().toString().padStart(2, '0')}`;
          
          if (currentTime === taskTimeString) {
            showNotification('일정 알림 📋', task.title, 'reminder');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }
        }
      });
    };

    const interval = setInterval(checkNotifications, 60000); // 1분마다 체크
    
    return () => clearInterval(interval);
  }, [tasks, dailyTasks]);

  const addTask = (newTask) => {
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveData(updatedTasks);
    showNotification('새 일정 추가됨', newTask.title, 'success');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const addDailyTask = (newTask) => {
    const updatedDailyTasks = [...dailyTasks, newTask];
    setDailyTasks(updatedDailyTasks);
    saveData(tasks, updatedDailyTasks);
    showNotification('매일 할 일 추가됨', newTask.title, 'success');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const completeTask = async (taskId) => {
    const task = [...tasks, ...dailyTasks].find(t => t.id === taskId);
    
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    const updatedDailyTasks = dailyTasks.map(task => 
      task.id === taskId ? { ...task, completed: true } : task
    );
    
    setTasks(updatedTasks);
    setDailyTasks(updatedDailyTasks);
    saveData(updatedTasks, updatedDailyTasks);
    
    showNotification('일정 완료! 🎉', task?.title || '일정이 완료되었습니다', 'success');
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const deleteTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    saveData(updatedTasks);
    
    showNotification('일정 삭제됨', task?.title || '일정이 삭제되었습니다', 'warning');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const saveDailyTasks = (newDailyTasks) => {
    setDailyTasks(newDailyTasks);
    saveData(tasks, newDailyTasks);
    showNotification('설정 저장됨', '매일 할 일이 업데이트되었습니다', 'success');
  };

  // 일정 순서 변경
  const reorderTasks = (fromIndex, toIndex) => {
    const allTasksList = [
      ...dailyTasks.filter(task => !task.completed),
      ...tasks
    ];
    
    const [movedTask] = allTasksList.splice(fromIndex, 1);
    allTasksList.splice(toIndex, 0, movedTask);
    
    // 매일 할 일과 오늘 할 일 분리
    const newDailyTasks = allTasksList.filter(task => task.isDaily);
    const newTasks = allTasksList.filter(task => !task.isDaily);
    
    // 완료된 매일 할 일 다시 추가
    const completedDailyTasks = dailyTasks.filter(task => task.completed);
    const finalDailyTasks = [...newDailyTasks, ...completedDailyTasks];
    
    setTasks(newTasks);
    setDailyTasks(finalDailyTasks);
    saveData(newTasks, finalDailyTasks);
    
    showNotification('순서 변경됨', '일정 순서가 변경되었습니다', 'success');
  };

  const allTasks = [
    ...dailyTasks.filter(task => !task.completed),
    ...tasks
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <Header onSettingsPress={() => setShowSettingsModal(true)} />
      
      <TaskList 
        tasks={allTasks} 
        onComplete={completeTask}
        onDelete={deleteTask}
        onReorder={reorderTasks}
      />

      <FloatingButton 
        onPress={() => {
          setShowAddModal(true);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      />

      <AddTaskModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addTask}
        onAddDaily={addDailyTask}
      />

      <SettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        dailyTasks={dailyTasks}
        onSaveDailyTasks={saveDailyTasks}
      />

      <NotificationOverlay 
        notifications={notifications}
        onRemove={removeNotification}
      />
    </View>
  );
}