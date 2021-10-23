import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
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
      <TextInput label={'New Todo'} style={{ borderWidth: 1, marginHorizontal: 10, borderColor: '#009387', borderRadius: 5 }}
        placeholder='Write a text' value={todo} onChangeText={setTodo} />
      <TouchableOpacity
        onPress={() => addTodo()}
        style={[
          styles.signIn,
          {
            backgroundColor: '#009387',
            borderColor: '#009387',
            borderWidth: 1,
            marginTop: 15,
          },
        ]}>
        <Text
          style={[
            styles.textSign,
            {
              color: '#fff',
            },
          ]}>
          Add ToDo
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  signIn: {
    width: '100%',
    height: 50,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  textSign: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
