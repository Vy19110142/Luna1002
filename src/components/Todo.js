  import React, { Component, useState } from "react";
  import { Button, Checkbox } from "antd";
  import "./TodoList.css";

  export default function Todo({ todo, onCheckBtn }) {
    const [checked, setChecked] = useState(false);

    const onChange = () => {
      const newChecked = !checked;
      setChecked(newChecked);
      onCheckBtn(todo.id, newChecked);
    };
    

    const onButtonClick = () => {
      const newChecked = !checked;
      setChecked(newChecked);
      onCheckBtn(todo.id); 
    };
    return (
      <div className="button-container">
        <Button onClick={onButtonClick} className={checked ? "completed" : ""}>
          {todo.name}
          <Checkbox
            className="checkbox"
            onChange={onChange}
            checked={checked} 
          ></Checkbox>
        </Button>
      </div>
    );
  }
