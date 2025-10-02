// components/TaskItem.js
import React, { useState, useRef } from 'react';
import { View, Text, Pressable, Animated, PanResponder, Dimensions, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import styles from '../styles/TaskItemStyles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.4;

const TaskItem = ({ task, onComplete, onDelete, onReorder, index, totalTasks }) => {
  const [isLongPressed, setIsLongPressed] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // 스와이프로 삭제
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        // 0.5초 이상 꾹 누르면 재정렬 모드
        const timer = setTimeout(() => {
          setIsLongPressed(true);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }, 500);
        translateX.addListener(({ value }) => {
          if (value !== 0) clearTimeout(timer);
        });
        translateY.addListener(({ value }) => {
          if (value !== 0) clearTimeout(timer);
        });
      },
      onPanResponderMove: (_, gestureState) => {
        if (isLongPressed) {
          // 재정렬 모드: 위아래로만 이동
          translateY.setValue(gestureState.dy);
        } else {
          // 삭제 모드: 좌우로만 이동
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (isLongPressed) {
          // 재정렬 처리
          const moveDistance = gestureState.dy;
          const itemHeight = 80; // 대략적인 아이템 높이
          const moveCount = Math.round(moveDistance / itemHeight);
          
          if (moveCount !== 0) {
            const newIndex = index + moveCount;
            if (newIndex >= 0 && newIndex < totalTasks) {
              onReorder(index, newIndex);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
          }
          
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          setIsLongPressed(false);
        } else {
          // 삭제 처리
          if (Math.abs(gestureState.dx) > SWIPE_THRESHOLD) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Animated.parallel([
              Animated.timing(translateX, {
                toValue: gestureState.dx > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }),
            ]).start(() => {
              onDelete(task.id);
            });
          } else {
            Animated.spring(translateX, {
              toValue: 0,
              friction: 5,
              useNativeDriver: true,
            }).start();
          }
        }
      },
    })
  ).current;

  const handleTap = () => {
    if (!isLongPressed) {
      Alert.alert(
        '일정 완료',
        `"${task.title}"을(를) 완료하시겠습니까?`,
        [
          {
            text: '취소',
            style: 'cancel',
          },
          {
            text: '완료',
            onPress: () => {
              onComplete(task.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            },
          },
        ]
      );
    }
  };

  return (
    <Animated.View
      style={[
        styles.taskItem,
        {
          transform: [
            { translateX },
            { translateY },
          ],
          opacity,
          zIndex: isLongPressed ? 1000 : 1,
          elevation: isLongPressed ? 10 : 2,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <Pressable
        onPress={handleTap}
        style={[
          styles.taskContent,
          { backgroundColor: task.isDaily ? '#E3F2FD' : '#E8F5E8' },
          isLongPressed && styles.taskContentDragging,
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
            {isLongPressed ? '↕️ 위아래로 이동' : '👆 탭: 완료 | ← →: 삭제 | 꾹 누르기: 순서 변경'}
          </Text>
        </View>
      </Pressable>
      
      {/* 삭제 배경 표시 */}
      <Animated.View
        style={[
          styles.deleteBackground,
          {
            opacity: translateX.interpolate({
              inputRange: [-SCREEN_WIDTH, -SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD, SCREEN_WIDTH],
              outputRange: [1, 0.7, 0, 0.7, 1],
            }),
          },
        ]}
      >
        <Text style={styles.deleteText}>🗑️ 삭제</Text>
      </Animated.View>
    </Animated.View>
  );
};

export default TaskItem;