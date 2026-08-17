/**
 * 卡片编辑组件
 * 支持编辑议程、投票、笔记、问答、任务等不同类型的卡片
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AgendaRenderer } from './AgendaRenderer';
import { PollRenderer } from './PollRenderer';
import { NoteRenderer } from './NoteRenderer';
import { QARenderer } from './QARenderer';
import { TaskListRenderer } from './TaskListRenderer';

interface CardEditProps {
  visible: boolean;
  card: any;
  onClose: () => void;
  onSave: (updatedCard: any) => void;
}

export const CardEdit: React.FC<CardEditProps> = ({
  visible,
  card,
  onClose,
  onSave,
}) => {
  const [editedCard, setEditedCard] = useState(card);

  useEffect(() => {
    if (card) {
      setEditedCard(card);
    }
  }, [card]);

  if (!card) return null;

  const handleSave = () => {
    onSave(editedCard);
    onClose();
  };

  const renderEditor = () => {
    switch (card.type) {
      case 'agenda':
        return <AgendaEditor data={editedCard.data} onChange={(data) => setEditedCard({ ...editedCard, data })} />;
      case 'poll':
        return <PollEditor data={editedCard.data} onChange={(data) => setEditedCard({ ...editedCard, data })} />;
      case 'note':
        return <NoteEditor data={editedCard.data} onChange={(data) => setEditedCard({ ...editedCard, data })} />;
      case 'qa':
        return <QAEditor data={editedCard.data} onChange={(data) => setEditedCard({ ...editedCard, data })} />;
      case 'task':
        return <TaskEditor data={editedCard.data} onChange={(data) => setEditedCard({ ...editedCard, data })} />;
      default:
        return <Text>不支持编辑此类型卡片</Text>;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}>
          <View style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '90%',
          }}>
            {/* 头部 */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 20,
              borderBottomWidth: 1,
              borderBottomColor: '#e5e7eb',
            }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>
                编辑卡片
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* 内容 */}
            <ScrollView style={{ padding: 20, maxHeight: '70%' }}>
              {renderEditor()}
            </ScrollView>

            {/* 底部按钮 */}
            <View style={{
              flexDirection: 'row',
              padding: 20,
              borderTopWidth: 1,
              borderTopColor: '#e5e7eb',
              gap: 12,
            }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: '#f3f4f6',
                  alignItems: 'center',
                }}
                onPress={onClose}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#6b7280' }}>
                  取消
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: '#007DFF',
                  alignItems: 'center',
                }}
                onPress={handleSave}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
                  保存
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// 议程编辑器
const AgendaEditor: React.FC<{ data: any; onChange: (data: any) => void }> = ({ data, onChange }) => {
  const [items, setItems] = useState(data.items || []);

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
    onChange({ ...data, items: newItems });
  };

  const addItem = () => {
    const newItems = [...items, { title: '', time: '', done: false }];
    setItems(newItems);
    onChange({ ...data, items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_: any, i: number) => i !== index);
    setItems(newItems);
    onChange({ ...data, items: newItems });
  };

  return (
    <View>
      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 16, color: '#111827' }}>
        议程列表
      </Text>
      {items.map((item: any, index: number) => (
        <View key={index} style={{ marginBottom: 16, padding: 16, backgroundColor: '#f9fafb', borderRadius: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#6b7280' }}>
              议程 {index + 1}
            </Text>
            <TouchableOpacity onPress={() => removeItem(index)}>
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#e5e7eb',
              borderRadius: 8,
              padding: 12,
              marginBottom: 8,
              fontSize: 14,
            }}
            placeholder="议程标题"
            value={item.title}
            onChangeText={(text) => updateItem(index, 'title', text)}
          />
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#e5e7eb',
              borderRadius: 8,
              padding: 12,
              fontSize: 14,
            }}
            placeholder="时间（如：09:30 - 10:00）"
            value={item.time}
            onChangeText={(text) => updateItem(index, 'time', text)}
          />
        </View>
      ))}
      <TouchableOpacity
        style={{
          paddingVertical: 12,
          borderRadius: 8,
          backgroundColor: '#007DFF',
          alignItems: 'center',
        }}
        onPress={addItem}
      >
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>
          + 添加议程
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// 投票编辑器
const PollEditor: React.FC<{ data: any; onChange: (data: any) => void }> = ({ data, onChange }) => {
  const [options, setOptions] = useState(data.options || []);

  const updateOption = (index: number, field: string, value: any) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
    onChange({ ...data, options: newOptions });
  };

  const addOption = () => {
    const newOptions = [...options, { id: Date.now(), text: '', votes: 0 }];
    setOptions(newOptions);
    onChange({ ...data, options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_: any, i: number) => i !== index);
    setOptions(newOptions);
    onChange({ ...data, options: newOptions });
  };

  return (
    <View>
      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 16, color: '#111827' }}>
        投票选项
      </Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#e5e7eb',
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          fontSize: 14,
        }}
        placeholder="投票标题"
        value={data.title}
        onChangeText={(text) => onChange({ ...data, title: text })}
      />
      {options.map((option: any, index: number) => (
        <View key={option.id} style={{ flexDirection: 'row', marginBottom: 12, gap: 8 }}>
          <TextInput
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: '#e5e7eb',
              borderRadius: 8,
              padding: 12,
              fontSize: 14,
            }}
            placeholder="选项文本"
            value={option.text}
            onChangeText={(text) => updateOption(index, 'text', text)}
          />
          <TouchableOpacity
            style={{
              padding: 12,
              backgroundColor: '#fee2e2',
              borderRadius: 8,
            }}
            onPress={() => removeOption(index)}
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity
        style={{
          paddingVertical: 12,
          borderRadius: 8,
          backgroundColor: '#007DFF',
          alignItems: 'center',
        }}
        onPress={addOption}
      >
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>
          + 添加选项
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// 笔记编辑器
const NoteEditor: React.FC<{ data: any; onChange: (data: any) => void }> = ({ data, onChange }) => {
  return (
    <View>
      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 16, color: '#111827' }}>
        笔记内容
      </Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#e5e7eb',
          borderRadius: 8,
          padding: 12,
          fontSize: 14,
          minHeight: 200,
          textAlignVertical: 'top',
        }}
        placeholder="笔记内容"
        value={data.content}
        onChangeText={(text) => onChange({ ...data, content: text })}
        multiline
      />
    </View>
  );
};

