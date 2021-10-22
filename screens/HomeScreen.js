import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, Button, StyleSheet, StatusBar } from 'react-native';
import { useTheme } from '@react-navigation/native';

import firestore from '@react-native-firebase/firestore';
import { List } from 'react-native-paper';

function Todo({ id, title, complete }) {
  async function toggleComplete() {
    await firestore()
      .collection('todos')
      .doc(id)
      .update({
        complete: !complete,
      });
  }

  async function deleteItem() {
    await firestore()
      .collection('todos')
      .doc(id)
      .delete()
  }

  return (
    <List.Item
      onPress={() => toggleComplete()}
      right={props => (<Text>{title}</Text>)}
      left={props => (
        <List.Icon {...props} icon={complete ? 'check' : 'cancel'} />
      )}
    />
  );
}

const HomeScreen = ({ navigation }) => {
  const { colors } = useTheme();

  const theme = useTheme();
  const ref = firestore().collection('todos');
  const [todo, setTodo] = useState('');
  const [loading, setLoading] = useState(true);
  const [todos, setTodos] = useState([]);

  async function addTodo() {
    await ref.add({
      title: todo,
      complete: false,
    });
    setTodo('');
  }

  useEffect(() => {
    return ref.onSnapshot(querySnapshot => {
      const list = [];
      querySnapshot.forEach(doc => {
        const { title, complete } = doc.data();
        list.push({
          id: doc.id,
          title,
          complete,
        });
      });

      setTodos(list);

      if (loading) {
        setLoading(false);
      }
    });
  }, []);

  if (loading) {
    return null; // or a spinner
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      <FlatList
        style={{ flex: 1 }}
        data={todos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Todo {...item} />}
      />
      <TextInput label={'New Todo'} style={{ borderWidth: 1, }} value={todo} onChangeText={setTodo} />
      <Button title="Add TODO" onPress={() => addTodo()}>Add TODO</Button>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
