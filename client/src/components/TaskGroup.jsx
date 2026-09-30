import { useState } from "react";
import TaskItem  from "./TaskItem/TaskItem";
import "./TaskGroup.css";

function TaskGroup({title, icon, tasks, onDeleteTask }){
    const [isOpen, setIsOpen] = useState(true);

    function handleToggle(){
        setIsOpen(!isOpen);
    }
    return (
        <div className="task-group">
            <div className="task-group-header" onClick={handleToggle}>
                <span className="task-group-icon">{icon}</span>
                <span className="task-group-title">{title} ({tasks.length})</span>
                <span className={`task-group-chevron ${isOpen ? "open" : "closed"}`}></span>
            </div>
            {isOpen && (
                <div className="task-group-body">
                    {tasks.map((task) => (
                        <TaskItem
                            key={task.ide}
                            task={task}
                            onDeleteTask={onDeleteTask}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}



export default TaskGroup;