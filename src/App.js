import React, { useEffect, useState, useCallback  } from "react";
import axios from "axios";
import TodoList from "./components/TodoList";
import { Input, Button } from "antd";
import { v4 as uuidv4 } from "uuid";
import Todo from "./components/Todo";
function App() {
  const [todoList, setTodoList] = useState([]);
  const [textInput, setTextInput] = useState("");

  useEffect(() => {

    axios
      .get("http://localhost:5000/api/todos")
      .then((res) => setTodoList(res.data))
      .catch((error) => console.error("Lỗi khi lấy danh sách todos:", error));
  }, []);
  
  const addTodo = () => {
    axios.post("http://localhost:5000/api/todos", { title: textInput, status: 0 }).then((res) => {
      setTodoList([...todoList, { id: res.data.id, title: textInput, status: 0 }]);
      setTextInput("");
    });
  };
  

  const toggleStatus = (id, newStatus) => {
    setTodoList(todoList.map(todo => todo.id === id ? { ...todo, status: newStatus } : todo));
  };
  
  
  const onTextInputChange = useCallback((e) => {
    setTextInput(e.target.value);
  }, []);

  const onAddBtnClick = useCallback(
    (e) => {
      setTodoList([
        { id: uuidv4(), name: textInput, isComplete: false },
        ...todoList,
      ]);
      setTextInput("");
    },
    [textInput, todoList]
  );
  const onEnter = (e) => {
    if (e.key === "Enter" && textInput) {
      addTodo();
    }
  };
  const onCheckBtn = useCallback((id) => {
    setTodoList((prevState) =>
      prevState.map((todo) =>
        todo.id === id ? { ...todo, isComplete: true } : todo
      )
    );
  }, []);
  return (
    <div>
      <h2> Danh sách việc cần làm </h2>
      <Input.Group compact>
        <Input
          name="add"
          placeholder="Nhập việc cần làm"
          style={{ width: "calc(100% - 100px)" }}
          value={textInput}
          onChange={onTextInputChange}
          onKeyDown={onEnter}
        />
        <Button type="primary" disabled={!textInput} onClick={addTodo}>
          Submit
        </Button>
      </Input.Group>
      <TodoList todoList={todoList} toggleStatus={toggleStatus} />
    </div>
  );
}

export default App;
