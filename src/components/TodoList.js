import React from "react";
import Todo from "./Todo";

export default function TodoList({ todoList, onCheckBtn }) {
  return (
    <>
      {todoList.map((todo) => (
        <Todo key={todo.id} todo={todo} onCheckBtn={onCheckBtn} />
      ))}
    </>
  );
}
