import React, { useState, useEffect } from "react";
import { Button, Checkbox, message } from "antd";
import axios from "axios";
import "./TodoList.css";

export default function Todo({ todo, onStatusChange }) {
  const [checked, setChecked] = useState(todo.status === 1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setChecked(todo.status === 1);
  }, [todo.status]); // Lắng nghe thay đổi từ props để cập nhật UI

  const updateStatus = async (id, newStatus) => {
    setChecked(newStatus === 1); // Cập nhật UI ngay lập tức (Optimistic UI)
    setLoading(true);

    try {
      const response = await axios.put(`http://localhost:5000/api/todos/${id}`, {
        status: newStatus,
      });

      if (response.status === 200) {
        if (onStatusChange) {
          onStatusChange(id, newStatus); // Gọi hàm cập nhật danh sách từ cha
        }
      } else {
        throw new Error("Cập nhật thất bại!");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      message.error("Không thể cập nhật trạng thái!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="button-container">
      <Button
        onClick={() => updateStatus(todo.id, checked ? 0 : 1)}
        className={`todo-button ${checked ? "completed" : ""}`}
        loading={loading}
      >
        {todo.title}
      </Button>
      <Checkbox
        className="checkbox"
        onChange={() => updateStatus(todo.id, checked ? 0 : 1)}
        checked={checked}
      />
    </div>
  );
}