// 问答编辑器
const QAEditor: React.FC<{ data: any; onChange: (data: any) => void }> = ({ data, onChange }) => {
  const [items, setItems] = useState(data.items || []);

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
    onChange({ ...data, items: newItems });
  };

  const addItem = () => {
    const newItems = [...items, { question: '', answer: '' }];
    setItems(newItems);
    onChange({ ...data, items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_: any, i: number) => i !== index);
    setItems(newItems);
    onChange({ ...data, items: newItems });
  };

  return (
    <View>
      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 16, color: '#111827' }}>
        问答列表
      </Text>
      {items.map((item: any, index: number) => (
        <View key={index} style={{ marginBottom: 16, padding: 16, backgroundColor: '#f9fafb', borderRadius: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#6b7280' }}>
              问答 {index + 1}
            </Text>
            <TouchableOpacity onPress={() => removeItem(index)}>
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#e5e7eb',
              borderRadius: 8,
              padding: 12,
              marginBottom: 8,
              fontSize: 14,
            }}
            placeholder="问题"
            value={item.question}
            onChangeText={(text) => updateItem(index, 'question', text)}
          />
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#e5e7eb',
              borderRadius: 8,
              padding: 12,
              fontSize: 14,
              minHeight: 100,
              textAlignVertical: 'top',
            }}
            placeholder="答案"
            value={item.answer}
            onChangeText={(text) => updateItem(index, 'answer', text)}
            multiline
          />
        </View>
      ))}
      <TouchableOpacity
        style={{
          paddingVertical: 12,
          borderRadius: 8,
          backgroundColor: '#007DFF',
          alignItems: 'center',
        }}
        onPress={addItem}
      >
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>
          + 添加问答
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// 任务编辑器
const TaskEditor: React.FC<{ data: any; onChange: (data: any) => void }> = ({ data, onChange }) => {
  const [items, setItems] = useState(data.items || []);

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
    onChange({ ...data, items: newItems });
  };

  const addItem = () => {
    const newItems = [...items, { title: '', assignee: '', deadline: '', done: false }];
    setItems(newItems);
    onChange({ ...data, items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_: any, i: number) => i !== index);
    setItems(newItems);
    onChange({ ...data, items: newItems });
  };

  return (
    <View>
      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 16, color: '#111827' }}>
        任务列表
      </Text>
      {items.map((item: any, index: number) => (
        <View key={index} style={{ marginBottom: 16, padding: 16, backgroundColor: '#f9fafb', borderRadius: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#6b7280' }}>
              任务 {index + 1}
            </Text>
            <TouchableOpacity onPress={() => removeItem(index)}>
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#e5e7eb',
              borderRadius: 8,
              padding: 12,
              marginBottom: 8,
              fontSize: 14,
            }}
            placeholder="任务标题"
            value={item.title}
            onChangeText={(text) => updateItem(index, 'title', text)}
          />
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#e5e7eb',
              borderRadius: 8,
              padding: 12,
              marginBottom: 8,
              fontSize: 14,
            }}
            placeholder="负责人"
            value={item.assignee}
            onChangeText={(text) => updateItem(index, 'assignee', text)}
          />
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#e5e7eb',
              borderRadius: 8,
              padding: 12,
              fontSize: 14,
            }}
            placeholder="截止日期（如：2024-01-15）"
            value={item.deadline}
            onChangeText={(text) => updateItem(index, 'deadline', text)}
          />
        </View>
      ))}
      <TouchableOpacity
        style={{
          paddingVertical: 12,
          borderRadius: 8,
          backgroundColor: '#007DFF',
          alignItems: 'center',
        }}
        onPress={addItem}
      >
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>
          + 添加任务
        </Text>
      </TouchableOpacity>
    </View>
  );
};
