import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  Dimensions,
  Platform,
  StatusBar,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';

const { width: screenWidth } = Dimensions.get('window');

// 알림 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// 알림 권한 요청
async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('알림 권한이 필요합니다!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig.extra.eas.projectId,
    })).data;
  } else {
    alert('실제 기기에서 알림 기능을 사용할 수 있습니다.');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

// TaskItem 컴포넌트 (gesture handler 없이 수정)
const TaskItem = ({ task, onComplete, onDelete }) => {
  const [showActions, setShowActions] = useState(false);

  const handleLongPress = () => {
    setShowActions(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleComplete = () => {
    onComplete(task.id);
    setShowActions(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDelete = () => {
    Alert.alert(
      '일정 삭제',
      '이 일정을 삭제하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
          onPress: () => setShowActions(false)
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            onDelete(task.id);
            setShowActions(false);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.taskItem}>
      <Pressable
        onPress={handleComplete}
        onLongPress={handleLongPress}
        style={[
          styles.taskContent,
          { backgroundColor: task.isDaily ? '#E3F2FD' : '#E8F5E8' }
        ]}
      >
        <View style={[
          styles.taskIndicator,
          { backgroundColor: task.isDaily ? '#2196F3' : '#4CAF50' }
        ]} />
        <View style={styles.taskTextContainer}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskType}>
            {task.isDaily ? '매일 할 일' : '오늘 할 일'}
          </Text>
          {task.notificationTime && (
            <Text style={styles.taskTime}>
              알림: {new Date(task.notificationTime).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          )}
          <Text style={styles.taskHint}>
            탭: 완료 | 꾹 누르기: 삭제
          </Text>
        </View>
      </Pressable>

      {/* 액션 모달 */}
      <Modal
        visible={showActions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowActions(false)}
      >
        <Pressable 
          style={styles.actionModalOverlay}
          onPress={() => setShowActions(false)}
        >
          <View style={styles.actionModal}>
            <Text style={styles.actionModalTitle}>{task.title}</Text>
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={handleComplete}
            >
              <Text style={styles.actionButtonText}>✅ 완료</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}
            >
              <Text style={styles.actionButtonText}>🗑️ 삭제</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => setShowActions(false)}
            >
              <Text style={styles.actionButtonText}>취소</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

// 매일 할 일 추가 모달 (알림 설정 가능)
const DailyTaskAddModal = ({ visible, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [hasNotification, setHasNotification] = useState(false);
  const [notificationTime, setNotificationTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleAdd = async () => {
    if (!title.trim()) {
      Alert.alert('오류', '일정을 입력해주세요.');
      return;
    } 

    const newTask = {
      id: Date.now().toString(),
      title: title.trim(),
      isDaily: true,
      completed: false,
      createdAt: new Date().toISOString(),
      notificationTime: hasNotification ? notificationTime.toISOString() : null,
    };

    if (hasNotification) {
      await scheduleNotification(newTask);
    }

    onAdd(newTask);
    setTitle('');
    setHasNotification(false);
    setNotificationTime(new Date());
    onClose();
  };

  const scheduleNotification = async (task) => {
    try {
      const trigger = new Date(task.notificationTime);
      let notificationId;
      
      // 매일 반복 알림
      notificationId = await Notifications.scheduleNotificationAsync({
        identifier: task.id, // 고유 식별자 추가
        content: {
          title: '매일 할 일 알림 📋',
          body: task.title,
          sound: 'default',
          data: { taskId: task.id }
        },
        trigger: {
          hour: trigger.getHours(),
          minute: trigger.getMinutes(),
          repeats: true,
        },
      });
      console.log(`매일 할 일 알림 스케줄 완료: ${task.title}, ID: ${notificationId}`);
    } catch (error) {
      console.error('알림 스케줄 실패:', error);
    }
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
          <Text style={styles.modalTitle}>매일 할 일 추가</Text>
          
          <TextInput
            style={styles.input}
            placeholder="매일 할 일 제목을 입력하세요"
            value={title}
            onChangeText={setTitle}
            multiline
          />

          <TouchableOpacity
            style={[styles.option, hasNotification && styles.optionSelected]}
            onPress={() => setHasNotification(!hasNotification)}
          >
            <Text style={[styles.optionText, hasNotification && styles.optionTextSelected]}>
              🔔 매일 알림 설정
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
            <TouchableOpacity style={styles.cancelButtonModal} onPress={onClose}>
              <Text style={styles.cancelButtonTextModal}>취소</Text>
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

// AddTaskModal 컴포넌트
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

    if (hasNotification) {
      await scheduleNotification(newTask);
    }

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

  const scheduleNotification = async (task) => {
    try {
      const trigger = new Date(task.notificationTime);
      let notificationId;
      
      if (task.isDaily) {
        // 매일 반복 알림
        notificationId = await Notifications.scheduleNotificationAsync({
          identifier: task.id, // 고유 식별자 추가
          content: {
            title: '매일 할 일 알림 📋',
            body: task.title,
            sound: 'default',
            data: { taskId: task.id }
          },
          trigger: {
            hour: trigger.getHours(),
            minute: trigger.getMinutes(),
            repeats: true,
          },
        });
      } else {
        // 일회성 알림
        notificationId = await Notifications.scheduleNotificationAsync({
          identifier: task.id, // 고유 식별자 추가
          content: {
            title: '일정 알림 📋',
            body: task.title,
            sound: 'default',
            data: { taskId: task.id }
          },
          trigger: {
            date: trigger,
          },
        });
      }
      console.log(`알림 스케줄 완료: ${task.title}, ID: ${notificationId}`);
    } catch (error) {
      console.error('알림 스케줄 실패:', error);
    }
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
            <TouchableOpacity style={styles.cancelButtonModal} onPress={onClose}>
              <Text style={styles.cancelButtonTextModal}>취소</Text>
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

// Settings 컴포넌트
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
    // 알림 취소
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
      console.log(`알림 취소 완료: ${id}`);
    } catch (error) {
      console.error('알림 취소 실패:', error);
    }
    
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

// 메인 앱 컴포넌트
export default function App() {
  const [tasks, setTasks] = useState([]);
  const [dailyTasks, setDailyTasks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState('');
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      if (Notifications.removeNotificationSubscription) {
        Notifications.removeNotificationSubscription(notificationListener.current);
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

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

  useEffect(() => {
    loadData();
  }, []);

  const addTask = (newTask) => {
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveData(updatedTasks);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const addDailyTask = (newTask) => {
    const updatedDailyTasks = [...dailyTasks, newTask];
    setDailyTasks(updatedDailyTasks);
    saveData(tasks, updatedDailyTasks);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const completeTask = async (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    const updatedDailyTasks = dailyTasks.map(task => 
      task.id === taskId ? { ...task, completed: true } : task
    );
    
    setTasks(updatedTasks);
    setDailyTasks(updatedDailyTasks);
    saveData(updatedTasks, updatedDailyTasks);
    
    // 완료 햅틱 피드백
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const deleteTask = async (taskId) => {
    // 알림 취소
    try {
      await Notifications.cancelScheduledNotificationAsync(taskId);
      console.log(`일정 삭제 시 알림 취소 완료: ${taskId}`);
    } catch (error) {
      console.error('알림 취소 실패:', error);
    }
    
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    saveData(updatedTasks);
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const saveDailyTasks = (newDailyTasks) => {
    setDailyTasks(newDailyTasks);
    saveData(tasks, newDailyTasks);
  };

  const allTasks = [
    ...dailyTasks.filter(task => !task.completed),
    ...tasks
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 오늘 할 일</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => setShowSettingsModal(true)}
        >
          <Text style={styles.settingsButtonText}>매일 할 일</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {allTasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>🎉 오늘 할 일이 없습니다!</Text>
            <Text style={styles.emptySubText}>새로운 일정을 추가해보세요</Text>
          </View>
        ) : (
          <FlatList
            data={allTasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TaskItem
                task={item}
                onComplete={completeTask}
                onDelete={deleteTask}
              />
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setShowAddModal(true);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#343a40',
  },
  settingsButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#6c757d',
    borderRadius: 20,
  },
  settingsButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  taskItem: {
    marginBottom: 15,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  taskIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 15,
  },
  taskTextContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343a40',
    marginBottom: 4,
  },
  taskType: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },
  taskTime: {
    fontSize: 12,
    color: '#fd7e14',
    marginBottom: 2,
  },
  taskHint: {
    fontSize: 10,
    color: '#adb5bd',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#adb5bd',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '300',
  },
  
  // 액션 모달 스타일
  actionModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionModal: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  actionModalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 20,
    textAlign: 'center',
  },
  actionButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: '#28a745',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // 모달 스타일
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 25,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    minHeight: 50,
    textAlignVertical: 'top',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginBottom: 10,
  },
  optionSelected: {
    backgroundColor: '#e7f3ff',
    borderColor: '#007bff',
  },
  optionText: {
    fontSize: 16,
    color: '#6c757d',
  },
  optionTextSelected: {
    color: '#007bff',
    fontWeight: '600',
  },
  timeButton: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 20,
  },
  timeButtonText: {
    fontSize: 16,
    color: '#495057',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButtonModal: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 10,
    backgroundColor: '#6c757d',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonTextModal: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 10,
    backgroundColor: '#28a745',
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // 설정 모달 스타일
  settingsContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 15 : 15,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fd7e14',
    borderRadius: 15,
    marginRight: 10,
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#343a40',
  },
  saveButton: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '600',
  },
  addDailyTaskContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#ffffff',
    marginBottom: 10,
  },
  dailyTaskInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 10,
  },
  addDailyButton: {
    width: 50,
    height: 50,
    backgroundColor: '#28a745',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addDailyButtonText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '300',
  },
  addWithNotificationContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  addWithNotificationButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  addWithNotificationText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  dailyTaskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  dailyTaskInfo: {
    flex: 1,
  },
  dailyTaskTitle: {
    fontSize: 16,
    color: '#343a40',
  },
  dailyTaskTime: {
    fontSize: 12,
    color: '#fd7e14',
    marginTop: 2,
  },
  removeDailyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#dc3545',
    borderRadius: 6,
  },
    removeDailyButtonText: {
      color: '#ffffff',
      fontSize: 12,
      fontWeight: '500',
    },
  });